import { Fragment } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useActiveNavigation } from "./active-navigation"

interface Crumb {
  title: string
  url?: string
}

function useCrumbs(): Crumb[] {
  const { section, item } = useActiveNavigation()

  if (!section || !item) {
    return []
  }
  if (section.title === item.title) {
    return [{ title: item.title }]
  }
  return [{ title: section.title, url: section.url }, { title: item.title }]
}

interface ShellHeaderProps {
  className?: string
  // For shells whose sidebar holds its own toggle (RailShell): the header only
  // needs one on phones, where the sidebar is a drawer.
  toggleOnMobileOnly?: boolean
}

// Sidebar toggle plus breadcrumbs ending in the current page's name.
export function ShellHeader({
  className,
  toggleOnMobileOnly = false,
}: ShellHeaderProps) {
  const crumbs = useCrumbs()
  const { isMobile } = useSidebar()
  const showToggle = !toggleOnMobileOnly || isMobile

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center gap-2 bg-background",
        className
      )}
    >
      {showToggle && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
        </>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <Fragment key={crumb.title}>
                <BreadcrumbItem
                  className={isLast ? undefined : "hidden md:block"}
                >
                  {isLast || !crumb.url ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to={crumb.url} />}>
                      {crumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
