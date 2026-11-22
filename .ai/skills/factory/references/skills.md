# Factory skill selection

The [shared catalog](../../../skills/catalog.md) defines reusable skills and their canonical paths. An installed factory reads the catalog named by `skills.catalog` in the project's `factory/config.json`, usually `.ai/skills/catalog.md` in the project or `~/.ai/skills/catalog.md` for the user; it must not assume that this source checkout exists. Every agent's prompt header names the catalog, this file, and the library roots.

Spec-writer discovers the project, selects task-relevant skills from that catalog, and records `Skill | Package or scope | Roles | Resolved path | Why` under `## Skills` in `spec.md`, with `Status: READY` or `Status: BLOCKED`. Intake reads no skills: it judges the request against the project, not its conventions. Interactive planning skills, including `planning/brainstorming` and its built-in grilling, run outside Factory. Do not invoke them from the orchestrator or assign them to job agents. An agreed design explicitly supplied with the request is input to the job, not a reason to restart discovery with the user. Intake still handles blocking questions through NEEDS-INFO.

Every role reads its assigned files. The factory's scripts refuse to start a stage while a selected file can't be read, and a BLOCKED spec goes to a person before anything is built. Unused frameworks and optional capabilities absent from the installed catalog do not block a job. Discovery, verification, security checks, UX/UI review, and documentation have baseline instructions in the factory roles.

## Stack assignments

Select by the code actually changed, including server functions and rendered pages. Read each selected skill before planning or implementing its contract.

| Capability | Assign to | Condition |
|---|---|---|
| `laravel/*` | spec-writer, builder, reviewer-code | Applicable Laravel paths. Use `laravel/frontend` for React/Inertia inside a Laravel app. |
| `nest/*` | spec-writer, builder, reviewer-code | Applicable Nest paths. |
| `vite/configuration` | spec-writer, builder, reviewer-code | Vite configuration, plugins, environment exposure, assets, development proxies, builds, or Vite/Vitest tooling integration changes. A Vite dependency alone does not select it. |
| `react-router/routing` | spec-writer, builder, reviewer-code | React Router routes, navigation, URL state, pending/error states, loaders, actions, or authentication redirects change. Preserve the existing routing mode and API ownership. |
| `next/actions` | spec-writer, builder, reviewer-code | A Next Server Action or its callers change. |
| `next/database` | spec-writer, builder, reviewer-code, reviewer-security | A Next app's schema, migrations, repositories or database-backed tests change. |
| `tanstack-start/actions` | spec-writer, builder, reviewer-code | A TanStack server function or its callers change. |
| `javascript/domain-driver` | spec-writer, builder, reviewer-code | Scaffolding in a JavaScript package that uses domain-driver. Laravel uses Artisan or an explicit manual strategy. |
| `typescript/best-practices` | builder, reviewer-code, reviewer-security | Any `.ts` or `.tsx` file changes, in whatever stack. |

Choose the skills whose documented scope matches the task, not every skill in a framework. Reviewer-security also reads selected skills for authentication, authorization, input, persistence, or output across changed trust boundaries. UX/UI reviewers read selected frontend guidance for the surfaces they review. Documenter and approver need only skills relevant to their own work. Assign reviewer skills by these rules whether or not intake routed that reviewer for the job; an unrouted reviewer doesn't run and doesn't read them.

A project contains only the skill groups installed in it, from this library's bundles. If the task requires a framework's skills and that framework is absent, report its missing canonical path. Do not substitute another stack. For a framework without a catalog entry, use project guidance and any explicitly supplied project skill, and record that choice.

## Additional capabilities

Select these when present in the installed catalog and relevant to the task. A Laravel-only installation uses its Laravel conventions and the factory role instructions for these concerns.

| Skill id | Assign to | Condition |
|---|---|---|
| `knowledge/learning` | spec-writer, builder, reviewer-code, reviewer-security, reviewer-ux, reviewer-ui, teacher | Every job retrieves applicable project lessons; the teacher records only the script's confirmed resolution batch. A missing collection is normal; the core skill must be installed. |
| `quality/simplicity` | builder, reviewer-code | Application code changes. |
| `quality/deslop` | builder, reviewer-code | Application code changes. The builder removes slop before handing over; the reviewer flags what remains. |
| `quality/thermo-nuclear-review` | builder, reviewer-code | Application code changes. It is the code reviewer's approval bar, so the builder applies it before handing over. |
| `quality/review` | reviewer-code, reviewer-security | A code change is reviewed. |
| `quality/security-review` | reviewer-security | A code change is reviewed. The reviewer reads only the reference checklists for the surfaces the diff touches. |
| `brand/identity` | spec-writer, builder, reviewer-ui, reviewer-ux | A visible surface changes colours, theme, typography, logo or icons, or a project gets its first theme. When the project has no brand, the spec records the composed one and marks it as a product decision. |
| `frontend/app-shell` | builder, reviewer-ux, reviewer-ui | Layout, navigation, sidebar, header, redirect, or page-level states change. |
| `frontend/overlays` | builder, reviewer-ux, reviewer-ui | An overlay or confirmation is added or changed. |
| `frontend/data-display` | builder, reviewer-ux, reviewer-ui | A table, list, timeline, KPI tile, or chart changes. |

The project knowledge root defaults to `Knowledge/`; `factory/config.json` can set `knowledge.root` to a safe repository-relative folder. The job header identifies its root. Spec-writer, builder and reviewers search the grouped index and read relevant entries before their substantive work, recording lesson IDs and paths or `None applicable`. They never author lessons. Teacher writes knowledge; documenter writes feature docs only. An absent collection does not block a job and never causes the installer to seed lessons.

Resolve paths using the installed catalog's precedence rules and record absolute readable paths. Library roots are read-only during a feature job. Skill selection does not change write ownership or approval policy.
