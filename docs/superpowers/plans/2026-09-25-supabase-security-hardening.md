# Supabase Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make profile ownership, public-card reads, analytics writes, and media uploads secure and reproducible without deleting production data.

**Architecture:** Versioned Supabase migrations create constrained tables, owner-only RLS, public read/analytics RPCs, and folder-scoped Storage policies. Browser code switches to these APIs before final broad privileges are revoked.

**Tech Stack:** PostgreSQL, Supabase Auth/RLS/Storage/RPC, Supabase JS v2, HTML, browser JavaScript, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-09-25-supabase-security-hardening-design.md`

## Global Constraints

- Do not delete application rows or Storage buckets.
- Keep the public anon/publishable key in the browser; never introduce a service-role key.
- Keep the old deployed frontend compatible until the new frontend is ready.
- Use fixed `search_path` and fully qualified names in every security-definer function.
- Public profile responses must exclude `id`, `user_id`, and `created_at`.

## Review Focus

- A forged `user_id` must not create or update another user's profile.
- Anonymous callers must not enumerate raw profile or analytics tables.
- Concurrent view events must increment atomically without lost updates.
- Unsupported link types and nonexistent usernames must not create analytics rows.
- Storage writes outside the authenticated user's first path segment must fail.

---

### Task 1: Add the test and migration scaffold

**Files:**
- Create: `package.json`
- Create: `tests/security/migration-contract.test.mjs`
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609250001_security_foundation.sql`

**Interfaces:**
- Produces: repository test command `npm test` and the first migration contract consumed by later tasks.

- [ ] **Step 1: Write failing migration-contract tests**

Assert that the foundation migration defines owner-bound profile policies, `get_public_profile`, atomic analytics RPCs, username constraints, Storage folder checks, MIME limits, and no destructive `DROP TABLE`/`DELETE` statements.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/security/migration-contract.test.mjs`

Expected: FAIL because the migration and required SQL contracts do not exist.

- [ ] **Step 3: Add minimal Node test scripts and Supabase local configuration**

Use Node's built-in test runner; do not add a runtime framework.

- [ ] **Step 4: Write the additive foundation migration**

Add profile constraints/FK, safe public profile RPC, registration trigger, atomic analytics RPCs, analytics ownership policies/indexes, and restricted Storage configuration/policies. Preserve temporary compatibility where required by the old frontend.

- [ ] **Step 5: Run contract tests and SQL formatting checks**

Run: `npm test`

Expected: all migration contract tests pass.

- [ ] **Step 6: Commit**

```bash
git add package.json tests/security/migration-contract.test.mjs supabase
git commit -m "feat: add Supabase security foundation"
```

### Task 2: Secure registration and authentication flows

**Files:**
- Modify: `register.html`
- Modify: `login.html`
- Modify: `reset.html`
- Create: `assets/js/auth.js`
- Create: `tests/security/auth-contract.test.mjs`

**Interfaces:**
- Consumes: profile-creation trigger from Task 1.
- Produces: `registerUser`, `loginUser`, `requestPasswordReset`, and `updatePassword` browser handlers in `assets/js/auth.js`.

- [ ] **Step 1: Write failing auth-contract tests**

Assert that registration sends normalized username metadata, does not query `profiles.email` or `profiles.username`, uses generic conflict messaging, includes autocomplete attributes, and enforces eight-character client guidance.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/security/auth-contract.test.mjs`

- [ ] **Step 3: Move auth behavior into `assets/js/auth.js`**

Bind forms with event listeners, preserve confirmation/reset redirects, and use accessible status regions.

- [ ] **Step 4: Run auth and full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add register.html login.html reset.html assets/js/auth.js tests/security/auth-contract.test.mjs
git commit -m "fix: harden browser authentication flows"
```

### Task 3: Move public card reads and analytics to RPCs

**Files:**
- Modify: `card.html`
- Create: `assets/js/card.js`
- Create: `tests/security/card-data-contract.test.mjs`

**Interfaces:**
- Consumes: `get_public_profile`, `record_profile_view`, and `record_link_click` from Task 1.
- Produces: public card loading and analytics handlers that never access analytics tables directly.

- [ ] **Step 1: Write failing card-data tests**

Assert RPC names, absence of direct `profiles.select('*')`, absence of direct analytics insert/upsert, safe protocol allowlist, safe image creation, and vCard escaping.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test tests/security/card-data-contract.test.mjs`

- [ ] **Step 3: Implement the RPC-based public card data layer**

Use DOM properties/text nodes for user data and fail closed for invalid URLs.

- [ ] **Step 4: Run full tests**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add card.html assets/js/card.js tests/security/card-data-contract.test.mjs
git commit -m "fix: secure public card data flow"
```

### Task 4: Harden dashboard ownership, analytics, and uploads

**Files:**
- Modify: `dashboard.html`
- Create: `assets/js/dashboard.js`
- Create: `tests/security/dashboard-contract.test.mjs`

**Interfaces:**
- Consumes: owner RLS, analytics owner-read policies, and Storage policies from Task 1.
- Produces: validated uploads with stable object paths and owner-only dashboard queries.

- [ ] **Step 1: Write failing dashboard tests**

Assert `auth.getUser()`, 5 MiB enforcement, MIME allowlist, stable user-folder paths, Storage removal, owner-filtered profile writes, safe analytics rendering, and no user-data HTML interpolation.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test tests/security/dashboard-contract.test.mjs`

- [ ] **Step 3: Implement the secure dashboard data layer**

Keep RLS as the authorization boundary and surface all rejected writes/uploads as accessible errors.

- [ ] **Step 4: Run full tests**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add dashboard.html assets/js/dashboard.js tests/security/dashboard-contract.test.mjs
git commit -m "fix: enforce dashboard ownership and upload limits"
```

### Task 5: Finalize privileges and verify the live project

**Files:**
- Create: `supabase/migrations/202609250002_security_finalize.sql`
- Modify: `tests/security/migration-contract.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: the migrated frontend from Tasks 2-4.
- Produces: final deny-by-default grants and documented operating procedure.

- [ ] **Step 1: Extend failing tests for final privilege revocation**

Assert removal of duplicate public policies, direct anon table access, duplicate index, and unsafe function execution grants.

- [ ] **Step 2: Write the final migration**

Revoke direct anon analytics/profile privileges and replace temporary compatibility policies with the final policy set.

- [ ] **Step 3: Run the full local suite**

Run: `npm test`

- [ ] **Step 4: Apply foundation migration through Supabase migration tooling**

Verify schema, RPC signatures, policies, bucket limits, and application smoke tests before proceeding.

- [ ] **Step 5: Apply final migration only after the new frontend path is live**

Immediately re-run anonymous/authenticated negative-access checks.

- [ ] **Step 6: Re-run Supabase security and performance advisors**

Expected: duplicate permissive-policy and duplicate-index warnings are cleared; leaked-password protection may remain a documented manual Auth setting.

- [ ] **Step 7: Document local setup, migration workflow, and manual Auth setting**

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/202609250002_security_finalize.sql tests/security/migration-contract.test.mjs README.md
git commit -m "docs: finalize Supabase security rollout"
```

