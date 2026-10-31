import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

function ProjectSheet({ modal }: { modal?: boolean }) {
  const [count, setCount] = useState(0)

  return (
    <>
      <label>
        Page notes
        <input />
      </label>
      <button onClick={() => setCount((value) => value + 1)}>
        Background action {count}
      </button>
      <Sheet modal={modal} disablePointerDismissal>
        <SheetTrigger render={<Button />}>Open project</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Project details</SheetTitle>
            <SheetDescription>Review your project settings.</SheetDescription>
          </SheetHeader>
          <label>
            Project name
            <input defaultValue="Roadmap" />
          </label>
          <SheetFooter>
            <SheetClose render={<Button />}>Done</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

describe("shared Sheet", () => {
  it("opens a modal sheet on the right and restores focus on Close and Escape", async () => {
    const user = userEvent.setup()
    render(<ProjectSheet />)
    const trigger = screen.getByRole("button", { name: "Open project" })

    await user.click(trigger)
    const sheet = await screen.findByRole("dialog", {
      name: "Project details",
    })
    expect(sheet).toHaveAttribute("data-side", "right")
    expect(
      document.querySelector('[data-slot="sheet-overlay"]')
    ).toBeInTheDocument()

    const name = within(sheet).getByLabelText("Project name")
    await waitFor(() => expect(name).toHaveFocus())
    await user.keyboard("{Shift>}{Tab}{/Shift}")
    await waitFor(() =>
      expect(within(sheet).getByRole("button", { name: "Close" })).toHaveFocus()
    )
    await user.click(name)
    await user.clear(name)
    await user.type(name, "Launch")
    expect(name).toHaveValue("Launch")
    await user.click(within(sheet).getByRole("button", { name: "Done" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    await user.click(trigger)
    await screen.findByRole("dialog", { name: "Project details" })
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("omits the overlay while allowing background interaction in non-modal mode", async () => {
    const user = userEvent.setup()
    render(<ProjectSheet modal={false} />)

    await user.click(screen.getByRole("button", { name: "Open project" }))
    const sheet = await screen.findByRole("dialog", {
      name: "Project details",
    })
    expect(
      document.querySelector('[data-slot="sheet-overlay"]')
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(within(sheet).getByLabelText("Project name")).toHaveFocus()
    )

    await user.click(
      screen.getByRole("button", { name: "Background action 0" })
    )
    expect(
      screen.getByRole("button", { name: "Background action 1" })
    ).toHaveFocus()
    await user.type(screen.getByLabelText("Page notes"), "Keep working")
    expect(screen.getByLabelText("Page notes")).toHaveValue("Keep working")
    expect(sheet).toBeVisible()
    expect(
      document.querySelector('[data-slot="sheet-overlay"]')
    ).not.toBeInTheDocument()

    await user.click(within(sheet).getByRole("button", { name: "Done" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("preserves controlled opening and an explicit side override", async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Inspector</SheetTitle>
            <SheetDescription>Controlled from the page.</SheetDescription>
          </SheetHeader>
          <SheetClose render={<Button />}>Close inspector</SheetClose>
        </SheetContent>
      </Sheet>
    )
    const sheet = await screen.findByRole("dialog", { name: "Inspector" })
    expect(sheet).toHaveAttribute("data-side", "left")
    await userEvent.click(
      within(sheet).getByRole("button", { name: "Close inspector" })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
    expect(sheet).toBeVisible()

    rerender(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side="left">
          <SheetTitle>Inspector</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})
