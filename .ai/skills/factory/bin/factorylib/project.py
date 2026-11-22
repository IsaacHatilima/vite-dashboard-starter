"""The project the factory runs in: its main checkout, its config and its job folders.

The scripts live in the installed factory, `.ai/skills/factory/bin/` in a project
or in the user's home. The project they act on is
the git repository of the current directory. From inside a job's worktree that
is still the main checkout, found through git's common directory.
"""

import functools
import json
import os
import subprocess
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parents[2]
TEMPLATES = SKILL_DIR / "templates"
SELECTION = SKILL_DIR / "references" / "skills.md"


class Refused(Exception):
    """The factory won't do this. The message says why."""


def die(prog, msg):
    print(f"{prog}: {msg}", file=sys.stderr)
    sys.exit(1)


def require(cond, msg):
    if not cond:
        raise Refused(msg)


@functools.cache
def repo():
    """The main checkout. FACTORY_REPO overrides it, for tests."""
    override = os.environ.get("FACTORY_REPO")
    if override:
        return Path(override).resolve()
    res = subprocess.run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
                         capture_output=True, text=True)
    if res.returncode != 0:
        raise Refused("run this inside the project's git repository")
    return Path(res.stdout.strip()).parent


def run(cmd, cwd=None, check=True, env=None):
    res = subprocess.run(cmd, cwd=cwd or repo(), capture_output=True, text=True, env=env)
    if check and res.returncode != 0:
        raise Refused(f"`{' '.join(cmd)}` failed: {(res.stderr or res.stdout).strip()}")
    return res


def factory_dir():
    return repo() / "factory"


def jobs_dir():
    return factory_dir() / "jobs"


def checks_script():
    return factory_dir() / "checks.sh"


@functools.cache
def config():
    path = factory_dir() / "config.json"
    require(path.exists(), f"{path} doesn't exist: run `/factory setup` (`$factory setup` in Codex) first")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise Refused(f"{path} isn't valid JSON: {e}") from e


def base_branch():
    return config()["base_branch"]


def expand(path):
    """A configured path: absolute, under ~, or relative to the main checkout."""
    p = Path(os.path.expanduser(str(path)))
    return p if p.is_absolute() else repo() / p
