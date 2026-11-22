---
name: react-router-routing
description: Use when adding or reviewing React Router routes, nested layouts, navigation, URL state, route data or mutations, pending and error states, or authentication redirects. Identify the installed version and router mode first; preserve the project's existing data ownership and feature structure.
---

# React Router

Applies to: applications using `react-router` or `react-router-dom`. This is adapted from the official React Router skill for the library's existing React and Vite projects. Project instructions and the installed package's APIs take precedence.

## Identify the mode before choosing APIs

Read `package.json`, the lockfile, the router entrypoint and, when present, `vite.config.*` and `react-router.config.*`. A dependency alone does not establish the app's mode.

| Evidence in the application | Mode and guidance |
|---|---|
| `createBrowserRouter`, `createHashRouter` or `createMemoryRouter` with `RouterProvider`, without the Framework plugin | Data Mode; use the guidance below. Route objects may use `element` even though there are no loaders yet. |
| `BrowserRouter` or `HashRouter` with `Routes`/`Route` or `useRoutes`, without a data router | Declarative Mode; read [other modes](references/other-modes.md). |
| `@react-router/dev/vite`, route modules and generated `./+types` imports | Framework Mode; read [other modes](references/other-modes.md), checking the configured application directory. |
| RSC plugins or unstable RSC route APIs | Read [other modes](references/other-modes.md) and the installed RSC docs before editing those boundaries. |

Keep the existing mode unless a migration is part of the requested work. A Vite SPA is not automatically a React Router Framework app, and Data Mode does not require a framework plugin or file-based routes. Do not upgrade packages to make a copied example compile.

Read task-relevant docs from `node_modules/react-router/docs/` when the installed package includes them. Otherwise use the official docs for that package version, not unreleased `main`. Respect a doc's mode marker when present.

| Task | Docs relative to `node_modules/react-router/docs/` |
|---|---|
| Routing, layout, lazy modules and route types | `start/data/routing.md`, `start/data/route-object.md` |
| Loaders and actions | `start/data/data-loading.md`, `start/data/actions.md` |
| Pending forms and fetchers | `start/data/pending-ui.md`, `how-to/fetchers.md`, `explanation/form-vs-fetcher.md` |
| URL state and navigation | `start/data/navigating.md`, `how-to/search-params.md` |
| Errors, concurrency or tests | `how-to/error-boundary.md`, `explanation/race-conditions.md`, `start/data/testing.md` |

## Extend the existing route tree

In a vite-dashboard-derived project, routes belong in `src/router.tsx`, path constants in `src/config/routes.ts`, and navigation in `src/config/navigation.ts`. Follow `frontend/app-shell` for page containers, layout, breadcrumbs and shared states; follow `javascript/domain-driver` when scaffolding a feature or operation. These are project conventions, not mandatory paths for other apps.

- Keep a single application router outside component render. Extend shared layouts through child routes and `Outlet`, so navigation does not remount the shell unnecessarily.
- Match the tree's existing `element` or `Component` style. Route-module generated `Route.*` types belong to Framework Mode; use the installed Data Mode types in a data router.
- Use index children for default child content and a deliberate fallback for unknown paths. Keep route matching fields available when splitting route implementation with `lazy`; check the installed version's supported shape.
- Use the project's route constants or typed path builder for links and redirects. A new feature does not need another router or a parallel path registry.

## Keep one owner for each request

First inspect how the affected feature loads and changes data. In the domain-driver React stack, the normal chain is container/component -> action hook -> shared API client -> external API. Preserve that chain for hook-owned features; adding a route does not justify moving their requests into loaders or actions.

When the task calls for route-owned data, or the feature already uses it:

- Use a loader for route reads and an action for route mutations, reusing the existing API client and schemas. Call ordinary functions from them, never React hooks.
- A request belongs to the loader/action or to the feature hook. Do not fetch the same data in both, create a second cache, or wrap a hook mutation with another submission that sends it twice.
- Let router actions revalidate their loader data by default. If a feature deliberately combines router and external cache ownership, define which owner refreshes each result; router revalidation does not refresh unrelated hook state automatically.
- Forward `request.signal` when the API client supports cancellation. Cancellation and stale-response handling improve client correctness; they do not roll back a mutation already received by the server.

In a browser-only Vite app, route loaders and actions still execute in the browser. Keep database access, credentials and authorization on the external API. A route guard changes navigation, not the API's security boundary.

## Navigation, forms and URL state

- Use `Link` for internal destinations and `NavLink` for active navigation. Use imperative navigation for event-driven transitions; use loader/action redirects when those handlers own the operation. Keep full-document links for external destinations or intentional reloads.
- Validate route parameters and search parameters with the project's schemas. URL values are untrusted strings and may be absent or repeated. Preserve unrelated query values when changing a filter or tab, and choose push versus replace deliberately so Back behaves sensibly.
- Keep return destinations within the application's allowed origin/path rules. In vite-dashboard-derived projects reuse `safeRedirectPath()` from `src/lib/redirect.ts` when it exists, rather than introducing another redirect parser.
- For router-owned submissions, a GET `Form` suits shareable search/filter state, a mutation `Form` suits navigation after submission, and `useFetcher` suits mutations that stay on the page. Declarative routers do not support these data APIs.
- Show router pending state from `useNavigation` or the relevant fetcher only for router-owned work; hook-owned work uses its hook's state. Pending controls must prevent accidental duplicate submission. Optimistic state needs a failure/reconciliation path.

## Errors and verification

Keep expected validation errors beside the form. Route failures need a usable boundary inside the right layout, with a recovery path and no leaked internal details. In a SPA, rendering a not-found or error screen does not by itself set an HTTP response status at the hosting server.

Use the existing test runner and router test helpers appropriate to the installed version. For a route change, exercise the actual nested tree with an in-memory router where practical: direct entry, navigation and Back, parameters, retained search state, and the affected pending/error behaviour. When a request owner changes, verify one request per operation and correct refresh after success. Browser-only authorization checks are not evidence that API authorization works.

Adapted from [the official React Router skill](https://github.com/remix-run/react-router/tree/8f364c820ef698952e4bed876d6c93c895357692/.agents/skills/react-router), including its Data, Framework and Declarative guidance. This adaptation adds existing feature ownership and vite-dashboard conventions. Upstream copyright and MIT terms are preserved in [LICENSE](LICENSE). API details come from the installed version's docs or [version-matched official documentation](https://reactrouter.com/).
