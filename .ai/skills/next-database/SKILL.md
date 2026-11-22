---
name: next-database
description: "Use when writing persistence code in a Next.js app: the Drizzle client and schema, repository queries, transactions and races, translating database errors, migrations, caching user data, or database-backed tests. Drizzle with PostgreSQL by default; a project already on Prisma keeps it."
---

# Next database

Applies to: `src/db/**` (or `db/**`), `drizzle.config.ts`, `drizzle/**`, and `app/**/server/repositories/*.repository.ts`. Project guidance and existing conventions win over these defaults.

Use Drizzle with node-postgres. A project already on Prisma keeps Prisma: never switch ORMs inside a feature, and see **Prisma projects** at the end.

## Client

- `src/db/index.ts` starts with `import 'server-only'`, so a client import fails the build. It builds one `pg` `Pool` from validated config, keeps it on `globalThis` outside production because `next dev` re-evaluates modules on every change, and exports `db = drizzle(pool, { schema })`.
- It also exports `Database` (`typeof db`), `Transaction` (the callback argument of `Database['transaction']`), and `Executor` (`Database | Transaction`).
- Only repositories import `db`. Server Actions, route handlers, pages, and services never import it, a schema table, or a `drizzle-orm` operator.

## Schema

- One file per table in `src/db/schema/`, re-exported by `schema/index.ts`. `drizzle.config.ts` and `drizzle(pool, { schema })` both read that index.
- Tables are plural snake_case, with camelCase properties and explicit column names: `ownerId: uuid('owner_id')`.
- Ids are `uuid('id').primaryKey().defaultRandom()`. Timestamps are `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`. Updates set `updatedAt: new Date()` explicitly.
- Every foreign key states its delete rule: `.references(() => users.id, { onDelete: 'restrict' })` by default, `'cascade'` only for truly dependent rows, `'set null'` on optional keys. Index every foreign key that isn't the leading column of another index, because PostgreSQL doesn't.
- Store money as integer minor units. Declare uniqueness with `.unique()` or `uniqueIndex()`, including expression indexes such as `lower(name)`, so the database decides races. Closed value sets are a `pgEnum`.
- Export the row type beside the table: `export type ProjectRow = typeof projects.$inferSelect`.

## Repositories

- domain-driver's `next-fullstack` stack generates one repository per action, such as `server/repositories/CreateProject.repository.ts` with one `handle()`. SQL that several actions need goes in a shared repository with named methods that take domain arguments only. Pass two or more ids, or any flag, as one object, `handle({ ownerId, id })` or `list({ ownerId, includeArchived })`, so a swapped pair can't compile into a wrong query.
- Select only what the caller maps: `db.select({ id: projects.id, name: projects.name })`, and `.returning({ ... })` with the same columns. Map rows to the feature's types in one function, never by returning the row.
- Write each column explicitly in `.values()` and `.set()`. Never spread parsed input into them.
- Single-row reads end in `.limit(1)` and return `row ?? null`.
- Scope in the same statement: a read, update or delete of another owner's row matches nothing, so `where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))` returns no row and the page calls `notFound()`. The owner id comes from the session, never from the client.
- Translate expected errors where they happen. Drizzle wraps the driver error, so its SQLSTATE is on `error.cause` as well as, for raw driver calls, on `error`. Read it through one helper in `src/db/pg-errors.ts` that exports `pgCodeOf(error)` and named checks such as `isUniqueViolation(error, constraint?)`. `23505` is a unique violation and `23503` a foreign-key violation. Rethrow anything else.

## Transactions and races

- The repository that owns a multi-statement write opens `db.transaction(async (tx) => …)` and passes `tx` to every statement inside. A shared-repository method used inside one takes a trailing `on: Executor = db`.
- Keep slow work, such as hashing or calling another service, out of the callback.
- For a state change, make the expected state part of the write: `update(projects).set({ status: 'archived', updatedAt: new Date() }).where(and(eq(projects.id, id), eq(projects.ownerId, ownerId), eq(projects.status, 'active'))).returning(...)`. No row back means it was missing or already changed: the repository reads it once, in the same scope, and returns what it found, and the service tells the user which. Two concurrent requests can't both succeed, because only one update matches. Never read the status first and then write.
- Use atomic SQL for counters (`sql\`${t.stock} - 1\``), `pg_advisory_xact_lock` to serialize work per key, and a bounded retry on `40001` and `40P01` under `serializable` or `repeatable read`.

