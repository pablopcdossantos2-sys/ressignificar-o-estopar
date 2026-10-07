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
      const term=q.value.trim().toLocaleLowerCase("pt-BR");
      let n=0;
      items.forEach(el=>{const ok=!term||el.innerText.toLocaleLowerCase("pt-BR").includes(term);el.classList.toggle("hidden-by-search",!ok);if(ok)n++});
      if(status) status.textContent=term?n+" resultado(s) visível(is).":"";
    });
  }

  document.querySelectorAll("[data-save-fields]").forEach(box=>{
    const key=box.dataset.saveFields;
    const fields=[...box.querySelectorAll("input,textarea")];
    try{const data=JSON.parse(localStorage.getItem(key)||"{}");fields.forEach(f=>{if(data[f.name]!=null)f.value=data[f.name]})}catch{}
    fields.forEach(f=>f.addEventListener("input",()=>{
      const data={};fields.forEach(x=>data[x.name]=x.value);localStorage.setItem(key,JSON.stringify(data));
    }));
  });

  const ifBtn=document.querySelector("[data-build-ifthen]");
  if(ifBtn) ifBtn.addEventListener("click",()=>{
    const s=document.querySelector("[name=gatilho]").value.trim();
    const a=document.querySelector("[name=acao]").value.trim();
    const out=document.querySelector("[data-ifthen-output]");
    out.textContent=(s&&a)?`SE ${s}, ENTÃO ${a}.`:"Preencha o gatilho e a ação.";
  });

  const reframeBtn=document.querySelector("[data-build-reframe]");
  if(reframeBtn) reframeBtn.addEventListener("click",()=>{
    const thought=document.querySelector("[name=pensamento]").value.trim();
    const evidence=document.querySelector("[name=evidencia]").value.trim();
    const alt=document.querySelector("[name=alternativa]").value.trim();
    const out=document.querySelector("[data-reframe-output]");
    out.textContent=alt? `Pensamento automático: ${thought||"—"}\nEvidência relevante: ${evidence||"—"}\nResposta profissional alternativa: ${alt}`:"Escreva uma resposta profissional alternativa.";
  });

  document.querySelectorAll("[data-print]").forEach(b=>b.addEventListener("click",()=>print()));
})();