import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormAlertProps {
  message: string | null | undefined
  tone?: "error" | "success"
}

// The one-line banner above a form: a request failure or a confirmation.
export function FormAlert({ message, tone = "error" }: FormAlertProps) {
  if (!message) {
    return null
  }

  const Icon = tone === "error" ? CircleAlertIcon : CircleCheckIcon

  return (
    <Alert variant={tone === "error" ? "destructive" : "default"}>
      <Icon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
