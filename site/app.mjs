import {calculateQuote, validateQuote, formatMoney} from './lib/calculator.mjs';

const I18N = {
  ja: {
    analyticsNotice:'運営者がCloudflare Web Analyticsを有効にすると、閲覧数・参照元・表示速度を集計します。見積内容や入力金額は送信しません。',
    navHow:'使い方',navPrivacy:'安全性',navOpen:'オープンソース',eyebrow:'FREE · NO SIGN-UP · BROWSER ONLY',
    heroTitle:'物流の見積書を、もっとシンプルに。',heroLead:'運賃・諸費用・粗利をすばやく計算。きれいな見積書を日本語・中国語・英語で作成し、PDFとして保存できます。',heroCta:'無料で見積書を作成',heroNote:'アカウント登録・カード登録不要',statLang:'対応言語',statApi:'有料APIの利用',statExport:'ブラウザから保存',
    toolLabel:'QUOTE BUILDER',toolHeading:'見積書を作成する',toolIntro:'入力内容はブラウザ内で処理され、サーバーには送信されません。',sample:'サンプルを入力',
    details:'基本情報',detailsHint:'顧客向けPDFに表示される項目です。',issuer:'発行元',issuerPlace:'会社名（任意）',customer:'宛先',customerPlace:'お客様名（任意）',origin:'出発港 / 地点',originPlace:'例：大阪',destination:'到着港 / 地点',destPlace:'例：上海',currency:'見積通貨',validity:'有効期限（任意）',
    feeItems:'費用明細',feeHint:'仕入単価は社内計算用。顧客向けPDFには表示しません。',item:'項目',quantity:'数量',cost:'仕入単価（非公開）',sell:'販売単価',addFee:'費用を追加',feeLimit:'最大50項目・同一通貨のみ',remove:'削除',descPlace:'例：海上運賃',
    calcLabel:'LIVE CALCULATION',calcTitle:'お見積りサマリー',costTotal:'仕入合計',salesTotal:'販売合計',profit:'想定粗利',margin:'売上粗利率',summaryHint:'通貨換算・税金・実際の運賃照会は含みません。',print:'見積書をPDF保存',clear:'入力内容をリセット',privateNote:'計算はこのブラウザだけ。データは自動保存しません。',
    howLabel:'WORKFLOW',howTitle:'使い方は、3ステップ。',stepOneTitle:'情報を入力',stepOneBody:'発着地、費用、販売金額を入力します。',stepTwoTitle:'利益を確認',stepTwoBody:'粗利額と売上粗利率が即座に更新されます。',stepThreeTitle:'PDFに保存',stepThreeBody:'顧客向けの見積書をブラウザの印刷機能でPDF保存します。',
    privacyLabel:'PRIVACY BY DESIGN',privacyTitle:'見積データを預かりません。',privacyCopy:'入力された会社名・費用・価格はサーバーに送信されません。ブラウザ内で計算するため、アカウントやデータベースは不要です。',trustOne:'登録不要',trustTwo:'外部AI APIなし',trustThree:'広告トラッカーなし',trustFour:'ブラウザだけで動作',
    openTitle:'無料で使える、軽量なツール。',openCopy:'最初の公開版は無料です。高度なテンプレートや企業機能の提供は、サービス準備後に検討します。',openPending:'MITライセンスで公開中。機能のご要望をお寄せください。顧客情報や実際の見積金額は投稿しないでください。',sourceLink:'ソースコード',feedbackLink:'機能をリクエスト',footerNote:'デモ・初期版。正式な運賃や契約条件を保証するものではありません。',
    printTitle:'国際物流 見積書',printedDate:'作成日',route:'輸送ルート',amount:'金額',total:'見積合計',printTerms:'参考見積りです。実際の料金、税金、輸送条件、船腹・通関・保険等の費用を保証しません。正式契約前にご確認ください。',
    noLines:'費用を1項目以上追加してください。',invalid:'入力金額、数量、項目名を確認してください。',currencyConfirm:'通貨を変更すると入力済みの金額が消えます。続行しますか？',resetConfirm:'すべての入力内容を消去しますか？',printInfo:'印刷画面で「PDFとして保存」を選択してください。',
  },
  zh: {
    analyticsNotice:'站点启用 Cloudflare Web Analytics 后，将统计页面访问、来源和加载性能；不会发送报价内容或输入金额。',
    navHow:'使用方法',navPrivacy:'隐私保护',navOpen:'开源说明',eyebrow:'免费 · 无需注册 · 浏览器直接使用',
    heroTitle:'国际物流报价，简单一点。',heroLead:'快速计算运费、各项费用与毛利。支持中文、日文和英文的客户报价单，并可通过浏览器保存为 PDF。',heroCta:'免费创建报价单',heroNote:'无需注册账号或信用卡',statLang:'界面语言',statApi:'付费 API 调用',statExport:'浏览器保存',
    toolLabel:'报价工作台',toolHeading:'创建物流报价单',toolIntro:'全部输入数据仅在当前浏览器处理，不会上传到服务器。',sample:'填入演示数据',
    details:'基础信息',detailsHint:'以下内容会显示在客户报价 PDF 中。',issuer:'报价公司',issuerPlace:'公司名称（选填）',customer:'客户名称',customerPlace:'客户名称（选填）',origin:'起运港 / 地点',originPlace:'例如：大阪',destination:'目的港 / 地点',destPlace:'例如：上海',currency:'报价币种',validity:'有效期（选填）',
    feeItems:'费用明细',feeHint:'成本价仅供内部核算，不会出现在客户 PDF 中。',item:'费用项目',quantity:'数量',cost:'单位成本（保密）',sell:'单位报价',addFee:'添加费用',feeLimit:'最多 50 项，必须使用同一币种',remove:'移除',descPlace:'例如：海运费',
    calcLabel:'实时计算',calcTitle:'报价汇总',costTotal:'总成本',salesTotal:'报价总额',profit:'预计毛利',margin:'销售毛利率',summaryHint:'不包含汇率换算、税费或实时船公司运价。',print:'打印 / 保存 PDF',clear:'清空全部内容',privateNote:'仅在浏览器内计算，不会自动保存数据。',
    howLabel:'使用流程',howTitle:'三步即可完成报价',stepOneTitle:'录入资料',stepOneBody:'输入航线、成本和销售报价。',stepTwoTitle:'核对毛利',stepTwoBody:'自动计算总利润和销售毛利率。',stepThreeTitle:'保存 PDF',stepThreeBody:'使用浏览器的打印功能保存客户版 PDF。',
    privacyLabel:'本地处理，保护隐私',privacyTitle:'我们不接收你的报价数据。',privacyCopy:'输入的公司名称、成本和价格不会发送给服务器。全部计算在浏览器本地完成，不需要注册或连接数据库。',trustOne:'无需注册',trustTwo:'不使用外部 AI API',trustThree:'没有广告追踪器',trustFour:'纯浏览器计算',
    openTitle:'轻量、免费、开源。',openCopy:'初始公开版本免费。高级模板和企业功能将在服务准备完成后再考虑推出。',openPending:'源码已按 MIT 协议公开。欢迎提出功能需求，请勿在公开反馈中填写客户资料或真实报价。',sourceLink:'查看源码',feedbackLink:'提出功能需求',footerNote:'初始演示版本；不代表真实运价，也不构成正式合同承诺。',
    printTitle:'国际物流报价单',printedDate:'报价日期',route:'运输路线',amount:'金额',total:'报价总计',printTerms:'本报价仅供参考，不保证实时运价、税费、船期、舱位、清关、保险或最终合同条件，正式承接前请另行确认。',
    noLines:'请至少添加一项费用。',invalid:'请检查费用名称、数量和金额，数量应为正整数、金额不得为负。',currencyConfirm:'切换币种会清空已输入的金额以避免错误报价，是否继续？',resetConfirm:'确定清空全部报价内容？',printInfo:'在打印对话框选择「另存为 PDF」。',
  },
  en: {
    analyticsNotice:'When enabled by the site operator, Cloudflare Web Analytics measures page views, referrals and loading performance. Quote contents and entered amounts are not sent.',
    navHow:'How it works',navPrivacy:'Privacy',navOpen:'Open source',eyebrow:'FREE · NO SIGN-UP · BROWSER ONLY',
    heroTitle:'Freight quotes, without the spreadsheet hassle.',heroLead:'Calculate freight fees, selling prices, and gross profit. Create customer-facing quotations in Japanese, Chinese or English, and save them as PDF.',heroCta:'Create a free quote',heroNote:'No sign-up or credit card needed',statLang:'Languages',statApi:'Paid API calls',statExport:'Browser PDF export',
    toolLabel:'QUOTE BUILDER',toolHeading:'Build a freight quotation',toolIntro:'Your entries are processed in your browser and never uploaded to a server.',sample:'Try sample data',
    details:'Quote details',detailsHint:'These fields appear on the customer-facing PDF.',issuer:'Issued by',issuerPlace:'Your company (optional)',customer:'Customer',customerPlace:'Customer name (optional)',origin:'Origin port / place',originPlace:'e.g. Osaka',destination:'Destination port / place',destPlace:'e.g. Shanghai',currency:'Quote currency',validity:'Valid until (optional)',
    feeItems:'Fee items',feeHint:'Your cost is internal only and is never shown in the customer PDF.',item:'Description',quantity:'Qty',cost:'Unit cost (private)',sell:'Unit price',addFee:'Add fee line',feeLimit:'Up to 50 lines · one currency',remove:'Remove',descPlace:'e.g. Ocean freight',
    calcLabel:'LIVE CALCULATION',calcTitle:'Quote summary',costTotal:'Total cost',salesTotal:'Quoted amount',profit:'Gross profit',margin:'Gross margin',summaryHint:'No FX conversion, tax calculation, or live carrier-rate lookup.',print:'Print / save PDF',clear:'Reset all fields',privateNote:'Calculations stay in this browser. Nothing is auto-saved.',
    howLabel:'WORKFLOW',howTitle:'Three simple steps',stepOneTitle:'Enter details',stepOneBody:'Add your route, costs, and selling prices.',stepTwoTitle:'Check your margin',stepTwoBody:'Review gross profit and gross margin instantly.',stepThreeTitle:'Save as PDF',stepThreeBody:'Use your browser print function to save a customer-facing PDF.',
    privacyLabel:'PRIVACY BY DESIGN',privacyTitle:'We never receive your quote data.',privacyCopy:'Company names, costs, and prices are not sent to any server. All calculations happen locally in your browser, with no account or database needed.',trustOne:'No registration',trustTwo:'No AI API calls',trustThree:'No ad trackers',trustFour:'Browser-only processing',
    openTitle:'Lightweight, free, and open.',openCopy:'The first public version is free. Optional premium templates and company features may follow after the service is ready.',openPending:'Source is available under MIT. Request improvements without posting customer details or real quotation amounts.',sourceLink:'View source',feedbackLink:'Request a feature',footerNote:'Early demonstration. Figures are not live market rates or binding contractual terms.',
    printTitle:'FREIGHT QUOTATION',printedDate:'Issue date',route:'Shipping route',amount:'Amount',total:'Quotation total',printTerms:'This is an indicative quote only. Rates, taxes, capacity, customs, insurance and final terms must be confirmed before contracting.',
    noLines:'Add at least one fee.',invalid:'Check fee descriptions, quantities, and prices. Quantity must be positive and prices nonnegative.',currencyConfirm:'Changing currency clears entered amounts to prevent misquoting. Continue?',resetConfirm:'Clear all quotation details?',printInfo:'In the print dialog, choose “Save as PDF”.',
  },
};
const $ = (id) => document.getElementById(id);
const fields = ['issuer','customer','origin','destination','validity'];
const localeFormat = {ja:'ja-JP',zh:'zh-CN',en:'en-US'};
const state = {locale:'ja',currency:'JPY',rows:[{id:1,description:'',qty:'1',cost:'',sell:''}],nextId:2};
const t = (key) => I18N[state.locale][key] ?? key;
const money = (minor) => formatMoney(minor,state.currency,localeFormat[state.locale]);

