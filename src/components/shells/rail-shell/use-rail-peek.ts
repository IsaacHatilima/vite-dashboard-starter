import { useCallback, useEffect, useRef, useState } from "react"

import type { NavSection } from "@/config/navigation"

// Hover intent: sweeping the pointer across the rail shouldn't flash panels,
// and a short grace period lets the pointer travel from the rail to the card.
const OPEN_DELAY_MS = 100
const CLOSE_DELAY_MS = 150

interface OpenOptions {
  immediate?: boolean
}

export interface RailPeek {
  // The section shown in the floating card, or null when it's closed.
  section: NavSection | null
  open: (section: NavSection, options?: OpenOptions) => void
  scheduleClose: () => void
  cancelClose: () => void
  close: () => void
}

// The floating card a collapsed RailShell shows beside its rail, as ChatGPT
// does: it opens on hover or click and closes when the pointer leaves.
export function useRailPeek(): RailPeek {
  const [section, setSection] = useState<NavSection | null>(null)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)

  const cancelClose = useCallback(() => {
    window.clearTimeout(closeTimer.current)
  }, [])

  const open = useCallback(
    (next: NavSection, { immediate = false }: OpenOptions = {}) => {
      window.clearTimeout(openTimer.current)
      window.clearTimeout(closeTimer.current)
      if (immediate) {
        setSection(next)
        return
      }
      openTimer.current = window.setTimeout(
        () => setSection(next),
        OPEN_DELAY_MS
      )
    },
    []
  )

  const scheduleClose = useCallback(() => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(
      () => setSection(null),
      CLOSE_DELAY_MS
    )
  }, [])

  const close = useCallback(() => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
    setSection(null)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current)
      window.clearTimeout(closeTimer.current)
    },
    []
  )

  return { section, open, scheduleClose, cancelClose, close }
}
