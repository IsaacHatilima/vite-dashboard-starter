import { useNavigate } from "react-router"

import { routes } from "@/config/routes"
import { RegisterForm } from "../components/RegisterForm"

export default function RegisterContainer() {
  const navigate = useNavigate()

  return (
    <RegisterForm
      // No API yet: a new account goes on to the verify-email step.
      onSubmit={(email) =>
        void navigate(routes.verifyEmail, { state: { email } })
      }
      loginHref={routes.login}
    />
  )
}
