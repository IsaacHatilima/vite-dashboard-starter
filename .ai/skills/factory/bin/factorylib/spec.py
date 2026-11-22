"""Checks on spec.md and on the feature page the documenter writes.

The spec's Skills table records the skill files each role reads. Every stage
that starts a role rechecks that those files are still readable, so a job
never runs on a silently substituted or missing skill.
"""

import re
from pathlib import Path

from .jobfiles import job_dir, text_section
from .project import Refused, require

SPEC_SECTIONS = ("Summary", "Project", "Skills", "Acceptance criteria", "Documentation")
DOC_STATUSES = ("Shipped", "Not shipped")


def _cells(row):
    return [c.strip() for c in row.strip().strip("|").split("|")]


def skills_status(text):
    body = text_section(text, "Skills") or ""
    m = re.search(r"^Status:\s*(READY|BLOCKED)\s*$", body, re.M)
    return m.group(1) if m else None


def skill_rows(text):
    """(skill id, resolved path) for each row of the spec's Skills table."""
    rows = [line for line in (text_section(text, "Skills") or "").splitlines()
            if line.strip().startswith("|")]
    if not rows:
        return []
    head = [c.lower() for c in _cells(rows[0])]
    if "resolved path" not in head:
        raise Refused("spec.md's Skills table has no `Resolved path` column")
    col = head.index("resolved path")
    out = []
    for row in rows[1:]:
        if re.fullmatch(r"\|[\s:|-]+\|", row.strip()):
            continue
        cells = _cells(row)
        path = cells[col].strip("` ") if col < len(cells) else ""
        out.append((cells[0].strip("` "), path))
    return out


def missing_skills(text):
    missing = []
    for skill, path in skill_rows(text):
        readable = path and "unavailable" not in path.lower() and Path(path).expanduser().is_file()
        if not readable:
            missing.append(f"{skill} ({path or 'no path'})")
    return missing


def doc_page(text):
    """The feature page named by `Doc:` under ## Documentation, relative to the repo root."""
    body = text_section(text, "Documentation") or ""
    m = re.search(r"^Doc:\s*`?([^`\s]+)`?\s*$", body, re.M)
    require(m, "spec.md's Documentation section has no `Doc: Documentation/<Feature>.md` line")
    page = m.group(1)
    require(page.startswith("Documentation/") and page.endswith(".md") and ".." not in page,
            f"spec.md names {page!r} as its page; it must be Documentation/<Feature>.md")
    return page


def check_spec(job, want):
    """spec.md is complete and its Skills status is `want` (READY or BLOCKED)."""
    path = job_dir(job["id"]) / "spec.md"
    require(path.exists(), "spec.md doesn't exist")
    text = path.read_text()
    absent = [h for h in SPEC_SECTIONS if text_section(text, h) is None]
    require(not absent, f"spec.md is missing: {', '.join('## ' + h for h in absent)}")
    status = skills_status(text)
    require(status == want, f"spec.md's Skills status is {status or 'missing'}, not {want}")
    if want == "BLOCKED":
        require(text_section(text, "Blocked"), "a BLOCKED spec.md needs a ## Blocked section")
        return
    doc_page(text)
    missing = missing_skills(text)
    require(not missing, f"spec.md selects skills that can't be read: {'; '.join(missing)}")


def check_skills(job):
    """The skill files the spec selected are still readable."""
    path = job_dir(job["id"]) / "spec.md"
    if not path.exists():
        return
    missing = missing_skills(path.read_text())
    require(not missing, "selected skills can't be read: " + "; ".join(missing)
            + ". Reinstall them, or send the job back with feedback to change the spec.")


def doc_status(page):
    """`Shipped` or `Not shipped` from the page's title line, `# <Feature> (<Status>)`."""
    if not page.exists():
        return None
    m = re.fullmatch(r"#\s+.+\((Shipped|Not shipped)\)\s*", page.read_text().split("\n", 1)[0])
    return m.group(1) if m else None
