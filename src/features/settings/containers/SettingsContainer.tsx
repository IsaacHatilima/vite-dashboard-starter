import { useContext } from "react"
import { Outlet } from "react-router"

import { ShellSectionNavigationContext } from "@/components/shells/shared/section-navigation-context"
import SettingsNavigation from "@/features/settings/components/SettingsNavigation"

export default function SettingsContainer() {
  const shellHasSectionNavigation = useContext(ShellSectionNavigationContext)

  if (shellHasSectionNavigation) return <Outlet />

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">
      <SettingsNavigation />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
