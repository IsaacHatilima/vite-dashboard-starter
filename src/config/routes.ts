export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  twoFactorChallenge: "/two-factor-challenge",
  confirmPassword: "/confirm-password",
  dashboard: "/dashboard",
  analytics: "/dashboard/analytics",
  reports: "/dashboard/reports",
  projects: "/projects",
  archivedProjects: "/projects/archived",
  team: "/team",
  invitations: "/team/invitations",
  settings: "/settings",
  profile: "/settings/profile",
  security: "/settings/security",
  appearance: "/settings/appearance",
} as const

// Query parameter that carries the page to continue to after confirming the
// password, e.g. /confirm-password?redirect=/settings/security.
export const REDIRECT_PARAM = "redirect"
