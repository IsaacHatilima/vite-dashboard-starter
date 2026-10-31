import type * as React from "react"
import { cn } from "cn"

import { useAuthShell } from "@/components/auth-shells/auth-shell-context"
import { PageTitle } from "@/components/page-title"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}

// The selected shell decides whether the shared form needs its own card.
export function AuthCard({ title, description, children }: AuthCardProps) {
  const { card } = useAuthShell()
  const content = (
    <>
      <PageTitle title={title} />
      <CardHeader className={cn("text-center", !card && "px-0")}>
        <CardTitle className="text-xl">
          <h1>{title}</h1>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn(!card && "px-0")}>{children}</CardContent>
    </>
  )

  if (card) {
    return <Card>{content}</Card>
  }

  return <section className="flex min-w-0 flex-col gap-6">{content}</section>
}
