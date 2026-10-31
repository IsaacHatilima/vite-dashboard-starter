# Gr8r typography, density, and icon measurements

Measured on 2026-10-31 from the deployed [Gr8r reference](https://gr8r-taskmanagement.vercel.app/), using its served CSS and live computed styles at 1280 × 800. Home and Settings were sampled. These are observed values, rather than estimates from screenshots.

## Measured scale

| Role | Reference value | Starter application |
| --- | --- | --- |
| Sans font | Geist, weights 400 / 500 / 600; navigation 450 | Locally bundled Geist Variable |
| Monospace font | Geist Mono | Locally bundled Geist Mono Variable |
| Body and navigation | 13.5px, 1.45 line height (19.575px) | `text-sm` and body defaults |
| Controls, breadcrumbs, field labels | 12.5px, controls/labels weight 500 | `--font-size-control` / `text-control` |
| Small text and controls | 12px | `text-xs` |
| Group labels | 11px, weight 600, 0.06em tracking | `--font-size-label` / `text-label` |
| Form/dialog subheadings | 14.5px, weight 600 | `text-base` |
| Larger headings | 16px / 19px / 23px | `text-lg` / `text-xl` / `text-2xl` |
| Desktop controls | 22 / 26 / 30 / 36px heights | xs / sm / default / lg control tokens |
| Default button | 30px high, 11px horizontal padding, 6px gap | Shared Button default |
| Small button | 26px high, 8px horizontal padding | Shared Button small |
| Input | 30px high, 10px horizontal padding | Shared Input and InputGroup |
| Field rhythm | 6px label gap; 14px form gap | Shared Field / FieldGroup |
| Primary navigation | 30px rows, 8px horizontal padding, 9px icon gap | Shared Sidebar rows |
| Group heading and separation | 24px heading; 14px between groups | Settings and app navigation groups |
| Header | 46px; 50px below 640px | `--app-header-height` in all four shells |
| Page gutters | 24px; 16px at or below 900px | `--app-gutter` |
| Page top space | 28px; 20px at or below 900px | `--app-page-top` |
| Panel spacing | Header 12px / 14px / 10px, body 14px | Shared Card uses a 14px rhythm |
| Dialog spacing | Body 14px / 16px; footer 12px / 16px | Retained 16px horizontal padding; 14px gap and 12px footer padding |
| Icons | 16px primary, 14px supporting, 12px metadata; 1.8px stroke | Role-based component sizes; shared Lucide stroke |

The reference's CSS tokens expose the same scale (`--fs`, `--fs-sm`, `--side-row`, `--h-md`, `--gutter`, and `--topbar-h`). Live Home navigation measured 30px rows with 9px gaps. The Settings panel measured the same typography and row geometry, with 11px/600 group labels.

## Intentional adaptations

- Keep the starter's tuned light/dark palette, distinct shell structures, RailShell's 52px rail plus 288px panel, floating StackedCard treatment, and established overlay behavior.
- Primary sidebars use the reference's 252px width. Workspace's companion panel follows the shared header height so its sticky position and bottom edge stay aligned.
- Collapsed Workspace navigation keeps 32px icon squares; the 30px row token applies to expanded desktop navigation.
- Phone controls retain 40px targets, and phone text inputs remain 16px. Password groups keep their bordered wrapper and reveal action aligned at both densities.
- The root rem base stays 16px, preserving Tailwind's spacing grid. Explicit typography tokens supply the smaller text scale.
- Sonner inherits the app font instead of its library's system-font default, while retaining bottom-centre placement.
- Use distinct page icons for Overview, Analytics, Reports, Projects, Archived projects, Members, and Invitations. This also keeps collapsed Workspace navigation recognizable.
- Keep semantic and functional icons: section selectors, settings types, search, password visibility, theme choices, disclosure, close, and assistant actions. Remove repeated section glyphs, decorative internal-link arrows, and the assistant's redundant hero decoration.
- Typography utilities and shared spacing change centrally; route behavior, form handling, focus management, stack flags, and modal/non-modal behavior remain component responsibilities.

## Evidence and scope

Primary deployed assets:

- [Stylesheet](https://gr8r-taskmanagement.vercel.app/assets/index-BAaun9PB.css), served SHA-256 `181797773710fa8db652d2963c0a7fce8256b1adcfe0a3104c5f55480523f7e9`.
- [Application bundle](https://gr8r-taskmanagement.vercel.app/assets/index-BhWzXQlV.js), served SHA-256 `df84605cc73f78c8a870fccbae2fb288beb49e893d30090d3300a9fd24c1645b`.

Typography and spacing values above come from the browser's CSSOM and computed styles. The source repository/commit was not supplied; the deployed assets establish the observed styling, rather than an assumed upstream source version.

REA statically parsed the captured JavaScript as inert text: parent Evidence `ev_bff143451d4be760dd5aa856ee22e05678647b5abfadfd59e5b91c95eeb6e628`, summary Evidence `ev_62790cb9cd747064bf0fcff19cbd7ef5af51f169f8683678097c991fdd0dd00c`. The captured snapshot adds one terminal newline; its application-bundle SHA-256 is `6f8ba4885bbd940cbbff34e680aa04afdc53212a07cc2bcf2381d72ceb9ee45b`. The static graph is partial because semantic node/unknown budgets were bounded. It does not prove runtime execution or reconstruct every feature. No upstream application code is copied into this starter.

Runtime checks should verify actual font loading, compiled spacing, wrapping, mobile input geometry, collapsed navigation, and overlay focus/scroll behavior. Static class names alone do not establish visual fidelity.

## Verification

- 146 focused existing tests pass, covering shells, settings, auth routes, password/numeric inputs, Dialog, Sheet, and Drawer. Typecheck, scoped lint/formatting, production build, and diff checks pass.
- Isolated Chrome verifies four shells at 1440px, 768px, and 390px in both themes: 24 shell cases. Geist and Geist Mono are loaded and used; header, gutter, navigation, input, field, and Card measurements match the scale above.
- Additional checks cover six control-density probes, 12 auth cases at 390px/320px in both themes, and 14 overlay regressions. Password reveal, numeric filtering, floating cards, drawer nesting/frame, and modal distinctions remain functional.
- Keyboard theme selection/persistence/focus return and collapsed Rail settings entry pass. Seven distinct Workspace page icons remain usable when collapsed.
- Sonner computes Geist at 13.5px and remains bottom-centred on desktop and phone. No uncaught runtime exceptions were observed.
