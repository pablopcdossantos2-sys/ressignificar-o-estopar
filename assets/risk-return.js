(() => {
"use strict";
const app=document.querySelector(".rr-app");
if(!app)return;
const isEnglish=document.documentElement.lang==="en";
const tr=(pt,en)=>isEnglish?en:pt;
const locale=isEnglish?"en-US":"pt-BR";
const $=id=>document.getElementById(id);
const moneyFmt=new Intl.NumberFormat(locale,{style:"currency",currency:"BRL"});
const money=v=>moneyFmt.format(v);
const fmt=(v,d)=>{d=d==null?2:d;return Number(v).toLocaleString(locale,{minimumFractionDigits:d,maximumFractionDigits:d})};
const num2=x=>Number(x.toFixed(2)).toLocaleString(locale);
const sgn=v=>(v>=0?"+":"−")+money(Math.abs(v));
const pct=p=>fmt(p*100,p<0.1&&p>0?1:0)+"%";
const compact=v=>{const a=Math.abs(v),s=v<0?"−":"";if(a>=1e6)return s+"R$ "+fmt(a/1e6,1)+" "+tr("mi","M");if(a>=1e4)return s+"R$ "+fmt(a/1e3,1)+" "+tr("mil","K");return s+"R$ "+fmt(a,0)};
const INST={
  WINFUT:{pv:0.20,tick:5,margin:100,tip:tr("Tick de 5 pts = R$ 1,00","5-point tick = R$ 1.00")},
  WDOFUT:{pv:10,tick:0.5,margin:300,tip:tr("Tick de 0,5 pt = R$ 5,00","0.5-point tick = R$ 5.00")},
  BIT:{pv:null,tick:5,margin:1000,tip:tr("0,1 BTC × dólar. Tick de 5 pts","0.1 BTC × USD/BRL. 5-point tick")}
};
const ROWS=[];
for(let a=9;a>=1;a--)ROWS.push({a,b:1});
for(let b=2;b<=9;b++)ROWS.push({a:1,b});
const WINS=[.1,.2,.3,.4,.5,.6,.7,.8,.9];
let P=null,sel={r:0,c:3},seed=20260101;
function readNum(id,def,min,max){
  let v=parseFloat(String($(id).value).replace(",","."));
  if(!Number.isFinite(v))v=def;
  if(min!=null&&v<min)v=min;
  if(max!=null&&v>max)v=max;
  return v;
}
function read(){
  const p={};
  p.inst=$("instr").value;p.tick=INST[p.inst].tick;
  p.n=Math.max(1,Math.round(readNum("n",1,1)));
  p.stop=readNum("stop",100,.0001);p.target=readNum("target",200,.0001);
  p.capital=readNum("capital",1000,0);p.trades=Math.round(readNum("trades",200,10,2000));
  p.pv=readNum("pv",.2,0);p.margin=readNum("margem",0,0);p.cost=readNum("custo",0,0);
  p.mode=document.querySelector('input[name="mode"]:checked').value;p.legend=$("legend").value;p.ruinLevel=p.margin*p.n;
  return p;
}
function rng(s){let a=s>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function rowAt(i){return i===0?{custom:true}:ROWS[i-1]}
function ratioLabel(S,T){return T>=S?"1:"+num2(T/S):num2(S/T)+":1"}
function rowLabel(row){return row.custom?ratioLabel(P.stop,P.target):row.a+":"+row.b}
function scen(row){
  let S,T;
  if(row.custom){S=P.stop;T=P.target}
  else if(P.mode==="stop"){S=P.stop;T=S*row.b/row.a}
  else{T=P.target;S=T*row.a/row.b}
  return{S,T,win:T*P.pv*P.n-P.cost*P.n,loss:S*P.pv*P.n+P.cost*P.n};
}
function expect(sc,w){return w*sc.win-(1-w)*sc.loss}
function classify(sc,w){
  const E=expect(sc,w),g=Math.abs(sc.win)+Math.abs(sc.loss);
  if(g<=0)return"be";
  if(Math.abs(E)<=.005*g)return"be";
  return E>0?"ok":"bad";
}
function sim(w,sc,r,keep,stopAtRuin){
  const N=P.trades;let eq=P.capital,peak=eq,mdd=0,ruined=-1,eqRuin=null,streak=0,maxS=0;
  const path=keep?new Float64Array(N+1):null;if(keep)path[0]=eq;
  for(let i=1;i<=N;i++){
    if(ruined<0&&eq<P.ruinLevel){ruined=i-1;eqRuin=eq}
    if(stopAtRuin&&ruined>=0){if(keep)path[i]=eq;continue}
    if(r()<w){eq+=sc.win;streak=0}else{eq-=sc.loss;streak++;if(streak>maxS)maxS=streak}
    if(eq>peak)peak=eq;
    const dd=peak-eq;if(dd>mdd)mdd=dd;
    if(keep)path[i]=eq;
  }
  if(ruined<0&&eq<P.ruinLevel){ruined=N;eqRuin=eq}
  return{path,ruined,final:ruined>=0?eqRuin:eq,mdd,maxS};
}
function q(arr,p){return arr[Math.min(arr.length-1,Math.floor(p*arr.length))]}
function mc(w,sc,M,s){
  const r=rng(s),fin=[],mdd=[],st=[];let ruin=0;
  for(let k=0;k<M;k++){const o=sim(w,sc,r,false,false);if(o.ruined>=0)ruin++;fin.push(o.final);mdd.push(o.mdd);st.push(o.maxS)}
  fin.sort((a,b)=>a-b);mdd.sort((a,b)=>a-b);st.sort((a,b)=>a-b);
  return{pRuin:ruin/M,fin,mdd,st};
}
function ruinOnly(w,sc,M,s){const r=rng(s);let c=0;for(let k=0;k<M;k++)if(sim(w,sc,r,false,false).ruined>=0)c++;return c/M}
function renderSummary(){
  const me=scen({custom:true}),g=me.win+me.loss,wbe=g>0?me.loss/g:NaN,rp=P.capital>0?me.loss/P.capital:Infinity;
  $("sum").innerHTML=
    '<div><small>'+tr("Perda no stop","Loss at stop")+'</small><b>'+money(me.loss)+'</b></div>'+
    '<div><small>'+tr("Ganho no alvo","Gain at target")+'</small><b>'+money(me.win)+'</b></div>'+
    '<div><small>'+tr("Risco:Retorno","Risk:Reward")+'</small><b>'+ratioLabel(P.stop,P.target)+'</b></div>'+
    '<div><small>'+tr("Acerto de equilíbrio (com custos)","Breakeven win rate (incl. costs)")+'</small><b>'+(Number.isFinite(wbe)?pct(wbe):"—")+'</b></div>'+
    '<div><small>'+tr("Cada stop = % do capital","Each stop = % of capital")+'</small><b>'+(Number.isFinite(rp)?fmt(rp*100,1)+"%":"—")+'</b></div>'+
    '<div><small>'+tr("Margem total exigida","Total required margin")+'</small><b>'+money(P.ruinLevel)+'</b></div>';
}
function renderTable(){
  const t=$("tbl");let h='<thead><tr><th class="corner">'+tr("Risco:Retorno ↓ &nbsp;Acerto →","Risk:Reward ↓ &nbsp;Win rate →")+'</th>';
  WINS.forEach(w=>h+="<th>"+Math.round(w*100)+"%</th>");h+="</tr></thead><tbody>";
  const M=Math.max(40,Math.min(200,Math.floor(2e7/(162*P.trades))));
  for(let i=0;i<=ROWS.length;i++){
    const row=rowAt(i),sc=scen(row);
    h+='<tr'+(i===0?' class="custom"':'')+'><th class="rowh">'+(i===0?tr("Seu: ","Your: "):"")+rowLabel(row)+"</th>";
    for(let c=0;c<WINS.length;c++){
      const w=WINS[c],cls=classify(sc,w);let txt="";
      if(P.legend==="exp"){const E=expect(sc,w);txt=(E>=0?"+":"−")+fmt(Math.abs(E),Math.abs(E)<10?1:0)}
      else if(P.legend==="ruina")txt=Math.round(ruinOnly(w,sc,M,1000+i*13+c)*100)+"%";
      h+='<td><button type="button" class="'+cls+(sel.r===i&&sel.c===c?" sel":"")+'" data-r="'+i+'" data-c="'+c+'" title="'+rowLabel(row)+" · "+tr("acerto ","win rate ")+Math.round(w*100)+'%">'+txt+"</button></td>";
    }
    h+="</tr>";
  }
  t.innerHTML=h+"</tbody>";
}
let chartData=null;
function renderDetail(){
  const row=rowAt(sel.r),sc=scen(row),w=WINS[sel.c],E=expect(sc,w),cls=classify(sc,w);
  const st=mc(w,sc,1000,987654),mddMed=q(st.mdd,.5),mdd95=q(st.mdd,.95),required=P.ruinLevel+mdd95;
  $("scenTitle").textContent=tr("Risco:Retorno ","Risk:Reward ")+rowLabel(row)+" · "+tr("Acerto ","Win rate ")+Math.round(w*100)+"% · Stop "+num2(sc.S)+" pts ("+money(sc.S*P.pv*P.n)+") · "+tr("Alvo ","Target ")+num2(sc.T)+" pts ("+money(sc.T*P.pv*P.n)+") · "+P.n+" "+tr("contrato(s) de ","contract(s) of ")+P.inst;
  const parts=[];let a;const rp=P.capital>0?sc.loss/P.capital:Infinity;
  if(P.capital<P.ruinLevel){
    a=["danger","<strong>⚠ "+tr("Capital insuficiente.","Insufficient capital.")+"</strong> "+tr("A margem exigida para ","The required margin for ")+P.n+" "+tr("contrato(s) é ","contract(s) is ")+money(P.ruinLevel)+" "+tr("e você pretende manter ","but your planned capital is ")+money(P.capital)+". "+tr("Não é possível operar essa quantidade. Capital mínimo recomendado para este cenário: ","This number of contracts cannot be traded at that capital level. Suggested minimum capital for this scenario: ")+"<strong>"+money(required)+"</strong>."];
  }else if(cls==="bad"){
    a=["danger","<strong>⚠ "+tr("Expectativa negativa (","Negative expectancy (")+sgn(E)+tr(" por operação)."," per trade).")+"</strong> "+tr("Mesmo com bastante capital, a tendência é a conta perder dinheiro. Em ","Even with substantial capital, the account tends to lose money. In ")+pct(st.pRuin)+tr(" das 1.000 simulações a conta quebrou em "," of 1,000 simulations, the account fell below the margin requirement within ")+P.trades+tr(" operações."," trades.")];
  }else if(cls==="be"){
    a=["warn","<strong>"+tr("Expectativa próxima de zero (","Expectancy near zero (")+sgn(E)+tr(" por operação)."," per trade).")+"</strong> "+tr("Qualquer custo adicional ou piora na taxa de acerto vira prejuízo. Em ","Any additional cost or decline in win rate can turn the result negative. In ")+pct(st.pRuin)+tr(" das simulações a conta quebrou."," of simulations, the account fell below the margin requirement.")];
  }else if(st.pRuin>=.05){
    a=["danger","<strong>⚠ "+tr("Possível quebra da conta.","Possible account ruin.")+"</strong> "+tr("Com ","With ")+money(P.capital)+" "+tr("e ","and ")+P.n+" "+tr("contrato(s), a conta quebrou em ","contract(s), the account fell below margin in ")+ "<strong>"+pct(st.pRuin)+"</strong> "+tr("das 1.000 simulações de ","of 1,000 simulations of ")+P.trades+tr(" operações, apesar da expectativa positiva ("," trades, despite positive expectancy (")+sgn(E)+tr("/op). Capital recomendado (95%): ","/trade). Suggested capital (95%): ")+"<strong>"+money(required)+"</strong>.";
  }else if(P.capital<required){
    a=["warn","<strong>"+tr("Capital abaixo do recomendado.","Capital below the suggested level.")+"</strong> "+tr("A probabilidade de quebra é de ","Ruin probability is ")+pct(st.pRuin)+tr(", mas em 5% das sequências o drawdown passa de ","; however, in 5% of sequences, maximum drawdown exceeds ")+money(mdd95)+". "+tr("Capital recomendado (95%): ","Suggested capital (95%): ")+ "<strong>"+money(required)+"</strong>."];
  }else{
    a=["ok","<strong>"+tr("Capital suficiente neste modelo.","Capital sufficient in this model.")+"</strong> "+tr("Probabilidade de quebra de ","Ruin probability of ")+pct(st.pRuin)+" "+tr("em ","over ")+P.trades+tr(" operações. Capital recomendado (95%): "," trades. Suggested capital (95%): ")+money(required)+"."];
  }
  parts.push('<div class="rr-alert '+a[0]+'">'+a[1]+"</div>");
  if(Number.isFinite(rp)&&rp>.02&&P.capital>=P.ruinLevel){
    parts.push('<div class="rr-alert warn">'+tr("Cada stop custa ","Each stop costs ")+"<strong>"+fmt(rp*100,1)+"%</strong> "+tr("do capital. A referência comum de gestão de risco é de 1% a 2% por operação.","of your capital. A common risk-management reference is 1%–2% per trade.")+"</div>");
  }
  const tk=P.tick,notes=[];
  [["stop",sc.S],["alvo",sc.T]].forEach(x=>{const k=x[1]/tk;if(Math.abs(k-Math.round(k))>1e-6)notes.push((x[0]==="alvo"?tr("alvo","target"):x[0])+" "+tr("de ","of ")+num2(x[1])+" pts")});
  if(notes.length&&!row.custom)parts.push('<div class="rr-alert warn">'+tr("Neste quadrado o ","In this cell, the ")+notes.join(" "+tr("e o ","and the "))+tr(" não é múltiplo do tick ("," is not a multiple of the tick (")+tk+tr(" pts). Na prática será preciso arredondar a ordem, e a razão real mudará um pouco."," points). In practice, the order must be rounded and the actual ratio will change slightly.")+"</div>");
  $("alert").innerHTML=parts.join("");
  $("stats").innerHTML=
    '<div><small>'+tr("Expectativa por operação","Expectancy per trade")+'</small><b>'+sgn(E)+'</b></div>'+
    '<div><small>'+tr("Expectativa em ","Expectancy over ")+P.trades+tr(" operações"," trades")+'</small><b>'+sgn(E*P.trades)+'</b></div>'+
    '<div><small>'+tr("Acerto de equilíbrio","Breakeven win rate")+'</small><b>'+((sc.win+sc.loss)>0?pct(sc.loss/(sc.win+sc.loss)):"—")+'</b></div>'+
    '<div><small>'+tr("Probabilidade de quebra","Ruin probability")+'</small><b>'+pct(st.pRuin)+'</b></div>'+
    '<div><small>'+tr("Capital recomendado (95%)","Suggested capital (95%)")+'</small><b>'+money(required)+'</b></div>'+
    '<div><small>'+tr("Drawdown máx. (mediana / 95%)","Max drawdown (median / 95th pct.)")+'</small><b>'+compact(mddMed)+" / "+compact(mdd95)+"</b></div>'+
    '<div><small>'+tr("Maior sequência de perdas (mediana / 95%)","Longest losing streak (median / 95th pct.)")+'</small><b>'+q(st.st,.5)+" / "+q(st.st,.95)+"</b></div>'+
    '<div><small>'+tr("Capital final (5% / mediana / 95%)","Final capital (5th pct. / median / 95th pct.)")+'</small><b style="font-size:.9rem">'+compact(q(st.fin,.05))+" / "+compact(q(st.fin,.5))+" / "+compact(q(st.fin,.95))+"</b></div>";
  const main=sim(w,sc,rng(seed),true,true),alts=[];
  for(let k=0;k<40;k++)alts.push(sim(w,sc,rng(seed*7919+k+1),true,true));
  const exp=new Float64Array(P.trades+1);
  for(let i=0;i<=P.trades;i++)exp[i]=P.capital+i*E;
  chartData={main,alts,exp,pRuin:st.pRuin,N:P.trades,start:P.capital,ruin:P.ruinLevel,E};
  drawChart();
}
function cssv(n){return getComputedStyle(app).getPropertyValue(n).trim()}
function drawChart(){
  if(!chartData)return;
  const d=chartData,cv=$("chart"),dpr=window.devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;
  if(!W||!H)return;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  const L=78,R=16,T=18,B=34,N=d.N,showAlts=$("showAlts").checked;
  let mn=Math.min(d.start,d.ruin),mx=Math.max(d.start,d.ruin);
  const scan=arr=>{for(let i=0;i<arr.length;i++){if(arr[i]<mn)mn=arr[i];if(arr[i]>mx)mx=arr[i]}};
  scan(d.main.path);scan(d.exp);if(showAlts)d.alts.forEach(o=>scan(o.path));
  const pad=(mx-mn)*.06||1;mn-=pad;mx+=pad;
  const X=i=>L+(i/N)*(W-L-R),Y=v=>T+(1-(v-mn)/(mx-mn))*(H-T-B),yr=Y(d.ruin);
  if(yr<H-B){c.fillStyle="rgba(227,6,19,.09)";c.fillRect(L,Math.max(T,yr),W-L-R,(H-B)-Math.max(T,yr))}
  c.font="11px system-ui";c.textBaseline="middle";c.textAlign="right";c.strokeStyle=cssv("--rr-grid");c.fillStyle=cssv("--rr-axis");c.lineWidth=1;
  for(let g=0;g<=5;g++){const v=mn+(mx-mn)*g/5,y=Y(v);c.beginPath();c.moveTo(L,y);c.lineTo(W-R,y);c.stroke();c.fillText(compact(v),L-8,y)}
  c.textAlign="center";c.textBaseline="top";
  for(let gx=0;gx<=5;gx++){const xi=Math.round(N*gx/5);c.fillText(String(xi),X(xi),H-B+8)}
  c.textAlign="right";c.fillText(tr("operações","trades"),W-R,H-B+8);
  if(showAlts)d.alts.forEach(o=>{c.strokeStyle=o.ruined>=0?"rgba(227,6,19,.35)":cssv("--rr-alt");c.lineWidth=1;c.beginPath();for(let i=0;i<=N;i++){const x=X(i),y=Y(o.path[i]);if(i===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke()});
  c.setLineDash([2,4]);c.strokeStyle="#98a2b3";c.lineWidth=1;c.beginPath();c.moveTo(L,Y(d.start));c.lineTo(W-R,Y(d.start));c.stroke();
  c.setLineDash([8,5]);c.strokeStyle="#34a853";c.lineWidth=2;c.beginPath();c.moveTo(X(0),Y(d.exp[0]));c.lineTo(X(N),Y(d.exp[N]));c.stroke();
  c.setLineDash([6,4]);c.strokeStyle="#e30613";c.lineWidth=2;c.beginPath();c.moveTo(L,yr);c.lineTo(W-R,yr);c.stroke();c.setLineDash([]);
  c.fillStyle=cssv("--rr-redtext");c.textAlign="left";c.textBaseline=yr<T+16?"top":"bottom";c.fillText(tr("Limite de quebra: ","Margin threshold: ")+money(d.ruin),L+6,yr+(yr<T+16?4:-4));
  c.strokeStyle=cssv("--rr-main");c.lineWidth=2.4;c.beginPath();for(let j=0;j<=N;j++){const xx=X(j),yy=Y(d.main.path[j]);if(j===0)c.moveTo(xx,yy);else c.lineTo(xx,yy)}c.stroke();
  if(d.main.ruined>=0){const rx=X(d.main.ruined),ry=Y(d.main.path[d.main.ruined]);c.strokeStyle="#e30613";c.lineWidth=3;c.beginPath();c.moveTo(rx-6,ry-6);c.lineTo(rx+6,ry+6);c.moveTo(rx+6,ry-6);c.lineTo(rx-6,ry+6);c.stroke();c.fillStyle=cssv("--rr-redtext");c.font="bold 12px system-ui";c.textAlign=rx>W-120?"right":"left";c.textBaseline="bottom";c.fillText(tr("CONTA QUEBROU","ACCOUNT RAN OUT OF MARGIN")+" ("+tr("op.","trade ")+d.main.ruined+")",rx+(rx>W-120?-10:10),ry-6)}
  if(d.pRuin>=.05||P.capital<P.ruinLevel){const txt=P.capital<P.ruinLevel?tr("CAPITAL INSUFICIENTE PARA A MARGEM","INSUFFICIENT CAPITAL FOR MARGIN"):tr("RISCO DE QUEBRA: ","RUIN RISK: ")+pct(d.pRuin);c.font="bold 13px system-ui";const tw=c.measureText(txt).width+20;c.fillStyle="#e30613";c.fillRect(L+8,T+6,tw,26);c.fillStyle="#fff";c.textAlign="left";c.textBaseline="middle";c.fillText(txt,L+18,T+19)}
}
function applyInstrument(){
  const k=$("instr").value,i=INST[k];
  $("usdwrap").style.display=k==="BIT"?"flex":"none";
  $("pv").value=k==="BIT"?.1*readNum("usd",5.5,0):i.pv;
  $("margem").value=i.margin;$("tickhint").textContent=i.tip;
}
function update(){P=read();renderSummary();renderTable();renderDetail()}
$("instr").addEventListener("change",()=>{applyInstrument();update()});
$("usd").addEventListener("input",()=>{if($("instr").value==="BIT")$("pv").value=.1*readNum("usd",5.5,0);update()});
["n","stop","target","capital","trades","pv","margem","custo","legend"].forEach(id=>{$(id).addEventListener("input",update);$(id).addEventListener("change",update)});
document.querySelectorAll('input[name="mode"]').forEach(e=>e.addEventListener("change",update));
$("tbl").addEventListener("click",e=>{const b=e.target.closest("button[data-r]");if(!b)return;sel={r:+b.dataset.r,c:+b.dataset.c};renderTable();renderDetail();$("detalhe").scrollIntoView({behavior:"smooth",block:"start"})});
$("reroll").addEventListener("click",()=>{seed=Math.floor(Math.random()*1e9);renderDetail()});
$("showAlts").addEventListener("change",drawChart);
window.addEventListener("resize",drawChart);
const observer=new MutationObserver(drawChart);observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
applyInstrument();update();
})();