# Three-tool integration (2026-10-20)

## Current scope
- Existing production payment: FreightQuote Template Kit v1.0 at JPY 980 one-time, using the previously configured Stripe Payment Link on /template-kit-ja, /template-kit-zh and /template-kit-en. Public shareable ZIP and licence; payment is not an access gate.
- Trial only: Freight Cost Workbench (proposed total JPY 1,480) and Solo Project Quote (proposed total JPY 980). Both have functional free demos and downloadable offline ZIP tools with license, customer CSV/PDF and internal input-saving. Their purchase actions remain disabled. No payment link may be guessed or reused for another product.
- Canonical catalog: /products. Legacy /products-ja, /products-zh and /products-en are earlier, separate product concepts, not payment-enabled.

## Acceptance and safeguards
- Preserve the existing paid template sales paths and all checkout, disclosure and legal pages.
- Exact JPY arithmetic: freight fixture 100kg billable / JPY 70,000 cost / JPY 87,500 suggested; solo fixture JPY 63,000 cost / JPY 78,750 suggested, JPY 23,625 deposit and JPY 55,125 balance.
- Reject negative/malformed numbers and spreadsheet-formula injection; customer CSV/PDF does not reveal internal unit costs or margins.
- No runtime dependencies, credentials, localStorage, customer uploads, background network calls or paid services.
- Offline delivery is ZIP so Cloudflare's HTML analytics injection cannot alter downloaded internal HTML.
- Automated: npm run check and optional npm run test:products; test real deployed ZIP extracts and offline reopen on supported desktop browsers.

## Sales gates (not yet met for both trial products)
1. Owner/operator independently verifies latest Stripe account charge/payout capability and support address. Historical 2026-10-20 Stripe KYC message conflicted with a later repository assertion; this commit does not certify merchant eligibility.
2. Add distinct Stripe product, price and correct seller-approved final confirmation for each proposed paid offer. Do not invent checkout URLs, reuse the template link or expose secret keys.
3. Test checkout success, failure, cancellation, payment reconciliation and customer fulfilment. Returning to a static download page must not be interpreted as proof of payment.
4. Verify storefront contact, description, licensing, Japanese seller disclosure, privacy, tax-inclusive price, refunds and support for each distinct offer before enabling a purchase button.
5. Verify actual production deploy/read-back and CI after merge. Artificial test visits and download counts are not customer payments or bank settlements.

See original scope and browser QA in PR #8 (https://github.com/rikuleolu/freightquote-lite/pull/8) and existing live template checkout change in PR #9 (https://github.com/rikuleolu/freightquote-lite/pull/9).
