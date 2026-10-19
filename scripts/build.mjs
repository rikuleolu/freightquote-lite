import {cp,copyFile,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const base=resolve(import.meta.dirname,'..');
const out=join(base,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(join(base,'site'),out,{recursive:true});
await mkdir(join(out,'lib'),{recursive:true});
await copyFile(join(base,'src','calculator.mjs'),join(out,'lib','calculator.mjs'));
console.log('Built static site: dist/ (no dependencies or API calls)');

// Dashboard-managed Pages analytics is opt-in. The default remains network-silent.
const analytics = (process.env.CF_ANALYTICS ?? '').trim();
if (!['', '0', '1'].includes(analytics)) throw new Error('CF_ANALYTICS must be 0 or 1.');
if (analytics === '1') {
  const headersPath=join(out,'_headers');
  const headers=(await readFile(headersPath,'utf8'))
    .replace("script-src 'self'", "script-src 'self' https://static.cloudflareinsights.com")
    .replace("connect-src 'none'", "connect-src 'self' https://cloudflareinsights.com");
  await writeFile(headersPath,headers);
  const indexPath=join(out,'index.html');
  await writeFile(indexPath,(await readFile(indexPath,'utf8')).replace('id="analytics-notice" hidden','id="analytics-notice"'));
  console.log('Pages analytics CSP and disclosure prepared; dashboard activation still required.');
}

const siteUrl = (process.env.SITE_URL ?? '').trim().replace(/\/$/,'');
if (siteUrl) {
  let parsed;
  try { parsed = new URL(siteUrl); } catch { throw new Error('SITE_URL must be a valid HTTPS origin.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('SITE_URL must be a bare HTTPS origin with no credentials/path/query.');
  }
  const origin = parsed.origin;
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + origin +
    '/</loc></url>\n</urlset>\n';
  await writeFile(join(out,'sitemap.xml'),xml);
  await writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
  const indexPath=join(out,'index.html');
  let html=await readFile(indexPath,'utf8');
  html=html.replace('</head>',`  <link rel="canonical" href="${origin}/" />\n  <meta property="og:url" content="${origin}/" />\n  <meta property="og:title" content="FreightQuote Lite | Free freight quote tool" />\n  <meta property="og:description" content="Free multilingual freight quotation and PDF tool. No sign-up, no upload." />\n</head>`);
  await writeFile(indexPath,html);
  console.log('SEO metadata generated for', origin);
}
