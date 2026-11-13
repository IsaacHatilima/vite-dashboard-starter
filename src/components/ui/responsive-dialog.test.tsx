import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "./responsive-dialog"

function phoneWidth(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string): MediaQueryList => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })
  )
}

function ArchiveDialog() {
  const cancel = useRef<HTMLButtonElement>(null)

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger render={<Button />}>
        Archive
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent initialFocus={cancel}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Archive project?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            You can restore it later.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          Roadmap will leave the list.
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose render={<Button ref={cancel} />}>
            Cancel
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

async function openAndClose() {
  const user = userEvent.setup()
  render(<ArchiveDialog />)
  const trigger = screen.getByRole("button", { name: "Archive" })

  await user.click(trigger)
  const dialog = await screen.findByRole("dialog", {
    name: "Archive project?",
  })
  expect(dialog).toHaveAccessibleDescription("You can restore it later.")
  expect(screen.getByText("Roadmap will leave the list.")).toBeVisible()
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus()
  )

  await user.click(screen.getByRole("button", { name: "Cancel" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  await waitFor(() => expect(trigger).toHaveFocus())

  return dialog
}

describe("ResponsiveDialog", () => {
  it("renders a centered dialog from 768px up", async () => {
    phoneWidth(false)
    const dialog = await openAndClose()

    expect(dialog).toHaveAttribute("data-slot", "dialog-content")
  })

  it("renders a bottom sheet that swipes down on a phone", async () => {
    phoneWidth(true)
    const dialog = await openAndClose()

    expect(dialog).toHaveAttribute("data-slot", "drawer-popup")
    expect(dialog).toHaveAttribute("data-swipe-direction", "down")
  })
})
