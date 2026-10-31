import * as React from "react"
import { cn } from "cn"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { InputControl } from "@/components/ui/input-control"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function PasswordInput({
  id,
  className,
  disabled,
  ...props
}: React.ComponentProps<"input">) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [visible, setVisible] = React.useState(false)
  const label = visible ? "Hide password" : "Show password"

  return (
    <InputGroup className="h-auto max-md:h-auto">
      <InputGroupInput
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn(
          "h-[calc(var(--control-height)-2px)] max-md:h-9.5",
          className
        )}
      />
      <InputGroupAddon align="inline-end" className="py-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <InputGroupButton
                type="button"
                size="icon-xs"
                aria-label={label}
                aria-controls={inputId}
                aria-pressed={visible}
                disabled={disabled}
                onMouseDown={(event) => {
                  if (event.button === 0) event.preventDefault()
                }}
                onClick={() => setVisible((current) => !current)}
              />
            }
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  )
}

function Input(props: React.ComponentProps<"input">) {
  if (props.type === "password") {
    return <PasswordInput {...props} />
  }

  return <InputControl {...props} />
}

export { Input }
