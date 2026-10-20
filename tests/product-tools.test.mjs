import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {freight,service,csvCell} from '../src/product-calculators.mjs';
import {zipProduct} from '../scripts/zip-product.mjs';

test('ZIP uses standard CRC-32 and repeatable single-file contents',()=>{
  const a=zipProduct('example.html','123456789');
  assert.equal(a.readUInt32LE(14),0xcbf43926);
  assert.equal(a.readUInt32LE(a.length-22),0x06054b50);
  assert.deepEqual(a,zipProduct('example.html','123456789'));
});

test('offline downloads are archives immune to host HTML analytics injection',async()=>{
  const files=await readdir(new URL('../dist/downloads/',import.meta.url));
  assert.deepEqual(files.filter(f=>f.endsWith('.html')),[]);
  for(const file of ['freight-workbench.zip','solo-quote.zip','quote-ja-sample.zip'])
    assert.ok(files.includes(file),file);
});

test('freight: volume, chargeable increments and target margin are distinct',()=>{
  const r=freight({length:'50',width:'40',height:'30',cartons:'10',weight:'85',divisor:'6000',step:'0.5',rate:'600',local:'10000',margin:'20'});
  assert.deepEqual(r,{volume:'0.600',dimensional:'100.000',chargeable:'100.000',cost:70000,price:87500,profit:17500});
  assert.equal(freight({length:'1',width:'1',height:'1',cartons:'1',weight:'1.001',divisor:'5000',step:'0.5',rate:'101',local:'0',margin:'0'}).cost,152);
});
test('service: decimal hours, exact yen rounding, deposit and balance',()=>{
  const r=service({hours:'12.5',rate:'4000',expenses:'5000',revision:'2',margin:'20',deposit:'30'});
  assert.deepEqual(r,{cost:63000,price:78750,profit:15750,deposit:23625,balance:55125});
  assert.equal(service({hours:'0.01',rate:'101',expenses:'0',revision:'0',margin:'0',deposit:'33.33'}).price,2);
});
test('reject invalid, excessive, fractional cartons and 100 percent margin',()=>{
  const base={length:'50',width:'40',height:'30',cartons:'10',weight:'85',divisor:'6000',step:'0.5',rate:'600',local:'10000',margin:'20'};
  for(const [key,value] of [['weight',''],['weight','NaN'],['rate','-1'],['length','1e3'],['cartons','1.5'],['divisor','0'],['margin','100'],['step','0'],['local','9999999999999999'],['length','0']])
    assert.throws(()=>freight({...base,[key]:value}),`${key}=${value}`);
});
test('CSV neutralizes spreadsheet formulas, quotes and line breaks',()=>{
  assert.equal(csvCell('=SUM(1,2)'),'"\'=SUM(1,2)"');
  assert.equal(csvCell(' \t+123'),'"\' \t+123"');
  assert.equal(csvCell('A "B"\nC'),'"A ""B""\nC"');
});
test('all three offers ship files, samples, terms, and fail-closed purchase pages',async()=>{
  const root=new URL('../dist/',import.meta.url);
  for(const id of ['template','freight','solo']){
    const html=await readFile(new URL(`buy-${id}.html`,root),'utf8');
    assert.match(html,/販売準備中/);
    assert.match(html,/<button[^>]*disabled/);
    assert.match(html,/commerce-disclosure/);
    assert.match(html,/7日/);
    assert.doesNotMatch(html,/<form|buy\.stripe\.com|checkout\.stripe\.com|sk_live_|sk_test_|pk_live_/i);
  }
  for(const file of ['downloads/FreightQuote-Template-Kit.zip','downloads/quote-ja-sample.zip','downloads/freight-workbench.zip','downloads/solo-quote.zip','samples/freight-example.txt','samples/solo-example.txt'])
    assert.ok((await stat(new URL(file,root))).size>150);
  for(const file of ['downloads/freight-workbench.zip','downloads/solo-quote.zip']){
    const zip=await readFile(new URL(file,root));
    const start=30+zip.readUInt16LE(26)+zip.readUInt16LE(28);
    const html=zip.subarray(start,start+zip.readUInt32LE(18)).toString('utf8');
    assert.doesNotMatch(html,/<script[^>]+src=|fetch\(|localStorage|sendBeacon|XMLHttpRequest/);
    assert.match(html,/MIT License/);
    assert.match(html,/save-copy/);
  }
});
