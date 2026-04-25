# Daniel's Portal

Self-hosted auth and permissions platform. Handles auth for my personal apps (bookkeeping, gym tracker, shopping list, etc.).

**Visit:** https://www.portaldaniel.com/

Demo accounts (public credentials, so permissions may have been messed with):
- `guest` / `guest`
- `admin` / `admin`

> ⚠️ Work in progress, currently on hold. Placeholders and incomplete pages exist.

Built to actually understand auth and security by writing it from scratch instead of relying on pre-existing libraries. Custom DB-backed access tokens, per-resource permissions, invite-only account creation, and a data access layer enforced at the type level so raw DB queries can't be called without proper authentication first.

Full technical writeup, design decisions, and screenshots: [gameoholic.dev/projects/daniels-portal](https://gameoholic.dev/projects/daniels-portal)
