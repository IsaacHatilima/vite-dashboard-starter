import type * as React from "react"
import { cn } from "cn"

import { Card } from "@/components/ui/card"

interface StackedCardProps extends React.ComponentProps<"div"> {
  /** Content on the backing surface above the inner card. */
  top?: React.ReactNode
  /** Content on the backing surface below the inner card. */
  bottom?: React.ReactNode
}

/** A raised Card with optional top and bottom bands on a muted backing surface. */
function StackedCard({
  top,
  bottom,
  children,
  className,
  ...props
}: StackedCardProps) {
  return (
    <div
      data-slot="stacked-card"
      className={cn(
        "flex min-w-0 flex-col rounded-2xl bg-stacked-card p-1 text-card-foreground",
        className
      )}
      {...props}
    >
      {top != null && top !== false && (
        <div
          data-slot="stacked-card-top"
          className="flex min-h-10 min-w-0 flex-wrap items-center gap-2 px-3 py-2 text-sm wrap-anywhere text-muted-foreground [&>*]:min-w-0"
        >
          {top}
        </div>
      )}
      <Card className="min-w-0 flex-1 shadow-xs">{children}</Card>
      {bottom != null && bottom !== false && (
        <div
          data-slot="stacked-card-bottom"
          className="flex min-h-10 min-w-0 flex-wrap items-center gap-2 px-3 py-2 text-sm wrap-anywhere text-muted-foreground [&>*]:min-w-0"
        >
          {bottom}
        </div>
      )}
    </div>
  )
}

export { StackedCard, type StackedCardProps }
