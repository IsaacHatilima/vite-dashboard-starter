"""Stage changes. `advance` checks the files that justify a move and refuses anything else.

Branch and PR effects that belong to a transition (the worktree, PR
comments, pushing the documentation) happen here too, so the orchestrator
never improvises them. Each move out of an agent's stage also checks that the
agent stayed in its lane: reviewers and the approver change nothing, the
builder never touches Documentation/, and the documenter touches nothing else.
"""

import re
from pathlib import Path

from . import github, learning
from .cost import usage
from .jobfiles import all_jobs, first_line, header, job_dir, now, reviewers, round_dir, section
from .project import base_branch, config, require, run
from .spec import check_skills, check_spec, doc_page, doc_status

TRANSITIONS = {
    "queued": {"intake", "rejected"},
    "intake": {"needs-info", "rejected", "spec"},
    "needs-info": {"intake", "rejected"},
    "spec": {"build", "needs-human"},
    "build": {"gate", "document"},
    "gate": {"review", "build", "document"},
    "review": {"teach", "build", "document"},
    "teach": {"build", "document"},
    "document": {"approve", "needs-human"},
    "approve": {"merging", "needs-human"},
    "merging": {"needs-human"},
    "needs-human": {"build", "spec", "rejected"},
}
TERMINAL = {"merged", "rejected"}
WAITING = {"needs-info", "needs-human"}

SHIPPED = "reviews passed"
BUILDER_BLOCKED = "not shipped, the builder is blocked"
OUT_OF_ROUNDS = "not shipped, build rounds ran out"


# ---- Worktree helpers ------------------------------------------------------


def git(job, *args, check=True):
    return run(["git", *args], cwd=job["worktree"], check=check)


def head(job):
    return git(job, "rev-parse", "HEAD").stdout.strip()


def require_clean(job):
    require(not git(job, "status", "--porcelain").stdout.strip(), "the worktree has uncommitted changes")


def require_branch(job):
    branch = git(job, "branch", "--show-current").stdout.strip()
    require(branch == job["branch"], f"the worktree is on {branch or 'a detached HEAD'}, not {job['branch']}")


def require_unchanged(job, commit, who):
    require(head(job) == commit, f"{who} changed the branch: HEAD is no longer {commit[:7]}")
    require_clean(job)


def changed_paths(job, since):
    return [p for p in git(job, "diff", "--name-only", f"{since}..HEAD").stdout.splitlines() if p]


def escalate(job, why):
    """Write decision.md for an escalation the approver didn't make."""
    (job_dir(job["id"]) / "decision.md").write_text(f"ESCALATE\n\n## Why\n{why}\n")


# ---- Fields derived from files -----------------------------------------------


def sync(job):
    d = job_dir(job["id"])
    if (d / "intake.md").exists():
        h = header(d / "intake.md")
        job["intake"] = {
            "decision": h.get("DECISION"),
            "rescoped": h.get("RESCOPED") == "yes",
            "risk": h.get("RISK"),
            "surfaces": [s.strip().lower() for s in h.get("SURFACES", "").split(",")
                         if s.strip() and s.strip().lower() != "none"],
        }
    if job["round"]:
        rd = round_dir(job)
        job["gate"] = header(rd / "checks.md").get("GATE") if (rd / "checks.md").exists() else None
        if job["agents"] and job["stage"] in {"review", "teach", "document", "approve", "merging", "merged", "needs-human"}:
            job["reviews"] = {}
            for r in reviewers(job):
                line = first_line(rd / f"review-{r}.md")
                m = re.fullmatch(r"VERDICT:\s*(PASS|CHANGES)", line or "")
                job["reviews"][r] = m.group(1) if m else ("pending" if line is None else "invalid")
    job["cost_usd"], job["tokens"] = usage(job)
    return job


# ---- Rounds and slots ------------------------------------------------------


def running(jobs):
    """Jobs holding a concurrency slot: every job not finished or waiting."""
    return [j for j in jobs if j["stage"] not in TERMINAL | WAITING | {"queued"}]


