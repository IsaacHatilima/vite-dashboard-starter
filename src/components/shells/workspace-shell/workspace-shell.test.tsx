import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { appConfig } from "@/config/app"
import { WorkspaceShell } from "./workspace-shell"

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

describe("WorkspaceShell refinement", () => {
  it("shows the company name without the Dashboard tagline and retains navigation", () => {
    renderWorkspace()
    const brand = screen.getByText(appConfig.name).closest("a")
    expect(brand).toHaveAccessibleName(appConfig.name)
    expect(
      within(brand!).queryByText(appConfig.tagline)
    ).not.toBeInTheDocument()

    const navigation = screen.getByRole("navigation", {
      name: "Workspace navigation",
    })
    expect(within(navigation).getByText("Dashboard")).toBeVisible()
    expect(
      within(navigation).getByRole("link", {
        name: "Overview",
        current: "page",
      })
    ).toBeVisible()
  })

  it("removes the workspace invite card while retaining the Invitations destination", () => {
    renderWorkspace()
    expect(screen.queryByText("Your workspace")).not.toBeInTheDocument()
    expect(
      screen.queryByText("Bring your team together.")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Invite members")).not.toBeInTheDocument()
    expect(
      within(
        screen.getByRole("navigation", { name: "Workspace navigation" })
      ).getByRole("link", { name: "Invitations" })
    ).toHaveAttribute("href", "/team/invitations")
  })

  it("uses an editable input-group search field with separate shortcut keys", () => {
    viewport(1440)
    renderWorkspace()
    const input = screen.getByRole("textbox", { name: "Search pages" })
    expect(input.tagName).toBe("INPUT")
    expect(input).toHaveAttribute("type", "text")
    expect(input).not.toHaveAttribute("readonly")
    expect(input).not.toHaveAttribute("role", "button")

    const group = input.closest('[data-slot="input-group"]')
    expect(group).toBeInTheDocument()
    const shortcut = group!.querySelector<HTMLElement>(
      '[data-slot="input-group-addon"][data-align="inline-end"]'
    )
    expect(shortcut).toBeInTheDocument()
    expect(within(shortcut!).getByText("⌘", { selector: "kbd" })).toBeVisible()
    expect(within(shortcut!).getByText("K", { selector: "kbd" })).toBeVisible()
  })

  it("accepts text and spaces without opening, then submits the query with Enter", async () => {
    const { user } = renderWorkspace()
    const headerInput = screen.getByRole("textbox", { name: "Search pages" })
    await user.click(headerInput)
    await user.type(headerInput, "all projects")
    expect(headerInput).toHaveValue("all projects")
    expect(
      screen.queryByRole("dialog", { name: "Search pages" })
    ).not.toBeInTheDocument()

    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog", { name: "Search pages" })
    const dialogInput = within(dialog).getByRole("combobox", {
      name: "Search workspace pages",
    })
    expect(dialogInput).toHaveValue("all projects")
    await waitFor(() => expect(dialogInput).toHaveFocus())
    expect(
      within(dialog).getByRole("option", { name: "All projects" })
    ).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Search pages" })
      ).not.toBeInTheDocument()
    )
    await waitFor(() => expect(headerInput).toHaveFocus())
    expect(headerInput).toHaveValue("")
    expect(
      screen.queryByRole("dialog", { name: "Search pages" })
    ).not.toBeInTheDocument()
  })
})

