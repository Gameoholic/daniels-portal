# Daniel's Portal

Self-hosted auth and permissions platform. Handles auth for my personal apps (bookkeeping, gym tracker, shopping list, etc.).

**Live:** https://www.portaldaniel.com/

Demo accounts (public credentials, so permissions may have been messed with):
- `guest` / `guest`
- `admin` / `admin`

> ⚠️ Work in progress, currently on hold. Placeholders and incomplete pages exist.

## Stack

Next.js · TypeScript · PostgreSQL · TailwindCSS · bcrypt · Resend · shadcn/ui

## Features & Architecture

### DAL is enforced by the type system, not by convention

All DB queries live in `_internal/` and require a `DALScope` parameter. `DALScope` is a TypeScript `unique symbol` that can only be constructed inside the DAL. Calling a raw query from anywhere else fails to compile.

Two execution paths:
- `executeDatabaseQuery` — validates the access token, resolves the user ID via a `GET_USER_ID_FROM_ACCESS_TOKEN` symbol
- `tokenless_executeDatabaseQuery` — separate path for login and account creation, the only operations that legitimately run without a token

Both paths are typed so you can't accidentally use the wrong one.

### DB-backed access tokens, not JWTs

Every request validates against the DB. Slower than JWT but allows:
- Immediate revocation (I want to kill sessions immediately when something feels off, not wait 15 minutes for a JWT to expire)
- Last-use tracking per token
- User-configurable concurrent session limit, with auto-revoke of oldest tokens when exceeded
- Per-token metadata on why it was invalidated (expired / revoked / auto-revoked)

### Server never trusts the client

Every server action re-verifies the token AND re-checks that the requested resource belongs to the token's owner. Knowing a valid expense ID isn't enough to access it.

Server-only types are mapped to minimized client-facing types before returning. The client never sees internal fields.

### Permissions are per-resource, not role-based

Each app in the portal has its own permission (`use_bookkeeping`, `use_gym`, etc.). Admin capabilities are split into individual actions (`manage_tokens`, `delete_users`, `issue_creation_codes`, etc.). No "admin" role — just a set of granted permissions per user.

### Invite-only registration

Admins issue single-use account creation codes tied to:
- A specific email address (can't be forwarded)
- A predefined permission set
- A default token expiry for that user
- A code expiry

Both issuer and new user get confirmation emails when a code is redeemed.

### Misc. security

- bcrypt with configurable salt rounds
- Login response is identical whether the username exists or not, with a fake bcrypt comparison on username miss to defeat timing attacks
- Admin panel never exposes raw token values, only an unrelated alias string
- Emails are censored in the UI

## Bootstrap

Utility script creates the initial SUDO account with all permissions. Run once, then delete.

## Roadmap / known issues

### Security
- Validate `deleted` / `disabled` state inside `verifyAccessToken` and every query accepting a user ID
- Refresh token race condition: concurrent requests at expiry all fail except the first
- Refresh tokens should store user ID so password change / logout invalidates all sessions
- Hard-delete should cascade with DB transactions so a recycled user ID can't inherit old data
- Replace bootstrap account creation codes with a one-time flow that prints a random password to terminal

### Features
- Home page: messages
- Per-user security log: last successful password login, failed login count since last success, last failed login timestamp
- Per-user default preferences applied to newly issued tokens (theme, date format, etc.)
- Revoker ID stored on access tokens and admin actions
- `all-permissions` meta-permission for privileged scripts

### DX
- Remove `interface`, use `type`, so server-internal types can't leak to the client via declaration merging
- Permission check as an argument to `executeDatabaseQuery`
- Restrict `TokenlessQueryScope` imports to `tokenless-queries.ts` only
- `.env.local` generation script + boot-time validation of required env vars
- Proper error logging kept in memory (DB would be too expensive), with user ID and timestamp per error. Client only receives generic errors, never the internal code or message.

### Bugs
- Admin panel "last account usage" breaks when a user has no access tokens
- Action/query arguments accept `undefined` in places where they shouldn't
- Middleware should redirect to an error page instead of returning JSON
- System-issued permissions shouldn't be visible on admin page.

### Polish
- "Unsaved" indicator in settings when max token value is edited without saving
- Revert default token expiry on failed save
- Alignment fixes in the permissions tab