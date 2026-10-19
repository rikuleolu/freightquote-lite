import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, cp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {spawnSync} from 'node:child_process';

test('SEO build emits one consistent origin and rejects invalid origins', async () => {
  const root=resolve(import.meta.dirname,'..');
  const temp=await mkdtemp(join(tmpdir(),'freightquote-build-'));
  try {
    for(const folder of ['scripts','site','src']) await cp(join(root,folder),join(temp,folder),{recursive:true});
    const build=(url)=>spawnSync(process.execPath,['scripts/build.mjs'],{
      cwd:temp,env:{...process.env,SITE_URL:url,CF_ANALYTICS:'0'},encoding:'utf8',timeout:15000,
    });
    assert.equal(build('https://freightquote.example/').status,0);
    const html=await readFile(join(temp,'dist/index.html'),'utf8');
    assert.match(html,/<link rel="canonical" href="https:\/\/freightquote\.example\/"/);
    assert.match(await readFile(join(temp,'dist/sitemap.xml'),'utf8'),/<loc>https:\/\/freightquote\.example\/<\/loc>/);
    assert.match(await readFile(join(temp,'dist/robots.txt'),'utf8'),/Sitemap: https:\/\/freightquote\.example\/sitemap.xml/);
    const optIn=spawnSync(process.execPath,['scripts/build.mjs'],{
      cwd:temp,env:{...process.env,SITE_URL:'https://freightquote.example',CF_ANALYTICS:'1'},encoding:'utf8',timeout:15000,
    });
    assert.equal(optIn.status,0,optIn.stderr);
    assert.match(await readFile(join(temp,'dist/_headers'),'utf8'),/script-src 'self' https:\/\/static.cloudflareinsights.com/);
    assert.match(await readFile(join(temp,'dist/_headers'),'utf8'),/connect-src 'self' https:\/\/cloudflareinsights.com/);
    const optedHtml=await readFile(join(temp,'dist/index.html'),'utf8');
    assert.match(optedHtml,/<p id="analytics-notice" data-i18n="analyticsNotice">/);
    // Pages injects its real account-bound beacon after dashboard activation; no fake token.
    assert.doesNotMatch(optedHtml,/beacon.min.js|data-cf-beacon/);
    assert.equal(build('').status,0);
    assert.match(await readFile(join(temp,'dist/_headers'),'utf8'),/connect-src 'none'/);
    assert.match(await readFile(join(temp,'dist/index.html'),'utf8'),/id="analytics-notice" hidden/);
    for(const url of ['http://example.com','https://user:pass@example.com','https://example.com/path','https://example.com/?q=x','https://example.com/#x','not-a-url']) {
      assert.notEqual(build(url).status,0,url);
    }
  } finally { await rm(temp,{recursive:true,force:true}); }
});
