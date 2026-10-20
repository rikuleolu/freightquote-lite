# Three-product experiment — sales closed

The experiment adds `/products`, three detail/purchase-condition pages, two working calculators, a template demonstration, and downloadable samples to the existing dependency-free Pages build. It does not open checkout. The free quote calculator remains unchanged apart from a product-directory link.

## Deliverables

| Product | Deliverable | Proposed one-time total, including tax | Evaluation |
| --- | --- | --- | --- |
| FreightQuote Template Kit | Existing nine HTML templates, Japanese/Chinese/English, three palettes | JPY 980 | `/template-demo`; real Japanese Forest HTML sample |
| Freight Cost Workbench | ZIP containing single-file offline HTML; dimensional/actual weight, chargeable rounding, cost and target margin; customer CSV/PDF and save-filled HTML | JPY 1,480 | `/demo-freight`; worked text example |
| Solo Project Quote | ZIP containing single-file offline HTML; work/revision hours, expenses, target margin, deposit/balance; customer CSV/PDF and save-filled HTML | JPY 980 | `/demo-solo`; worked text example |

Prices are hypotheses, not validated willingness to pay. All complete files are freely available during evaluation. The source is public; new tools are MIT and the existing template package retains its included permissive notice. A future purchase supports packaged files and stated file-use assistance, not exclusive access. Do not imply an unprotected public download verifies a payment.

New tools support JPY planning estimates only. Tax, withholding, FX, live carrier rates, bookings, accounting integrations and ongoing updates are excluded. The freight tool handles one set of identical carton dimensions and carrier-configured kg-based chargeable weight, not ocean W/M or arbitrary multi-package tariffs. All example values are synthetic.

## Acceptance cases and validation

- Exact integer JPY arithmetic; bounded decimal inputs, no invalid/negative/non-finite input, no 100% margin.
- Freight fixture: 50×40×30 cm, ten cartons, 85 kg actual, divisor 6000, 0.5 kg rounding, JPY 600/kg, JPY 10,000 other cost, 20% margin → 100 kg chargeable, JPY 70,000 cost, JPY 87,500 suggested price.
- Solo fixture: 12.5 work hours + 2 revision hours, JPY 4,000/hour, JPY 5,000 expenses, 20% margin, 30% deposit → JPY 78,750 price, JPY 23,625 deposit and JPY 55,125 balance.
- Customer CSV/PDF excludes internal cost, margin and costing inputs. CSV escapes spreadsheet-formula prefixes and quotation marks.
- Saving an offline HTML copy preserves edited values after reopening; markup entered in text fields remains text.
- No new network endpoints, cookies, persistent browser storage, payment SDKs or collection forms.
- Three purchase-condition pages show proposed price, quantity, delivery, payment timing, refund terms, environment and seller link; order buttons remain disabled in static HTML, including without JavaScript.
- 390px and 1440px catalog/demo/purchase layouts, asset and download links, offline files and representative template save/reopen.

Commands:

```sh
npm run check
npm run test:products
npm run test:e2e
```

Browser checks use the existing optional Playwright setup documented in README. `PLAYWRIGHT_MODULE` can select a preinstalled QA library; `BROWSER_CHANNEL=msedge` uses an installed Edge. `QA_BASE_URL` runs product-page checks against a deployed preview, with offline artifacts still tested from the matching local build. Evidence goes to ignored `qa-artifacts/products/`. No testing library is added to production.

The temporary build fixture now copies the LICENSE because downloadable HTML embeds its license. This fixes the initial fixture failure introduced by this dependency. The new browser suite filters actual HTTP(S) network requests separately from Edge's internal download-panel URLs.

## Read-only starting evidence, 2026-10-20

- Repository public; main `c9219650fce3b0854b19f5a8c4f3c4371677de3b`.
- Existing main had successful GitHub Actions and Cloudflare Pages checks. Deployment preview: `https://d85f419b.freightquote-lite.pages.dev`.
- The owner's Stripe notice dated 2026-10-20 says payment processing and bank payouts are unavailable because business information could not be verified. The notice was read; no verification information was submitted, account configuration changed, or payment attempted. It is not a direct, refreshed Stripe API/dashboard eligibility check.
- No LuAIOS/DAIRAKU source, customer data, identity documentation or credentials were used.

## Sales gate and Japanese disclosures

No secret, live or test key is required by this implementation. There is no checkout URL, session, order or webhook to activate accidentally. Do not replace the disabled button with a payment link alone.

Before a separate, explicitly authorized sales release:

1. The account holder resolves Stripe verification and verifies actual charge/payout capability. KYC remains owner-operated.
2. The seller rechecks existing company, responsible person, address and telephone details and approves applicability to all three offers, tax-inclusive totals, payment methods/timing, delivery timing, supported environment, support scope, refund handling and records policy.
3. Review the final confirmation screen for exact product, quantity, total, delivery/payment timing, return conditions, amendment path and an unambiguous order action. The current pages deliberately create no contract.
4. Test authorized sandbox success, cancellation, failure, duplicate notification, fulfilment and refund flows before real payments. A download URL or return-page visit is never a trusted payment signal.
5. Verify actual free quotas and billing status before release; stop rather than upgrade when a limit is reached. No paid runner, API, database, storage bucket, domain, Stripe add-on or subscription is introduced here.

The prepared policy applies a seven-day issue-reporting window for duplicate purchases, corruption, non-delivery and failure in the stated environment, offering redelivery or refund without a seller refund-processing fee. Change-of-mind returns after download are generally excluded; statutory rights remain intact. This is proposed sales copy requiring seller confirmation, not a legal-compliance certification.

References checked on 2026-10-20:

- Consumer Affairs Agency, mail-order disclosures and final confirmation: https://www.no-trouble.caa.go.jp/what/mailorder/
- Consumer Affairs Agency, return-condition and application-screen guidance: https://www.no-trouble.caa.go.jp/what/mailorder/guidelines.html
- Personal Information Protection Commission, purpose specification and notice: https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/
- Stripe, commerce disclosure guidance: https://support.stripe.com/questions/how-to-create-and-display-a-commerce-disclosure-page

## Evidence-based next experiment

Let the owner and prospective users try the samples. Record genuine product-specific requests and actual usability problems; do not fabricate demand or treat test visits/downloads as orders. After merchant readiness and a separate sales release, measure completed payments, refunds, processing fees and bank settlement separately. No outreach messages or new recurring monitors are started by this change.

## Verified deployment correction

Read-back of the first branch deployment showed Cloudflare injecting its analytics script into raw downloadable HTML. A failing regression test was added before correction. New tools and the template sample are therefore delivered inside deterministic ZIP archives; no raw HTML remains in the downloads directory. The live browser suite extracts and executes the actual downloaded ZIP content when QA_BASE_URL is set, instead of substituting local files. ZIP integrity is also checked independently with Python zipfile. No hosting analytics setting was changed.
