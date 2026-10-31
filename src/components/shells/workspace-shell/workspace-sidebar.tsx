import { ArrowUpRightIcon, UsersIcon } from "lucide-react"
import { Link } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { mainNavigation } from "@/config/navigation"
import { routes } from "@/config/routes"
import { useActiveNavigation } from "../shared/active-navigation"
import { useCloseMobileSidebarOnNavigate } from "../shared/sidebar-state"
import { ShellBrand } from "../shared/shell-brand"
import { ShellUserMenu } from "../shared/shell-user-menu"

export function WorkspaceSidebar() {
  useCloseMobileSidebarOnNavigate()
  const active = useActiveNavigation()

  return (
    <Sidebar variant="inset" collapsible="icon" className="p-2">
      <SidebarHeader className="mb-3 p-1">
        <ShellBrand />
      </SidebarHeader>
      <SidebarContent className="gap-3">
        <nav aria-label="Workspace navigation">
          {mainNavigation.map((section) => (
            <SidebarGroup key={section.title} className="px-2 py-1">
              <SidebarGroupLabel className="text-[10px] font-medium tracking-wider uppercase">
                {section.title}
              </SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const isActive = active.item?.url === item.url
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        className="h-9 gap-3 border border-transparent data-active:border-border data-active:bg-card data-active:shadow-xs [&>svg]:stroke-[1.5] [&>svg]:text-sidebar-muted-foreground"
                        render={
                          <Link
                            to={item.url}
                            aria-current={isActive ? "page" : undefined}
                          />
                        }
                      >
                        <section.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-2">
        <Link
          to={routes.invitations}
          className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm shadow-xs outline-none group-data-[collapsible=icon]:hidden hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-2 font-medium">
            <UsersIcon className="size-4 text-muted-foreground" />
            Your workspace
          </span>
          <span className="text-xs text-muted-foreground">
            Bring your team together.
          </span>
          <span className="flex items-center gap-1 text-xs font-medium">
            Invite members
            <ArrowUpRightIcon className="size-3" />
          </span>
        </Link>
        <ShellUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
