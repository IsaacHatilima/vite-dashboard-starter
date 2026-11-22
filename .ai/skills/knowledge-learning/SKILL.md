---
name: knowledge-learning
description: Use when retrieving project lessons before planning, building or reviewing related work, or recording and revising reusable engineering lessons from explicitly verified fixes or dismissed findings. Keeps an agent-facing knowledge index grouped by technical area; does not turn unresolved review opinions into rules.
---

# Learning

Make the reasoning behind verified outcomes useful to the next agent. A registration task should find an applicable login lesson through its behaviour and tags, even when the feature names differ.

This skill works in any workflow. The caller supplies the task, evidence, knowledge root and write permissions. In Factory, the teacher records lessons and other roles retrieve them. Loading this skill does not authorize product changes, external updates or committing files.

## Find relevant lessons first

Use the project knowledge root named by the caller or project guidance; otherwise use `Knowledge/` in the target checkout. Start with `index.md`. A missing root or index means there are no recorded lessons yet, not that the task is blocked.

Search its applicability descriptions and tags for the behaviour, failure mode, boundary and technologies in scope. Search across categories rather than only for the feature name. Ordinary repository search is enough; for example, search `async-state`, `sessions` and `forms` when a registration form submits asynchronously.

Read only matching lessons, then inspect the current implementation and relevant tests. Check each lesson's prerequisites, verification date, status and limits. Follow superseded entries to their replacement. A historical fix is a reference to assess, not proof that the current code has the same bug or must use the same solution. Current requirements and project guidance take precedence.

Record the lesson IDs and paths you read in the task's spec or role report, and say how they affected your work. Write `None applicable` with a short reason when the collection has no useful match. Refresh this selection when new lessons arrive during a later round.

## Decide whether evidence supports a lesson

Before writing, identify the original problem, its cause, what changed, and the evidence confirming the outcome at a specific commit. For a review finding, an explicit reviewer resolution is required. A builder's claim, a later omission or an overall PASS alone does not establish that a particular finding was fixed.

Capture reasoning that would change a future agent's decisions. Mechanical edits, unresolved findings, preferences without a demonstrated consequence and unverified guesses do not need entries. A dismissed finding can teach why a scenario was not a defect, but its explicit, evidenced resolution must remain distinguishable from a repaired bug.

Preserve what the evidence establishes: source inspection, focused tests, browser observation and wider runtime behaviour have different limits. A green test does not prove deployment or untested environments. Do not generalise an application-specific choice into a universal rule.

## Record or revise one lesson

Search the index and existing entries before creating a file. Update the matching lesson when the same cause and prevention recur; keep its stable ID and add useful new evidence. Separate entries only when applicability or reasoning materially differs.

Use one primary category and tags for other areas. Create categories only when they contain lessons. Useful areas include UI/UX, Database and Queries, Hooks and State, Authentication and Security, APIs and Integrations, and Testing. Use ordinary Markdown in lowercase, hyphenated category folders and filenames.

Each entry uses this contract, filling it with actual evidence rather than scaffold text:

```markdown
# <lesson title>

ID: <stable descriptive id>
Category: <one technical area>
Tags: <searchable terms, separated by commas>
Verified: <YYYY-MM-DD>
Status: verified-on-branch

## Use when
<the behaviour and prerequisites that make this relevant>

## Problem
<the concrete failure and who or what it affected>

## Cause
<why the failure occurred, with relevant code paths>

## Solution
<the accepted fix and why it works, or why the finding was dismissed>

## Prevention
<what to check before implementation and the regression check to preserve>

## Evidence
<repository and PR or source reference, original finding ID, fix commit,
reviewed commit, code and test paths, the checks and their observed results>

## Limits
<when this does not apply and what the evidence did not verify>
```

Keep provenance readable in a fresh checkout. Summarise the evidence and give durable repository/PR and commit references; ignored job reports must not be the only source. Omit credentials, private fixture contents and whole transcripts. Mark fixes verified on an unmerged branch as such; do not describe them as adopted or deployed behaviour.

When a lesson's advice changes, revise its explanation and verification evidence. Keep why the advice changed. Mark an obsolete entry `Status: superseded`, link its replacement, and remove obsolete guidance from the active index. Do not accumulate near-duplicate entries for every occurrence.

## Maintain the grouped index

Create or update `<knowledge root>/index.md` with a heading for each populated technical area and a small table:

```markdown
# Knowledge

## <technical area>

| Lesson | Use when | Tags |
|---|---|---|
| <title linked to the relative lesson path> | <one-line applicability> | <tags> |
```

Keep one active row per lesson, with a relative link that resolves. Preserve other entries. Tags let agents discover a lesson across categories without duplicating the file. When concurrent branches changed the index, reconcile both sets of additions and the underlying evidence; never resolve a conflict by dropping the other branch's lessons.

## Finish within the caller's scope

Report which lessons were read, created, revised or superseded and why. If no reusable lesson is justified, report that result instead of creating filler or an empty knowledge tree.

Only write or commit when the caller authorizes it, and only in its assigned checkout and paths. In-progress branch lessons help that branch's later rounds. Other jobs receive them through the project's normal merge and base-update workflow. Promotion into shared skills is a separate deliberate change, based on evidence that a lesson applies across projects.
