(() => {
  const key="re-course-progress";
  let progress={modules:{},bestFinal:null};
  try{progress={modules:{},bestFinal:null,...JSON.parse(localStorage.getItem(key)||"{}")};progress.modules=progress.modules||{}}catch{}
  const save=()=>localStorage.setItem(key,JSON.stringify(progress));
  const render=()=>{
    const modules=[...document.querySelectorAll("[data-course-module]")];
    const done=modules.filter(m=>progress.modules[m.dataset.courseModule]).length;
    const txt=document.querySelector("[data-course-progress-text]"),fill=document.querySelector("[data-course-progress-fill]"),best=document.querySelector("[data-course-score-best]");
    if(txt)txt.textContent=`${done}/${modules.length} módulos concluídos`;
    if(fill)fill.style.width=(modules.length?done/modules.length*100:0)+"%";
    if(best)best.textContent=progress.bestFinal==null?"—":progress.bestFinal+"%";
    document.querySelectorAll("[data-module-status]").forEach(el=>{const ok=!!progress.modules[el.dataset.moduleStatus];el.textContent=ok?"✓ Concluído":"Não concluído";el.classList.toggle("is-done",ok)});
    const completion=document.querySelector("[data-course-completion]");
    if(completion)completion.hidden=!(done===modules.length && (progress.bestFinal||0)>=80);
  };
  const mark=(id)=>{progress.modules[id]=true;save();render()};

  document.querySelectorAll("[data-sim]").forEach(sim=>{
    const out=sim.querySelector("[data-sim-feedback]");
    sim.querySelectorAll("[data-sim-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      const correct=btn.dataset.simChoice==="correct";
      sim.querySelectorAll("[data-sim-choice]").forEach(b=>b.classList.remove("choice-correct","choice-wrong"));
      btn.classList.add(correct?"choice-correct":"choice-wrong");
      if(out){out.textContent=(correct?"✓ ":"↻ ")+btn.dataset.feedback;out.className="sim-feedback "+(correct?"success-feedback":"retry-feedback")}
    }));
  });

  document.querySelectorAll("[data-course-quiz]").forEach(form=>{
    const btn=form.querySelector("[data-quiz-submit]"),out=form.querySelector("[data-quiz-result]");
    if(!btn)return;
    btn.addEventListener("click",()=>{
      const qs=[...form.querySelectorAll("[data-question]")];let correct=0,answered=0;
      qs.forEach(q=>{
        const checked=q.querySelector("input:checked");
        let fb=q.querySelector(".question-feedback");
        if(!fb){fb=document.createElement("div");fb.className="question-feedback";q.appendChild(fb)}
        if(!checked){fb.textContent="Responda esta questão.";return}
        answered++;
        const ok=checked.value===q.dataset.answer;if(ok)correct++;
        fb.textContent=(ok?"✓ Correto. ":"✗ Revise. ")+(q.dataset.explanation||"");
        fb.classList.toggle("ok",ok);fb.classList.toggle("bad",!ok);
      });
      if(answered!==qs.length){out.textContent=`Responda todas as ${qs.length} questões.`;return}
      const pct=Math.round(correct/qs.length*100),pass=Number(form.dataset.pass||.75)*100,id=form.dataset.courseQuiz;
      out.textContent=`Resultado: ${correct}/${qs.length} (${pct}%). `+(pct>=pass?"Critério de domínio atingido.":"Ainda não atingiu o critério. Revise o feedback e tente novamente.");
      out.className="quiz-result "+(pct>=pass?"pass":"fail");
      if(form.hasAttribute("data-final-exam")){progress.bestFinal=Math.max(progress.bestFinal||0,pct);save()}
      if(pct>=pass)mark(id); else render();
    });
  });

  const rc=document.querySelector("[data-risk-calc]");
  if(rc)rc.addEventListener("click",()=>{
    const ticks=Number(document.querySelector("[data-risk-ticks]").value),tv=Number(document.querySelector("[data-risk-tick-value]").value),max=Number(document.querySelector("[data-risk-max]").value),cost=Number(document.querySelector("[data-risk-cost]").value||0),out=document.querySelector("[data-risk-output]");
    if(!(ticks>0&&tv>0&&max>0&&cost>=0)){out.textContent="Preencha valores válidos.";return}
    const per=ticks*tv+cost,qty=Math.floor(max/per);
    out.textContent=`Risco aproximado por contrato: R$ ${per.toFixed(2)}. Quantidade máxima pelo limite informado: ${qty}. Risco teórico total: R$ ${(qty*per).toFixed(2)}.\nExemplo didático: confirme especificações reais do instrumento, slippage, gaps e custos antes de qualquer uso operacional.`;
  });

  document.querySelectorAll("[data-print]").forEach(b=>b.addEventListener("click",()=>print()));
  render();
})();