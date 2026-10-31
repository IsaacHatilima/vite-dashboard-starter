import { useNavigate, useSearchParams } from "react-router"

import { REDIRECT_PARAM, routes } from "@/config/routes"
import { safeRedirectPath } from "@/lib/redirect"
import { ConfirmPasswordForm } from "../components/ConfirmPasswordForm"

// Send users here before a sensitive page:
//   navigate(withRedirect(routes.confirmPassword, routes.security))
export default function ConfirmPasswordContainer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const target = safeRedirectPath(searchParams.get(REDIRECT_PARAM))

  return (
    <ConfirmPasswordForm
      onSubmit={() => void navigate(target, { replace: true })}
      cancelHref={routes.dashboard}
    />
  )
}