## Caching and freshness

- A user's rows are never cached across users. Don't put them under `'use cache'` or `unstable_cache` unless the user id is part of the key; reading the session already makes the page dynamic.
- After a write, the Server Action refreshes what changed (`revalidatePath`, `updateTag`; see `next/actions`). The repository never revalidates.

## Pagination

Every list query has a `limit`, so no request reads a whole table. Page a list only when the issue asks for paging or the API's callers expect it. Otherwise the list shows at most a fixed cap the spec names, such as the newest 200 of one owner's projects, in one query: never loop over batches to read past the cap. When you page, use keyset: order by a unique tuple such as `(createdAt, id)`, select `limit + 1` rows to know whether more exist, and return `{ items, nextCursor }`. Never page large tables with `offset`.

## Migrations

- After a schema change run `drizzle-kit generate --name <change>` and commit the schema, the SQL and `drizzle/meta` together. Read the SQL before committing.
- When `generate` asks whether a column was renamed or replaced, don't guess: a wrong answer drops data. Ask, or expand and contract over two migrations.
- Data changes and backfills are `drizzle-kit generate --custom --name <change>` files, written to be safe to rerun.
- Never run `drizzle-kit push` in a project that has a `drizzle/` folder. `drizzle-kit migrate` is a deploy step, and `drizzle-kit check` catches conflicting migrations from parallel branches.

## Tests

Repository, action and page tests run against the project's `_test` database, migrated once per run. Worktrees and parallel agents may share it, so a test creates its own rows with fresh ids (a new owner per test isolates every query scoped to it) and deletes them afterwards, instead of truncating shared tables. Race tests run the two writes with `Promise.all` and assert that exactly one succeeded and what the other returned.

## Example

```ts
// src/app/projects/server/repositories/ArchiveProject.repository.ts
import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { projectColumns, toProject } from './Project.record';

export class ArchiveProjectRepository {
  async handle({ ownerId, id }: { ownerId: string; id: string }) {
    const owned = and(eq(projects.id, id), eq(projects.ownerId, ownerId));
    const [row] = await db
      .update(projects)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(and(owned, eq(projects.status, 'active')))
      .returning(projectColumns);
    if (row) return { project: toProject(row), exists: true };

    const [current] = await db.select({ id: projects.id }).from(projects).where(owned).limit(1);
    return { project: null, exists: current !== undefined };
  }
}
```

```ts
// src/app/projects/server/services/ArchiveProject.service.ts
import 'server-only';

import { ArchiveProjectRepository } from '../repositories/ArchiveProject.repository';

const repository = new ArchiveProjectRepository();

export class ArchiveProjectService {
  async handle(input: { ownerId: string; id: string }) {
    const { project, exists } = await repository.handle(input);
    if (project) return { kind: 'archived' as const, project };
    return exists ? { kind: 'already-archived' as const } : { kind: 'missing' as const };
  }
}
```

The repository reports what the database did; the service decides what that means for the user.

## Prisma projects

The rules above hold with Prisma's names. `src/db/index.ts` exports one `PrismaClient` with a driver adapter (`new PrismaPg({ connectionString })`), cached on `globalThis` outside production. Run `prisma generate` after every schema change and `prisma migrate dev --name <change>` to write a migration. Select with `select`, scope with the owner in `where`, and make state changes conditional with `updateMany({ where: { id, ownerId, status: 'active' } })`, checking `count`. Multi-statement writes use `prisma.$transaction(async (tx) => …)`. `P2002` is a unique violation, `P2003` a foreign-key violation, and `P2025` a missing record.
