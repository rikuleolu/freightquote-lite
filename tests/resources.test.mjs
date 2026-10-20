import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
test('public guides and customer-only downloads exist in all three languages',async()=>{
 for(const [lang,currency,total] of [['ja','JPY',77500],['zh','CNY',5520],['en','USD',650]]){
  const guide=await readFile(`${root}/guide-${lang}.html`,'utf8');
  assert.match(guide,new RegExp(`customer-quote-${lang}\\.csv`));
  assert.match(guide,new RegExp(`\\?lang=${lang}#tool`));
  const csv=await readFile(`${root}/samples/customer-quote-${lang}.csv`,'utf8');
  const rows=csv.trim().split(/\r?\n/).slice(1).map(line=>line.split(','));
  assert.equal(rows.length,3);
  assert.ok(rows.every(row=>row[0]==='DEMO' && row[1]===currency && row[3]==='1'));
  assert.equal(rows.reduce((sum,row)=>sum+Number(row[5]),0),total);
  assert.doesNotMatch(csv,/cost|profit|仕入|粗利|成本|毛利/i);
 }
});
test('new public content has translated keys and no placeholder checkout',async()=>{
 const {launchCopy}=await import('../site/launch-copy.mjs');
 const keys=Object.keys(launchCopy.ja).sort();
 assert.deepEqual(Object.keys(launchCopy.en).sort(),keys);
 assert.deepEqual(Object.keys(launchCopy.zh).sort(),keys);
 const html=await readFile(`${root}/index.html`,'utf8');
 assert.match(html,/id="resources"/);
 assert.match(html,/id="faq"/);
 assert.doesNotMatch(html,/buy\.stripe\.com|checkout\.stripe\.com|href="#buy"|href="#checkout"/);
});
