import {
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react"
import { XIcon } from "lucide-react"
import { useLocation } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarOpen } from "../shared/sidebar-state"
import type { ShellProps } from "../shared/shell-types"
import { MAIN_CONTENT_ID, SkipToContent } from "../shared/skip-to-content"
import { WorkspaceAssistant } from "./workspace-assistant"
import { WorkspaceHeader } from "./workspace-header"
import { WorkspaceSidebar } from "./workspace-sidebar"

const DOCKED_QUERY = "(min-width: 1280px)"

function subscribeToDocked(onChange: () => void) {
  const query = window.matchMedia(DOCKED_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function getDockedSnapshot() {
  return window.matchMedia(DOCKED_QUERY).matches
}

export interface WorkspaceShellProps extends ShellProps {
  /** Replace the starter panel with your own assistant or contextual tools. */
  assistant?: ReactNode
}

/** A full sidebar and toolbar around an inset workspace with a companion panel. */
export function WorkspaceShell({ children, assistant }: WorkspaceShellProps) {
  const [defaultOpen] = useState(readSidebarOpen)
  const docked = useSyncExternalStore(
    subscribeToDocked,
    getDockedSnapshot,
    () => false
  )
  const location = useLocation()
  // A drawer belongs to one route. The docked panel stays open between pages.
  const panelLocation = docked ? "docked" : location.key
  const [assistantState, setAssistantState] = useState({
    open: docked,
    location: panelLocation,
  })
  const assistantOpen = assistantState.open
  const assistantContent = assistant ?? <WorkspaceAssistant />

  if (assistantState.location !== panelLocation) {
    setAssistantState({
      open: docked && assistantOpen,
      location: panelLocation,
    })
  }

  function setAssistantOpen(open: boolean) {
    setAssistantState({ open, location: panelLocation })
  }

  function closeAssistant() {
    setAssistantOpen(false)
    document.getElementById("workspace-assistant-toggle")?.focus()
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="bg-sidebar"
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "3.5rem",
        } as CSSProperties
      }
      data-slot="workspace-shell"
    >
      <SkipToContent />
      <WorkspaceSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          assistantOpen={assistantOpen}
          onAssistantToggle={() => setAssistantOpen(!assistantOpen)}
        />
        <div className="mx-2 mb-2 flex min-h-[calc(100svh-4rem)] flex-1 rounded-2xl border bg-background shadow-xs md:mr-3 md:mb-3 md:ml-0 md:min-h-[calc(100svh-4.25rem)]">
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="flex min-w-0 flex-1 flex-col gap-6 p-4 outline-none md:p-6"
          >
            {children}
          </main>
          {docked && assistantOpen && (
            <aside
              id="workspace-assistant"
              aria-label="Workspace assistant"
              className="sticky top-14 flex h-[calc(100svh-4.25rem)] w-[clamp(19rem,24vw,25rem)] shrink-0 flex-col self-start rounded-r-2xl border-l bg-background"
            >
              <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-5">
                <h2 className="text-sm font-semibold">Workspace assistant</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close assistant"
                  onClick={closeAssistant}
                >
                  <XIcon />
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                {assistantContent}
              </div>
            </aside>
          )}
        </div>
      </div>
      {!docked && (
        <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
          <SheetContent
            id="workspace-assistant"
            side="right"
            className="max-w-sm gap-0 data-[side=right]:w-[calc(100%-1rem)]"
          >
            <SheetHeader className="pr-12">
              <SheetTitle>Workspace assistant</SheetTitle>
              <SheetDescription className="sr-only">
                Context and tools beside your current page.
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              {assistantContent}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </SidebarProvider>
  )
}
