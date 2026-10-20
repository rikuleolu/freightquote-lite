import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const offers={
  freight:{url:'https://buy.stripe.com/aFa5kC6dfc4B3NH2ixbbG01',price:'1,480'},
  solo:{url:'https://buy.stripe.com/28EdR8gRT9Wtac50apbbG02',price:'980'},
};

test('two tool offers each bind the correct real link, fixed total and distinct delivery',async()=>{
  for(const [id,offer] of Object.entries(offers)){
    const html=await readFile(new URL(`../dist/buy-${id}.html`,import.meta.url),'utf8');
    const links=[...html.matchAll(/href="(https:\/\/buy\.stripe\.com\/[^"]+)"[^>]*data-checkout/g)].map(m=>m[1]);
    assert.deepEqual(links,[offer.url],id);
    for(const item of [`JPY ${offer.price}`,'1パッケージ','tool-purchase-terms',`${id}-download`,'7日','commerce-disclosure','無料']) assert.ok(html.includes(item),`${id}: ${item}`);
    assert.doesNotMatch(html,/<button[^>]*disabled|現在の請求額は0円|注文不可|注文できません|販売開始後の予定/);
    assert.doesNotMatch(html,/<form|sk_live_|pk_live_|sk_test_|CHECKOUT_SESSION_ID|checkout\.session\.completed/);
  }
  assert.notEqual(offers.freight.url,offers.solo.url);
});

test('catalog and shared conditions do not contradict live tool purchase pages',async()=>{
  for(const name of ['products','product-terms']){
    const html=await readFile(new URL(`../dist/${name}.html`,import.meta.url),'utf8');
    assert.doesNotMatch(html,/另两款暂不开放|另外两款没有收款|另外两款仅供免费试用|新しい2ツールは開始日未定|販売予定価格/);
    assert.ok(html.includes('tool-purchase-terms'));
    assert.ok(html.includes('取得に購入は必須ではありません')||html.includes('完整文件'));
  }
});
