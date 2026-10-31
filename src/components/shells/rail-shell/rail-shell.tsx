import { useState } from "react"
import type * as React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarOpen } from "../shared/sidebar-state"
import { ShellHeader } from "../shared/shell-header"
import type { ShellProps } from "../shared/shell-types"
import { MAIN_CONTENT_ID, SkipToContent } from "../shared/skip-to-content"
import { RailSidebar } from "./rail-sidebar"

// Measured from ChatGPT: a 52px rail plus a 288px panel.
const RAIL_SIDEBAR_WIDTH = "340px"
const RAIL_WIDTH = "52px"

/**
 * RailShell (shadcn sidebar-09, laid out like ChatGPT's sidebar): an icon rail
 * that picks a section, and beside it a panel listing that section's pages.
 * The panel's own button collapses it to the rail; hovering or clicking a rail
 * icon then floats that section's panel over the page.
 */
export function RailShell({ children }: ShellProps) {
  const [defaultOpen] = useState(readSidebarOpen)

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": RAIL_SIDEBAR_WIDTH,
          "--sidebar-width-icon": RAIL_WIDTH,
        } as React.CSSProperties
      }
    >
      <SkipToContent />
      <RailSidebar />
      <SidebarInset>
        <ShellHeader className="border-b p-4" toggleOnMobileOnly />
        <div
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex flex-1 flex-col gap-4 p-4 outline-none"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
