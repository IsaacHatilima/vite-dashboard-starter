import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"
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
    <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  )
  return { router, user: userEvent.setup() }
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("light", "dark")
})

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

  it("opens settings from the account popup rather than app navigation", async () => {
    const { router, user } = renderShell(Shell, "/dashboard")

    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull()
    for (const name of ["Profile", "Password", "Preferences", "Sessions"]) {
      expect(screen.queryByRole("link", { name })).toBeNull()
    }

    await user.click(
      screen.getByRole("button", { name: new RegExp(placeholderUser.name) })
    )
    expect(
      await screen.findByRole("menuitem", { name: "Profile" })
    ).toBeVisible()
    expect(screen.queryByRole("menuitem", { name: "Security" })).toBeNull()
    await user.click(screen.getByRole("menuitem", { name: "Settings" }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/settings")
    )
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
  })

  it("changes the theme from the account menu without closing it", async () => {
    const { user } = renderShell(Shell, "/dashboard")
    await user.click(
      screen.getByRole("button", { name: new RegExp(placeholderUser.name) })
    )

    const light = await screen.findByRole("menuitemradio", { name: "Light" })
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(3)
    const dark = screen.getByRole("menuitemradio", { name: "Dark" })
    const system = screen.getByRole("menuitemradio", { name: "System" })
    expect(light).toHaveAttribute("aria-checked", "true")

    await user.click(dark)
    expect(dark).toHaveAttribute("aria-checked", "true")
    expect(light).toHaveAttribute("aria-checked", "false")
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("dark")
    expect(screen.getByRole("menu")).toBeVisible()

    await user.click(light)
    expect(light).toHaveAttribute("aria-checked", "true")
    expect(document.documentElement).toHaveClass("light")
    expect(localStorage.getItem("theme")).toBe("light")

    await user.click(system)
    expect(system).toHaveAttribute("aria-checked", "true")
    expect(light).toHaveAttribute("aria-checked", "false")
    // The default test media query resolves the system preference to light.
    expect(document.documentElement).toHaveClass("light")
    expect(localStorage.getItem("theme")).toBe("system")
    expect(screen.getByRole("menu")).toBeVisible()
  })

  it("supports keyboard theme selection and returns focus on Escape", async () => {
    const { user } = renderShell(Shell, "/dashboard")
    const trigger = screen.getByRole("button", {
      name: new RegExp(placeholderUser.name),
    })
    trigger.focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("menuitemradio", { name: "Light" })

    await user.keyboard("{Home}{ArrowDown}{ArrowDown}{ArrowDown}")
    const dark = screen.getByRole("menuitemradio", { name: "Dark" })
    await waitFor(() => expect(dark).toHaveFocus())
    await user.keyboard("{Enter}")

    expect(dark).toHaveAttribute("aria-checked", "true")
    expect(document.documentElement).toHaveClass("dark")
    expect(screen.getByRole("menu")).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    )
    await waitFor(() => expect(trigger).toHaveFocus())
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
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull()
    expect(
      within(panel("Settings")).getByRole("link", { name: "Password" })
    ).toHaveAttribute("aria-current", "page")
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

    await user.click(screen.getByRole("button", { name: "Projects" }))
    await user.click(
      within(panel("Projects").closest("div.h-full")!).getByRole("button", {
        name: "Toggle sidebar",
      })
    )

    expect(sidebarState()).toBe("expanded")
    expect(screen.getByRole("heading", { name: "Projects" })).toBeVisible()
    expect(
      screen.getAllByRole("navigation", { name: "Projects pages" })
    ).toHaveLength(1)
  })

  it("opens Settings from the collapsed account popup and restores collapse focus", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    await collapse(user)
    const account = screen.getByRole("button", {
      name: `Account menu for ${placeholderUser.name}`,
    })

    await user.click(account)
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/settings")
    )
    expect(sidebarState()).toBe("expanded")
    expect(panel("Settings")).toBeVisible()
    expect(
      screen.getAllByRole("navigation", { name: "Settings pages" })
    ).toHaveLength(1)
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull()

    await collapse(user)
    await waitFor(() => expect(account).toHaveFocus())
  })

  it("reselects Settings from the popup even when the destination is unchanged", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    const account = screen.getByRole("button", {
      name: `Account menu for ${placeholderUser.name}`,
    })

    await user.click(account)
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/settings")
    )
    expect(panel("Settings")).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Projects" }))
    expect(panel("Projects")).toBeVisible()
    expect(router.state.location.pathname).toBe("/settings")

    await user.click(account)
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }))

    expect(router.state.location.pathname).toBe("/settings")
    expect(panel("Settings")).toBeVisible()
    expect(
      screen.queryByRole("navigation", { name: "Projects pages" })
    ).toBeNull()
  })
})

