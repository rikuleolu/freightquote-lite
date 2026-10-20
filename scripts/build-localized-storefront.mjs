import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const languages=['ja','zh','en'];
const tags={ja:'ja',zh:'zh-CN',en:'en'};
const names={ja:'日本語',zh:'中文',en:'English'};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const offers=[
  {id:'template',name:'FreightQuote Template Kit',price:980,demo:'template-demo',file:'FreightQuote-Template-Kit.zip'},
  {id:'freight',name:'Freight Cost Workbench',price:1480,demo:'demo-freight',file:'freight-workbench.zip',checkout:'https://buy.stripe.com/aFa5kC6dfc4B3NH2ixbbG01'},
  {id:'solo',name:'Solo Project Quote',price:980,demo:'demo-solo',file:'solo-quote.zip',checkout:'https://buy.stripe.com/28EdR8gRT9Wtac50apbbG02'}
];
const copy={
  ja:{
    title:'原価は社内に。伝わる見積を顧客へ。',intro:'小さな物流チームや個人事業のための、登録不要・端末内で使える見積ツール。まず無料で実際の出力を確認してください。',
    catalog:'商品を選ぶ',free:'無料で試す',details:'内容・購入条件',help:'使い方・サポート',guide:'航空・宅配の見積手順',price:'支払総額・買い切り',choose:'今日、どの仕事を進めますか？',
    goals:['日・中・英で同じ会社書式を使う','航空・宅配の重量と毛利を確認する','工数・修正・経費と前払予定を整理する'],
    features:[['3言語×3配色、9つのHTML書式','金額と合計は手動確認','編集したHTMLと顧客PDFを保存'],['同じ寸法の箱の容積重量・計費重量','JPYの内部原価と目標粗利から参考見積','番号・期限・範囲付きの顧客CSV/PDF'],['作業・修正時間と経費を分ける','JPYの見積額・前払予定・残額を試算','番号・期限・範囲付きの顧客CSV/PDF']],
    fit:'対象と動作環境',fitText:'PC版Edge / ChromeでZIPを解凍しHTMLを開きます。2つの計算ツールの画面は日本語・中文併記です。この販売ページの翻訳がツール全体の英語化を意味するものではありません。スマートフォンは閲覧・簡単な試算向けです。',
    limits:['航空・宅配の同一寸法の箱向け。実運賃、海上W/M、混載寸法、税・FX・通関の計算は含みません。換算係数と丸め規則は運送会社に確認してください。','単発の制作・翻訳等の計画用。税・源泉徴収・請求書・契約作成・会計連携は含みません。前払額は予定で、入金済みの表示ではありません。'],
    freeTitle:'無料利用と任意購入の違い',freeText:'完全版と全機能は無料で利用できます。購入版と機能は同じです。ご自身で利用できる場合は購入不要です。',paidTitle:'購入に含まれるもの',paidText:'整理済みパッケージと、ファイルの取得・保存・印刷に関する限定的な利用案内。機能解放、独占アクセス、個別制作、継続更新、返信時刻の保証は含みません。',
    first:'最初の一件を完成させる',steps:['架空例を変更し、計算結果と前提を確認する。','発行元・顧客・番号・期限・含む範囲と除外事項を記入する。','顧客にはCSVかPDFを渡す。内部原価を含むHTMLは社内用に保管する。','ZIPを解凍して使い、入力済みHTMLを保存。保存した副本を開き直して確認する。'],
    order:'注文内容を確認',quantity:'数量：1パッケージ',total:'Stripeで購入時にカード前払い。定期課金・送料・追加の当社手数料なし。通信費やカード会社の換算費用等は利用者負担です。次の画面で商品・数量・通貨・最終金額と条件を確認し、確定前は戻って中止できます。',buy:'Stripeで購入手続きへ',
    delivery:'カード決済完了後、商品別のダウンロード案内へ移動します。案内を閉じても公開取得先から再取得できます。メール添付の自動送信や独占アクセスは提供しません。ファイル取得は支払完了の証明ではありません。',
    recovery:'ファイルを取得・再取得',refundTitle:'返品・不具合',refund:'購入後7日以内に購入メールアドレス・決済日時・問題の内容をご連絡ください。重複購入、破損、不達、所定の環境で利用できない場合は再交付又は返金を確認します。ダウンロード後のお客様都合の返品は原則不可。法令上の権利は制限しません。',
    terms:'購入・返品条件',seller:'販売者表示',privacy:'プライバシー',license:'MITによる利用・変更・商用利用・共有が可能です。継続更新や購入者限定機能は含みません。',notice:'計算と入力は端末内で処理します。公開サイトはCloudflareの閲覧・性能統計を利用する場合があります。入力内容は送信しません。',
    guideTitle:'航空・宅配の見積：重量から顧客への提示まで',guideIntro:'換算係数と粗利率を混同せず、含む費用と除外事項を明確にするための実例です。以下は架空の条件で、運送会社の料金表ではありません。',
    weightTitle:'1. 換算係数を先に確認する',weight:'同じ寸法の箱が10個、各50×40×30cm、実重量合計85kg。例として除数6,000を仮定すると容積重量は100kg。5,000なら120kgです。実重量と比較し、指定の切上げを適用します。DHLの案内ではcm/kgの標準除数は5,000。6,000をすべての会社へ適用してはいけません。箱ごと・総量・丸め方も契約条件を確認してください。',
    calcTitle:'2. 原価と売上粗利率を分ける',calc:'例示の仕入単価JPY 600/kg、その他原価JPY 10,000、目標粗利率20%。除数6,000では計費重量100kg、原価70,000円、税前見積87,500円。5,000では120kg、原価82,000円、税前見積102,500円。計算式は原価÷(1−粗利率)です。原価に20%を上乗せする計算とは違います。',
    scopeTitle:'3. 顧客には範囲と期限を提示する',scope:'見積番号・発行元・有効期限、含む費用、通関・保険・税や追加作業の取扱いを記入してください。未確定は未確定と明記します。顧客に渡すのは販売見積だけで、原価や目標毛利率を含むHTMLは渡しません。',source:'換算係数の一次資料：DHL',example:'架空の条件・税前の試算',learn:'実例をツールで試す',noGuarantee:'本例は実運賃・予約・税額・納期の保証ではありません。'
  },
  zh:{
    title:'成本留在内部，客户收到清楚的报价。',intro:'面向小型物流团队和自由职业者的本地报价工具。无需注册，先免费试用并查看真实输出，再决定是否购买。',
    catalog:'选择产品',free:'免费试用',details:'查看内容与购买条件',help:'使用帮助与售后',guide:'空运快递报价指南',price:'一次性支付总额',choose:'你今天要完成哪项工作？',
    goals:['统一日语、中文和英语报价版式','核算空运快递的重量、成本和毛利','把工时、修改和支出计入项目报价'],
    features:[['三种语言、三种配色，共9份HTML模板','金额与合计需要手动核对','保存编辑后的HTML并打印客户PDF'],['计算同规格箱体的体积重量与计费重量','按日元成本和目标毛利率试算报价','导出带编号、有效期和范围的客户CSV/PDF'],['分别计算工作时间、修改时间和费用','试算日元报价、计划预付款和尾款','导出带编号、有效期和范围的客户CSV/PDF']],
    fit:'适合谁，以及怎么使用',fitText:'适合在电脑版Edge或Chrome中解压ZIP、打开HTML使用。两款计算工具目前采用日中双语界面；销售页面有英语版不表示工具已完整英语化。手机适合查看及简单试算，完整编辑和保存建议用电脑。',
    limits:['用于空运或快递的同规格箱体概算。不含实时运价、海运W/M、多规格混装、税费、汇率或报关计算。体积除数和进位规则须向承运人确认。','用于设计、翻译等一次性项目的计划报价。不含计税、代扣税、发票、合同制作或会计集成。预付款和尾款是计划金额，不代表已经收款。'],
    freeTitle:'免费和付费有什么区别？',freeText:'完整工具及全部功能免费可用，购买版与免费版功能相同。能够自行使用时，无需为了下载而付款。',paidTitle:'购买包含的服务',paidText:'整理好的文件包，以及获取、保存、打印文件方面的有限使用协助。不含功能解锁、独占下载、定制开发、持续更新或保证回复时效。',
    first:'完成第一份报价',steps:['修改虚构示例，核对计算结果及前提。','填写报价方、客户、编号、有效期、包含范围和除外事项。','对客户仅发送CSV或PDF；包含内部成本的HTML保留作内部文件。','解压ZIP后使用，保存已填写HTML，再重新打开副本核对。'],
    order:'确认购买内容',quantity:'数量：1个文件包',total:'通过Stripe银行卡一次性预付。无订阅、运费或商户额外手续费；网络和发卡行换汇等费用由使用者承担。在下一页核对商品、数量、币种、最终金额及条件，确认前可返回中止。',buy:'前往Stripe确认购买',
    delivery:'银行卡付款完成后进入对应下载说明页；关闭页面后仍可从公开入口重新取得文件。不自动发送邮件附件，不提供独占访问。能够下载文件不代表已经付款。',
    recovery:'取得或找回文件',refundTitle:'退款与文件问题',refund:'购买后7日内，提供购买邮箱、付款日期和问题说明。重复购买、破损、未交付或在说明的环境中不能使用，可申请重新交付或退款。下载后仅因个人原因退货原则上不受理，不影响依法享有的权利。',
    terms:'购买与退款条件',seller:'经营者信息',privacy:'隐私说明',license:'按MIT许可可使用、修改、商用和分享。不包含持续更新或购买者专属功能。',notice:'输入与计算仅在当前设备处理。公开网站可能使用Cloudflare统计访问与性能，不发送报价字段。',
    guideTitle:'空运快递如何报价：从重量到客户确认',guideIntro:'用一个完整例子分清体积除数、成本和毛利率，再写清费用范围。下列条件全部为虚构示例，不是承运人实时报价。',
    weightTitle:'1. 先确认体积除数',weight:'10个相同箱子，每箱50×40×30厘米，总实重85公斤。假定除数6,000，体积重量是100公斤；改用5,000则为120公斤。与实重比较后，按承运人的规则进位。DHL公开说明中厘米/公斤的标准除数为5,000，不能把示例6,000当成所有承运人的统一规则。还须确认逐箱还是总量计费及舍入方式。',
    calcTitle:'2. 成本加价率不等于销售毛利率',calc:'虚构成本单价JPY 600/kg，其他成本JPY 10,000，目标销售毛利率20%。除数6,000时：计费重量100kg，成本70,000日元，税前报价87,500日元。除数5,000时：120kg，成本82,000日元，税前报价102,500日元。公式为成本÷(1−毛利率)，不是成本直接加20%。',
    scopeTitle:'3. 向客户说明范围和有效期',scope:'填写报价编号、报价方、有效期、包含费用，以及报关、保险、税费和追加工作的处理方式。未确认事项明确写成待确认。客户只接收销售报价，不接收带成本和目标毛利率的内部HTML。',source:'体积除数的原始资料：DHL',example:'虚构条件，仅为税前试算',learn:'用工具试算这个例子',noGuarantee:'这个例子不保证真实运价、舱位、税额或交付日期。'
  },
  en:{
    title:'Keep costs internal. Send customers a clear quote.',intro:'Local-first quotation tools for small freight teams and independent professionals. No account required. Try the complete files before choosing an optional purchase.',
    catalog:'Choose a tool',free:'Try free',details:'Details and purchase terms',help:'Help and support',guide:'Air and parcel quote guide',price:'One-time total',choose:'What work do you need to finish?',
    goals:['Reuse one quotation format in three languages','Check air/parcel weight, cost and margin','Include time, revisions and expenses in a project quote'],
    features:[['Nine HTML templates: three languages and palettes','Review amounts and totals manually','Save edited HTML and print a customer PDF'],['Dimensional and chargeable weight for identical cartons','JPY cost and target-margin estimate','Customer CSV/PDF with reference, validity and scope'],['Separate work, revision time and expenses','Plan a JPY quote, deposit and remaining balance','Customer CSV/PDF with reference, validity and scope']],
    fit:'Fit and system requirements',fitText:'Extract the ZIP and open the HTML in desktop Edge or Chrome. Both calculator interfaces currently use Japanese/Chinese, not a full English interface. This English storefront does not change that limitation. Phones are suitable for viewing and simple estimates; use a computer to edit, save and print.',
    limits:['For simple air/parcel estimates with identical cartons. No live carrier rates, ocean W/M, mixed carton dimensions, tax, FX or customs calculations. Confirm the divisor and rounding rules with your carrier.','For one-off design, translation and production estimates. No tax or withholding calculation, invoice issuance, contract drafting or accounting integration. Deposit and balance are planned amounts, not payment receipts.'],
    freeTitle:'Free use versus optional purchase',freeText:'The complete files and all features are available free. Purchased and free versions have the same features. No purchase is needed to download or use the tools yourself.',paidTitle:'What the purchase covers',paidText:'The organized package and limited assistance with obtaining, saving and printing its files. No feature unlock, exclusive access, custom development, ongoing updates or promised response time.',
    first:'Finish your first quote',steps:['Replace the fictional example and check the assumptions and results.','Enter issuer, customer, reference, validity, included scope and exclusions.','Send the customer CSV or PDF. Keep the cost-bearing HTML private.','Extract the ZIP, save an edited HTML copy and reopen it to verify the values.'],
    order:'Review the order',quantity:'Quantity: one package',total:'One-time advance card payment through Stripe. No subscription, shipping or extra merchant fee. Connectivity and card-issuer conversion fees may apply. Review product, quantity, currency, final amount and terms on the next page; go back to cancel before confirming.',buy:'Review purchase on Stripe',
    delivery:'After card checkout, the matching download instructions are shown. The public recovery link remains available even after closing the page. No automated email attachment or exclusive access is promised. Download access is not evidence of payment.',
    recovery:'Get or recover the files',refundTitle:'Refunds and file problems',refund:'Within seven days of purchase, contact us with the purchase email, payment date and problem. Duplicate purchases, damaged or undelivered files, or failure in the stated environment qualify for redelivery or refund review. Change-of-mind returns after download are generally not accepted. Statutory rights are unaffected.',
    terms:'Purchase and refund terms',seller:'Seller disclosure',privacy:'Privacy',license:'The MIT license permits use, modification, commercial use and sharing. No ongoing updates or paid-only features are included.',notice:'Inputs and calculations stay on your device. The public site may use Cloudflare page and performance statistics without sending quote fields.',
    guideTitle:'Air and parcel quotes: from billable weight to a clear offer',guideIntro:'A complete worked example separating the dimensional divisor, cost, margin and customer scope. All prices and shipment assumptions below are fictional, not a carrier tariff.',
    weightTitle:'1. Confirm the divisor before calculating',weight:'Ten identical cartons measure 50 × 40 × 30 cm each; total actual weight is 85 kg. With an illustrative divisor of 6,000, dimensional weight is 100 kg; using 5,000 gives 120 kg. Compare with actual weight and apply the carrier rounding rules. DHL lists 5,000 as its standard cm/kg divisor. Do not treat 6,000 as universal; confirm per-piece versus total rating and rounding for your service.',
    calcTitle:'2. Separate markup from gross margin',calc:'Assume JPY 600/kg cost, JPY 10,000 other cost and a 20% gross-margin target. At divisor 6,000: 100 kg chargeable, JPY 70,000 cost and JPY 87,500 before-tax quote. At divisor 5,000: 120 kg, JPY 82,000 cost and JPY 102,500 quote. Price = cost ÷ (1 − margin). Adding 20% to cost is a different calculation.',
    scopeTitle:'3. Tell the customer what is included',scope:'State the quote reference, issuer, validity, included charges and how customs, insurance, taxes and extra work are handled. Mark uncertain items as unconfirmed. Send a customer-facing price, not the internal HTML containing cost and target margin.',source:'Primary divisor reference: DHL',example:'Fictional conditions; before-tax estimates only',learn:'Try this example in the calculator',noGuarantee:'This example does not guarantee carrier rates, capacity, taxes or delivery dates.'
  }
};

