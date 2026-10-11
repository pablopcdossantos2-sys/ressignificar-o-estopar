(() => {
  const root=document.documentElement;
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

  document.querySelectorAll("[data-print]").forEach(b=>b.addEventListener("click",()=>print()));
})();