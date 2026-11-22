# Shared skill catalog

Any workflow can select skills from this library. Selection depends on its task, target packages, and required capabilities; a workflow does not need to run another workflow first. The invoking workflow defines its own steps, roles, report paths, and completion rules.

## Resolve skill files

Canonical paths below are relative to the library root containing this `catalog.md`. In the skills repository that root is `skills/`, with grouped folders such as `laravel/actions/SKILL.md`. Installed, every skill has a single copy in a flat folder named `<group>-<name>`: `.ai/skills/laravel-actions/SKILL.md` in a project, or under `~/.ai/skills/` for the user. The project's `AGENTS.md` and `CLAUDE.md` point agents there.

Resolve a selected skill in this order:

1. The project's `.ai/skills/<group>-<name>/SKILL.md`, in the target worktree or, when the worktree doesn't carry it, the main checkout.
2. Supplied library roots in their stated order, such as `~/.ai/skills/`: the group-prefixed folder in a flat root, or the canonical grouped path in a library checkout.

Read the actual file and record its absolute path. Conflicting copies at the same priority require an explicit selection. Library roots outside the target worktree are read-only inputs. Do not infer another checkout's location or load every skill in a group. A skill that names another by its bare name, such as "see `actions`", means the skill of that name in its own group.

Report a missing required skill through the invoking workflow's blocked/reporting contract, naming the skill and canonical path. Missing unused groups do not block a task. Project guidance takes precedence over defaults; skill selection does not expand write ownership or authorize external effects.

## Skill ids

A skill id is `<group>/<name>`, which is its folder path under the library root. Names are only unique within a group, so a flat install into a project must prefix them with the group (`laravel-actions`, `nest-actions`) to avoid collisions.

## Stack actions

Each stack folder has its own action skill, written only for that framework. Select by the runtime that owns the business operation, not every dependency in the repository. A Laravel backend with a React UI uses `laravel/actions`.

| Stack | Skill id | Canonical path |
|---|---|---|
| Laravel | laravel/actions | `laravel/actions/SKILL.md` |
| Nest | nest/actions | `nest/actions/SKILL.md` |
| Next | next/actions | `next/actions/SKILL.md` |
| TanStack Start | tanstack-start/actions | `tanstack-start/actions/SKILL.md` |

## JavaScript scaffolding

| Skill id | Canonical path | Use when |
|---|---|---|
| javascript/domain-driver | `javascript/domain-driver/SKILL.md` | Scaffolding a feature, layer, or bespoke operation with the domain-driver CLI in a JavaScript package. |

## Vite

Build tooling for the installed Vite version. Combine with the project's framework and frontend skills; Vite does not determine its routing or API architecture.

| Skill id | Canonical path | Use when |
|---|---|---|
| vite/configuration | `vite/configuration/SKILL.md` | Changing or reviewing Vite configuration, plugins, environment exposure, assets, development proxies, builds, or Vite/Vitest tooling integration. |

## React Router

Routing guidance selected by the app's existing mode and installed version, including Vite SPAs that use data routers.

| Skill id | Canonical path | Use when |
|---|---|---|
| react-router/routing | `react-router/routing/SKILL.md` | Configuring or reviewing React Router routes, layouts, navigation, URL state, pending/error states, loaders, actions, or authentication redirects while preserving the project's routing mode and data architecture. |

## Laravel

Laravel 13 conventions, including React and Inertia inside a Laravel app (`laravel/frontend`). Each skill lists the paths it applies to. Business operations use `laravel/actions`; scaffolding uses Artisan, never domain-driver.

