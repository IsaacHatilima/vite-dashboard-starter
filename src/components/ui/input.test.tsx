import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef, useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Input } from "./input"

function ControlledNumber() {
  const [value, setValue] = useState("")
  return (
    <>
      <Input
        aria-label="Quantity"
        type="number"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <output aria-label="Current quantity">{value}</output>
    </>
  )
}

describe("Input", () => {
  it("defaults to text and forwards native attributes, refs, and changes", async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLInputElement>()
    const onChange = vi.fn()
    render(
      <Input
        aria-label="Project name"
        name="project"
        ref={ref}
        autoComplete="organization"
        onChange={onChange}
      />
    )
    const input = screen.getByRole("textbox", { name: "Project name" })

    expect(input).toHaveAttribute("type", "text")
    expect(input).toHaveAttribute("name", "project")
    expect(input).toHaveAttribute("autocomplete", "organization")
    expect(ref.current).toBe(input)
    await user.type(input, "Project 42")
    expect(input).toHaveValue("Project 42")
    expect(onChange).toHaveBeenCalled()
  })

  it("keeps password values in a native masked password input", async () => {
    const user = userEvent.setup()
    render(
      <Input
        aria-label="Password"
        type="password"
        autoComplete="current-password"
      />
    )
    const input = screen.getByLabelText("Password")

    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveAttribute("autocomplete", "current-password")
    await user.type(input, "aB!23@example")
    expect(input).toHaveValue("aB!23@example")
  })

  it("allows partial email typing and validates the complete address", async () => {
    const user = userEvent.setup()
    render(<Input aria-label="Email" type="email" />)
    const input = screen.getByLabelText<HTMLInputElement>("Email")

    expect(input.checkValidity()).toBe(true)
    await user.type(input, "person")
    expect(input).toHaveValue("person")
    expect(input.validity.typeMismatch).toBe(true)
    expect(input.checkValidity()).toBe(false)
    await user.type(input, "+work@example.com")
    expect(input).toHaveValue("person+work@example.com")
    expect(input.checkValidity()).toBe(true)
  })

  it("honors required email validation", () => {
    render(<Input aria-label="Email" type="email" required />)
    const input = screen.getByLabelText<HTMLInputElement>("Email")

    expect(input.validity.valueMissing).toBe(true)
    expect(input.checkValidity()).toBe(false)
  })

  it("accepts numbers, decimals, and negative values without letters or exponents", async () => {
    const user = userEvent.setup()
    render(<Input aria-label="Quantity" type="number" />)
    const input = screen.getByRole("spinbutton", { name: "Quantity" })

    await user.type(input, "1a2eE+3")

    expect(input).toHaveValue(123)
    expect(input).toHaveAttribute("inputmode", "decimal")
    expect(input).toHaveAttribute("step", "any")
    expect(input).not.toHaveAttribute("min")
    await user.clear(input)
    expect(input).toHaveValue(null)
    await user.type(input, "-12.5")
    expect(input).toHaveValue(-12.5)
    expect(input).toBeValid()
  })

  it("accepts number pastes and rejects invalid pastes without changing the value", async () => {
    const user = userEvent.setup()
    const onPaste = vi.fn()
    render(<Input aria-label="Quantity" type="number" onPaste={onPaste} />)
    const input = screen.getByRole("spinbutton", { name: "Quantity" })

    await user.click(input)
    await user.paste("123")
    expect(input).toHaveValue(123)
    await user.paste("e4")
    expect(input).toHaveValue(123)
    await user.paste("1.2.3")
    expect(input).toHaveValue(123)
    expect(onPaste).toHaveBeenCalledTimes(3)
    await user.clear(input)
    await user.paste("-1.5")
    expect(input).toHaveValue(-1.5)
  })

  it("preserves explicit numeric range, step, and keyboard overrides", async () => {
    const user = userEvent.setup()
    render(
      <Input
        aria-label="Quantity"
        type="number"
        min={-10}
        max={20}
        step={0.5}
        inputMode="numeric"
      />
    )
    const input = screen.getByRole<HTMLInputElement>("spinbutton", {
      name: "Quantity",
    })

    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("step", "0.5")
    await user.type(input, "1.5")
    expect(input.checkValidity()).toBe(true)
    await user.clear(input)
    await user.type(input, "1.4")
    expect(input.validity.stepMismatch).toBe(true)
    await user.clear(input)
    await user.type(input, "-11")
    expect(input.validity.rangeUnderflow).toBe(true)
    await user.clear(input)
    await user.type(input, "21")
    expect(input.validity.rangeOverflow).toBe(true)
  })

  it("keeps controlled numeric changes in sync and supports clearing", async () => {
    const user = userEvent.setup()
    render(<ControlledNumber />)
    const input = screen.getByRole("spinbutton", { name: "Quantity" })

    await user.type(input, "-12.5")
    expect(input).toHaveValue(-12.5)
    expect(screen.getByLabelText("Current quantity")).toHaveTextContent("-12.5")
    await user.clear(input)
    expect(input).toHaveValue(null)
    expect(screen.getByLabelText("Current quantity")).toBeEmptyDOMElement()
    await user.paste("45")
    expect(input).toHaveValue(45)
    expect(screen.getByLabelText("Current quantity")).toHaveTextContent("45")
  })

  it("preserves consumer cancellation and keyboard shortcuts", async () => {
    const user = userEvent.setup()
    const shortcuts = vi.fn()
    render(
      <Input
        aria-label="Quantity"
        type="number"
        onKeyDown={(event) => {
          if (event.ctrlKey && event.key === "c") {
            shortcuts(event.defaultPrevented)
          }
          if (event.key === "4") event.preventDefault()
        }}
        onPaste={(event) => event.preventDefault()}
      />
    )
    const input = screen.getByRole("spinbutton", { name: "Quantity" })

    await user.type(input, "124")
    expect(input).toHaveValue(12)
    await user.keyboard("{Control>}c{/Control}")
    expect(shortcuts).toHaveBeenCalledWith(false)
    await user.paste("56")
    expect(input).toHaveValue(12)
  })
})
