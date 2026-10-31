import { REDIRECT_PARAM, routes } from "@/config/routes"

const DELETE_CHARACTER = 0x7f
const FIRST_PRINTABLE = 0x20

// Backslashes and control characters have no business in a return path, and
// browsers treat some of them as "/".
function hasSuspiciousCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0)
    return (
      character === "\\" || code < FIRST_PRINTABLE || code === DELETE_CHARACTER
    )
  })
}

/**
 * Returns `value` when it is a path on this origin, otherwise `fallback`.
 * Stops `?redirect=https://evil.example` (and `//evil.example`) open redirects.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string = routes.dashboard
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    hasSuspiciousCharacters(value)
  ) {
    return fallback
  }

  try {
    const url = new URL(value, window.location.origin)
    // Dot-segments normalise "/.//evil.example" to a "//evil.example" path,
    // which is protocol-relative once used as a link.
    if (
      url.origin !== window.location.origin ||
      url.pathname.startsWith("//")
    ) {
      return fallback
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

// Builds "/login?redirect=/projects" style links that keep the return path.
export function withRedirect(path: string, redirectTo: string | null): string {
  if (!redirectTo) {
    return path
  }

  const params = new URLSearchParams({ [REDIRECT_PARAM]: redirectTo })
  return `${path}?${params.toString()}`
}
