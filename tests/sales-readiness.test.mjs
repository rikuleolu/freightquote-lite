import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

// Fixed acceptance totals and URLs from work order / source HEAD 324c338.
// These assertions do not contact Stripe or certify native account configuration.
test('README current offers match the three accepted one-time totals',async()=>{
  const doc=await read('README.md');
  for(const [name,price] of [['FreightQuote Template Kit','480'],['Freight Cost Workbench','700'],['Solo Project Quote','480']])
    assert.match(doc,new RegExp(name+'[^\\n]*?\\(JPY '+price+'\\)'),name);
  assert.doesNotMatch(doc,/JPY (?:980|1,480|1480)\b/);
});

test('current commercialization offer uses the source Template price and checkout',async()=>{
  const doc=await read('docs/COMMERCIALIZATION.md');
  const current=doc.split('## Historical verification')[0];
  assert.match(current,/guide for JPY 480 total, once/);
  assert.match(current,/- Checkout: https:\/\/buy\.stripe\.com\/3cI8wO0SV9Wtfwp5uJbbG06(?:\r?\n|$)/);
  assert.doesNotMatch(current,/JPY 980|4gMbJ06dfgkR0Bv9KZbbG00/);
});

test('current operations price agrees with the Template offer',async()=>{
  const doc=await read('docs/OPERATIONS.md');
  assert.match(doc,/optional JPY 480 one-time template kit/);
  assert.doesNotMatch(doc,/JPY (?:980|1,480|1480)\b/);
});

test('named product totals agree across shared conditions and seller disclosure',async()=>{
  for(const slug of ['products','product-terms']){
    const html=await read('dist/'+slug+'.html');
    const sections=[...html.matchAll(slug==='products'?/<article class="card">([\s\S]*?)<\/article>/g:/<section class="panel">([\s\S]*?)<\/section>/g)].map(m=>m[1]);
    for(const [name,price] of [['FreightQuote Template Kit','480'],['Freight Cost Workbench','700'],['Solo Project Quote','480']]){
      const section=sections.find(s=>s.includes('<h2>'+name+'</h2>'));
      assert.ok(section,name+' '+slug);
      assert.deepEqual([...section.matchAll(/JPY ([\d,]+)/g)].map(m=>m[1]),[price],name+' '+slug);
    }
  }
  const disclosure=await read('dist/commerce-disclosure.html');
  assert.match(disclosure,/<dt>テンプレート販売価格<\/dt><dd>480円（支払総額）/);
  for(const [name,price] of [['Freight Cost Workbench','700'],['Solo Project Quote','480']])
    assert.ok(disclosure.includes(name+' v1.0：</strong>1パッケージ、'+price+'円（支払総額）'),name);
  const terms=await read('dist/tool-purchase-terms.html');
  assert.match(terms,/Freight Cost Workbench: JPY 700 total\. Solo Project Quote: JPY 480 total\./);
  const template=await read('dist/purchase-terms.html');
  for(const total of ['480円（支払総額）','480 日元（支付总额）','JPY 480 total'])assert.ok(template.includes('<h2>'+total),total);
});

test('support recovery routes reach all three public deliveries without implying payment',async()=>{
  const help=await read('dist/help.html');
  const recover=help.match(/<section[^>]*id="recover"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(recover);
  for(const route of ['template-download','freight-download','solo-download'])assert.ok(recover.includes('href="'+route+'"'),route);
  assert.ok(recover.includes('支払完了を意味しません'));
  assert.match(help,/href="mailto:info@anshin-corp\.com/);
  for(const [route,file] of [['template','FreightQuote-Template-Kit.zip'],['freight','freight-workbench.zip'],['solo','solo-quote.zip']]){
    const html=await read('dist/'+route+'-download.html');
    assert.ok(html.includes('href="downloads/'+file+'"'),file);
    assert.ok(html.includes('打开本页不代表付款成功'),route);
  }
});
