# FreightQuote Lite — zero-cost open-source MVP

**Status: v0.1.1 independently checked locally on 2026-10-19; NOT a live website.**

FreightQuote Lite is a no-backend quotation builder for small freight-forwarding teams. It works on the visitor's device, calculates fees in minor currency units, shows cost and gross margin privately, and prints a customer-facing quote without internal costs. Japanese, Chinese, and English are supported.

## What works

- Quote: issuer, customer, origin, destination, currency and optional validity date.
- Up to 50 editable line items with quantity, internal unit cost and customer unit price.
- Live cost, revenue, gross profit and gross margin calculations.
- JPY (whole yen), USD (cents) and CNY (fen); **one currency per quote, no FX conversion**.
- Customer-facing print stylesheet. Use the browser's **Print → Save as PDF** option.
- Three interface / quotation languages. Sample data for testing only.
- By default: no account, cookies, quote storage, quote upload, third-party JS, analytics or AI runtime.
- Optional free Cloudflare page analytics configuration is prepared, but not activated. See [analytics setup](docs/ANALYTICS.md).
- CSP and other security headers for supported static hosts.

**Important limits:** This is a drafting calculator, not a live freight rate engine or a tax/customs/compliance calculator. Printed quotes are illustrative and need review before commercial use. No checkout, paid offer or automatic acquisition is live in V1.

## Requirements

Node.js 22+ for build/test. There are **zero runtime/build npm dependencies** and **no runtime server**.

```bash
npm run check       # syntax checks, build, and all automated tests
npm run build       # generates the deployable static dist/ folder
```

For local browser preview:

```bash
python3 -m http.server 8000 --directory dist
# Open http://127.0.0.1:8000
```

The deployed site must serve `dist/`, **not** `site/`, because the build copies `src/calculator.mjs` into `dist/lib/`.

## Free hosting

See [docs/DEPLOY.md](docs/DEPLOY.md) for GitHub → Cloudflare Pages Git deployment. Free `*.pages.dev` URL, no domain purchase. Connect the account yourself during OAuth. Do not add a paid plan or service. Set environment variable `SITE_URL=https://<your-confirmed-project>.pages.dev` when deployed so the build can generate a canonical URL and sitemap. The program does **not** know its final public URL yet.

## Cloud Codex handoff

Use the separate repository for this project — **do not use or alter any LuAIOS repository**. Read [AGENTS.md](AGENTS.md) and [docs/CODEX_CLOUD_TASK.md](docs/CODEX_CLOUD_TASK.md). The independent repository is [rikuleolu/freightquote-lite](https://github.com/rikuleolu/freightquote-lite), initially private. This source is the verified release candidate. No Codex Cloud task or Cloudflare deployment has been verified; the handoff must use this repository only.

## Independently reproduced validation

- `npm run check`: 14/14 tests passed, both default and SEO/analytics-ready builds.
- 13 browser scenarios passed in isolated headless Microsoft Edge: all languages/currencies, confirmation/cancel flows, invalid inputs, 50 rows, text injection, reload/storage/network checks, and 320/390/768/1440px layouts.
- Six actual browser PDFs independently passed text checks; three single-page language samples and all 50 rows of the multipage sample were checked. Internal costs and margins were absent. ISO currency codes are explicit.
- Reproduced and fixed: large safe cent amounts rounded in display; legitimate SEO URLs rejected by deployment tests; customer PDFs omitted an explicit currency code.
- Local runtime: Node 24.19.0. Cloudflare/CI target: Node 22. Cloud execution is not implied by local results.
- **Not verified:** GitHub CI, hosted URL, Cloudflare account connection, analytics ingestion, indexing, real users or payments.

Browser QA is separate from the dependency-free build. Install Playwright **for testing only** (`npm install --no-save --package-lock=false playwright@1.62.1`, then `npx playwright install chromium`) and run `npm run test:e2e`. It starts a loopback-only server and uses an isolated profile. `BROWSER_CHANNEL=msedge` selects an installed Edge; `PLAYWRIGHT_MODULE` can point at an already installed Playwright `index.mjs`. PDFs/screenshots go into ignored `qa-artifacts/`, or `QA_OUTPUT`.

For independent PDF assertions, install the QA-only Python package `pypdf`, then run `python tests/check-pdfs.py qa-artifacts`. Automated results do not replace viewing the PDFs.

## Security and data handling

- All user inputs render as **text nodes**, never as HTML.
- No fetched carrier prices; no external network requests.
- Quote entries are kept in page memory and are cleared when the tab refreshes.
- Customer print view does not include internal costs or margin.
- No tracking or payments are connected. `CF_ANALYTICS=1` prepares a translated disclosure and the narrowly scoped CSP needed for dashboard-managed Cloudflare Web Analytics. Actual activation requires the account connection and a live network check; it does not measure quote or payment conversion.

## Licensing

MIT, see [LICENSE](LICENSE). Contributions should keep the tool useful without requiring paid services.
