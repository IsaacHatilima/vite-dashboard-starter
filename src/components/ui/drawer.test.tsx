import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"

function ProjectDrawer({
  modal = true,
  disablePointerDismissal = false,
  stack,
  contentStack,
}: {
  modal?: boolean
  disablePointerDismissal?: boolean
  stack?: boolean
  contentStack?: boolean
}) {
  const [count, setCount] = useState(0)

  return (
    <>
      <button onClick={() => setCount((value) => value + 1)}>
        Background action {count}
      </button>
      <Drawer
        modal={modal}
        disablePointerDismissal={disablePointerDismissal}
        stack={stack}
      >
        <DrawerTrigger render={<Button />}>Open project</DrawerTrigger>
        <DrawerContent stack={contentStack}>
          <DrawerHeader>
            <DrawerTitle>Project details</DrawerTitle>
            <DrawerDescription>Review the project.</DrawerDescription>
          </DrawerHeader>
          <label>
            Project name
            <input defaultValue="Roadmap" />
          </label>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function NestedDrawers() {
  const [name, setName] = useState("")

  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Open workspace</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Workspace</DrawerTitle>
          <DrawerDescription>Keep your workspace draft open.</DrawerDescription>
        </DrawerHeader>
        <label>
          Workspace name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <Drawer>
          <DrawerTrigger render={<Button />}>Open team</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Team</DrawerTitle>
              <DrawerDescription>Choose your teammates.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose render={<Button />}>Done with team</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Done with workspace</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe("shared Drawer", () => {
  it.each([
    {
      label: "default",
      stack: undefined,
      contentStack: undefined,
      stacked: false,
    },
    { label: "stacked", stack: true, contentStack: undefined, stacked: true },
    {
      label: "content opt-out",
      stack: true,
      contentStack: false,
      stacked: false,
    },
    {
      label: "content opt-in",
      stack: false,
      contentStack: true,
      stacked: true,
    },
  ])(
    "opens a $label modal drawer, accepts input, and restores focus on Close and Escape",
    async ({ stack, contentStack, stacked }) => {
      const user = userEvent.setup()
      render(<ProjectDrawer stack={stack} contentStack={contentStack} />)
      const trigger = screen.getByRole("button", { name: "Open project" })

      await user.click(trigger)
      const drawer = await screen.findByRole("dialog", {
        name: "Project details",
      })
      expect(drawer).toHaveAttribute("data-swipe-direction", "right")
      expect(drawer).toHaveAttribute("data-stack", String(stacked))
      expect(drawer).not.toHaveAttribute("stack")
      expect(
        document.querySelector('[data-slot="drawer-overlay"]')
      ).not.toBeNull()
      await user.clear(within(drawer).getByLabelText("Project name"))
      await user.type(within(drawer).getByLabelText("Project name"), "Launch")
      expect(within(drawer).getByLabelText("Project name")).toHaveValue(
        "Launch"
      )

      await user.click(within(drawer).getByRole("button", { name: "Done" }))
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
      await waitFor(() => expect(trigger).toHaveFocus())

      await user.click(trigger)
      await screen.findByRole("dialog", { name: "Project details" })
      await user.keyboard("{Escape}")
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
      await waitFor(() => expect(trigger).toHaveFocus())
    }
  )

  it("closes only the nested drawer and preserves the parent draft and trigger focus", async () => {
    const user = userEvent.setup()
    render(<NestedDrawers />)
    const rootTrigger = screen.getByRole("button", { name: "Open workspace" })

    await user.click(rootTrigger)
    const parent = await screen.findByRole("dialog", { name: "Workspace" })
    await user.type(within(parent).getByLabelText("Workspace name"), "Design")
    const childTrigger = within(parent).getByRole("button", {
      name: "Open team",
    })
    await user.click(childTrigger)
    await screen.findByRole("dialog", { name: "Team" })
    expect(parent).toBeInTheDocument()

    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Team" })).toBeNull()
    )
    expect(screen.getByRole("dialog", { name: "Workspace" })).toBeVisible()
    expect(within(parent).getByLabelText("Workspace name")).toHaveValue(
      "Design"
    )
    await waitFor(() => expect(childTrigger).toHaveFocus())

    await user.click(childTrigger)
    const child = await screen.findByRole("dialog", { name: "Team" })
    await user.click(
      within(child).getByRole("button", { name: "Done with team" })
    )
    await waitFor(() => expect(childTrigger).toHaveFocus())
    expect(within(parent).getByLabelText("Workspace name")).toHaveValue(
      "Design"
    )
    await user.click(
      within(parent).getByRole("button", { name: "Done with workspace" })
    )
    await waitFor(() => expect(rootTrigger).toHaveFocus())
  })

  it("allows background interaction without a backdrop in non-modal mode", async () => {
    const user = userEvent.setup()
    render(<ProjectDrawer modal={false} disablePointerDismissal />)

    await user.click(screen.getByRole("button", { name: "Open project" }))
    const drawer = await screen.findByRole("dialog", {
      name: "Project details",
    })
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeNull()
    await waitFor(() => expect(drawer).toHaveFocus())

    await user.click(
      screen.getByRole("button", { name: "Background action 0" })
    )

    expect(
      screen.getByRole("button", { name: "Background action 1" })
    ).toHaveFocus()
    expect(drawer).toBeVisible()
    await user.click(within(drawer).getByRole("button", { name: "Done" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("preserves controlled opening and native direction props", async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Drawer open onOpenChange={onOpenChange} swipeDirection="left">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Inspector</DrawerTitle>
            <DrawerDescription>Controlled from the page.</DrawerDescription>
          </DrawerHeader>
          <DrawerClose render={<Button />}>Close inspector</DrawerClose>
        </DrawerContent>
      </Drawer>
    )
    const drawer = await screen.findByRole("dialog", { name: "Inspector" })
    expect(drawer).toHaveAttribute("data-swipe-direction", "left")
    await userEvent.click(
      screen.getByRole("button", { name: "Close inspector" })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
    expect(drawer).toBeVisible()

    rerender(
      <Drawer open={false} onOpenChange={onOpenChange} swipeDirection="left">
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})
