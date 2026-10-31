import { GalleryVerticalEndIcon } from "lucide-react"
import { Link } from "react-router"

import { appConfig } from "@/config/app"
import { routes } from "@/config/routes"

export function AuthBrand({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link
      to={routes.home}
      className="inline-flex w-fit items-center gap-2 font-medium"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GalleryVerticalEndIcon className="size-4" aria-hidden="true" />
      </span>
      <span className={iconOnly ? "sr-only" : undefined}>{appConfig.name}</span>
    </Link>
  )
}
