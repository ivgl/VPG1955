"use strict";
/* India 1955 national mechanics: read-only exploration, parliament is a separate shared renderer above the tabs. */
(function(){
 const D=window.VPI_INDIA_1955;const G=window.VPI_REMAINING_GEO?.ind;
 if(!D){console.error("India public data unavailable");return;}
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const format=(n,d=1)=>Number(n).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
 const find=(list,id)=>list.find(x=>x.id===id);
 let region="andhra",regionPolicy=0,model="rural",resource="budget",funding="state",caseId="yug",approach="trade";
 function tab(t){
  if(!["federation","economy","diplomacy"].includes(t))return;
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
  document.querySelectorAll(".pane").forEach(p=>{p.hidden=p.dataset.pane!==t});
  try{history.replaceState(null,"","#"+t)}catch(e){}
 }
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>tab(location.hash.slice(1)));
 $("indCommissionIntro").textContent=D.federation.report;
 const F=D.federation,E=D.development,X=D.diplomacy;
 function mapPt(p){return [G.transform.offsetX+p.lon*G.transform.scale*G.transform.cos,G.transform.offsetY-p.lat*G.transform.scale]}
 const short={andhra:"Хайдарабад",bombay:"Бомбей",punjab:"Пенджаб",kerala:"Малабар",naga:"Нагские холмы",kashmir:"Кашмир"};
 function renderMap(){
  if(!G){$("indStatesMap").innerHTML='<text x="40" y="65">Контур недоступен: выбирай регион в списке ниже.</text>';return;}
  const paths=G.shapes.map(x=>'<path d="'+esc(x.d)+'" class="ind-land"/>').join("");
  const marks=F.issues.map(p=>{
    const [x,y]=mapPt(p),on=p.id===region,flip=p.id==="naga",dy=p.id==="kashmir"?22:-11;
    return '<g class="ind-map-pin'+(on?' active':'')+'" data-region-pin="'+p.id+'" role="button" tabindex="0" aria-label="'+esc(p.title)+'">'+
      '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(on?9:7)+'"/>'+
      '<text x="'+(x+(flip?-12:12)).toFixed(1)+'" y="'+(y+dy).toFixed(1)+'" text-anchor="'+(flip?'end':'start')+'">'+esc(short[p.id])+'</text><title>'+esc(p.title)+'</title></g>';
  }).join("");
  $("indStatesMap").innerHTML='<rect x="0" y="0" width="700" height="460" fill="#edf4f0"/>'+paths+marks;
  $("indStatesMap").querySelectorAll("[data-region-pin]").forEach(node=>{
    const change=()=>{region=node.dataset.regionPin;regionPolicy=0;renderRegion();};
    node.onclick=change;
    node.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();change();$("indStatesMap").querySelector('[data-region-pin="'+region+'"]')?.focus({preventScroll:true});}};
  });
 }
 function renderRegion(){
  const p=find(F.issues,region),selected=p.policies[regionPolicy];
  $("indRegionName").textContent=p.title;$("indRegionStatus").textContent=p.status;
  $("indRegionFacts").textContent=p.facts;$("indRegionStake").textContent=p.stake;
  $("indRegionSides").innerHTML=p.sides.map(s=>'<span>'+esc(s)+'</span>').join("");
  $("indRegionQuestion").textContent="Что делать: "+p.point+"?";
  $("indRegionPicker").innerHTML=F.issues.map(x=>'<button type="button" data-region="'+x.id+'" aria-pressed="'+(region===x.id)+'" class="'+(region===x.id?'active':'')+'">'+esc(x.title)+'</button>').join("");
  $("indRegionPolicies").innerHTML=p.policies.map((x,i)=>'<button type="button" data-region-policy="'+i+'" aria-pressed="'+(i===regionPolicy)+'" class="'+(i===regionPolicy?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("indPolicyName").textContent=selected.name;$("indPolicyBenefit").textContent=selected.result;$("indPolicyRisk").textContent=selected.risk;
  $("indRegionPicker").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;regionPolicy=0;renderRegion();});
  $("indRegionPolicies").querySelectorAll("button").forEach(b=>b.onclick=()=>{regionPolicy=Number(b.dataset.regionPolicy);renderRegion();});
  renderMap();
 }
 $("indFederalProcess").innerHTML=F.process.map((s,i)=>'<div class="ind-process-step"><small>0'+(i+1)+'</small><b>'+esc(s.name)+'</b><p>'+esc(s.detail)+'</p></div>').join("");
 const stat=(label,value,sub,flag=false)=>'<div class="stat'+(flag?' ind-low':'')+'"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><span>'+esc(sub)+'</span></div>';
 $("indEconomicStats").innerHTML=[
  stat("Население",format(D.economy.population/1e6)+" млн","Жителей"),
  stat("ВВП",format(D.economy.gdp)+" млрд","Междунар. $ 2011 г."),
  stat("ВВП на человека",format(D.economy.percap,0),"Междунар. $ 2011 г.",true),
  stat("Сельское хозяйство",format(D.economy.agri,0)+"%","Доля ВВП"),
  stat("Промышленность",format(D.economy.industry,0)+"%","Доля ВВП"),
  stat("Инвестиции",format(D.economy.investment,0)+"%","Доля ВВП")
 ].join("");
 $("indPlanIntro").textContent=E.intro;
 function renderModel(){
  const m=find(E.models,model);
  $("indDevelopmentModels").innerHTML=E.models.map((p,i)=>'<button class="ind-model-button'+(p.id===model?' active':'')+'" type="button" data-model="'+p.id+'" aria-pressed="'+(p.id===model)+'"><small>0'+(i+1)+' · '+esc(p.label)+'</small><strong>'+esc(p.name)+'</strong></button>').join("");
  $("indDevelopmentName").textContent=m.name;$("indDevelopmentSubtitle").textContent=m.assets;
  $("indDevelopmentGoal").textContent=m.goal;$("indDevelopmentBenefit").textContent=m.supports;
  $("indDevelopmentNeeds").innerHTML=m.needs.map(x=>'<li>'+esc(x)+'</li>').join("");
  $("indDevelopmentRisk").textContent=m.price;$("indDevelopmentPartners").textContent=m.partners;
  $("indDevelopmentModels").querySelectorAll("button").forEach(b=>b.onclick=()=>{model=b.dataset.model;renderModel();});
 }
 function renderResource(){
  const r=find(E.resources,resource);
  $("indEconomicResources").innerHTML=E.resources.map(x=>'<button type="button" data-resource="'+x.id+'" aria-pressed="'+(x.id===resource)+'" class="'+(x.id===resource?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("indResourceName").textContent=r.name;$("indResourceDetail").textContent=r.detail;
  $("indEconomicResources").querySelectorAll("button").forEach(b=>b.onclick=()=>{resource=b.dataset.resource;renderResource();});
 }
 function renderFunding(){
  const f=find(E.funding,funding);
  $("indFundingOptions").innerHTML=E.funding.map(x=>'<button type="button" data-funding="'+x.id+'" aria-pressed="'+(funding===x.id)+'" class="'+(funding===x.id?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("indFundingName").textContent=f.name;$("indFundingDetail").textContent=f.text;
  $("indFundingOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{funding=b.dataset.funding;renderFunding();});
 }
 $("indDiplomacyIntro").textContent=X.intro;
 const diplomatPositions={yug:[195,75],us:[85,188],ussr:[475,78],prc:[560,194],pak:[530,323],afro:[190,333],uk:[325,43]};
 function renderNetwork(){
  const center=[331,224],s='<svg viewBox="0 0 660 415" role="group" aria-label="Дипломатические связи Нью-Дели">'+
   '<defs><radialGradient id="indNW"><stop offset="0" stop-color="#f9f9f2"/><stop offset="1" stop-color="#edf3ec"/></radialGradient></defs>'+
   '<rect width="660" height="415" rx="12" fill="url(#indNW)"/>'+
   X.cases.map(x=>'<path class="ind-network-line" d="M'+center.join(" ")+' L'+diplomatPositions[x.id].join(" ")+'"/>').join("")+
   '<circle cx="'+center[0]+'" cy="'+center[1]+'" r="35" class="ind-network-center"/>'+
   '<text x="'+center[0]+'" y="'+(center[1]+3)+'" text-anchor="middle" class="ind-network-center-text">ДЕЛИ</text>'+
   X.cases.map(x=>{const p=diplomatPositions[x.id],on=x.id===caseId,labels={yug:"Югославия",us:"США",ussr:"СССР",prc:"КНР",pak:"Пакистан",afro:"Азия и Африка",uk:"Британия"},left=x.id==="prc"||x.id==="ussr"||x.id==="pak";
    return '<g role="button" tabindex="0" aria-label="'+esc(x.name)+'" data-dip-pin="'+x.id+'" class="ind-network-node'+(on?' active':'')+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(on?12:9)+'"/><text x="'+(p[0]+(left?-14:14))+'" y="'+(p[1]-11)+'" text-anchor="'+(left?'end':'start')+'">'+esc(labels[x.id])+'</text><title>'+esc(x.name)+'</title></g>';
   }).join("")+'</svg>';
  $("indDiplomaticNetwork").innerHTML=s;
  $("indDiplomaticNetwork").querySelectorAll("[data-dip-pin]").forEach(n=>{
    const change=()=>{caseId=n.dataset.dipPin;renderDiplomacy();};
    n.onclick=change;n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();change();$("indDiplomaticNetwork").querySelector('[data-dip-pin="'+caseId+'"]')?.focus({preventScroll:true});}};
  });
 }
 function renderDiplomacy(){
  const c=find(X.cases,caseId);
  $("indDiplomaticName").textContent=c.name;$("indDiplomaticStatus").textContent=c.status;
  $("indDiplomaticOpening").textContent=c.opening;$("indDiplomaticBenefit").textContent=c.gain;$("indDiplomaticLimit").textContent=c.limit;
  $("indDiplomaticCases").innerHTML=X.cases.map(x=>'<button type="button" data-dip="'+x.id+'" aria-pressed="'+(x.id===caseId)+'" class="'+(x.id===caseId?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("indDiplomaticCases").querySelectorAll("button").forEach(b=>b.onclick=()=>{caseId=b.dataset.dip;renderDiplomacy();});
  renderNetwork();
 }
 function renderApproach(){
  const a=find(X.approaches,approach);
  $("indDiplomacyApproaches").innerHTML=X.approaches.map(x=>'<button type="button" data-approach="'+x.id+'" aria-pressed="'+(x.id===approach)+'" class="'+(x.id===approach?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("indApproachName").textContent=a.name;$("indApproachDetail").textContent=a.detail;
  $("indDiplomacyApproaches").querySelectorAll("button").forEach(b=>b.onclick=()=>{approach=b.dataset.approach;renderApproach();});
 }
 $("indSources").innerHTML=D.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">'+esc(x.name)+' ↗</a>').join("");
 renderRegion();renderModel();renderResource();renderFunding();renderDiplomacy();renderApproach();
 tab(["federation","economy","diplomacy"].includes(location.hash.slice(1))?location.hash.slice(1):"federation");
})();