import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "./button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView"
)

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  )
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  if (scrollIntoViewDescriptor) {
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollIntoViewDescriptor
    )
  } else {
    Reflect.deleteProperty(Element.prototype, "scrollIntoView")
  }
})

function WorkspaceCommands({
  stack,
  onSelect = () => {},
}: {
  stack?: boolean
  onSelect?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  function select(value: string) {
    onSelect(value)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open commands</Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        stack={stack}
        title="Workspace commands"
        description="Choose a page in your workspace."
      >
        <Command label="Workspace commands">
          <CommandInput placeholder="Search commands…" />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup heading="Dashboard">
              <CommandItem value="overview" onSelect={select}>
                Overview
              </CommandItem>
              <CommandItem value="analytics" onSelect={select}>
                Analytics
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Projects">
              <CommandItem
                value="archived"
                keywords={["projects"]}
                onSelect={select}
              >
                Archived
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

async function openCommands(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open commands" }))
  const dialog = await screen.findByRole("dialog", {
    name: "Workspace commands",
  })
  await waitFor(() =>
    expect(within(dialog).getByRole("combobox")).toHaveFocus()
  )
  return dialog
}

describe("shared CommandDialog", () => {
  it.each([
    { label: "default", stack: undefined, stacked: false },
    { label: "stacked", stack: true, stacked: true },
  ])(
    "opens the $label surface with an accessible title",
    async ({ stack, stacked }) => {
      render(<WorkspaceCommands stack={stack} />)
      const dialog = await openCommands(userEvent.setup())

      expect(dialog).toHaveAttribute("data-stack", String(stacked))
      expect(dialog).not.toHaveAttribute("stack")
      expect(dialog).toHaveAccessibleDescription(
        "Choose a page in your workspace."
      )
      expect(
        within(dialog).getByRole("button", { name: "Close" })
      ).toBeVisible()
    }
  )

  it("filters commands by keywords and shows the empty state", async () => {
    const user = userEvent.setup()
    render(<WorkspaceCommands stack />)
    const dialog = await openCommands(user)
    const input = within(dialog).getByRole("combobox")

    await user.type(input, "projects")
    expect(within(dialog).getAllByRole("option")).toHaveLength(1)
    expect(
      within(dialog).getByRole("option", { name: "Archived" })
    ).toBeVisible()

    await user.clear(input)
    await user.type(input, "no-such-command")
    expect(within(dialog).queryByRole("option")).toBeNull()
    expect(within(dialog).getByText("No commands found.")).toBeVisible()
  })

  it("runs a keyboard-selected command, closes, and restores focus", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<WorkspaceCommands stack onSelect={onSelect} />)
    const dialog = await openCommands(user)

    await waitFor(() =>
      expect(
        within(dialog).getByRole("option", { name: "Overview" })
      ).toHaveAttribute("aria-selected", "true")
    )
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith("analytics")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Open commands" })
      ).toHaveFocus()
    )
  })

  it.each(["Escape", "Close"])(
    "dismisses with %s and restores trigger focus",
    async (method) => {
      const user = userEvent.setup()
      render(<WorkspaceCommands stack />)
      const dialog = await openCommands(user)

      if (method === "Escape") {
        await user.keyboard("{Escape}")
      } else {
        await user.click(within(dialog).getByRole("button", { name: "Close" }))
      }

      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Open commands" })
        ).toHaveFocus()
      )
    }
  )
})
