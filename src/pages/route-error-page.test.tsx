import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { RouteErrorPage } from "./route-error-page"

function Broken(): never {
  throw new Error("render failed")
}

describe("RouteErrorPage", () => {
  it("explains the failure and offers a reload", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const reload = vi.fn()
    vi.stubGlobal("location", { ...window.location, reload })
    const router = createMemoryRouter([
      { path: "/", element: <Broken />, errorElement: <RouteErrorPage /> },
    ])

    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole("heading", { name: "Something went wrong" })
    ).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "Reload page" }))
    expect(reload).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      "[router] Unhandled route error",
      expect.any(Error)
    )
  })
})
