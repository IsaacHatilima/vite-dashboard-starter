---
name: vite-configuration
description: Use when adding, changing, or diagnosing Vite configuration, aliases, plugins, client environment variables, asset imports, development proxying, or production builds in a Vite application, especially a React and TypeScript SPA.
---

# Vite configuration

Applies to: `vite.config.*`, related TypeScript and Vitest configuration, and code relying on Vite's build-time features. Project guidance wins over these defaults.

## Start with the installed project

Read `package.json`, the lockfile, `vite.config.*`, the relevant `tsconfig` files and any `vitest.config.*`. Identify the installed Vite, React plugin and Vitest versions, package manager, scripts, Node runtime and rendering mode before choosing an API. Check the installed packages' engine requirements when a command fails before the app or tests start; a tool's minimum Node version does not establish compatibility for every dependency.

For a React 19 and TypeScript SPA such as vite-dashboard, keep its ESM config and existing `react()` and `tailwindcss()` plugins. Other projects keep their chosen framework and plugin stack. Make the required change in the existing config instead of replacing it with a generic example. A configuration task does not imply a dependency upgrade, package-manager switch, SSR adoption, or migration to a different framework.

Vite 8 uses Rolldown and Oxc; older Vite releases have different option names and behavior. Use documentation for the installed major and package types for the precise option. For example, Vite 8's `build.rolldownOptions` and `oxc` are not instructions to rename options in a Vite 7 project. Migrate deprecated options when an upgrade or configuration change calls for it, with the matching migration guide.

## Keep resolution and project structure coherent

- Preserve the existing ESM setup; prefer `defineConfig` and `vite.config.ts` for a new TypeScript config. Keep the project's working config format unless the task requires changing it.
- Keep `@` and other aliases consistent between Vite's runtime resolution and TypeScript's `paths`. When using `resolve.alias` for a filesystem path, use an absolute replacement. Reuse an existing alias plugin or supported `resolve.tsconfigPaths` setup instead of introducing a competing resolver. A TypeScript `paths` entry alone does not guarantee runtime resolution.
- Keep Vitest's environment, setup files, test selection and coverage rules. A separate `vitest.config.*` takes precedence over `vite.config.*`; share or merge the needed Vite config explicitly when splitting them, so tests retain aliases and plugins.
- Feature layout and page composition belong to `javascript/domain-driver` and `frontend/app-shell`. In the React SPA, feature hooks call the API; backend services, repositories and secrets stay behind it. A Vite development proxy is not a backend or an authorization boundary.

## Configure only the behavior the task needs

- Keep established ports, proxy targets, `base`, browser targets and output directories. Derive any required change from the deployment or API contract; sample values are not project defaults. Preserve React Router's deployment base and the host's SPA fallback when changing public paths.
- Keep browser code on `import.meta.env`. Values exposed through the default `VITE_` prefix are public and bundled into client code; custom `envPrefix` and `define` can expose values too. Never put secrets there or serialize the whole environment into `define`. Do not dump environment files or values into logs, reports or generated examples. Use `loadEnv` only when config evaluation needs it, and select the specific values needed.
- Custom environment variables are strings unless explicitly converted; parse values such as flags and numeric limits rather than treating `"false"` as a boolean. Preserve existing environment typing and validation.
- Use the existing asset conventions. Imported assets participate in Vite's build; files in `public/` are served and copied without transformation. Use `?raw`, `?url` or `import.meta.glob` when their behavior is needed, and check the installed Vite API before changing glob or asset options.
- Investigate the actual cause of dependency, HMR or build failures before adding plugins, changing optimization settings, clearing caches, or excluding dependencies. Custom plugin hooks, library mode and multi-environment APIs belong only in tasks that need those capabilities.

## Verify the affected paths

Run the project's existing scripts with its package manager. For vite-dashboard these are `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`; other projects use their own scripts. Vite transpiles TypeScript without type checking, so a successful Vite build alone does not prove the types pass.

For resolution changes, check both the app build and test runner. For `base`, proxy or asset changes, verify the affected URL and direct route load in the appropriate environment. Use the production build for production-only behavior; `vite preview` is a local preview, not a production server. Report which behavior was actually exercised and any remaining runtime or deployment gap.

## Sources

Adapted from [Anthony Fu's Vite skill](https://github.com/antfu/skills/blob/4a6bb39e7b45e26402eb215393c51ccf5df1ca4c/skills/vite/SKILL.md), pinned to `antfu/skills` commit `4a6bb39e7b45e26402eb215393c51ccf5df1ca4c` (upstream guidance for Vite 8.3.5). Its MIT notice is preserved in `LICENSE`.

Check the version-matched official documentation when applying an API: [configuration](https://vite.dev/config/), [shared options](https://vite.dev/config/shared-options), [environment and modes](https://vite.dev/guide/env-and-mode), [features](https://vite.dev/guide/features), [Vite 8 migration](https://vite.dev/guide/migration), [builds](https://vite.dev/guide/build), [static deployment](https://vite.dev/guide/static-deploy), and [Vitest configuration](https://vitest.dev/config/).
