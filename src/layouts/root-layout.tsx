import { Outlet, ScrollRestoration } from "react-router"

// Wraps every route: restores scroll position on back/forward navigation.
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
