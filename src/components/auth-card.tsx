import type * as React from "react"

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

// The card every auth screen sits in; the page around it is AuthLayout.
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card>
      <PageTitle title={title} />
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          <h1>{title}</h1>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
