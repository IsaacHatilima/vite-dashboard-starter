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

Every page after login renders inside a shell. There are four, all with the
same props and all reading `src/config/navigation.ts`:

| Shell            | shadcn block | Looks like                                                                                                            |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `InsetShell`     | `sidebar-08` | Page floats as a rounded inset panel; collapsible nav sections                                                        |
| `RailShell`      | `sidebar-09` | ChatGPT-style: icon rail picks a section (no navigation), panel lists its pages; collapse button in the panel         |
| `ClassicShell`   | `sidebar-03` | Full-height sidebar with every section and its pages listed open                                                      |
| `WorkspaceShell` | Custom       | Full navigation, top toolbar, inset page and a collapsible assistant panel, based on the supplied workspace reference |

Change the one import in `src/layouts/dashboard-layout.tsx`:

```tsx
import { WorkspaceShell as DashboardShell } from "@/components/shells"
```

`WorkspaceShell` is the active variant. Its toolbar searches the shared page
navigation with Cmd/Ctrl+K. The assistant docks beside the page at 1280px and
above; on smaller screens it opens as a drawer. The starter panel offers page
shortcuts and a disabled composer: it has no assistant service connected.
Replace its content through the optional `assistant` prop when integrating your
own assistant or contextual tools:

```tsx
<WorkspaceShell assistant={<YourAssistant />}>
  <Outlet />
</WorkspaceShell>
```

Keep conversation and draft state above the shell if it should survive closing
the panel or switching between its docked and drawer layouts.

Add, rename or reorder nav items in `src/config/navigation.ts` and every shell
picks them up. Add the matching route in `src/router.tsx`. The name and email
in the user menu come from `placeholderUser` in `src/config/app.ts`.

## Cards

`Card` keeps its standard shadcn composition and accepts `border`, which defaults
to `true`. Use `<Card border={false}>` to remove its outer outline.

`StackedCard` adds a muted backing surface with composable sections. Enable its
header with `top`, its footer with `bottom`, or both. Both flags default to
`false`; disabled sections render nothing. `StackHeader` and `StackFooter`
accept any React children, including buttons and inputs. `StackContent` is the
raised inner Card and accepts the standard Card props and parts:

```tsx
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  StackedCard,
  StackHeader,
  StackContent,
  StackFooter,
} from "@/components/ui/stacked-card"

<StackedCard top bottom>
  <StackHeader>Sales trend</StackHeader>
  <StackContent>
    <CardHeader>
      <CardTitle>Revenue</CardTitle>
    </CardHeader>
    <CardContent>Your chart or other content</CardContent>
  </StackContent>
  <StackFooter>
    <span>Monthly overview</span>
    <Button size="sm">Export</Button>
  </StackFooter>
</StackedCard>
```

Normal div attributes, refs, and `className` apply to the outer frame and bands.
Place siblings in a stretching grid (`grid auto-rows-fr items-stretch`) to give
them equal overall heights. `StackContent` expands into the space left when a
header or footer is absent. The dashboard shows all three combinations with
working controls in both themes.

## Dialogs

The dashboard includes a `StickyFooterDialog` example using the existing shadcn
Dialog parts and the documented [sticky-footer pattern](https://ui.shadcn.com/docs/components/base/dialog#sticky-footer).
Only the content region scrolls; the header, close control, and footer remain
visible inside a popup bounded to the viewport. Escape and the footer's Close
button dismiss it and return focus to the trigger.

When composing another dialog, put `overflow-y-auto` and a maximum height on the
body region, with `min-h-0` inside a height-constrained flex column. Keep
`DialogHeader` and `DialogFooter` as non-scrolling siblings. The shared Dialog
primitive is unchanged, so other dialogs can still use their own layouts.

## Adding features

Scaffold with [domain-driver](https://www.npmjs.com/package/domain-driver); see
`.agents/skills/javascript-domain-driver/SKILL.md`. For a nested feature such
as another auth screen:

```bash
npx domain-driver --root src/features/auth make:feature two-factor-setup
```

Add shadcn components with `pnpm dlx shadcn@latest add <name>`.
