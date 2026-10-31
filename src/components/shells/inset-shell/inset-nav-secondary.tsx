import type * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavLink } from "@/config/navigation"

interface InsetNavSecondaryProps extends React.ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  links: NavLink[]
}

// Small links pinned above the user menu (support, feedback).
export function InsetNavSecondary({ links, ...props }: InsetNavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.title}>
              <SidebarMenuButton size="sm" render={<a href={link.url} />}>
                <link.icon />
                <span>{link.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
