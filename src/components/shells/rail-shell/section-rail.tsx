import { cn } from "cn"
import { Fragment } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { NavSection } from "@/config/navigation"
import { ShellUserMenu } from "../shared/shell-user-menu"
import { ICON_STROKE_WIDTH } from "./icon-stroke"

interface SectionRailProps {
  sections: NavSection[]
  selected: NavSection
  // Section showing in the floating card while collapsed, if any.
  peeked: NavSection | null
  collapsed: boolean
  onSelect: (section: NavSection) => void
  onHover: (section: NavSection) => void
  onSettingsNavigate: () => void
}

// The outer column: one icon button per section. These never navigate; they
// choose which section the panel lists. The user menu sits at the bottom.
export function SectionRail({
  sections,
  selected,
  peeked,
  collapsed,
  onSelect,
  onHover,
  onSettingsNavigate,
}: SectionRailProps) {
  return (
    <div className="flex w-(--sidebar-width-icon) shrink-0 flex-col items-center py-2">
      <div
        role="group"
        aria-label="Sections"
        className="flex min-h-0 flex-1 flex-col items-center gap-4"
      >
        {sections.map((section) => {
          const isSelected = section.title === selected.title
          return (
            <Fragment key={section.title}>
              {section.dividerBefore && (
                <div aria-hidden className="-my-1 h-px w-6 bg-sidebar-border" />
              )}
              {/* Collapsed, the floating card names the section, so the
                  tooltip is off entirely (an invisible open tooltip would
                  eat Escape). */}
              <Tooltip disabled={collapsed}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      data-section={section.title}
                      aria-pressed={isSelected}
                      aria-expanded={
                        collapsed ? peeked?.title === section.title : undefined
                      }
                      className="text-sidebar-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                      onClick={() => onSelect(section)}
                      onMouseEnter={() => onHover(section)}
                    />
                  }
                >
                  {/* Filled once selected, as ChatGPT's are. */}
                  <section.icon
                    strokeWidth={ICON_STROKE_WIDTH}
                    className={cn("size-5", isSelected && "fill-current")}
                  />
                  <span className="sr-only">{section.title}</span>
                </TooltipTrigger>
                <TooltipContent side="right">{section.title}</TooltipContent>
              </Tooltip>
            </Fragment>
          )
        })}
      </div>
      <ShellUserMenu compact onSettingsNavigate={onSettingsNavigate} />
    </div>
  )
}
