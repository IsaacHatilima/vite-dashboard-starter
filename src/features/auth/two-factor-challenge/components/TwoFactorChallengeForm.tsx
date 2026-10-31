import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useState } from "react"
import type * as React from "react"
import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const TWO_FACTOR_CODE_LENGTH = 6

type ChallengeMode = "code" | "recovery"

interface TwoFactorChallengeFormProps {
  onSubmit: () => void
  loginHref: string
}

const COPY: Record<ChallengeMode, { description: string; switchTo: string }> = {
  code: {
    description: "Enter the code from your authenticator app",
    switchTo: "Use a recovery code instead",
  },
  recovery: {
    description: "Enter one of the recovery codes you saved",
    switchTo: "Use an authentication code instead",
  },
}

export function TwoFactorChallengeForm({
  onSubmit,
  loginHref,
}: TwoFactorChallengeFormProps) {
  const [mode, setMode] = useState<ChallengeMode>("code")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <AuthCard
      title="Two-factor authentication"
      description={COPY[mode].description}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          {mode === "code" ? (
            <Field className="items-center">
              <FieldLabel htmlFor="code" className="sr-only">
                Authentication code
              </FieldLabel>
              <InputOTP
                id="code"
                name="code"
                maxLength={TWO_FACTOR_CODE_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                autoComplete="one-time-code"
                autoFocus
              >
                <InputOTPGroup>
                  {Array.from(
                    { length: TWO_FACTOR_CODE_LENGTH },
                    (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    )
                  )}
                </InputOTPGroup>
              </InputOTP>
            </Field>
          ) : (
            <TextField
              name="recoveryCode"
              label="Recovery code"
              autoComplete="off"
              autoFocus
              required
            />
          )}
          <Field>
            <Button type="submit">Continue</Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setMode(mode === "code" ? "recovery" : "code")}
            >
              {COPY[mode].switchTo}
            </Button>
            <FieldDescription className="text-center">
              Not you? <Link to={loginHref}>Back to login</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
