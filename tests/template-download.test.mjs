import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('template delivery ships a real archive and does not assert paid status',async()=>{
 const page=await readFile(new URL('../dist/template-download.html',import.meta.url),'utf8');
 const archive=await readFile(new URL('../dist/downloads/FreightQuote-Template-Kit.zip',import.meta.url));
 assert.match(page,/href="downloads\/FreightQuote-Template-Kit.zip" download/);
 assert.match(page,/This page does not prove payment/);
 assert.doesNotMatch(page,/not accepting orders yet|尚不接受订单|注文を受け付けていません/);
 assert.doesNotMatch(page,/<script|buy\.stripe\.com|sk_live_|sk_test_/i);
 assert.equal(archive.readUInt32LE(0),0x04034b50);
 assert.ok(archive.length>10000);
 // Central directory filenames are uncompressed even in a compressed ZIP.
 for(const lang of ['ja','zh','en'])
  for(const palette of ['forest','ink','minimal'])
   assert.ok(archive.includes(Buffer.from(`quote-${lang}-${palette}.html`)));
 assert.ok(archive.includes(Buffer.from('READ-ME.txt')));
});
