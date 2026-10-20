import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {launchCopy} from '../site/launch-copy.mjs';

test('homepage makes the three-product directory discoverable in all three languages',async()=>{
  const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(home,/<a href="products" data-i18n="navProducts">/);
  const labels=['ja','zh','en'].map(lang=>launchCopy[lang].navProducts);
  assert.ok(labels.every(label=>typeof label==='string' && label.trim().length>=4));
  assert.equal(new Set(labels).size,3);
});

test('product index and functional demos expose accurate search snippets',async()=>{
  for(const slug of ['products','demo-freight','demo-solo','template-demo']){
    const content=await readFile(new URL(`../dist/${slug}.html`,import.meta.url),'utf8');
    const description=content.match(/<meta name="description" content="([^"]+)"/);
    assert.ok(description && description[1].length>=40,slug);
  }
  const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(!home.includes('href="products" target="_blank"'));
});
