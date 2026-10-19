// Separate from the zero-dependency unit suite. Uses an isolated browser profile.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, join, extname, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const root=resolve(import.meta.dirname,'../dist');
const artifacts=resolve(process.env.QA_OUTPUT ?? 'qa-artifacts');
await mkdir(artifacts,{recursive:true});
const headers=Object.fromEntries((await readFile(join(root,'_headers'),'utf8')).split('\n')
  .filter(line=>line.startsWith('  ') && line.includes(':')).map(line=>{
    const index=line.indexOf(':');return [line.slice(0,index).trim(),line.slice(index+1).trim()];
  }));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream',...headers});
    res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
const results=[];
const network=[];
const consoleErrors=[];
try {
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  context.on('request',r=>network.push({method:r.method(),url:r.url(),postData:r.postData()}));
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror',e=>consoleErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  await page.addInitScript(()=>{
    window.__printCount=0;
    window.print=()=>{window.__printCount++;window.dispatchEvent(new Event('beforeprint'));};
  });
  const fresh=async()=>{await page.emulateMedia({media:'screen'});await page.goto(base);await page.locator('.line-row').waitFor();};
  const printPdf=async(name)=>{
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#screen-root').isVisible(),false);
    await page.pdf({path:join(artifacts,name),format:'A4',printBackground:true,preferCSSPageSize:true});
    await page.emulateMedia({media:'screen'});
  };
  const screenshot=async(name)=>{
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});
    await page.screenshot({path:join(artifacts,name),fullPage:true});
  };
  const field=(name,index=0)=>page.locator(`[data-field="${name}"]`).nth(index);
  const step=async(name,fn)=>{
    if(process.env.E2E_FILTER && !name.includes(process.env.E2E_FILTER))return;
    try{await fn();results.push({name,status:'PASS'});console.log('PASS',name);}
    catch(e){results.push({name,status:'FAIL',error:e.message});console.error('FAIL',name,e.message);}
  };
  const expectMoney=async(id,amount)=>assert.equal((await page.locator('#'+id).innerText()).replace(/[^\d.\-]/g,''),amount);
  for(const [locale,currency,cost,revenue,profit,margin,title] of [
    ['ja','JPY','59000','77500','18500','23.87%','国際物流 見積書'],
    ['zh','CNY','4200.00','5520.00','1320.00','23.91%','国际物流报价单'],
    ['en','USD','490.00','650.00','160.00','24.62%','FREIGHT QUOTATION'],
  ]) await step(`${locale}/${currency}: sample totals, print action, customer PDF`,async()=>{
    await fresh();await page.locator(`[data-locale="${locale}"]`).click();
    await page.locator('#currency').selectOption(currency);await page.locator('#sample-button').click();
    await expectMoney('cost-value',cost);await expectMoney('revenue-value',revenue);await expectMoney('profit-value',profit);
    assert.equal(await page.locator('#margin-value').innerText(),margin);
    await page.locator('#print-button').click();
    assert.equal(await page.evaluate(()=>window.__printCount),1);
    assert.equal(await page.locator('.p-title').textContent(),title);
    assert.ok((await page.locator('.p-info').textContent()).includes(currency),'Customer quote must state the ISO currency code');
    await printPdf(`quotation-${locale}.pdf`);
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#screen-root').isVisible(),false);
    assert.equal(await page.locator('#print-sheet').isVisible(),true);
    assert.doesNotMatch(await page.locator('#print-sheet').innerText(),/仕入|粗利|总成本|单位成本|毛利|Total cost|Unit cost|Gross profit|Gross margin/);
    await page.emulateMedia({media:'screen'});
    await screenshot(`desktop-${locale}.png`);
  });
  await step('currency confirmation: cancel preserves, accept clears every amount',async()=>{
    await fresh();await page.locator('#sample-button').click();
    page.once('dialog',d=>d.dismiss());await page.locator('#currency').selectOption('USD');
    assert.equal(await page.locator('#currency').inputValue(),'JPY');assert.equal(await field('cost').inputValue(),'48000');
    page.once('dialog',d=>d.accept());await page.locator('#currency').selectOption('USD');
    assert.equal(await page.locator('#currency').inputValue(),'USD');
    assert.deepEqual(await page.locator('[data-field="cost"],[data-field="sell"]').evaluateAll(inputs=>inputs.map(i=>i.value)),Array(6).fill(''));
    assert.equal(await field('description').inputValue(),'Ocean freight');
    await page.locator('#print-button').click();assert.equal(await page.evaluate(()=>window.__printCount),0);
  });
  await step('invalid amounts, quantities and missing descriptions cannot print',async()=>{
    await fresh();await field('description').fill('Fee');await field('cost').fill('10');await field('sell').fill('20');
    for(const bad of ['-1','1e3','12.50','NaN','1,000','']) {
      await field('sell').fill(bad);await page.locator('#print-button').click();
      assert.equal(await page.locator('#validation').isVisible(),true,bad);
      assert.equal(await page.evaluate(()=>window.__printCount),0,bad);
    }
    await field('sell').fill('20');await field('qty').fill('0');await page.locator('#print-button').click();
    assert.equal(await page.evaluate(()=>window.__printCount),0);
    await field('qty').fill('1');await field('description').fill('');await page.locator('#print-button').click();
    assert.equal(await page.evaluate(()=>window.__printCount),0);
  });
  await step('reset cancel/accept, add/remove and empty quote',async()=>{
    await fresh();await page.locator('#sample-button').click();
    page.once('dialog',d=>d.dismiss());await page.locator('#clear-button').click();
    assert.equal(await page.locator('.line-row').count(),3);
    page.once('dialog',d=>d.accept());await page.locator('#clear-button').click();
    assert.equal(await page.locator('#issuer').inputValue(),'');assert.equal(await page.locator('.line-row').count(),1);
    await page.locator('#add-line').click();assert.equal(await page.locator('.line-row').count(),2);
    await page.locator('.remove-line').first().click();await page.locator('.remove-line').first().click();
    await page.locator('#print-button').click();assert.equal(await page.evaluate(()=>window.__printCount),0);
    assert.equal(await page.locator('#validation').isVisible(),true);
  });
  await step('untrusted input stays text; unique internal cost absent from print document',async()=>{
    await fresh();await page.locator('[data-locale="en"]').click();
    const payload='<img src=x onerror="window.__injected=true">';
    await page.locator('#issuer').fill(payload);await field('description').fill(payload);
    await field('cost').fill('1234567');await field('sell').fill('7654321');
    await page.locator('#print-button').click();
    assert.equal(await page.locator('#print-sheet img').count(),0);
    assert.equal(await page.evaluate(()=>window.__injected),undefined);
    assert.ok((await page.locator('#print-sheet').textContent()).includes(payload));
    assert.doesNotMatch(await page.locator('#print-sheet').textContent(),/1,234,567|6,419,754/);
    await printPdf('privacy-proof.pdf');
    await field('sell').fill('');
    assert.equal(await page.locator('#print-sheet').textContent(),'');
    await printPdf('invalid-quote.pdf');
  });
  await step('50-row limit and multipage print',async()=>{
    await fresh();await page.locator('[data-locale="en"]').click();
    for(let i=1;i<50;i++)await page.locator('#add-line').click();
    await page.locator('#add-line').click();assert.equal(await page.locator('.line-row').count(),50);
    for(let i=0;i<50;i++){
      await field('description',i).fill(`Line ${i+1}: `+'Long description '.repeat(6));
      await field('cost',i).fill('7');await field('sell',i).fill('12');
    }
    await page.locator('#print-button').click();assert.equal(await page.locator('.p-table tbody tr').count(),50);
    await expectMoney('revenue-value','600');
    await printPdf('quotation-50-lines.pdf');
  });
  for(const width of [320,390,768,1440]) await step(`responsive layout ${width}px, all languages`,async()=>{
    await page.setViewportSize({width,height:844});await fresh();
    for(const locale of ['ja','zh','en']){
      await page.locator(`[data-locale="${locale}"]`).click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}: page overflows horizontally`);
      await page.locator('#sample-button').click();
      assert.equal(await page.locator('#print-button').isVisible(),true);
      if(width===390)await screenshot(`mobile-${locale}.png`);
    }
  });
  await step('reload clears data, no cookies or storage, no unexpected network or JS errors',async()=>{
    await fresh();await page.locator('#sample-button').click();await page.reload();
    assert.equal(await page.locator('#issuer').inputValue(),'');
    assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
    assert.equal((await context.cookies()).length,0);
    assert.deepEqual(network.filter(r=>!r.url.startsWith(base+'/')||r.method!=='GET'||r.postData!==null),[]);
    assert.deepEqual(consoleErrors,[]);
  });
  await writeFile(join(artifacts,'e2e-results.json'),JSON.stringify({browser:browser.version(),base,results,network,consoleErrors},null,2));
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
} finally {
  await browser?.close();await new Promise(r=>server.close(r));
}
