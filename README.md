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

## Swapping the auth shell

All seven auth screens share the same forms and can use any of these frames:

| Shell              | Source                         | Layout                                                                 |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------- |
| `SplitAuthShell`   | shadcn `login-02`              | Form column beside a full-height photo; photo hides on smaller screens |
| `CardAuthShell`    | shadcn `login-03`              | Centered card with the brand above                                     |
| `MinimalAuthShell` | shadcn `login-05`              | Centered unboxed form with an icon brand                               |
| `PhotoAuthShell`   | Supplied Shadcnspace reference | Floating form surface over a full-page photo                           |

Choose the frame with one import in `src/layouts/auth-layout.tsx`:

```tsx
import { SplitAuthShell as AuthShell } from "@/components/auth-shells"
```

`SplitAuthShell` is active. Each shell accepts `children`; the shared `AuthCard`
adapts its surface to the frame so forms do not end up inside nested cards.
Typography, fields, buttons, focus states, and light/dark colors use the same
components throughout. Replace `public/images/auth/workspace.jpg` to change
the photo used by the split and photo frames.

The two-factor screen uses the shared shadcn `InputOTP` from
`src/components/ui/input-otp.tsx`. Each digit has its own rounded, bordered
slot with a gap between slots. The standard input supports paste, numeric
codes, and one-time-code autofill. The auth form uses six digits and keeps
its recovery-code mode.

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

## Inputs

Use the shared `Input` from `@/components/ui/input`:

```tsx
<Input aria-label="Name" />
<Input type="password" aria-label="Password" autoComplete="current-password" />
<Input type="number" aria-label="Amount" />
<Input type="email" aria-label="Email" autoComplete="email" />
```

Text is the default. Password inputs include a Show/Hide password control;
visibility is independent for each field. The shared Input uses InputGroup
for the icon action while retaining native input refs, autocomplete, and form values.
Number inputs allow signed decimals and reject letters/exponent notation and
invalid pasted or dropped text. They default to a decimal keyboard and
`step="any"`; explicit `min`, `max`, `step`, and `inputMode` props still apply.

Email inputs allow partial typing and use native email-format validation.
Use `required` to reject an empty address. Native validation is available via
`checkValidity()` and on normal form submission; forms using `noValidate`
(including the starter's auth demos) intentionally skip submission validation.
Other native input types, refs, events, and controlled/uncontrolled props remain
available.

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

;<StackedCard top bottom>
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

Dialog behavior lives in `src/components/ui/dialog.tsx`, alongside Card and
StackedCard. Compose the shared parts anywhere in the app:

```tsx
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

;<Dialog stack>
  <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Project details</DialogTitle>
      <DialogDescription>
        Review the project and its settings.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>Your content, inputs, or other components</DialogBody>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

`stack` defaults to `false`. Enable it on `Dialog` for a layered edge, or use
`stack={false}` for the standard surface. `DialogContent` also accepts an
explicit `stack` override for existing usage.

`DialogContent` stays within the viewport. `DialogBody` scrolls while
`DialogHeader` and `DialogFooter` stay visible; each accepts arbitrary React
children. Escape and Close restore trigger focus. The overlay dims the page
without blur. The dashboard composes these same parts as a workspace-guide
example; there is no feature-specific dialog wrapper.

## Drawers

To review the examples, open `/dashboard` and scroll to **Drawers**. The
**Default drawer**, **Nested drawers**, and **Non-modal drawer** buttons open
interactive demos of each mode.

The shared Base UI drawer is installed at `src/components/ui/drawer.tsx`.
It uses the app's clear, dimmed overlay and supports the native shadcn/Base UI
props:

```tsx
<Drawer>...</Drawer>                                      // modal by default
<Drawer modal={false}>...</Drawer>                        // background stays interactive
<Drawer modal={false} disablePointerDismissal>...</Drawer> // stays open on outside presses
```

Nesting is detected automatically. Place another `Drawer` inside the parent's
`DrawerContent`; opening it stacks the parent behind it, and closing it returns
to the parent:

```tsx
<Drawer>
  <DrawerTrigger render={<Button />}>Open parent</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Parent drawer</DrawerTitle>
      <DrawerDescription>Choose an item to see its details.</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">
      <Drawer>
        <DrawerTrigger render={<Button />}>Open child</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Child drawer</DrawerTitle>
            <DrawerDescription>Item details and actions.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Back
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
    <DrawerFooter>
      <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

Import all `Drawer*` parts from `@/components/ui/drawer`. Directions use
`swipeDirection="down" | "up" | "left" | "right"`. `showSwipeHandle` enables a
handle; `snapPoints` enables vertical snap positions. Header/footer accept any
React children. Put long content in a `min-h-0 flex-1 overflow-y-auto` region
between them to keep actions visible. The body is positioned for the documented
iOS Safari overlay behavior.

## Adding features

Scaffold with [domain-driver](https://www.npmjs.com/package/domain-driver); see
`.agents/skills/javascript-domain-driver/SKILL.md`. For a nested feature such
as another auth screen:

```bash
npx domain-driver --root src/features/auth make:feature two-factor-setup
```

Add shadcn components with `pnpm dlx shadcn@latest add <name>`.
