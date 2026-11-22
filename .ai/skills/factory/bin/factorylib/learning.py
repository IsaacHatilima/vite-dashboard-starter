"""Evidence for teaching, and the teacher's narrow commit/report boundary."""

import hashlib
import json
import re
from datetime import date
from pathlib import Path, PurePosixPath

from .jobfiles import first_line, header, job_dir, reviewers, round_dir, text_section
from .project import Refused, config, require, run

LESSON_SECTIONS = ("Use when", "Problem", "Cause", "Solution", "Prevention", "Evidence", "Limits")


def git(job, *args):
    return run(["git", *args], cwd=job["worktree"]).stdout.strip()


def knowledge_relative():
    value = config().get("knowledge", {}).get("root", "Knowledge")
    require(isinstance(value, str) and value and not value.startswith("/"),
            "knowledge.root must be a relative project directory")
    parts = value.split("/")
    require(all(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", p) for p in parts)
            and parts[0] not in {"Documentation", "factory"},
            "knowledge.root must be a normal project directory outside feature docs and Factory state")
    return value


def knowledge_root(job):
    relative = job.get("knowledge_root") or knowledge_relative()
    root = Path(job["worktree"])
    for part in PurePosixPath(relative).parts:
        root /= part
        require(not root.is_symlink(), "the knowledge root must not contain symlinks")
    return root


def learning_skill(job):
    for root in job["skills"]["roots"]:
        for relative in ("knowledge-learning/SKILL.md", "knowledge/learning/SKILL.md"):
            candidate = Path(root) / relative
            if candidate.is_file():
                return candidate
    return None


def resolutions(job):
    """New reviewer-confirmed closures, never inferred from a verdict or omission."""
    current = header(round_dir(job) / "checks.md")["COMMIT"]
    processed = set(job.get("taught_findings", []))
    pending, seen = [], set()
    for lens in reviewers(job):
        path = round_dir(job) / f"resolutions-{lens}.json"
        if not path.exists():
            continue
        require(not path.is_symlink(), f"{path.name} must not be a symlink")
        try:
            entries = json.loads(path.read_text())
        except (ValueError, OSError) as error:
            raise Refused(f"invalid {path.name}: {error}") from error
        require(isinstance(entries, list), f"{path.name} must contain an array")
        for entry in entries:
            require(isinstance(entry, dict) and set(entry) == {"finding", "outcome", "commit", "evidence", "limits"},
                    f"{path.name}: expected finding, outcome, commit, evidence and limits")
            require(all(isinstance(value, str) and value.strip() for value in entry.values()),
                    f"{path.name}: resolution fields must be nonblank strings")
            finding = entry["finding"]
            require(isinstance(finding, str), f"{path.name}: finding must be an identifier")
            match = re.fullmatch(rf"{re.escape(lens)}-r([1-9][0-9]*)-([1-9][0-9]*)", finding)
            require(match and int(match[1]) < job["round"],
                    f"{path.name}: {finding} must name this reviewer's earlier finding")
            require(finding not in seen, f"duplicate resolution for {finding}")
            seen.add(finding)
            require(entry["outcome"] in {"fixed", "dismissed"}, f"{finding}: outcome must be fixed or dismissed")
            require(entry["commit"] == current, f"{finding}: resolution is for another reviewed commit")
            require(all(isinstance(entry[k], str) and entry[k].strip() for k in ("evidence", "limits")),
                    f"{finding}: evidence and limits are required")
            original = round_dir(job, int(match[1])) / f"review-{lens}.md"
            require(first_line(original) == "VERDICT: CHANGES", f"{finding}: original CHANGES review is missing")
            original_gate = original.parent / "checks.md"
            require(original_gate.is_file() and header(original_gate).get("GATE") == "PASS",
                    f"{finding}: the original review has no passing gate evidence")
            findings = text_section(original.read_text(), "Findings") or ""
            require(re.search(rf"(?m)^\s*[0-9]+\.\s+\[{re.escape(finding)}\]\s+\S", findings),
                    f"{finding}: original finding is missing from its review")
            if finding not in processed:
                pending.append({**entry, "reviewer": lens})
    return pending


def artifacts(job):
    """Freeze other roles' evidence while allowing just the current teach.md."""
    root = job_dir(job["id"])
    excluded = {"job.json", ".lock", f"round-{job['round']}/teach.md"}
    result = {}
    for path in root.rglob("*"):
        name = path.relative_to(root).as_posix()
        if name in excluded or not (path.is_file() or path.is_symlink()):
            continue
        require(not path.is_symlink(), f"job artifact {name} must not be a symlink while teaching")
        result[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result


def prepare(job, pending, next_stage, changes, reviewed_commit):
    skill = learning_skill(job)
    require(skill, "knowledge/learning is required for the teacher; install the core skills")
    job.setdefault("knowledge_root", knowledge_relative())
    root = knowledge_root(job)
    job["teaching"] = {
        "round": job["round"], "reviewed_commit": reviewed_commit,
        "resolutions": pending, "next_stage": next_stage, "changes": changes,
        "knowledge_root": str(root), "learning_skill": str(skill), "artifacts": artifacts(job),
    }


def path_in_root(job, value):
    root = knowledge_root(job)
    relative = PurePosixPath(value)
    require(not relative.is_absolute() and ".." not in relative.parts and relative.suffix == ".md",
            f"{value}: expected an ordinary Markdown knowledge path")
    path = Path(job["worktree"]) / relative
    require(root in path.parents, f"{value}: the teacher changed a file outside the knowledge root")
    cursor = path
    while cursor != Path(job["worktree"]):
        require(not cursor.is_symlink(), f"{value}: knowledge files must not contain symlinks")
        cursor = cursor.parent
    require(path.is_file(), f"{value}: removing knowledge files is not supported; supersede the lesson instead")
    mode = git(job, "ls-tree", "HEAD", "--", value).split(" ", 1)[0]
    require(mode == "100644", f"{value}: knowledge changes must be ordinary non-executable Markdown files")
    return path


def validate_index(job):
    root = knowledge_root(job)
    index = root / "index.md"
    require(index.is_file() and not index.is_symlink(), "the teacher must maintain the knowledge index")
    text = index.read_text()
    require(re.search(r"(?m)^## \S", text) and "| Lesson | Use when | Tags |" in text,
            "the knowledge index needs area headings and Lesson / Use when / Tags tables")
    linked = set()
    for target in re.findall(r"\]\(([^)\s]+)\)", text):
        if target.startswith(("https://", "http://", "#")):
            continue
        relative = PurePosixPath(target)
        require(not relative.is_absolute() and ".." not in relative.parts and relative.suffix == ".md",
                f"invalid knowledge index link {target}")
        path = index.parent / relative
        cursor = path
        while cursor != root:
            require(not cursor.is_symlink(), f"knowledge index link {target} contains a symlink")
            cursor = cursor.parent
        require(path.is_file(), f"knowledge index link {target} is missing")
        linked.add(path)
    return linked


def preserve_index(job, reviewed, linked, superseded):
    root = knowledge_root(job)
    name = (root / "index.md").relative_to(job["worktree"]).as_posix()
    previous = run(["git", "show", f"{reviewed}:{name}"], cwd=job["worktree"], check=False)
    if previous.returncode != 0:
        return
    for target in re.findall(r"\]\(([^)\s]+)\)", previous.stdout):
        if target.startswith(("https://", "http://", "#")):
            continue
        old = root / target
        require(old in linked or old in superseded,
                f"the teacher dropped existing knowledge index entry {target} without superseding it")


def replacement_link(path, text, linked):
    """A superseded lesson keeps a navigable link to an active replacement."""
    return any(not target.startswith(("http://", "https://", "#"))
               and (path.parent / target).resolve() in {p.resolve() for p in linked}
               for target in re.findall(r"\]\(([^)\s]+)\)", text))


def verify(job):
    teaching = job["teaching"]
    reviewed = teaching["reviewed_commit"]
    report = round_dir(job) / "teach.md"
    require(report.is_file() and not report.is_symlink(), "the teacher must write round-N/teach.md")
    fields = header(report)
    status = fields.get("STATUS")
    require(status in {"RECORDED", "NO_CHANGE"}, "teach.md needs STATUS: RECORDED or NO_CHANGE")
    require(fields.get("COMMIT") == reviewed, "teach.md is for another reviewed commit")
    findings = [x.strip() for x in fields.get("FINDINGS", "").split(",") if x.strip()]
    expected = {r["finding"] for r in teaching["resolutions"]}
    require(len(findings) == len(expected) and set(findings) == expected,
            "teach.md must account for every confirmed finding in the batch exactly once")
    require(text_section(report.read_text(), "Summary"), "teach.md needs a Summary explaining the result")
    require(artifacts(job) == teaching["artifacts"], "the teacher changed another role's job artifacts")
    require(str(knowledge_root(job)) == teaching["knowledge_root"], "the knowledge root changed while teaching")
    current = git(job, "rev-parse", "HEAD")
    declared = fields.get("LESSONS", "")
    lessons = [] if declared.lower() == "none" else [x.strip() for x in declared.split(",") if x.strip()]
    if status == "NO_CHANGE":
        require(current == reviewed and not lessons, "a NO_CHANGE teacher must leave the reviewed commit unchanged")
        require(text_section(report.read_text(), "Reasons"), "NO_CHANGE needs Reasons for recording no lesson")
        return current
    require(lessons and len(lessons) == len(set(lessons)), "RECORDED needs distinct lesson paths")
    commits = git(job, "rev-list", "--parents", f"{reviewed}..HEAD").splitlines()
    require(len(commits) == 1 and commits[0].split() == [current, reviewed],
            "the teacher must make one knowledge-only commit directly after the reviewed commit")
    changed = git(job, "diff", "--name-only", "--no-renames", "-z", reviewed, current).split("\0")
    changed = [p for p in changed if p]
    require(changed, "RECORDED requires a knowledge change")
    index_path = (knowledge_root(job) / "index.md").relative_to(job["worktree"]).as_posix()
    require(set(changed) <= set(lessons) | {index_path}, "teach.md must declare every changed lesson")
    for value in changed:
        path_in_root(job, value)
    linked = validate_index(job)
    lesson_text, superseded = [], set()
    for value in lessons:
        path = path_in_root(job, value)
        require(value in changed, f"{value}: the reported lesson must be changed")
        text = path.read_text()
        for key in ("ID", "Category", "Tags", "Verified", "Status"):
            require(re.search(rf"(?m)^{key}:\s*\S", text), f"{value}: missing {key} metadata")
        status = re.search(r"(?m)^Status:[ \t]*(.+)$", text)[1].strip()
        require(status in {"verified-on-branch", "superseded"}, f"{value}: invalid lesson Status")
        if status == "superseded":
            require(path not in linked and replacement_link(path, text, linked),
                    f"{value}: a superseded lesson must leave the active index and link its replacement")
            superseded.add(path)
        else:
            require(path in linked, f"{value}: the active lesson must be linked from the index")
        verified = re.search(r"(?m)^Verified:[ \t]*(.+)$", text)[1].strip()
        try:
            require(re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", verified), f"{value}: invalid Verified date")
            date.fromisoformat(verified)
        except ValueError as error:
            raise Refused(f"{value}: invalid Verified date") from error
        for name in LESSON_SECTIONS:
            require(text_section(text, name), f"{value}: missing {name}")
        require(reviewed in (text_section(text, "Evidence") or ""), f"{value}: missing the reviewed commit evidence")
        lesson_text.append(text)
    preserve_index(job, reviewed, linked, superseded)
    combined = "\n".join(lesson_text) + "\n" + (text_section(report.read_text(), "Reasons") or "")
    require(all(finding in combined for finding in expected),
            "each confirmed finding needs lesson evidence or an explicit reason it was skipped")
    return current
