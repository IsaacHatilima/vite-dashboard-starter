import { createContext, useContext, type ReactNode } from "react"

export interface AuthShellProps {
  children: ReactNode
}

export const AuthShellContext = createContext({ card: true })

export function useAuthShell() {
  return useContext(AuthShellContext)
}
