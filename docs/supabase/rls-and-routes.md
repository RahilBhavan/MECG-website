# Supabase RLS vs app routes

This document maps **Postgres RLS** in [`supabase/migrations/`](../../supabase/migrations/) to **React Router** protection in [`src/App.tsx`](../../src/App.tsx) and role helpers in [`src/auth/AuthProvider.tsx`](../../src/auth/AuthProvider.tsx).

## Roles

| DB `user_roles.role` | Used in `App.tsx` `ProtectedRoute` |
| -------------------- | ---------------------------------- |
| `applicant`          | Default for all authenticated users (signup trigger). `/apply` is any logged-in user. |
| `alumni`             | `/network` requires `alumni` or `admin`. |
| `reviewer`           | `/review` requires `reviewer` or `admin`. |
| `admin`              | `/admin`, `/admin/directory`, `/admin/network-events` require `admin` only. |

**Post-login redirect** (`getPostLoginPath`): `admin` → `/admin`, else `reviewer` → `/review`, else `alumni` → `/network`, else `/apply`.

## RLS summary (authenticated)

### `profiles`

- **SELECT**: own row (`id = auth.uid()`); **or** admin (full row). Alumni **no longer** read other members’ rows directly — peer directory data comes from the **`list_directory_profiles`** RPC, which applies `directory_visible` plus per-field flags (`show_linkedin`, `show_interests`, `show_cohort`, `show_industry`).
- **INSERT/UPDATE**: own row only.

### `list_directory_profiles` (RPC)

- **`EXECUTE`**: `authenticated` users who are **alumni** or **admin**.
- **Behavior**: Returns masked columns for directory browsing; admins see unmasked values for operational use. Alumni peers are limited to `directory_visible = true` rows (excluding self).

### `network_event_going_count` (RPC)

- **`EXECUTE`**: alumni or admin; returns RSVP “going” count for capacity display.

### `user_roles`

- **SELECT**: own rows; **or** admin (see all).
- **INSERT/DELETE**: admin only (no self-service role escalation from the client).

### `applications`

- **SELECT**: owner; **or** admin; **or** reviewer for rows in `submitted` / `under_review` (to build review queue).
- **INSERT**: owner (`user_id = auth.uid()`).
- **UPDATE**: owner only (reviewers mutate `application_reviews`, not application rows).

### `application_reviews`

- **SELECT**: reviewer who wrote the row; **or** admin.
- **INSERT**: `reviewer_id = auth.uid()` and user has `reviewer` role and target application is `submitted` / `under_review`.
- **UPDATE/DELETE**: own review row.

### `network_events`

- **SELECT**: alumni or admin.
- **INSERT/UPDATE/DELETE**: admin only.

### `network_event_rsvps`

- **SELECT**: own rows; **or** admin (all rows).
- **INSERT**: `user_id = auth.uid()` and caller is alumni or admin.
- **UPDATE/DELETE**: own rows only.

## Admin directory CSV

[`src/pages/AdminDirectoryPage.tsx`](../../src/pages/AdminDirectoryPage.tsx) exports rows with `directory_visible = true` using the authenticated client (admin RLS). Includes visibility flags for auditing; no service role in the browser.

## Gaps and follow-ups

1. **Applicants cannot read others’ applications** — RLS matches the product intent. Reviewers see submitted/under_review only.
2. **Applicants do not see review rows** — RLS hides other reviewers’ notes; the UI should not assume cross-reviewer visibility.
3. **Regenerate Supabase types** — When the schema changes, run `bun run db:types` (local Supabase must be running) and reconcile with [`src/types/database.ts`](../../src/types/database.ts). Until then, avoid `createClient<Database>()` if generated types diverge (see `AGENTS.md`).

## Type generation

```bash
bun run db:start   # optional: local stack
bun run db:types   # writes src/types/supabase.gen.ts
```

Review the diff and update hand-maintained types or switch to generated types once they match.
