# Free deployment: GitHub → Cloudflare Pages

## Objective
Deploy at **zero new fixed subscription cost**, using free quotas and a free `*.pages.dev` subdomain. No new domain purchase. Official reference: https://developers.cloudflare.com/pages/configuration/git-integration/

## Steps requiring the account holder

1. Create a new GitHub repository named `freightquote-lite`. Start private for review. Do not import the source into LuAIOS.
2. Upload/commit the source files **including `.github/workflows/ci.yml` and `src/`**. Ensure `main` contains `package.json` and `site/index.html`.
3. Check GitHub Actions `Verify FreightQuote Lite`. Expected: `npm run check` passes. Do not merge code with failing checks.
4. Publish the repository once source has been reviewed and no secrets/private data are present. Give it GitHub topics such as `freight-forwarding`, `shipping`, `quotation`, `open-source`, `japan`, `logistics`.
5. Sign in to a Cloudflare **Free** account. In Workers & Pages create a **Pages** project and choose **Connect to Git** (not Direct Upload if automatic deployments are desired). Complete OAuth for this single repository.
6. Configure: production branch `main`; build command `npm run build`; build output `dist`; root `/`; environment variable `NODE_VERSION=22`.
7. After Cloudflare assigns a real `https://<name>.pages.dev` URL, add the confirmed URL as `SITE_URL` environment variable. Trigger a fresh deployment to generate the canonical URL and `sitemap.xml`.
8. Verify `/`, `/app.mjs`, `/lib/calculator.mjs`, `/sitemap.xml`, `/robots.txt` respond correctly; test all three languages, sample calculation, and browser print on a phone and laptop. Record URL, commit SHA, deploy timestamp and screenshot.
9. Optional free discovery: verify domain in Google Search Console and Bing Webmaster Tools, then submit the real sitemap URL. Indexing/ranking are **not** guaranteed. Avoid AI-generated keyword spam.

**Account access is not present in this chat**, so none of these account-level steps have been performed by the assistant. A ZIP is a handoff artifact, not deployment evidence.

## Zero-cost guardrails

- Do not select paid Cloudflare plans, Workers paid features, paid domains, paid GitHub runners, external databases, paid AI APIs, email automation platforms, or merchant subscriptions.
- Free quotas and pricing can change; check displayed billing terms before every account authorization.
- Analytics are **not enabled**. The opt-in `CF_ANALYTICS=1` build prepares privacy copy/CSP. Follow [ANALYTICS.md](ANALYTICS.md) for actual dashboard activation and live payload verification; leave the flag unset until then.
- Payment integration is blocked pending actual seller/entity details, merchant verification and applicable destination-specific disclosure review. See [COMMERCIALIZATION.md](COMMERCIALIZATION.md); no entity jurisdiction is assumed.

## Deployment mode warning

Cloudflare Pages officially does not support switching an existing Pages project from Direct Upload to Git integration or vice versa. Choose Git integration from the outset for this project.
