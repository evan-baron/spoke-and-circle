# Launch checklist

Everything discussed but not yet done, plus setup steps that only apply at deploy time. Go through this top to bottom before launch, and tick items off as they're finished. Never put secret values in this file, only variable names.

Hosting: domain on Cloudflare, app on Vercel, database on Neon, auth via Auth0.

## 1. Blocking before launch

### Cloudflare and Vercel setup

- [ ] Generate a long random string (for example `openssl rand -hex 32`) and set it in Vercel as `CLOUDFLARE_ORIGIN_SECRET`.
- [ ] In Cloudflare, add a Modify Request Header rule (Rules > Transform Rules) that sets `X-Origin-Secret` to that same string on all requests to the domain.
- [ ] After deploying to a preview, confirm the rate limiter sees separate visitor IPs. Hit the API a few times from different networks and check the `identifier` values in the `RateLimit` table. If they are all Cloudflare addresses, the secret or rule is wrong.
  - Why: the limiter (`lib/rateLimit.ts`) only trusts `CF-Connecting-IP` when the `X-Origin-Secret` header matches. Without it, every visitor behind Cloudflare shares a few IPs and would lock each other out of the 10 per minute location search limit.
- [ ] Optional: add an edge rate-limit rule for `/api/locations` in Cloudflare (WAF rate limiting) or the Vercel Firewall. Check what the current plan includes before relying on it.

### Google Cloud (Places API)

- [ ] Set a daily quota cap on Places API (New) and a budget alert. This is the real ceiling on cost if bots get through.
- [ ] Confirm the key is restricted to Places API (New) only, with no website/referrer restriction (calls come from the server, not the browser).
- [ ] Add `GOOGLE_PLACES_API_KEY` to Vercel environment variables.
- [ ] Remove the unused `GOOGLE_MAPS_PLATFORM_API_KEY` line from `.env`. It was from the repliably GCP project, which was deleted.
- [ ] Verify the old repliably key no longer works. It could not be tested here because its value had already been removed from `.env`. Confirm in the Google Cloud console (Credentials in the repliably project) that it is gone, or test the old key text yourself and check it returns an error.
- [ ] Google attribution: the location dropdown shows the text "Google Maps". Google prefers its logo where space allows, so decide whether to swap in the official logo (Places API policies page).
- [ ] Do not cache Google's autocomplete suggestions. Google's terms restrict caching Places content beyond place IDs.

### Environment variables to set in Vercel

