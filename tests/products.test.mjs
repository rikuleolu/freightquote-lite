import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
test('three-language catalog describes actual products and retains the historical free sample safely',async()=>{
 for(const lang of ['zh','ja','en']){
  const s=await readFile(`dist/products-${lang}.html`,'utf8');
  for(const value of ['JPY 1,480','JPY 980','Freight Cost Workbench','Solo Project Quote',`template-kit-${lang}`]) assert.ok(s.includes(value));
  assert.doesNotMatch(s,/JPY 2,980|JPY 9,800|<button disabled>|<script|<form|sk_live_|Owner|owner-preview/i);
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
