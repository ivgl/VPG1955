"use strict";
/* West Germany 1955: official starting baseline, interactive policy dossiers, no automatic action outcomes. */
(function(){
const D=window.VPI_FRG_ATLAS_1955,G=window.VPI1955_MAPS?.germany;
if(!D||!G){console.error("FRG mechanics: data missing");return}
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const list=items=>items.map(s=>'<li>'+esc(s)+'</li>').join("");
const pills=items=>items.map(s=>'<span>'+esc(s)+'</span>').join("");
const makeButtons=(rows,selected,attr,titleFn)=>rows.map(x=>'<button type="button" data-'+attr+'="'+x.id+'" class="'+(x.id===selected?"active":"")+'" aria-pressed="'+(x.id===selected)+'">'+titleFn(x)+'</button>').join("");
const tabs=["sovereignty","economy","division","federation"];
const tabTitles={sovereignty:"Суверенитет",economy:"Экономика",division:"Германский вопрос",federation:"Федерация"};
let current="sovereignty",sec="paris",secChoice=0,sector="ruhr",lever=0,social="codetermination",division="berlin",land="nw",federalCase="housing";
function openTab(id,scroll=false){
 if(!tabs.includes(id))return;
 current=id;document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
 document.querySelectorAll(".pane").forEach(p=>{const on=p.id===id;p.classList.toggle("active",on);p.hidden=!on});
 try{history.replaceState(null,"","#"+id)}catch(e){}
 if(scroll)document.querySelector("nav.tabs")?.scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>openTab(b.dataset.tab)));
document.addEventListener("click",e=>{
 const j=e.target.closest("[data-go-tab]");if(!j)return;
 if(j.dataset.goSector && D.sectors.some(x=>x.id===j.dataset.goSector)){sector=j.dataset.goSector;lever=0;renderEconomy()}
 if(j.dataset.goRegion && D.division.some(x=>x.id===j.dataset.goRegion)){division=j.dataset.goRegion;renderDivision()}
 if(j.dataset.goLand && D.land.some(x=>x.id===j.dataset.goLand)){land=j.dataset.goLand;renderLand()}
 openTab(j.dataset.goTab,true);
});
openTab(tabs.includes(location.hash.slice(1))?location.hash.slice(1):"sovereignty");
function crossHtml(rows){return rows.map(l=>'<button type="button" data-go-tab="'+l.tab+'"'+(l.sector?' data-go-sector="'+l.sector+'"':'')+(l.region?' data-go-region="'+l.region+'"':'')+(l.land?' data-go-land="'+l.land+'"':'')+'>'+esc(l.label)+' ↗</button>').join("")}
function optionsHtml(rows,selected,attr){return rows.map(([title,detail,risk],i)=>'<button type="button" data-'+attr+'="'+i+'" aria-pressed="'+(selected===i)+'" class="option'+(selected===i?" active":"")+'"><small>НАПРАВЛЕНИЕ 0'+(i+1)+'</small><b>'+esc(title)+'</b><span>'+esc(detail)+'</span><em>Ограничение: '+esc(risk)+'</em></button>').join("")}
function renderSecurity(){
 const s=D.security.find(x=>x.id===sec),i=secChoice;
 $("frgSecurityTopics").innerHTML=makeButtons(D.security,sec,"security",x=>'<b>'+esc(x.title)+'</b><span>'+esc(x.tag)+'</span>');
 $("frgSecurityTitle").textContent=s.title;$("frgSecurityState").textContent=s.state;$("frgSecurityLead").textContent=s.lead;
 $("frgSecurityNeeds").innerHTML=list(s.need);$("frgSecurityStake").innerHTML=pills(s.stake);
 $("frgSecurityOptions").innerHTML=optionsHtml(s.choices.map(x=>[x.title,x.detail,x.cost]),secChoice,"security-option");
 $("frgSecurityCross").innerHTML=crossHtml(s.links);
 $("frgSecurityTopics").querySelectorAll("[data-security]").forEach(b=>b.onclick=()=>{sec=b.dataset.security;secChoice=0;renderSecurity()});
 $("frgSecurityOptions").querySelectorAll("[data-security-option]").forEach(b=>b.onclick=()=>{secChoice=Number(b.dataset.securityOption);renderSecurity()});
}
renderSecurity();
// Economy & social compact.
const F=n=>Number(n).toLocaleString("ru-RU",{minimumFractionDigits:1,maximumFractionDigits:1});
$("frgEcoMetrics").innerHTML=[
 ["ВВП",F(D.stats.gdp)+" млрд G$","Общий выпуск"],
 ["Промышленность",F(D.stats.industry)+"%","Доля экономики"],
 ["Инвестиции",F(D.stats.invest)+"%","Доля ВВП"],
 ["Экспорт",F(D.stats.exports)+" млрд G$","Внешние продажи"]
].map(([a,b,c])=>'<div class="metric"><span>'+esc(a)+'</span><strong>'+esc(b)+'</strong><small>'+esc(c)+'</small></div>').join("");
function renderEconomy(){
 const s=D.sectors.find(x=>x.id===sector);
 $("frgSectorButtons").innerHTML=makeButtons(D.sectors,sector,"sector",x=>'<b>'+esc(x.name)+'</b><small>'+esc(x.place)+'</small>');
 $("frgSectorName").textContent=s.name;$("frgSectorPlace").textContent=s.place;$("frgSectorHook").textContent=s.hook;$("frgSectorBottleneck").textContent=s.bottleneck;
 $("frgSectorNeeds").innerHTML=list(s.needs);$("frgSectorActors").innerHTML=pills(s.actors);
 $("frgSectorDeps").innerHTML=crossHtml(s.dependencies.filter(id=>D.sectors.some(x=>x.id===id)).map(id=>({tab:"economy",sector:id,label:D.sectors.find(x=>x.id===id).name})));
 $("frgSectorLevers").innerHTML=optionsHtml(s.levers,lever,"sector-option");
 $("frgSectorLeverDetail").textContent="Приоритеты согласования: "+s.levers[lever][1]+" Главный риск: "+s.levers[lever][2];
 $("frgSectorCross").innerHTML=crossHtml(s.links);
 $("frgSectorButtons").querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{sector=b.dataset.sector;lever=0;renderEconomy()});
 $("frgSectorLevers").querySelectorAll("[data-sector-option]").forEach(b=>b.onclick=()=>{lever=Number(b.dataset.sectorOption);renderEconomy()});
}
function renderSocial(){
 const s=D.social.find(x=>x.id===social);
 $("frgSocialButtons").innerHTML=makeButtons(D.social,social,"social",x=>'<b>'+esc(x.title)+'</b><small>'+esc(x.status)+'</small>');
 $("frgSocialTitle").textContent=s.title;$("frgSocialStatus").textContent=s.status;$("frgSocialTradeoff").textContent=s.tradeoff;
 $("frgSocialActors").innerHTML=pills(s.actors);$("frgSocialChoices").innerHTML=list(s.choices);
 $("frgSocialLink").innerHTML=crossHtml([{tab:"economy",sector:s.relation,label:"Открыть связанную отрасль: "+D.sectors.find(x=>x.id===s.relation).name}]);
 $("frgSocialButtons").querySelectorAll("[data-social]").forEach(b=>b.onclick=()=>{social=b.dataset.social;renderSocial()});
}
renderEconomy();renderSocial();
// German geographical question: western Länder one body, GDR no internal state borders, Berlin separate.
const g=G.states,chosenRegions={west:g.filter(s=>s.region==="west"),east:g.filter(s=>s.region==="east"),saar:g.filter(s=>s.region==="saar")};
function drawDivision(){
 const selected=division;
 const landPath=(arr,cls,regionId,label)=>'<g class="'+cls+(selected===regionId?" active":"")+'" role="button" tabindex="0" data-region="'+regionId+'" aria-label="'+label+'"><title>'+label+'</title>'+arr.map(s=>'<path d="'+s.d+'"></path>').join("")+'</g>';
 $("frgDivisionMap").innerHTML=
  landPath(chosenRegions.east,"geo-gdr","gdr","ГДР — германский вопрос")+
  landPath(chosenRegions.west,"geo-frg","unity","ФРГ — германское единство")+
  landPath(chosenRegions.saar,"geo-saar","saar","Саар")+
  '<g class="geo-berlin'+(selected==="berlin"?" active":"")+'" role="button" tabindex="0" data-region="berlin" aria-label="Западный Берлин"><circle cx="446" cy="199" r="13"></circle><circle cx="446" cy="199" r="4" class="geo-berlin-core"></circle><title>Западный Берлин</title></g>'+
  '<text class="geo-label" x="189" y="342">ФРГ</text><text class="geo-label muted" x="424" y="322">ГДР</text><text class="geo-label mini" x="463" y="176">Берлин</text>';
 $("frgDivisionMap").querySelectorAll("[data-region]").forEach(e=>{const f=()=>{division=e.dataset.region;renderDivision()};e.addEventListener("click",f);e.addEventListener("keydown",k=>{if(k.key==="Enter"||k.key===" "){k.preventDefault();f()}})});
}
function renderDivision(){
 const d=D.division.find(x=>x.id===division);
 $("frgRegionButtons").innerHTML=makeButtons(D.division,division,"division",x=>esc(x.name));
 $("frgRegionTitle").textContent=d.name;$("frgRegionStatus").textContent=d.status;$("frgRegionSubtitle").textContent=d.subtitle;$("frgRegionCore").textContent=d.core;
 $("frgRegionRisks").innerHTML=list(d.risks);$("frgRegionPartners").innerHTML=pills(d.partners);
 $("frgDivisionOptions").innerHTML=d.choices.map(([name,desc],i)=>'<div class="option static-option"><small>ДИПЛОМАТИЧЕСКИЙ ПУТЬ 0'+(i+1)+'</small><b>'+esc(name)+'</b><span>'+esc(desc)+'</span></div>').join("");
 $("frgDivisionCross").innerHTML=crossHtml([{tab:d.hook,label:"Перейти к связанным решениям Бонна"}]);
 $("frgRegionButtons").querySelectorAll("[data-division]").forEach(b=>b.onclick=()=>{division=b.dataset.division;renderDivision()});
 drawDivision();
}
document.querySelectorAll("[data-region-link]").forEach(b=>b.onclick=()=>{division=b.dataset.regionLink;renderDivision();openTab("division",true)});
renderDivision();
// Nine 1955 Länder, no separate "Saarland", Berlin nonvoting and not an ordinary Land.
const statesByCode={};for(const s of g)statesByCode[s.id]=s;
function drawFederation(){
 $("frgFederalMap").innerHTML=g.filter(s=>s.region==="east").map(s=>'<path class="land-backdrop-east" d="'+s.d+'"></path>').join("")+
 D.land.map(x=>{const s=statesByCode[x.state];return '<path class="land-shape'+(x.id===land?" active":"")+'" data-land="'+x.id+'" role="button" tabindex="0" aria-label="'+esc(x.name)+'" d="'+s.d+'"><title>'+esc(x.name)+'</title></path>'}).join("")+
 g.filter(s=>s.region==="saar").map(s=>'<path class="land-saar" d="'+s.d+'"><title>Саар — вне ФРГ</title></path>').join("")+
 '<circle cx="446" cy="199" r="8" class="land-berlin"><title>Берлин · особый статус</title></circle>'+
 '<text class="geo-label" x="170" y="338">ФРГ</text><text class="geo-label muted" x="425" y="318">ГДР</text>';
 $("frgFederalMap").querySelectorAll("[data-land]").forEach(el=>{const f=()=>{land=el.dataset.land;renderLand()};el.addEventListener("click",f);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}})});
}
function renderLand(){
 const x=D.land.find(y=>y.id===land);
 $("frgLandButtons").innerHTML=makeButtons(D.land,land,"land",x=>esc(x.name));
 $("frgLandName").textContent=x.name;$("frgLandFocus").textContent=x.focus;
 $("frgLandNeeds").innerHTML=list(x.needs);$("frgLandAuthority").textContent=x.jurisdiction;
 $("frgLandSectors").innerHTML=crossHtml(x.links.map(id=>({tab:"economy",sector:id,label:D.sectors.find(y=>y.id===id).name})));
 $("frgLandButtons").querySelectorAll("[data-land]").forEach(el=>el.onclick=()=>{land=el.dataset.land;renderLand()});
 drawFederation();
}
function renderFederalCase(){
 const p=D.federalCases.find(x=>x.id===federalCase);
 $("frgFederalCaseButtons").innerHTML=makeButtons(D.federalCases,federalCase,"federal-case",x=>'<b>'+esc(x.name)+'</b>');
 $("frgCaseTitle").textContent=p.name;$("frgCaseQuestion").textContent=p.question;
 $("frgCaseLevels").innerHTML=list(p.levels);$("frgCaseBarriers").innerHTML=list(p.bottlenecks);
 const btn=$("frgCaseJump");btn.textContent=p.tab==="sovereignty"?"Открыть федеральные политические решения →":"Посмотреть связанную отрасль →";
 btn.dataset.goTab=p.tab;if(p.sector)btn.dataset.goSector=p.sector;else delete btn.dataset.goSector;
 $("frgFederalCaseButtons").querySelectorAll("[data-federal-case]").forEach(b=>b.onclick=()=>{federalCase=b.dataset.federalCase;renderFederalCase()});
}
renderLand();renderFederalCase();
$("frgSources").innerHTML=D.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name)+' ↗</a>').join("");
})();
