import type * as React from "react"
import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"

const PASSWORD_MIN_LENGTH = 8

interface ResetPasswordFormProps {
  email: string
  onSubmit: () => void
  loginHref: string
}

export function ResetPasswordForm({
  email,
  onSubmit,
  loginHref,
}: ResetPasswordFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Choose a new password for your account"
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="username"
            defaultValue={email}
            required
          />
          <TextField
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            required
          />
          <TextField
            id="password-confirmation"
            name="passwordConfirmation"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
          />
          <Field>
            <Button type="submit">Reset password</Button>
            <FieldDescription className="text-center">
              Remembered it? <Link to={loginHref}>Back to login</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
