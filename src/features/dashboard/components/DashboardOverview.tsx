import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StackedCard } from "@/components/ui/stacked-card"

interface DashboardOverviewProps {
  userName: string
}

// Starter examples; swap in real widgets as the dashboard grows.
export function DashboardOverview({ userName }: DashboardOverviewProps) {
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
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StackedCard top="Top band">
            <CardHeader>
              <CardTitle>Top only</CardTitle>
              <CardDescription>
                A title or toolbar above the card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The outer surface frames the header while the content sits on
                its own raised card.
              </p>
            </CardContent>
          </StackedCard>
          <StackedCard bottom="Bottom band">
            <CardHeader>
              <CardTitle>Bottom only</CardTitle>
              <CardDescription>
                Supporting context below the card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use the lower band for a summary, metadata, or actions related
                to the content above.
              </p>
            </CardContent>
          </StackedCard>
          <StackedCard top="Top band" bottom="Bottom band">
            <CardHeader>
              <CardTitle>Top and bottom</CardTitle>
              <CardDescription>
                Two bands around one raised card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Put the title or controls above, and keep related details or
                actions below.
              </p>
            </CardContent>
          </StackedCard>
        </div>
      </section>
    </>
  )
}
