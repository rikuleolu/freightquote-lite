import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
for(const lang of ['ja','zh','en'])test(`${lang}: template cross-sell describes actual tools, never closed concept offers`,async()=>{
 const html=await readFile(new URL(`../site/template-kit-${lang}.html`,import.meta.url),'utf8');
 assert.doesNotMatch(html,/Product showcase only|no orders are accepted|当前不接受订单|注文は受け付けていません/);
 for(const name of ['Freight Cost Workbench','Solo Project Quote'])assert.ok(html.includes(name));
 assert.ok(html.includes(`href="products-${lang}"`));
 assert.ok(html.includes('href="https://buy.stripe.com/4gMbJ06dfgkR0Bv9KZbbG00" data-checkout'));
});
