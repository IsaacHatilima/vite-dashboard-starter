import { GalleryVerticalEndIcon } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { appConfig } from "@/config/app"
import { routes } from "@/config/routes"

interface ShellBrandProps {
  showTagline?: boolean
  className?: string
}

export function ShellBrand({ showTagline = true, className }: ShellBrandProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={cn("h-8 max-md:h-10", className)}
          render={<Link to={routes.dashboard} />}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{appConfig.name}</span>
            {showTagline && (
              <span className="truncate text-xs">{appConfig.tagline}</span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
