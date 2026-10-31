import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentType, ReactNode } from "react"
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router"
import { afterEach, describe, expect, it } from "vitest"

import {
  CardAuthShell,
  MinimalAuthShell,
  PhotoAuthShell,
  SplitAuthShell,
} from "@/components/auth-shells"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { routes } from "@/config/routes"
import { appRoutes } from "@/router"

type AuthShell = ComponentType<{ children: ReactNode }>

function renderAuthShell(Shell: AuthShell, path: string) {
  const shellRoutes = appRoutes.map((route): RouteObject => {
    if (route.index) {
      return route
    }

    return {
      ...route,
      children: route.children?.map((child) => {
        if (child.children?.some((screen) => screen.path === routes.login)) {
          return {
            ...child,
            element: (
              <Shell>
                <Outlet />
              </Shell>
            ),
          }
        }

        return child
      }),
    }
  })
  const router = createMemoryRouter(shellRoutes, { initialEntries: [path] })
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
  ["SplitAuthShell", SplitAuthShell],
  ["CardAuthShell", CardAuthShell],
  ["MinimalAuthShell", MinimalAuthShell],
  ["PhotoAuthShell", PhotoAuthShell],
] as const

const screens = [
  {
    path: routes.login,
    heading: "Welcome back",
    labels: ["Email", "Password"],
    link: "Sign up",
    href: routes.register,
  },
  {
    path: routes.register,
    heading: "Create an account",
    labels: ["Name", "Email", "Password", "Confirm password"],
    link: "Log in",
    href: routes.login,
  },
  {
    path: routes.forgotPassword,
    heading: "Forgot your password?",
    labels: ["Email"],
    link: "Back to login",
    href: routes.login,
  },
  {
    path: routes.resetPassword,
    heading: "Reset your password",
    labels: ["Email", "New password", "Confirm new password"],
    link: "Back to login",
    href: routes.login,
  },
  {
    path: routes.verifyEmail,
    heading: "Verify your email",
    labels: [],
    link: "Log out",
    href: routes.login,
  },
  {
    path: routes.twoFactorChallenge,
    heading: "Two-factor authentication",
    labels: ["Authentication code"],
    link: "Back to login",
    href: routes.login,
  },
  {
    path: routes.confirmPassword,
    heading: "Confirm your password",
    labels: ["Password"],
    link: "Cancel",
    href: routes.dashboard,
  },
] as const

describe.each(shells)("%s", (_, Shell) => {
  it.each(screens)(
    "renders $path with the shared auth contract",
    async (page) => {
      renderAuthShell(Shell, page.path)

      const heading = await screen.findByRole("heading", {
        name: page.heading,
        level: 1,
      })
      expect(screen.getAllByRole("main")).toHaveLength(1)
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
      expect(
        within(screen.getByRole("main")).getByRole("heading", {
          name: page.heading,
          level: 1,
        })
      ).toBe(heading)
      for (const label of page.labels) {
        expect(screen.getByLabelText(label)).toBeVisible()
      }
      expect(screen.getByRole("link", { name: page.link })).toHaveAttribute(
        "href",
        page.href
      )
    }
  )

  it("keeps the registration email through verification", async () => {
    const { router, user } = renderAuthShell(Shell, routes.register)
    await user.type(await screen.findByLabelText("Email"), "new@example.com")
    await user.click(screen.getByRole("button", { name: "Create account" }))

    await screen.findByRole("heading", { name: "Verify your email" })
    expect(screen.getByText("new@example.com")).toBeVisible()
    await user.click(
      screen.getByRole("button", { name: "Resend verification email" })
    )
    expect(
      screen.getByText("A new verification link is on its way.")
    ).toBeVisible()
    await user.click(
      screen.getByRole("link", { name: "I've verified my email" })
    )
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(routes.dashboard)
    )
  })

  it("carries the reset email and returns to a working login", async () => {
    const { router, user } = renderAuthShell(Shell, routes.login)
    await user.click(
      await screen.findByRole("link", { name: "Forgot your password?" })
    )
    await user.type(await screen.findByLabelText("Email"), "me@example.com")
    await user.click(
      screen.getByRole("button", { name: "Email password reset link" })
    )

    await screen.findByRole("heading", { name: "Reset your password" })
    expect(screen.getByLabelText("Email")).toHaveValue("me@example.com")
    await user.click(screen.getByRole("button", { name: "Reset password" }))

    await screen.findByRole("heading", { name: "Welcome back" })
    expect(screen.getByText(/Your password has been reset/)).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Login" }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(routes.dashboard)
    )
  })

  it.each(["code", "recovery"] as const)(
    "continues from the two-factor %s form",
    async (mode) => {
      const { router, user } = renderAuthShell(Shell, routes.twoFactorChallenge)
      const code = await screen.findByLabelText("Authentication code")
      if (mode === "recovery") {
        await user.click(
          screen.getByRole("button", { name: "Use a recovery code instead" })
        )
        await user.type(screen.getByLabelText("Recovery code"), "saved-code")
        expect(
          screen.queryByLabelText("Authentication code")
        ).not.toBeInTheDocument()
      } else {
        await user.type(code, "123456")
        expect(code).toHaveValue("123456")
      }

      await user.click(screen.getByRole("button", { name: "Continue" }))
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(routes.dashboard)
      )
    }
  )
})
