# Free page analytics setup

Status as of 2026-10-20: https://freightquote-lite.pages.dev is live with free Cloudflare Web Analytics enabled. Eight production smoke checks passed, including one beacon, successful ingestion, visible disclosure, no cookies, and absence of distinctive synthetic quote values in request URLs or payloads. The initial dashboard reports insufficient data; natural visits remain unknown. The default local build remains analytics-free.

## Activation after a real deployment exists

1. Verify the actual Pages hostname and the Free plan. Do not buy a plan or add billing.
2. Set `CF_ANALYTICS=1` in the production Pages build environment. This exposes the three-language disclosure and permits only the Cloudflare beacon origin plus its documented ingestion endpoints in CSP.
3. In this Pages project's Metrics, enable Web Analytics and redeploy. Pages supplies the real account-bound script automatically. Do not add a second manual beacon or invent a token.
4. Inspect the deployed response headers and injected script. Use synthetic test quotes only. Confirm network payloads contain no issuer/customer/route/description/cost/price values, and that the dashboard receives a page view. Treat this QA visit as test traffic, not an acquired customer.
5. If privacy checks fail, disable the dashboard integration, set `CF_ANALYTICS=0` and redeploy. Verify the remote script is gone and `connect-src 'none'` is restored.

The application never places quote values in URLs, storage, custom analytics events or network requests. The current production beacon passed the live synthetic-payload check; repeat it if analytics configuration changes.

## Metrics and honest interpretation

| Metric | Evidence | Limit |
| --- | --- | --- |
| Page views and referring sources | Cloudflare dashboard after activation | Not completed quotes or unique qualified leads |
| Loading performance | Real-user timing data when available | Not a guarantee for every visitor |
| Completed quotes / PDF saves | Currently unmeasured | Browser tests are not customer conversions; printing does not prove a saved file |
| Qualified inquiries | Explicit incoming inquiry | Never collect customer quote data in a public issue |
| Revenue | Reconciled merchant transaction | No merchant account or checkout is active |

A daily local-thread follow-up was created for a three-month trial ending 2027-01-19. It requires the host/app to be available; natural-traffic metrics remain unknown until the connected dashboard contains enough non-test evidence. Do not manufacture activity or use synthetic traffic for demand claims.

Official setup: https://developers.cloudflare.com/pages/how-to/web-analytics/

Official CSP details: https://developers.cloudflare.com/web-analytics/faq/
