import { describe, expect, it } from "vitest"

import { allNavigation, mainNavigation } from "@/config/navigation"
import { findActiveNavigation } from "./active-navigation"

function titlesFor(pathname: string) {
  const { section, item } = findActiveNavigation(pathname, allNavigation)
  return [section?.title ?? null, item?.title ?? null]
}

describe("findActiveNavigation", () => {
  it("matches a page exactly", () => {
    expect(titlesFor("/dashboard")).toEqual(["Dashboard", "Overview"])
    expect(titlesFor("/team/invitations")).toEqual(["Team", "Invitations"])
  })

  it("prefers the exact page over a parent it also sits under", () => {
    expect(titlesFor("/projects/archived")).toEqual(["Projects", "Archived"])
  })

  it("falls back to the deepest parent for nested pages", () => {
    expect(titlesFor("/projects/42")).toEqual(["Projects", "All projects"])
    expect(titlesFor("/projects/archived/7")).toEqual(["Projects", "Archived"])
  })

  it("ignores a trailing slash", () => {
    expect(titlesFor("/settings/security/")).toEqual(["Settings", "Password"])
  })

  it("keeps settings metadata outside the main app navigation", () => {
    expect(mainNavigation.some((section) => section.title === "Settings")).toBe(
      false
    )
    expect(titlesFor("/settings/appearance")).toEqual([
      "Settings",
      "Preferences",
    ])
  })

  it("resolves the new grouped settings destinations", () => {
    expect(titlesFor("/settings/notifications/email")).toEqual([
      "Settings",
      "Email",
    ])
    expect(titlesFor("/settings/notifications/task-assignments")).toEqual([
      "Settings",
      "Task assignments",
    ])
    expect(titlesFor("/settings/keyboard-shortcuts")).toEqual([
      "Settings",
      "Keyboard shortcuts",
    ])
    expect(titlesFor("/settings/sessions")).toEqual(["Settings", "Sessions"])
    expect(titlesFor("/settings/two-factor-authentication")).toEqual([
      "Settings",
      "Two-factor authentication",
    ])
  })

  it("does not match on a shared prefix that isn't a path segment", () => {
    expect(titlesFor("/teammates")).toEqual([null, null])
  })

  it("returns nothing for pages outside the nav", () => {
    expect(titlesFor("/nowhere")).toEqual([null, null])
  })
})
