# Launch checklist

Everything discussed but not yet done, plus setup steps that only apply at deploy time. Go through this top to bottom before launch, and tick items off as they're finished. Never put secret values in this file, only variable names.

Hosting: domain on Cloudflare, app on Vercel, database on Neon, auth via Auth0.

## 1. Blocking before launch

### SEO and social sharing


### Verify in a real browser

The repo rules say not to use browser automation or run builds unless asked, so these have only been checked with typecheck and direct API calls.

- [ ] Load the deployed site and check the console for Content-Security-Policy errors (headers are in `next.config.ts`). The script policy allows `'unsafe-inline'` because Next needs it. `upgrade-insecure-requests` is production only.
- [ ] Try the Location field and the Additional locations pills on the new team page: typing, picking with mouse and keyboard, removing a pill, the 10 location limit, phone width.
- [ ] Try the location field on the home page hero and on `/search` at phone width: the autocomplete dropdown (including whether it is clipped by the hero), ZIP codes, the radius select, and the get-started quiz redirect with a ZIP.
- [ ] Confirm the "Choose a location from the list" message appears when Location is left as free text.
- [ ] Try the Team attributes, Event types and Join / applicant requirements checkbox tiles at phone width.
- [ ] Try the search page filters. Selects and checkboxes now wait 300ms before submitting.
- [ ] Run `npm audit` and address anything serious. The install steps reported vulnerabilities.

## 2. Features not built yet

- [ ] **Keyword search matches tags only as whole tags.** Name and mission statement are substring matches, but Prisma cannot do substring matches inside array columns, so a tag has to match exactly. If that matters, use a raw SQL query or a search column.
- [ ] **Team submission follow-ups** (`POST /api/teams` works and saves as `Pending`):
  - Submissions are rate limited to 3 per hour per IP for anonymous callers (`teams-write` in `src/lib/rateLimitConfig.ts`). Check this is right for real use, for example a club submitting several groups at once.
  - Some form inputs have nowhere to be stored yet: the "Other" text for virtual platforms (`virtualPlatformOtherDescription`), and the segmentation yes/no and description. Persona "Other" text is stored as its own persona entry.
  - There is no duplicate check. The same name can be submitted repeatedly, and only the rate limit slows it down.
- [ ] **Admin review follow-ups** (approve and reject work at `/admin/pending`):
  - Decide whether reject should really hard delete, or set `Rejected` and keep the row (easier to audit and to answer "why was mine rejected"). `Rejected` exists in the status enum but is unused.
- [ ] **Persona radio stores display text.** Persona is saved as text like `Women Only`. The plan is to store a code (`womenOnly`) and map it to a label for display, with a separate field for the "Other" text. Not done yet.
- [ ] **Staged team deletion.** Only the schema exists (`Team.deleteAfter`, `Team.deletionRequestedAt`, with an index on `deleteAfter`). Nothing uses it yet. Design and tasks are under "Staged team deletion design" in the Reference section. To finish it:
  - Add the request and undo endpoints, hide scheduled teams everywhere, add the purge cron, set `CRON_SECRET`, decide who may request deletion, and add the emails. Details below.
- [ ] **Admin delete is a wireframe.** `/admin/all` (`src/components/AdminTeamsTable`) lists approved teams from the database (paginated, same as `/search`), with per-group Delete and multi-select delete, but deleting only hides rows in the browser until reload. To make it real:
  - Add a `DELETE /api/admin/teams` route using `withAuth({ rateLimit: ..., role: 'admin' }, handler)`, a zod-validated list of ids, and a new rate limit bucket for admin writes.
  - Decide between hard delete, a soft delete (for example set status to `Rejected`), or the staged deletion flow below. There is no audit log or undo today, so hard delete is permanent.
  - Refresh the list after deleting (`router.refresh()`).
- [ ] **Promoting users.** `/admin/users` lists users, but there is no way to promote one to admin from the UI. Until there is, set the role in the database, for example `UPDATE "User" SET role = 'admin' WHERE email = '...';` or use Prisma Studio.
  - After changing a role, the person has to reload the page. The layout that supplies the role to client components does not re-run on in-app navigation. Server checks are always current.