def require_slot(job_id):
    limit = config()["concurrency"]
    busy = [j["id"] for j in running(all_jobs(lock=False)) if j["id"] != job_id]
    require(len(busy) < limit, f"concurrency {limit} reached; running: {', '.join(busy)}")


def next_round(job):
    job["round"] += 1
    round_dir(job).mkdir(exist_ok=True)
    job["gate"] = None
    job["reviews"] = {}
    job["round_base"] = head(job)


def require_more_rounds(job, stage):
    """A failed round goes back to the builder, or to documentation when it was the last."""
    last = job["round"] >= job["round_limit"]
    require(last == (stage == "document"),
            f"round {job['round']} of {job['round_limit']}: go to {'document' if last else 'build'}")


def start_document(job, outcome, why=None):
    require_branch(job)
    require_clean(job)
    if outcome == SHIPPED:
        check_skills(job)
    job.update(outcome=outcome, escalation=why, doc=None, doc_base=head(job), doc_head=None)


# ---- Leaving each stage ------------------------------------------------------


def from_queued(job, stage):
    require_slot(job["id"])


def from_intake(job, stage):
    d = job_dir(job["id"])
    decision = header(d / "intake.md").get("DECISION") if (d / "intake.md").exists() else None
    want = {"needs-info": "NEEDS-INFO", "rejected": "REJECT", "spec": "ACCEPT"}[stage]
    require(decision == want, f"intake.md says DECISION: {decision}, not {want}")
    if stage == "spec":
        require(job["agents"], "route the job first: bin/route " + job["id"])
        ensure_worktree(job)


def ensure_worktree(job):
    """The job's worktree on its branch, made from origin/<base> unless an earlier try made it."""
    if Path(job["worktree"]).exists():
        return require_branch(job)
    run(["git", "fetch", "origin", base_branch()])
    Path(job["worktree"]).parent.mkdir(parents=True, exist_ok=True)
    branch_exists = run(["git", "rev-parse", "--verify", "--quiet", f"refs/heads/{job['branch']}"],
                        check=False).returncode == 0
    if branch_exists:
        run(["git", "worktree", "add", job["worktree"], job["branch"]])
    else:
        run(["git", "worktree", "add", "-b", job["branch"], job["worktree"], f"origin/{base_branch()}"])


def from_needs_info(job, stage):
    require_slot(job["id"])
    require(job.get("answer_count", 0) > job.get("answered_count", 0),
            "use `job answer` to answer the intake questions before resuming")
    job["answered_count"] = job["answer_count"]
    d = job_dir(job["id"])
    if (d / "intake.md").exists():
        k = len(list(d.glob("intake-*.md"))) + 1
        (d / "intake.md").rename(d / f"intake-{k}.md")
    job["intake"] = None


def from_spec(job, stage):
    if stage == "build":
        check_spec(job, "READY")
        next_round(job)
    else:
        check_spec(job, "BLOCKED")
        escalate(job, "The spec is blocked, so nothing was built or documented:\n\n"
                 + section(job_dir(job["id"]) / "spec.md", "Blocked"))


def from_build(job, stage):
    build = job_dir(job["id"]) / "build.md"
    status = first_line(build)
    if stage == "document":
        require(status == "STATUS: BLOCKED", f"build.md starts with {status!r}, not STATUS: BLOCKED")
        why = "The builder is blocked:\n\n" + (section(build, "Blocked") or "(no Blocked section)")
        return start_document(job, BUILDER_BLOCKED, why)
    require(status == "STATUS: READY", f"build.md starts with {status!r}, not STATUS: READY")
    require_branch(job)
    require_clean(job)
    base = f"origin/{base_branch()}"
    require(int(git(job, "rev-list", "--count", f"{base}..HEAD").stdout) > 0,
            f"{job['branch']} has no commits on top of {base}")
    docs = [p for p in changed_paths(job, job["round_base"]) if p.startswith("Documentation/")]
    require(not docs, f"the builder changed Documentation/, which the documenter owns: {', '.join(docs)}")
    knowledge = (job.get("knowledge_root") or learning.knowledge_relative()) + "/"
    lessons = [p for p in changed_paths(job, job["round_base"]) if p.startswith(knowledge)]
    require(not lessons, f"the builder changed knowledge files, which the teacher owns: {', '.join(lessons)}")
    git(job, "fetch", "origin", job["branch"], check=False)
    res = git(job, "rev-parse", f"origin/{job['branch']}", check=False)
    remote = res.stdout.strip() if res.returncode == 0 else ""
    local = head(job)
    require(local == remote, f"{job['branch']} isn't pushed: local {local[:7]}, origin {remote[:7] or 'missing'}")
    if not job["pr"]:
        prs = github.gh_json("pr", "list", "--head", job["branch"], "--state", "open", "--json", "number,url")
        require(len(prs) == 1, f"expected one open PR from {job['branch']}, found {len(prs)}")
        job["pr"], job["pr_url"] = prs[0]["number"], prs[0]["url"]