describe("RailShell command search", () => {
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

  it.each([
    ["Meta", "expanded", "k"],
    ["Meta", "collapsed", "K"],
    ["Control", "expanded", "K"],
    ["Control", "collapsed", "k"],
  ] as const)(
    "toggles search with %s+K in the %s rail, including while typing",
    async (modifier, mode, key) => {
      const { router, user } = renderShell(RailShell, "/dashboard")
      if (mode === "collapsed") {
        await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
        await user.click(screen.getByRole("button", { name: "Team" }))
        expect(
          screen.getByRole("navigation", { name: "Team pages" })
        ).toBeVisible()
      }
      const search = screen.getByRole("button", { name: "Search commands" })
      await user.keyboard("k")
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

      const shortcut = new KeyboardEvent("keydown", {
        key,
        metaKey: modifier === "Meta",
        ctrlKey: modifier === "Control",
        bubbles: true,
        cancelable: true,
      })
      fireEvent(window, shortcut)
      expect(shortcut.defaultPrevented).toBe(true)
      const input = within(
        await screen.findByRole("dialog", { name: "Search commands" })
      ).getByRole("combobox", { name: "Search workspace commands" })
      await waitFor(() => expect(input).toHaveFocus())
      expect(search).toHaveAttribute("aria-keyshortcuts", "Meta+K Control+K")
      if (mode === "collapsed") {
        expect(
          screen.queryByRole("navigation", {
            name: "Team pages",
            hidden: true,
          })
        ).not.toBeInTheDocument()
      }

      await user.type(input, "archived")
      await user.keyboard(`{${modifier}>}k{/${modifier}}`)
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
      await user.keyboard(`{${modifier}>}k{/${modifier}}`)
      const reopened = within(
        await screen.findByRole("dialog", { name: "Search commands" })
      ).getByRole("combobox", { name: "Search workspace commands" })
      expect(reopened).toHaveValue("")
      await waitFor(() => expect(reopened).toHaveFocus())
      await user.keyboard("{Escape}")
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
      expect(router.state.location.pathname).toBe("/dashboard")
    }
  )

  it.each(["expanded", "collapsed"])(
    "places search above Dashboard in the %s rail and restores focus after dismissal",
    async (mode) => {
      const { router, user } = renderShell(RailShell, "/dashboard")
      if (mode === "collapsed") {
        await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
      }
      const search = screen.getByRole("button", { name: "Search commands" })
      const dashboard = screen.getByRole("button", { name: "Dashboard" })
      expect(
        search.compareDocumentPosition(dashboard) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).not.toBe(0)

      await user.click(search)
      const dialog = await screen.findByRole("dialog", {
        name: "Search commands",
      })
      expect(dialog).toHaveClass("top-[12svh]", "translate-y-0")
      const input = within(dialog).getByRole("combobox", {
        name: "Search workspace commands",
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
      await waitFor(() =>
        expect(
          within(dialog).getByRole("combobox", {
            name: "Search workspace commands",
          })
        ).toHaveFocus()
      )

      await user.keyboard("{Escape}")
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Search commands" })
        ).not.toBeInTheDocument()
      )
      await waitFor(() => expect(search).toHaveFocus())
      expect(router.state.location.pathname).toBe("/dashboard")

      await user.click(search)
      const reopened = await screen.findByRole("dialog", {
        name: "Search commands",
      })
      await user.click(
        within(reopened).getByRole("button", { name: "Close search" })
      )
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Search commands" })
        ).not.toBeInTheDocument()
      )
      await waitFor(() => expect(search).toHaveFocus())
    }
  )

  it("filters pages, runs a keyboard-selected result, and clears the next query", async () => {
    const { router, user } = renderShell(RailShell, "/dashboard")
    await user.keyboard("{Control>}k{/Control}")
    const dialog = await screen.findByRole("dialog", {
      name: "Search commands",
    })
    const input = within(dialog).getByRole("combobox", {
      name: "Search workspace commands",
    })

    await user.type(input, "projects")
    const archived = within(dialog).getByRole("option", { name: "Archived" })
    expect(within(dialog).getAllByRole("option")).toHaveLength(2)
    await waitFor(() =>
      expect(
        within(dialog).getByRole("option", { name: "All projects" })
      ).toHaveAttribute("aria-selected", "true")
    )
    await user.keyboard("{ArrowDown}")
    await waitFor(() =>
      expect(archived).toHaveAttribute("aria-selected", "true")
    )
    await user.keyboard("{Enter}")

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects/archived")
    )
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Search commands" })
      ).not.toBeInTheDocument()
    )

    await user.keyboard("{Meta>}k{/Meta}")
    expect(
      within(screen.getByRole("dialog", { name: "Search commands" })).getByRole(
        "combobox",
        { name: "Search workspace commands" }
      )
    ).toHaveValue("")
  })

  it("opens search from a closed mobile sidebar and keeps the sidebar on Escape", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
    const { user } = renderShell(RailShell, "/dashboard")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await user.keyboard("{Control>}k{/Control}")
    const input = within(
      await screen.findByRole("dialog", { name: "Search commands" })
    ).getByRole("combobox", { name: "Search workspace commands" })
    await waitFor(() => expect(input).toHaveFocus())
    await user.keyboard("{Escape}")

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Search commands" })
      ).not.toBeInTheDocument()
    )
    const sidebar = screen.getByRole("dialog", { name: "Sidebar" })
    expect(sidebar).toBeVisible()
    await user.click(
      within(sidebar).getByRole("button", { name: "Search commands" })
    )
    expect(
      await screen.findByRole("dialog", { name: "Search commands" })
    ).toBeVisible()
  })

  it("includes settings pages and explains an empty result", async () => {
    const { user } = renderShell(RailShell, "/dashboard")
    await user.click(screen.getByRole("button", { name: "Search commands" }))
    const dialog = await screen.findByRole("dialog", {
      name: "Search commands",
    })
    const input = within(dialog).getByRole("combobox", {
      name: "Search workspace commands",
    })

    await user.type(input, "settings")
    expect(
      within(dialog).getByRole("option", { name: "Preferences" })
    ).toBeVisible()
    expect(
      within(dialog).getByRole("option", { name: "Keyboard shortcuts" })
    ).toBeVisible()

    await user.clear(input)
    await user.type(input, "no-such-command")
    expect(within(dialog).queryByRole("option")).not.toBeInTheDocument()
    expect(within(dialog).getByText("No commands found.")).toBeVisible()
  })

  it("returns to the mobile sidebar on Escape and closes navigation after selection", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
    const { router, user } = renderShell(RailShell, "/dashboard")
    const sidebarToggle = screen.getByRole("button", {
      name: /Toggle sidebar/i,
    })
    await user.click(sidebarToggle)
    const sidebar = await screen.findByRole("dialog", { name: "Sidebar" })
    const search = within(sidebar).getByRole("button", {
      name: "Search commands",
    })

    await user.click(search)
    await screen.findByRole("dialog", { name: "Search commands" })
    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Search commands" })
      ).not.toBeInTheDocument()
    )
    expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeVisible()
    await waitFor(() => expect(search).toHaveFocus())

    await user.click(search)
    const dialog = await screen.findByRole("dialog", {
      name: "Search commands",
    })
    await user.type(
      within(dialog).getByRole("combobox", {
        name: "Search workspace commands",
      }),
      "archived"
    )
    await user.click(within(dialog).getByRole("option", { name: "Archived" }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/projects/archived")
    )
    await waitFor(() => expect(screen.queryAllByRole("dialog")).toHaveLength(0))
    await waitFor(() => expect(sidebarToggle).toHaveFocus())
  })

  it("closes the mobile sidebar when selecting the current page", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
    const { router, user } = renderShell(RailShell, "/dashboard")
    const sidebarToggle = screen.getByRole("button", {
      name: /Toggle sidebar/i,
    })
    await user.click(sidebarToggle)
    const sidebar = await screen.findByRole("dialog", { name: "Sidebar" })
    await user.click(
      within(sidebar).getByRole("button", { name: "Search commands" })
    )
    const dialog = await screen.findByRole("dialog", {
      name: "Search commands",
    })
    await user.type(
      within(dialog).getByRole("combobox", {
        name: "Search workspace commands",
      }),
      "overview"
    )
    await user.click(within(dialog).getByRole("option", { name: "Overview" }))

    expect(router.state.location.pathname).toBe("/dashboard")
    await waitFor(() => expect(screen.queryAllByRole("dialog")).toHaveLength(0))
    await waitFor(() => expect(sidebarToggle).toHaveFocus())
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
