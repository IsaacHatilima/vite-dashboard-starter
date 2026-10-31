import { useState } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarOpen } from "../shared/sidebar-state"
import { ShellHeader } from "../shared/shell-header"
import type { ShellProps } from "../shared/shell-types"
import { MAIN_CONTENT_ID, SkipToContent } from "../shared/skip-to-content"
import { InsetSidebar } from "./inset-sidebar"

/**
 * InsetShell (shadcn sidebar-08): the page floats as a rounded panel inside
 * the sidebar colour. Collapsible nav sections, support links and the user
 * menu at the bottom.
 */
export function InsetShell({ children }: ShellProps) {
  const [defaultOpen] = useState(readSidebarOpen)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToContent />
      <InsetSidebar />
      <SidebarInset>
        <ShellHeader className="h-16 rounded-t-xl px-4" />
        <div
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex flex-1 flex-col gap-4 p-4 pt-0 outline-none"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
