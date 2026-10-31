import { useRef, useState } from "react"
import type * as React from "react"

import { Sidebar, useSidebar } from "@/components/ui/sidebar"
import {
  mainNavigation,
  settingsNavigation,
  type NavSection,
} from "@/config/navigation"
import { useActiveNavigation } from "../shared/active-navigation"
import { useCloseMobileSidebarOnNavigate } from "../shared/sidebar-state"
import { SectionPanel } from "./section-panel"
import { SectionRail } from "./section-rail"
import { useRailPeek } from "./use-rail-peek"

// Laid out like ChatGPT's sidebar:
//  - Expanded: rail + docked panel. Rail icons switch what the panel lists.
//  - Collapsed: rail only. Hovering or clicking an icon floats that section's
//    panel as a card over the page; its toggle docks it again.
export function RailSidebar() {
  useCloseMobileSidebarOnNavigate()
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar()
  // Phones use a drawer, which has no collapsed state.
  const collapsed = !open && !isMobile
  const rowRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const { section: routeSection } = useActiveNavigation()
  // Pages outside the nav (a 404, say) start on the first section.
  const [selected, setSelected] = useState<NavSection>(
    routeSection ?? mainNavigation[0]
  )
  // Follow the page when it moves into another section (a breadcrumb or a
  // link in the page); otherwise keep whatever the rail picked.
  const [followedSection, setFollowedSection] = useState(routeSection)
  if (routeSection !== followedSection) {
    setFollowedSection(routeSection)
    if (routeSection) {
      setSelected(routeSection)
    }
  }

  const peek = useRailPeek()
  const peekSection = collapsed ? peek.section : null

  function focusRailButton(section: NavSection) {
    const button =
      rowRef.current?.querySelector<HTMLButtonElement>(
        `[data-section="${CSS.escape(section.title)}"]`
      ) ??
      rowRef.current?.querySelector<HTMLButtonElement>(
        "[data-account-menu-trigger]"
      )
    button?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && peekSection) {
      peek.close()
      focusRailButton(peekSection)
    }
  }

  // Focus leaving both the rail and the card closes the card.
  function handleBlur(event: React.FocusEvent) {
    const next = event.relatedTarget
    const stillInside =
      rowRef.current?.contains(next) || cardRef.current?.contains(next)
    if (peekSection && !stillInside) {
      peek.close()
    }
  }

  // The rail and the card share hover and keyboard handling.
  const peekHandlers = {
    onMouseEnter: peek.cancelClose,
    onMouseLeave: peek.scheduleClose,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  }

  return (
    <>
      <Sidebar collapsible="icon" className="overflow-hidden">
        {/* The icon rail has its own surface; the navigation panel shares
            the body colour, with rounded corners and a soft shadow. */}
        <div
          ref={rowRef}
          className="flex h-full w-full flex-row bg-sidebar-rail"
          {...peekHandlers}
        >
          <SectionRail
            sections={mainNavigation}
            selected={selected}
            peeked={peekSection}
            collapsed={collapsed}
            onSettingsNavigate={() => {
              setSelected(settingsNavigation)
              peek.close()
              if (isMobile) {
                setOpenMobile(false)
              } else {
                setOpen(true)
              }
            }}
            onSelect={(section) => {
              setSelected(section)
              if (collapsed) {
                peek.open(section, { immediate: true })
              }
            }}
            onHover={(section) => {
              if (collapsed) {
                peek.open(section, { immediate: peekSection !== null })
              }
            }}
          />
          {!collapsed && (
            <SectionPanel
              section={selected}
              className="flex-1 rounded-l-2xl bg-sidebar-panel shadow-(--sidebar-panel-shadow)"
              onToggle={() => {
                peek.close()
                // Collapsing removes this button; keep focus in the rail.
                if (!isMobile) {
                  requestAnimationFrame(() => focusRailButton(selected))
                }
              }}
            />
          )}
        </div>
      </Sidebar>
      {/* Rendered beside the Sidebar, not in it: inside a collapsed sidebar,
          shadcn shrinks every menu button to an icon square, which would cut
          the card's links down to their first letter. */}
      {peekSection && (
        <div
          ref={cardRef}
          className="fixed inset-y-0 left-(--sidebar-width-icon) z-20 w-[calc(var(--sidebar-width)-var(--sidebar-width-icon))] py-1 pl-1"
          {...peekHandlers}
        >
          <SectionPanel
            section={peekSection}
            className="h-full rounded-xl bg-sidebar-panel-floating text-popover-foreground shadow-lg ring-1 ring-foreground/10 dark:ring-foreground/5"
            onToggle={() => {
              setSelected(peekSection)
              peek.close()
            }}
            onNavigate={peek.close}
          />
        </div>
      )}
    </>
  )
}
