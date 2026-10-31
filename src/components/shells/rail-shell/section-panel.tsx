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
import { ICON_STROKE_WIDTH } from "./icon-stroke"

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
        <h2 className="truncate text-[17px] leading-6 font-semibold">
          {section.title}
        </h2>
        {/* aria-expanded reports the sidebar's state, so cancel the ghost
            button's open look: ChatGPT shows a bare icon until hovered. */}
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Toggle sidebar"
          aria-expanded={open}
          className="rounded-md text-sidebar-muted-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-muted-foreground hover:aria-expanded:bg-muted hover:aria-expanded:text-foreground"
          onClick={() => {
            onToggle?.()
            toggleSidebar()
          }}
        >
          <PanelLeftIcon strokeWidth={ICON_STROKE_WIDTH} className="size-5" />
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
                        // ChatGPT marks the current page by its fill alone.
                        className="h-9 data-active:font-normal"
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
