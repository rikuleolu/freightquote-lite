import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAmount, calculateQuote, formatMoney, validateQuote} from '../src/calculator.mjs';

test('JPY has integer-only units and zero decimal display', () => {
  assert.equal(parseAmount('18000', 'JPY'), 18000);
  assert.throws(() => parseAmount('1.50', 'JPY'), /JPY/);
  assert.match(formatMoney(18000,'JPY','ja-JP'), /18,000/);
});

test('USD minor units calculate without floating point drift', () => {
  assert.equal(parseAmount('0.10', 'USD'), 10);
  assert.equal(parseAmount('0.20', 'USD'), 20);
  const q = calculateQuote([{description:'Freight',qty:1,cost:'0.10',sell:'0.30'},{description:'Fee',qty:1,cost:'0.20',sell:'0.40'}], 'USD');
  assert.equal(q.costMinor,30);
  assert.equal(q.revenueMinor,70);
  assert.equal(q.profitMinor,40);
});

test('quantity multiplies costs and revenue, margin uses revenue denominator', () => {
  const q = calculateQuote([{description:'Ocean freight',qty:2,cost:'6000',sell:'9000'}], 'JPY');
  assert.deepEqual([q.costMinor,q.revenueMinor,q.profitMinor],[12000,18000,6000]);
  assert.equal(q.marginPct,33.33);
});

test('a loss produces negative profit and negative margin', () => {
  const q = calculateQuote([{description:'Fee',qty:1,cost:'100',sell:'50'}], 'JPY');
  assert.equal(q.profitMinor,-50);
  assert.equal(q.marginPct,-100);
});

test('zero revenue does not become NaN or Infinity', () => {
  const q = calculateQuote([{description:'Free line',qty:1,cost:'10',sell:'0'}], 'JPY');
  assert.equal(q.marginPct,0);
  assert.equal(q.profitMinor,-10);
});

test('reject invalid amounts, negative values, zero quantity, unsafe integers', () => {
  for (const bad of ['-1','1e3','abc','12.345','1,000','']) {
    assert.throws(() => parseAmount(bad,'USD'));
  }
  assert.throws(() => calculateQuote([{description:'x',qty:0,cost:'10',sell:'10'}], 'JPY'));
  assert.throws(() => calculateQuote([{description:'x',qty:2,cost:'9999999999999999',sell:'10'}], 'JPY'));
});

test('support CNY decimal amounts, and reject invalid currency', () => {
  assert.equal(parseAmount('123.45','CNY'),12345);
  assert.throws(() => parseAmount('100','EUR'), /currency/);
});

test('validateQuote blocks missing descriptions and customer-unfriendly free text', () => {
  assert.equal(validateQuote([{description:'',qty:1,cost:'10',sell:'12'}], 'JPY').ok,false);
  assert.equal(validateQuote([{description:'Item',qty:1,cost:'10',sell:'12'}], 'JPY').ok,true);
});

test('rows can have blank input while being edited; amounts are zero only in calculation', () => {
  const q=calculateQuote([{description:'Editing',qty:1,cost:'',sell:''}], 'JPY', {allowBlank:true});
  assert.equal(q.revenueMinor,0);
});

test('large safe cent amounts retain every cent when displayed', () => {
  for (const currency of ['USD','CNY']) {
    assert.match(formatMoney(9007199254740991,currency,'en-US'), /90,071,992,547,409\.91/);
    assert.match(formatMoney(-9007199254740891,currency,'en-US'), /-.*90,071,992,547,408\.91/);
    assert.match(formatMoney(-1,currency,'en-US'), /-.*0\.01/);
  }
});

test('line and total limits reject overflow without accepting rounded values', () => {
  assert.equal(parseAmount('90071992547409.91','USD'),Number.MAX_SAFE_INTEGER);
  assert.throws(() => parseAmount('90071992547409.92','USD'));
  assert.throws(() => calculateQuote([{qty:2,cost:'0',sell:'4503599627370496'}],'JPY'));
  assert.throws(() => calculateQuote([{qty:1,cost:'0',sell:'9007199254740991'},{qty:1,cost:'0',sell:'1'}],'JPY'));
  const line={description:'Handling',qty:1,cost:'1',sell:'2'};
  assert.equal(validateQuote(Array(50).fill(line),'JPY').ok,true);
  assert.equal(validateQuote(Array(51).fill(line),'JPY').ok,false);
});
