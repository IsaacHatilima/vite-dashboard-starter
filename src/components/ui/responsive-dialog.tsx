import * as React from "react"
import { cn } from "cn"

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

// A centered dialog from 768px up, and a bottom sheet that swipes down below it.
// Write the content once; every part renders the matching Dialog or Drawer piece.
const MobileContext = React.createContext(false)

// Only the props both primitives type the same way: their className callbacks
// and event details differ.
type TextProps = { children?: React.ReactNode; className?: string }

type TriggerProps = TextProps & {
  disabled?: boolean
  render?: React.ReactElement
}

type ContentProps = TextProps &
  Pick<
    React.ComponentProps<typeof DialogContent>,
    "initialFocus" | "finalFocus"
  >

function ResponsiveDialog({
  children,
  ...props
}: Pick<
  React.ComponentProps<typeof Dialog>,
  "open" | "defaultOpen" | "disablePointerDismissal" | "children"
> & {
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()

  return (
    <MobileContext.Provider value={isMobile}>
      {isMobile ? (
        <Drawer swipeDirection="down" {...props}>
          {children}
        </Drawer>
      ) : (
        <Dialog {...props}>{children}</Dialog>
      )}
    </MobileContext.Provider>
  )
}

function ResponsiveDialogTrigger(props: TriggerProps) {
  return React.useContext(MobileContext) ? (
    <DrawerTrigger {...props} />
  ) : (
    <DialogTrigger {...props} />
  )
}

function ResponsiveDialogClose(props: TriggerProps) {
  return React.useContext(MobileContext) ? (
    <DrawerClose {...props} />
  ) : (
    <DialogClose {...props} />
  )
}

function ResponsiveDialogContent(props: ContentProps) {
  return React.useContext(MobileContext) ? (
    <DrawerContent {...props} />
  ) : (
    <DialogContent {...props} />
  )
}

function ResponsiveDialogHeader(props: React.ComponentProps<"div">) {
  return React.useContext(MobileContext) ? (
    <DrawerHeader {...props} />
  ) : (
    <DialogHeader {...props} />
  )
}

function ResponsiveDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return React.useContext(MobileContext) ? (
    <div
      data-slot="drawer-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3",
        className
      )}
      {...props}
    />
  ) : (
    <DialogBody className={className} {...props} />
  )
}

function ResponsiveDialogFooter(props: React.ComponentProps<"div">) {
  return React.useContext(MobileContext) ? (
    <DrawerFooter {...props} />
  ) : (
    <DialogFooter {...props} />
  )
}

function ResponsiveDialogTitle(props: TextProps) {
  return React.useContext(MobileContext) ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  )
}

function ResponsiveDialogDescription(props: TextProps) {
  return React.useContext(MobileContext) ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
}
