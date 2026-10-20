"use strict";
/* Israel 1955 national mechanics. Read-only exploration; live reserve calculation uses explicit assumptions. */
(function(){
 const D=window.VPI_ISR_1955;
 if(!D){console.error("ISR public data unavailable");return;}
 const $=id=>document.getElementById(id);
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=(n,d=1)=>Number(n).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
 const find=(list,id)=>list.find(x=>x.id===id);
 const {immigration:I,development:B,security:S}=D;
 let step="housing",place="haifa",project="housing",resource="materials",funding="reparations",security="economy";
 function tab(id){
  if(!["people","development","security"].includes(id))return;
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));});
  document.querySelectorAll(".pane").forEach(p=>{p.hidden=p.dataset.pane!==id;});
  try{history.replaceState(null,"","#"+id)}catch(e){}
 }
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>tab(location.hash.slice(1)));
 const stat=(label,value,note,tone="")=>'<div class="stat'+(tone?' '+tone:'')+'"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><span>'+esc(note)+'</span></div>';
 $("isrPopulationStats").innerHTML=[
  stat("Население",fmt(D.economy.population/1e6,3)+" млн","Жителей страны"),
  stat("Занятые",fmt(D.economy.employed,0),"Работающих жителей"),
  stat("Безработица",fmt(D.economy.unemployment,0)+"%","Доля рабочей силы"),
  stat("Инвестиции",fmt(D.economy.investment,0)+"%","Доля ВВП")
 ].join("");
 $("isrPeopleIntro").textContent=I.intro;
 function renderSteps(){
  const s=find(I.steps,step);
  $("isrPeopleSteps").innerHTML=I.steps.map((x,i)=>'<button type="button" data-step="'+x.id+'" class="isr-step-option'+(x.id===step?' active':'')+'" aria-pressed="'+(x.id===step)+'"><small>0'+(i+1)+'</small><strong>'+esc(x.name)+'</strong><span>'+esc(x.tag)+'</span></button>').join("");
  $("isrStepName").textContent=s.name;$("isrStepTag").textContent=s.tag;
  $("isrStepBrief").textContent=s.brief;$("isrStepBarrier").textContent=s.barrier;$("isrStepConnections").textContent=s.connections;
  $("isrPeopleSteps").querySelectorAll("button").forEach(b=>b.onclick=()=>{step=b.dataset.step;renderSteps();});
 }
 function mapSettlement(){
  const start='<defs><linearGradient id="isrSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dceaf2"/><stop offset="1" stop-color="#c8ddeb"/></linearGradient></defs>'+
  '<rect width="565" height="435" fill="#f1ecdc"/>'+
  '<path d="M0 0 H219 Q249 28 249 73 Q255 109 251 157 Q254 191 248 222 Q245 247 261 280 Q256 331 281 374 L310 435 H0Z" fill="url(#isrSea)"/>'+
  '<path d="M219 0 Q249 28 249 73 Q255 109 251 157 Q254 191 248 222 Q245 247 261 280 Q256 331 281 374 L310 435" fill="none" stroke="#fff9e9" stroke-width="4"/>'+
  '<path d="M250 127 Q287 165 255 215 Q296 259 278 354" fill="none" stroke="#bba78f" stroke-width="3" stroke-dasharray="4 8" opacity=".7"/>'+
  '<text x="37" y="205" class="isr-sea-label">Средиземное море</text>'+
  '<text x="354" y="405" class="isr-map-label isr-map-label-muted">Негев</text>';
  const offsets={haifa:[15,-12],telaviv:[-20,23],jerusalem:[16,-13],negev:[15,10],north:[16,-13]};
  $("isrSettlementMap").innerHTML=start+I.places.map(p=>{
    const of=offsets[p.id],chosen=p.id===place,x=p.x,y=p.y,align=p.id==="telaviv"?"end":"start";
    return '<g role="button" tabindex="0" aria-label="'+esc(p.name)+'" data-place-pin="'+p.id+'" class="isr-map-point'+(chosen?' active':'')+'"><circle cx="'+x+'" cy="'+y+'" r="'+(chosen?9:7)+'"/><text x="'+(x+of[0])+'" y="'+(y+of[1])+'" text-anchor="'+align+'">'+esc(p.name)+'</text><title>'+esc(p.name)+'</title></g>';
  }).join("");
  $("isrSettlementMap").querySelectorAll("[data-place-pin]").forEach(g=>{
   const move=()=>{place=g.dataset.placePin;renderPlace();};
   g.onclick=move;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();move();$("isrSettlementMap").querySelector('[data-place-pin="'+place+'"]')?.focus({preventScroll:true});}};
  });
 }
 function renderPlace(){
  const p=find(I.places,place);
  $("isrRegionName").textContent=p.name;$("isrRegionType").textContent=p.type;
  $("isrRegionCapacity").textContent=p.capacity;$("isrRegionChallenge").textContent=p.challenge;$("isrRegionOpportunity").textContent=p.opportunity;
  $("isrRegionButtons").innerHTML=I.places.map(x=>'<button type="button" data-place="'+x.id+'" aria-pressed="'+(x.id===place)+'" class="'+(x.id===place?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("isrRegionButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{place=b.dataset.place;renderPlace();});
  mapSettlement();
 }
 $("isrSocialIssues").innerHTML=I.stress.map(x=>'<div class="isr-social-card"><b>'+esc(x.name)+'</b><p>'+esc(x.detail)+'</p></div>').join("");
 $("isrDevelopmentIntro").textContent=B.intro;
 $("isrTradeStats").innerHTML=[
  stat("ВВП",fmt(D.economy.gdp,3)+" млрд","Междунар. $ 2011 г."),
  stat("Экспорт",fmt(D.economy.exports,2)+" G$","За год"),
  stat("Импорт",fmt(D.economy.imports,2)+" G$","За год"),
  stat("Оборонные расходы",fmt(D.economy.defense/D.economy.spending*100,1)+"%","Доля расходов государства","isr-stat-attention")
 ].join("");
 const maxTrade=Math.max(D.economy.exports,D.economy.imports);
 $("isrTradeBars").innerHTML=[
  {label:"Экспорт",v:D.economy.exports,cl:"export"},
  {label:"Импорт",v:D.economy.imports,cl:"import"}
 ].map(x=>'<div class="isr-trade-row"><div><strong>'+x.label+'</strong><b>'+fmt(x.v,2)+' G$</b></div><div class="isr-trade-track"><span class="'+x.cl+'" style="width:'+(100*x.v/maxTrade).toFixed(1)+'%"></span></div></div>').join("")+
 '<div class="isr-trade-gap"><b>Торговый дефицит</b><strong>'+fmt(D.economy.imports-D.economy.exports,2)+' G$</strong><span>Импорт превышает экспорт приблизительно в '+fmt(D.economy.imports/D.economy.exports,1)+' раза</span></div>';
 function renderProjects(){
  const p=find(B.projects,project);
  $("isrProjectOptions").innerHTML=B.projects.map((x,i)=>'<button type="button" data-project="'+x.id+'" aria-pressed="'+(x.id===project)+'" class="isr-project-choice'+(x.id===project?' active':'')+'"><small>0'+(i+1)+' · '+esc(x.tag)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("isrProjectName").textContent=p.name;$("isrProjectTag").textContent=p.tag;
  $("isrProjectIntro").textContent=p.intro;$("isrProjectPayoff").textContent=p.payoff;
  $("isrProjectBottleneck").textContent=p.bottleneck;$("isrProjectPartners").textContent=p.partners;
  $("isrProjectOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{project=b.dataset.project;resource=find(B.projects,project).needs[0];renderProjects();renderResources();});
 }
 function renderResources(){
  const p=find(B.projects,project),r=find(B.resources,resource);
  $("isrResourceOptions").innerHTML=B.resources.map(x=>'<button type="button" data-resource="'+x.id+'" aria-pressed="'+(x.id===resource)+'" class="isr-resource-choice'+(x.id===resource?' active':'')+(p.needs.includes(x.id)?' required':'')+'"><strong>'+esc(x.name)+'</strong><small>'+(p.needs.includes(x.id)?'Нужен выбранной стройке':'Связанный ресурс')+'</small></button>').join("");
  $("isrResourceName").textContent=r.name;$("isrResourceWhy").textContent=r.why;$("isrResourcePressure").textContent=r.pressure;
  $("isrResourceOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{resource=b.dataset.resource;renderResources();});
 }
 function renderFunding(){
  const f=find(B.funding,funding);
  $("isrFundingOptions").innerHTML=B.funding.map(x=>'<button type="button" data-funding="'+x.id+'" aria-pressed="'+(x.id===funding)+'" class="'+(x.id===funding?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("isrFundingName").textContent=f.headline;$("isrFundingDetail").textContent=f.detail;$("isrFundingRisk").textContent=f.risk;
  $("isrFundingOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{funding=b.dataset.funding;renderFunding();});
 }
 $("isrWaterName").textContent=B.water.heading;$("isrWaterIntro").textContent=B.water.intro;
 $("isrWaterIssues").innerHTML=B.water.cases.map(x=>'<div class="isr-social-card"><b>'+esc(x.name)+'</b><p>'+esc(x.need)+'</p></div>').join("");
 $("isrSecurityIntro").textContent=S.intro;
 $("isrSecurityStats").innerHTML=[
  stat("Действующая армия",fmt(S.active,0),"Военнослужащих"),
  stat("Подготовленный резерв",fmt(S.reserve,0),"Резервистов"),
  stat("Занятые в экономике",fmt(S.employed,0),"Работников"),
  stat("Расходы на оборону",fmt(D.economy.defense/D.economy.spending*100,1)+"%","От государственных расходов")
 ].join("");
 const calledRange=$("isrCalledRange"),daysRange=$("isrDaysRange");
 calledRange.max=String(S.reserve);calledRange.value=String(S.initialCalled);
 daysRange.value=String(S.initialDays);
 function renderReserve(){
  const called=Math.min(S.reserve,Math.max(0,Number(calledRange.value)||0)),duration=Math.min(180,Math.max(0,Number(daysRange.value)||0));
  const lostDays=called*S.employmentFraction*duration;
  const annualPct=100*lostDays/(S.employed*S.workingDays);
  const instantPct=duration===0?0:100*called*S.employmentFraction/S.employed;
  $("isrCalledNumber").textContent=fmt(called,0);
  $("isrDaysNumber").textContent=fmt(duration,0)+" "+(duration%10===1&&duration%100!==11?"день":([2,3,4].includes(duration%10)&&![12,13,14].includes(duration%100)?"дня":"дней"));
  $("isrAnnualLoss").textContent=fmt(annualPct,2)+"%";
  $("isrImmediateLoss").textContent=fmt(instantPct,1)+"%";
  $("isrLostWorkdays").textContent=lostDays>=1e6?fmt(lostDays/1e6,2)+" млн":fmt(lostDays,0);
  $("isrEquivalentJobs").textContent=fmt(lostDays/S.workingDays,0);
  $("isrAnnualMeter").style.width=Math.min(100,annualPct/12*100).toFixed(1)+"%";
  calledRange.style.setProperty("--fill",(100*called/S.reserve).toFixed(1)+"%");
  daysRange.style.setProperty("--fill",(100*duration/180).toFixed(1)+"%");
 }
 calledRange.addEventListener("input",renderReserve);
 daysRange.addEventListener("input",renderReserve);
 function renderSecurity(){
  const c=find(S.cases,security);
  $("isrSecurityCases").innerHTML=S.cases.map((x,i)=>'<button type="button" data-sec="'+x.id+'" aria-pressed="'+(x.id===security)+'" class="'+(x.id===security?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("isrSecurityName").textContent=c.name;$("isrSecurityStatus").textContent=c.status;
  $("isrSecurityRole").textContent=c.role;$("isrSecurityRisk").textContent=c.risk;$("isrSecurityMoves").textContent=c.moves;
  $("isrSecurityCases").querySelectorAll("button").forEach(b=>b.onclick=()=>{security=b.dataset.sec;renderSecurity();});
 }
 $("isrReserveAssumptions").innerHTML=S.assumptions.map(x=>'<p>'+esc(x)+'</p>').join("");
 $("isrSources").innerHTML=D.sources.map(s=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.name)+' ↗</a>').join("");
 renderSteps();renderPlace();renderProjects();renderResources();renderFunding();renderReserve();renderSecurity();
 const requested={knesset:"people",knesset2:"people",people:"people",development:"development",security:"security"}[location.hash.slice(1)];
 tab(requested||"people");
})();