function renderLanguage() {
  document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : state.locale;
  document.title = ({ja:'FreightQuote Lite | 無料の国際物流見積書ツール',zh:'FreightQuote Lite | 免费国际物流报价单工具',en:'FreightQuote Lite | Free freight quotation maker'})[state.locale];
  document.querySelector('meta[name=description]').content = ({ja:'国際物流の見積書を無料で作成。ブラウザで運賃と利益を計算し、顧客向けPDFを保存。登録不要・データ送信なし。',zh:'免费的国际货运报价单生成器。浏览器内计算物流费用和毛利，生成客户版 PDF，无需注册，不上传报价数据。',en:'Free freight quotation generator. Calculate logistics pricing and profit in your browser and print a customer PDF. No sign-up or uploads.'})[state.locale];
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('.lang').forEach((b) => {
    const active = b.dataset.locale === state.locale;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  });
}

function element(tag, cls, text = undefined) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderRows() {
  const root = $('line-list');
  root.replaceChildren();
  state.rows.forEach((row,i) => {
    const container = element('div','line-row');
    container.dataset.lineId = String(row.id);
    for (const field of ['description','qty','cost','sell']) {
      const input = element('input','line-input');
      input.dataset.field = field;
      input.value = row[field];
      input.autocomplete = 'off';
      input.setAttribute('aria-label',`${t(field === 'description' ? 'item' : field === 'qty' ? 'quantity' : field === 'cost' ? 'cost' : 'sell')} ${i+1}`);
      if (field === 'description') {
        input.type='text';input.maxLength=120;input.placeholder=t('descPlace');
      } else if (field === 'qty') {
        input.type='number';input.min='1';input.max='999999';input.step='1';input.inputMode='numeric';
      } else {
        input.type='text';input.inputMode='decimal';input.placeholder='0';
      }
      container.append(input);
    }
    const remove = element('button','remove-line','×');
    remove.type='button';remove.dataset.removeId=String(row.id);
    remove.setAttribute('aria-label',`${t('remove')} ${i+1}`);
    container.append(remove);
    root.append(container);
  });
}

