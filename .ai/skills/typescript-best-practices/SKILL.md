---
name: typescript-best-practices
description: Use when reading, writing, or reviewing any .ts or .tsx file - modelling state with discriminated unions, branding ids, parsing external data at the boundary with the project's schema library, removing as-casts and any, exhaustive switches, and deciding where validation belongs.
---

# TypeScript best practices

Applies to: TypeScript in any stack (Nest, Next, TanStack Start, React, React Native, Node). Project guidance and the stack skills win where they are more specific, such as `nest/dtos` for Zod request schemas. Examples for every rule are in [references/patterns.md](references/patterns.md).

## Type-system discipline

Make the compiler reject impossible states, mismatched primitives and unhandled variants. Prefer defining errors and special cases out of existence over adding handlers for them.

- **Brand semantic primitives.** `UserId` and `OrderId` are strings underneath but must not be interchangeable. If two arguments share a primitive type but mean different things, brand them. Validate once at creation and trust the type downstream.
- **External data is untyped until parsed.** Request bodies, JSON, RPC payloads, messages, CLI arguments, config, environment variables and database rows each get a parse function that turns them into the typed model.
- **Derive types from the authoritative schema.** When a Zod schema, Prisma model, OpenAPI spec, GraphQL schema or design-token file owns a shape, derive the type from it instead of hand-writing a parallel one.

## Boundary discipline

Validate, narrow and handle errors at system boundaries: HTTP handlers, server functions, CLI, config, queues, external APIs. Inside, trust the types: no re-validation and no defensive `?.` on values the boundary already guaranteed. Expose domain types across the boundary, never the transport's or ORM's private shape. Keep business logic in pure functions the framework shell calls, so it can be tested without the framework. Ask: "Is this data crossing a boundary right now?" If not, the check is redundant.

## Rules

| Rule | Summary |
|------|---------|
| Discriminated unions | Model variants with a `kind` literal discriminant so impossible states can't be represented. No bags of optional fields. |
| Branded types | Brand primitives with `& { readonly __brand: "X" }`. A brand comes from a verifying type guard (`input is AgentId`) or parser, never from `as`. |
| Constructive modeling | Shape the type so the illegal value can't be built: `[T, ...T[]]` for non-empty, `start` plus `duration` for a range. |
| Simplest total type | Keep `T[]` while every operation stays total. Strengthen to `NonEmpty<T>` only where the loose type forces `!`, a cast, or a "should never happen" throw. |
| `unknown` over `any` | External data is `unknown`. `any` is not allowed in new code. |
| Schemas before guards | Before hand-writing a property-by-property guard, use the project's schema library and infer the type from the schema (`z.infer`). |
| No `as` casts | Every `as` is a runtime crash waiting. Cast only after validation; `as const` is fine. |
| Narrowing hierarchy | Discriminant switch, then `in`, then `typeof`/`instanceof`, then a user-defined guard, and `as` last. |
| Type guards | A guard must verify its claim; a lying guard is worse than `as`. Name them `isX` or `hasX`. |
| Exhaustiveness | `const _exhaustive: never = x;` in the default arm, so adding a variant is a compile error. |
| `satisfies` over `as` | Validates a value without widening its literal types. |
| Boundary validation | Parse where data enters into a named domain type. `Record<string, unknown>` stops at that parse. |
| Derived types | Reach for `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited` and `typeof` before declaring a new interface. |
| Object arguments | Pass an object, not positional arguments, so order documents itself. Skip on hot paths such as render loops and parsers. |
| Real tests | Don't mock what you can run. Use the framework's real test primitives; mock only what can't run locally. |
| Structured logging | Use the project's logger with enough context to debug from an id. No `console.log` in shipped code. |

## Reviewing TypeScript

A new `any`, an unvalidated `as`, a non-null `!` that hides a missing invariant, a guard that doesn't check what it claims, a non-exhaustive switch over a union, or validation scattered inside business logic is a finding when the change introduces it. Name the boundary where the value should have been parsed and the type that would make the bad state unrepresentable.

Adapted from [pstack](https://github.com/backnotprop/pstack)'s typescript-best-practices, principle-type-system-discipline and principle-boundary-discipline skills (MIT, see [LICENSE](LICENSE)).
