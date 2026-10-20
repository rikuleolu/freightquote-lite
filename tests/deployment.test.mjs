import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..','dist');

test('deployable dist includes all first-party assets and pure calculator',async()=>{
 for(const f of ['index.html','styles.css','app.mjs','favicon.svg','robots.txt','_headers','lib/calculator.mjs']) {
   assert.ok((await stat(join(root,f))).isFile(),`missing ${f}`);
 }
});
test('calculator has no paid runtime, third party scripts or collection endpoints',async()=>{
 const html=await readFile(join(root,'index.html'),'utf8');
 const app=await readFile(join(root,'app.mjs'),'utf8');
 const header=await readFile(join(root,'_headers'),'utf8');
 assert.match(html,/type="module" src="app\.mjs"/);
 assert.match(app,/\.\/lib\/calculator\.mjs/);
 // Canonical/Open Graph URLs do not load executable resources.
 for (const tag of html.matchAll(/<(script|link|img|iframe)\b[^>]*>/gi)) {
   if (/\brel="canonical"/.test(tag[0])) continue;
   assert.doesNotMatch(tag[0],/(?:src|href)="(?:https?:)?\/\//);
 }
 assert.doesNotMatch(app,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|payhip|stripe|paypal/i);
 assert.match(header,process.env.CF_ANALYTICS==='1' ? /connect-src 'self' https:\/\/cloudflareinsights.com/ : /connect-src 'none'/);
 assert.match(header,/frame-ancestors 'none'/);
});

test('availability probe checks the two live tools and real ZIP deliveries',async()=>{
 const script=await readFile(new URL('../scripts/health-check.mjs',import.meta.url),'utf8');
 for(const route of ['/products','/demo-freight','/demo-solo','/buy-freight','/buy-solo','/product-terms','/template-demo',
  '/downloads/FreightQuote-Template-Kit.zip','/downloads/freight-workbench.zip','/downloads/solo-quote.zip','/downloads/quote-ja-sample.zip'])
  assert.ok(script.includes("'" + route + "'"),`health check missing ${route}`);
 assert.match(script,/0x50,0x4b,0x03,0x04/);
});
