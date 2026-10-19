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
test('no paid runtime, third party scripts, collection endpoints, or production checkout',async()=>{
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
