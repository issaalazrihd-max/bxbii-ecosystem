# @edusec/db

Prisma schema and migrations for the EduSec Cloud platform foundation.

## What's here

- `prisma/schema.prisma` — the source of truth for the data model.
- `prisma/migrations/20260101000000_init/` — the full foundation schema (tenants, branches, users, roles/permissions, branch access, audit, students + transfer workflow, employees, inventory transfer).
- `prisma/migrations/20260101000001_add_rls_policies/` — PostgreSQL Row-Level Security on `students`, demonstrating the branch-scoping pattern.
- `src/permissions.ts`, `src/roles.ts` — the permission catalog and pre-built role templates (EduSec Cloud brief, Section 43).
- `src/seed.ts` — seeds a tenant, four branches (Head Office, Muscat, Salalah, Sohar), the permission catalog, all 13 role templates, and one Super Admin login.

## Applying the branch-scoping RLS pattern to a new table

Every table that carries a `branch_id` (or, for `students`, `current_branch_id`) should get the same two things when it ships:

```sql
ALTER TABLE "your_table" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "your_table_tenant_and_branch_scope" ON "your_table"
  USING (
    "tenant_id" = current_setting('app.tenant_id', true)
    AND (
      current_setting('app.is_head_office', true) = 'true'
      OR "branch_id" = ANY (string_to_array(current_setting('app.branch_ids', true), ','))
    )
  );
```

**Keep this as one policy, not two.** Postgres combines multiple `PERMISSIVE`
policies on the same table+command with `OR`, not `AND` — splitting tenant
isolation and branch scoping into separate `CREATE POLICY` statements looks
reasonable but silently lets a caller with the *wrong* tenant see every
tenant's rows the moment any other permissive policy on that table would
have allowed it. This was an actual bug caught by testing this exact
migration live against PostgreSQL 16 while building this scaffold — see the
root `README.md` → "How this was built and verified" for the full story and
the specific query outputs before and after the fix.

## Why there's no `node_modules` here

This package's dependencies (`@prisma/client`, `prisma`, `argon2`, `tsx`)
could not be installed in the sandbox this scaffold was generated in — its
network policy blocked the npm registry entirely for that session (see root
`README.md`). Run `pnpm install` from the repo root in an environment with
normal registry access, then:

```bash
pnpm db:generate        # prisma generate
pnpm db:migrate:deploy  # applies the two migrations above
pnpm db:seed            # tenant, branches, roles, permissions, super admin
```

The migrations themselves were still validated: they were hand-derived from
`schema.prisma` and applied directly with `psql` against a live PostgreSQL
16 instance in the sandbox, including the RLS policy fix above. `prisma
migrate deploy` runs the identical SQL files, so that validation carries
over.
