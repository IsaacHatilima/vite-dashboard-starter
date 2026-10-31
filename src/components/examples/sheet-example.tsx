import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const modes = [
  {
    label: "Normal sheet",
    modal: true,
    description: "Focus stays inside the sheet while the page is dimmed.",
  },
  {
    label: "Non-modal sheet",
    modal: false,
    description:
      "No overlay. Keep working on the page while this panel is open.",
  },
] as const

export function SheetExample() {
  const noteId = useId()
  const [pageClicks, setPageClicks] = useState(0)

  return (
    <section aria-labelledby="sheets-title" className="flex flex-col gap-4">
      <h2 id="sheets-title" className="text-sm font-medium">
        Sheets
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        {modes.map(({ label, modal, description }) => {
          const inputId = `${noteId}-${modal ? "modal" : "non-modal"}`

          return (
            <Sheet key={label} modal={modal} disablePointerDismissal={!modal}>
              <SheetTrigger render={<Button variant="outline" />}>
                {label}
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="pr-12">
                  <SheetTitle>{label}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                  <Field>
                    <FieldLabel htmlFor={inputId}>Sheet note</FieldLabel>
                    <Input id={inputId} placeholder="Write a note…" />
                  </Field>
                </div>
                <SheetFooter>
                  <SheetClose render={<Button variant="outline" />}>
                    Close sheet
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )
        })}
      </div>
      <div>
        <Button
          variant="secondary"
          onClick={() => setPageClicks((count) => count + 1)}
        >
          Page clicks: {pageClicks}
        </Button>
      </div>
    </section>
  )
}
