import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { mainNavigation, secondaryNavigation } from "@/config/navigation"
import { useCloseMobileSidebarOnNavigate } from "../shared/sidebar-state"
import { ShellBrand } from "../shared/shell-brand"
import { ShellUserMenu } from "../shared/shell-user-menu"
import { InsetNavMain } from "./inset-nav-main"
import { InsetNavSecondary } from "./inset-nav-secondary"

export function InsetSidebar() {
  useCloseMobileSidebarOnNavigate()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <ShellBrand />
      </SidebarHeader>
      <SidebarContent>
        <InsetNavMain sections={mainNavigation} />
        <InsetNavSecondary links={secondaryNavigation} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <ShellUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
