import { useLocation } from "react-router"

import {
  mainNavigation,
  type NavItem,
  type NavSection,
} from "@/config/navigation"

export interface ActiveNavigation {
  section: NavSection | null
  item: NavItem | null
}

function isWithin(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`)
}

/**
 * Finds the nav item for `pathname`: an exact match first, otherwise the
 * deepest item the path sits under (so /projects/42 lights up "All projects").
 */
export function findActiveNavigation(
  pathname: string,
  sections: NavSection[]
): ActiveNavigation {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  const candidates = sections.flatMap((section) =>
    section.items.map((item) => ({ section, item }))
  )

  const exact = candidates.find(({ item }) => item.url === path)
  if (exact) {
    return exact
  }

  const nested = candidates
    .filter(({ item }) => isWithin(path, item.url))
    .sort((a, b) => b.item.url.length - a.item.url.length)[0]

  return nested ?? { section: null, item: null }
}

export function useActiveNavigation(): ActiveNavigation {
  const { pathname } = useLocation()
  return findActiveNavigation(pathname, mainNavigation)
}