function invalidatePrint() { $('print-sheet').replaceChildren(); }

function setError(message) {
  const el=$('validation');
  el.textContent = message ?? '';
  el.hidden = !message;
}
function renderSummary() {
  invalidatePrint();
  try {
    const q = calculateQuote(state.rows, state.currency, {allowBlank:true});
    $('cost-value').textContent=money(q.costMinor);
    $('revenue-value').textContent=money(q.revenueMinor);
    $('profit-value').textContent=money(q.profitMinor);
    $('profit-value').classList.toggle('negative',q.profitMinor<0);
    $('margin-value').textContent=q.marginPct.toFixed(2)+'%';
    setError(null);
  } catch (_) {
    $('cost-value').textContent='—';
    $('revenue-value').textContent='—';
    $('profit-value').textContent='—';
    $('margin-value').textContent='—';
    setError(t('invalid'));
  }
}

function stampDate(value) {
  if (!value) return '—';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
  if (!iso) return '—';
  const parsed = new Date(iso+'T12:00:00');
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat(localeFormat[state.locale],{year:'numeric',month:'short',day:'numeric'}).format(parsed);
}
function valOrDash(id) {return $(id).value.trim() || '—';}

function infoPair(grid,label,value) {
  const wrap=element('div');
  wrap.append(element('span','p-label',label),element('span','p-value',value));
  grid.append(wrap);
}
function renderPrint(quote) {
  const root=$('print-sheet');
  root.replaceChildren();
  const head=element('div','p-head');
  const brand=element('div','p-brand','FreightQuote Lite');
  brand.append(element('span','', ' · quotation'));
  const ref=element('div','p-ref',t('printedDate')+'\n'+stampDate((() => {const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})()));
  head.append(brand,ref);
  root.append(head,element('h1','p-title',t('printTitle')));
  const info=element('div','p-info');
  infoPair(info,t('issuer'),valOrDash('issuer'));
  infoPair(info,t('customer'),valOrDash('customer'));
  const route = `${valOrDash('origin')}  →  ${valOrDash('destination')}`;
  infoPair(info,t('route'),route);
  infoPair(info,t('validity'),stampDate($('validity').value));
  infoPair(info,t('currency'),state.currency);
  root.append(info);
  const table=element('table','p-table');
  const thead=element('thead');const htr=element('tr');
  for (const [label,right] of [[t('item'),false],[t('quantity'),true],[t('sell'),true],[t('amount'),true]]) {
    htr.append(element('th',right?'num':'',label));
  }
  thead.append(htr);table.append(thead);
  const tbody=element('tbody');
  for (const line of quote.lines) {
    const tr=element('tr');
    tr.append(element('td','',line.description),element('td','num',String(line.qty)),element('td','num',money(line.sellEachMinor)),element('td','num',money(line.sellTotalMinor)));
    tbody.append(tr);
  }
  table.append(tbody);
  root.append(table);
  const total=element('div','p-total');total.append(element('span','',t('total')),document.createTextNode(money(quote.revenueMinor)));
  root.append(total,element('p','p-notes',t('printTerms')));
}