## 3. Open decisions

- [ ] **Bot protection for submissions without forcing login.** No decision yet. The math question is checked on the server, but its questions ship to the browser, so it only stops simple bots. Options discussed:
  1. Anonymous form, log in only at the final Submit step (passwordless email code).
  2. Confirm the contact email by link before a submission enters the review queue, with no account needed. Recommended.
  3. Honeypot field plus a minimum time-to-submit on the form.
  4. Edge rules in Cloudflare or Vercel.
- [ ] **`rideVisibility`.** Leave alone. The user is still debating what Private means for ride details. `visibility: Private` means membership-gated and Private teams stay listed publicly.

## 4. Known rough edges

- [ ] No neighbourhood-level location data. The Census "places" file has no boroughs or neighbourhoods (for example `Brooklyn, NY`), so `POST /api/teams` rejects any location that doesn't match a real city, ZIP, or state in `Place` (`src/services/placeService.ts`, `findUnknownLocations`). Add a neighbourhood list if that turns out to matter for real submissions.
- [ ] No audit log yet. Repliably has one. Add it when the app has writes worth recording.
- [ ] Rate limit table cleanup is opportunistic (about 1 in 100 rate-limited requests deletes old rows), there is no scheduled job.
- [ ] Auth-related pages are not gated by a session cookie check. Decide whether anything needs it once submissions exist.
- [ ] Drop the legacy schedule columns on `Team` (`rideSchedule`, `startTimes`, `rideDays`, `seasons`). The app no longer writes them, and reads them only as a fallback for teams that have no `rides` value yet (`deriveRides` in `src/lib/api/teamMapper.ts`). Once every team has been re-saved or backfilled, remove the fallback, the columns, and the demo data in `src/lib/teams.ts` and `prisma/seed.ts` that still sets them.

## Reference

### Security layers already in place

- Security headers (CSP, frame, sniffing, HSTS, referrer, permissions) in `next.config.ts`.
- CORS limited to `APP_BASE_URL`, and cross-origin mutating requests to `/api` get a 403, in `src/middleware.ts`.
- Database-backed rate limiting with atomic counting: `src/lib/rateLimit.ts`, limits in `src/lib/rateLimitConfig.ts` (`teams-read` 60/min anonymous, `teams-write` 3 per hour per IP for anonymous callers, `locations-search` 60/min).
- Route wrappers with auth, disabled-account check, rate limiting and error handling: `src/lib/api/withAuth.ts`.
- Team input validation, including `http`/`https` only for website URLs: `src/lib/validation.ts`.
- Search query parameters capped at 100 characters and 10 values, page number capped at 10000: `src/lib/searchParams.ts`.
- 300ms debounce and request cancelling on the location input and the search filters.

### Staged team deletion design

When someone deletes their team, it is not removed right away. It is scheduled for removal in 7 days, so an accidental or hasty delete can be undone.

**Data model (already in the schema):**

- `deleteAfter DateTime?`: `null` means the team is not scheduled for deletion. A value means it is scheduled, and the value is the moment it becomes eligible for permanent removal (request time plus 7 days). There is deliberately no separate "pending" state column, so state and date can never disagree.
- `deletionRequestedAt DateTime?`: when the request was made, for support and audit.
- `status` (`Pending` / `Approved` / `Rejected`) is a review status. Do not reuse it for deletion.

**Tasks:**

