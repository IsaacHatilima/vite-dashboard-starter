"""Job folders, job.json, and the first lines and sections agents leave in their files."""

import fcntl
import json
import re
from contextlib import contextmanager
from datetime import datetime, timezone

from .project import Refused, base_branch, config, jobs_dir, repo

ROLE_PORT_OFFSETS = {"builder": 0, "ux": 1, "ui": 2}

_locks = {}


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def job_dir(job_id):
    return jobs_dir() / job_id


def load(job_id):
    """Read a job, holding its lock until this process exits."""
    path = job_dir(job_id) / "job.json"
    if not path.exists():
        raise Refused(f"no job {job_id}")
    if job_id not in _locks:
        _locks[job_id] = open(job_dir(job_id) / ".lock", "w")
        fcntl.flock(_locks[job_id], fcntl.LOCK_EX)
    return json.loads(path.read_text())


def read(job_id):
    """Read a job without its lock: for the gate, which `job merge` runs while holding it."""
    path = job_dir(job_id) / "job.json"
    if not path.exists():
        raise Refused(f"no job {job_id}")
    return json.loads(path.read_text())


def save(job):
    path = job_dir(job["id"]) / "job.json"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(job, indent=2) + "\n")
    tmp.replace(path)


def all_jobs(lock=True):
    """Every job, in id order. Read without locks when only counting, so two
    processes that each hold one job's lock never wait on each other."""
    if not jobs_dir().exists():
        return []
    get = load if lock else read
    return [get(p.name) for p in sorted(jobs_dir().iterdir()) if (p / "job.json").exists()]


def resolve(arg):
    """A job by id (004-dark-mode) or local sequence number (4)."""
    if arg.isdigit():
        matches = [j for j in all_jobs(lock=False) if int(j["id"].split("-", 1)[0]) == int(arg)]
        if not matches:
            raise Refused(f"no job numbered {arg}")
        return load(matches[0]["id"])
    if not re.fullmatch(r"[0-9]+-[a-z0-9-]+", arg):
        raise Refused(f"invalid job id {arg!r}")
    return load(arg)


@contextmanager
def dispatch_lock():
    """Serialize queue allocation and slot admission before acquiring a job lock."""
    jobs_dir().mkdir(parents=True, exist_ok=True)
    with (jobs_dir() / ".dispatch.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)


def first_line(path):
    return path.read_text().split("\n", 1)[0].strip() if path.exists() else None


def header(path):
    """KEY: value lines at the top of an agent's file, up to the first blank line."""
    fields = {}
    for line in path.read_text().splitlines():
        if not line.strip():
            break
        key, _, value = line.partition(":")
        fields[key.strip().upper()] = value.strip()
    return fields


def text_section(text, heading):
    """Body of a `## heading` section in text, or None."""
    m = re.search(rf"^## {re.escape(heading)}[ \t]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(1).strip() if m else None


def section(path, heading):
    return text_section(path.read_text(), heading) if path.exists() else None


def round_dir(job, n=None):
    return job_dir(job["id"]) / f"round-{n or job['round']}"


def reviewers(job):
    return list((job.get("agents") or {}).get("reviewers") or [])


def port(job, role):
    ports = config()["ports"]
    return ports["base"] + ports["step"] * int(job["id"][:3]) + ROLE_PORT_OFFSETS[role]


def prompt_header(job, role=None):
    """The line every agent prompt starts with. Cost is found by its `Job folder:` text."""
    skills = job["skills"]
    from .learning import knowledge_root, learning_skill

    lesson_skill = learning_skill(job)
    parts = [
        f"Job: {job['id']}.",
        f"Job folder: {job_dir(job['id'])}/.",
        f"Main checkout: {repo()}.",
        f"Worktree: {job['worktree']}.",
        f"Branch: {job['branch']}.",
        f"Base: origin/{base_branch()}.",
        f"Request: {job_dir(job['id']) / 'request.md'}.",
        f"Knowledge root: {knowledge_root(job)}/.",
        f"Learning skill: {lesson_skill or 'unavailable (knowledge/learning)' }.",
    ]
    source = job.get("source") or {}
    if source.get("key"):
        parts.append(f"Source: {source['provider']} {source['key']}.")
    if job.get("pr"):
        parts.append(f"PR: #{job['pr']}.")
    parts += [
        f"Skill catalog: {skills['catalog']}.",
        f"Skill selection: {skills['selection']}.",
        f"Skill roots: {', '.join(skills['roots']) or 'none'}.",
    ]
    if role:
        if role not in ROLE_PORT_OFFSETS:
            raise Refused(f"no port for {role!r}; use one of {', '.join(ROLE_PORT_OFFSETS)}")
        parts.append(f"Port: {port(job, role)}.")
    return " ".join(parts)
