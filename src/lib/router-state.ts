// Router state is untyped and survives reloads, so read it defensively.
export function readStateString(state: unknown, key: string): string | null {
  if (typeof state !== "object" || state === null || !(key in state)) {
    return null
  }

  const value: unknown = (state as Record<string, unknown>)[key]
  return typeof value === "string" ? value : null
}
