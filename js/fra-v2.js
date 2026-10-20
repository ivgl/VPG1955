"use strict";
/* France 1955: strictly informational state; no automatic coalition votes, military scores or policy effects. */
(function(){
const base=window.VPI_FRA_DRAFT,atlas=window.VPI_FRA_ATLAS_1955,geo=window.VPI_FRA_GEO,eu=window.VPI1955_MAPS?.europe;
if(!base||!atlas){console.error("France atlas data not loaded");return}
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const fmt=(v,d=1)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
const tabNames=["parliament","algeria","europe","planning"];
const parties=base.parliament.blocs,topics=atlas.topics,partyProfile=atlas.partyProfiles;
const referenceSeats=base.parliament.referenceMembers;
const majority=Math.floor(referenceSeats/2)+1;
let topic="algeria",party="radical",region="aures",actor="nationalists",partner="frg",euIssue="steel",sector="steel";
const selectedVotes=Object.fromEntries(topics.map(t=>[t.id,Object.fromEntries(parties.map(p=>[p.id,"undecided"]))]));
function activateTab(id,scroll=false){
 if(!tabNames.includes(id))return;
 document.querySelectorAll(".tab").forEach(el=>{const on=el.dataset.tab===id;el.classList.toggle("current",on);el.setAttribute("aria-selected",String(on))});
 document.querySelectorAll(".pane").forEach(el=>{const on=el.id===id;el.classList.toggle("current",on);el.hidden=!on});
 try{history.replaceState(null,"","#"+id)}catch(e){}
 if(scroll)document.querySelector("nav.tabs")?.scrollIntoView({block:"start",behavior:"smooth"});
}
document.querySelectorAll("[data-tab]").forEach(el=>el.addEventListener("click",()=>activateTab(el.dataset.tab,false)));
document.addEventListener("click",e=>{
 const target=e.target.closest("[data-jump]");
 if(!target)return;
 if(target.dataset.issue &&topics.some(t=>t.id===target.dataset.issue)){topic=target.dataset.issue;renderPolitics()}
 activateTab(target.dataset.jump,true)
});
const initialHash=location.hash.replace("#","");
activateTab(tabNames.includes(initialHash)?initialHash:"parliament");
function getTopic(){return topics.find(t=>t.id===topic)}
function getProfile(id){return partyProfile[id]}
function renderPolitics(){
 $("fraIssueButtons").innerHTML=topics.map(t=>'<button type="button" data-topic="'+t.id+'" class="'+(t.id===topic?"active":"")+'" aria-pressed="'+(t.id===topic)+'">'+esc(t.name)+'</button>').join("");
 $("fraIssueQuestion").textContent=getTopic().question;
 $("fraIssueConflict").textContent=getTopic().conflict;
 $("fraIssueButtons").querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>{topic=b.dataset.topic;renderPolitics()});
 renderParties();renderPartyDetail();renderCoalition();
}
function renderParties(){
 $("fraPartyCards").innerHTML=parties.map(p=>{
  const conf=getProfile(p.id),vote=selectedVotes[topic][p.id];
  const opts=[["yes","Поддержка"],["maybe","Обсуждать"],["no","Против"]];
  return '<article class="party-tile'+(p.id===party?" selected":"")+'" style="--party:'+conf.color+'"><button type="button" class="party-main" data-party-select="'+p.id+'" aria-pressed="'+(p.id===party)+'"><strong>'+esc(p.name)+'</strong><small>'+p.seats1951+' мест · 1951</small></button>'+
  '<div class="party-brief">'+esc(conf.topic[topic][0])+'</div>'+
  '<div class="party-votes">'+opts.map(([v,label])=>'<button type="button" data-vote-party="'+p.id+'" data-vote="'+v+'" class="vote-'+v+(vote===v?" active":"")+'" aria-pressed="'+(vote===v)+'">'+label+'</button>').join("")+'</div></article>';
 }).join("");
 $("fraPartyCards").querySelectorAll("[data-party-select]").forEach(b=>b.onclick=()=>{party=b.dataset.partySelect;renderParties();renderPartyDetail()});
 $("fraPartyCards").querySelectorAll("[data-vote-party]").forEach(b=>b.onclick=()=>{party=b.dataset.voteParty;let old=selectedVotes[topic][party];selectedVotes[topic][party]=old===b.dataset.vote?"undecided":b.dataset.vote;renderParties();renderPartyDetail();renderCoalition()});
}
function renderPartyDetail(){
 const p=parties.find(x=>x.id===party),conf=getProfile(party);
 $("fraPartyName").textContent=p.name;$("fraPartyTag").textContent=conf.tag;
 $("fraPartyTag").style.setProperty("--party",conf.color);
 $("fraPartyInterest").textContent=conf.interest;
 $("fraPartyPosition").textContent=conf.topic[topic][0];
 $("fraPartyConditions").textContent=conf.topic[topic][1];
 $("fraPartySeats").textContent=p.seats1951+" мандатов в справочном составе 1951 года; текущая фракционная дисциплина 1955 года не установлена.";
}
function renderCoalition(){
 const votes=selectedVotes[topic],yes=parties.filter(p=>votes[p.id]==="yes"),maybe=parties.filter(p=>votes[p.id]==="maybe"),no=parties.filter(p=>votes[p.id]==="no");
 const count=a=>a.reduce((sum,p)=>sum+p.seats1951,0),yesCount=count(yes),maybeCount=count(maybe);
 $("fraYesSeats").textContent=fmt(yesCount,0)+" / "+referenceSeats;
 $("fraMaybeSeats").textContent=fmt(maybeCount,0);
 $("fraCoalitionTrack").innerHTML='<span class="coal-yes" style="width:'+(yesCount/referenceSeats*100)+'%"></span><span class="coal-maybe" style="width:'+(maybeCount/referenceSeats*100)+'%"></span>';
 $("fraCoalitionFlag").textContent=yesCount>=majority?"Условная численная опора по снимку 1951 года превышает половину. Реальные голоса не подтверждены.":yesCount+maybeCount>=majority?"С учётом переговорных групп численная опора может стать достаточной — но соглашений ещё нет.":"Отмеченная опора ниже справочной половины. Нужны дополнительные соглашения.";
 $("fraCoalitionDetail").textContent="Поддержка: "+(yes.length?yes.map(x=>x.name).join(", "):"не отмечена")+". Переговоры: "+(maybe.length?maybe.map(x=>x.name).join(", "):"не отмечены")+". Не рассчитывать: "+(no.length?no.map(x=>x.name).join(", "):"нет")+".";
}
$("fraResetCoalition").onclick=()=>{parties.forEach(p=>selectedVotes[topic][p.id]="undecided");renderPolitics()};
$("fraCopyCoalition").onclick=async()=>{
 const yes=parties.filter(p=>selectedVotes[topic][p.id]==="yes"),maybe=parties.filter(p=>selectedVotes[topic][p.id]==="maybe"),no=parties.filter(p=>selectedVotes[topic][p.id]==="no");
 const lines=["Франция · проект парламентской комбинации · 1955",getTopic().name,"Поддержка (намерение игрока): "+(yes.map(p=>p.name).join(", ")||"не указана"),"Переговоры: "+(maybe.map(p=>p.name).join(", ")||"не указаны"),"Не рассчитывать: "+(no.map(p=>p.name).join(", ")||"не указано"),"Числа — ориентир фракций 1951 года, не подтверждённые голоса 1955 года.","Политические позиции и действительные условия поддержки требуют подтверждения игровыми действиями."];
 try{await navigator.clipboard.writeText(lines.join("\n"));$("fraCopyStatus").textContent="Проект скопирован";}catch(e){$("fraCopyStatus").textContent="Копирование недоступно в браузере — используйте выделение текста карточки";}
};
renderPolitics();
// Algeria: five 1954 early FLN organizing areas plus separately contextualized Sahara.
// Polygon overlays clipped to geographic outline; NOT historic military control or precise boundaries.
function renderAlgeriaMap(){
 const shape=geo?.algeria;if(!shape)return;
 const defs='<defs><clipPath id="fraAlgeriaClip"><path d="'+shape.path+'"></path></clipPath></defs>';
 const polygons=atlas.zones.map(z=>'<polygon class="algeria-region'+(z.id===region?" active":"")+'" data-region="'+z.id+'" tabindex="0" role="button" aria-label="'+esc(z.name)+'" style="--zone:'+z.color+'" points="'+z.outline.match(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g).join(" ")+'"><title>'+esc(z.name)+' — '+esc(z.status)+'</title></polygon>').join("");
 const points=atlas.zones.map(z=>'<text class="algeria-graphic-label" x="'+z.pin[0]+'" y="'+(z.pin[1]-13)+'" text-anchor="middle">'+esc(z.mini)+'</text>').join("");
 const pinGroup=atlas.zones.map(z=>'<circle class="algeria-graphic-dot" cx="'+z.pin[0]+'" cy="'+z.pin[1]+'" r="4"></circle>').join("");
 $("fraAlgeriaMap").innerHTML=defs+'<path class="algeria-base" d="'+shape.path+'"></path><g clip-path="url(#fraAlgeriaClip)">'+polygons+'</g><path class="algeria-outline" d="'+shape.path+'"></path>'+pinGroup+points;
 $("fraAlgeriaMap").querySelectorAll("[data-region]").forEach(el=>{
  const select=()=>{region=el.dataset.region;renderAlgeria()};
  el.addEventListener("click",select);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select()}});
 });
}
function renderAlgeria(){
 const z=atlas.zones.find(x=>x.id===region);
 $("fraRegionName").textContent=z.name;
 $("fraRegionStatus").textContent=z.status;
 $("fraRegionContext").textContent=z.context;
 $("fraRegionDrivers").innerHTML=z.drivers.map(s=>'<li>'+esc(s)+'</li>').join("");
 $("fraRegionStakeholders").textContent=z.stakes;
 $("fraRegionPolitics").textContent=z.political;
 $("fraAlgeriaZones").innerHTML=atlas.zones.map(x=>'<button type="button" class="'+(x.id===region?"active":"")+'" data-region-button="'+x.id+'"><span style="background:'+x.color+'"></span>'+esc(x.name)+'</button>').join("");
 $("fraAlgeriaZones").querySelectorAll("[data-region-button]").forEach(el=>el.onclick=()=>{region=el.dataset.regionButton;renderAlgeria()});
 renderAlgeriaMap();
}
function renderActors(){
 $("fraActorButtons").innerHTML=base.algeria.actors.map(a=>'<button type="button" class="'+(actor===a.id?"active":"")+'" data-actor="'+a.id+'">'+esc(a.name)+'</button>').join("");
 const a=base.algeria.actors.find(x=>x.id===actor)||base.algeria.actors[0];
 $("fraActorName").textContent=a.name;$("fraActorFocus").textContent=a.focus;$("fraActorMoves").textContent=a.moves;
 $("fraActorButtons").querySelectorAll("[data-actor]").forEach(b=>b.onclick=()=>{actor=b.dataset.actor;renderActors()});
}
renderAlgeria();renderActors();
// ECSC partner reference map and issue-centric diplomatic agenda.
const EuropeIDs={France:"france",Germany:"frg",Italy:"ita",Belgium:"bel",Netherlands:"nld"};
function renderEuropeMap(){
 if(!eu)return;
 $("fraEuropeMap").innerHTML=eu.countries.map(c=>{const id=EuropeIDs[c.name]||"";
 return '<path class="europe-country'+(id?" member"+(partner===id?" active":""):"")+'" d="'+c.d+'"'+(id?' data-europe="'+id+'" role="button" tabindex="0" aria-label="'+esc(c.name)+'"':"")+'><title>'+esc(c.name)+'</title></path>';
 }).join("")+'<path class="europe-gdr" d="'+(eu.gdr.match(/M[^M]*/g)||[]).filter(x=>x.length>600).join("")+'" aria-label="ГДР"><title>ГДР · вне ЕОУС</title></path><circle class="europe-lux'+(partner==="lux"?" active":"")+'" data-europe="lux" role="button" tabindex="0" aria-label="Люксембург" cx="89" cy="237" r="6"><title>Люксембург</title></circle>';
 $("fraEuropeMap").querySelectorAll("[data-europe]").forEach(el=>{
  const f=()=>{partner=el.dataset.europe;renderPartners()};
  el.addEventListener("click",f);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}});
 });
}
function renderPartners(){
 $("fraEuropePartners").innerHTML=base.europe.map(p=>'<button type="button" class="'+(p.id===partner?"active":"")+'" data-partner="'+p.id+'">'+esc(p.name)+'</button>').join("");
 const p=atlas.partners[partner];
 $("fraEuropeName").textContent=p.name;$("fraEuropeIndustry").textContent=p.industry;
 $("fraEuropeInterest").textContent=p.interest;$("fraEuropeFriction").textContent=p.friction;
 $("fraEuropePartners").querySelectorAll("[data-partner]").forEach(el=>el.onclick=()=>{partner=el.dataset.partner;renderPartners()});
 renderEuropeMap();
}
function renderEuropeAgenda(){
 $("fraEuropeIssues").innerHTML=atlas.europeIssues.map(i=>'<button type="button" class="'+(euIssue===i.id?"active":"")+'" data-eu-issue="'+i.id+'"><b>'+esc(i.name)+'</b><small>'+esc(i.status)+'</small></button>').join("");
 const i=atlas.europeIssues.find(i=>i.id===euIssue);
 $("fraEuropeIssueStatus").textContent=i.status;$("fraEuropeIssueTitle").textContent=i.name;$("fraEuropeIssueCore").textContent=i.core;
 $("fraEuropeIssueActors").innerHTML=i.stakeholders.map(x=>'<li>'+esc(x)+'</li>').join("");
 $("fraEuropeIssueChoices").innerHTML=i.choices.map(x=>'<li>'+esc(x)+'</li>').join("");
 $("fraEuropeIssueParliament").textContent=i.parliament;
 $("fraEuropeIssues").querySelectorAll("[data-eu-issue]").forEach(el=>el.onclick=()=>{euIssue=el.dataset.euIssue;renderEuropeAgenda()});
}
renderPartners();renderEuropeAgenda();
// Planning: institutional, informational, does not infer percentage benefits.
const sectors=atlas.planSectors,sectorIDs=Object.keys(sectors);
$("fraPlanStats").innerHTML=[
["Инвестиции в экономике",fmt(atlas.economy.investmentPct,0)+"% ВВП","Игровой макропоказатель · не фонд Госплана"],
["Промышленность",fmt(atlas.economy.industryPct,0)+"%","Доля отраслей в игровом ВВП"],
["Экспорт",fmt(atlas.economy.tradeExports,2)+" млрд G$","Утверждённый стартовый объём"],
["Импорт",fmt(atlas.economy.tradeImports,2)+" млрд G$","Валютные закупки и поставки"]
].map(x=>'<div class="plan-kpi"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong><small>'+esc(x[2])+'</small></div>').join("");
function renderPlanning(){
 $("fraPlanSectors").innerHTML=sectorIDs.map((id,k)=>'<button type="button" class="'+(id===sector?"active":"")+'" data-sector="'+id+'"><small>0'+(k+1)+'</small><b>'+esc(({energy:"Энергетика",steel:"Металлургия",rail:"Транспорт",machines:"Машины",agriculture:"Сельское хозяйство",housing:"Жильё"})[id])+'</b></button>').join("");
 const s=sectors[sector],old=base.industries.find(x=>x.id===sector),names={energy:"Энергетика",steel:"Сталь и металлургия",rail:"Железные дороги",machines:"Машины и оборудование",agriculture:"Сельское хозяйство",housing:"Строительство и жильё"};
 $("fraSectorTitle").textContent=names[sector];
 $("fraSectorAsset").textContent=s.interest;
 $("fraSectorRegion").textContent=s.region;
 $("fraSectorPeople").innerHTML=s.people.map(x=>'<span>'+esc(x)+'</span>').join("");
 $("fraSectorBottlenecks").innerHTML=s.bottleneck.map(x=>'<li>'+esc(x)+'</li>').join("");
 $("fraSectorPlan").textContent=s.plan;
 $("fraSectorParliament").textContent=s.parliament;
 $("fraSectorLinks").innerHTML=s.connections.map(id=>'<button type="button" data-sector-link="'+id+'">'+esc(names[id])+' ↗</button>').join("");
 $("fraPlanSectors").querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{sector=b.dataset.sector;renderPlanning()});
 $("fraSectorLinks").querySelectorAll("[data-sector-link]").forEach(b=>b.onclick=()=>{sector=b.dataset.sectorLink;renderPlanning()});
}
renderPlanning();
$("fraSources").innerHTML=atlas.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">'+esc(x.name)+' ↗</a>').join("");
})();