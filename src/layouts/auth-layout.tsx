import { GalleryVerticalEndIcon } from "lucide-react"
import { Link, Outlet } from "react-router"

import { appConfig } from "@/config/app"
import { routes } from "@/config/routes"

// Frame for every auth screen: page surface, brand mark, one centred column.
export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to={routes.home}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          {appConfig.name}
        </Link>
        <Outlet />
      </main>
    </div>
  )
}
