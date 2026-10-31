import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { WorkspaceShell } from "./workspace-shell"

function viewport(width: number) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches:
      (query === "(min-width: 1280px)" && width >= 1280) ||
      (query === "(max-width: 767px)" && width < 768),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

function renderWorkspace(assistant?: ReactNode) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <WorkspaceShell assistant={assistant}>Page body</WorkspaceShell>
        ),
      },
    ],
    { initialEntries: ["/dashboard"] }
  )
  render(
    <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  )
  return { router, user: userEvent.setup() }
}

describe("WorkspaceShell page search", () => {
  it("filters by page title and section, and explains empty results", async () => {
    const { user } = renderWorkspace()
    await user.click(screen.getByRole("button", { name: "Search pages" }))
    const dialog = screen.getByRole("dialog", { name: "Search pages" })
    const input = within(dialog).getByRole("searchbox", {
      name: "Search workspace pages",
    })
    await waitFor(() => expect(input).toHaveFocus())

    await user.type(input, "archived")
    expect(within(dialog).getAllByRole("link")).toHaveLength(1)
    expect(
      within(dialog).getByRole("link", { name: /Archived\s*Projects/ })
    ).toHaveAttribute("href", "/projects/archived")

    await user.clear(input)
    await user.type(input, "settings")
    expect(within(dialog).getAllByRole("link")).toHaveLength(10)
    expect(
      within(dialog).getByRole("link", { name: /Preferences\s*Settings/ })
    ).toBeVisible()
    expect(
      within(dialog).getByRole("link", {
        name: /Keyboard shortcuts\s*Settings/,
      })
    ).toHaveAttribute("href", "/settings/keyboard-shortcuts")
    expect(
      within(dialog).getByRole("link", { name: /Task assignments\s*Settings/ })
    ).toHaveAttribute("href", "/settings/notifications/task-assignments")

    await user.clear(input)
    await user.type(input, "no-such-page")
    expect(within(dialog).queryByRole("link")).not.toBeInTheDocument()
    expect(within(dialog).getByText("No pages found")).toBeVisible()
  })

  it("navigates from a result, closes search and clears the next query", async () => {
    const { router, user } = renderWorkspace()
    await user.click(screen.getByRole("button", { name: "Search pages" }))
    await user.type(screen.getByRole("searchbox"), "archived")
    await user.click(screen.getByRole("link", { name: /Archived\s*Projects/ }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects/archived")
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(
      within(
        screen.getByRole("navigation", { name: "Workspace navigation" })
      ).getByRole("link", { name: "Archived", current: "page" })
    ).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Search pages" }))
    expect(screen.getByRole("searchbox")).toHaveValue("")
  })

  it.each(["Control", "Meta"])(
    "opens with %s+K and restores focus on Escape",
    async (modifier) => {
      const { user } = renderWorkspace()
      await user.keyboard(`{${modifier}>}k{/${modifier}}`)
      expect(screen.getByRole("dialog", { name: "Search pages" })).toBeVisible()
      await user.keyboard("{Escape}")
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Search pages" })
        ).toHaveFocus()
      )
    }
  )
})

describe("WorkspaceShell companion panel", () => {
  it("docks on wide screens, closes with focus restoration, and reopens", async () => {
    viewport(1440)
    const { user } = renderWorkspace()
    const toggle = screen.getByRole("button", { name: "Toggle assistant" })
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(
      screen.getByRole("complementary", { name: "Workspace assistant" })
    ).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Close assistant" }))
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(toggle).toHaveFocus()

    await user.click(toggle)
    expect(
      screen.getByRole("complementary", { name: "Workspace assistant" })
    ).toBeVisible()
  })

  it("opens as a drawer on smaller screens and dismisses with Escape", async () => {
    viewport(1024)
    const { user } = renderWorkspace()
    const toggle = screen.getByRole("button", { name: "Toggle assistant" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await user.click(toggle)
    expect(
      screen.getByRole("dialog", { name: "Workspace assistant" })
    ).toBeVisible()
    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })

  it("dismisses the assistant drawer after following a shortcut", async () => {
    viewport(1024)
    const { router, user } = renderWorkspace()
    await user.click(screen.getByRole("button", { name: "Toggle assistant" }))
    await user.click(screen.getByRole("link", { name: /Review your projects/ }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects")
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })

  it("accepts custom panel content while retaining shell controls", () => {
    viewport(1440)
    renderWorkspace(<p>Connected assistant</p>)
    expect(
      within(screen.getByRole("complementary")).getByText("Connected assistant")
    ).toBeVisible()
    expect(
      screen.queryByText("Connect an assistant to enable chat.")
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Close assistant" })
    ).toBeVisible()
  })

  it("leaves chat unavailable until an assistant is connected", () => {
    viewport(1440)
    renderWorkspace()
    expect(screen.getByLabelText("Message the assistant")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()
    expect(
      screen.getByText("Connect an assistant to enable chat.")
    ).toBeVisible()
  })
})

describe("WorkspaceShell sidebar", () => {
  it("collapses into a rail and remembers its state", async () => {
    const { user } = renderWorkspace()
    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
    expect(
      document.querySelector("[data-slot=sidebar][data-state]")
    ).toHaveAttribute("data-state", "collapsed")
    expect(document.cookie).toContain("sidebar_state=false")
  })

  it("closes mobile navigation after following a page link", async () => {
    viewport(375)
    const { router, user } = renderWorkspace()
    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
    const drawer = screen.getByRole("dialog", { name: "Sidebar" })
    await user.click(within(drawer).getByRole("link", { name: "Archived" }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects/archived")
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })
})
