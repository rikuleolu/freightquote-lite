import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
import {readZipEntries} from './helpers/zip-entries.mjs';

test('template delivery ships a real archive and does not assert paid status',async()=>{
 const page=await readFile(new URL('../dist/template-download.html',import.meta.url),'utf8');
 const archive=await readFile(new URL('../dist/downloads/FreightQuote-Template-Kit.zip',import.meta.url));
 assert.match(page,/href="downloads\/FreightQuote-Template-Kit.zip" download/);
 assert.match(page,/This page does not prove payment/);
 assert.doesNotMatch(page,/not accepting orders yet|尚不接受订单|注文を受け付けていません/);
 assert.doesNotMatch(page,/<script|buy\.stripe\.com|sk_live_|sk_test_/i);
 assert.equal(archive.readUInt32LE(0),0x04034b50);
 assert.ok(archive.length>10000);
 const entries=readZipEntries(archive);
 const expected=['READ-ME.txt'];
 for(const lang of ['ja','zh','en'])for(const palette of ['forest','ink','minimal'])expected.push(`quote-${lang}-${palette}.html`);
 assert.deepEqual([...entries.keys()].sort(),expected.map(name=>'FreightQuote-Template-Kit/'+name).sort());
 assert.match(entries.get('FreightQuote-Template-Kit/READ-ME.txt').toString('utf8'),/Permission is granted/);
 for(const [name,data] of entries){
  if(!name.endsWith('.html'))continue;
  const html=data.toString('utf8');
  for(const id of ['save','print','total','terms'])assert.ok(html.includes('id="'+id+'"'),name+' '+id);
  assert.doesNotMatch(html,/localStorage|sessionStorage|document\.cookie|indexedDB|sendBeacon|XMLHttpRequest|\bfetch\s*\(|WebSocket|EventSource|cloudflareinsights|<script[^>]+src=|<(?:link|img|iframe)\b|@import/i,name);
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1,name);
  assert.doesNotThrow(()=>new Script(scripts[0][1]),name);
 }

});
