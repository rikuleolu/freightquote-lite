import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const checkout='https://buy.stripe.com/3cI8wO0SV9Wtfwp5uJbbG06';
test('all storefronts offer the same verified one-time checkout with disclosures',async()=>{
 for(const lang of ['ja','zh','en']){
  const page=await readFile(new URL(`../dist/template-kit-${lang}.html`,import.meta.url),'utf8');
  assert.deepEqual([...page.matchAll(/class="price">([^<]+)/g)].map(m=>m[1].match(/\d[\d,]*/)?.[0]),['480','480'],lang+' both visible totals');
  assert.ok(page.includes(`href="${checkout}" data-checkout`));
  for(const route of ['commerce-disclosure','purchase-terms','privacy-policy','template-download'])
   assert.ok(page.includes(`href="${route}"`));
  assert.doesNotMatch(page,/test_|販売準備中|销售准备中|Preparing for sale|sk_live_/);
 }
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(home,/data-kit-link/);
 const copy=await readFile(new URL('../site/launch-copy.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(copy,/尚未开售|not on sale|販売前|not taking orders/);
});
