import { useNavigate, useSearchParams } from "react-router"

import { routes } from "@/config/routes"
import { ResetPasswordForm } from "../components/ResetPasswordForm"

// Opened from the reset email (/reset-password?email=…), or from the
// forgot-password screen while there's no email to send.
export default function ResetPasswordContainer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <ResetPasswordForm
      email={searchParams.get("email") ?? ""}
      onSubmit={() =>
        void navigate(routes.login, {
          replace: true,
          state: {
            status: "Your password has been reset. Log in with your new one.",
          },
        })
      }
      loginHref={routes.login}
    />
  )
}
