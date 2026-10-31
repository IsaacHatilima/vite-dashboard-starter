import { useState } from "react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { mainNavigation } from "@/config/navigation"

function CommandPreview({ label, stack }: { label: string; stack: boolean }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        stack={stack}
        title="Workspace commands"
        description="Find a page in your workspace."
      >
        <Command label="Workspace commands">
          <CommandInput
            aria-label="Search workspace commands"
            placeholder="Type a command or search…"
          />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
            {mainNavigation.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.items.map((item) => {
                  const Icon = item.icon ?? section.icon

                  return (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      keywords={[section.title]}
                      onSelect={() => {
                        setOpen(false)
                        navigate(item.url)
                      }}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

export default function CommandSection() {
  return (
    <section aria-labelledby="commands-title" className="flex flex-col gap-4">
      <h2 id="commands-title" className="text-sm font-medium">
        Commands
      </h2>
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Default command", stack: false },
          { label: "Stacked command", stack: true },
        ].map((mode) => (
          <CommandPreview key={mode.label} {...mode} />
        ))}
      </div>
    </section>
  )
}
