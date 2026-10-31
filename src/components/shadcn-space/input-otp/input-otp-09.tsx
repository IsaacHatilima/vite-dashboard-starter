"use client"

import { OTPInput, OTPInputContext } from "input-otp"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type AnimatedOTPProps = Omit<
  React.ComponentProps<typeof OTPInput>,
  "children" | "render" | "maxLength"
> & {
  maxLength?: number
}

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 450,
  damping: 28,
} as const

const primaryColorMix = (opacityPercent: number) =>
  `color-mix(in srgb, var(--primary) ${opacityPercent}%, transparent)`

function CustomOTPSlot({
  index,
  reducedMotion,
}: {
  index: number
  reducedMotion: boolean
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]
  const transition = reducedMotion ? { duration: 0 } : SPRING_TRANSITION

  return (
    <div
      aria-hidden="true"
      data-slot="animated-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-12 w-10 min-w-0 items-center justify-center rounded-lg border border-input text-foreground shadow-xs transition-all duration-200 select-none motion-reduce:transition-none",
        "bg-linear-to-br from-muted/30 to-background dark:from-muted/10 dark:to-card/50",
        isActive && "border-primary/50"
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {char && (
          <motion.span
            key={`char-${char}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.5, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -4 }
            }
            transition={transition}
            className="absolute font-mono text-lg font-bold text-foreground"
          >
            {char}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {char && !reducedMotion && (
          <motion.div
            key={`pulse-${char}`}
            className="pointer-events-none absolute inset-0 rounded-lg border border-primary"
            initial={{ opacity: 0.8, scale: 0.9, filter: "blur(0px)" }}
            animate={{ opacity: 0, scale: 1.4, filter: "blur(2px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ boxShadow: `inset 0 0 12px ${primaryColorMix(50)}` }}
          />
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div
          layoutId="active-glow"
          className="pointer-events-none absolute inset-0 z-10 rounded-lg border border-primary"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
          style={{
            boxShadow: `inset 0 0 12px ${primaryColorMix(40)}, 0 0 8px ${primaryColorMix(20)}`,
          }}
        >
          <svg
            viewBox="0 0 20 20"
            className="absolute inset-0 size-full"
            strokeWidth="0.4"
          >
            <motion.path
              d="M 3 18 h 14"
              className="stroke-primary"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.2,
                ease: "easeOut",
              }}
            />
          </svg>
        </motion.div>
      )}

      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-5 w-0.5 bg-primary"
            animate={{ opacity: reducedMotion ? 1 : [1, 0, 1] }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { repeat: Infinity, duration: 1, ease: "easeInOut" }
            }
          />
        </div>
      )}
    </div>
  )
}

export function AnimatedOTP({
  maxLength = 6,
  containerClassName,
  className,
  ...props
}: AnimatedOTPProps) {
  const id = React.useId()
  const reducedMotion = useReducedMotion() ?? false

  return (
    <LayoutGroup id={id}>
      <OTPInput
        data-slot="animated-otp"
        maxLength={maxLength}
        containerClassName={cn(
          "group flex w-full min-w-0 items-center justify-center has-disabled:opacity-50",
          containerClassName
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {Array.from({ length: maxLength }, (_, index) => (
            <CustomOTPSlot
              key={index}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </OTPInput>
    </LayoutGroup>
  )
}

export default function InputOTPDemo() {
  const [value, setValue] = React.useState("")

  return (
    <div className="relative flex h-36 w-full max-w-sm flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
      <AnimatedOTP
        aria-label="One-time password"
        value={value}
        onChange={setValue}
      />
      <div className="text-xs text-muted-foreground select-none">
        {value ? (
          <>
            Entered Code:{" "}
            <span className="font-mono font-semibold tracking-wider text-foreground">
              {value}
            </span>
          </>
        ) : (
          "Type to see the entered code"
        )}
      </div>
    </div>
  )
}
