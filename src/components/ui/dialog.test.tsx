import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { Button } from "./button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

function ProjectDialog({
  stack,
  contentStack,
}: {
  stack?: boolean
  contentStack?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen} stack={stack}>
      <DialogTrigger render={<Button />}>Edit project</DialogTrigger>
      <DialogContent stack={contentStack}>
        <DialogHeader>
          <DialogTitle>Project details</DialogTitle>
          <DialogDescription>Update your project name.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <output aria-label="Preview">{name || "Untitled project"}</output>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function openProjectDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Edit project" }))
  return screen.findByRole("dialog", { name: "Project details" })
}

describe("shared Dialog", () => {
  it("defaults to a plain surface", async () => {
    render(<ProjectDialog />)
    const dialog = await openProjectDialog(userEvent.setup())

    expect(dialog).toHaveAttribute("data-stack", "false")
  })

  it("inherits root stack changes while the dialog is open", async () => {
    const { rerender } = render(<ProjectDialog stack />)
    const dialog = await openProjectDialog(userEvent.setup())
    expect(dialog).toHaveAttribute("data-stack", "true")

    rerender(<ProjectDialog stack={false} />)
    expect(dialog).toBeVisible()
    expect(dialog).toHaveAttribute("data-stack", "false")
  })

  it.each([
    { root: true, content: false },
    { root: false, content: true },
  ])(
    "lets content stack=$content override root stack=$root",
    async ({ root, content }) => {
      render(<ProjectDialog stack={root} contentStack={content} />)
      const dialog = await openProjectDialog(userEvent.setup())

      expect(dialog).toHaveAttribute("data-stack", String(content))
    }
  )

  it("accepts input and action components, closes, and restores trigger focus", async () => {
    const user = userEvent.setup()
    render(<ProjectDialog stack />)
    const trigger = screen.getByRole("button", { name: "Edit project" })
    const dialog = await openProjectDialog(user)

    await user.type(within(dialog).getByLabelText("Project name"), "Roadmap")
    expect(within(dialog).getByLabelText("Preview")).toHaveTextContent(
      "Roadmap"
    )
    await user.click(within(dialog).getByRole("button", { name: "Done" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    await openProjectDialog(user)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
