import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(() => {
  cleanup()
  // The sidebar remembers expanded/collapsed in a cookie; start each test fresh.
  document.cookie = "sidebar_state=; path=/; max-age=0"
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// jsdom has no matchMedia; the sidebar asks it whether we're on a phone.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// input-otp checks what sits under its caret; jsdom has no layout to ask.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}

// ScrollRestoration scrolls on navigation; jsdom only logs "not implemented".
window.scrollTo = () => {}
