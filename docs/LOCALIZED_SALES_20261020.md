# Localized customer acquisition and sales routes — 2026-10-20

## Defect and targeted change
The existing /products-ja, /products-zh and /products-en links still displayed superseded JPY 2,980 and JPY 9,800 concept offers. The three current products have independent live Stripe links, so the obsolete routes could mislead customers. Replace these existing localized catalogs with the actual Template Kit (JPY 980), Freight Cost Workbench (JPY 1,480) and Solo Project Quote (JPY 980). Keep source history and the old public SAMPLE file, but do not present abandoned offers as current inventory.

Add six static localized decision pages /buy-{freight|solo}-{ja|zh|en} and three practical /air-parcel-guide-{ja|zh|en} pages. Each language page has reciprocal navigation, a self-canonical and hreflang alternatives when a valid SITE_URL is configured. Include all twelve routes in the sitemap and the existing availability workflow. Generic routes and their payment URLs remain unchanged. No new runtime library, backend, custom tracking, priced SKU or hosting subscription is introduced.

## Payment and language boundaries
The localized sales pages reuse the same native Stripe links and add only the documented locale parameter, not customer information, session IDs or purchase status. Standard hosted checkout UI can follow the selected language; merchant-written Stripe descriptions are not automatically translated by this setting. The tools themselves remain Japanese/Chinese; the English storefront explicitly discloses this. Do not describe this release as full English tool localization or end-to-end transaction acceptance.

Both full tools remain free/MIT. Optional purchase covers the existing package and limited file-use assistance, with the same support/refund scope. Do not claim paid-only features or exclusive access. No live payment, refund, payout, KYC change, managed-payment product or paid automatic Tax/invoice feature is used.

## Grounded acquisition content
The new guide follows an actual illustrative task: ten identical 50x40x30cm cartons, total actual weight 85kg. Divisor 6,000 gives 100kg; 5,000 gives 120kg. With fictional cost JPY 600/kg plus JPY 10,000 and target gross margin 20%, the respective before-tax quotes are JPY 87,500 and JPY 102,500. Automated tests compare these figures with the unchanged calculator. The guide states that carrier-specific divisor, per-piece/total rating and rounding must be verified; it is not a tariff or booking offer.

Primary references checked:
- https://dct.dhl.com/help (DHL's standard cm/kg divisor: 5,000; compare dimensional and actual weight)
- https://docs.stripe.com/payment-links/customize (documented locale URL parameter; custom merchant copy is separate)
- https://developers.google.com/search/docs/specialty/international/localized-versions (reciprocal hreflang)

## Release gate
The first PR head a695aad2f7179ff477a0f6d490bf8f96b0995718 records failing assertions for stale catalog content and absent translated sales/guide routes. Require all existing tests, new locale/content/SEO tests, the core/product browser workflows, plus actual locale pages at 320/390/1440px with valid internal links. Inspect generated desktop/mobile screenshots before merge, then verify final production pages and CI. Reading a link never establishes payment success. Search metadata does not prove indexing or traffic.

## Next evidence, not invented success
Only live Stripe context is currently authorized. Sandbox success/failure/cancel/refund tests remain separate. Support receipt/reply is not verified by a Gmail search with no matches. The merchant profile still contains pre-sale text; modify it only through a supported authorized profile action. Natural traffic and willingness to pay remain unproven. Do not post outreach to third parties without the required review, create fake users, or treat CI/health probes as customer interest.
