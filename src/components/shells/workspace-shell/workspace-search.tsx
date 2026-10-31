import { ArrowUpRightIcon, SearchIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { mainNavigation } from "@/config/navigation"

export function WorkspaceSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setQuery("")
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
        setQuery("")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = mainNavigation.flatMap((section) =>
    section.items
      .filter((item) =>
        `${section.title} ${item.title}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      )
      .map((item) => ({ ...item, section }))
  )

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button
            ref={triggerRef}
            variant="outline"
            aria-label="Search pages"
            aria-keyshortcuts="Meta+K Control+K"
            className="size-9 justify-start md:h-8 md:w-52 lg:w-64"
          />
        }
      >
        <SearchIcon data-icon="inline-start" strokeWidth={1.5} />
        <span className="hidden md:inline">Search</span>
        <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:inline">
          ⌘ K
        </kbd>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        initialFocus={inputRef}
        finalFocus={triggerRef}
      >
        <DialogHeader>
          <DialogTitle>Search pages</DialogTitle>
          <DialogDescription>Find a page in your workspace.</DialogDescription>
        </DialogHeader>
        <Input
          className="shrink-0"
          ref={inputRef}
          type="search"
          aria-label="Search workspace pages"
          placeholder="Search pages…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <DialogBody className="max-h-80">
          <nav aria-label="Search results">
            {results.length ? (
              <ul className="flex flex-col gap-1">
                {results.map((item) => (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      className={buttonVariants({
                        variant: "ghost",
                        className: "h-auto w-full justify-start py-2",
                      })}
                      onClick={() => changeOpen(false)}
                    >
                      <item.section.icon data-icon="inline-start" />
                      <span className="flex min-w-0 flex-1 flex-col items-start">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.section.title}
                        </span>
                      </span>
                      <ArrowUpRightIcon data-icon="inline-end" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No pages found</EmptyTitle>
                  <EmptyDescription>
                    Try a different page or section name.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </nav>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
