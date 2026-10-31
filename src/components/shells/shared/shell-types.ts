import type * as React from "react"

// Every shell takes the same props, so DashboardLayout can swap one for
// another without touching anything else.
export interface ShellProps {
  children: React.ReactNode
}