for(const id of fields){$(id).addEventListener('input',()=>{invalidatePrint();setError(null);});}
$('line-list').addEventListener('input',(event)=>{
  const target=event.target;
  if (!(target instanceof HTMLInputElement) || !target.dataset.field) return;
  const container=target.closest('[data-line-id]');
  const row=state.rows.find(r=>r.id===Number(container?.dataset.lineId));
  if(!row) return;
  row[target.dataset.field]=target.value;
  renderSummary();
});
$('line-list').addEventListener('click',(event)=>{
  const remove=event.target.closest('[data-remove-id]');
  if(!remove) return;
  state.rows=state.rows.filter(r=>r.id!==Number(remove.dataset.removeId));
  renderRows();renderSummary();
});
$('add-line').addEventListener('click',()=>{
  if(state.rows.length>=50){setError(t('feeLimit'));return;}
  state.rows.push({id:state.nextId++,description:'',qty:'1',cost:'',sell:''});
  renderRows();renderSummary();
});
$('currency').addEventListener('change',(event)=>{
  const desired=event.target.value;
  if(desired===state.currency)return;
  const entered=state.rows.some(row=>row.cost.trim()!==''||row.sell.trim()!=='');
  if(entered && !window.confirm(t('currencyConfirm'))){event.target.value=state.currency;return;}
  state.currency=desired;
  state.rows.forEach(row=>{row.cost='';row.sell='';});
  renderRows();renderSummary();
});
$('sample-button').addEventListener('click',()=>{
  const examples={JPY:[['Ocean freight','48000','61000'],['Handling','7500','11000'],['Documentation','3500','5500']],USD:[['Ocean freight','400.00','520.00'],['Handling','60.00','85.00'],['Documentation','30.00','45.00']],CNY:[['Ocean freight','3500.00','4600.00'],['Handling','480.00','620.00'],['Documentation','220.00','300.00']]};
  state.rows=examples[state.currency].map(([description,cost,sell])=>({id:state.nextId++,description,qty:'1',cost,sell}));
  $('issuer').value='Demo Logistics';$('customer').value='Example Customer';$('origin').value='Osaka';$('destination').value='Shanghai';
  $('validity').value='';
  renderRows();renderSummary();
  $('tool').scrollIntoView({behavior:'smooth',block:'start'});
});
$('clear-button').addEventListener('click',()=>{
  if(!window.confirm(t('resetConfirm')))return;
  for(const id of fields)$(id).value='';
  state.rows=[{id:state.nextId++,description:'',qty:'1',cost:'',sell:''}];
  renderRows();renderSummary();
});
$('print-button').addEventListener('click',()=>{
  const result=validateQuote(state.rows,state.currency);
  if(!result.ok){setError(t('invalid'));return;}
  renderPrint(result.quote);
  window.print();
});
window.addEventListener('beforeprint',()=>{
  const result=validateQuote(state.rows,state.currency);
  if(result.ok) renderPrint(result.quote);
  else $('print-sheet').replaceChildren(element('p','p-notes',t('invalid')));
});
document.querySelectorAll('.lang').forEach(button=>button.addEventListener('click',()=>{
  state.locale=button.dataset.locale;
  renderLanguage();renderRows();renderSummary();
}));

renderLanguage();renderRows();renderSummary();
