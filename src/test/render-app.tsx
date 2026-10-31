import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { expect } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { appRoutes } from "@/router"

// Renders the real route table at `path`, the same way App does.
export function renderApp(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const user = userEvent.setup()

  render(
    <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  )

  return { router, user }
}

export async function expectPath(
  router: ReturnType<typeof renderApp>["router"],
  path: string
) {
  await waitFor(() => expect(router.state.location.pathname).toBe(path))
}
