"""GitHub pull-request delivery through gh. Task intake is stored locally."""

import json

from .project import require, run

MARKER = "<!-- factory -->"


def gh(*args):
    return run(["gh", *args]).stdout


def gh_json(*args):
    return json.loads(gh(*args))


def comment(kind, number, body):
    require(kind == "pr", "Factory posts delivery comments only on pull requests")
    gh("pr", "comment", str(number), "--body", f"{MARKER}\n{body}")


def pr_state(job):
    return gh_json("pr", "view", str(job["pr"]), "--json", "state")["state"]


def pr_is_draft(job):
    return gh_json("pr", "view", str(job["pr"]), "--json", "isDraft")["isDraft"]
