# Codex Cloud: next authorized coding task

## Repository
Use the existing independent repository `rikuleolu/freightquote-lite` (https://github.com/rikuleolu/freightquote-lite). It was confirmed private on 2026-10-19. Do not operate on `rikuleolu/LuAIOS`. Continue the verified v0.1.1 candidate, not the original ZIP. Confirm the branch and commit before starting.

## Task prompt (copy into Codex Cloud after importing source)

Independently verify FreightQuote Lite v0.1.1 from the existing source with no added recurring costs. Do not reimplement it from scratch. Follow `AGENTS.md`.

Acceptance:
1. Run `npm run check` on Node 22. Local Node 24 checks passed 14 tests; do not treat that as cloud evidence. Include actual test output. Fix only reproduced defects, adding regression tests first.
2. Smoke-test Japanese/Chinese/English UI, JPY/USD/CNY arithmetic, invalid input, clearing amounts on currency changes, adding/removing rows, and browser PDF print. Verify that internal unit costs and margins never appear on the customer-facing PDF.
3. Confirm responsive behavior on desktop and mobile, and no user-controlled HTML injection.
4. Preserve the existing release PR/branch. If a defect is reproduced, add a failing regression test first and commit the fix on its branch, or open a separate narrowly scoped PR. Do NOT touch other repositories.
5. Prepare Cloudflare Pages Git deployment using `npm run build`, output `dist`, Node 22. Do not purchase services, domains, API credits or enable payment. A website is LIVE only after the real Pages URL loads and tests pass.
6. For a confirmed deployed URL, configure `SITE_URL` for SEO sitemap and canonical URL, submit only if the owner has authorized Search Console access. Draft launch content in Japanese/Chinese/English, but do not mass-post or send messages automatically.
7. Report status as DONE / NOT DONE / BLOCKED for GitHub PR, CI, Cloudflare connection, real URL, indexing, analytics, and optional payment. Never claim revenue until a real transaction is reconciled.

The browser suite is `npm run test:e2e` (Playwright is a QA-only optional dependency). Use `python tests/check-pdfs.py qa-artifacts` for independent actual-PDF checks; inspect pages visually. Never force screen media when producing print evidence. Optional analytics is prepared behind `CF_ANALYTICS=1` and remains off until dashboard activation and live payload verification.

Important: Cloudflare GitHub OAuth, search-console verification and paid merchant setup may require the owner's one-time authorization. Do not invent credentials, URLs or billing approvals. If access is missing, stop only the blocked action and finish all independent checks.
