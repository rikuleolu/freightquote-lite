import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildLocalizedStorefront} from '../scripts/build-localized-storefront.mjs';
import {freight} from '../src/product-calculators.mjs';
test('localized SEO exposes one canonical and reciprocal hreflang per page',async()=>{
 const out=await mkdtemp(join(tmpdir(),'fql-locales-'));
 try{for(const family of ['products','buy-freight','buy-solo'])await writeFile(join(out,family+'.html'),'<nav></nav>');await writeFile(join(out,'index.html'),'Other product concepts (preview)');
 const routes=await buildLocalizedStorefront('',out,'https://freightquote.example');assert.equal(new Set(routes).size,12);
 for(const route of routes){const html=await readFile(join(out,route.slice(1)+'.html'),'utf8');assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(html.includes(`href="https://freightquote.example${route}"`));for(const lang of ['ja','zh-CN','en','x-default'])assert.ok(html.includes(`hreflang="${lang}"`));assert.doesNotMatch(html,/<script|<form|src="https:/);}
 }finally{await rm(out,{recursive:true,force:true});}
});
test('published worked-example figures match the unchanged calculator',()=>{
 const base={length:'50',width:'40',height:'30',cartons:'10',weight:'85',step:'0.5',rate:'600',local:'10000',margin:'20'};
 for(const [divisor,chargeable,cost,price] of [['6000','100.000',70000,87500],['5000','120.000',82000,102500]]){const result=freight({...base,divisor});assert.equal(result.chargeable,chargeable);assert.equal(result.cost,cost);assert.equal(result.price,price);}
});
