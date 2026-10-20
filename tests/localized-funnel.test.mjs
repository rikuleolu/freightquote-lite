import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=slug=>readFile(new URL(`../dist/${slug}.html`,import.meta.url),'utf8');
const links={freight:'https://buy.stripe.com/aFa5kC6dfc4B3NH2ixbbG01',solo:'https://buy.stripe.com/28EdR8gRT9Wtac50apbbG02'};
for(const lang of ['ja','zh','en']){
  test(`${lang}: existing catalog route describes the three real products, not abandoned concepts`,async()=>{
    const html=await read(`products-${lang}`);
    for(const name of ['FreightQuote Template Kit','Freight Cost Workbench','Solo Project Quote'])assert.ok(html.includes(name),name);
    assert.match(html,new RegExp(`<html lang="${lang==='zh'?'zh-CN':lang}"`));
    for(const slug of [`template-kit-${lang}`,`buy-freight-${lang}`,`buy-solo-${lang}`])assert.ok(html.includes(`href="${slug}"`),slug);
    assert.doesNotMatch(html,/JPY 2,980|JPY 9,800|<button disabled>|PRODUCT SHOWCASE|not taking orders|当前不接受订单/);
  });
  test(`${lang}: both localized sales pages preserve the price, real payment link and free-access terms`,async()=>{
    for(const kind of ['freight','solo']){
      const html=await read(`buy-${kind}-${lang}`);
      const href=html.match(/href="([^"]+)" data-checkout/)?.[1];assert.ok(href);
      const url=new URL(href.replaceAll('&amp;','&'));
      assert.equal(url.origin+url.pathname,links[kind]);
      assert.equal(url.searchParams.get('locale'),lang);
      assert.deepEqual([...url.searchParams.keys()],['locale']);
      for(const token of [kind==='freight'?'1,480':'980','free-vs-paid',`${kind}-download`,'tool-purchase-terms','commerce-disclosure','privacy-policy','help'])assert.ok(html.includes(token),token);
      assert.doesNotMatch(html,/<form|<script|sk_live_|guaranteed|guarantee a refund|sold out/i);
    }
  });
  test(`${lang}: freight acquisition guide leads to the real tool and distinguishes illustrative rules`,async()=>{
    const html=await read(`air-parcel-guide-${lang}`);
    for(const token of ['6,000','5,000','100','120','70,000','87,500','82,000','102,500','demo-freight',`buy-freight-${lang}`,'https://dct.dhl.com/help'])assert.ok(html.includes(token),token);
    assert.ok(html.includes('id="worked-example"'));
  });
}
test('localized catalog and purchase routes have reciprocal language navigation',async()=>{
  for(const family of ['products','buy-freight','buy-solo','air-parcel-guide'])for(const lang of ['ja','zh','en']){
    const html=await read(`${family}-${lang}`);
    for(const other of ['ja','zh','en'])assert.ok(html.includes(`href="${family}-${other}"`),`${family}-${lang} -> ${other}`);
  }
});
