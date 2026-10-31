import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"
import { placeholderUser } from "@/config/app"
import {
  ClassicShell,
  InsetShell,
  RailShell,
  WorkspaceShell,
  type ShellProps,
} from "."
import { initials } from "./shared/shell-user-menu"

function renderShell(Shell: React.ComponentType<ShellProps>, path: string) {
  const router = createMemoryRouter(
    [{ path: "*", element: <Shell>Page body</Shell> }],
    { initialEntries: [path] }
  )
  render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
  return { router, user: userEvent.setup() }
}

const shells = [
  ["InsetShell", InsetShell],
  ["RailShell", RailShell],
  ["ClassicShell", ClassicShell],
  ["WorkspaceShell", WorkspaceShell],
] as const

describe.each(shells)("%s", (_, Shell) => {
  it("renders the page inside a main landmark with a skip link", () => {
    renderShell(Shell, "/dashboard")

    expect(
      within(screen.getByRole("main")).getByText("Page body")
    ).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Skip to main content" })
    ).toHaveAttribute("href", "#main-content")
  })

  it("marks the current page and names it in the breadcrumbs", () => {
    renderShell(Shell, "/projects/archived")

    const breadcrumbs = screen.getByRole("navigation", { name: "breadcrumb" })
    // BreadcrumbPage is aria-current too; count only the sidebar's links.
    const currentInSidebar = screen
      .getAllByRole("link", { current: "page" })
      .filter((link) => !breadcrumbs.contains(link))
    expect(currentInSidebar).toHaveLength(1)
    expect(currentInSidebar[0]).toHaveTextContent("Archived")

    expect(
      within(breadcrumbs).getByRole("link", { name: "Projects" })
    ).toBeVisible()
    expect(within(breadcrumbs).getByText("Archived")).toHaveAttribute(
      "aria-current",
      "page"
    )
  })

  it("shows the user in the menu", () => {
    renderShell(Shell, "/dashboard")

    expect(
      screen.getByRole("button", { name: new RegExp(placeholderUser.name) })
    ).toBeVisible()
  })
})

describe("RailShell", () => {
  const sidebarState = () =>
    document
      .querySelector("[data-slot=sidebar][data-state]")
      ?.getAttribute("data-state")
  const panel = (section: string) =>
    screen.getByRole("navigation", { name: `${section} pages` })

  it("switches the panel from the rail without navigating", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")

    expect(
      within(panel("Dashboard")).getByRole("link", { name: "Analytics" })
    ).toBeVisible()
    const team = screen.getByRole("button", { name: "Team" })
    expect(team).toHaveAttribute("aria-pressed", "false")

    await user.click(team)

    expect(team).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("heading", { name: "Team" })).toBeVisible()
    expect(
      within(panel("Team")).getByRole("link", { name: "Invitations" })
    ).toBeVisible()
    // The rail only changed the menu; the page is still the dashboard.
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  it("navigates from the panel's links", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")

    await user.click(screen.getByRole("button", { name: "Team" }))
    await user.click(
      within(panel("Team")).getByRole("link", { name: "Invitations" })
    )

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/team/invitations")
    )
    expect(
      within(panel("Team")).getByRole("link", { name: "Invitations" })
    ).toHaveAttribute("aria-current", "page")
  })

  it("follows the page into another section", async () => {
    const { router } = renderShell(RailShell, "/dashboard")

    await router.navigate("/settings/security")

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Settings" })).toBeVisible()
    )
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("opens the account menu from the rail's avatar", async () => {
    const { user } = renderShell(RailShell, "/dashboard")

    await user.click(
      screen.getByRole("button", {
        name: `Account menu for ${placeholderUser.name}`,
      })
    )

    expect(
      await screen.findByRole("menuitem", { name: "Log out" })
    ).toBeVisible()
  })

  async function collapse(user: ReturnType<typeof renderShell>["user"]) {
    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
    expect(sidebarState()).toBe("collapsed")
  }

  it("collapses from the panel's own button, like ChatGPT", async () => {
    const { user } = renderShell(RailShell, "/dashboard")

    // Expanded: the toggle sits in the panel header, beside the title, and the
    // page header has none.
    const toggle = screen.getByRole("button", { name: "Toggle sidebar" })
    expect(
      screen.getByRole("heading", { name: "Dashboard" }).parentElement
    ).toContainElement(toggle)
    expect(
      within(screen.getByRole("banner")).queryByRole("button")
    ).not.toBeInTheDocument()

    await collapse(user)

    // Collapsed: just the rail, and still no toggle in the page header.
    expect(
      screen.queryByRole("navigation", { name: "Dashboard pages" })
    ).not.toBeInTheDocument()
    expect(
      within(screen.getByRole("banner")).queryByRole("button")
    ).not.toBeInTheDocument()
    // Focus stays in the rail rather than falling to the page.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Dashboard" })).toHaveFocus()
    )
  })

  it("floats a section's panel while hovering a collapsed rail icon", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    await collapse(user)

    await user.hover(screen.getByRole("button", { name: "Projects" }))

    expect(
      await screen.findByRole("navigation", { name: "Projects pages" })
    ).toBeVisible()
    expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute(
      "aria-expanded",
      "true"
    )
    expect(sidebarState()).toBe("collapsed")
    expect(router.state.location.pathname).toBe("/dashboard")

    await user.unhover(screen.getByRole("button", { name: "Projects" }))

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "Projects pages" })
      ).not.toBeInTheDocument()
    )
  })

  it("opens the card on click without navigating, and Escape closes it", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    await collapse(user)

    await user.click(screen.getByRole("button", { name: "Team" }))

    expect(panel("Team")).toBeVisible()
    expect(router.state.location.pathname).toBe("/dashboard")
    // Inside the collapsed sidebar, shadcn would shrink the links to icon
    // squares and cut their text; the card has to live outside it.
    expect(panel("Team").closest("[data-collapsible=icon]")).toBeNull()

    await user.keyboard("{Escape}")

    expect(
      screen.queryByRole("navigation", { name: "Team pages" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Team" })).toHaveFocus()
  })

  it("navigates from the card and closes it", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    await collapse(user)

    await user.click(screen.getByRole("button", { name: "Team" }))
    await user.click(
      within(panel("Team")).getByRole("link", { name: "Invitations" })
    )

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/team/invitations")
    )
    expect(
      screen.queryByRole("navigation", { name: "Team pages" })
    ).not.toBeInTheDocument()
    expect(sidebarState()).toBe("collapsed")
  })

  it("docks the floating panel from its toggle", async () => {
    const { user } = renderShell(RailShell, "/dashboard")
    await collapse(user)

    await user.click(screen.getByRole("button", { name: "Settings" }))
    await user.click(
      within(panel("Settings").closest("div.h-full")!).getByRole("button", {
        name: "Toggle sidebar",
      })
    )

    expect(sidebarState()).toBe("expanded")
    expect(screen.getByRole("heading", { name: "Settings" })).toBeVisible()
    expect(
      screen.getAllByRole("navigation", { name: "Settings pages" })
    ).toHaveLength(1)
  })
})

describe("initials", () => {
  it("uses up to two words", () => {
    expect(initials("Ada Lovelace")).toBe("AL")
    expect(initials("ada king lovelace")).toBe("AK")
    expect(initials("Cher")).toBe("C")
    expect(initials("   ")).toBe("?")
  })
})
