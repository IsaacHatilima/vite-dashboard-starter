import {
  ChevronsUpDownIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"

import { PageTitle } from "@/components/page-title"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const themeOptions = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const selectedTheme = themeOptions.find((option) => option.value === theme)!
  const ThemeIcon = selectedTheme.icon

  return (
    <section className="flex w-full max-w-2xl flex-col gap-6">
      <PageTitle title="Preferences" />
      <h1 className="sr-only">Preferences</h1>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose the appearance of your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="appearance-theme">Colour mode</FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger
                  id="appearance-theme"
                  aria-describedby="appearance-theme-description"
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-between sm:w-48"
                    />
                  }
                >
                  <ThemeIcon data-icon="inline-start" />
                  <span className="flex-1 text-left">
                    {selectedTheme.label}
                  </span>
                  <ChevronsUpDownIcon data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={setTheme}
                    >
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                          <Icon />
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <FieldDescription id="appearance-theme-description">
                System follows your device&apos;s appearance. Your choice
                applies throughout the app.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </section>
  )
}
