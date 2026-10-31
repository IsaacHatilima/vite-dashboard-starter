import { cn } from "cn"
import { NavLink } from "react-router"

import { settingsNavigationGroups } from "@/config/navigation"

export default function SettingsNavigation() {
  return (
    <nav
      aria-label="Settings pages"
      className="flex min-w-0 shrink-0 flex-col gap-3.5 rounded-xl bg-sidebar p-2 lg:w-60"
    >
      <h2 className="px-2 pt-1 text-base font-semibold">Settings</h2>
      {settingsNavigationGroups.map((group) => (
        <div key={group.title} className="flex min-w-0 flex-col">
          <h3 className="flex h-6 items-center px-2 text-[length:var(--font-size-label)] font-semibold tracking-[0.06em] text-sidebar-muted-foreground uppercase">
            {group.title}
          </h3>
          <ul className="grid grid-cols-2 gap-0 lg:flex lg:flex-col">
            {group.items.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.url} className="min-w-0">
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        "flex h-full min-h-10 items-center gap-(--nav-item-gap) rounded-lg px-2 py-0 text-sm font-[450] text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:min-h-(--nav-row-height)",
                        isActive &&
                          "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      )
                    }
                  >
                    {Icon && (
                      <Icon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-sidebar-muted-foreground"
                      />
                    )}
                    <span className="min-w-0 wrap-anywhere">{item.title}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
