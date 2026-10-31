import { ArrowUpIcon, SparklesIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/routes"

const shortcuts = [
  {
    title: "Explore your analytics",
    description: "See how your workspace is doing",
    url: routes.analytics,
  },
  {
    title: "Review your projects",
    description: "Find what needs your attention",
    url: routes.projects,
  },
  {
    title: "Bring your team together",
    description: "Manage members and invitations",
    url: routes.team,
  },
]

/** UI-only starter content; supply WorkspaceShell's assistant prop to connect your own. */
export function WorkspaceAssistant() {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">What are you working on?</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Keep useful context beside your work. Here are a few places to get
            started.
          </p>
        </div>
        <nav aria-label="Assistant shortcuts" className="flex flex-col gap-2">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.url}
              to={shortcut.url}
              className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-xs outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">{shortcut.title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {shortcut.description}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 pt-0">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <SparklesIcon className="size-3.5 text-muted-foreground" />
            Workspace assistant
          </span>
          <div className="flex items-end gap-2">
            <Field>
              <FieldLabel
                htmlFor="workspace-assistant-message"
                className="sr-only"
              >
                Message the assistant
              </FieldLabel>
              <Input
                id="workspace-assistant-message"
                placeholder="Ask about your workspace…"
                disabled
              />
            </Field>
            <Button size="icon" disabled aria-label="Send message">
              <ArrowUpIcon />
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Connect an assistant to enable chat.
          </p>
        </div>
      </div>
    </>
  )
}
