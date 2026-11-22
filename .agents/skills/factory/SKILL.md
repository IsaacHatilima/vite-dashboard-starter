---
name: factory
description: "Build a description into a reviewed, documented pull request. Use only when explicitly invoked as /factory in Claude Code or $factory in Codex, followed by a description, setup, run, run <job>, mitarbo <task-key>, or feedback about a job. Interactive brainstorming and grilling are separate from this workflow."
disable-model-invocation: true
---

# Factory command

Read `.ai/skills/factory/AGENT.md` and follow it as the workflow entrypoint. Pass the user's request unchanged. `<bin>` in AGENT.md is `.ai/skills/factory/bin`.

The factory has one copy, in `.ai/skills/factory/`. This file only makes it a command.
