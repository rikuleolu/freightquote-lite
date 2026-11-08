import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {Script} from 'node:vm';
import {readZipEntries} from './helpers/zip-entries.mjs';
const root=new URL('../dist/',import.meta.url);

test('each new tool has a real, non-authenticating delivery page and ZIP',async()=>{
  for(const [id,file] of [['freight','freight-workbench.zip'],['solo','solo-quote.zip']]){
    const html=await readFile(new URL(`${id}-download.html`,root),'utf8');
    assert.ok(html.includes(`href="downloads/${file}"`));
    assert.ok(html.includes('打开本页不代表付款成功'));
    assert.ok(html.includes('tool-purchase-terms'));
    assert.match(html,/name="robots" content="noindex,nofollow"/);
    assert.doesNotMatch(html,/sk_live_|sk_test_|CHECKOUT_SESSION_ID|localStorage|<script/i);
    const zip=await readFile(new URL(`downloads/${file}`,root));
    const entries=readZipEntries(zip);
    assert.deepEqual([...entries.keys()],[file.replace('.zip','.html')]);
    const offline=entries.values().next().value.toString('utf8');
    assert.doesNotMatch(offline,/localStorage|sessionStorage|document\.cookie|indexedDB|sendBeacon|XMLHttpRequest|\bfetch\s*\(|WebSocket|EventSource|cloudflareinsights|<script[^>]+src=|<(?:link|img|iframe)\b|@import/i,file);
    const scripts=[...offline.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length,1,file);
    assert.doesNotThrow(()=>new Script(scripts[0][1]),file);
    assert.ok((await stat(new URL(`downloads/${file}`,root))).size>1000);
  }
});

test('supplemental tool purchase terms disclose both totals and nonexclusive delivery',async()=>{
  const terms=await readFile(new URL('tool-purchase-terms.html',root),'utf8');
  for(const text of ['Freight Cost Workbench','Solo Project Quote','700','480','1パッケージ','7日','Stripe','commerce-disclosure','privacy-policy','免费取得','一次性','info@anshin-corp.com']) assert.ok(terms.includes(text),text);
  assert.doesNotMatch(terms,/無制限|無条件返金|自動メール送信|sk_live_/);
});
