import { useState } from "react"
import { useLocation } from "react-router"

import { routes } from "@/config/routes"
import { readStateString } from "@/lib/router-state"
import { VerifyEmailNotice } from "../components/VerifyEmailNotice"

export default function VerifyEmailContainer() {
  const location = useLocation()
  const [sent, setSent] = useState(false)

  return (
    <VerifyEmailNotice
      // Handed over by the register screen; absent if opened directly.
      email={readStateString(location.state, "email")}
      sent={sent}
      onResend={() => setSent(true)}
      continueHref={routes.dashboard}
      logoutHref={routes.login}
    />
  )
}
