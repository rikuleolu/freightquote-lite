import {freight,service,csvCell} from './lib/product-calculators.mjs';
const form=document.querySelector('#tool');
const kind=document.body.dataset.kind;
const inputs=[...form.querySelectorAll('input')];
let latest=null;
const yen=n=>'JPY '+n.toLocaleString('en-US');
function render(){
  const data=Object.fromEntries(inputs.map(i=>[i.name,i.value]));
  latest=null;
  document.querySelector('#error').textContent='';
  try{
    const r=kind==='freight'?freight(data):service(data);
    latest={data,r};
    for(const [key,value] of Object.entries(r)){
      const target=document.querySelector(`[data-result="${key}"]`);
      if(target)target.textContent=typeof value==='number'?yen(value):value;
    }
    document.querySelector('#customer-name').textContent=data.customer || '—';
    document.querySelector('#project-name').textContent=data.project || '—';
    document.querySelector('#customer-price').textContent=yen(r.price);
    for(const b of document.querySelectorAll('[data-output]'))b.disabled=false;
  }catch(e){
    document.querySelector('#error').textContent=e.message;
    for(const el of document.querySelectorAll('[data-result],#customer-price'))el.textContent='—';
    for(const b of document.querySelectorAll('[data-output]'))b.disabled=true;
  }
}
function download(text,name,type){
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
form.addEventListener('input',render);
form.addEventListener('submit',e=>e.preventDefault());
document.querySelector('#export').addEventListener('click',()=>{
  if(!latest)return;
  const {data,r}=latest;
  // Only customer-facing fields; internal costs and margin are never exported.
  const rows=[['Customer','Project','Currency','Estimated amount before tax'],[data.customer,data.project,'JPY',r.price]];
  download('\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),`${kind}-customer-quote.csv`,'text/csv;charset=utf-8');
});
document.querySelector('#print').addEventListener('click',()=>{if(latest)window.print();});
document.querySelector('#reset').addEventListener('click',()=>{
  if(!confirm('入力をサンプルに戻しますか？重置为示例会清除当前输入。'))return;
  for(const i of inputs)i.value=i.dataset.sample;
  render();
});
const save=document.querySelector('#save-copy');
if(save)save.addEventListener('click',()=>{
  if(!latest)return;
  const clone=document.documentElement.cloneNode(true);
  for(const input of inputs)clone.querySelector(`[name="${input.name}"]`).setAttribute('value',input.value);
  download('<!doctype html>\n'+clone.outerHTML,`${kind}-saved.html`,'text/html;charset=utf-8');
});
render();
