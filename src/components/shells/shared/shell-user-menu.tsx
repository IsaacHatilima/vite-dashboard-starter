import {
  ChevronsUpDownIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
  UserIcon,
} from "lucide-react"
import { Link } from "react-router"

import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { placeholderUser, type ShellUser } from "@/config/app"
import { routes } from "@/config/routes"

const themeOptions = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function UserIdentity({ user }: { user: ShellUser }) {
  return (
    <>
      <Avatar className="rounded-lg">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
        <AvatarFallback className="rounded-lg">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  )
}

interface ShellUserMenuProps {
  // RailShell's icon rail only has room for the avatar: a round one in an
  // icon button, as ChatGPT's rail has.
  compact?: boolean
}

function RailAvatar({ user }: { user: ShellUser }) {
  return (
    <Avatar size="sm">
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
}

export function ShellUserMenu({ compact = false }: ShellUserMenuProps) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const user = placeholderUser

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          compact ? (
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={`Account menu for ${user.name}`}
            />
          ) : (
            <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
          )
        }
      >
        {compact ? (
          <RailAvatar user={user} />
        ) : (
          <>
            <UserIdentity user={user} />
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserIdentity user={user} />
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to={routes.profile} />}>
            <UserIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to={routes.security} />}>
            <ShieldCheckIcon />
            Security
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            aria-label="Theme"
            value={theme}
            onValueChange={setTheme}
            className="mx-1 my-1 flex gap-1 rounded-lg bg-muted p-1"
          >
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <Tooltip key={value}>
                <TooltipTrigger
                  render={
                    <DropdownMenuRadioItem
                      value={value}
                      aria-label={label}
                      label={label}
                      className="h-9 flex-1 justify-center px-0 focus-visible:ring-2 focus-visible:ring-ring data-checked:bg-popover data-checked:shadow-xs [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden"
                    />
                  }
                >
                  <Icon />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* No session to end yet: logging out goes back to login. */}
          <DropdownMenuItem render={<Link to={routes.login} />}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (compact) {
    return menu
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>{menu}</SidebarMenuItem>
    </SidebarMenu>
  )
}
