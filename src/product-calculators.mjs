// Exact decimal input -> integers. Monetary arithmetic is always whole JPY.
function fixed(value,places,max=1000000){
  const s=String(value).trim();
  if(!new RegExp(`^\\d+(?:\\.\\d{1,${places || 1}})?$`).test(s) || (!places && s.includes('.')))
    throw new Error('数値を正しい桁数で入力してください。请检查数字及小数位。');
  const [a,b='']=s.split('.');
  const n=BigInt(a)*10n**BigInt(places)+BigInt(b.padEnd(places,'0')||'0');
  if(n>BigInt(max)*10n**BigInt(places)) throw new Error('入力が上限を超えています。输入超出上限。');
  return n;
}
const ceil=(a,b)=>(a+b-1n)/b;
function positive(n){if(n===0n)throw new Error('寸法・数量・換算係数・丸め幅は0より大きくしてください。');return n;}
function money(n){if(n>1000000000000n)throw new Error('計算額が上限を超えています。');return Number(n);}
function kilograms(g){return `${g/1000n}.${String(g%1000n).padStart(3,'0')}`;}
function sell(cost,margin){const m=fixed(margin,2,99);return ceil(cost*10000n,10000n-m);}
export function freight(v){
  const volume=positive(fixed(v.length,2,1000))*positive(fixed(v.width,2,1000))*positive(fixed(v.height,2,1000))*positive(fixed(v.cartons,0,10000));
  const dimensional=ceil(volume,positive(fixed(v.divisor,0,10000))*1000n);
  const actual=fixed(v.weight,3,1000000), step=positive(fixed(v.step,3,1000));
  const chargeable=ceil(actual>dimensional?actual:dimensional,step)*step;
  const cost=ceil(chargeable*fixed(v.rate,0,1000000),1000n)+fixed(v.local,0,100000000);
  const price=sell(cost,v.margin);
  // cm values are hundredths: cm^3 / 1e12 = m^3; show 3 decimals rounded up.
  const milliM3=ceil(volume,1000000000n);
  return {volume:kilograms(milliM3),dimensional:kilograms(dimensional),chargeable:kilograms(chargeable),cost:money(cost),price:money(price),profit:money(price-cost)};
}
export function service(v){
  const hours=fixed(v.hours,2,10000)+fixed(v.revision,2,10000);
  const cost=ceil(hours*fixed(v.rate,0,1000000),100n)+fixed(v.expenses,0,100000000);
  const price=sell(cost,v.margin), deposit=ceil(price*fixed(v.deposit,2,100),10000n);
  return {cost:money(cost),price:money(price),profit:money(price-cost),deposit:money(deposit),balance:money(price-deposit)};
}
export function csvCell(value){
  let s=String(value);
  if(/^[\s]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
}
