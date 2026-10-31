import { useNavigate } from "react-router"

import { routes } from "@/config/routes"
import { TwoFactorChallengeForm } from "../components/TwoFactorChallengeForm"

// The second login step for accounts with two-factor authentication.
export default function TwoFactorChallengeContainer() {
  const navigate = useNavigate()

  return (
    <TwoFactorChallengeForm
      // No API yet: any code opens the dashboard.
      onSubmit={() => void navigate(routes.dashboard)}
      loginHref={routes.login}
    />
  )
}
