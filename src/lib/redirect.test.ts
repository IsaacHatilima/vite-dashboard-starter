import { describe, expect, it } from "vitest"

import { safeRedirectPath, withRedirect } from "./redirect"

describe("safeRedirectPath", () => {
  it("keeps a same-origin path with its query and hash", () => {
    expect(safeRedirectPath("/projects?tab=open#top")).toBe(
      "/projects?tab=open#top"
    )
  })

  it.each([
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.example/steal"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path", "projects"],
    ["javascript URL", "javascript:alert(1)"],
    ["dot-segment bypass", "/.//evil.example"],
    ["parent dot-segment bypass", "/..//evil.example"],
    ["nested dot-segment bypass", "/a/..//evil.example"],
    ["encoded dot-segment bypass", "/%2e//evil.example"],
    ["tab inside the path", "/\t/evil.example"],
    ["newline inside the path", "/\n/evil.example"],
  ])("falls back to the dashboard for a %s", (_, value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard")
  })

  it("uses the fallback it is given", () => {
    expect(safeRedirectPath(null, "/team")).toBe("/team")
  })
})

describe("withRedirect", () => {
  it("adds the return path as an encoded query parameter", () => {
    expect(withRedirect("/login", "/projects?tab=open")).toBe(
      "/login?redirect=%2Fprojects%3Ftab%3Dopen"
    )
  })

  it("leaves the path alone when there is nowhere to return to", () => {
    expect(withRedirect("/login", null)).toBe("/login")
  })
})
