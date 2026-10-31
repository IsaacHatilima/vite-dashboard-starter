import { AuthBrand } from "./auth-brand"
import { AuthShellContext, type AuthShellProps } from "./auth-shell-context"
import { authShellImage } from "./auth-shell-image"

// Shadcnspace reference: a floating form surface over a full-page photo.
export function PhotoAuthShell({ children }: AuthShellProps) {
  return (
    <AuthShellContext value={{ card: false }}>
      <div
        data-slot="auth-shell"
        data-shell="photo"
        className="relative isolate min-h-svh bg-background p-4 [--auth-surface:var(--card)] sm:p-8 lg:p-12"
      >
        <img
          src={authShellImage}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-dialog-overlay"
          aria-hidden="true"
        />
        <main className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-7xl items-center py-8 sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-6rem)]">
          <div className="flex w-full max-w-md flex-col gap-8 rounded-3xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10 sm:p-8">
            <AuthBrand />
            {children}
          </div>
        </main>
      </div>
    </AuthShellContext>
  )
}
