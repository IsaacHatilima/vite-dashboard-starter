import type * as React from "react"
import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"

const PASSWORD_MIN_LENGTH = 8

interface RegisterFormProps {
  onSubmit: (email: string) => void
  loginHref: string
}

export function RegisterForm({ onSubmit, loginHref }: RegisterFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email")
    onSubmit(typeof email === "string" ? email : "")
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details below to get started"
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <TextField
            name="name"
            label="Name"
            autoComplete="name"
            placeholder="Jane Doe"
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            required
          />
          <TextField
            id="password-confirmation"
            name="passwordConfirmation"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
          />
          <Field>
            <Button type="submit">Create account</Button>
            <FieldDescription className="text-center">
              Already have an account? <Link to={loginHref}>Log in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
