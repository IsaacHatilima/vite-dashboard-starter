import { cn } from "cn"
import { NavLink } from "react-router"

import { settingsNavigation } from "@/config/navigation"

export default function SettingsNavigation() {
  return (
    <nav
      aria-label="Settings pages"
      className="flex min-w-0 shrink-0 flex-col gap-3 rounded-xl bg-sidebar p-3 lg:w-52"
    >
      <h2 className="px-3 text-sm font-medium">Settings</h2>
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {settingsNavigation.items.map((item) => (
          <li key={item.url} className="min-w-0 flex-1 lg:flex-none">
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:min-h-9",
                  isActive &&
                    "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )
              }
            >
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
