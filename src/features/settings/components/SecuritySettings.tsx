import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function SecuritySettings() {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-6">
      <PageTitle title="Password" />
      <h1 className="sr-only">Password</h1>
      <form onSubmit={(event) => event.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Keep your account secure with a unique password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-wrap gap-3">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">
              Password changes are unavailable in this preview.
            </p>
            <Button type="submit" disabled>
              Update password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  )
}
