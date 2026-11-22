---
name: frontend-overlays
description: Use when adding, choosing, or reviewing a dialog, modal, drawer, sheet, popover, dropdown menu, tooltip, toast, or confirmation, especially when it's unclear what opens it or whether it needs a URL, or when overlays stack, lose focus, close by accident, drop unsaved work, blur the page, or break on mobile.
---

# Overlays

Applies to: anything that opens over or beside a page. Project guidance and an existing design system win over these defaults. The frame around pages is `app-shell`.

In projects built on [vite-dashboard-starter](https://github.com/IsaacHatilima/vite-dashboard-starter), use its shared parts from `src/components/ui/`: `Dialog` (with `DialogBody`, which scrolls while header and footer stay put), `Drawer`, `Sheet`, `CommandDialog`, `DropdownMenu`, `Tooltip`, and the Sonner `Toaster` mounted once in `App`. Never wrap them in feature-specific copies. Their `stack` option gives dialogs, drawers and commands a layered edge, and `modal={false}` keeps the page interactive behind a drawer or sheet.

## Choose the lightest container

Use the least interruptive container that fits, because a modal blocks the page and hides its context.

- **Inline expansion** shows detail in place, behind a chevron.
- **Tooltip** names an icon or term, on hover and focus.
- **Menu** holds actions on one object, behind a "…" or labelled button.
- **Popover** holds a small form tied to its button: share, filter, date.
- **Drawer** from the right shows a record beside its list, opened by a row click. In the starter it sits 8px in from the edge with rounded corners.
- **Non-modal sheet** (`<Sheet modal={false}>`, up to 620px, flush to the edge) holds work the user does alongside the page, such as a task they edit while reading the list.
- **Dialog** holds a short task that needs an answer (create, rename, confirm), opened by a button or shortcut.
- **Page** holds long or multi-step work.
- **Toast** reports a finished action.

## Opening

- Only drawers and pages get a URL (`?task=42`), so reload, Back and shared links reopen them. A row's name is also a real link to its drawer, for keyboard and new-tab use.
- Action menus open on click, Enter, Space or Down Arrow, never on hover, so they don't open by accident.
- Give frequent creates a single-key shortcut, shown in the tooltip and menu.
- Tooltips appear after a short hover delay, at once on focus, and hold nothing needed to finish the task. Every icon-only button has one.
- Show one toast at a time, at the bottom centre, for about 5 seconds (`toast.success("Changes saved")`); an Undo toast stays until used or dismissed. Errors never go in a toast; show them where they happened.

## Placing actions

Place each action by frequency and importance: a labelled button (primary create, Share), an icon button with a tooltip (sort, filter), a popover or drawer opened in place (share settings, record details), a control shown on row hover and focus (copy, remove member), then the "…" menu (archive, delete). Inside a popover, put the primary action first and ready to use, such as the invite field in a share popover.

## Focus and closing

- On open, focus the first field. In a confirmation, focus Cancel, so Enter can't destroy anything; in long content, the title.
- Tab stays inside dialogs, drawers and sheets.
- Escape closes the top layer only and returns focus to the trigger, or to the next logical element if the trigger is gone.
- Every dialog, drawer and sheet has a visible close button.
- An outside click closes menus, popovers and read-only drawers. Dialogs and forms ignore it, so a stray click can't lose work.
- Closing a form with unsaved changes, by any means, asks "Discard changes?" with "Keep editing" focused. Popovers save as they close.

## Destructive actions

- Do reversible actions at once and offer Undo, because people click through routine confirmations.
- Confirm only what can't be undone. Name the object and the consequence, and label buttons with the action ("Delete project", "Cancel"), never Yes, No or OK. Make the destructive button the `destructive` variant, never a hand-picked red.
- Ask for a typed name only in the rarest, worst cases, such as deleting a workspace.
- Put destructive menu items last, after a separator, away from routine slips.

## Stacking, size and backdrop

- One modal layer at a time, because people lose track of stacked layers. If a step needs another dialog, replace the first; only a confirmation may sit over a form. Menus and popovers inside a dialog are fine. The exception is a drawer opened from inside a drawer's content: the starter detects the nesting, stacks the parent behind it, and returns to it on close.
- Widths: the starter's `Dialog` defaults to 24rem, right for confirmations; widen forms to about 560px with a class, and 720px at most.
- Cap height at 85vh. Header and footer stay pinned and opaque; only the body scrolls, with room for focus rings.
- Dim the page without blurring it, through the `--dialog-overlay` token: 30% black in light mode and 50% in dark, so the page stays readable. Menus, popovers, tooltips and non-modal sheets get no backdrop.
- Lock page scroll behind modal layers.

## Mobile

- Under 768px, dialogs and popovers become bottom sheets, and drawers and long forms go full screen, because floating panels have no room there. In vite-dashboard-starter, build these dialogs from `ResponsiveDialog` (`src/components/ui/responsive-dialog.tsx`): its parts render a centered `Dialog` from 768px up and a `Drawer` that swipes down below it, so the content is written once. A copy of the starter that predates it has only the centered `Dialog`; there, switch on `useIsMobile()` (`src/hooks/use-mobile.ts`) and render the same content in `Drawer` with `swipeDirection="down"` under 768px. A project without either adds one such wrapper to its shared components instead of switching inside a feature. Swapping `Dialog` for `Drawer` remounts what's inside, so keep a form's values and pending state above the switch, or fix the mode when the overlay opens; otherwise rotating a phone or resizing the window drops what the user typed.
- Sheets keep a close button, swipe down to dismiss, and close on Back.
- Touch has no hover, so anything revealed on hover also lives in a menu.

Sources: WAI-ARIA APG ([dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)), NN/g ([modals](https://www.nngroup.com/articles/modal-nonmodal-dialog/), [confirmations](https://www.nngroup.com/articles/confirmation-dialog/), [accidental dismissal](https://www.nngroup.com/articles/accidental-overlay-dismissal/), [tooltips](https://www.nngroup.com/articles/tooltip-guidelines/), [bottom sheets](https://www.nngroup.com/articles/bottom-sheet/), [notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)), Material ([dialogs](https://m3.material.io/components/dialogs/guidelines), [snackbars](https://m3.material.io/components/snackbar/guidelines)), Apple HIG ([sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [popovers](https://developer.apple.com/design/human-interface-guidelines/popovers), [alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)), [shadcn/ui](https://ui.shadcn.com/docs/components/drawer), [Radix](https://www.radix-ui.com/primitives/docs/components/dialog), and Kole Jain's [dashboard video](https://youtu.be/Ksx9C2-3yMo) for action placement.
