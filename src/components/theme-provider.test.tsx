import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { ThemeProvider, useTheme } from "./theme-provider"

function ThemeControls() {
  const { theme, setTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <input aria-label="Notes" />
    </>
  )
}

function renderWithTheme(defaultTheme?: "light" | "dark" | "system") {
  render(
    <ThemeProvider defaultTheme={defaultTheme}>
      <ThemeControls />
    </ThemeProvider>
  )
}

const root = () => document.documentElement

afterEach(() => {
  localStorage.clear()
  root().classList.remove("light", "dark")
})

describe("ThemeProvider", () => {
  it("applies the default theme to <html>", () => {
    renderWithTheme("light")

    expect(root()).toHaveClass("light")
    expect(screen.getByTestId("theme")).toHaveTextContent("light")
  })

  it("resolves the system theme from the colour-scheme query", () => {
    renderWithTheme("system")

    // The test setup's matchMedia never matches, so system means light.
    expect(root()).toHaveClass("light")
  })

  it("remembers a theme the user picks", async () => {
    renderWithTheme("light")

    await userEvent.click(screen.getByRole("button", { name: "Dark" }))

    expect(root()).toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("dark")
  })

  it("starts from the stored theme", () => {
    localStorage.setItem("theme", "dark")
    renderWithTheme("light")

    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
  })

  it("toggles with the D key, but not while typing", async () => {
    renderWithTheme("light")

    await userEvent.type(screen.getByLabelText("Notes"), "d")
    expect(screen.getByTestId("theme")).toHaveTextContent("light")

    fireEvent.keyDown(window, { key: "d" })
    expect(screen.getByTestId("theme")).toHaveTextContent("dark")

    fireEvent.keyDown(window, { key: "d", metaKey: true })
    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
  })

  it("follows a theme change made in another tab", () => {
    renderWithTheme("light")

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "theme",
          newValue: "dark",
          storageArea: localStorage,
        })
      )
    })

    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
  })

  it("refuses to be used outside the provider", () => {
    const original = console.error
    console.error = () => {}
    expect(() => render(<ThemeControls />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    )
    console.error = original
  })
})
