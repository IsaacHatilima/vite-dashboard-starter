import type * as React from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface TextFieldProps extends React.ComponentProps<typeof Input> {
  name: string
  label: string
  error?: string
  description?: React.ReactNode
  // Rendered at the end of the label row, e.g. a "Forgot password?" link.
  labelAction?: React.ReactNode
}

export function TextField({
  id,
  name,
  label,
  error,
  description,
  labelAction,
  ...props
}: TextFieldProps) {
  const inputId = id ?? name
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`
  const describedBy =
    [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined
  const invalid = error ? true : undefined

  return (
    <Field data-invalid={invalid}>
      {labelAction ? (
        <div className="flex items-center">
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <div className="ml-auto text-sm">{labelAction}</div>
        </div>
      ) : (
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      )}
      <Input
        id={inputId}
        name={name}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...props}
      />
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  )
}
