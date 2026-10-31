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

export function SheetExample() {
  const noteId = useId()
  const [pageClicks, setPageClicks] = useState(0)

  return (
    <section aria-labelledby="sheets-title" className="flex flex-col gap-4">
      <h2 id="sheets-title" className="text-sm font-medium">
        Sheets
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <Sheet modal={false} disablePointerDismissal>
          <SheetTrigger render={<Button variant="outline" />}>
            Open right sheet
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="pr-12">
              <SheetTitle>Sheet preview</SheetTitle>
              <SheetDescription>
                The page stays interactive while this sheet is open.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              <Field>
                <FieldLabel htmlFor={noteId}>Sheet note</FieldLabel>
                <Input id={noteId} placeholder="Write a note…" />
              </Field>
            </div>
            <SheetFooter>
              <SheetClose render={<Button variant="outline" />}>
                Close sheet
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
