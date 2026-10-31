import { Outlet } from "react-router"

// Pick the dashboard frame here. Change `InsetShell` to `RailShell` or
// `ClassicShell`; nothing else needs to change.
import { RailShell as DashboardShell } from "@/components/shells"

export function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  )
}
