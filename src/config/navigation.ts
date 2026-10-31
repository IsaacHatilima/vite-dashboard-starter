import {
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SendIcon,
  Settings2Icon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { routes } from "@/config/routes"

export interface NavItem {
  title: string
  url: string
}

export interface NavSection {
  title: string
  // Where the section's breadcrumb links to (usually its first page).
  url: string
  icon: LucideIcon
  items: NavItem[]
  // RailShell draws a divider above this section, as ChatGPT's rail does.
  dividerBefore?: boolean
}

export interface NavLink {
  title: string
  url: string
  icon: LucideIcon
}

// Every shell renders from this one list, so swapping shells never means
// re-entering navigation.
export const mainNavigation: NavSection[] = [
  {
    title: "Dashboard",
    url: routes.dashboard,
    icon: LayoutDashboardIcon,
    items: [
      {
        title: "Overview",
        url: routes.dashboard,
      },
      {
        title: "Analytics",
        url: routes.analytics,
      },
      {
        title: "Reports",
        url: routes.reports,
      },
    ],
  },
  {
    title: "Projects",
    url: routes.projects,
    icon: FolderKanbanIcon,
    items: [
      {
        title: "All projects",
        url: routes.projects,
      },
      {
        title: "Archived",
        url: routes.archivedProjects,
      },
    ],
  },
  {
    title: "Team",
    url: routes.team,
    icon: UsersIcon,
    items: [
      {
        title: "Members",
        url: routes.team,
      },
      {
        title: "Invitations",
        url: routes.invitations,
      },
    ],
  },
]

export const settingsNavigation: NavSection = {
  title: "Settings",
  url: routes.profile,
  icon: Settings2Icon,
  items: [
    { title: "Profile", url: routes.profile },
    { title: "Security", url: routes.security },
    { title: "Appearance", url: routes.appearance },
  ],
}

// Settings remains part of route metadata and search, but is entered through
// the account menu rather than the app's primary navigation.
export const allNavigation: NavSection[] = [
  ...mainNavigation,
  settingsNavigation,
]

export const secondaryNavigation: NavLink[] = [
  { title: "Support", url: "mailto:support@example.com", icon: LifeBuoyIcon },
  { title: "Feedback", url: "mailto:feedback@example.com", icon: SendIcon },
]