| Skill id | Canonical path | Use when |
|---|---|---|
| laravel/actions | `laravel/actions/SKILL.md` | Creating, refactoring, or reviewing a Laravel action or operation service that queries, writes, or makes a business decision. |
| laravel/api-responses | `laravel/api-responses/SKILL.md` | Adding or changing a Laravel JSON API endpoint, its response envelope or pagination output, or how API errors such as 401, 403, 404, 422, 429, and 500 are rendered. |
| laravel/architecture | `laravel/architecture/SKILL.md` | Placing new Laravel behaviour, naming a new class, planning a feature or refactor, or reviewing where queries, validation, authorization, and responses belong. |
| laravel/controllers | `laravel/controllers/SKILL.md` | Adding or changing Laravel controllers or routes, wiring a FormRequest and action to an endpoint, or choosing between an API response, Inertia page, and redirect. |
| laravel/data | `laravel/data/SKILL.md` | Creating or changing Laravel input Data classes, output Resources, or the frontend-facing representation of a model, including partial updates. |
| laravel/eloquent-strictness | `laravel/eloquent-strictness/SKILL.md` | Enabling Eloquent strict mode, or when fixing a lazy-loading, missing-attribute, or discarded-attribute violation or an N+1 query. |
| laravel/enums | `laravel/enums/SKILL.md` | Adding or changing a PHP enum used by a Laravel model, or its stored values, labels, validation, or select options. |
| laravel/frontend | `laravel/frontend/SKILL.md` | Adding or changing React or Inertia pages, page props, Wayfinder routes, forms, or shared UI in a Laravel application's resources/js. |
| laravel/insights | `laravel/insights/SKILL.md` | Adding or running PHP Insights in a Laravel application, or when Insights reports a finding. |
| laravel/jobs | `laravel/jobs/SKILL.md` | Adding or reviewing Laravel queued jobs, listeners, or background work such as exports, reports, webhooks, imports, and notifications, or when a request is slow because it does work the user doesn't need to wait for. |
| laravel/migrations | `laravel/migrations/SKILL.md` | Adding or changing a Laravel migration, table, column, index, foreign key, or schema backfill. |
| laravel/models | `laravel/models/SKILL.md` | Creating or changing an Eloquent model, or its casts, relationships, scopes, fillable columns, or PHPDoc properties. |
| laravel/phpstan | `laravel/phpstan/SKILL.md` | Adding or running PHPStan or Larastan in a Laravel application, or when PHPStan reports an error. |
| laravel/requests | `laravel/requests/SKILL.md` | Adding or changing a Laravel FormRequest, validation rules, request authorization, or query parameters such as filters, sorting, and pagination. |
| laravel/security | `laravel/security/SKILL.md` | Adding or reviewing Laravel authorization, policies, authentication, API tokens, CORS, CSRF exceptions, file uploads, raw queries, HTML output, rate limits, or production configuration, or before deploying a Laravel application. |
| laravel/tests | `laravel/tests/SKILL.md` | Writing, choosing, or running tests for a Laravel application, including Pest unit, feature, action, HTTP, and browser tests, or deciding which tests a change needs. |

## Next

Next.js conventions beyond its Server Actions (`next/actions`, under Stack actions).

| Skill id | Canonical path | Use when |
|---|---|---|
| next/database | `next/database/SKILL.md` | Writing persistence in a Next.js app: the Drizzle client and schema, repository queries, transactions and races, database errors, migrations, caching user data, or database-backed tests. |

## Nest

NestJS conventions for Drizzle and Zod, with the file layout domain-driver generates. A project already on Prisma keeps it; each persistence skill ends with its Prisma equivalents. Business operations use `nest/actions`.

| Skill id | Canonical path | Use when |
|---|---|---|
| nest/actions | `nest/actions/SKILL.md` | Creating or reviewing a class that runs one business operation: its input, actor, transaction, side effects, and return value. |
| nest/api-responses | `nest/api-responses/SKILL.md` | Changing the response envelope, exception filter, error codes, or paginated output, or how validation, auth, database, and unexpected errors reach the client. |
| nest/architecture | `nest/architecture/SKILL.md` | Adding a feature or module, deciding where code belongs, sharing providers, fixing dependency-resolution or circular-import errors, using events, or setting up config validation, logging, and shutdown. |
| nest/controllers | `nest/controllers/SKILL.md` | Adding or changing a controller or route, wiring DTOs, pipes, and guards, choosing an HTTP method or status, or reading the actor. |
| nest/database | `nest/database/SKILL.md` | Setting up the Drizzle module, changing schema conventions, writing repository queries, fixing N+1 queries or over-fetching, using transactions, translating database errors, or paginating. |
| nest/dtos | `nest/dtos/SKILL.md` | Creating Zod request schemas and DTOs, query or path validation, or partial updates, or deciding what an endpoint returns and how a database row becomes it. |
| nest/jobs | `nest/jobs/SKILL.md` | Adding BullMQ background work or recurring jobs, or when a request is slow because of work the client needn't wait for. |
| nest/migrations | `nest/migrations/SKILL.md` | Changing tables, columns, or constraints with Drizzle Kit, writing backfills, or running migrations locally, in CI, or in production. |
| nest/security | `nest/security/SKILL.md` | Adding or reviewing auth and permission guards, public routes, ownership and tenant scoping, rate limits, CORS and helmet, JWT and refresh tokens, passwords, or secrets. |
| nest/tests | `nest/tests/SKILL.md` | Writing or running unit and e2e tests, using an isolated test database, overriding providers, or deciding which tests a change needs. |

