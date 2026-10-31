import { RouterProvider } from "react-router"

import { TooltipProvider } from "@/components/ui/tooltip"
import { router } from "@/router"

export function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

export default App
