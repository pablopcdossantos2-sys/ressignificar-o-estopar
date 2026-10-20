(() => {
  const isEnglish=document.documentElement.lang==="en";
  const tr=(pt,en)=>isEnglish?en:pt;
  const $=s=>document.querySelector(s), canvas=$("[data-replay-canvas]");
  if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const q=new URLSearchParams(location.search);
  const dataChannel=("BroadcastChannel" in window)?new BroadcastChannel("re-market-data"):null;
  if(q.get("embed")==="1"){document.body.classList.add("replay-embed");document.querySelectorAll("[data-embed-hide]").forEach(e=>e.remove())}
  const requested=q.get("challenge"); if(requested&&$("[data-replay-challenge]"))$("[data-replay-challenge]").value=requested;

  const els={
    asset:$("[data-replay-asset]"),file:$("[data-replay-file]"),imp:$("[data-replay-import]"),del:$("[data-replay-delete]"),status:$("[data-replay-dataset-status]"),
    tf:$("[data-replay-timeframe]"),date:$("[data-replay-date]"),challenge:$("[data-replay-challenge]"),load:$("[data-replay-load]"),session:$("[data-replay-session-status]"),
    price:$("[data-replay-price]"),stop:$("[data-replay-stop]"),target:$("[data-replay-target]"),why:$("[data-replay-rationale]"),buy:$("[data-replay-buy]"),sell:$("[data-replay-sell]"),update:$("[data-replay-update-stop]"),exit:$("[data-replay-exit]"),order:$("[data-replay-order-status]"),
    back:$("[data-replay-back]"),step:$("[data-replay-step]"),play:$("[data-replay-play]"),speed:$("[data-replay-speed]"),clock:$("[data-replay-clock]"),challengeText:$("[data-replay-challenge-text]"),tooltip:$("[data-replay-tooltip]"),log:$("[data-replay-log]")
  };
  const stats={position:$("[data-stat-position]"),pnl:$("[data-stat-pnl]"),trades:$("[data-stat-trades]"),stops:$("[data-stat-stops]"),expansions:$("[data-stat-expansions]"),presence:$("[data-stat-presence]")};

  let raw=[],bars=[],cursor=0,startCursor=0,timer=null,position=null,metrics={trades:0,stops:0,expansions:0,presence:0,realized:0},lastMouse=null;
  const presenceDialog=$("[data-presence-dialog]"),presenceOpen=$("[data-presence-open]"),presenceSave=$("[data-presence-save]"),presenceMsg=$("[data-presence-message]");
  const openPresence=(auto=false)=>{
    if(!presenceDialog)return;
    const fact=$("[data-presence-fact]"),story=$("[data-presence-story]"),def=$("[data-presence-defusion]"),rule=$("[data-presence-rule]"),action=$("[data-presence-action]"),flat=$("[data-presence-flat]");
    [fact,story,def,rule,action].forEach(x=>{if(x)x.value=""});if(flat)flat.checked=false;if(presenceMsg)presenceMsg.textContent=auto?tr("Checkpoint automático: a posição atingiu aproximadamente -0,5R pelo fechamento.","Automatic checkpoint: the position reached approximately -0.5R at candle close."):"";
    if(typeof presenceDialog.showModal==="function")presenceDialog.showModal();else presenceDialog.setAttribute("open","");
  };
  if(presenceOpen)presenceOpen.addEventListener("click",()=>{stopPlay();openPresence(false)});
  if(presenceSave)presenceSave.addEventListener("click",()=>{
    const fact=$("[data-presence-fact]")?.value.trim(),story=$("[data-presence-story]")?.value.trim(),def=$("[data-presence-defusion]")?.value.trim(),rule=$("[data-presence-rule]")?.value.trim(),action=$("[data-presence-action]")?.value.trim(),flat=$("[data-presence-flat]")?.checked;
    if(!fact||!rule||!action){if(presenceMsg)presenceMsg.textContent=tr("Preencha pelo menos Fato, Regra e Ação.","Fill in at least Fact, Rule, and Action.");return}
    metrics.presence++;log(isEnglish?`A.G.O.R.A. · Fact: ${fact} · Story: ${story||"—"} · Defusion: ${def||"—"} · Rule: ${rule} · Action: ${action} · Flat / P&L hidden reading: ${flat?"same":"different or uncertain"}`:`A.G.O.R.A. · Fato: ${fact} · História: ${story||"—"} · Desfusão: ${def||"—"} · Regra: ${rule} · Ação: ${action} · Leitura zerado/P&L oculto: ${flat?"igual":"diferente ou incerta"}`,"ok");
    updateUI();presenceDialog.close();
  });

  const challengeText={
    free:tr("Replay livre: leia o contexto, defina o stop antes da entrada e avance sem enxergar candles futuros.","Free replay: read the context, define the stop before entry, and advance without seeing future candles."),
    stop:tr("Desafio: abra uma posição com stop definido e não amplie o risco depois da entrada.","Challenge: open a position with a defined stop and do not increase risk after entry."),
    recovery:tr("Desafio: após um stop, só faça nova entrada se ela existir por mérito próprio — não para voltar ao zero.","Challenge: after a stop, enter again only if the setup stands on its own—not to get back to breakeven."),
    disposition:tr("Desafio: observe se você encerra ganhos por desconforto e prolonga perdas por esperança. Use critérios, não o sinal do P&L.","Challenge: notice whether you close winners out of discomfort and extend losers out of hope. Use criteria, not the P&L sign."),
    context:tr("Desafio: a cada bloco de candles, reconstrua mentalmente a tese atual. O que mudou? O que contraria sua leitura?","Challenge: after each candle block, rebuild your current thesis. What changed? What contradicts your view?"),
    fury:tr("Desafio: perceba o primeiro sinal de escalada (urgência, raiva, frequência, aumento de risco) e interrompa a cadeia.","Challenge: notice the first sign of escalation (urgency, anger, frequency, increased risk) and interrupt the chain."),
    present:tr("Desafio: quando a posição ficar desconfortável, pare de operar a reversão imaginada. Separe fato, hipótese e desejo e retorne à regra usando o checkpoint A.G.O.R.A.","Challenge: when the position becomes uncomfortable, stop trading the imagined reversal. Separate fact, hypothesis, and desire, then return to the rule using the A.G.O.R.A. checkpoint.")
  };

  const dbOpen=()=>new Promise((res,rej)=>{const r=indexedDB.open("ressignificar-market-data",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("datasets"))r.result.createObjectStore("datasets",{keyPath:"asset"})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const dbGet=async asset=>{const db=await dbOpen();return new Promise((res,rej)=>{const t=db.transaction("datasets","readonly"),r=t.objectStore("datasets").get(asset);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})};
  const dbPut=async obj=>{const db=await dbOpen();return new Promise((res,rej)=>{const t=db.transaction("datasets","readwrite"),r=t.objectStore("datasets").put(obj);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})};
  const dbDelete=async asset=>{const db=await dbOpen();return new Promise((res,rej)=>{const t=db.transaction("datasets","readwrite"),r=t.objectStore("datasets").delete(asset);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})};

  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
  const num=(s,semicolon)=>{let x=String(s??"").trim();if(semicolon)x=x.replace(/\./g,"").replace(",",".");else if(x.includes(",")&&!x.includes("."))x=x.replace(",",".");const n=Number(x);return Number.isFinite(n)?n:null};
  function splitCSV(text){
    const first=(text.split(/\r?\n/).find(x=>x.trim())||"");
    const delim=first.includes(";")?";":first.includes("\t")?"\t":",";
    const lines=text.split(/\r?\n/).filter(x=>x.trim());
    const parseLine=line=>{const out=[];let cur="",quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++}else quote=!quote}else if(ch===delim&&!quote){out.push(cur);cur=""}else cur+=ch}out.push(cur);return out};
    return {delim,rows:lines.map(parseLine)};
  }
  function parseTime(v){
    if(v==null)return NaN;const s=String(v).trim();
    if(/^\d{10}$/.test(s))return Number(s)*1000;if(/^\d{13}$/.test(s))return Number(s);
    let d=new Date(s);if(!Number.isNaN(d.getTime()))return d.getTime();
    const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if(m)return new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0),+(m[6]||0)).getTime();
    return NaN;
  }
  function parseCSV(text){
    const {delim,rows}=splitCSV(text);if(rows.length<2)throw new Error("Arquivo sem linhas suficientes.");
    const hdr=rows[0].map(norm), semicolon=delim===";";
    const find=(...names)=>hdr.findIndex(h=>names.some(n=>h===norm(n)));
    const io=find("open","abertura"),ih=find("high","maxima","máxima"),il=find("low","minima","mínima"),ic=find("close","fechamento"),iv=find("volume","vol");
    const it=find("time","timestamp","datetime","datahora"),id=find("date","data"),ihour=find("hora","hour");
    if([io,ih,il,ic].some(i=>i<0)|| (it<0&&id<0))throw new Error(tr("Não reconheci as colunas OHLC/data. Veja o tutorial de dados.","Could not identify the OHLC/date columns. See the data guide."));
    const out=[];
    for(const r of rows.slice(1)){
      let ts;if(it>=0)ts=parseTime(r[it]);else ts=parseTime((r[id]||"")+" "+(ihour>=0?r[ihour]||"":""));
      const o=num(r[io],semicolon),h=num(r[ih],semicolon),l=num(r[il],semicolon),c=num(r[ic],semicolon),v=iv>=0?num(r[iv],semicolon):0;
      if(Number.isFinite(ts)&&[o,h,l,c].every(Number.isFinite))out.push({t:ts,o,h,l,c,v:Number.isFinite(v)?v:0});
    }
    out.sort((a,b)=>a.t-b.t);
    const uniq=[];let prev=-1;for(const b of out){if(b.t!==prev){uniq.push(b);prev=b.t}}
    if(uniq.length<20)throw new Error(tr("Poucos candles válidos encontrados (","Too few valid candles found (")+uniq.length+").");
    return uniq;
  }
  const median=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
  const baseMinutes=data=>{const dif=[];for(let i=1;i<Math.min(data.length,1000);i++){const d=(data[i].t-data[i-1].t)/60000;if(d>0&&d<120)dif.push(d)}return dif.length?Math.round(median(dif)):null};
  function resample(data,min){
    const ms=min*60000,map=new Map();
    for(const b of data){const k=Math.floor(b.t/ms)*ms;let x=map.get(k);if(!x){x={t:k,o:b.o,h:b.h,l:b.l,c:b.c,v:b.v||0};map.set(k,x)}else{x.h=Math.max(x.h,b.h);x.l=Math.min(x.l,b.l);x.c=b.c;x.v+=(b.v||0)}}
    return [...map.values()].sort((a,b)=>a.t-b.t);
  }
  const dateKey=t=>{const d=new Date(t);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
  const fmtTime=t=>new Date(t).toLocaleString(isEnglish?"en-US":"pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat(isEnglish?"en-US":"pt-BR",{maximumFractionDigits:4}).format(n):"—";

  async function refreshDataset(){
    const d=await dbGet(els.asset.value);raw=d?.bars||[];
    if(!d){els.status.textContent=tr("Nenhuma base salva para ","No saved dataset for ")+els.asset.value+".";els.date.innerHTML='<option value="">'+tr("Importe uma base","Import a dataset")+'</option>';return}
    const base=baseMinutes(raw);els.status.textContent=`${raw.length.toLocaleString(isEnglish?"en-US":"pt-BR")} ${tr("candles salvos","candles saved")} · ${tr("granularidade detectada","detected interval")} ≈ ${base||"?"} min · ${tr("importado em","imported on")} ${new Date(d.importedAt).toLocaleDateString(isEnglish?"en-US":"pt-BR")}`;
    const dates=[...new Set(raw.map(x=>dateKey(x.t)))].sort();
    els.date.innerHTML=dates.map(x=>`<option value="${x}">${x.split("-").reverse().join("/")}</option>`).join("");
  }

  els.imp.addEventListener("click",async()=>{
    try{const f=els.file.files?.[0];if(!f)throw new Error(tr("Selecione um CSV.","Select a CSV file."));els.status.textContent=tr("Lendo arquivo…","Reading file…");const parsed=parseCSV(await f.text());await dbPut({asset:els.asset.value,bars:parsed,importedAt:Date.now(),filename:f.name});if(dataChannel)dataChannel.postMessage({type:"dataset-updated",asset:els.asset.value});els.status.textContent=tr("Importação concluída.","Import complete.");await refreshDataset()}catch(e){els.status.textContent=tr("Erro: ","Error: ")+e.message}
  });
  els.del.addEventListener("click",async()=>{await dbDelete(els.asset.value);raw=[];bars=[];render();await refreshDataset()});
  els.asset.addEventListener("change",refreshDataset);
  if(dataChannel)dataChannel.onmessage=e=>{if(e.data?.type==="dataset-updated"&&e.data.asset===els.asset.value)refreshDataset()};

  function loadSession(){
    if(!raw.length){els.session.textContent=tr("Importe/carregue uma base primeiro.","Import or load a dataset first.");return}
    const tf=Number(els.tf.value),base=baseMinutes(raw);
    if(base&&base>tf){els.session.textContent=isEnglish?`The dataset appears to be ${base} min. Candles of ${tf} min cannot be reconstructed from a coarser interval.`:`A base parece ter ${base} min. Não é possível reconstruir candles de ${tf} min a partir de granularidade maior.`;return}
    let rs=resample(raw,tf).filter(x=>dateKey(x.t)===els.date.value);
    if(rs.length<25){els.session.textContent=tr("Sessão curta demais após o resampling.","Session is too short after resampling.");return}
    bars=rs;metrics={trades:0,stops:0,expansions:0,presence:0,realized:0};position=null;
    const ch=els.challenge.value;startCursor=ch==="free"?Math.min(30,bars.length-1):Math.max(20,Math.min(bars.length-20,20+Math.floor(Math.random()*Math.max(1,bars.length-40))));
    cursor=startCursor;els.challengeText.textContent=challengeText[ch];els.session.textContent=`${bars.length} ${tr("candles de","candles at")} ${tf} min · ${tr("replay inicia no candle","replay starts at candle")} ${cursor+1}.`;els.log.innerHTML="";updateUI();draw();
  }
  els.load.addEventListener("click",loadSession);
  els.challenge.addEventListener("change",()=>els.challengeText.textContent=challengeText[els.challenge.value]);

  function enter(side){
    if(!bars.length)return;const b=bars[cursor],stop=Number(els.stop.value),target=els.target.value===""?null:Number(els.target.value),why=els.why.value.trim();
    if(!Number.isFinite(stop)){log(tr("Entrada recusada: defina o stop antes de entrar.","Entry rejected: define the stop before entering."),"bad");return}
    if(!why){log(tr("Entrada recusada: descreva por que o stop invalida a hipótese.","Entry rejected: explain why the stop invalidates the hypothesis."),"bad");return}
    if(side==="long"&&stop>=b.c){log(tr("Compra recusada: o stop precisa estar abaixo da entrada.","Buy rejected: the stop must be below entry."),"bad");return}
    if(side==="short"&&stop<=b.c){log(tr("Venda recusada: o stop precisa estar acima da entrada.","Sell rejected: the stop must be above entry."),"bad");return}
    if(target!=null&&!Number.isFinite(target))return;
    if(side==="long"&&target!=null&&target<=b.c){log(tr("Na compra, o alvo deve estar acima da entrada.","For a buy, the target must be above entry."),"bad");return}
    if(side==="short"&&target!=null&&target>=b.c){log(tr("Na venda, o alvo deve estar abaixo da entrada.","For a sell, the target must be below entry."),"bad");return}
    if(position){log(tr("Já existe uma posição aberta.","A position is already open."),"bad");return}
    position={side,entry:b.c,stop,target,initialStop:stop,risk:Math.abs(b.c-stop),why,enteredAt:b.t,presenceTriggered:false};metrics.trades++;
    log(`${side==="long"?tr("COMPRA","BUY"):tr("VENDA","SELL")} @ ${fmt(b.c)} · stop ${fmt(stop)}${target!=null?" · "+tr("alvo","target")+" "+fmt(target):""}`,"ok");updateUI();draw();
  }
  els.buy.addEventListener("click",()=>enter("long"));els.sell.addEventListener("click",()=>enter("short"));
  els.update.addEventListener("click",()=>{
    if(!position){log(tr("Sem posição para atualizar.","No position to update."),"bad");return}
    const s=Number(els.stop.value);if(!Number.isFinite(s)){log(tr("Stop inválido.","Invalid stop."),"bad");return}
    const old=position.stop;const expanding=position.side==="long"?s<old:s>old;
    if(expanding){metrics.expansions++;log(isEnglish?`⚠ Stop widened from ${fmt(old)} to ${fmt(s)}. Violation recorded as increased risk.`:`⚠ Stop ampliado de ${fmt(old)} para ${fmt(s)}. Violação registrada como aumento de risco.`,"warn")}else log(isEnglish?`Stop updated from ${fmt(old)} to ${fmt(s)}.`:`Stop atualizado de ${fmt(old)} para ${fmt(s)}.`,"ok");
    position.stop=s;updateUI();draw();
  });
  els.exit.addEventListener("click",()=>{if(!position)return;closePosition(bars[cursor].c,tr("Saída manual","Manual exit"),false)});

  function closePosition(px,reason,wasStop,amb=false){
    const p=position;if(!p)return;const points=(px-p.entry)*(p.side==="long"?1:-1);metrics.realized+=points;if(wasStop)metrics.stops++;
    log(`${reason}${amb?tr(" (candle ambíguo: stop e alvo tocaram)"," (ambiguous candle: stop and target were both touched)"):""} @ ${fmt(px)} · ${tr("resultado","result")} ${points>=0?"+":""}${fmt(points)} pts · ${p.risk?fmt(points/p.risk)+"R":""}`,points>=0?"ok":"bad");position=null;updateUI();draw();
  }
  function processBar(b){
    if(!position)return;const p=position;
    const stopHit=p.side==="long"?b.l<=p.stop:b.h>=p.stop;
    const targetHit=p.target!=null&&(p.side==="long"?b.h>=p.target:b.l<=p.target);
    if(stopHit&&targetHit){closePosition(p.stop,"STOP",true,true);return}
    if(stopHit){closePosition(p.stop,"STOP",true);return}
    if(targetHit){closePosition(p.target,"ALVO",false);return}
  }
  function step(){
    if(!bars.length||cursor>=bars.length-1){stopPlay();return}
    cursor++;processBar(bars[cursor]);
    if(position&&els.challenge.value==="present"&&!position.presenceTriggered&&position.risk>0){
      const openPts=(bars[cursor].c-position.entry)*(position.side==="long"?1:-1),openR=openPts/position.risk;
      if(openR<=-0.5){position.presenceTriggered=true;stopPlay();openPresence(true)}
    }
    updateUI();draw();
  }
  els.step.addEventListener("click",step);
  function stopPlay(){if(timer)clearInterval(timer);timer=null;els.play.textContent="▶ Reproduzir"}
  els.play.addEventListener("click",()=>{if(timer){stopPlay();return}els.play.textContent=tr("⏸ Pausar","⏸ Pause");timer=setInterval(step,Number(els.speed.value))});
  els.speed.addEventListener("change",()=>{if(timer){stopPlay();els.play.click()}});
  els.back.addEventListener("click",()=>{stopPlay();cursor=startCursor;position=null;metrics={trades:0,stops:0,expansions:0,realized:0};els.log.innerHTML="";updateUI();draw()});

  function updateUI(){
    const b=bars[cursor];els.price.textContent=b?fmt(b.c):"—";els.clock.textContent=b?fmtTime(b.t):"—";
    stats.position.textContent=position?(position.side==="long"?"Comprado":"Vendido"):"—";stats.trades.textContent=metrics.trades;stats.stops.textContent=metrics.stops;stats.expansions.textContent=metrics.expansions;if(stats.presence)stats.presence.textContent=metrics.presence;
    let open=0;if(position&&b)open=(b.c-position.entry)*(position.side==="long"?1:-1);stats.pnl.textContent=`${fmt(metrics.realized+open)} pts`;
    els.order.textContent=position?`${position.side==="long"?tr("Comprado","Long"):tr("Vendido","Short")} @ ${fmt(position.entry)} · stop ${fmt(position.stop)}${position.target!=null?" · "+tr("alvo","target")+" "+fmt(position.target):""}`:tr("Sem posição.","No position.");
  }
  function log(msg,type=""){const d=document.createElement("div");d.className="replay-log-item "+type;d.innerHTML=`<span>${bars[cursor]?fmtTime(bars[cursor].t):""}</span><p>${msg}</p>`;els.log.prepend(d)}

  function resize(){
    const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(600,Math.floor(r.width*dpr));canvas.height=Math.floor((q.get("embed")==="1"?390:540)*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);canvas.style.height=(q.get("embed")==="1"?390:540)+"px";draw()
  }
  function draw(){
    const w=canvas.clientWidth||900,h=canvas.clientHeight||540;ctx.clearRect(0,0,w,h);
    const styles=getComputedStyle(document.documentElement),bg=styles.getPropertyValue("--surface").trim()||"#fff",line=styles.getPropertyValue("--line").trim()||"#ddd",text=styles.getPropertyValue("--muted").trim()||"#666",up=styles.getPropertyValue("--ok").trim()||"#27845b",down=styles.getPropertyValue("--danger").trim()||"#b54848",accent=styles.getPropertyValue("--accent").trim()||"#315f4a";
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    if(!bars.length){ctx.fillStyle=text;ctx.font="15px sans-serif";ctx.fillText(tr("Importe dados históricos e carregue uma sessão.","Import historical data and load a session."),24,40);return}
    const count=Math.min(90,cursor+1),from=Math.max(0,cursor-count+1),view=bars.slice(from,cursor+1),pad={l:12,r:82,t:18,b:30};
    let lo=Math.min(...view.map(b=>b.l)),hi=Math.max(...view.map(b=>b.h));if(position){lo=Math.min(lo,position.stop,position.target??Infinity);hi=Math.max(hi,position.stop,position.target??-Infinity)}
    const range=hi-lo||1;lo-=range*.05;hi+=range*.05;const ph=h-pad.t-pad.b,pw=w-pad.l-pad.r;const y=p=>pad.t+(hi-p)/(hi-lo)*ph,x=i=>pad.l+(i+.5)*pw/view.length,cw=Math.max(2,pw/view.length*.58);
    ctx.strokeStyle=line;ctx.lineWidth=1;ctx.fillStyle=text;ctx.font="11px sans-serif";
    for(let i=0;i<=5;i++){const yy=pad.t+ph*i/5,price=hi-(hi-lo)*i/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillText(fmt(price),w-pad.r+8,yy+4)}
    view.forEach((b,i)=>{const xx=x(i),color=b.c>=b.o?up:down;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(xx,y(b.h));ctx.lineTo(xx,y(b.l));ctx.stroke();const top=Math.min(y(b.o),y(b.c)),bh=Math.max(1,Math.abs(y(b.o)-y(b.c)));ctx.fillRect(xx-cw/2,top,cw,bh)});
    if(position){
      const lines=[["Entrada",position.entry,accent],["Stop",position.stop,down]];if(position.target!=null)lines.push(["Alvo",position.target,up]);
      ctx.setLineDash([6,5]);for(const [lab,p,col] of lines){ctx.strokeStyle=col;ctx.fillStyle=col;const yy=y(p);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillText(lab,w-pad.r+8,yy-5)}ctx.setLineDash([]);
    }
    for(let i=0;i<view.length;i+=Math.max(1,Math.floor(view.length/6))){ctx.fillStyle=text;ctx.fillText(new Date(view[i].t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),x(i)-16,h-9)}
    if(lastMouse)drawCrosshair(lastMouse,w,h,pad,view,x,y,text,line);
  }
  function drawCrosshair(m,w,h,pad,view,x,y,text,line){
    if(m.x<pad.l||m.x>w-pad.r||m.y<pad.t||m.y>h-pad.b)return;ctx.save();ctx.strokeStyle=line;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(m.x,pad.t);ctx.lineTo(m.x,h-pad.b);ctx.moveTo(pad.l,m.y);ctx.lineTo(w-pad.r,m.y);ctx.stroke();ctx.restore();
  }
  canvas.addEventListener("mousemove",e=>{const r=canvas.getBoundingClientRect();lastMouse={x:e.clientX-r.left,y:e.clientY-r.top};draw();const count=Math.min(90,cursor+1),from=Math.max(0,cursor-count+1),view=bars.slice(from,cursor+1);if(!view.length)return;const pw=canvas.clientWidth-94,i=Math.max(0,Math.min(view.length-1,Math.floor((lastMouse.x-12)/pw*view.length))),b=view[i];els.tooltip.hidden=false;els.tooltip.style.left=Math.min(canvas.clientWidth-190,lastMouse.x+12)+"px";els.tooltip.style.top=Math.max(8,lastMouse.y-55)+"px";els.tooltip.textContent=`${fmtTime(b.t)}  O ${fmt(b.o)} H ${fmt(b.h)} L ${fmt(b.l)} C ${fmt(b.c)}`});
  canvas.addEventListener("mouseleave",()=>{lastMouse=null;els.tooltip.hidden=true;draw()});
  new ResizeObserver(resize).observe(canvas.parentElement);
  window.addEventListener("storage",()=>draw());
  refreshDataset().then(()=>{els.challengeText.textContent=challengeText[els.challenge.value];resize()});
})();