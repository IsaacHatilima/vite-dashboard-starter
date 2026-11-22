---
name: quality-deslop
description: Use when finishing or reviewing a branch for AI-generated slop - comments that narrate the change or don't match the file's style, defensive checks and try/catch on trusted paths, casts to any to silence the compiler, needless nesting, leftover debug output, and anything else that doesn't look like the surrounding code.
---

# Deslop

Applies to: the diff of a branch against its base. Slop is code that works but reads as if it was generated without looking at the file it landed in. Use `simplicity` for clarity in general and `thermo-nuclear-review` for structure; this skill is about fitting in.

## What counts as slop

Compare each changed hunk with the code around it, in the same file and its neighbours. Slop is:

- **Comments that don't belong:** narration of the change ("Added validation for X", "Updated to use Y"), comments restating the next line, section banners or doc blocks the file doesn't use elsewhere, and comment density far above the neighbouring code.
- **Defensive code on trusted paths:** null checks, `typeof` guards, fallbacks and try/catch blocks around values the types or the boundary already guarantee, or a catch that logs and continues where the file lets errors propagate.
- **Casts that silence the compiler:** `as any`, `as unknown as T`, `@ts-ignore`, `@ts-expect-error`, `# type: ignore`, or PHPStan ignores added only to make a type error go away.
- **Needless nesting:** conditionals nested where early returns would read straight down, and `else` after a `return`.
- **Leftovers:** debug output (`console.log`, `dd()`, `dump()`, `print`), commented-out code, unused imports and variables, and TODOs for work the change itself should have done.
- **Style drift:** naming, error handling, logging, imports or formatting that differ from the file's own conventions, such as a new error type where the file throws an existing one, or a bespoke helper beside the one the file already uses.

## When you're the author

Before you hand over, read your diff hunk by hunk against its surroundings and remove the slop. Keep behaviour unchanged unless you're fixing a clear bug. Make small, focused edits, not broad rewrites, and touch only lines the branch already changes.

## When you're the reviewer

Slop the branch introduces is a finding, under the same evidence rules as any other (`review`): name the `path:line`, the neighbouring code it departs from, and the edit that removes it while keeping behaviour the same. Group repeats of one pattern into a single finding with every location. Slop that predates the branch goes under Notes.

Adapted from Cursor's [deslop](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/deslop/SKILL.md) (MIT, see [LICENSE](LICENSE)).
