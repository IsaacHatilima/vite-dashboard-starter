import type { ComponentProps } from "react"
import { XIcon } from "lucide-react"
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
import { DialogClose } from "@/components/ui/dialog"
import { allNavigation } from "@/config/navigation"

type ShellCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  query?: string
  onQueryChange?: (query: string) => void
  onNavigate?: () => void
  title?: string
  inputLabel?: string
  emptyMessage?: string
} & Pick<ComponentProps<typeof CommandDialog>, "finalFocus">

export function ShellCommand({
  open,
  onOpenChange,
  query,
  onQueryChange,
  onNavigate,
  title = "Search commands",
  inputLabel = "Search workspace commands",
  emptyMessage = "No commands found.",
  finalFocus,
}: ShellCommandProps) {
  const navigate = useNavigate()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Find a page in your workspace."
      finalFocus={finalFocus}
    >
      <Command label={inputLabel}>
        <div className="relative">
          <CommandInput
            aria-label={inputLabel}
            placeholder="Search pages…"
            className="pr-8"
            value={query}
            onValueChange={onQueryChange}
          />
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close search"
                className="absolute top-1.5 right-1.5"
              />
            }
          >
            <XIcon />
          </DialogClose>
        </div>
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {allNavigation.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => {
                const Icon = item.icon ?? section.icon

                return (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    keywords={[section.title]}
                    onSelect={() => {
                      onOpenChange(false)
                      onNavigate?.()
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
  )
}
