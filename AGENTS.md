# Instructions for Codex Cloud / coding agents

Project: FreightQuote Lite, separate from the LuAIOS monorepo and any ANSHIN private business files.

## Goal
Deliver a functional, privacy-preserving, zero-new-fixed-cost public web MVP and test its behavior. Start from the existing files, do not re-create an unrelated platform. The owner expects an independent repo and actual CI/deployment evidence before claiming LIVE.

## Engineering rules
1. Write failing tests before bug fixes; for new features define verifiable acceptance cases, then implement.
2. Keep targeted modifications; avoid libraries, backends, costly APIs, paid SaaS or anything requiring ongoing charges.
3. Do not include real customer names, prices, invoices, contracts, API keys or ANSHIN internal data.
4. Keep **local-only** quote handling, no quote uploads and no cookies/localStorage. Analytics is disabled by default. The Owner requested statistics preparation: `CF_ANALYTICS=1` permits optional free Cloudflare page analytics with a disclosure; it requires real account activation and live verification. Never send quote fields or add custom quote events.
5. Keep customer PDF free of internal cost and gross margin; add a regression test if editing print behavior.
6. Keep currency arithmetic in integer minor units and do not implicitly convert JPY/USD/CNY. Currency switch clears amount fields after confirmation.
7. Keep the MIT license and documented limitations (no tax/FX/live rates).
8. Avoid autoposting, bulk messaging, paid advertisements and synthetic reviews. Human review before third-party publication.
9. Do not modify LuAIOS or any existing production repositories; do not switch on payments or publish corporate details before the user's authorization and legal verification.
10. Evidence of completion must include test logs, deployment URL with live read-back if published, and precise blockers.

## Checks
`npm run check` should pass without `npm install` because runtime/build use only Node built-ins.

## Deployment
Cloudflare Pages Git integration: production branch `main`, build command `npm run build`, output directory `dist`; set `NODE_VERSION=22`. After choosing a final public URL, set `SITE_URL` and verify `dist/sitemap.xml` generated and the site loads. Do not choose Direct Upload if automatic Git integration is the goal; switching methods later is not supported on one Pages project.
