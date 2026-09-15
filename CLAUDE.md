# Project instructions

## Verifying frontend/UI changes

Do NOT use Playwright, or any other browser-automation tool, to take
screenshots while building or verifying UI/styling changes in this repo.

Do NOT run `next build` (or `npm run build`) to verify changes either.

Instead, verify with `npm run typecheck` only, and describe the resulting
markup/styles in words. Only open the app in a real browser, or run a
build, if the user explicitly asks for it.
