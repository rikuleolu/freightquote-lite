import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// A correct amount alone is not a usable customer proposal.
for(const kind of ['freight','solo']){
  test(`${kind}: a customer quote carries identity, reference, validity and scope`,async()=>{
    const html=await readFile(new URL(`../dist/demo-${kind}.html`,import.meta.url),'utf8');
    for(const name of ['issuer','reference','validity','scope','exclusions'])
      assert.ok(html.includes(`name="${name}"`),`missing customer field: ${name}`);
    for(const id of ['quote-issuer','quote-reference','quote-validity','quote-scope','quote-exclusions'])
      assert.ok(html.includes(`id="${id}"`),`missing customer output: ${id}`);
    if(kind==='solo')for(const id of ['customer-deposit','customer-balance'])
      assert.ok(html.includes(`id="${id}"`),`missing payment schedule: ${id}`);
  });
}

test('product detail pages answer free versus paid before checkout',async()=>{
  for(const kind of ['freight','solo']){
    const html=await readFile(new URL(`../dist/buy-${kind}.html`,import.meta.url),'utf8');
    assert.ok(html.includes('id="free-vs-paid"'));
    assert.ok(html.includes('id="who-it-fits"'));
    assert.ok(html.includes('id="first-use"'));
    assert.ok(html.includes('href="help"'));
  }
});

test('help gives private support, download recovery and no guaranteed response claims',async()=>{
  const html=await readFile(new URL('../dist/help.html',import.meta.url),'utf8');
  for(const token of ['info@anshin-corp.com','freight-download','solo-download','template-download','purchase-terms','privacy-policy'])
    assert.ok(html.includes(token),token);
  assert.doesNotMatch(html,/guaranteed|24-hour response|即日必ず|24小时内必回复|<form/i);
});
