import { cn } from "cn"
import { PanelLeftIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/config/navigation"
import { useActiveNavigation } from "../shared/active-navigation"

interface SectionPanelProps {
  section: NavSection
  className?: string
  // Runs just before the header button collapses (or re-docks) the sidebar.
  onToggle?: () => void
  onNavigate?: () => void
}

// A section's pages: the links that navigate. Rendered docked beside the rail,
// or as the floating card a collapsed rail shows.
export function SectionPanel({
  section,
  className,
  onToggle,
  onNavigate,
}: SectionPanelProps) {
  const active = useActiveNavigation()
  const { open, toggleSidebar } = useSidebar()

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-col text-sidebar-foreground",
        className
      )}
    >
      <SidebarHeader className="flex-row items-center justify-between py-2 pr-2.5 pl-4">
        <h2 className="truncate text-base">{section.title}</h2>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Toggle sidebar"
          aria-expanded={open}
          className="text-muted-foreground"
          onClick={() => {
            onToggle?.()
            toggleSidebar()
          }}
        >
          <PanelLeftIcon className="size-5" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <nav aria-label={`${section.title} pages`}>
              <SidebarMenu>
                {section.items.map((item) => {
                  const itemActive = active.item?.url === item.url
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={itemActive}
                        className="h-9"
                        render={
                          <Link
                            to={item.url}
                            aria-current={itemActive ? "page" : undefined}
                            onClick={onNavigate}
                          />
                        }
                      >
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  )
}
