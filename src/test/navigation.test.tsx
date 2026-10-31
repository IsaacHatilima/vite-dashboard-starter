import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { expectPath, renderApp } from "./render-app"

type User = ReturnType<typeof renderApp>["user"]

async function clickButton(user: User, name: string) {
  await user.click(await screen.findByRole("button", { name }))
}

async function clickLink(user: User, name: string) {
  await user.click(await screen.findByRole("link", { name }))
}

describe("auth screens", () => {
  it("starts at login", async () => {
    const { router } = renderApp("/")

    await screen.findByRole("heading", { name: "Welcome back" })
    expect(router.state.location.pathname).toBe("/login")
  })

  it("logs in to the dashboard, even with empty fields", async () => {
    const { router, user } = renderApp("/login")

    await clickButton(user, "Login")

    await expectPath(router, "/dashboard")
    expect(await screen.findByText(/Welcome back,/)).toBeVisible()
  })

  it("links login to forgot password and sign up, and back", async () => {
    const { router, user } = renderApp("/login")

    await clickLink(user, "Forgot your password?")
    await screen.findByRole("heading", { name: "Forgot your password?" })
    await clickLink(user, "Back to login")
    await screen.findByRole("heading", { name: "Welcome back" })

    await clickLink(user, "Sign up")
    await screen.findByRole("heading", { name: "Create an account" })
    await clickLink(user, "Log in")

    await expectPath(router, "/login")
  })

  it("registers, then verifies the email, then opens the dashboard", async () => {
    const { router, user } = renderApp("/register")

    await user.type(await screen.findByLabelText("Email"), "new@example.com")
    await clickButton(user, "Create account")

    await screen.findByRole("heading", { name: "Verify your email" })
    expect(screen.getByText("new@example.com")).toBeVisible()

    await clickButton(user, "Resend verification email")
    expect(
      screen.getByText("A new verification link is on its way.")
    ).toBeVisible()

    await clickLink(user, "I've verified my email")
    await expectPath(router, "/dashboard")
  })

  it("logs out from the verify-email screen", async () => {
    const { router, user } = renderApp("/verify-email")

    expect(await screen.findByText(/your email address/)).toBeVisible()
    await clickLink(user, "Log out")

    await expectPath(router, "/login")
  })

  it("goes from forgot password to reset password, then back to login", async () => {
    const { router, user } = renderApp("/forgot-password")

    await user.type(await screen.findByLabelText("Email"), "me@example.com")
    await clickButton(user, "Email password reset link")

    await screen.findByRole("heading", { name: "Reset your password" })
    expect(screen.getByLabelText("Email")).toHaveValue("me@example.com")

    await clickButton(user, "Reset password")

    expect(
      await screen.findByText(/Your password has been reset/)
    ).toBeVisible()
    expect(router.state.location.pathname).toBe("/login")
    // Cleared from history, so a reload won't show it again.
    expect(router.state.location.state).toBeNull()
  })

  it("continues from two-factor to the dashboard, in either mode", async () => {
    const { router, user } = renderApp("/two-factor-challenge")

    expect(await screen.findByLabelText("Authentication code")).toBeVisible()
    await clickButton(user, "Use a recovery code instead")
    expect(screen.getByLabelText("Recovery code")).toBeVisible()
    await clickButton(user, "Continue")

    await expectPath(router, "/dashboard")
  })

  it("confirms the password and continues to the page it guards", async () => {
    const { router, user } = renderApp(
      "/confirm-password?redirect=%2Fsettings%2Fsecurity"
    )

    await clickButton(user, "Confirm")

    await expectPath(router, "/settings/security")
  })

  it("never continues to another site after confirming", async () => {
    const { router, user } = renderApp(
      "/confirm-password?redirect=https%3A%2F%2Fevil.example"
    )

    await clickButton(user, "Confirm")

    await expectPath(router, "/dashboard")
  })
})

describe("dashboard", () => {
  it("logs out from the user menu", async () => {
    const { router, user } = renderApp("/dashboard")

    await user.click(await screen.findByRole("button", { name: /Demo User/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }))

    await expectPath(router, "/login")
  })

  it("renders unknown pages inside the shell", async () => {
    renderApp("/nowhere")

    expect(
      await screen.findByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Back to dashboard" })
    ).toBeVisible()
  })

  it("sends /settings to the profile page", async () => {
    const { router } = renderApp("/settings")

    await expectPath(router, "/settings/profile")
  })
})
