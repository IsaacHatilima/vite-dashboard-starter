import { LayoutTemplateIcon } from "lucide-react"

import { PageTitle } from "@/components/page-title"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface PlaceholderPageProps {
  title: string
}

// Stands in for a nav destination until its feature exists. Replace the
// route's element with the feature's container when you build it.
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <PageTitle title={title} />
      <h1 className="sr-only">{title}</h1>
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutTemplateIcon />
          </EmptyMedia>
          <EmptyTitle>{title} isn&apos;t built yet</EmptyTitle>
          <EmptyDescription>
            Scaffold it with domain-driver, then point this route at its
            container in src/router.tsx.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  )
}
