import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
test('three-language showcase has reference prices, disabled checkout and sample-only download',async()=>{
 for(const lang of ['zh','ja','en']){
  const s=await readFile(`dist/products-${lang}.html`,'utf8');
  for(const value of ['JPY 2,980','JPY 9,800','product-sample','FreightQuote-Public-SAMPLE.zip',`template-kit-${lang}`]) assert.ok(s.includes(value));
  assert.equal((s.match(/<button disabled>/g)||[]).length,2);
  assert.doesNotMatch(s,/<script|<form|mailto:|buy\.stripe|checkout\.stripe|sk_live_|Owner|owner-preview/i);
  for(const l of ['zh','ja','en']) assert.ok(s.includes(`products-${l}`));
 }
 const sample=await readFile('dist/product-sample.html','utf8');
 assert.match(sample,/NOT THE FULL PRODUCT/);
 assert.doesNotMatch(sample,/<style>/i);
 assert.match(sample,/href="product-sample.css"/);
 assert.doesNotMatch(sample,/<script|<input|<textarea|https?:\/\//i);
 const zip=await readFile('dist/downloads/FreightQuote-Public-SAMPLE.zip');
 assert.equal(zip.readUInt32LE(0),0x04034b50);
 assert.ok(zip.includes(Buffer.from('FreightQuote-Public-SAMPLE.html')));
 assert.doesNotMatch((await readdir('dist',{recursive:true})).join('\n'),/owner-preview|evidence|verify\.mjs|content\.json/);
});
