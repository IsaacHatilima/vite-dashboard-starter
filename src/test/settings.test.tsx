import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { isValidElement, type ComponentType } from "react"
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router"
import { afterEach, describe, expect, it } from "vitest"

import {
  ClassicShell,
  InsetShell,
  RailShell,
  WorkspaceShell,
  type ShellProps,
} from "@/components/shells"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { placeholderUser } from "@/config/app"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { appRoutes } from "@/router"

function renderSettings(Shell: ComponentType<ShellProps>, path = "/dashboard") {
  function replaceDashboardShell(route: RouteObject): RouteObject {
    if (route.index) return route

    return {
      ...route,
      element:
        isValidElement(route.element) &&
        route.element.type === DashboardLayout ? (
          <Shell>
            <Outlet />
          </Shell>
        ) : (
          route.element
        ),
      children: route.children?.map(replaceDashboardShell),
    }
  }

  const router = createMemoryRouter(appRoutes.map(replaceDashboardShell), {
    initialEntries: [path],
  })
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
  ["ClassicShell", ClassicShell],
  ["InsetShell", InsetShell],
  ["WorkspaceShell", WorkspaceShell],
  ["RailShell", RailShell],
] as const

describe.each(shells)("%s settings", (_, Shell) => {
  it("marks the current settings page with a trailing slash", async () => {
    renderSettings(Shell, "/settings/security/")

    expect(
      await screen.findByRole("heading", { name: "Security", level: 1 })
    ).toBeVisible()
    const navigation = screen.getByRole("navigation", {
      name: "Settings pages",
    })
    expect(
      within(navigation).getByRole("link", {
        name: "Security",
        current: "page",
      })
    ).toBeVisible()
  })

  it("uses one settings navigation across the three pages entered from the popup", async () => {
    const { router, user } = renderSettings(Shell)
    await user.click(
      screen.getByRole("button", { name: new RegExp(placeholderUser.name) })
    )
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/settings/profile")
    )
    expect(
      await screen.findByRole("heading", { name: "Profile", level: 1 })
    ).toBeVisible()
    expect(screen.getByLabelText("Name")).toHaveValue(placeholderUser.name)
    expect(screen.getByLabelText("Email")).toHaveValue(placeholderUser.email)
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled()

    const navigation = screen.getByRole("navigation", {
      name: "Settings pages",
    })
    expect(
      within(navigation).getByRole("link", { name: "Profile", current: "page" })
    ).toBeVisible()

    for (const [title, path] of [
      ["Security", "/settings/security"],
      ["Appearance", "/settings/appearance"],
      ["Profile", "/settings/profile"],
    ]) {
      await user.click(within(navigation).getByRole("link", { name: title }))
      await waitFor(() => expect(router.state.location.pathname).toBe(path))

      expect(
        await screen.findByRole("heading", { name: title, level: 1 })
      ).toBeVisible()
      expect(
        screen.getAllByRole("navigation", { name: "Settings pages" })
      ).toHaveLength(1)
      expect(screen.getByRole("navigation", { name: "Settings pages" })).toBe(
        navigation
      )
      expect(
        within(navigation).getByRole("link", { name: title, current: "page" })
      ).toHaveAttribute("href", path)

      const breadcrumbs = screen.getByRole("navigation", { name: "breadcrumb" })
      expect(
        within(breadcrumbs).getByRole("link", { name: "Settings" })
      ).toBeVisible()
      expect(within(breadcrumbs).getByText(title)).toHaveAttribute(
        "aria-current",
        "page"
      )
    }
  })
})

describe("settings content", () => {
  it("keeps password updates unavailable while using password controls", async () => {
    renderSettings(ClassicShell, "/settings/security")

    for (const name of [
      "Current password",
      "New password",
      "Confirm new password",
    ]) {
      expect(await screen.findByLabelText(name)).toHaveAttribute(
        "type",
        "password"
      )
    }
    expect(
      screen.getByRole("button", { name: "Update password" })
    ).toBeDisabled()
  })

  it("applies appearance choices to the same theme used by the account popup", async () => {
    const { user } = renderSettings(RailShell, "/settings/appearance")
    await user.click(await screen.findByLabelText("Colour mode"))
    await user.click(await screen.findByRole("menuitemradio", { name: "Dark" }))

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(localStorage.getItem("theme")).toBe("dark")
    await user.click(
      screen.getByRole("button", { name: new RegExp(placeholderUser.name) })
    )
    expect(
      await screen.findByRole("menuitemradio", { name: "Dark" })
    ).toHaveAttribute("aria-checked", "true")
  })
})
