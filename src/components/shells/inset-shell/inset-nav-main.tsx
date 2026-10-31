import { ChevronRightIcon } from "lucide-react"
import { Link } from "react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/config/navigation"
import { useActiveNavigation } from "../shared/active-navigation"

interface InsetNavMainProps {
  sections: NavSection[]
}

// Collapsible sections; the one holding the current page starts open.
export function InsetNavMain({ sections }: InsetNavMainProps) {
  const active = useActiveNavigation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {sections.map((section) => {
          const sectionActive = active.section?.title === section.title
          return (
            <Collapsible
              key={section.title}
              defaultOpen={sectionActive}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                tooltip={section.title}
                isActive={sectionActive}
                render={<Link to={section.url} />}
              >
                <section.icon />
                <span>{section.title}</span>
              </SidebarMenuButton>
              <CollapsibleTrigger
                render={
                  <SidebarMenuAction className="aria-expanded:rotate-90" />
                }
              >
                <ChevronRightIcon />
                <span className="sr-only">Toggle {section.title}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
