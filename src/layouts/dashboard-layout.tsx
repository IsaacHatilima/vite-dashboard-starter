import { Outlet } from "react-router"

// Pick the dashboard frame here: WorkspaceShell, InsetShell, RailShell, or
// ClassicShell. Pages and navigation work with every variant.
import { RailShell as DashboardShell } from "@/components/shells"

export function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  )
}
