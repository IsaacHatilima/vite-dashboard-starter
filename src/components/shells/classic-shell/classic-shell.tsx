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
        <ShellHeader className="border-b" />
        <div
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col gap-4 px-(--app-gutter) pt-(--app-page-top) pb-6 outline-none"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
