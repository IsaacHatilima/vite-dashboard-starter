import { useEffect } from "react"
import { useLocation } from "react-router"

import { useSidebar } from "@/components/ui/sidebar"

// Mirrors SIDEBAR_COOKIE_NAME in components/ui/sidebar.tsx, which writes it.
const SIDEBAR_COOKIE_NAME = "sidebar_state"

// The sidebar remembers expanded/collapsed in a cookie; read it on first render
// so a reload doesn't flash the wrong state.
export function readSidebarOpen(): boolean {
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${SIDEBAR_COOKIE_NAME}=`))

  return entry?.split("=")[1] !== "false"
}

// On phones the sidebar is a drawer; close it once a link has been followed.
export function useCloseMobileSidebarOnNavigate(): void {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])
}
