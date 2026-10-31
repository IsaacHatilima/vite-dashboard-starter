import {
  ArchiveIcon,
  AtSignIcon,
  ChartNoAxesCombinedIcon,
  FileChartColumnIcon,
  FolderKanbanIcon,
  KeyboardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  MailIcon,
  PanelsTopLeftIcon,
  SendIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { routes } from "@/config/routes"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface NavSection {
  title: string
  // Where the section's breadcrumb links to (usually its first page).
  url: string
  icon: LucideIcon
  items: NavItem[]
  groups?: NavGroup[]
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
        icon: LayoutDashboardIcon,
      },
      {
        title: "Analytics",
        url: routes.analytics,
        icon: ChartNoAxesCombinedIcon,
      },
      {
        title: "Reports",
        url: routes.reports,
        icon: FileChartColumnIcon,
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
        icon: FolderKanbanIcon,
      },
      {
        title: "Archived",
        url: routes.archivedProjects,
        icon: ArchiveIcon,
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
        icon: UsersIcon,
      },
      {
        title: "Invitations",
        url: routes.invitations,
        icon: UserPlusIcon,
      },
    ],
  },
]

export const settingsNavigationGroups: NavGroup[] = [
  {
    title: "Notifications",
    items: [
      { title: "Email", url: routes.emailNotifications, icon: MailIcon },
      { title: "Push", url: routes.pushNotifications, icon: SmartphoneIcon },
      { title: "Mentions", url: routes.mentionNotifications, icon: AtSignIcon },
      {
        title: "Task assignments",
        url: routes.taskNotifications,
        icon: UserCheckIcon,
      },
    ],
  },
  {
    title: "Personal",
    items: [
      { title: "Profile", url: routes.profile, icon: UserRoundIcon },
      {
        title: "Preferences",
        url: routes.appearance,
        icon: SlidersHorizontalIcon,
      },
      {
        title: "Keyboard shortcuts",
        url: routes.keyboardShortcuts,
        icon: KeyboardIcon,
      },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "Password", url: routes.security, icon: KeyRoundIcon },
      { title: "Sessions", url: routes.sessions, icon: PanelsTopLeftIcon },
      {
        title: "Two-factor authentication",
        url: routes.twoFactorAuthentication,
        icon: ShieldCheckIcon,
      },
    ],
  },
]

export const settingsNavigation: NavSection = {
  title: "Settings",
  url: routes.profile,
  icon: Settings2Icon,
  groups: settingsNavigationGroups,
  items: settingsNavigationGroups.flatMap((group) => group.items),
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