def from_gate(job, stage):
    checks = round_dir(job) / "checks.md"
    require(checks.exists(), f"run the gate first: bin/gate {job['id']}")
    h = header(checks)
    require(h.get("COMMIT") == head(job), "checks.md was written for another commit; run the gate again")
    if stage == "review":
        require(h.get("GATE") == "PASS", "the gate didn't pass")
        check_skills(job)
        job["reviews"] = {r: "pending" for r in reviewers(job)}
        return
    require(h.get("GATE") == "FAIL", "the gate passed")
    require_more_rounds(job, stage)
    if stage == "build":
        check_skills(job)
        return next_round(job)
    n = job["round"]
    start_document(job, OUT_OF_ROUNDS,
                   f"The gate failed in round {n}, the last allowed round. See round-{n}/checks.md.")


def from_review(job, stage):
    rd = round_dir(job)
    require(header(rd / "checks.md").get("GATE") == "PASS", "the reviewed gate receipt must remain PASS")
    missing = [r for r in reviewers(job) if not (rd / f"review-{r}.md").exists()]
    require(not missing, f"round {job['round']} is missing reviews from: {', '.join(missing)}")
    bad = [r for r, v in job["reviews"].items() if v not in {"PASS", "CHANGES"}]
    require(not bad, f"the first line of review-{bad[0]}.md isn't a verdict" if bad else "")
    require_unchanged(job, header(rd / "checks.md").get("COMMIT", ""), "a reviewer")
    changes = [r for r, v in job["reviews"].items() if v == "CHANGES"]
    pending = learning.resolutions(job)
    if pending:
        require(stage == "teach", "confirmed fixes need the teacher first: advance to teach")
        next_stage = "build" if changes and job["round"] < job["round_limit"] else "document"
        learning.prepare(job, pending, next_stage, changes, head(job))
        return
    require(stage != "teach", "no new confirmed resolutions need teaching")
    finish_review(job, stage, changes)


def finish_review(job, stage, changes):
    if stage == "document" and not changes:
        return start_document(job, SHIPPED)
    require(changes, "every review passed: go to document")
    require_more_rounds(job, stage)
    if stage == "build":
        check_skills(job)
        return next_round(job)
    start_document(job, OUT_OF_ROUNDS,
                   f"Build rounds ran out. Outstanding CHANGES in round-{job['round']}/ from: {', '.join(changes)}.")


def from_teach(job, stage):
    teaching = job.get("teaching")
    require(teaching and teaching["round"] == job["round"], "the teaching batch is missing or stale")
    require(stage == teaching["next_stage"], f"after teaching, go to {teaching['next_stage']}")
    require_branch(job)
    require_clean(job)
    teacher_head = learning.verify(job)
    check_skills(job)
    finish_review(job, stage, teaching["changes"])
    teaching.update(head=teacher_head, completed=now())
    job["taught_findings"] = sorted(set(job.get("taught_findings", []))
                                   | {r["finding"] for r in teaching["resolutions"]})


def from_document(job, stage):
    shipped = job.get("outcome") == SHIPPED
    require(job.get("outcome"), "the job has no documentation outcome")
    require(shipped == (stage == "approve"),
            f"the outcome is {job['outcome']!r}: go to {'approve' if shipped else 'needs-human'}")
    verify_documentation(job)
    if job["pr"]:
        git(job, "push", "origin", job["branch"])
    job["doc_head"] = head(job)
    if shipped:
        check_skills(job)
    else:
        escalate(job, job["escalation"])


