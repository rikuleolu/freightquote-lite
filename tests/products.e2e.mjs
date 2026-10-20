// QA only: uses the same optional Playwright setup as browser.e2e.mjs.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,join,extname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const root=resolve('dist'), output=resolve(process.env.QA_OUTPUT??'qa-artifacts/products');
await mkdir(output,{recursive:true});
const headers=Object.fromEntries((await readFile(join(root,'_headers'),'utf8')).split('\n')
  .filter(l=>l.startsWith('  ')&&l.includes(':')).map(l=>{const i=l.indexOf(':');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const mime={'.html':'text/html;charset=utf-8','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.txt':'text/plain','.zip':'application/zip'};
const server=createServer(async(req,res)=>{
  try{
    let path=new URL(req.url,'http://localhost').pathname;
    if(path==='/')path='/index.html';
    else if(!extname(path))path+='.html';
    const file=resolve(root,'.'+path);
    if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream',...headers});res.end(bytes);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.QA_BASE_URL??`http://127.0.0.1:${server.address().port}`;
const results=[];let browser;
try{
  browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL??'msedge'});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const requests=[];context.on('request',r=>requests.push(r.url()));
  async function step(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS',name);}
  await step('three offers, pending purchase and every product link resolves',async()=>{
    await page.goto(base+'/products');
    assert.equal(await page.locator('.card').count(),3);
    for(const id of ['template','freight','solo']){
      await page.goto(base+'/buy-'+id);
      assert.equal(await page.locator('button:disabled').count(),1);
      assert.equal(await page.locator('form').count(),0);
      for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
        if(href.startsWith('#')||href.startsWith('mailto:'))continue;
        const response=await context.request.get(new URL(href,page.url()).href);
        assert.equal(response.status(),200,href);
      }
    }
  });
  await step('desktop and mobile catalog/demo layouts have no horizontal overflow',async()=>{
    for(const width of [390,1440])for(const path of ['products','demo-freight','demo-solo','buy-freight']){
      await page.setViewportSize({width,height:900});await page.goto(base+'/'+path);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' '+width);
      await page.screenshot({path:join(output,`${path}-${width}.png`),fullPage:true});
    }
  });
  await step('freight and service demo calculations, invalid inputs, privacy and CSV',async()=>{
    for(const [kind,expected] of [['freight','JPY 87,500'],['solo','JPY 78,750']]){
      await page.goto(base+'/demo-'+kind);
      assert.equal(await page.locator('[data-result=price]').innerText(),expected);
      await page.locator('[name=margin]').fill('100');
      assert.equal(await page.locator('#export').isDisabled(),true);
      assert.equal(await page.locator('#customer-price').innerText(),'—');
      await page.locator('[name=margin]').fill('20');
      await page.locator('[name=customer]').fill('=HYPERLINK("https://example.test")');
      await page.locator('[name=project]').fill('<img src=x onerror=alert(1)>');
      assert.equal(await page.locator('#customer-sheet img').count(),0);
      const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();
      const download=await downloadPromise;const target=join(output,kind+'.csv');await download.saveAs(target);
      const csv=await readFile(target,'utf8');
      assert.ok(csv.includes(`"'=HYPERLINK`));assert.doesNotMatch(csv,/internal|margin|profit|70000|63000/i);
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('#tool').isVisible(),false);
      assert.equal(await page.locator('#customer-sheet').isVisible(),true);
      assert.equal(await page.locator('[data-result=cost]').isVisible(),false);
      await page.pdf({path:join(output,kind+'.pdf'),format:'A4',printBackground:true});
      await page.emulateMedia({media:'screen'});
      await page.reload();
      assert.equal(await page.locator('[name=customer]').inputValue(),'Sample Customer');
      assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
    }
    assert.deepEqual(await context.cookies(),[]);
    if(!process.env.QA_BASE_URL)assert.ok(requests.filter(url=>/^https?:/.test(url)).every(url=>url.startsWith(base)),requests.join('\n'));
  });
  await step('offline full tools save edited HTML, reopen, export and make no requests',async()=>{
    for(const [file,kind] of [['freight-workbench.html','freight'],['solo-quote.html','solo']]){
      const offline=await context.newPage();const external=[];const offlineErrors=[];
      offline.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('blob:'))external.push(r.url());});
      offline.on('pageerror',e=>offlineErrors.push(e.message));
      await offline.goto(pathToFileURL(join(root,'downloads',file)).href);
      await offline.locator('[name=customer]').fill('SYNTHETIC <script>alert(1)</script>');
      await offline.locator('[name=margin]').fill('25');
      const expected=await offline.locator('[data-result=price]').innerText();
      const promise=offline.waitForEvent('download');await offline.locator('#save-copy').click();
      const dl=await promise;const saved=join(output,kind+'-saved.html');await dl.saveAs(saved);
      await offline.goto(pathToFileURL(saved).href);
      assert.equal(await offline.locator('[name=customer]').inputValue(),'SYNTHETIC <script>alert(1)</script>');
      assert.equal(await offline.locator('[data-result=price]').innerText(),expected);
      assert.equal(await offline.locator('#customer-name script').count(),0);
      assert.deepEqual(offlineErrors,[]);assert.deepEqual(external,[]);
      await offline.close();
    }
  });
  await step('template sample edits and reopens as a working offline product',async()=>{
    const p=await context.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(pathToFileURL(join(root,'downloads/quote-ja-sample.html')).href);
    const first=p.locator('input').first();await first.fill('SYNTHETIC Example');
    const save=p.getByRole('button',{name:/HTML/});
    const promise=p.waitForEvent('download');await save.click();const dl=await promise;
    const target=join(output,'template-saved.html');await dl.saveAs(target);await p.goto(pathToFileURL(target).href);
    assert.equal(await p.locator('input').first().inputValue(),'SYNTHETIC Example');
    assert.deepEqual(errs,[]);await p.close();
  });
  assert.deepEqual(errors,[]);
}finally{
  await writeFile(join(output,'results.json'),JSON.stringify({base,results},null,2));
  await browser?.close();server.close();
}
