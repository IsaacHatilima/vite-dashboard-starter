import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      <div className="min-h-[60vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}
