import { useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const guideSections = [
  {
    title: "Start with the overview",
    content:
      "The overview brings the starter's component examples into one place. Compare the bordered and borderless cards, try the stacked-card controls, and choose the presentation that fits your own content. These examples are a starting point for your workspace rather than live reports.",
  },
  {
    title: "Find your way around",
    content:
      "Dashboard, projects, team, and account settings share the same navigation across the available shells. The current page is marked in the sidebar and named in the breadcrumbs. On a smaller screen, open the navigation drawer to reach another page without crowding the content.",
  },
  {
    title: "Organize your projects",
    content:
      "Use the projects section as a home for ongoing work and the archived section for work that no longer needs daily attention. The starter provides routes and page placeholders for these areas. Connect your own records and actions when you are ready to build the project workflow.",
  },
  {
    title: "Bring your team together",
    content:
      "The team section separates current members from invitations so each has a clear place. Replace the placeholder pages with the information and controls your team needs. Keep invitations, membership changes, and account permissions connected to the same workspace context as the rest of the application.",
  },
  {
    title: "Choose the right card layout",
    content:
      "A regular card groups one piece of content. A stacked card adds space above or below it for a toolbar, supporting details, or related actions. Its header and footer can hold buttons and inputs, while the inner card grows to fit the space available in its row.",
  },
  {
    title: "Keep account settings together",
    content:
      "Profile, security, and appearance each have their own destination under settings. The account menu provides another route to the personal settings pages and a way back to login. There is no connected session service yet, so the starter's authentication screens demonstrate navigation through the flow.",
  },
  {
    title: "Keep useful context nearby",
    content:
      "WorkspaceShell includes a companion panel beside the main page on wide screens. It becomes a drawer when there is less room. The starter panel offers navigation shortcuts; you can replace it with an assistant or other contextual tools when the application has a service to connect.",
  },
  {
    title: "Build from the shared pieces",
    content:
      "Reuse the existing navigation, cards, fields, and dialogs when adding another screen. Keep the page's content separate from the shell so it works in each layout. For a longer dialog like this guide, let the body scroll while the heading and close action stay within reach.",
  },
]

export function StickyFooterDialog({ stack = false }: { stack?: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog>
      <DialogTrigger render={<Button ref={triggerRef} variant="outline" />}>
        Open sticky footer dialog
      </DialogTrigger>
      <DialogContent
        stack={stack}
        className="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden sm:max-w-lg"
        initialFocus={titleRef}
        finalFocus={triggerRef}
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle ref={titleRef} tabIndex={-1} className="outline-none">
            Workspace guide
          </DialogTitle>
          <DialogDescription>
            Explore the starter. The close action stays within reach as you
            read.
          </DialogDescription>
        </DialogHeader>
        <div
          data-slot="dialog-scroll-body"
          role="region"
          aria-label="Workspace guide content"
          tabIndex={0}
          className="-mx-4 no-scrollbar flex max-h-[50vh] min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {guideSections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h3 className="font-medium">{section.title}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </section>
          ))}
        </div>
        <DialogFooter className="shrink-0">
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
