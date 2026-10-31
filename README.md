# Vite Dashboard Starter

React 19, TypeScript, Vite, react-router, and shadcn/ui (Base UI), with the
auth screens built and a dashboard frame you can swap in one line.

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # vitest; pnpm test:coverage for a report
pnpm build
```

There is no API. The auth screens are UI only: every button navigates to the
next screen, and nothing is sent anywhere.

## Auth screens

Each screen is its own domain-driver feature in `src/features/auth/`.

| Route                   | Feature folder         | Main button goes to                         |
| ----------------------- | ---------------------- | ------------------------------------------- |
| `/login`                | `login`                | `/dashboard`                                |
| `/register`             | `register`             | `/verify-email`                             |
| `/verify-email`         | `verify-email`         | "I've verified my email" → `/dashboard`     |
| `/forgot-password`      | `forgot-password`      | `/reset-password` (stands in for the email) |
| `/reset-password`       | `reset-password`       | `/login`, with a "password reset" banner    |
| `/two-factor-challenge` | `two-factor-challenge` | `/dashboard`                                |
| `/confirm-password`     | `confirm-password`     | the `?redirect=` page, else `/dashboard`    |

Every screen links back to login, and "Log out" in the dashboard's user menu
goes to `/login`. `/` opens the login screen.

Nothing is guarded yet, so every page opens directly. When you add an API,
put the request in each container's submit handler (scaffold it with
`npx domain-driver --root src/features/auth make:action <screen>/User <action>`)
and add route guards in `src/router.tsx`.

## Swapping the dashboard shell

Every page after login renders inside a shell. There are three, all with the
same props and all reading `src/config/navigation.ts`:

| Shell          | shadcn block | Looks like                                                                                                    |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `InsetShell`   | `sidebar-08` | Page floats as a rounded inset panel; collapsible nav sections                                                |
| `RailShell`    | `sidebar-09` | ChatGPT-style: icon rail picks a section (no navigation), panel lists its pages; collapse button in the panel |
| `ClassicShell` | `sidebar-03` | Full-height sidebar with every section and its pages listed open                                              |

Change the one import in `src/layouts/dashboard-layout.tsx`:

```tsx
import { RailShell as DashboardShell } from "@/components/shells"
```

Add, rename or reorder nav items in `src/config/navigation.ts` and every shell
picks them up. Add the matching route in `src/router.tsx`. The name and email
in the user menu come from `placeholderUser` in `src/config/app.ts`.

## Adding features

Scaffold with [domain-driver](https://www.npmjs.com/package/domain-driver); see
`.agents/skills/javascript-domain-driver/SKILL.md`. For a nested feature such
as another auth screen:

```bash
npx domain-driver --root src/features/auth make:feature two-factor-setup
```

Add shadcn components with `pnpm dlx shadcn@latest add <name>`.
