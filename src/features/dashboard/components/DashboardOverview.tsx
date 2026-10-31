import { useState } from "react"
import { Link } from "react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  StackContent,
  StackedCard,
  StackFooter,
  StackHeader,
} from "@/components/ui/stacked-card"
import { routes } from "@/config/routes"

interface DashboardOverviewProps {
  userName: string
}

// Starter examples; swap in real widgets as the dashboard grows.
export function DashboardOverview({ userName }: DashboardOverviewProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [projectName, setProjectName] = useState("")

  return (
    <>
      <h1 className="sr-only">Overview</h1>
      <p className="text-sm text-muted-foreground">
        Welcome back, <span className="text-foreground">{userName}</span>.
      </p>
      <section aria-label="Card variants" className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Default card</CardTitle>
            <CardDescription>Border enabled by default.</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-xs text-muted-foreground">
              {"<Card>…</Card>"}
            </code>
          </CardContent>
        </Card>
        <Card border={false}>
          <CardHeader>
            <CardTitle>Borderless card</CardTitle>
            <CardDescription>A card without the outer border.</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-xs text-muted-foreground">
              {"<Card border={false}>…</Card>"}
            </code>
          </CardContent>
        </Card>
      </section>
      <section
        aria-labelledby="stacked-cards-title"
        className="flex flex-col gap-4"
      >
        <h2 id="stacked-cards-title" className="text-sm font-medium">
          Stacked cards
        </h2>
        <div className="grid auto-rows-fr items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StackedCard top>
            <StackHeader>
              <span className="flex-1 font-medium">Quick actions</span>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={showDetails}
                aria-controls="stacked-card-details"
                onClick={() => setShowDetails((visible) => !visible)}
              >
                {showDetails ? "Hide details" : "Show details"}
              </Button>
            </StackHeader>
            <StackContent>
              <CardHeader>
                <CardTitle>Top only</CardTitle>
                <CardDescription>A toolbar above the card.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The inner card expands to fill the height when there is no
                  bottom band.
                </p>
                <p
                  id="stacked-card-details"
                  hidden={!showDetails}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  Header and footer sections can contain buttons, inputs, or
                  other components.
                </p>
              </CardContent>
            </StackContent>
          </StackedCard>
          <StackedCard bottom>
            <StackContent>
              <CardHeader>
                <CardTitle>Bottom only</CardTitle>
                <CardDescription>Actions below the card.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The card fills the remaining space above a footer with
                  supporting context and actions.
                </p>
              </CardContent>
            </StackContent>
            <StackFooter>
              <span className="flex-1">Explore your work</span>
              <Link
                to={routes.projects}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View projects
              </Link>
            </StackFooter>
          </StackedCard>
          <StackedCard top bottom>
            <StackHeader>
              <Field className="min-w-0 flex-1">
                <FieldLabel htmlFor="stacked-card-project" className="sr-only">
                  Project name
                </FieldLabel>
                <Input
                  id="stacked-card-project"
                  placeholder="Project name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </Field>
            </StackHeader>
            <StackContent>
              <CardHeader>
                <CardTitle>Top and bottom</CardTitle>
                <CardDescription>
                  An input above and actions below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p
                  id="stacked-card-project-preview"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  Project:{" "}
                  <span className="font-medium text-foreground">
                    {projectName || "Untitled project"}
                  </span>
                </p>
              </CardContent>
            </StackContent>
            <StackFooter>
              <span className="flex-1">Preview controls</span>
              <Button
                variant="outline"
                size="sm"
                disabled={!projectName}
                onClick={() => setProjectName("")}
              >
                Reset
              </Button>
            </StackFooter>
          </StackedCard>
        </div>
      </section>
    </>
  )
}
