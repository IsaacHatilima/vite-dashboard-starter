import { useNavigate } from "react-router"

import { routes } from "@/config/routes"
import { ForgotPasswordForm } from "../components/ForgotPasswordForm"

export default function ForgotPasswordContainer() {
  const navigate = useNavigate()

  return (
    <ForgotPasswordForm
      // No API or email yet: go straight to the screen the emailed link opens.
      onSubmit={(email) => {
        const params = new URLSearchParams({ email })
        void navigate(`${routes.resetPassword}?${params.toString()}`)
      }}
      loginHref={routes.login}
    />
  )
}
