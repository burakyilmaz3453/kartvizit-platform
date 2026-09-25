# Supabase Security Hardening Design

## Goal

Harden the existing static Noshutdown card platform without changing its product model: public cards remain viewable by username, signed-in users can edit only their own profile, and public views/clicks continue to feed owner-only analytics.

## Current State

- The frontend is static HTML/CSS/JavaScript and talks directly to Supabase with a public anon key.
- `public.profiles`, `public.profile_views`, and `public.link_clicks` have RLS enabled but no migration history exists.
- All three application tables currently contain zero rows.
- `profiles` is publicly selectable in full, including internal identifiers.
- An authenticated user can insert a profile with an arbitrary `user_id` because the insert policy is `WITH CHECK (true)`.
- Analytics tables have several duplicated public policies with unconditional read/write access.
- View counting uses a non-atomic client-side select followed by upsert.
- The public `Avatars` bucket has no file-size or MIME allowlist. Existing write policies do not restrict updates to the authenticated user's folder.
- User-controlled profile values are interpolated into `innerHTML`, allowing stored XSS.
- Supabase Auth leaked-password protection is disabled.

## Architecture

The browser continues to use the Supabase publishable/anon key. Authorization is enforced entirely in PostgreSQL RLS, narrowly scoped RPC functions, and Storage policies; client checks are treated only as UX.

Database state becomes reproducible through versioned SQL migrations under `supabase/migrations/`. Remote changes are applied from the same SQL through Supabase migration tooling.

## Profile Model

`profiles.user_id` becomes a required foreign key to `auth.users(id)` with `ON DELETE CASCADE` and no generated default. `username` becomes required, unique, lowercase, and constrained to the same format accepted by the UI.

Direct table access is limited as follows:

- Authenticated users may select, insert, update, and delete only rows where `user_id = auth.uid()`.
- Anonymous users receive no direct access to `profiles`.
- Public card data is returned through `get_public_profile(text)`, a security-definer function with a fixed `search_path`, an explicit return column list, and execute grants only to `anon` and `authenticated`.
- Internal columns (`id`, `user_id`, `created_at`) are not returned by the public function.

The public card intentionally continues to expose the contact fields the owner entered for publication, including email, phone, address, and optional tax details.

## Registration Flow

Registration stops querying `profiles.email` and `profiles.username` anonymously. The frontend passes the normalized username in `signUp` user metadata. A database trigger creates the profile for the new `auth.users` row, using the new user's ID and email.

A unique username constraint remains the authoritative conflict check. Registration shows a generic failure message instead of revealing whether a specific email already exists.

## Analytics

Anonymous users receive no direct select, insert, update, or delete access to analytics tables.

- `record_profile_view(text)` atomically increments the counter only when the username belongs to an existing profile.
- `record_link_click(text, text)` inserts only known link types and only for an existing profile.
- Both functions use `SECURITY DEFINER`, a fixed empty `search_path`, fully qualified object names, input-length checks, and narrowly scoped execute grants.
- Authenticated owners may select analytics rows only for usernames attached to their own profile.
- A foreign key from analytics usernames to `profiles.username` prevents orphaned metrics.
- The duplicate unique index on `profile_views.username` is removed.
- `link_clicks(username, clicked_at)` is indexed for dashboard reads.

This design prevents arbitrary table writes and lost increments. It does not claim to provide strong bot-proof analytics; abuse-rate limiting would require an Edge Function or trusted proxy with a client signal.

## Storage

The `Avatars` bucket remains public because card images are public. It is constrained to a 5 MiB maximum and `image/jpeg`, `image/png`, `image/webp`, and `image/avif`.

Authenticated users may insert, update, or delete objects only when:

- `bucket_id = 'Avatars'`; and
- the first path segment equals `auth.uid()::text`.

The frontend validates MIME type and size before upload and uses stable per-user object names for avatar and banner images to avoid creating a new orphan on every upload. Removing an image deletes the Storage object as well as clearing the profile URL.

The unused public `Demo` bucket is not deleted automatically. It will be reported for an explicit owner decision because bucket deletion may destroy files.

## Browser Security

- Replace profile-data `innerHTML` interpolation with DOM element creation and property assignment.
- Render analytics labels with `textContent`.
- Accept outbound profile links only when parsed as `http:` or `https:` URLs.
- Escape vCard newlines and separators before generating downloads.
- Validate upload size and MIME type before network calls.
- Use `auth.getUser()` for the dashboard identity check; RLS remains the security boundary.
- Pin external script versions. A strict CSP is deferred until inline scripts and inline event handlers are extracted, because adding an `unsafe-inline` CSP would not address the main script-injection risk.

## Auth Configuration

Leaked-password protection must be enabled in Supabase Auth settings. If the available API cannot change this setting, the final handoff will identify it as the sole manual dashboard step. The UI minimum password length becomes 8 characters, while the authoritative Auth setting should match or exceed it.

## Verification

- Add repeatable static security tests for forbidden DOM sinks and required client validation.
- Validate migration SQL locally where possible and apply it once to the linked project.
- Test anonymous public-profile reads through the RPC and confirm direct table reads fail.
- Test that one authenticated user cannot create or modify another user's profile or Storage path.
- Test atomic profile-view increments and link-type rejection.
- Re-run Supabase security and performance advisors after migration.
- Verify the public demo card, registration, login, dashboard save, image upload/removal, and analytics paths.

## Rollout and Recovery

The migration is additive-first: create constraints/functions and replacement policies before the frontend switches to RPC calls. Because application tables are currently empty, no production row transformation is required.

Policy replacement and grants are transactional. If frontend deployment cannot immediately follow the database migration, compatibility grants must remain until the client switch is ready; final revocation occurs only after the new client path is verified. No production data is deleted. The unused `Demo` bucket remains untouched.

## Out of Scope

- Moving away from Supabase.
- Introducing a framework or application server.
- Deleting the `Demo` Storage bucket.
- Strong bot/fraud detection for analytics.
- A complete extraction of all inline CSS and JavaScript solely to support a nonce/hash-based CSP.
