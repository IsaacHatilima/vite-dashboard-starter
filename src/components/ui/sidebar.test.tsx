import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { LayoutDashboardIcon } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./sidebar"
import { TooltipProvider } from "./tooltip"

function SidebarTooltip({ collapsed = true }: { collapsed?: boolean }) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={!collapsed}>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Overview"
                  render={<a href="/dashboard" />}
                >
                  <LayoutDashboardIcon />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </TooltipProvider>
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
})

function setup(collapsed = true) {
  render(<SidebarTooltip collapsed={collapsed} />)
  return screen.getByRole("link", { name: "Overview" })
}

async function advance(milliseconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds)
  })
}

const tooltip = () => document.querySelector('[data-slot="tooltip-content"]')

function hover(trigger: HTMLElement) {
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" })
  fireEvent.mouseEnter(trigger)
  fireEvent.mouseMove(trigger, { clientX: 10, clientY: 10 })
}

function focusWithKeyboard(trigger: HTMLElement) {
  fireEvent.keyDown(document, { key: "Tab" })
  act(() => trigger.focus())
}

describe("collapsed sidebar tooltips", () => {
  it("waits briefly before opening on hover", async () => {
    const trigger = setup()

    hover(trigger)
    await advance(199)
    expect(tooltip()).not.toBeInTheDocument()

    await advance(1)
    expect(tooltip()).toHaveTextContent("Overview")
  })

  it("cancels opening when the pointer leaves before the delay", async () => {
    const trigger = setup()

    hover(trigger)
    await advance(100)
    fireEvent.pointerLeave(trigger, { pointerType: "mouse" })
    fireEvent.mouseLeave(trigger)
    await advance(300)

    expect(tooltip()).not.toBeInTheDocument()
  })

  it("opens immediately for keyboard focus", async () => {
    const trigger = setup()

    focusWithKeyboard(trigger)
    await advance(0)

    expect(trigger).toHaveFocus()
    expect(tooltip()).toHaveTextContent("Overview")
  })

  it("does not open a hidden tooltip while the sidebar is expanded", async () => {
    const trigger = setup(false)

    hover(trigger)
    await advance(300)
    expect(tooltip()).toBeNull()

    focusWithKeyboard(trigger)
    await advance(0)
    expect(trigger).toHaveFocus()
    expect(tooltip()).toBeNull()
  })
})
