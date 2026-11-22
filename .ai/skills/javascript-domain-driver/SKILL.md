---
name: javascript-domain-driver
description: Scaffold domain-driven feature folders with the domain-driver CLI. Use when creating a feature, adding a layer (types, schema, repository, service, controller, component, container, hook) to an existing feature, or adding any operation beyond List, Show, Create, Update, and Delete.
---

# domain-driver

Every feature lives in one folder, and every action in every layer is one file. Use the CLI to create files; write the logic inside them by hand.

The flow is **page -> hook -> API -> service -> repository**, with schemas and types used along the way. Services and repositories sit behind the API, on the server. The hook calls the endpoint directly, so there is no client-side service or repository. On `next-fullstack` the app is its own server: a Server Component reads through the service, and a Server Action writes through it.

## Detect the stack

The tool reads `package.json` and prints `Stack: <stack> (detected), root: <dir>` before every command. Stacks: `next-fullstack`, `next-frontend`, `react`, `node` (Express, Fastify, Hono, or none), `nest`, `tanstack-start`. Override with `--stack <name>` if detection is wrong. A Vite app with React and no Next.js, such as [vite-dashboard-starter](https://github.com/IsaacHatilima/vite-dashboard-starter), is the `react` stack: components, containers, hooks, schemas and types in the feature, with hooks calling an API that lives outside the project.
Where features are written can be overridden too: `--root <dir>` for one command, or a `domainDriver.featureRoot` key in `package.json` for the project. Read the root off the stack line rather than assuming the convention.
On Nest the tool registers what it generates: the feature module in the root module (from 0.9.2, in `<root>/<root>.module.ts` when `--root` names an area folder that has one), and controllers, services and repositories in `<feature>.module.ts`. Do not add those by hand — it prints what it registered, and prints the lines to paste when it cannot. A bespoke action controller is placed before `Show<Entity>Controller` so its route is not swallowed by `/:id`. From 0.11.0, a feature in an area routes under the area, `@Controller('<area>')`, and the tool prints the route each controller answers.
From 0.11.0 the tool formats every file it writes with the project's own Prettier and config; pass `--no-format` to skip it. Don't reformat generated files by hand.

## Commands

| Task | Command |
|---|---|
| New feature with every layer | `npx domain-driver make:feature users/User -a` |
| New feature, folders only | `npx domain-driver make:feature users` |
| Entity schema and its inferred type | `npx domain-driver make:types users/User` |
| Create and Update schemas (and Nest DTOs) | `npx domain-driver make:schema users/User` |
| Five repositories | `npx domain-driver make:repository users/User` |
| Five services | `npx domain-driver make:service users/User` |
| Five controllers (Nest, Node) | `npx domain-driver make:controller users/User` |
| A bespoke operation | `npx domain-driver make:action users/User findActiveUsers` |
| Bespoke operation with a request body | `npx domain-driver make:action users/User inviteUser --with-input --returns one` |
| A command on one record | `npx domain-driver make:action projects/Project archiveProject --on-record --method patch --returns one` |
| A read with query parameters | `npx domain-driver make:action projects/Project listProjects --method get --with-input --returns list` |
| Component, container, hook | `npx domain-driver make:component users/UserCard`, `make:container users/UserContainer`, `make:hook users/User` |

`make:service` and `make:repository` generate the server side only, because that is the only side there is. They are unavailable on `next-frontend` and `react`, whose API lives outside the project; on those stacks the hook is the whole client.

`make:action` without `--method` is a POST when it takes `--with-input` and a GET otherwise, and a GET that returns data becomes a query hook that runs on mount. A read that takes parameters, such as a paged or filtered list, passes `--method get --with-input` (0.12.0): its input comes from the query string in every layer (`@Query()` on Nest, search params in hooks and Next containers). Query values arrive as strings, so the schema coerces them: `z.coerce.number()` for numbers and `z.stringbool()` for booleans, never `z.coerce.boolean()`, which reads `"false"` as true. So a command such as archive, restore or delete always names its method, and one that acts on a record passes `--on-record`, which routes it at `/:id/<slug>` and passes the id through every layer. When the feature is the action itself, as in nestjs-starter's one feature per flow, the action takes the feature's own route instead of repeating its name. Needs 0.10.0 or later. In a Nest area named after the entity (0.11.0), routes are RESTful on the area: `createProject` is `POST /projects`, `archiveProject --on-record --method post` is `POST /projects/:id/archive`. In any other area the flow's name follows the area: `POST /auth/login`.

From 0.12.0 a layer command creates the feature folder it writes into, so `--root src/<area> make:types shared/Project` writes an area's shared types without a `make:feature` first. On Nest, commands that register classes in a module (`make:service`, `make:repository`, `make:controller`, `make:action`) still need `make:feature` first, and print the exact command.

Hooks are one file per action — `<Action><Entity>.hook.ts` exporting `use<Action><Entity>` — never a combined `use<Entity>.ts`. On `tanstack-start` they are TanStack Query hooks backed by a generated `<feature>.keys.ts`; elsewhere they are plain React state. From 0.9.1 the plain-state query hook keeps one result tagged with its request and derives `loading` and `error` from it, so it passes `eslint-plugin-react-hooks` 7 (`react-hooks/set-state-in-effect`). Keep that shape when you extend a hook: set state only in the request's callbacks or in event handlers, never synchronously in an effect. Older versions generate hooks that fail the rule; upgrade domain-driver rather than working around them. Never defer the call with `queueMicrotask` or `setTimeout`, or disable the rule, to get past the linter.

## Rules

1. **Scaffold before writing.** If a file the tool can generate does not exist yet, generate it. Do not create `services/FindActiveUsers.service.ts` by hand.
2. **One action, one file, every layer.** A new operation is a `make:action`, never a new method on an existing action class and never a branch inside Show or List. One file per action is not one copy per action: when two actions share a lifecycle, such as archive and restore hooks that differ only in their endpoint, they call one shared helper instead of repeating it.
3. **Keep the chain.** page -> hook -> API -> service -> repository. The hook calls the endpoint itself. A controller or route handler validates input and calls one service, a service calls one repository, and repositories do data access only. Never put a service or a repository in front of a `fetch`. On `next-fullstack` (0.11.0 and later) the chain is page -> Server Action -> service -> repository for a write, and Server Component -> service -> repository for a read. The tool generates both: each write gets `server/actions/<Action><Entity>.action.ts` (see `next/actions`), and a read's container is an async Server Component that calls the service. There is no route handler or fetch hook. Pass `--route` only for callers outside the app, such as webhooks or a mobile client; it generates the route handler and fetch hook instead.
4. **Names.** Feature folders kebab-case. Entities, actions, and classes PascalCase. Action names include their noun: `archiveUser`, `findActiveUsers`.
5. **Do not widen the standard five.** List returns all, Show returns one by id, Create takes the create schema, Update takes id and the update schema, Delete takes id. Anything else is a bespoke action.
6. **Finish what the tool leaves open.** Fill the `TODO` in each repository. On `next-fullstack`, each generated Server Action fails closed with `await requireCaller();`: replace that line with the project's session check, then delete the `requireCaller` function. Add the printed line to `<feature>.routes.ts` on Node or register the printed classes in `<feature>.module.ts` on Nest. Add fields to the Zod schemas.
7. **Zod is part of the stack.** The generated schemas import `zod`. When `package.json` lacks it, add it in the same change; never replace the generated schemas with hand-written parsers or type guards. Parse every request body and API response with a schema, and derive the feature's types with `z.infer` instead of keeping a parallel interface in `types/`. From 0.10.0 the tool does this itself: `schemas/<Entity>.schema.ts` holds `<Entity>Schema`, `types/<Entity>.types.ts` infers from it, and generated hooks parse each response with it. Add the entity's fields to the schema, not the type.
8. **Shared plumbing lives outside features.** The API base URL, the fetch helper, the response envelope and its error type are the same for every feature. Keep them once in `src/lib/` (or the project's equivalent), created with the first feature that needs them, and have each hook call the endpoint through them. Generated fetch hooks call `fetch` with a relative `/api/...` path as a placeholder: route each through that client when you fill it in. A feature folder holds only that feature's code, and nothing in it is named after the feature when it isn't specific to it.

## Layout by stack

- Next.js: `app/<feature>` or `src/app/<feature>`; Server Actions in `app/<feature>/server/actions`, and route handlers under `app/api/<feature>` only with `--route`. From 0.11.0 the tool detects `next-fullstack` when `app/api` exists, when the app depends on a database client such as `drizzle-orm`, `@prisma/client` or `pg`, or when a feature has a `server/` folder; otherwise pass `--stack next-fullstack`.
- React (including Vite) and Node: `src/features/<feature>` or `features/<feature>`. Nest a feature under another with `--root`, as the starter's auth screens do: `npx domain-driver --root src/features/auth make:feature two-factor-setup`.
- Nest: `src/features/<feature>` when `src/features` exists, otherwise `src/<feature>`, with a `<feature>.module.ts`. A project that groups flows into areas, as nestjs-starter does, scaffolds each with `--root src/<area>` so it lands in the area, registers in `src/<area>/<area>.module.ts`, and (from 0.11.0) routes under `@Controller('<area>')`.
- TanStack Start: `src/routes/<feature>` or `routes/<feature>`; every layer folder is prefixed with `-` so the router ignores it, and the entry file is `index.tsx`, not `page.tsx`.