- [ ] `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (production, used when `NODE_ENV=production`)
- [ ] `APP_BASE_URL` set to the production origin. `middleware.ts` rejects cross-origin `POST`/`PUT`/`PATCH`/`DELETE` requests to `/api` that do not match it.
- [ ] `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`
- [ ] `GOOGLE_PLACES_API_KEY`, `CLOUDFLARE_ORIGIN_SECRET`
- [ ] Add the production callback and logout URLs in the Auth0 dashboard.

### Database

- [ ] Run `npx prisma migrate deploy` against the production database. Migrations so far: `drop_team_slug` and `add_rate_limit_table`, plus the earlier ones. The build script only runs `prisma generate`, it does not migrate.
- [ ] Decide whether to load any starting data. `prisma/seed.ts` refuses to run when `NODE_ENV=production`, on purpose.

### Verify in a real browser

The repo rules say not to use browser automation or run builds unless asked, so these have only been checked with typecheck and direct API calls.

- [ ] Load the deployed site and check the console for Content-Security-Policy errors (headers are in `next.config.ts`). The script policy allows `'unsafe-inline'` because Next needs it. `upgrade-insecure-requests` is production only.
- [ ] Try the Location field and the Additional locations pills on the new team page: typing, picking with mouse and keyboard, removing a pill, the 10 location limit, phone width.
- [ ] Confirm the "Choose a location from the list" message appears when Location is left as free text.
- [ ] Try the Team attributes, Event types and Join / applicant requirements checkbox tiles at phone width.
- [ ] Try the search page filters. Selects and checkboxes now wait 300ms before submitting.
- [ ] Run `npm audit` and address anything serious. The install steps reported vulnerabilities.

## 2. Features not built yet

- [ ] **Pages still read the static list.** Search, the team detail page and the homepage count all read `lib/teams.ts`, not the database. Team URLs (`/teams/<id>`) therefore use the static ids like `portland-velo-collective`, not database ids. Move `getAllTeams`, `getTeamById` and `searchTeams` to Prisma, then `generateStaticParams` too.
- [ ] **No `POST /api/teams`.** The new team form is a wireframe and says nothing is saved. When building it:
  - Map the form fields to `createTeamSchema` in `lib/validation.ts` (`additionalLocations` arrives as several values with the same name).
  - Use the `teams-write` rate limit bucket. Anonymous callers are set to 0, so decide how anonymous submissions work (see the bot protection decision below).
  - Add a double-submit guard and a disabled button while sending.
  - New submissions save as `Pending` for admin review.
  - `withAuth` and `withPublicRateLimit` in `lib/api/withAuth.ts` are ready to use. `withAuth` is not used by any route yet.
- [ ] **ZIP code to location** (raised for later, not answered in detail yet):
  - The location dropdown is limited to cities and states, so typing a ZIP such as `97201` returns nothing.
  - Options: Google Geocoding API through a server route (same key, needs the API enabled on the key), Places Autocomplete with the postal code type, or an offline ZIP dataset.
  - The get-started quiz already collects `zipCode` (`RiderPreferences` in `lib/types.ts`).

- [ ] **Admin features.** The role plumbing exists (see Reference) but nothing uses it yet:
  - There is no way to promote a user. Until an admin screen exists, set the role in the database, for example `UPDATE "User" SET role = 'admin' WHERE email = '...';` or use Prisma Studio.
  - The admin review queue (approve or reject `Pending` teams) is not built, and no admin-only UI bits exist yet.
  - After changing a role, the person has to reload the page. The layout that supplies the role to client components does not re-run on in-app navigation. Server checks are always current.

## 3. Open decisions

- [ ] **Bot protection without forcing login.** No decision yet. Options discussed:
  1. Cloudflare Turnstile on first use of the location field, exchanged for a signed cookie of about 30 minutes. `/api/locations` would require the cookie and rate-limit per cookie as well as per IP. Recommended for autocomplete.
  2. Anonymous form, log in only at the final Submit step (passwordless email code).
  3. Confirm the contact email by link before a submission enters the review queue, with no account needed. Recommended for submissions.
  4. Honeypot field plus a minimum time-to-submit on the form.
  5. Replace Google with a bundled offline US cities list, so bots cost nothing.
  6. Edge rules in Cloudflare or Vercel.
- [ ] **More location search limits (not done).** Only the per-minute limit was changed, to 10 for everyone. Still optional: an hourly per-IP limit, a global hourly cap across all IPs, raising the minimum query from 2 to 3 characters, and a same-origin check on the GET route. The limit counts search requests, not picks, so adding many locations quickly could hit it.
- [ ] **`rideVisibility`.** Leave alone. The user is still debating what Private means for ride details. `visibility: Private` means membership-gated and Private teams stay listed publicly.

## 4. Known rough edges

- [ ] Location search: picking a state stores `Oregon`, cities store `Portland, OR`. The existing search filter is a plain substring match, so searching "Oregon" does not find teams stored as "Portland, OR".
- [ ] Location search: Washington DC shows up as odd variants such as "Washington D.C., DC".
- [ ] No audit log yet. Repliably has one. Add it when the app has writes worth recording.
- [ ] Rate limit table cleanup is opportunistic (about 1 in 100 rate-limited requests deletes old rows), there is no scheduled job.
- [ ] Auth-related pages are not gated by a session cookie check. Decide whether anything needs it once submissions exist.

## Reference

### Security layers already in place

- Security headers (CSP, frame, sniffing, HSTS, referrer, permissions) in `next.config.ts`.
- CORS limited to `APP_BASE_URL`, and cross-origin mutating requests to `/api` get a 403, in `middleware.ts`.
- Database-backed rate limiting with atomic counting: `lib/rateLimit.ts`, limits in `lib/rateLimitConfig.ts` (`teams-read` 60/min anonymous, `teams-write` 5 per 10 min per user, `locations-search` 10/min).
- Route wrappers with auth, disabled-account check, rate limiting and error handling: `lib/api/withAuth.ts`.
- Team input validation, including `http`/`https` only for website URLs: `lib/validation.ts`.
- Search query parameters capped at 100 characters and 10 values: `app/search/page.tsx`.
- 300ms debounce and request cancelling on the location input and the search filters.
- Google key stays server-side (`lib/locations.ts`, `app/api/locations/route.ts`).

### How roles work

The database (`User.role`) is the only source of truth. Never trust a role from the browser.

- **Server components and pages:** `getCurrentUser()` in `services/currentUserService.ts` returns `{ email, firstName, lastName, role, isAdmin }` or `null`. It is cached per request, and it creates the database row on first login. `requireAdmin()` redirects non-admins to the homepage.
- **API routes:** `withAuth({ rateLimit: '...', role: 'admin' }, handler)` in `lib/api/withAuth.ts` returns 403 for non-admins.
- **Client components:** `useCurrentUser()`, `useIsAdmin()` (`contexts/CurrentUserContext.tsx`) and `<AdminOnly fallback={...}>` (`components/AdminOnly/AdminOnly.tsx`). These only show or hide UI. Any admin action must also be enforced on the server with one of the two options above.
- A disabled user (`active = false`) is never treated as an admin.
- **Admin pages:** everything under `app/(auth)/admin/` is guarded by `app/(auth)/admin/layout.tsx`, which calls `requireAdmin()`. Also call `await requireAdmin()` at the top of every admin `page.tsx`, because Next does not re-run a layout when moving between pages inside it, so the layout alone is not enough.

### Environment variable names (values live in `.env` and Vercel only)

`DEVELOPMENT_DATABASE_URL`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `APP_BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `GOOGLE_PLACES_API_KEY`, `CLOUDFLARE_ORIGIN_SECRET`
