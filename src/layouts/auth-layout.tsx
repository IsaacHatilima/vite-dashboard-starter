import { Outlet } from "react-router"

// Pick the auth frame here: SplitAuthShell, CardAuthShell, MinimalAuthShell,
// or PhotoAuthShell. Every auth screen uses the same forms in every variant.
import { SplitAuthShell as AuthShell } from "@/components/auth-shells"

export function AuthLayout() {
  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  )
}