- [ ] **Request endpoint** (owner or admin only): sets `deletionRequestedAt = now()` and `deleteAfter = now() + 7 days`. Validate input with zod, rate limit it, and use `withAuth`.
- [ ] **Undo endpoint:** sets both columns back to `null`. Allowed until the purge runs.
- [ ] **Hide scheduled teams immediately.** Every public read must add `deleteAfter: null` to its filter: `GET /api/teams`, search, the team page (return 404) and any counts. Show the owner and admins a banner with a countdown and an Undo button.
- [ ] **Purge cron:** a route such as `/api/cron/purge-deleted-teams`, scheduled with Vercel Cron in `vercel.json`:
  - Protect it with a `CRON_SECRET` bearer token, compared with `timingSafeEqual` (same approach as repliably's `src/app/api/cron/route.ts`). Add `CRON_SECRET` in Vercel.
  - Delete with `deleteMany({ where: { deleteAfter: { lte: new Date() } } })`, in batches, and log how many were removed.
  - It must be safe to run twice (idempotent). Compare against the current timestamp, not a calendar date, to avoid timezone edge cases.
  - Vercel's Hobby plan limits crons to once a day, which is fine for this. Check the current limits for your plan.
  - The same cron can also call `cleanupExpiredRateLimits()` from `src/lib/rateLimit.ts`.
  - Verify Cloudflare rules do not block the cron request.
- [ ] **Who may request deletion:** a team currently only has `submittedBy`. Decide whether the submitter or a separate owner can request deletion, plus admins.
- [ ] **Admin delete:** decide whether admin deletes (`/admin/all`) go through this same 7 day flow or delete immediately.
- [ ] **Emails:** confirmation with an undo link at request time, and optionally a reminder one day before the purge.
- [ ] **Related data:** if rosters, members or uploads are added later, decide whether they are removed by the purge (cascade) or kept.
- [ ] **Audit:** record who requested and who purged once an audit log exists.

### How roles work

The database (`User.role`) is the only source of truth. Never trust a role from the browser.

- **Server components and pages:** `getCurrentUser()` in `src/services/currentUserService.ts` returns `{ email, firstName, lastName, role, isAdmin }` or `null`. It is cached per request, and it creates the database row on first login. `requireAdmin()` redirects non-admins to the homepage.
- **API routes:** `withAuth({ rateLimit: '...', role: 'admin' }, handler)` in `src/lib/api/withAuth.ts` returns 403 for non-admins.
- **Client components:** `useCurrentUser()`, `useIsAdmin()` (`src/contexts/CurrentUserContext.tsx`) and `<AdminOnly fallback={...}>` (`src/components/AdminOnly/AdminOnly.tsx`). These only show or hide UI. Any admin action must also be enforced on the server with one of the two options above.
- A disabled user (`active = false`) is never treated as an admin.
- **Admin pages:** everything under `src/app/(auth)/admin/` is guarded by `src/app/(auth)/admin/layout.tsx`, which calls `requireAdmin()`. Also call `await requireAdmin()` at the top of every admin `page.tsx`, because Next does not re-run a layout when moving between pages inside it, so the layout alone is not enough.

### How database URLs are chosen

`prisma.config.ts` and `src/lib/prisma.ts` both pick the connection string the same way:

```ts
const dbUrl =
	process.env.NODE_ENV === 'development' ?
		process.env.DEVELOPMENT_DATABASE_URL
	:	process.env.DATABASE_URL;
```

**Production is the default.** `DATABASE_URL` is used unless `NODE_ENV` is exactly `development`. `next dev` sets that automatically, so `npm run dev` targets your local database without any extra setup. But a bare CLI command run outside of `next dev` — `npx prisma migrate deploy`, `npx prisma studio`, `npx tsx prisma/seed.ts`, `npm run db:import-places`, etc. — has no `NODE_ENV` set at all by default, so **it targets production** unless you explicitly prefix it with `NODE_ENV=development` (or `$env:NODE_ENV="development"` in PowerShell). `prisma/seed.ts` and `prisma/importGazetteer.ts` have no environment guard, so always check which database a bare command is about to hit before running something destructive.

There is no `DATABASE_URL_UNPOOLED` in this project — everything, including migrations, goes through the single pooled `DATABASE_URL`.

### Environment variable names (values live in `.env` and Vercel only)

`DEVELOPMENT_DATABASE_URL`, `DATABASE_URL`, `APP_BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `CLOUDFLARE_ORIGIN_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`

`NEXT_PUBLIC_GA_MEASUREMENT_ID` is the Google Analytics 4 Measurement ID (`src/components/GoogleAnalytics/GoogleAnalytics.tsx`, wired in `src/app/layout.tsx`). It only renders when the var is set, so scope it to the Production environment in Vercel to keep local dev and preview deployments out of analytics.