def verify_documentation(job):
    """The documenter committed its page and the index, and nothing outside Documentation/."""
    require_branch(job)
    require_clean(job)
    changed = changed_paths(job, job["doc_base"])
    require(changed, "the documenter made no commit")
    outside = [p for p in changed if not p.startswith("Documentation/")]
    require(not outside, f"the documenter changed files outside Documentation/: {', '.join(outside)}")
    page = doc_page((job_dir(job["id"]) / "spec.md").read_text())
    status = doc_status(Path(job["worktree"]) / page)
    require(status, f"{page} doesn't start with `# <Feature> (Shipped)` or `# <Feature> (Not shipped)`")
    require(job["outcome"] == SHIPPED or status == "Not shipped",
            f"{page} says {status}, but the job wasn't shipped ({job['outcome']})")
    job["doc"] = status


def from_approve(job, stage):
    require_unchanged(job, job["doc_head"], "the approver")
    want = "APPROVE" if stage == "merging" else "ESCALATE"
    line = first_line(job_dir(job["id"]) / "decision.md")
    require(line == want, f"decision.md starts with {line!r}, not {want}")


def from_merging(job, stage):
    line = first_line(job_dir(job["id"]) / "decision.md")
    require(line == "ESCALATE", "use `job merge` to move a merging job")


def from_needs_human(job, stage):
    require_slot(job["id"])
    d = job_dir(job["id"])
    feedback = sorted(d.glob("feedback-*.md"))
    decision = d / "decision.md"
    fresh = feedback and (not decision.exists() or feedback[-1].stat().st_mtime > decision.stat().st_mtime)
    require(fresh, "use `job feedback` to send a job back to work")
    blocked_at_spec = job["round"] == 0
    require(blocked_at_spec == (stage == "spec"),
            "a job blocked at its spec goes back to spec" if blocked_at_spec else "a built job goes back to build")
    job["round_limit"] = job["round"] + config()["max_rounds"]
    if stage == "build":
        next_round(job)


LEAVE = {
    "queued": from_queued, "intake": from_intake, "needs-info": from_needs_info, "spec": from_spec,
    "build": from_build, "gate": from_gate, "review": from_review, "teach": from_teach,
    "document": from_document, "approve": from_approve, "merging": from_merging,
    "needs-human": from_needs_human,
}


# ---- Entering a stage ------------------------------------------------------


def to_merged(job, old):
    require(job["pr"] and github.pr_state(job) == "MERGED", "the PR isn't merged")


def to_rejected_from_waiting(job, old):
    d = job_dir(job["id"])
    require((d / "rejection.md").exists(), "use `job reject` to reject a waiting job")
    if job["pr"]:
        github.gh("pr", "close", str(job["pr"]))
        run(["git", "push", "origin", "--delete", job["branch"]], check=False)


def announce_needs_human(job):
    decision = (job_dir(job["id"]) / "decision.md").read_text().split("\n", 1)[1].strip()
    body = f"### Factory: needs a human\n\n{decision}"
    if job.get("doc"):
        body += f"\n\nDocumentation on the branch: {job['doc']}."
    if job["pr"]:
        if github.pr_is_draft(job):
            github.gh("pr", "ready", str(job["pr"]))
        github.comment("pr", job["pr"], body)


def advance(job, stage):
    old = job["stage"]
    legal = stage in TRANSITIONS.get(old, set()) or (stage == "merged" and old not in TERMINAL)
    require(legal, f"{job['id']}: {old} → {stage} is not a legal transition")
    if stage == "merged":
        to_merged(job, old)
    elif stage == "rejected" and old in WAITING | {"queued"}:
        to_rejected_from_waiting(job, old)
    else:
        LEAVE[old](job, stage)
    if stage == "needs-human":
        announce_needs_human(job)
    if stage in TERMINAL and Path(job["worktree"]).exists():
        run(["git", "worktree", "remove", "--force", job["worktree"]])
        run(["git", "branch", "-D", job["branch"]], check=False)
    job["stage"] = stage
    job["ended"] = now() if stage in TERMINAL | WAITING else None
    return job
