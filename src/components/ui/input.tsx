import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

const NUMBER_CHARACTERS = /^[\d.-]*$/
const NUMBER_VALUE = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/

function Input({
  className,
  type = "text",
  inputMode,
  step,
  onBeforeInput,
  onKeyDown,
  onPaste,
  onDrop,
  ...props
}: React.ComponentProps<"input">) {
  const numeric = type === "number"

  return (
    <InputPrimitive
      type={type}
      inputMode={inputMode ?? (numeric ? "decimal" : undefined)}
      step={step ?? (numeric ? "any" : undefined)}
      onBeforeInput={(event) => {
        onBeforeInput?.(event)
        if (numeric && event.data && !NUMBER_CHARACTERS.test(event.data)) {
          event.preventDefault()
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (
          numeric &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          event.key.length === 1 &&
          !NUMBER_CHARACTERS.test(event.key)
        ) {
          event.preventDefault()
        }
      }}
      onPaste={(event) => {
        onPaste?.(event)
        if (
          numeric &&
          !NUMBER_VALUE.test(event.clipboardData.getData("text"))
        ) {
          event.preventDefault()
        }
      }}
      onDrop={(event) => {
        onDrop?.(event)
        if (numeric && !NUMBER_VALUE.test(event.dataTransfer.getData("text"))) {
          event.preventDefault()
        }
      }}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
