import { Link } from "react-router"

import { AuthCard } from "@/components/auth-card"
import { FormAlert } from "@/components/form-alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"

interface VerifyEmailNoticeProps {
  email: string | null
  sent: boolean
  onResend: () => void
  continueHref: string
  logoutHref: string
}

export function VerifyEmailNotice({
  email,
  sent,
  onResend,
  continueHref,
  logoutHref,
}: VerifyEmailNoticeProps) {
  return (
    <AuthCard
      title="Verify your email"
      description={
        <>
          We sent a verification link to{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "your email address"
          )}
          . Open it to finish setting up your account.
        </>
      }
    >
      <FieldGroup>
        <FormAlert
          message={sent ? "A new verification link is on its way." : null}
          tone="success"
        />
        <Field>
          <Button onClick={onResend}>Resend verification email</Button>
          <Link
            to={continueHref}
            className={buttonVariants({ variant: "outline" })}
          >
            I&apos;ve verified my email
          </Link>
          <Link
            to={logoutHref}
            className={buttonVariants({ variant: "ghost" })}
          >
            Log out
          </Link>
        </Field>
      </FieldGroup>
    </AuthCard>
  )
}
