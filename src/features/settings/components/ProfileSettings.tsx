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
import { placeholderUser } from "@/config/app"

export default function ProfileSettings() {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-6">
      <PageTitle title="Profile" />
      <h1 className="sr-only">Profile</h1>
      <form onSubmit={(event) => event.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Manage the details associated with your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                <Input
                  id="profile-name"
                  name="name"
                  autoComplete="name"
                  defaultValue={placeholderUser.name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input
                  id="profile-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={placeholderUser.email}
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-wrap gap-3">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">
              Profile changes are unavailable in this preview.
            </p>
            <Button type="submit" disabled>
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  )
}
