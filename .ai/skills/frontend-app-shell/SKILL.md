---
name: frontend-app-shell
description: Use when building or reviewing the frame around a web app's screens - choosing or changing the dashboard or auth shell, adding a page with its route, navigation item and breadcrumbs, the user menu and settings, page layout and density, or page-level loading, empty and error states - especially in projects built on the vite-dashboard starter.
---

# App shell

Applies to: the frame every screen shares, signed-in and auth. The reference implementation is [vite-dashboard-starter](https://github.com/IsaacHatilima/vite-dashboard-starter) (React 19, Vite, react-router, shadcn/ui on Base UI, Tailwind v4). A project created from it keeps its shells, components and tokens: extend them, never build a parallel frame. Projects on another stack (Laravel/Inertia, Next, TanStack Start) follow the same structure and values. Project guidance wins. What opens over a page is in `overlays`, tables and charts in `data-display`, and colour in `brand/identity`.

## Shells

The starter has four dashboard shells. Each takes only `children` (`ShellProps`) and reads the same navigation, so a project switches with one import in `src/layouts/dashboard-layout.tsx`:

| Shell | Frame |
|---|---|
| `WorkspaceShell` | Full navigation, a toolbar with app-wide search, the page inset, and an assistant panel docked from 1280px and a drawer below |
| `InsetShell` | The page floats as a rounded inset panel beside collapsible navigation sections |
| `RailShell` | A 52px icon rail picks a section and a 288px panel lists its pages |
| `ClassicShell` | A full-height sidebar with every section and page listed open |

Auth screens use one of four frames in `src/layouts/auth-layout.tsx`: `SplitAuthShell` (form beside a photo), `CardAuthShell`, `MinimalAuthShell` and `PhotoAuthShell` (form over a full-page photo). Forms sit in the shared `AuthCard`, which adapts to the frame so cards never nest.

- Change a shell in `src/components/shells/`, keeping its props identical so the others still swap in. Shared pieces (header, brand, user menu, skip link, sidebar state, active navigation) live in `shells/shared/`.
- Never fork a shell for one page or wrap a page in its own sidebar. A page that needs a different frame is a new shell with the same props and navigation.

## Adding a page

1. Scaffold the feature with domain-driver (`npx domain-driver make:feature <feature>`). The page is the feature's container, `containers/<Entity>Container.tsx`, a default export that composes its components.
2. Add the path to `src/config/routes.ts` and the route to `src/router.tsx` under `DashboardLayout` (or `AuthLayout`). Never hard-code a path elsewhere.
3. Add the item to `mainNavigation` in `src/config/navigation.ts`: a section with its items, optional groups, and a distinct Lucide icon for every page, so collapsed navigation stays recognisable. Breadcrumbs, the active state and app search all come from this list. Settings pages go in `settingsNavigationGroups`.
4. Set the tab title with `<PageTitle title="…" />`. The header's breadcrumbs name the page (section, then page); the page keeps one `h1`, visually hidden (`sr-only`) unless its layout needs a visible title.
5. Unbuilt destinations use `PlaceholderPage` rather than a dead link.

## Routes and redirects

- `/` opens login, and a successful sign-in goes to `/dashboard`. Once a session exists, guard routes in `src/router.tsx`: signed-out visits to app routes go to login with a `?redirect=` back, and signed-in visits to auth routes go to the dashboard.
- Read every return path through `safeRedirectPath()` (`src/lib/redirect.ts`), which accepts only same-origin paths, so `?redirect=` can't become an open redirect.
- Unknown routes render `NotFoundPage` inside the shell, and route errors render `RouteErrorPage`.

## Density

The tokens live in `src/index.css`; components use them through utilities. Never hard-code these values, so density changes in one place.

| Token | Value |
|---|---|
| `--app-header-height` | 46px, 50px under 640px |
| `--app-gutter` | 24px, 16px at or below 900px |
| `--app-page-top` | 28px, 20px at or below 900px |
| Text | 13.5px body and navigation, 12.5px controls (`text-control`), 11px semibold group labels with 0.06em tracking (`text-label`), headings 14.5, 16, 19 and 23px |
| `--control-height-xs/sm/-/lg` | 22, 26, 30 and 36px |
| `--nav-row-height`, `--nav-item-gap` | 30px rows, 9px icon gap |
| `--field-gap` | 14px between fields; 6px label gap |
| Icons | Lucide at 16px for primary, 14px supporting, 12px metadata, with the global 1.8 stroke |

Fonts are Geist and Geist Mono, bundled locally. Phones keep 40px touch targets and 16px input text so iOS doesn't zoom. Tables, boards and calendars take the full width; forms cap near 640px and prose near 70 characters.

## Surfaces

The starter's neutrals are tuned in both themes and stay as they are: the page background, a sidebar a step darker in light and the same as the page in dark, cards with a hairline border in light and a lighter surface in dark, and translucent borders. A project's brand arrives as accents (primary, focus ring, charts, status, and one brand accent) through `brand/identity`; never tint surfaces with a brand hue.

- Use `Card` (its `border` prop removes the outline) for a separate object the user acts on, and `StackedCard` with `top` and `bottom` bands for a card with a header strip or footer actions. Group everything else with spacing and headings, never a card inside a card.
- Theme is the `.dark` class, set by the theme provider from the user's choice or the system; the `D` key toggles it outside text fields.

## Header, search and menus

- The header is sticky at `--app-header-height` on the page background, holding the sidebar toggle and the breadcrumbs. `WorkspaceShell` adds its toolbar.
- App search is the command palette on Cmd/Ctrl+K, over every page in `allNavigation`. It never filters the current page; page-level search lives in the page's toolbar.
- The user menu sits at the bottom of the sidebar: Profile, Settings, theme and Log out. Settings opens a nested layout at `/settings/*` with its own grouped navigation, never items in the main navigation.
- The sidebar is 252px wide and collapses with its toggle or Cmd/Ctrl+B, remembered in the `sidebar_state` cookie. Under 768px it becomes a drawer that closes when a link is followed.

## Page layout

- Record pages get a title row: identity and status on the left, actions on the right.
- One labelled primary action per page, at the right of the title row or toolbar. Others are icon buttons with tooltips or sit in a "…" menu.
- The toolbar is one row: tabs and filters left, search and the primary action right. Tabs live in the URL (`?view=board`), so reload keeps them.

## States

- The shell stays mounted between routes. Loading shows a `Skeleton` of the page, then progress after 10 seconds; a refresh keeps the content visible. `Spinner` is for inline actions, not pages.
- Empty states use `Empty`: say what belongs here and offer the action that adds it, or "Clear filters".
- First run points to the one key action, then a checklist ("4 of 6 complete").
- Errors say what failed and offer Retry; a no-access state says who can grant access.
- Toasts come from Sonner, bottom centre, for about 5 seconds (see `overlays`). No refresh buttons; reloading does the same.

## Keyboard

- `SkipToContent` comes first and shows on focus. Keep the `header`, `nav` and `main` landmarks the shells render.
- Shortcuts: Cmd/Ctrl+K search, Cmd/Ctrl+B sidebar, `D` theme. Single-key shortcuts never fire while typing. List them on the keyboard shortcuts settings page.
- Focus is always visible through the ring token; `scroll-padding-top` matches the header height so focus never hides under it.

Sources: [vite-dashboard-starter](https://github.com/IsaacHatilima/vite-dashboard-starter) and its density notes (`docs/design/gr8r-density.md`), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html), NN/g ([navigation](https://www.nngroup.com/articles/vertical-nav/), [breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/), [skeletons](https://www.nngroup.com/articles/skeleton-screens/)), [shadcn/ui](https://ui.shadcn.com/docs/components/sidebar), and Kole Jain's [dashboard video](https://youtu.be/Ksx9C2-3yMo) for first-run steps.
