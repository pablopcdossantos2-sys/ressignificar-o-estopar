(() => {
  const root=document.documentElement;
  const isEnglish=root.lang==="en";
  const tr=(pt,en)=>isEnglish?en:pt;
  const nav=document.querySelector(".nav");
  const themeControl=nav&&nav.querySelector("[data-theme-toggle]");
  if(nav&&themeControl&&!nav.querySelector("[data-language-select]")){
    const label=document.createElement("label");
    label.className="language-switch";
    label.innerHTML=(isEnglish?'<span>Language</span>':'<span>Idioma</span>')+'<select data-language-select aria-label="'+(isEnglish?'Select language':'Selecionar idioma')+'"><option value="pt">Português</option><option value="en">English</option></select>';
    nav.insertBefore(label,themeControl);
  }
  const pagePath=location.pathname;
  const pageFile=pagePath.split("/").pop()||"index.html";
  const onEnglishPage=/-en\\.html$/i.test(pageFile);
  const portugueseFile=onEnglishPage?pageFile.replace(/-en\\.html$/i,".html"):pageFile;
  const englishFile=portugueseFile.replace(/\\.html$/i,"-en.html");
  const savedLanguage=localStorage.getItem("re-language");
  const browserEnglish=/^en(?:-|$)/i.test(navigator.language||"");
  const currentLanguage=onEnglishPage?"en":"pt";
  const wantedLanguage=savedLanguage||(!onEnglishPage&&browserEnglish?"en":currentLanguage);
  const wantedFile=wantedLanguage==="en"?englishFile:portugueseFile;
  if(wantedLanguage!==currentLanguage&&wantedFile!==pageFile){
    location.replace(pagePath.slice(0,pagePath.length-pageFile.length)+wantedFile+location.search+location.hash);
    return;
  }
  document.querySelectorAll("[data-language-select]").forEach(select=>{
    select.value=currentLanguage;
    select.addEventListener("change",()=>{
      const next=select.value==="en"?"en":"pt";
      localStorage.setItem("re-language",next);
      const target=next==="en"?englishFile:portugueseFile;
      location.href=pagePath.slice(0,pagePath.length-pageFile.length)+target+location.search+location.hash;
    });
  });
  const saved=localStorage.getItem("re-theme");
  if(saved) root.dataset.theme=saved;
  const themeBtn=document.querySelector("[data-theme-toggle]");
  if(themeBtn) themeBtn.addEventListener("click",()=>{
    const next=root.dataset.theme==="dark"?"light":"dark";
    root.dataset.theme=next;localStorage.setItem("re-theme",next);
  });
  const menu=document.querySelector("[data-menu]");
  const links=document.querySelector(".navlinks");
  if(menu&&links) menu.addEventListener("click",()=>links.classList.toggle("open"));

  const bar=document.querySelector(".progress span");
  if(bar){
    const update=()=>{const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;bar.style.width=(max?d.scrollTop/max*100:0)+"%"};
    addEventListener("scroll",update,{passive:true});update();
  }

  const q=document.querySelector("[data-search]");
  if(q){
    const items=[...document.querySelectorAll("[data-search-item]")];
    const status=document.querySelector("[data-search-status]");
    q.addEventListener("input",()=>{
      const term=q.value.trim().toLocaleLowerCase("pt-BR");let n=0;
      items.forEach(el=>{const ok=!term||el.innerText.toLocaleLowerCase("pt-BR").includes(term);el.classList.toggle("hidden-by-search",!ok);if(ok)n++});
      if(status) status.textContent=term?n+" resultado(s) visível(is).":"";
    });
  }

  document.querySelectorAll("[data-save-fields]").forEach(box=>{
    const key=box.dataset.saveFields;
    const fields=[...box.querySelectorAll("input,textarea,select")];
    try{
      const data=JSON.parse(localStorage.getItem(key)||"{}");
      fields.forEach(f=>{if(data[f.name]==null)return;if(f.type==="checkbox")f.checked=!!data[f.name];else f.value=data[f.name]});
    }catch{}
    fields.forEach(f=>f.addEventListener("change",save));
    fields.forEach(f=>f.addEventListener("input",save));
    function save(){
      const data={};fields.forEach(x=>data[x.name]=x.type==="checkbox"?x.checked:x.value);
      localStorage.setItem(key,JSON.stringify(data));
    }
  });

  const readButtons=[...document.querySelectorAll("[data-complete-article]")];
  const progressText=document.querySelector("[data-manual-progress]");
  const progressFill=document.querySelector("[data-manual-progress-fill]");
  let read=[];
  try{read=JSON.parse(localStorage.getItem("re-read-articles")||"[]")}catch{}
  const renderRead=()=>{
    readButtons.forEach(b=>{const done=read.includes(b.dataset.completeArticle);b.classList.toggle("is-done",done);b.textContent=done?"✓ Lido":"Marcar como lido"});
    if(progressText) progressText.textContent=`${read.length} de ${readButtons.length} artigos marcados como lidos`;
    if(progressFill) progressFill.style.width=(readButtons.length?read.length/readButtons.length*100:0)+"%";
  };
  readButtons.forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.completeArticle;
    read=read.includes(id)?read.filter(x=>x!==id):[...read,id];
    localStorage.setItem("re-read-articles",JSON.stringify(read));renderRead();
  }));renderRead();

  const ifBtn=document.querySelector("[data-build-ifthen]");
  if(ifBtn) ifBtn.addEventListener("click",()=>{
    const s=document.querySelector("[name=gatilho]").value.trim(),a=document.querySelector("[name=acao]").value.trim();
    document.querySelector("[data-ifthen-output]").textContent=(s&&a)?`SE ${s}, ENTÃO ${a}.`:"Preencha o gatilho e a ação.";
  });
  const reframeBtn=document.querySelector("[data-build-reframe]");
  if(reframeBtn) reframeBtn.addEventListener("click",()=>{
    const t=document.querySelector("[name=pensamento]").value.trim(),e=document.querySelector("[name=evidencia]").value.trim(),a=document.querySelector("[name=alternativa]").value.trim();
    document.querySelector("[data-reframe-output]").textContent=a?`Pensamento automático: ${t||"—"}\nEvidência relevante: ${e||"—"}\nResposta profissional alternativa: ${a}`:"Escreva uma resposta profissional alternativa.";
  });

  const scoreBtn=document.querySelector("[data-process-score]");
  if(scoreBtn) scoreBtn.addEventListener("click",()=>{
    const fields=[...document.querySelectorAll("[data-process-item]")];
    const answered=fields.filter(f=>f.value!=="");
    const yes=fields.filter(f=>f.value==="1").length;
    const out=document.querySelector("[data-process-output]");
    if(answered.length!==fields.length){out.textContent="Responda todos os itens antes de calcular.";return}
    const pct=Math.round(yes/fields.length*100);
    out.textContent=`Aderência ao processo: ${yes}/${fields.length} (${pct}%).\nUse esta pontuação para revisar comportamento, não para julgar seu valor pessoal nem prever o próximo trade.`;
  });

  const trafficBtn=document.querySelector("[data-traffic-score]");
  if(trafficBtn) trafficBtn.addEventListener("click",()=>{
    const fields=[...document.querySelectorAll("[data-traffic-item]")];
    if(fields.some(f=>f.value==="")){document.querySelector("[data-traffic-output]").textContent="Responda todos os itens.";return}
    const score=fields.reduce((s,f)=>s+Number(f.value),0);
    const out=document.querySelector("[data-traffic-output]");
    let label,msg,klass;
    if(score<=2){label="VERDE";klass="green";msg="Seu autorrelato indica baixa pressão imediata. Ainda assim, qualquer nova operação deve cumprir integralmente o plano."}
    else if(score<=5){label="AMARELO";klass="amber";msg="Há sinais de pressão decisória. Considere cumprir uma pausa prevista no seu plano, registrar o estado e só então reavaliar critérios objetivos."}
    else {label="VERMELHO";klass="red";msg="Há forte pressão para agir. Evite usar uma nova operação para regular a emoção; siga os limites e procedimentos de interrupção já definidos no seu plano."}
    out.innerHTML=`<span class="traffic ${klass}">${label}</span> · ${msg}<br><span class="small">Este semáforo é uma ferramenta educativa de autorreflexão, não um teste psicológico ou diagnóstico.</span>`;
  });


  const rageBtn=document.querySelector("[data-rage-score]");
  if(rageBtn) rageBtn.addEventListener("click",()=>{
    const fields=[...document.querySelectorAll("[data-rage-item]")],out=document.querySelector("[data-rage-output]");
    if(fields.some(f=>f.value==="")){out.textContent="Preencha todos os itens.";return}
    const score=fields.reduce((s,f)=>s+Number(f.value),0);
    let label,msg;
    if(score<=3){label="BAIXA ESCALADA";msg="Poucos sinais foram marcados. Revise mesmo assim o primeiro gatilho e confirme se as regras permaneceram intactas."}
    else if(score<=8){label="ESCALADA RELEVANTE";msg="Há vários sinais de mudança de comportamento. Identifique a primeira violação e construa um ponto de interrupção antes dela."}
    else {label="ESCALADA ALTA";msg="O autorrelato mostra uma cadeia ampla de perda de processo. O foco da revisão deve ser interromper cedo a sequência, não encontrar uma justificativa para cada trade."}
    out.textContent=label+" — "+msg+"\nPontuação: "+score+"/16. Ferramenta educativa, não teste psicológico.";
  });

  const dispBtn=document.querySelector("[data-disposition-analyze]");
  if(dispBtn) dispBtn.addEventListener("click",()=>{
    const wt=Number(document.querySelector("[data-disposition-win-time]").value),
          lt=Number(document.querySelector("[data-disposition-loss-time]").value),
          wr=Number(document.querySelector("[data-disposition-win-r]").value),
          lr=Number(document.querySelector("[data-disposition-loss-r]").value),
          out=document.querySelector("[data-disposition-output]");
    if(!(wt>0&&lt>0&&wr>0&&lr>0)){out.textContent="Preencha todos os valores com números maiores que zero.";return}
    const timeRatio=lt/wt, payoff=wr/lr;
    const flags=[];
    if(timeRatio>=1.5) flags.push("perdedores permanecem abertos muito mais tempo que vencedores");
    if(payoff<1) flags.push("o ganho médio é menor que a perda média");
    let msg=flags.length?"Amostra com assimetrias que merecem investigação: "+flags.join("; ")+".":"Nenhuma das duas assimetrias simples usadas por esta ferramenta apareceu de forma forte.";
    out.textContent=`Razão de duração (perdedor/vencedor): ${timeRatio.toFixed(2)}x.\nPayoff médio (ganho/perda): ${payoff.toFixed(2)}.\n${msg}\nIsso não diagnostica efeito disposição: compare com as regras e a expectativa matemática da sua estratégia.`;
  });

  const ctxMin=document.querySelector("[data-context-minutes]"),
        ctxClock=document.querySelector("[data-context-clock]"),
        ctxStart=document.querySelector("[data-context-start]"),
        ctxStop=document.querySelector("[data-context-stop]");
  if(ctxMin&&ctxClock&&ctxStart&&ctxStop){
    let timer=null,remaining=Math.max(1,Number(ctxMin.value)||15)*60;
    const paint=()=>{const m=Math.floor(remaining/60),s=remaining%60;ctxClock.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")};
    const reset=()=>{remaining=Math.max(1,Number(ctxMin.value)||15)*60;paint()};
    ctxMin.addEventListener("change",reset);
    ctxStart.addEventListener("click",()=>{if(timer)clearInterval(timer);reset();timer=setInterval(()=>{remaining--;paint();if(remaining<=0){clearInterval(timer);timer=null;ctxClock.textContent="RESET";}},1000)});
    ctxStop.addEventListener("click",()=>{if(timer)clearInterval(timer);timer=null});
    paint();
  }

  const ctxSave=document.querySelector("[data-context-save]"),ctxHist=document.querySelector("[data-context-history]"),ctxClear=document.querySelector("[data-context-clear]");
  if(ctxSave&&ctxHist&&ctxClear){
    const key="re-context-history";
    const render=()=>{let arr=[];try{arr=JSON.parse(localStorage.getItem(key)||"[]")}catch{}ctxHist.innerHTML=arr.length?arr.map((x,i)=>`<article class="snapshot"><strong>${x.at}</strong><p><b>Agora:</b> ${esc(x.now)}</p><p><b>Mudou:</b> ${esc(x.changed)}</p><p><b>A favor:</b> ${esc(x.favor)}</p><p><b>Contra:</b> ${esc(x.against)}</p><p><b>Zerado:</b> ${esc(x.flat)}</p></article>`).join(""):'<p class="small">Nenhum snapshot salvo.</p>'};
    const esc=s=>String(s||"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    ctxSave.addEventListener("click",()=>{let arr=[];try{arr=JSON.parse(localStorage.getItem(key)||"[]")}catch{}const v=n=>document.querySelector(`[name=${n}]`)?.value.trim()||"";arr.unshift({at:new Date().toLocaleString("pt-BR"),now:v("ctx_now"),changed:v("ctx_changed"),favor:v("ctx_for"),against:v("ctx_against"),flat:v("ctx_flat")});arr=arr.slice(0,50);localStorage.setItem(key,JSON.stringify(arr));render()});
    ctxClear.addEventListener("click",()=>{localStorage.removeItem(key);render()});render();
  }

  document.querySelectorAll("[data-print]").forEach(b=>b.addEventListener("click",()=>print()));
})();