import { SearchIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { ShellCommand } from "../shared/shell-command"

export function WorkspaceSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const headerInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <>
      <InputGroup className="w-40 md:w-64 lg:w-80">
        <InputGroupInput
          ref={headerInputRef}
          placeholder="Search..."
          aria-label="Search pages"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-keyshortcuts="Meta+K Control+K"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              changeOpen(true)
            }
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <ShellCommand
        open={open}
        onOpenChange={changeOpen}
        query={query}
        onQueryChange={setQuery}
        title="Search pages"
        inputLabel="Search workspace pages"
        emptyMessage="No pages found"
        finalFocus={headerInputRef}
      />
    </>
  )
}
