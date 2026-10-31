import { AuthBrand } from "./auth-brand"
import { AuthShellContext, type AuthShellProps } from "./auth-shell-context"

// shadcn login-03: a centered card with the brand above it.
export function CardAuthShell({ children }: AuthShellProps) {
  return (
    <AuthShellContext value={{ card: true }}>
      <div
        data-slot="auth-shell"
        data-shell="card"
        className="flex min-h-svh items-center justify-center bg-background p-6 [--auth-surface:var(--card)] md:p-10"
      >
        <main className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex justify-center">
            <AuthBrand />
          </div>
          {children}
        </main>
      </div>
    </AuthShellContext>
  )
}
