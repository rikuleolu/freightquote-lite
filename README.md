# FreightQuote Lite — zero-cost open-source MVP

## Three working digital tools

[Try the product catalog](https://freightquote-lite.pages.dev/products): FreightQuote Template Kit (JPY 980), [Freight Cost Workbench](https://freightquote-lite.pages.dev/buy-freight) (JPY 1,480) and [Solo Project Quote](https://freightquote-lite.pages.dev/buy-solo) (JPY 980) have separate one-time Stripe purchase links. The two tools include online demos, offline ZIPs, customer CSV/PDF and internal save/reopen. Full files remain publicly available without payment; the purchase is for the packaged files and bounded file-use assistance, not exclusive access or locked features. See [tool conditions](https://freightquote-lite.pages.dev/tool-purchase-terms) and the [Stripe release record](docs/STRIPE_TOOLS_LAUNCH_20261020.md).

No new hosting subscriptions or runtime libraries are required. Free samples and full trial files are available without an account; a successful download must not be treated as proof of payment. Native payment-link configuration, website/browser checks, actual customer payment and bank settlement are separate evidence categories. No live card was charged for testing; sandbox transaction testing remains unperformed for the two new offers.

## v0.2 public operating release

The free site includes [Japanese](https://freightquote-lite.pages.dev/guide-ja), [Chinese](https://freightquote-lite.pages.dev/guide-zh) and [English](https://freightquote-lite.pages.dev/guide-en) workflow guides, customer-only downloadable CSV examples and a practical FAQ. Language-specific entry links use `?lang=ja`, `?lang=zh` or `?lang=en`. Quote data stays local and is not auto-saved.

An optional [FreightQuote Template Kit](https://freightquote-lite.pages.dev/template-kit-en) is available for JPY 980 once: nine HTML templates in three languages and three palettes, with manual amounts and a guide. The calculator remains free. See [purchase conditions](https://freightquote-lite.pages.dev/purchase-terms) and the [operating plan](docs/OPERATIONS.md). Files are shareable; downloads are not evidence of payment.

**Live and independently verified on 2026-10-19: [freightquote-lite.pages.dev](https://freightquote-lite.pages.dev).**

[Source](https://github.com/rikuleolu/freightquote-lite) · [Request a feature](https://github.com/rikuleolu/freightquote-lite/issues/new?template=feature_request.md). Do not publish customer information or actual quotes in issues.

FreightQuote Lite is a no-backend quotation builder for small freight-forwarding teams. It works on the visitor's device, calculates fees in minor currency units, shows cost and gross margin privately, and prints a customer-facing quote without internal costs. Japanese, Chinese, and English are supported.

## What works

- Quote: issuer, customer, origin, destination, currency and optional validity date.
- Up to 50 editable line items with quantity, internal unit cost and customer unit price.
- Live cost, revenue, gross profit and gross margin calculations.
- JPY (whole yen), USD (cents) and CNY (fen); **one currency per quote, no FX conversion**.
- Customer-facing print stylesheet. Use the browser's **Print → Save as PDF** option.
- Three interface / quotation languages. Sample data for testing only.
- By default: no account, cookies, quote storage, quote upload, third-party JS, analytics or AI runtime.
- Free Cloudflare page analytics is enabled on the production site; a live synthetic-quote privacy check passed on 2026-10-20. The default local build remains analytics-free. See [analytics setup](docs/ANALYTICS.md).
- CSP and other security headers for supported static hosts.

**Important limits:** This is a drafting calculator, not a live freight rate engine or a tax/customs/compliance calculator. Printed quotes need review before commercial use. The separate template checkout does not unlock calculator features or provide live rates. No customer revenue or bank settlement has been verified.

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

See [docs/DEPLOY.md](docs/DEPLOY.md) for GitHub → Cloudflare Pages Git deployment. Free `*.pages.dev` URL, no domain purchase. Connect the account yourself during OAuth. Do not add a paid plan or service. Set environment variable `SITE_URL=https://<your-confirmed-project>.pages.dev` when deployed so the build can generate a canonical URL and sitemap. The confirmed public origin is `https://freightquote-lite.pages.dev`. Production uses Node 22 and runs checks before the final build.

## Cloud Codex handoff

Use the separate repository for this project — **do not use or alter any LuAIOS repository**. Read [AGENTS.md](AGENTS.md) and [docs/CODEX_CLOUD_TASK.md](docs/CODEX_CLOUD_TASK.md). The independent repository is [rikuleolu/freightquote-lite](https://github.com/rikuleolu/freightquote-lite), initially private. The source is public and deployed through Cloudflare Pages. An independent Codex Cloud environment is published for this repository only; fresh-session acceptance on Node 22.23.3 passed 14 code checks, 13 browser scenarios and six PDF checks on 2026-10-20. The cloud proxy denied production-site access (CONNECT 403), so public HTTPS verification is recorded separately from the cloud-local suite.

## Initial-release validation (historical)

- `npm run check`: 14/14 tests passed, both default and SEO/analytics-ready builds.
- 13 browser scenarios passed in isolated headless Microsoft Edge: all languages/currencies, confirmation/cancel flows, invalid inputs, 50 rows, text injection, reload/storage/network checks, and 320/390/768/1440px layouts.
- Six actual browser PDFs independently passed text checks; three single-page language samples and all 50 rows of the multipage sample were checked. Internal costs and margins were absent. ISO currency codes are explicit.
- Reproduced and fixed: large safe cent amounts rounded in display; legitimate SEO URLs rejected by deployment tests; customer PDFs omitted an explicit currency code.
- Local runtime: Node 24.19.0. Cloudflare deployment independently ran all 14 checks on Node 22.22.0 and passed. The real HTTPS site passed the 13 browser scenarios and six PDF assertions; production app/calculator files matched the reviewed source.
- **Verified after launch:** both the launch PR and its merged main commit passed GitHub Actions. Eight additional production checks passed, including single-beacon injection, three-language disclosure, cookie absence, and successful analytics ingestion without synthetic quote fields in request payloads. **Still unverified:** search indexing, natural users or payments. The initial private-repository Actions job was skipped to avoid potential charges; Pages build evidence is separate.

Browser QA is separate from the dependency-free build. Install Playwright **for testing only** (`npm install --no-save --package-lock=false playwright@1.62.1`, then `npx playwright install chromium`) and run `BROWSER_CHANNEL=chromium npm run test:e2e` and `BROWSER_CHANNEL=chromium npm run test:products`. They use a loopback-only server and an isolated profile. `BROWSER_CHANNEL=msedge` selects an installed Edge; `PLAYWRIGHT_MODULE` can point at an already installed Playwright `index.mjs`. PDFs/screenshots go into ignored `qa-artifacts/`, or `QA_OUTPUT`. The public-repository CI also runs these browser suites with an ephemeral QA-only installation; see its actual run logs for current results.

For independent PDF assertions, install the QA-only Python package `pypdf`, then run `python tests/check-pdfs.py qa-artifacts`. Automated results do not replace viewing the PDFs.

## Security and data handling

- All user inputs render as **text nodes**, never as HTML.
- No fetched carrier prices or quote uploads. The default build makes no external requests; production additionally uses the disclosed Cloudflare page-analytics beacon.
- Quote entries are kept in page memory and are cleared when the tab refreshes.
- Customer print view does not include internal costs or margin.
- Production uses disclosed Cloudflare Web Analytics with `CF_ANALYTICS=1`, a narrowly scoped CSP, and verified ingestion. Test visits are not evidence of demand. Stripe handles payments through separate purchase pages; page analytics does not measure quote fields or prove payment conversion.

## Licensing

MIT, see [LICENSE](LICENSE). Contributions should keep the tool useful without requiring paid services.
