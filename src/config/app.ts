export const appConfig = {
  name: "Acme Inc.",
  tagline: "Dashboard",
} as const

export interface ShellUser {
  name: string
  email: string
  avatarUrl: string | null
}

// Shown in the shells' user menu. There's no API yet, so nobody is really
// signed in; replace this with the real user once there is.
export const placeholderUser: ShellUser = {
  name: "Demo User",
  email: "demo@example.com",
  avatarUrl: null,
}
