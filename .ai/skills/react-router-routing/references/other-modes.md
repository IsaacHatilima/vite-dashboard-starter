# Other React Router modes

Read this only when the application uses one of these modes or the requested task explicitly changes modes. The main skill's URL validation, request ownership and security boundaries still apply.

## Declarative Mode

Keep the existing `BrowserRouter`/`HashRouter` and JSX route tree. Shared layout routes render an `Outlet`; links and search parameters work without a data router.

Use the installed docs under `react-router/docs/start/declarative/` for routing, navigation and URL values. Keep the project's existing feature hooks for API reads, mutations and their pending state. A CRUD screen or API-backed form does not inherently require a router migration.

`loader`, `action`, `useFetcher`, `useNavigation` and router `Form` require a Data or Framework router. If the task explicitly requires those APIs, define the migration and its affected request ownership before changing the root router. Do not transplant these APIs into a declarative tree.

## Framework Mode

Read the configured application directory and route convention instead of assuming `app/`. Follow the existing manual route configuration or filesystem routing. Read these installed docs only as the task needs them:

| Change | Docs relative to `node_modules/react-router/docs/` |
|---|---|
| Routes, modules and generated types | `start/framework/routing.md`, `start/framework/route-module.md`, `how-to/route-module-type-safety.md` |
| Reads and writes | `start/framework/data-loading.md`, `start/framework/actions.md` |
| SSR, SPA or pre-rendering | `start/framework/rendering.md`, `how-to/spa.md`, `how-to/pre-rendering.md` |
| Sessions or middleware | `explanation/sessions-and-cookies.md`, `how-to/middleware.md` |

Use the generated `Route.*` types for route-module arguments and props; do not edit generated type files. Server loaders/actions and browser `clientLoader`/`clientAction` have different execution boundaries. Keep server-only imports and secrets out of browser modules. Check the existing rendering configuration before assuming a server runtime is available: a Framework SPA build cannot execute a server action at runtime without a server deployment.

Use the module's existing data/submission ownership. Preserve its rendering strategy unless the requested change includes deployment and runtime changes. Middleware and context APIs depend on installed versions and enabled flags; consult those docs instead of copying an unstable example.

## React Server Components

Detect the actual RSC plugin, entries and route APIs before choosing guidance. Read `react-router/docs/how-to/react-server-components.md` for the installed version, together with the matching Framework or Data docs. Preserve the project's server/client module boundaries. Do not enable unstable RSC features as part of ordinary routing or Vite configuration work.
