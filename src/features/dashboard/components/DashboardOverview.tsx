interface DashboardOverviewProps {
  userName: string
}

// Placeholder tiles from the shadcn sidebar blocks; swap in real widgets.
export function DashboardOverview({ userName }: DashboardOverviewProps) {
  return (
    <>
      <h1 className="sr-only">Overview</h1>
      <p className="text-sm text-muted-foreground">
        Welcome back, <span className="text-foreground">{userName}</span>.
      </p>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[60vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}
