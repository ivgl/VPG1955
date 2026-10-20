"use strict";
/* VPI 1955 | France political mechanics v3. Interface only; no state writes or automatic judging. */
(function(){
const B=window.VPI_FRA_DRAFT,D=window.VPI_FRA_ATLAS_1955,G=window.VPI_FRA_GEO,E=window.VPI_FRA_EUROPE_MAP_1955;
if(!B||!D){console.error("France data missing");return}
const el=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const fmt=(x,d=0)=>Number(x).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
let tab="parliament",issue="algeria",party="radical",region="aures",actor="army",policy="reform",partner="frg",project="steel",sector="steel",lever=0;
const allTabs=["parliament","algeria","europe","planning"];
const parties=B.parliament.blocs,profiles=D.partyProfiles,issues=D.topics,seats=B.parliament.referenceMembers;
const votes=Object.fromEntries(issues.map(t=>[t.id,Object.fromEntries(parties.map(p=>[p.id,"undecided"]))]));
const sl={likely:"Скорее поддержат",conditional:"Нужны переговоры",opposed:"Скорее против",mixed:"Нет единой позиции"};
const sv={likely:0,conditional:1,mixed:2,opposed:3};
function goTab(id,scroll=false){if(!allTabs.includes(id))return;tab=id;document.querySelectorAll("[data-tab]").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("current",on);b.setAttribute("aria-selected",String(on))});document.querySelectorAll(".pane").forEach(p=>{const on=p.id===id;p.classList.toggle("current",on);p.hidden=!on});try{history.replaceState(null,"","#"+id)}catch(e){}if(scroll)document.querySelector("nav.tabs")?.scrollIntoView({behavior:"smooth",block:"start"})}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>goTab(b.dataset.tab)));
document.addEventListener("click",e=>{let jump=e.target.closest("[data-jump]");if(!jump)return;if(jump.dataset.issue&&issues.some(i=>i.id===jump.dataset.issue)){issue=jump.dataset.issue;renderPolitics()}goTab(jump.dataset.jump,true)});
goTab(allTabs.includes(location.hash.slice(1))?location.hash.slice(1):"parliament");
function politicalData(p){return profiles[p.id].estimates[issue]}
function renderPolitics(){
 const t=issues.find(x=>x.id===issue);
 el("fraIssueButtons").innerHTML=issues.map(x=>'<button data-topic="'+x.id+'" type="button" class="'+(x.id===issue?"active":"")+'" aria-pressed="'+(x.id===issue)+'">'+esc(x.name)+'</button>').join("");
 el("fraIssueQuestion").textContent=t.question;el("fraIssueConflict").textContent=t.conflict;
 el("fraIssueButtons").querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>{issue=b.dataset.topic;renderPolitics()});
 renderParties();renderPartyDetail();renderCoalition();
}
function renderParties(){
 const sorted=[...parties].sort((a,b)=>sv[politicalData(a)]-sv[politicalData(b)]);
 el("fraIssuePositionOverview").innerHTML=["likely","conditional","mixed","opposed"].map(st=>'<div class="stance-overview-cell stance-'+st+'"><strong>'+parties.filter(p=>politicalData(p)===st).length+'</strong><span>'+sl[st]+'</span></div>').join("");
 el("fraPartyCards").innerHTML=sorted.map(p=>{
  const st=politicalData(p),v=votes[issue][p.id],info=profiles[p.id];
  return '<article class="party-tile stance-'+st+(party===p.id?" selected":"")+'"><div class="party-tile-top"><button class="party-main" type="button" data-party-select="'+p.id+'"><strong>'+esc(p.name)+'</strong><small>'+p.seats1951+' мест</small></button><span class="stance-flag stance-'+st+'">'+sl[st]+'</span></div><p class="party-brief">'+esc(info.topic[issue][0])+'</p><div class="party-votes">'+[["yes","Поддержка"],["maybe","Обсуждать"],["no","Не рассчитывать"]].map(([key,name])=>'<button type="button" data-vote-party="'+p.id+'" data-vote="'+key+'" aria-pressed="'+(v===key)+'" class="vote-'+key+(v===key?" active":"")+'">'+name+'</button>').join("")+'</div></article>';
 }).join("");
 el("fraPartyCards").querySelectorAll("[data-party-select]").forEach(b=>b.onclick=()=>{party=b.dataset.partySelect;renderParties();renderPartyDetail()});
 el("fraPartyCards").querySelectorAll("[data-vote-party]").forEach(b=>b.onclick=()=>{party=b.dataset.voteParty;votes[issue][party]=votes[issue][party]===b.dataset.vote?"undecided":b.dataset.vote;renderParties();renderPartyDetail();renderCoalition()});
}
function renderPartyDetail(){
 const p=parties.find(x=>x.id===party),info=profiles[party],st=info.estimates[issue];
 el("fraPartyName").textContent=p.name;
 el("fraPartyTag").textContent=info.tag;
 el("fraPartyTag").style.setProperty("--party","#81988f");
 el("fraPartyForecast").className="party-forecast stance-"+st;el("fraPartyForecast").textContent=sl[st]+" по выбранному вопросу";
 el("fraPartyInterest").textContent=info.interest;
 el("fraPartyPosition").textContent=info.topic[issue][0];
 el("fraPartyConditions").textContent=info.topic[issue][1];
 el("fraPartySeats").textContent=p.seats1951+" из "+seats+" мест Национального собрания.";
}
function renderCoalition(){
 const v=votes[issue],group=k=>parties.filter(p=>v[p.id]===k),n=a=>a.reduce((s,p)=>s+p.seats1951,0),y=group("yes"),m=group("maybe"),no=group("no"),a=n(y),b=n(m);
 el("fraYesSeats").textContent=fmt(a)+" / "+seats;el("fraMaybeSeats").textContent=fmt(b);
 el("fraCoalitionTrack").innerHTML='<span class="coal-yes" style="width:'+(a/seats*100)+'%"></span><span class="coal-maybe" style="width:'+(b/seats*100)+'%"></span>';
 el("fraCoalitionFlag").textContent=a>=314?"Вы отметили большинство: "+a+" из "+seats+" мест. Для проведения инициативы закрепите поддержку фракций.":a+b>=314?"С учётом переговорных групп возможно большинство. Нужно договориться как минимум о "+(314-a)+" дополнительных местах.":"До большинства не хватает "+(314-a)+" мест. Найдите дополнительные группы для переговоров.";
 el("fraCoalitionDetail").textContent="Поддержка: "+(y.map(p=>p.name).join(", ")||"не отмечена")+". Переговоры: "+(m.map(p=>p.name).join(", ")||"не отмечены")+". Не рассчитывать: "+(no.map(p=>p.name).join(", ")||"нет")+".";
}
el("fraResetCoalition").onclick=()=>{parties.forEach(p=>votes[issue][p.id]="undecided");renderPolitics()};
el("fraCopyCoalition").onclick=async()=>{const grp=k=>parties.filter(p=>votes[issue][p.id]===k).map(p=>p.name).join(", ")||"не указано";
 const txt=["Франция · проект переговоров 1955","Инициатива: "+issues.find(x=>x.id===issue).name,"Поддержка: "+grp("yes"),"Переговоры: "+grp("maybe"),"Не рассчитывать: "+grp("no"),"Состав Национального собрания: "+seats+" мест, большинство — 314.","Договорённости с отмеченными группами и содержание законопроекта необходимо согласовать."].join("\n");
 try{await navigator.clipboard.writeText(txt);el("fraCopyStatus").textContent="Проект скопирован"}catch(e){el("fraCopyStatus").textContent="Буфер недоступен: скопируйте текст карточки вручную"}
};
renderPolitics();
// Correct geographical locations: linked map focus markers, NOT invented FLN control polygons.
const tiers={hotspot:"#aa6462",active:"#c78170",political:"#bba073",dispersed:"#bca78b",background:"#a6b0a4"};
function drawAlgeria(){
 const path=G?.algeria?.path;if(!path)return;
 el("fraAlgeriaMap").innerHTML='<defs><linearGradient id="algeriaShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8decb"/><stop offset="100%" stop-color="#efddbc"/></linearGradient></defs><path class="algeria-base" d="'+path+'"></path><path class="algeria-outline" d="'+path+'"></path>'+
 D.zones.map((z,k)=>'<g class="algeria-geo-node'+(z.id===region?" active":"")+'" data-region="'+z.id+'" tabindex="0" role="button" style="--zone:'+tiers[z.tier]+'" aria-label="'+esc(z.name)+' — '+esc(z.status)+'"><circle class="algeria-node-halo" cx="'+z.point[0]+'" cy="'+z.point[1]+'" r="'+(z.id==="aures"?30:25)+'"></circle><circle class="algeria-node-dot" cx="'+z.point[0]+'" cy="'+z.point[1]+'" r="14"></circle><text class="algeria-node-num" x="'+z.point[0]+'" y="'+(z.point[1]+4)+'" text-anchor="middle">'+(k+1)+'</text><title>'+esc(z.name)+" — "+esc(z.status)+'</title></g>').join("");
 el("fraAlgeriaMap").querySelectorAll("[data-region]").forEach(x=>{const choose=()=>{region=x.dataset.region;renderAlgeria()};x.addEventListener("click",choose);x.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}})});
}
function renderActors(){
 const z=D.zones.find(x=>x.id===region);if(!z.actors.includes(actor))actor=z.actors[0];
 el("fraRegionActors").innerHTML=z.actors.map(id=>{const a=B.algeria.actors.find(x=>x.id===id);return '<button type="button" data-actor="'+id+'" class="'+(actor===id?"active":"")+'">'+esc(a.name)+'</button>'}).join("");
 const a=B.algeria.actors.find(x=>x.id===actor);el("fraActorName").textContent=a.name;el("fraActorFocus").textContent=a.focus;el("fraActorMoves").textContent="Предмет переговоров: "+a.moves;
 el("fraRegionActors").querySelectorAll("[data-actor]").forEach(x=>x.onclick=()=>{actor=x.dataset.actor;renderActors()});
}
function renderAlgeria(){
 const z=D.zones.find(x=>x.id===region);
 el("fraRegionName").textContent=z.name;el("fraRegionStatus").textContent=z.status;
 el("fraRegionContext").textContent=z.situation;
 el("fraRegionRisks").innerHTML=z.risk.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraRegionSignals").innerHTML=z.signals.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraAlgeriaZones").innerHTML=D.zones.map((z,i)=>'<button type="button" class="'+(z.id===region?"active":"")+'" data-region-button="'+z.id+'"><span class="region-number">'+(i+1)+'</span>'+esc(z.name)+'</button>').join("");
 el("fraAlgeriaZones").querySelectorAll("[data-region-button]").forEach(x=>x.onclick=()=>{region=x.dataset.regionButton;renderAlgeria()});
 renderActors();drawAlgeria();renderAlgeriaPolicy();
}
function renderAlgeriaPolicy(){
 const p=D.algeriaPolicyPaths[policy],z=D.zones.find(x=>x.id===region);
 el("fraAlgeriaPolicyButtons").innerHTML=Object.values(D.algeriaPolicyPaths).map(x=>'<button type="button" data-algeria-path="'+x.id+'" class="'+(x.id===policy?"active":"")+'" aria-pressed="'+(x.id===policy)+'"><strong>'+esc(x.title)+'</strong><span>'+esc(x.subtitle)+'</span></button>').join("");
 el("fraAlgeriaPolicyTitle").textContent=p.title;el("fraAlgeriaPolicyCore").textContent=p.core;
 el("fraAlgeriaPolicySteps").innerHTML=p.agenda.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraAlgeriaPolicyObstacles").innerHTML=p.obstacles.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraAlgeriaPolicyConsequence").textContent="В регионе «"+z.name+"» необходимо учитывать: "+z.risk.slice(0,2).join("; ")+". Оцените расходы, полномочия ведомств и поддержку Ассамблеи.";
 el("fraAlgeriaParliamentJump").dataset.issue=p.parliamentTopic;
 el("fraAlgeriaPolicyButtons").querySelectorAll("[data-algeria-path]").forEach(x=>x.onclick=()=>{policy=x.dataset.algeriaPath;renderAlgeriaPolicy()});
}
renderAlgeria();
// Europe: compact West-European map beside issue barriers and negotiated proposals.
const codeEurope={France:"france",Germany:"frg",Italy:"ita",Belgium:"bel",Netherlands:"nld"};
function drawEurope(){
 if(!E)return;
 const selected=D.europeIssues.find(x=>x.id===project),germany=E.countries.find(c=>c.name==="Germany");
 const countryShapes=E.countries.map(c=>{
  const id=codeEurope[c.name]||"",isPriority=id&&selected.priorityPartners.includes(id);
  return '<path class="europe-country'+(id?" member"+(partner===id?" active":"")+(isPriority?" priority":""):"")+'" d="'+c.d+'"'+(id?' data-europe="'+id+'" role="button" tabindex="0" aria-label="'+esc(c.name)+'"':"")+'><title>'+esc(c.name)+'</title></path>';
 }).join("");
 const labels=E.labels.map(l=>{
  const emphasis=["france","frg","gdr","ita"].includes(l.id);
  return '<text x="'+l.x+'" y="'+l.y+'" class="europe-map-label'+(emphasis?" emphasis":"")+(l.id==="gdr"?" east-label":"")+'" text-anchor="middle">'+esc(l.title)+'</text>';
 }).join("");
 const legendPath='<path class="europe-gdr" d="'+E.gdrOutline+'" aria-label="ГДР — вне ЕОУС"><title>ГДР — вне ЕОУС</title></path>';
 const border='<path class="europe-germany-outline" d="'+germany.d+'"></path>';
 const lux='<circle class="europe-lux'+(partner==="lux"?" active":"")+'" data-europe="lux" role="button" tabindex="0" aria-label="Люксембург" cx="89" cy="237" r="8"><title>Люксембург · участник ЕОУС</title></circle>';
 el("fraEuropeMap").setAttribute("viewBox",E.viewBox);
 el("fraEuropeMap").innerHTML='<defs><linearGradient id="franceEuropeLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#edf6f0"/><stop offset="100%" stop-color="#e3eee8"/></linearGradient></defs>'+countryShapes+legendPath+border+lux+labels;
 el("fraEuropeMap").querySelectorAll("[data-europe]").forEach(x=>{const choose=()=>{partner=x.dataset.europe;renderPartners()};x.addEventListener("click",choose);x.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}})});
}
function renderPartners(){
 const i=D.europeIssues.find(x=>x.id===project),p=D.partners[partner];
 el("fraEuropePartners").innerHTML=B.europe.map(x=>'<button type="button" class="'+(partner===x.id?"active":"")+'" data-partner="'+x.id+'">'+esc(x.name)+'</button>').join("");
 el("fraEuropeName").textContent=p.name;el("fraEuropeIndustry").textContent=p.industry;el("fraEuropeInterest").textContent=p.interest;
 el("fraEuropeFriction").textContent=p.friction+(i.priorityPartners.includes(partner)?" Это важный участник выбранного проекта.":"");
 el("fraEuropePartners").querySelectorAll("[data-partner]").forEach(x=>x.onclick=()=>{partner=x.dataset.partner;renderPartners()});drawEurope();
}
function renderEuropeAgenda(){
 const i=D.europeIssues.find(x=>x.id===project);
 el("fraEuropeIssues").innerHTML=D.europeIssues.map(x=>'<button type="button" class="'+(project===x.id?"active":"")+'" data-eu-issue="'+x.id+'"><b>'+esc(x.name)+'</b><small>'+esc(x.status)+'</small></button>').join("");
 el("fraEuropeIssueStatus").textContent=i.status;el("fraEuropeIssueTitle").textContent=i.name;el("fraEuropeIssueCore").textContent=i.core;
 el("fraEuropeTradeoff").textContent="Французская дилемма: "+i.FrenchTradeoff;
 el("fraEuropeBarriers").innerHTML=i.barriers.map((x,k)=>'<article class="europe-barrier"><span>ПРЕПЯТСТВИЕ 0'+(k+1)+'</span><b>'+esc(x.title)+'</b><p>'+esc(x.detail)+'</p></article>').join("");
 el("fraEuropeIssueChoices").innerHTML=i.choices.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraEuropeIssueActors").innerHTML=i.stakeholders.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraEuropeIssueParliament").textContent=i.parliament;
 el("fraEuropeIssues").querySelectorAll("[data-eu-issue]").forEach(x=>x.onclick=()=>{project=x.dataset.euIssue;partner=D.europeIssues.find(y=>y.id===project).priorityPartners[0];renderEuropeAgenda();renderPartners()});
 el("fraEuropeToPlan").onclick=()=>{const q=D.europeIssues.find(x=>x.id===project);if(q.cross){sector=q.cross;lever=0;renderPlanning()}};
}
renderEuropeAgenda();renderPartners();
// Indicative planning: material dependencies, financing, competing programmes, no automatic bonuses.
const sectors=D.planSectors,names={energy:"Энергетика",steel:"Сталь и металлургия",rail:"Железные дороги",machines:"Машины и оборудование",agriculture:"Сельское хозяйство",housing:"Строительство и жильё"};
el("fraPlanStats").innerHTML=[["Инвестиции",fmt(D.economy.investmentPct)+"% ВВП","Доля инвестиций в экономике"],["Промышленность",fmt(D.economy.industryPct)+"%","Доля промышленности в ВВП"],["Экспорт",fmt(D.economy.tradeExports,2)+" млрд G$","Годовой объём"],["Импорт",fmt(D.economy.tradeImports,2)+" млрд G$","Годовой объём"]].map(s=>'<div class="plan-kpi"><span>'+s[0]+'</span><strong>'+s[1]+'</strong><small>'+s[2]+'</small></div>').join("");
function renderPlanning(){
 const s=sectors[sector],oldNames={energy:"Энергетика",steel:"Металлургия",rail:"Транспорт",machines:"Машины",agriculture:"Сельское хозяйство",housing:"Жильё"};
 el("fraPlanConstraints").innerHTML=D.planConstraints.map(c=>'<article class="plan-constraint'+(c.affected.includes(sector)?" related":"")+'"><div><b>'+esc(c.name)+'</b><span>'+(c.affected.includes(sector)?"Важно сейчас":"Общее ограничение")+'</span></div><p>'+esc(c.meaning)+'</p></article>').join("");
 el("fraPlanSectors").innerHTML=Object.keys(sectors).map((id,k)=>'<button type="button" class="'+(id===sector?"active":"")+'" data-sector="'+id+'"><small>0'+(k+1)+'</small><b>'+oldNames[id]+'</b></button>').join("");
 el("fraSectorTitle").textContent=names[sector];el("fraSectorAsset").textContent=s.interest;el("fraSectorRegion").textContent=s.region;
 el("fraSectorPeople").innerHTML=s.people.map(x=>'<span>'+esc(x)+'</span>').join("");
 el("fraSectorBottlenecks").innerHTML=s.bottleneck.map(x=>'<li>'+esc(x)+'</li>').join("");
 el("fraSectorDependencies").innerHTML=s.dependencies.map(x=>'<span>'+esc(x)+'</span>').join("");
 el("fraSectorPlan").textContent=s.plan;el("fraSectorParliament").textContent=s.parliament;el("fraSectorFinance").textContent=s.financing;
 el("fraSectorLinks").innerHTML=s.connections.map(id=>'<button type="button" data-sector-link="'+id+'">'+names[id]+' ↗</button>').join("");
 el("fraSectorLevers").innerHTML=s.levers.map((a,k)=>'<button type="button" data-project="'+k+'" aria-pressed="'+(k===lever)+'" class="plan-lever'+(k===lever?" active":"")+'"><span>ПРОЕКТ 0'+(k+1)+'</span><b>'+esc(a.title)+'</b></button>').join("");
 el("fraSectorLeverDetail").innerHTML='<div><b>Что нужно подтвердить</b><p>'+esc(s.levers[lever].condition)+'</p></div><div><b>Главное препятствие</b><p>'+esc(s.levers[lever].risk)+'</p></div>';
 el("fraSectorOutcome").textContent=s.outcome+". Масштаб изменений зависит от финансирования, договоров и фактического исполнения программы.";
 el("fraPlanSectors").querySelectorAll("[data-sector]").forEach(x=>x.onclick=()=>{sector=x.dataset.sector;lever=0;renderPlanning()});
 el("fraSectorLinks").querySelectorAll("[data-sector-link]").forEach(x=>x.onclick=()=>{sector=x.dataset.sectorLink;lever=0;renderPlanning()});
 el("fraSectorLevers").querySelectorAll("[data-project]").forEach(x=>x.onclick=()=>{lever=Number(x.dataset.project);renderPlanning()});
}
renderPlanning();
el("fraSources").innerHTML=D.sources.map(s=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.name)+' ↗</a>').join("");
})();
