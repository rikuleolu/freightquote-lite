# Customer-readiness and market review — 2026-10-20

## Commercial judgment, not a revenue claim
The three native Stripe links are active, but the current native PaymentIntent list is empty. Traffic, qualified users and purchase intent were not measured in this review; missing traffic evidence is not evidence of no demand. A working checkout is not product-market fit.

Generic estimates already have free alternatives (Zoho's free estimate generator); dimensional weight already has a carrier calculator (DHL Aviation). Primary pages reviewed: https://www.zoho.com/invoice/free-estimate-generator/ and https://aviationcargo.dhl.com/business-tools/volume-calculator . This supports the product decision to compete on the complete small-team workflow, not merely a calculator or PDF button. It does not establish willingness to pay for this product.

## Scope of the implemented improvement
- Keep all three existing prices, exact native checkout links, core math, free/MIT access and local-only handling unchanged.
- Complete the customer quote: sender/contact, reference, validity, included scope and exclusions. Solo adds planned deposit/balance, explicitly not a receipt. Missing scope is marked to be confirmed, never silently represented as all-inclusive.
- Carry those same fields into safe customer CSV and PDF and preserve them when reopening a saved offline HTML. Internal cost/margin remains excluded. Textareas are serialized as text, including adversarial closing tags.
- Add an outcome-based tool selector, relevant/non-relevant use cases, links to the actual output, optional-purchase versus free-use explanation and a collapsible first-use guide.
- Add one private-support and file-recovery help page, with actual current download/terms routes, no collection backend and no unverified response-time guarantee.
- Add product purchase pages and help to the sitemap/canonical metadata; no invented reviews, schema ratings, scarcity or claimed customer counts.
- Retain synthetic QA screenshots/PDF/CSV and results for one day in the existing public CI; do not retain customer-filled files. Remove the temporary public-source export before merge.

## Acceptance evidence to check before release
First define four failing customer-readiness tests against the deployed baseline. Run Node tests, all existing core browser scenarios and extended product groups. Include deliberate markup/formula input, textarea save/reopen, missing scope, invalid amounts, customer PDF privacy, mobile width, real ZIP paths and unchanged exact Stripe links. Inspect the generated PDF and mobile/desktop screenshots before merge, then read back the production pages. Test success in CI is not a Stripe card transaction.

## Prioritized market work after this release
1. Validate the target segment, starting with small Japanese/Chinese-speaking forwarding teams. Use the no-signup free freight workflow as the entry point; position templates as format reuse, and keep the solo tool as a separate experiment rather than widening the brand indiscriminately.
2. Validate paid value. The complete files remain free. Current optional purchases pay for packaging and narrow file-use assistance, which may be a weak commercial incentive. Do not hide this or invent paid-only features. Before building paid workflow packs or customization, obtain recurring, specific customer needs and a feasible support scope. No new paid SKU is authorized merely by this document.
3. Observe the funnel separately: qualified non-test visits, completed real work, specific feedback, completed Stripe payments, refunds, fees and bank settlement. Do not label health probes, developer sessions or public downloads as customers. Do not divide by an unknown denominator.
4. Distribution should use useful targeted content and relevant communities, with human review before third-party posting under AGENTS.md. No mass messages, advertisements or fake testimonials. Search metadata is not proof of indexing or qualified traffic.
5. Remaining operating gaps: two new tools still have Japanese/Chinese rather than full independent English interfaces; sandbox transaction paths are not authorized in this session; support-mail receipt/response has not been independently tested here; the Stripe business-profile description has old pre-sale text and no supported update operation was returned. Do not change KYC/bank/payout settings to work around that.

A useful first decision checkpoint is five qualified users attempting a real workflow and explaining what remains difficult, followed by a genuine independent purchase if the offer is useful. This is an internal experiment target, not a market benchmark or guaranteed conversion forecast. Keep fixed costs at zero and assess evidence rather than adding features to appear busy.
