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
  ['/template-kit-ja', 'https://buy.stripe.com/4gMbJ06dfgkR0Bv9KZbbG00'],
  ['/template-kit-zh', 'https://buy.stripe.com/4gMbJ06dfgkR0Bv9KZbbG00'],
  ['/template-kit-en', 'https://buy.stripe.com/4gMbJ06dfgkR0Bv9KZbbG00'],
  ['/template-download', 'downloads/FreightQuote-Template-Kit.zip'],
  ['/commerce-disclosure', 'info@anshin-corp.com'],
  ['/purchase-terms', 'info@anshin-corp.com'],
  ['/privacy-policy', 'info@anshin-corp.com'],
  ['/products', 'Freight Cost Workbench'],
  ['/help', 'info@anshin-corp.com'],
  ['/demo-freight', '計費重量'],
  ['/demo-solo', 'Solo Project Quote'],
  ['/buy-freight', 'https://buy.stripe.com/aFa5kC6dfc4B3NH2ixbbG01'],
  ['/buy-solo', 'https://buy.stripe.com/28EdR8gRT9Wtac50apbbG02'],
  ['/product-terms', '商品・返品条件'],
  ['/template-demo', 'quote-ja-sample.zip'],
  ['/freight-download', 'downloads/freight-workbench.zip'],
  ['/solo-download', 'downloads/solo-quote.zip'],
  ['/tool-purchase-terms', 'Freight Cost Workbench'],
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
// Inspect package signatures without opening, executing or uploading any customer data.
for(const path of [
  '/downloads/FreightQuote-Template-Kit.zip',
  '/downloads/freight-workbench.zip',
  '/downloads/solo-quote.zip',
  '/downloads/quote-ja-sample.zip',
]){
  const response=await fetch(origin+path,{
    signal:AbortSignal.timeout(20000),
    headers:{'User-Agent':'FreightQuote-Lite-Health-Check/0.2'},
    redirect:'error',
  });
  assert.equal(response.status,200,path);
  const bytes=new Uint8Array(await response.arrayBuffer());
  assert.ok(bytes.length>1000,`Empty or truncated ZIP: ${path}`);
  assert.deepEqual([...bytes.subarray(0,4)],[0x50,0x4b,0x03,0x04],`Invalid ZIP signature: ${path}`);
  results.push({path,status:response.status,bytes:bytes.length});
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),origin,results},null,2));
