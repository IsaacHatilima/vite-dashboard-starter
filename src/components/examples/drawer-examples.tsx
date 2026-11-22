import { useState } from "react"

import { Button } from "@/components/ui/button"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function DrawerExamples() {
  const [workspaceName, setWorkspaceName] = useState("Design workspace")
  const [backgroundClicks, setBackgroundClicks] = useState(0)

  return (
    <section aria-labelledby="drawers-title" className="flex flex-col gap-4">
      <h2 id="drawers-title" className="text-sm font-medium">
        Drawers
      </h2>
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Default drawer", stack: false },
          { label: "Stacked drawer", stack: true },
        ].map(({ label, stack }) => (
          <Drawer key={label} stack={stack}>
            <DrawerTrigger render={<Button variant="outline" />}>
              {label}
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
                <DrawerHeader>
                  <DrawerTitle>
                    {stack ? "Stacked drawer" : "Drawer preview"}
                  </DrawerTitle>
                  <DrawerDescription>
                    {stack
                      ? "A layered frame around your workspace details."
                      : "A modal drawer with a dimmed background."}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <code className="block whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground wrap-anywhere">
                    {`<Drawer${stack ? " stack" : " stack={false}"}>
  <DrawerTrigger render={<Button variant="outline" />}>…</DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>`}
                  </code>
                </div>
                <DrawerFooter>
                  <DrawerClose render={<Button variant="outline" />}>
                    Close drawer
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        ))}

        <Drawer>
          <DrawerTrigger render={<Button variant="outline" />}>
            Nested drawers
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
              <DrawerHeader>
                <DrawerTitle>Workspace settings</DrawerTitle>
                <DrawerDescription>
                  Edit the name, then open a second drawer. Your draft stays
                  here.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <code className="block whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground wrap-anywhere">
                  {`<Drawer>
  <DrawerTrigger>…</DrawerTrigger>
  <DrawerContent>
    <Drawer>
      <DrawerTrigger>…</DrawerTrigger>
      <DrawerContent>…</DrawerContent>
    </Drawer>
  </DrawerContent>
</Drawer>`}
                </code>
                <Field>
                  <FieldLabel htmlFor="drawer-workspace-name">
                    Workspace name
                  </FieldLabel>
                  <Input
                    id="drawer-workspace-name"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                  />
                </Field>
                <Drawer>
                  <DrawerTrigger render={<Button variant="outline" />}>
                    Open nested drawer
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
                      <DrawerHeader>
                        <DrawerTitle>Nested details</DrawerTitle>
                        <DrawerDescription>
                          The parent drawer is stacked behind this one.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <code className="block whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground wrap-anywhere">
                          {`<Drawer>
  <DrawerContent>
    <Drawer>
      <DrawerTrigger>Open nested drawer</DrawerTrigger>
      <DrawerContent>…</DrawerContent>
    </Drawer>
  </DrawerContent>
</Drawer>`}
                        </code>
                      </div>
                      <DrawerFooter>
                        <DrawerClose render={<Button variant="outline" />}>
                          Back to workspace
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
              <DrawerFooter>
                <DrawerClose render={<Button variant="outline" />}>
                  Close workspace
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer modal={false} disablePointerDismissal>
          <DrawerTrigger render={<Button variant="outline" />}>
            Non-modal drawer
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
              <DrawerHeader>
                <DrawerTitle>Non-modal preview</DrawerTitle>
                <DrawerDescription>
                  The page remains interactive while this drawer is open.
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <code className="block whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground wrap-anywhere">
                  {`<Drawer modal={false} disablePointerDismissal>
  <DrawerTrigger>…</DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>`}
                </code>
              </div>
              <DrawerFooter>
                <DrawerClose render={<Button variant="outline" />}>
                  Close non-modal drawer
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div>
        <Button
          variant="secondary"
          onClick={() => setBackgroundClicks((count) => count + 1)}
        >
          Background clicks: {backgroundClicks}
        </Button>
      </div>
    </section>
  )
}
