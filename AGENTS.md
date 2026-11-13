# Agent guide

React 19, TypeScript, Vite, react-router, and shadcn/ui on Base UI. `README.md` covers the screens, shells, and theming.

## Checks

`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass before a change is done.

## Features

- Each feature lives in `src/features/<feature>/`. Scaffold it with domain-driver before writing a file by hand: `pnpm exec domain-driver make:feature <feature>/<Entity> -a`. An operation other than List, Show, Create, Update, or Delete is `make:action <feature>/<Entity> <action>`. A nested feature takes `--root`, such as `--root src/features/auth`.
- The generated schemas use `zod`. Parse request bodies and API responses with them, and derive the feature's types with `z.infer`.
- Code that every feature shares, such as an API client, lives once in `src/lib/`.
- Routes are registered in `src/router.tsx`.

## UI

- `src/components/ui/` holds the shadcn components (`pnpm dlx shadcn@latest add <name>`). Reuse them before writing new ones.
- A dialog that becomes a bottom sheet on phones uses `ResponsiveDialog` from `src/components/ui/responsive-dialog.tsx`. Its parts render a centered `Dialog` from 768px up and a `Drawer` that swipes down below it, so the content is written once.
- `useIsMobile()` in `src/hooks/use-mobile.ts` is the one phone-width check.

## Agent skills

The agent skills and the factory aren't kept in this repository. Install them from [IsaacHatilima/skills](https://github.com/IsaacHatilima/skills): `install web` for your account, or `install web --project .`, which adds its own section to this file.
