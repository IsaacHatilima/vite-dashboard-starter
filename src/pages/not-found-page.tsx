import { FileQuestionIcon } from "lucide-react"
import { Link } from "react-router"

import { PageTitle } from "@/components/page-title"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { routes } from "@/config/routes"

// Rendered inside the shell, so navigation stays one click away.
export function NotFoundPage() {
  return (
    <>
      <PageTitle title="Page not found" />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>
            <h1>Page not found</h1>
          </EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to={routes.dashboard} className={buttonVariants()}>
            Back to dashboard
          </Link>
        </EmptyContent>
      </Empty>
    </>
  )
}