## TypeScript

Language rules for any TypeScript package. Combine with the stack skills for the code in scope.

| Skill id | Canonical path | Use when |
|---|---|---|
| typescript/best-practices | `typescript/best-practices/SKILL.md` | Reading, writing, or reviewing any .ts or .tsx file: discriminated unions, branded ids, parsing external data at the boundary, removing `as` casts and `any`, exhaustive switches. |

## Planning

Standalone conversations with the person who owns an idea before implementation. Brainstorming includes grill-me's decision tree and rounds of questions with recommended answers, then produces an agreed design. These sessions run outside Factory; Factory does not invoke them or assign them to its agents.

| Skill id | Canonical path | Use when |
|---|---|---|
| planning/brainstorming | `planning/brainstorming/SKILL.md` | Brainstorming an idea, feature or design, or asking to be grilled: explore intent and approaches, probe decisions in rounds with recommendations, and write an agreed design. Runs outside Factory. Skip fully specified, authorized changes. |

## Knowledge

Project-local engineering lessons for agents. Retrieve by behaviour, applicability and tags before specification, implementation or review; record or revise entries only from verified outcomes. An absent collection is normal for a new project.

| Skill id | Canonical path | Use when |
|---|---|---|
| knowledge/learning | `knowledge/learning/SKILL.md` | Finding relevant prior lessons or recording reusable reasoning from explicitly verified fixes or dismissed findings in a grouped project knowledge index. |

## Brand

A product's identity: colour systems composed from the [brand-colours](https://github.com/IsaacHatilima/brand-colours) library, typography, logo and voice.

| Skill id | Canonical path | Use when |
|---|---|---|
| brand/identity | `brand/identity/SKILL.md` | Creating or applying a brand: composing its colour system and guidelines from the colour library (for example around green, red and gray), theming the vite-dashboard starter or any stack, typography, logo and app icons, BRAND.md, or reviewing UI for off-brand colours, raw hex values, contrast, or logo misuse. |

## Frontend

Stack-agnostic interface skills. Combine them with the stack skills for the code in scope.

| Skill id | Canonical path | Use when |
|---|---|---|
| frontend/app-shell | `frontend/app-shell/SKILL.md` | Building or reviewing the frame around signed-in screens: the route after login, sidebar, header, page layout, density, and page-level loading, empty, and error states. |
| frontend/overlays | `frontend/overlays/SKILL.md` | Choosing, building, or reviewing dialogs, drawers, sheets, popovers, menus, tooltips, toasts, and confirmations: what opens them, focus, dismissal, stacking, and mobile behaviour. |
| frontend/data-display | `frontend/data-display/SKILL.md` | Designing, building, or reviewing data tables, lists, activity or audit logs, timelines, KPI tiles, and summary charts. |

## Quality

Stack-agnostic skills for writing and reviewing any change. Combine them with the stack skills for the code in scope.

| Skill id | Canonical path | Use when |
|---|---|---|
| quality/simplicity | `quality/simplicity/SKILL.md` | Writing, refactoring, or reviewing code that should be easy for the next developer to read. |
| quality/review | `quality/review/SKILL.md` | Reviewing a diff, branch, or pull request and deciding what blocks the merge. |
| quality/deslop | `quality/deslop/SKILL.md` | Finishing or reviewing a branch for AI-generated slop: narrating comments, defensive code on trusted paths, casts that silence the compiler, needless nesting, leftovers, and style that doesn't match the surrounding code. |
| quality/thermo-nuclear-review | `quality/thermo-nuclear-review/SKILL.md` | Holding a change to an extremely strict maintainability bar: code-judo simplifications, files past 1,000 lines, spaghetti branching, wrong-layer logic, casts and optionality. |
| quality/security-review | `quality/security-review/SKILL.md` | Reviewing a change for security problems and deciding which ones block the merge, with attack-class checklists for web, client, data isolation, messaging, LLM, mobile, resource, supply-chain and cloud surfaces. |

Register a new group here, with its canonical paths, before a workflow selects it.
