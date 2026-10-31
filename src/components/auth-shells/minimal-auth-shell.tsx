import { AuthBrand } from "./auth-brand"
import { AuthShellContext, type AuthShellProps } from "./auth-shell-context"

// shadcn login-05: an unboxed form with a compact, icon-only brand.
export function MinimalAuthShell({ children }: AuthShellProps) {
  return (
    <AuthShellContext value={{ card: false }}>
      <div
        data-slot="auth-shell"
        data-shell="minimal"
        className="flex min-h-svh items-center justify-center bg-background p-6 [--auth-surface:var(--background)] md:p-10"
      >
        <main className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex justify-center">
            <AuthBrand iconOnly />
          </div>
          {children}
        </main>
      </div>
    </AuthShellContext>
  )
}