/** Static localized pages only: no customer data, browser storage or new payment product. */
export async function buildLocalizedStorefront(base,out,origin=''){
  const routes=[];
  const nav=(family,lang)=>languages.map(l=>`<a href="${family}-${l}" lang="${tags[l]}"${l===lang?' aria-current="page"':''}>${names[l]}</a>`).join(' · ');
  const shell=(family,lang,title,description,body)=>{
    const c=copy[lang],slug=`${family}-${lang}`;
    const head=origin?`<link rel="canonical" href="${origin}/${slug}">${languages.map(l=>`<link rel="alternate" hreflang="${tags[l]}" href="${origin}/${family}-${l}">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin}/${family}-ja">`:'';
    routes.push('/'+slug);
    return `<!doctype html><html lang="${tags[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow"><title>${escape(title)} | FreightQuote Lite</title><link rel="stylesheet" href="products.css"><link rel="icon" href="favicon.svg">${head}</head><body><header><a class="brand" href="/?lang=${lang}">FreightQuote <strong>Lite</strong></a><nav aria-label="Language">${nav(family,lang)}</nav></header><main>${body}</main><footer><a href="products-${lang}">${c.catalog}</a><a href="help#${lang}">${c.help}</a><a href="commerce-disclosure">${c.seller}</a><a href="tool-purchase-terms#${lang}">${c.terms}</a><a href="privacy-policy">${c.privacy}</a><p>ANSHIN Co., Ltd. · <a href="mailto:info@anshin-corp.com">info@anshin-corp.com</a></p><p>${c.notice}</p></footer></body></html>`;
  };
  for(const lang of languages){
    const c=copy[lang];
    const cards=offers.map((p,i)=>`<article class="card"><span class="number">0${i+1}</span><h2>${p.name}</h2><p>${c.goals[i]}</p><ul>${c.features[i].map(t=>`<li>${t}</li>`).join('')}</ul><p class="price">JPY ${p.price.toLocaleString('en-US')}<small>${c.price}</small></p><div class="actions"><a class="button" href="${p.demo}">${c.free}</a><a href="${p.id==='template'?'template-kit-'+lang:'buy-'+p.id+'-'+lang}">${c.details}</a></div></article>`).join('');
    const catalog=`<p class="eyebrow">FREIGHTQUOTE LITE</p><h1>${c.title}</h1><p class="lead">${c.intro}</p><div class="actions"><a class="button" href="air-parcel-guide-${lang}">${c.guide}</a><a href="help#${lang}">${c.help}</a></div><h2>${c.choose}</h2><div class="cards">${cards}</div><section class="panel" id="free-vs-paid"><h2>${c.freeTitle}</h2><p>${c.freeText}</p><h3>${c.paidTitle}</h3><p>${c.paidText}</p></section><p>${c.fitText}</p>`;
    await writeFile(join(out,`products-${lang}.html`),shell('products',lang,c.title,c.intro,catalog));
    for(const p of offers.filter(p=>p.checkout)){
      const i=p.id==='freight'?1:2;
      const checkout=new URL(p.checkout);checkout.searchParams.set('locale',lang);
      const detail=`<p><a href="products-${lang}">← ${c.catalog}</a></p><p class="eyebrow">${p.name}</p><h1>${c.goals[i]}</h1><p class="lead">${c.features[i].join(' · ')}</p><div class="actions"><a class="button" href="${p.demo}">${c.free}</a><a href="#purchase">${c.price}: JPY ${p.price.toLocaleString('en-US')}</a></div><section class="panel" id="who-it-fits"><h2>${c.fit}</h2><p>${c.fitText}</p><p>${c.limits[i-1]}</p></section><section class="panel" id="free-vs-paid"><h2>${c.freeTitle}</h2><p>${c.freeText}</p><h3>${c.paidTitle}</h3><p>${c.paidText}</p></section><details class="panel" id="first-use"><summary>${c.first}</summary><ol>${c.steps.map(s=>`<li>${s}</li>`).join('')}</ol></details><section class="panel" id="purchase"><h2>${c.order}</h2><p>${p.name} · v1.0</p><p>${c.quantity}</p><p class="price">JPY ${p.price.toLocaleString('en-US')}<small>${c.price}</small></p><p>${c.total}</p><p>${c.delivery}</p><h3>${c.refundTitle}</h3><p>${c.refund}</p><p><a href="tool-purchase-terms#${lang}">${c.terms}</a> · <a href="commerce-disclosure">${c.seller}</a> · <a href="help#${lang}">${c.help}</a></p><a class="button" href="${escape(checkout.href)}" data-checkout>${c.buy}</a></section><section class="panel"><h2>${c.recovery}</h2><p><a href="${p.id}-download">${p.name} ZIP</a> · <a href="downloads/${p.file}" download>${c.free}</a></p><p>${c.license}</p><p>${c.delivery}</p></section>`;
      await writeFile(join(out,`buy-${p.id}-${lang}.html`),shell(`buy-${p.id}`,lang,p.name+' — '+c.details,c.goals[i]+'. '+c.fitText,detail));
    }
    const guide=`<p><a href="products-${lang}">← ${c.catalog}</a></p><h1>${c.guideTitle}</h1><p class="lead">${c.guideIntro}</p><section class="panel" id="worked-example"><p class="eyebrow">${c.example}</p><h2>${c.weightTitle}</h2><p>${c.weight}</p><p><a href="https://dct.dhl.com/help" rel="noopener noreferrer">${c.source}</a></p><h2>${c.calcTitle}</h2><p>${c.calc}</p><h2>${c.scopeTitle}</h2><p>${c.scope}</p></section><p class="flag">${c.noGuarantee}</p><div class="actions"><a class="button" href="demo-freight">${c.learn}</a><a href="buy-freight-${lang}">${c.details}</a></div><p>${c.fitText}</p>`;
    await writeFile(join(out,`air-parcel-guide-${lang}.html`),shell('air-parcel-guide',lang,c.guideTitle,c.guideIntro,guide));
  }
  // Keep all existing routes and exact generic checkout URLs; add an explicit language path.
  for(const family of ['products','buy-freight','buy-solo']){
    const path=join(out,family+'.html'),html=await readFile(path,'utf8');
    if(!html.includes('</nav>'))throw new Error('Expected navigation in '+family);
    await writeFile(path,html.replace('</nav>',nav(family,'')+'</nav>'));
  }
  // The old footer link is now a real catalog, not a concept showcase.
  const home=join(out,'index.html'),html=await readFile(home,'utf8');
  await writeFile(home,html.replace('Other product concepts (preview)','Products / 产品 / 商品'));
  return routes;
}
