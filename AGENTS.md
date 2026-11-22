# Agent guide

React 19, TypeScript, Vite, react-router, and shadcn/ui on Base UI. `README.md` covers the screens, shells, and theming.

## Checks

`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass before a change is done.

## Features

- Each feature lives in `src/features/<feature>/`. Scaffold it with domain-driver before writing a file by hand: `pnpm exec domain-driver make:feature <feature>/<Entity> -a`. An operation other than List, Show, Create, Update, or Delete is `make:action <feature>/<Entity> <action>`; one that changes state names its method (`--method post|put|patch|delete`, otherwise it is a `GET` query that runs on mount), and one that acts on a record by id adds `--on-record`. A read with query parameters, such as a filtered list, passes `--method get --with-input`, and its hook sends the input as search params. The entity's fields go in `schemas/<Entity>.schema.ts`; its type is inferred from that schema. The tool formats what it writes with this project's Prettier config, so generated files need no restyling. A nested feature takes `--root`, such as `--root src/features/auth`.
- The generated schemas use `zod`. Parse request bodies and API responses with them, and derive the feature's types with `z.infer`.
- Code that every feature shares, such as an API client, lives once in `src/lib/`.
- Routes are registered in `src/router.tsx`.

## UI

- `src/components/ui/` holds the shadcn components (`pnpm dlx shadcn@latest add <name>`). Reuse them before writing new ones.
- A dialog that becomes a bottom sheet on phones uses `ResponsiveDialog` from `src/components/ui/responsive-dialog.tsx`. Its parts render a centered `Dialog` from 768px up and a `Drawer` that swipes down below it, so the content is written once.
- `useIsMobile()` in `src/hooks/use-mobile.ts` is the one phone-width check.

## Agent skills

The project's shared skills and Factory are installed from [IsaacHatilima/skills](https://github.com/IsaacHatilima/skills) and committed here. Their canonical files live in `.ai/skills/`, with host pointers and agents in `.agents/`, `.claude/` and `.codex/`. To refresh them, run that repository's `./install web --project <path-to-this-project> --force` and review the generated diff. The installer manages the skills section below; keep project instructions outside that block.

## Using ui-sdk

Before using ui-sdk, follow the ui-sdk skill if it is installed, and read
`node_modules/@ui-sdk/react/docs/llms.txt`.

To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md`
by heading, and read `node_modules/@ui-sdk/react/docs/rendering.md` next to it.

<!-- skills:start -->
## Skills

Agent skills live in `.ai/skills/`, one folder per skill with a `SKILL.md`. Before work that a skill covers, read its `SKILL.md` in full and follow it; these instructions win where they differ. `.ai/skills/catalog.md` indexes them and maps a skill id such as `laravel/actions` to its folder, `laravel-actions`; a skill that names another one by its bare name means the same group.

| Skill | Use when |
|---|---|
| `brand-identity` | creating or applying a product's brand - composing its colour system from the brand-colours library (for example "a brand around green, red and gray"), writing brand guidelines, theming an app or the vite-dashboard starter, typography, logo and app icons, BRAND.md - or when reviewing UI for off-brand colours, raw hex values, contrast, or logo misuse. |
| `frontend-app-shell` | building or reviewing the frame around a web app's screens - choosing or changing the dashboard or auth shell, adding a page with its route, navigation item and breadcrumbs, the user menu and settings, page layout and density, or page-level loading, empty and error states - especially in projects built on the vite-dashboard starter. |
| `frontend-data-display` | designing, building, or reviewing how records and metrics are shown (data tables, lists, activity or audit logs, timelines, KPI tiles, summary charts), especially when a table looks generic, numbers don't line up, status is plain text, history is buried in a table, or every section sits in the same card. |
| `frontend-overlays` | adding, choosing, or reviewing a dialog, modal, drawer, sheet, popover, dropdown menu, tooltip, toast, or confirmation, especially when it's unclear what opens it or whether it needs a URL, or when overlays stack, lose focus, close by accident, drop unsaved work, blur the page, or break on mobile. |
| `javascript-domain-driver` | Scaffold domain-driven feature folders with the domain-driver CLI. Use when creating a feature, adding a layer (types, schema, repository, service, controller, component, container, hook) to an existing feature, or adding any operation beyond List, Show, Create, Update, and Delete. |
| `knowledge-learning` | retrieving project lessons before planning, building or reviewing related work, or recording and revising reusable engineering lessons from explicitly verified fixes or dismissed findings. Keeps an agent-facing knowledge index grouped by technical area; does not turn unresolved review opinions into rules. |
| `next-actions` | adding, changing, or reviewing a Next.js Server Action, a form or button that submits to one, or the revalidation, redirect, or returned state after it. |
| `next-database` | writing persistence code in a Next.js app: the Drizzle client and schema, repository queries, transactions and races, translating database errors, migrations, caching user data, or database-backed tests. Drizzle with PostgreSQL by default; a project already on Prisma keeps it. |
| `planning-brainstorming` | a person wants to brainstorm an idea, feature or design, asks to be grilled or interviewed about it, or needs to work through intent, approaches and unresolved decisions before implementation. Combines brainstorming with rounds of probing questions and recommended answers. Skip fully specified changes that are already authorized. |
| `quality-deslop` | finishing or reviewing a branch for AI-generated slop - comments that narrate the change or don't match the file's style, defensive checks and try/catch on trusted paths, casts to any to silence the compiler, needless nesting, leftover debug output, and anything else that doesn't look like the surrounding code. |
| `quality-review` | reviewing a diff, branch, or pull request and deciding what blocks the merge, especially when findings mix real bugs with pre-existing problems, style preferences, or claims about code outside the diff. |
| `quality-security-review` | reviewing a diff, branch, or pull request for security problems - authorization and tenant isolation, injection, sessions and tokens, redirects, client-side and webview issues, secrets and sensitive data, LLM and agent tools, queues and webhooks, CI and dependencies, resource exhaustion - and deciding which ones block the merge. |
| `quality-simplicity` | writing, refactoring, or reviewing code that should be easy for the next developer to read, especially code written under time pressure, code that grew defensive checks or options nobody asked for, or code with nested conditionals, pass-through methods, or comments that no longer match. |
| `quality-thermo-nuclear-review` | reviewing or finishing a change with an extremely strict maintainability bar - abstraction quality, files pushed past 1,000 lines, ad-hoc branching and spaghetti growth, wrong-layer logic, casts and optionality that hide the real contract, and missed "code judo" restructurings that would make the change dramatically simpler. |
| `react-router-routing` | adding or reviewing React Router routes, nested layouts, navigation, URL state, route data or mutations, pending and error states, or authentication redirects. Identify the installed version and router mode first; preserve the project's existing data ownership and feature structure. |
| `tanstack-start-actions` | adding, changing, or reviewing a TanStack Start server function, its validator or auth middleware, or the hook or loader that calls it and refreshes data afterwards. |
| `typescript-best-practices` | reading, writing, or reviewing any .ts or .tsx file - modelling state with discriminated unions, branding ids, parsing external data at the boundary with the project's schema library, removing as-casts and any, exhaustive switches, and deciding where validation belongs. |
| `vite-configuration` | adding, changing, or diagnosing Vite configuration, aliases, plugins, client environment variables, asset imports, development proxying, or production builds in a Vite application, especially a React and TypeScript SPA. |

The software factory runs as `/factory` in Claude Code and `$factory` in Codex; its workflow is `.ai/skills/factory/AGENT.md`.

Installed by the skills repository's `./install`; edit outside this block.
<!-- skills:end -->
