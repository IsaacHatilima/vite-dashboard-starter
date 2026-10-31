import * as React from "react"
import { cn } from "cn"

import { Card } from "@/components/ui/card"

interface StackedCardProps extends React.ComponentProps<"div"> {
  /** Show the StackHeader band above the inner card. */
  top?: boolean
  /** Show the StackFooter band below the inner card. */
  bottom?: boolean
}

const StackedCardContext = React.createContext<{
  top: boolean
  bottom: boolean
} | null>(null)

function useStackedCardContext(component: string) {
  const context = React.useContext(StackedCardContext)
  if (!context) {
    throw new Error(`${component} must be rendered inside StackedCard.`)
  }
  return context
}

/** A muted backing surface for a StackContent card and its optional bands. */
function StackedCard({
  top = false,
  bottom = false,
  children,
  className,
  ...props
}: StackedCardProps) {
  return (
    <StackedCardContext.Provider value={{ top, bottom }}>
      <div
        data-slot="stacked-card"
        className={cn(
          "flex h-full min-w-0 flex-col rounded-2xl bg-stacked-card p-1 text-card-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StackedCardContext.Provider>
  )
}

function StackHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { top } = useStackedCardContext("StackHeader")
  if (!top) return null

  return (
    <div
      data-slot="stack-header"
      className={cn(
        "flex min-h-10 min-w-0 shrink-0 flex-wrap items-center gap-2 px-3 py-2 text-sm wrap-anywhere text-muted-foreground [&>*]:min-w-0",
        className
      )}
      {...props}
    />
  )
}

function StackContent({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  useStackedCardContext("StackContent")

  return (
    <Card
      data-slot="stack-content"
      className={cn("min-w-0 flex-1 shadow-xs", className)}
      {...props}
    />
  )
}

function StackFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { bottom } = useStackedCardContext("StackFooter")
  if (!bottom) return null

  return (
    <div
      data-slot="stack-footer"
      className={cn(
        "flex min-h-10 min-w-0 shrink-0 flex-wrap items-center gap-2 px-3 py-2 text-sm wrap-anywhere text-muted-foreground [&>*]:min-w-0",
        className
      )}
      {...props}
    />
  )
}

export {
  StackedCard,
  StackHeader,
  StackContent,
  StackFooter,
  type StackedCardProps,
}
