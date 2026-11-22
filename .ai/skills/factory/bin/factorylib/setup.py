"""`job init`: the deterministic half of `/factory setup`.

It writes the project's factory files from the skill's templates, never
overwriting config.json or checks.sh and ignores the runtime paths in git.
Filling checks.sh and tailoring AGENTS.md is the
orchestrator's half.
"""

import json
import os
import shutil
from pathlib import Path

from .project import TEMPLATES, factory_dir, repo, run

GITIGNORE_LINES = ("/factory/jobs/", "/.worktrees/")
PROJECT_CATALOG = ".ai/skills/catalog.md"
USER_CATALOG = "~/.ai/skills/catalog.md"


def default_branch():
    res = run(["git", "symbolic-ref", "--short", "refs/remotes/origin/HEAD"], check=False)
    if res.returncode == 0 and res.stdout.strip():
        return res.stdout.strip().removeprefix("origin/")
    for name in ("main", "master"):
        if run(["git", "rev-parse", "--verify", "--quiet", name], check=False).returncode == 0:
            return name
    return "main"


def catalog_path():
    """The project's installed skill catalog, else the user's, else the project default."""
    if (repo() / PROJECT_CATALOG).is_file():
        return PROJECT_CATALOG
    if Path(os.path.expanduser(USER_CATALOG)).is_file():
        return USER_CATALOG
    return PROJECT_CATALOG


def write_config(dest):
    config = json.loads((TEMPLATES / "config.json").read_text())
    config["base_branch"] = default_branch()
    config["skills"]["catalog"] = catalog_path()
    dest.write_text(json.dumps(config, indent=2) + "\n")
    return config


def write_files(report):
    out = factory_dir()
    out.mkdir(exist_ok=True)
    config = None
    for name in ("config.json", "checks.sh"):
        dest = out / name
        if dest.exists():
            report.append(f"kept      factory/{name} (already there)")
            continue
        if name == "config.json":
            config = write_config(dest)
        else:
            shutil.copyfile(TEMPLATES / name, dest)
            dest.chmod(0o755)
        report.append(f"wrote     factory/{name}")
    shutil.copyfile(TEMPLATES / "dashboard.html", out / "dashboard.html")
    report.append("wrote     factory/dashboard.html")
    return config or json.loads((out / "config.json").read_text())


def ignore_runtime_paths(report):
    path = repo() / ".gitignore"
    text = path.read_text() if path.exists() else ""
    missing = [line for line in GITIGNORE_LINES if line not in text.splitlines()]
    if missing:
        prefix = "" if not text or text.endswith("\n") else "\n"
        path.write_text(text + prefix + "\n".join(missing) + "\n")
    report.append(f"{'updated' if missing else 'kept':<9} .gitignore ({', '.join(GITIGNORE_LINES)})")


def init():
    """Set the project up. Returns (report lines, whether everything succeeded)."""
    report = []
    config = write_files(report)
    ignore_runtime_paths(report)
    catalog = Path(os.path.expanduser(config["skills"]["catalog"]))
    catalog = catalog if catalog.is_absolute() else repo() / catalog
    if not catalog.is_file():
        report.append(f"MISSING   skill catalog {catalog}: install the shared skills, or set skills.catalog")
    return report, catalog.is_file()
