import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"

import { routes } from "@/config/routes"
import { readStateString } from "@/lib/router-state"
import { LoginForm } from "../components/LoginForm"

export default function LoginContainer() {
  const navigate = useNavigate()
  const location = useLocation()

  // A banner handed over by another screen (e.g. after a password reset).
  // Kept in state, then cleared from history so a reload doesn't repeat it.
  const flashed = readStateString(location.state, "status")
  const [status, setStatus] = useState(flashed)
  if (flashed && flashed !== status) {
    setStatus(flashed)
  }

  useEffect(() => {
    if (flashed) {
      void navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      })
    }
  }, [flashed, location.pathname, location.search, navigate])

  return (
    <LoginForm
      // No API yet: logging in just opens the dashboard.
      onSubmit={() => void navigate(routes.dashboard)}
      status={status}
      registerHref={routes.register}
      forgotPasswordHref={routes.forgotPassword}
    />
  )
}
