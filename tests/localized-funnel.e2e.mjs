// QA only. Visit our pages; inspect but never open or submit a live checkout.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,extname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const root=resolve('dist'),output=resolve(process.env.QA_OUTPUT??'qa-artifacts/localized');
await mkdir(output,{recursive:true});
const headers=Object.fromEntries((await readFile(join(root,'_headers'),'utf8')).split('\n').filter(l=>l.startsWith('  ')&&l.includes(':')).map(l=>{const i=l.indexOf(':');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const server=createServer(async(req,res)=>{try{let path=new URL(req.url,'http://localhost').pathname;if(path==='/')path='/index.html';else if(!extname(path))path+='.html';const file=resolve(root,'.'+path);if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}const mime={'.html':'text/html;charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.mjs':'text/javascript','.zip':'application/zip'};res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream',...headers});res.end(await readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.QA_BASE_URL??`http://127.0.0.1:${server.address().port}`;
const results=[];let browser;
try{
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL??'msedge'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const checkout={freight:'https://buy.stripe.com/aFa5kC6dfc4B3NH2ixbbG01',solo:'https://buy.stripe.com/28EdR8gRT9Wtac50apbbG02'};
 const checked=new Set();
 for(const lang of ['ja','zh','en']){
  for(const family of ['products','buy-freight','buy-solo','air-parcel-guide']){
   const slug=`${family}-${lang}`;const response=await page.goto(base+'/'+slug);assert.equal(response.status(),200);assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':lang);
   for(const l of ['ja','zh','en'])assert.equal(await page.locator(`header a[href="${family}-${l}"]`).count(),1);
   if(family==='products'){assert.equal(await page.locator('.card').count(),3);assert.equal(await page.locator('button:disabled').count(),0);}
   if(family.startsWith('buy-')){const kind=family.slice(4);const href=new URL(await page.locator('a[data-checkout]').getAttribute('href'));assert.equal(href.origin+href.pathname,checkout[kind]);assert.equal(href.searchParams.get('locale'),lang);assert.ok(await page.locator('#free-vs-paid').isVisible());}
   for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.href))){const url=new URL(href);if(url.origin!==new URL(base).origin)continue;url.hash='';if(checked.has(url.href))continue;checked.add(url.href);assert.equal((await context.request.get(url.href)).status(),200,url.href);}
   for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+' width '+width);if(width!==320)await page.screenshot({path:join(output,`${slug}-${width}.png`),fullPage:true});}
  }
  results.push({name:`${lang}: four localized routes, real links and three responsive widths`,status:'PASS'});console.log('PASS',results.at(-1).name);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(await context.cookies(),[]);
 console.log('PASS localized links and UI without making a purchase');
}finally{await writeFile(join(output,'results.json'),JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));await browser?.close();server.close();}