describe("WorkspaceShell page search", () => {
  it("uses the shared command palette near the top of the viewport", async () => {
    const { user } = renderWorkspace()
    await user.click(screen.getByRole("textbox", { name: "Search pages" }))
    await user.keyboard("{Enter}")

    const dialog = await screen.findByRole("dialog", { name: "Search pages" })
    expect(dialog).toHaveClass("top-[12svh]", "translate-y-0")
    const input = within(dialog).getByRole("combobox", {
      name: "Search workspace pages",
    })
    expect(input).toHaveAttribute("data-slot", "command-input")
    expect(input.closest('[data-slot="command"]')).toBeInTheDocument()
    expect(within(dialog).getByRole("listbox")).toHaveAttribute(
      "data-slot",
      "command-list"
    )
    expect(
      within(dialog)
        .getByRole("group", { name: "Projects" })
        .closest('[data-slot="command-group"]')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole("option", { name: "Archived" })
    ).toHaveAttribute("data-slot", "command-item")
  })

  it("filters by page title and section, and explains empty results", async () => {
    const { user } = renderWorkspace()
    await user.click(screen.getByRole("textbox", { name: "Search pages" }))
    await user.keyboard("{Enter}")
    const dialog = screen.getByRole("dialog", { name: "Search pages" })
    const input = within(dialog).getByRole("combobox", {
      name: "Search workspace pages",
    })
    await waitFor(() => expect(input).toHaveFocus())

    await user.type(input, "archived")
    expect(within(dialog).getAllByRole("option")).toHaveLength(1)
    expect(
      within(within(dialog).getByRole("group", { name: "Projects" })).getByRole(
        "option",
        { name: "Archived" }
      )
    ).toBeVisible()

    await user.clear(input)
    await user.type(input, "settings")
    expect(within(dialog).getAllByRole("option")).toHaveLength(10)
    const settings = within(dialog).getByRole("group", { name: "Settings" })
    expect(
      within(settings).getByRole("option", { name: "Preferences" })
    ).toBeVisible()
    expect(
      within(settings).getByRole("option", {
        name: "Keyboard shortcuts",
      })
    ).toBeVisible()
    expect(
      within(settings).getByRole("option", { name: "Task assignments" })
    ).toBeVisible()

    await user.clear(input)
    await user.type(input, "no-such-page")
    expect(within(dialog).queryByRole("option")).not.toBeInTheDocument()
    expect(within(dialog).getByText("No pages found")).toBeVisible()
  })

  it("navigates from a result, closes search and clears the next query", async () => {
    const { router, user } = renderWorkspace()
    const headerInput = screen.getByRole("textbox", { name: "Search pages" })
    await user.type(headerInput, "archived")
    await user.keyboard("{Enter}")
    await user.click(screen.getByRole("option", { name: "Archived" }))

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

    expect(headerInput).toHaveValue("")
    await user.click(headerInput)
    await user.keyboard("{Enter}")
    expect(screen.getByRole("combobox")).toHaveValue("")
  })

  it("moves between filtered commands with ArrowDown and navigates with Enter", async () => {
    const { router, user } = renderWorkspace()
    await user.type(
      screen.getByRole("textbox", { name: "Search pages" }),
      "projects"
    )
    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog", { name: "Search pages" })
    const input = within(dialog).getByRole("combobox", {
      name: "Search workspace pages",
    })
    await waitFor(() => expect(input).toHaveFocus())
    const first = within(dialog).getByRole("option", { name: "All projects" })
    const archived = within(dialog).getByRole("option", { name: "Archived" })
    expect(within(dialog).getAllByRole("option")).toHaveLength(2)
    await waitFor(() => expect(first).toHaveAttribute("aria-selected", "true"))

    await user.keyboard("{ArrowDown}")
    expect(archived).toHaveAttribute("aria-selected", "true")
    expect(first).toHaveAttribute("aria-selected", "false")
    await user.keyboard("{Enter}")

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects/archived")
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(screen.getByRole("textbox", { name: "Search pages" })).toHaveValue(
      ""
    )
  })

  it.each(["Control", "Meta"])(
    "opens with %s+K and restores focus on Escape",
    async (modifier) => {
      const { user } = renderWorkspace()
      const headerInput = screen.getByRole("textbox", { name: "Search pages" })
      await user.type(headerInput, "archived")
      await user.keyboard(`{${modifier}>}k{/${modifier}}`)
      const dialog = screen.getByRole("dialog", { name: "Search pages" })
      expect(dialog).toBeVisible()
      expect(
        within(dialog).getByRole("combobox", {
          name: "Search workspace pages",
        })
      ).toHaveValue("")
      await user.keyboard("{Escape}")
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
      await waitFor(() =>
        expect(
          screen.getByRole("textbox", { name: "Search pages" })
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
