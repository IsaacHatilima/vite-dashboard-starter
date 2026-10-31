import { useState } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarOpen } from "../shared/sidebar-state"
import { ShellHeader } from "../shared/shell-header"
import type { ShellProps } from "../shared/shell-types"
import { MAIN_CONTENT_ID, SkipToContent } from "../shared/skip-to-content"
import { ClassicSidebar } from "./classic-sidebar"

/**
 * ClassicShell (shadcn sidebar-03): a full-height sidebar with every section
 * and its pages listed open, docs style. Drag the rail edge to collapse.
 */
export function ClassicShell({ children }: ShellProps) {
  const [defaultOpen] = useState(readSidebarOpen)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToContent />
      <ClassicSidebar />
      <SidebarInset>
        <ShellHeader className="h-16 border-b px-3" />
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
