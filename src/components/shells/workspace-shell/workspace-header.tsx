import { Sparkles } from "lucide-react"
import { Link } from "react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useActiveNavigation } from "../shared/active-navigation"
import { WorkspaceSearch } from "./workspace-search"

interface WorkspaceHeaderProps {
  assistantOpen: boolean
  onAssistantToggle: () => void
}

export function WorkspaceHeader({
  assistantOpen,
  onAssistantToggle,
}: WorkspaceHeaderProps) {
  const { section, item } = useActiveNavigation()

  return (
    <header className="sticky top-0 z-10 flex h-(--app-header-height) min-w-0 shrink-0 items-center gap-2 bg-dashboard px-(--app-gutter)">
      <SidebarTrigger aria-label="Toggle sidebar" className="shrink-0" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {section && item && section.title !== item.title && (
            <>
              <BreadcrumbItem className="hidden min-w-0 md:inline-flex">
                <BreadcrumbLink
                  className="truncate"
                  render={<Link to={section.url} />}
                >
                  {section.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">
              {item?.title ?? "Workspace"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex shrink-0 items-center gap-2">
        <WorkspaceSearch />
        <Button
          id="workspace-assistant-toggle"
          variant="default"
          size="icon"
          aria-label="Toggle assistant"
          aria-expanded={assistantOpen}
          aria-controls="workspace-assistant"
          onClick={onAssistantToggle}
        >
          <Sparkles />
        </Button>
      </div>
    </header>
  )
}
