import type * as React from "react"
import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"

interface ConfirmPasswordFormProps {
  onSubmit: () => void
  cancelHref: string
}

export function ConfirmPasswordForm({
  onSubmit,
  cancelHref,
}: ConfirmPasswordFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <AuthCard
      title="Confirm your password"
      description="This is a secure area. Confirm your password to continue."
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
          />
          <Field>
            <Button type="submit">Confirm</Button>
            <FieldDescription className="text-center">
              <Link to={cancelHref}>Cancel</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
