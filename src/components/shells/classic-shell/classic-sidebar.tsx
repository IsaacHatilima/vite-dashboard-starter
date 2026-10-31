import { Link } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { mainNavigation } from "@/config/navigation"
import { useActiveNavigation } from "../shared/active-navigation"
import { useCloseMobileSidebarOnNavigate } from "../shared/sidebar-state"
import { ShellBrand } from "../shared/shell-brand"
import { ShellUserMenu } from "../shared/shell-user-menu"

export function ClassicSidebar() {
  useCloseMobileSidebarOnNavigate()
  const active = useActiveNavigation()

  return (
    <Sidebar>
      <SidebarHeader>
        <ShellBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavigation.map((section) => (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton
                  render={<Link to={section.url} className="font-medium" />}
                >
                  {section.title}
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {section.items.map((item) => {
                    const itemActive = active.item?.url === item.url
                    return (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          isActive={itemActive}
                          render={
                            <Link
                              to={item.url}
                              aria-current={itemActive ? "page" : undefined}
                            />
                          }
                        >
                          {item.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ShellUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
