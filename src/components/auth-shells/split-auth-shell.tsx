import { AuthBrand } from "./auth-brand"
import { AuthShellContext, type AuthShellProps } from "./auth-shell-context"
import { authShellImage } from "./auth-shell-image"

// shadcn login-02: a full-height form column beside a photo.
export function SplitAuthShell({ children }: AuthShellProps) {
  return (
    <AuthShellContext value={{ card: false }}>
      <div
        data-slot="auth-shell"
        data-shell="split"
        className="grid min-h-svh bg-background [--auth-surface:var(--background)] lg:grid-cols-2"
      >
        <div className="flex min-w-0 flex-col gap-8 p-6 md:p-10">
          <div className="flex justify-center md:justify-start">
            <AuthBrand />
          </div>
          <main className="flex flex-1 items-center justify-center py-6">
            <div className="w-full max-w-sm">{children}</div>
          </main>
        </div>
        <div
          className="relative hidden overflow-hidden bg-muted lg:block"
          aria-hidden="true"
        >
          <img
            src={authShellImage}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </AuthShellContext>
  )
}
