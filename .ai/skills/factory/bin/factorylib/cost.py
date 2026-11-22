"""API-equivalent cost and token use of a job's agents, from Claude Code and Codex logs.

Claude Code writes each subagent's messages, with model and token usage, to
<config>/projects/<project>/<session>/subagents/agent-<id>.jsonl. Every factory
prompt starts with `Job folder: <path>/`, which ties a transcript to its job.

Codex writes each session to <CODEX_HOME>/sessions/YYYY/MM/DD/rollout-*.jsonl.
A subagent's log stores the prompt it was given encrypted, so a Codex session
belongs to the job whose folder its commands name most often: every role reads
and writes its own job folder. Only subagent sessions started in this repository
count, as with Claude Code, so the orchestrator's own session is left out.

Neither format is a documented interface, so an update to either tool can break
this. Cost is for display only: unpriced models add tokens but no dollars, and a
log that can't be read is skipped, so it never blocks a stage change.
"""

import json
import os
import re
from functools import cache
from pathlib import Path

from .jobfiles import job_dir
from .project import config, repo

JOB_FOLDER = re.compile(r"factory/jobs/([0-9]{3}-[a-z0-9-]+)/")
UNREADABLE = (OSError, ValueError, TypeError, KeyError, AttributeError)


def transcripts_dir():
    home = Path(os.environ.get("CLAUDE_CONFIG_DIR", Path.home() / ".claude"))
    return home / "projects" / re.sub(r"[^A-Za-z0-9]", "-", str(repo()))


def codex_sessions_dir():
    return Path(os.environ.get("CODEX_HOME", Path.home() / ".codex")) / "sessions"


def prompt_text(line):
    content = json.loads(line)["message"]["content"]
    if isinstance(content, str):
        return content
    return " ".join(b.get("text", "") for b in content if isinstance(b, dict))


# ---- Claude Code -----------------------------------------------------------
def _usage_by_message(path, needle):
    usage = {}
    with path.open() as f:
        first = f.readline()
        try:
            if not first or needle not in prompt_text(first):
                return usage
        except (ValueError, KeyError, TypeError):
            return usage
        for line in f:
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            if not isinstance(entry, dict):
                continue
            msg = entry.get("message")
            if entry.get("type") == "assistant" and isinstance(msg, dict) and msg.get("usage"):
                usage[msg.get("id")] = (msg.get("model"), msg["usage"])
    return usage


def _claude_tokens(usage):
    return sum(usage.get(k, 0) for k in
               ("input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))


def _claude_price(usage, p):
    write_1h = (usage.get("cache_creation") or {}).get("ephemeral_1h_input_tokens", 0)
    write_5m = usage.get("cache_creation_input_tokens", 0) - write_1h
    return (usage.get("input_tokens", 0) * p["input"]
            + usage.get("output_tokens", 0) * p["output"]
            + write_5m * p["cache_write_5m"]
            + write_1h * p["cache_write_1h"]
            + usage.get("cache_read_input_tokens", 0) * p["cache_read"]) / 1e6


def _claude_usage(job, prices):
    needle = f"Job folder: {job_dir(job['id'])}/"
    usd, tokens = 0.0, 0
    for path in transcripts_dir().glob("*/subagents/agent-*.jsonl"):
        try:
            for model, usage in _usage_by_message(path, needle).values():
                if not isinstance(usage, dict):
                    continue
                tokens += _claude_tokens(usage)
                if model in prices:
                    usd += _claude_price(usage, prices[model])
        except UNREADABLE:
            continue
    return usd, tokens


# ---- Codex -------------------------------------------------------------------
def _codex_paths(since):
    """Rollouts from the job's start day on; Codex files them by date."""
    day = since[:10].replace("-", "/")
    for path in codex_sessions_dir().glob("*/*/*/rollout-*.jsonl"):
        if "/".join(path.parts[-4:-1]) >= day:
            yield path


def _in_repo(cwd):
    """Whether a session ran in this repository or below it, such as in a job's worktree.

    A plain prefix test would also take a sibling checkout like `<repo>-2`.
    """
    root = str(repo())
    return cwd == root or cwd.startswith(root.rstrip(os.sep) + os.sep)


@cache
def _codex_session(path, mtime):
    """(job id, model, total usage) of a Codex subagent session in this repo, or None.

    `mtime` is part of the cache key, so a session that is still running is read again.
    """
    mentions, model, usage = {}, None, None
    with Path(path).open() as f:
        meta = json.loads(f.readline()).get("payload") or {}
        if not meta.get("parent_thread_id") or not _in_repo(str(meta.get("cwd", ""))):
            return None
        for line in f:
            for job_id in JOB_FOLDER.findall(line):
                mentions[job_id] = mentions.get(job_id, 0) + 1
            if '"turn_context"' not in line and '"token_count"' not in line:
                continue
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            payload = entry.get("payload") if isinstance(entry, dict) else None
            if not isinstance(payload, dict):
                continue
            if entry.get("type") == "turn_context" and model is None:
                model = payload.get("model")
            elif payload.get("type") == "token_count" and isinstance(payload.get("info"), dict):
                usage = payload["info"].get("total_token_usage")
    if not mentions or not isinstance(usage, dict):
        return None
    return max(mentions, key=mentions.get), model, usage


def _codex_price(usage, p):
    cached = usage.get("cached_input_tokens", 0)
    return ((usage.get("input_tokens", 0) - cached) * p["input"]
            + cached * p["cache_read"]
            + usage.get("output_tokens", 0) * p["output"]) / 1e6


def _codex_usage(job, prices):
    usd, tokens = 0.0, 0
    for path in _codex_paths(job["started"]):
        try:
            session = _codex_session(str(path), path.stat().st_mtime)
            if not session or session[0] != job["id"]:
                continue
            _, model, usage = session
            tokens += int(usage.get("total_tokens", 0))
            if model in prices:
                usd += _codex_price(usage, prices[model])
        except UNREADABLE:
            continue
    return usd, tokens


def usage(job):
    """(API-equivalent USD, tokens) for every subagent that worked on this job."""
    prices = config().get("prices_usd_per_mtok", {})
    claude_usd, claude_tokens = _claude_usage(job, prices)
    codex_usd, codex_tokens = _codex_usage(job, prices)
    return round(claude_usd + codex_usd, 2), claude_tokens + codex_tokens


def short_tokens(n):
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.0f}k"
    return str(n)
