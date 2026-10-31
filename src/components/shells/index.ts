// Dashboard shells. All three take the same props and read navigation from
// config/navigation.ts, so any one can replace another in DashboardLayout.
//
//   InsetShell   – sidebar-08: page floats as an inset panel, collapsible sections
//   RailShell    – sidebar-09, ChatGPT-style: rail icons pick a section (they don't
//                  navigate); the panel lists its pages and holds the collapse button
//   ClassicShell – sidebar-03: full-height sidebar with every section listed open
export { ClassicShell } from "./classic-shell/classic-shell"
export { InsetShell } from "./inset-shell/inset-shell"
export { RailShell } from "./rail-shell/rail-shell"
export type { ShellProps } from "./shared/shell-types"
