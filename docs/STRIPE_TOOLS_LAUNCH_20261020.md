# Three-product Stripe release — 2026-10-20

This release supersedes the two-new-tools/trial-only payment state in the earlier THREE_TOOLS_RELEASE and README introduction. The public free core and permissive files remain available. The new two products sell nonexclusive packaged files plus bounded assistance with getting, saving and printing files; not access locks, private functionality, guaranteed savings or ongoing updates.

## Native configuration recorded

| Offer | One-time total | Stripe price | Stripe link | Delivery |
| --- | --- | --- | --- | --- |
| Existing FreightQuote Template Kit | JPY 980 | price_1USWJICeOGBzW1CMWXVU7yJd | plink_1USXzRCeOGBzW1CMNtdW6QOc | /template-download |
| Freight Cost Workbench | JPY 1,480 | price_1UScAUCeOGBzW1CMah68scGl | plink_1UScLyCeOGBzW1CMrlXbSSPz | /freight-download |
| Solo Project Quote | JPY 980 | price_1UScAkCeOGBzW1CMzfUIM2aS | plink_1UScMFCeOGBzW1CMEHVIhEsq | /solo-download |

The new native line-item reads returned quantity 1, currency jpy, totals 1480 and 980, one_time prices, and no recurring component. Their links are card-only, no extra seller charges, automatic_tax disabled, invoice_creation disabled, no promotion codes, no phone collection, required purchase conditions and separate redirect URLs. The original template payment link was not changed.

The account list exposed the ANSHIN live account. Native account read returned charges_enabled=true, payouts_enabled=true, submitted details and no currently/past-due requirements. This is a point-in-time capability observation, not proof of a customer payment or bank receipt.

## Staging and acceptance

PR #14 published the actual per-tool delivery routes and supplemental purchase/refund conditions before creating the new payment links. Public read-back of the final routes was required; the first cached response for two routes was the homepage fallback, and a release-tagged read then returned the correct content.

PR #15 defines exact sales-link/amount/quantity/terms acceptance before enabling the two storefront CTAs. It preserves the Windows-newline/offline-script fix from #13, calculator source, application source, original template offer and permissive licensing. The existing CI is extended to run the existing browser suites using a QA-only pinned Playwright package and standard public runner. No runtime/build dependency or additional scheduler is introduced.

Expected checks: npm run check; npm run test:e2e; npm run test:products. Final statuses and evidence belong to the actual GitHub run and PR read-back, not to this document's wording. Existing availability checks are extended to new purchase URLs, dedicated downloads, terms and ZIP signatures; the three-month cutoff is unchanged.

## Remaining evidence boundaries

Only livemode was available in the current Stripe connection. No test-mode success, card-decline, refund or cancellation payment was executed in this release; no real card was charged to simulate one. Do not call the payment flow fully end-to-end certified, count QA visits as demand, or count static downloads as paid orders. Site/browser and native configuration acceptance are separate from transaction/settlement evidence. Sandbox permission is needed for simulated transaction tests; real orders must be reconciled from Stripe status and receipts.

No webhook, protected buyer-only file storage, automatic emailed attachment or always-on support agent was added. Delivery is public file access with product-specific post-checkout guidance and a persistent re-download route. No session ID or purchase email is embedded in public URLs. Support uses the existing published seller contact; address and bank configuration were not modified.

References consulted: Stripe Payment Links post-payment guide (https://docs.stripe.com/payment-links/post-payment), testing guidance (https://docs.stripe.com/testing), and Consumer Affairs Agency mail-order disclosures/final confirmation guidance (https://www.no-trouble.caa.go.jp/what/mailorder/). This is an implementation record, not a legal-compliance certification.
