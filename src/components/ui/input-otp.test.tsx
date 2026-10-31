import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { createRef, type ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp"

function OTPField({
  maxLength = 6,
  ...props
}: Omit<
  ComponentProps<typeof InputOTP>,
  "children" | "render" | "maxLength"
> & {
  maxLength?: number
}) {
  return (
    <InputOTP maxLength={maxLength} {...props}>
      <InputOTPGroup>
        {Array.from({ length: maxLength }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

describe("InputOTP", () => {
  it("forwards native attributes and ref, accepts digits, and completes six characters", async () => {
    const user = userEvent.setup()
    const inputRef = createRef<HTMLInputElement>()
    const onComplete = vi.fn()
    render(
      <form aria-label="Verify code">
        <label htmlFor="code">Authentication code</label>
        <OTPField
          id="code"
          name="code"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={REGEXP_ONLY_DIGITS}
          onComplete={onComplete}
        />
      </form>
    )
    const input = screen.getByLabelText("Authentication code")
    expect(inputRef.current).toBe(input)
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")

    await user.type(input, "12a34b567")

    expect(input).toHaveValue("123456")
    expect(onComplete).toHaveBeenCalledWith("123456")
    expect(
      new FormData(screen.getByRole<HTMLFormElement>("form")).get("code")
    ).toBe("123456")
  })

  it("supports pasting, replacing, and deleting a code", async () => {
    const user = userEvent.setup()
    render(<OTPField aria-label="Verification code" />)
    const input = screen.getByLabelText("Verification code")

    await user.click(input)
    await user.paste("654321")
    expect(input).toHaveValue("654321")

    await user.clear(input)
    await user.paste("123456")
    expect(input).toHaveValue("123456")

    await user.keyboard("{Backspace}")
    expect(input).toHaveValue("12345")
  })

  it("keeps separate inputs independent and honors each maxLength", async () => {
    const user = userEvent.setup()
    render(
      <>
        <OTPField aria-label="First code" maxLength={4} />
        <OTPField aria-label="Second code" />
      </>
    )
    const first = screen.getByLabelText("First code")
    const second = screen.getByLabelText("Second code")

    await user.type(first, "123456")
    await user.type(second, "654321")

    expect(first).toHaveValue("1234")
    expect(second).toHaveValue("654321")
  })

  it("respects disabled input behavior", async () => {
    const user = userEvent.setup()
    render(<OTPField aria-label="Disabled code" disabled />)
    const input = screen.getByLabelText("Disabled code")

    await user.type(input, "123456")

    expect(input).toBeDisabled()
    expect(input).toHaveValue("")
  })
})
