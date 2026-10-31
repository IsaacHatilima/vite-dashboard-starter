import type * as React from "react"
import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void
  loginHref: string
}

export function ForgotPasswordForm({
  onSubmit,
  loginHref,
}: ForgotPasswordFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email")
    onSubmit(typeof email === "string" ? email : "")
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it"
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
          />
          <Field>
            <Button type="submit">Email password reset link</Button>
            <FieldDescription className="text-center">
              Remembered it? <Link to={loginHref}>Back to login</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
