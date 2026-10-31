import { TriangleAlertIcon } from "lucide-react"
import { useRouteError } from "react-router"

import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// Catches anything a route throws while rendering.
export function RouteErrorPage() {
  const error = useRouteError()
  console.error("[router] Unhandled route error", error)

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageTitle title="Something went wrong" />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>
            <h1>Something went wrong</h1>
          </EmptyTitle>
          <EmptyDescription>
            This page hit an unexpected error. Reloading usually fixes it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
