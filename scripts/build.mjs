import {cp,copyFile,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {buildProducts} from './build-products.mjs';
const base=resolve(import.meta.dirname,'..');
const out=join(base,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(join(base,'site'),out,{recursive:true});
await mkdir(join(out,'lib'),{recursive:true});
await copyFile(join(base,'src','calculator.mjs'),join(out,'lib','calculator.mjs'));
await buildProducts(base,out);
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
  const pages = ['/', '/guide-ja', '/guide-zh', '/guide-en', '/template-kit-ja', '/template-kit-zh', '/template-kit-en', '/commerce-disclosure', '/purchase-terms', '/privacy-policy', '/products', '/demo-freight', '/demo-solo', '/template-demo', '/product-terms'];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map(path=>`  <url><loc>${origin}${path}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  await writeFile(join(out,'sitemap.xml'),xml);
  await writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
  const indexPath=join(out,'index.html');
  let html=await readFile(indexPath,'utf8');
  html=html.replace('</head>',`  <link rel="canonical" href="${origin}/" />\n  <meta property="og:url" content="${origin}/" />\n  <meta property="og:title" content="FreightQuote Lite | Free freight quote tool" />\n  <meta property="og:description" content="Free multilingual freight quotation and PDF tool. No sign-up, no upload." />\n</head>`);
  await writeFile(indexPath,html);
  for (const lang of ['ja','zh','en']) {
    const guidePath=join(out,`guide-${lang}.html`);
    let guide=await readFile(guidePath,'utf8');
    const alternates=['ja','zh','en'].map(l=>`<link rel="alternate" hreflang="${l==='zh'?'zh-CN':l}" href="${origin}/guide-${l}">`).join('\n');
    guide=guide.replace('</head>',`<link rel="canonical" href="${origin}/guide-${lang}">\n${alternates}\n</head>`);
    if (analytics==='1') {
      const notice={
        ja:'Cloudflare Web Analyticsで閲覧数・参照元・表示速度を集計します。見積内容は送信しません。',
        zh:'Cloudflare Web Analytics 统计访问、来源和加载性能，不发送报价内容。',
        en:'Cloudflare Web Analytics measures page views, referrals and loading performance. Quote contents are not sent.',
      }[lang];
      guide=guide.replace('</footer>',`<p class="layout small-note">${notice}</p></footer>`);
    }
    await writeFile(guidePath,guide);
  }
  console.log('SEO metadata generated for', origin);
  for(const lang of ['ja','zh','en']){
    const path=join(out,`template-kit-${lang}.html`);
    const alternates=['ja','zh','en'].map(l=>`<link rel="alternate" hreflang="${l==='zh'?'zh-CN':l}" href="${origin}/template-kit-${l}">`).join('\n');
    const html=await readFile(path,'utf8');
    await writeFile(path,html.replace('</head>',`<link rel="canonical" href="${origin}/template-kit-${lang}">\n${alternates}\n</head>`));
  }
}
