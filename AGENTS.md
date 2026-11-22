<!-- domain-driver:start -->
## Scaffolding with domain-driver

Use the domain-driver CLI to scaffold feature folders before filling in their implementation.
Read `.agents/skills/javascript-domain-driver/SKILL.md` for commands and stack detection. Claude discovers the same files through `.claude/skills/` links.
For a complete feature workflow, explicitly invoke `/factory <request>` in Claude Code or `$factory <request>` in Codex.
Shared capabilities are indexed in `.agents/skills/catalog.md`. Re-run `npx domain-driver init` after upgrading to refresh them.
<!-- domain-driver:end -->

## Using ui-sdk

Before using ui-sdk, follow the ui-sdk skill if it is installed, and read
`node_modules/@ui-sdk/react/docs/llms.txt`.

To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md`
by heading, and read `node_modules/@ui-sdk/react/docs/rendering.md` next to it.
