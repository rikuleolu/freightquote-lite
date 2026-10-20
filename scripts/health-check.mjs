// Read-only HTTP checks. Does not execute analytics or create synthetic purchases.
import assert from 'node:assert/strict';
if (Date.now() >= Date.parse('2027-01-19T16:00:00Z')) {
  console.log('Three-month trial ended. No requests made.');
  process.exit(0);
}
const origin = 'https://freightquote-lite.pages.dev';
const cases = [
  ['/', 'id="tool"'],
  ['/app.mjs', 'calculateQuote'],
  ['/launch-copy.mjs', 'resourcesTitle'],
  ['/guide-ja', '国際物流見積書の作り方'],
  ['/guide-zh', '国际物流报价单使用指南'],
  ['/guide-en', 'How to prepare a freight quotation'],
  ['/samples/customer-quote-en.csv', 'DEMO,USD'],
  ['/robots.txt', `${origin}/sitemap.xml`],
  ['/sitemap.xml', `${origin}/guide-en</loc>`],
];
const results=[];
for(const [path,expected] of cases){
  const response=await fetch(origin+path,{
    signal:AbortSignal.timeout(20000),
    headers:{'User-Agent':'FreightQuote-Lite-Health-Check/0.2'},
    redirect:'error',
  });
  const text=await response.text();
  assert.equal(response.status,200,path);
  assert.ok(text.includes(expected),`Unexpected content at ${path}`);
  if(path==='/') assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
  results.push({path,status:response.status,bytes:Buffer.byteLength(text)});
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),origin,results},null,2));
