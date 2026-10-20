"use strict";
/* ФРГ 1955. Интерфейс базового состояния; данные не меняются от кликов по карте и отраслям. */
(function(){
const D=window.VPI_FRG_ATLAS_1955,G=window.VPI1955_MAPS?.germany;
if(!D||!G){console.error("FRG 1955: missing atlas or geography");return}
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ul=arr=>arr.map(x=>'<li>'+esc(x)+'</li>').join("");
const pills=arr=>arr.map(x=>'<span>'+esc(x)+'</span>').join("");
const names={sovereignty:"Суверенитет",economy:"Экономика и общество",division:"Германский вопрос"};
const panes=["sovereignty","economy","division"];
let sector="ruhr",territory="berlin";
function activatePane(id,scroll=false){
 if(!panes.includes(id))return;
 document.querySelectorAll(".tab").forEach(el=>{const selected=el.dataset.tab===id;el.classList.toggle("active",selected);el.setAttribute("aria-selected",String(selected))});
 document.querySelectorAll(".pane").forEach(el=>{el.hidden=el.id!==id;el.classList.toggle("active",el.id===id)});
 try{history.replaceState(null,"","#"+id)}catch(e){}
 if(scroll)document.querySelector(".tabs")?.scrollIntoView({block:"start",behavior:"smooth"});
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>activatePane(b.dataset.tab)));
document.addEventListener("click",ev=>{
 const el=ev.target.closest("[data-jump]");if(!el)return;
 if(el.dataset.sector&&D.sectors.some(s=>s.id===el.dataset.sector)){sector=el.dataset.sector;renderIndustry()}
 if(el.dataset.territory&&D.division.some(s=>s.id===el.dataset.territory)){territory=el.dataset.territory;renderTerritory()}
 activatePane(el.dataset.jump,true)
});
activatePane(panes.includes(location.hash.slice(1))?location.hash.slice(1):"sovereignty");
// Суверенитет: все три направления раскрыты; три типа полномочий, три группы препятствий.
function renderTracks(){
 $("frgTracks").innerHTML=D.tracks.map(t=>
  '<article class="track" id="frg-track-'+t.id+'">'+
  '<div class="track-header"><div><span class="eyebrow">НАПРАВЛЕНИЕ '+t.number+'</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.strap)+'</p></div><span class="track-state">'+esc(t.status)+'</span></div>'+
  '<p class="track-overview">'+esc(t.overview)+'</p>'+
  '<div class="track-main-problem"><span>ГЛАВНЫЙ ОГРАНИЧИТЕЛЬ</span><strong>'+esc(t.central)+'</strong></div>'+
  '<div class="track-grid"><div><h4>Текущее положение</h4><div class="track-facts">'+t.facts.map(([name,detail])=>'<div class="track-fact"><b>'+esc(name)+'</b><span>'+esc(detail)+'</span></div>').join("")+'</div></div>'+
  '<div><h4>Три узла проблем</h4><div class="track-frictions">'+t.frictions.map(([name,detail],i)=>'<div class="track-friction"><i>'+(i+1)+'</i><div><b>'+esc(name)+'</b><span>'+esc(detail)+'</span></div></div>').join("")+'</div></div></div>'+
  '<div class="track-bottom"><div><small>КТО ОПРЕДЕЛЯЕТ РЕШЕНИЕ</small><p>'+esc(t.agency)+'</p><small>ПОЛЕ ДЕЙСТВИЙ ПРАВИТЕЛЬСТВА</small><p>'+esc(t.policy)+'</p></div><div class="track-links">'+t.cross.map(x=>'<button type="button" data-jump="'+x.tab+'">'+esc(x.text)+' →</button>').join("")+'</div></div>'+
  '</article>').join("");
}
renderTracks();
// Промышленность: каждый узел связан с ресурсами, выпуском и институциональными ограничениями.
const order=D.sectors.map(s=>s.id);
function renderNetwork(){
 const stages=[
  {label:"01 / Топливо и металл",ids:["energy","ruhr"]},
  {label:"02 / Машины и химия",ids:["machines","chem"]},
  {label:"03 / Заводы и города",ids:["auto","housing"]}
 ];
 $("frgNetwork").innerHTML=stages.map((stage,i)=>
 '<div class="network-stage"><div class="network-stage-heading">'+esc(stage.label)+'</div>'+
 stage.ids.map(id=>{const s=D.sectors.find(x=>x.id===id);
 return '<button type="button" data-industry="'+s.id+'" class="network-node'+(sector===s.id?" active":"")+'" aria-pressed="'+(sector===s.id)+'"><strong>'+esc(s.short)+'</strong><span>'+esc(s.role)+'</span></button>'}).join("")+'</div>'
 ).join('<span class="network-arrow" aria-hidden="true">→</span>');
 $("frgNetwork").querySelectorAll("[data-industry]").forEach(b=>b.onclick=()=>{sector=b.dataset.industry;renderIndustry()});
}
function renderIndustry(){
 const s=D.sectors.find(s=>s.id===sector);
 $("frgBottleneckTitle").textContent=s.name;
 $("frgBottleneck").textContent=s.problem;
 $("frgNegotiation").textContent=s.bargain;
 $("frgIndustryTitle").textContent=s.name;
 $("frgIndustryPlace").textContent=s.place;
 $("frgIndustryRole").textContent=s.hook;
 $("frgInputs").innerHTML=ul(s.inbound);
 $("frgOutputs").innerHTML=ul(s.outbound);
 $("frgActors").innerHTML=pills(s.actors);
 $("frgSectorFederal").textContent=s.federal;
 $("frgSectorLinks").innerHTML=s.dependencies.filter(k=>order.includes(k)).map(id=>'<button type="button" data-linked-industry="'+id+'">Связанный узел: '+esc(D.sectors.find(x=>x.id===id).short)+' →</button>').join("");
 $("frgSectorLinks").querySelectorAll("[data-linked-industry]").forEach(b=>b.onclick=()=>{sector=b.dataset.linkedIndustry;renderIndustry()});
 renderNetwork();
}
function renderInstitutions(){
 $("frgInstitutions").innerHTML=D.social.map((s,i)=>
 '<article class="institution"><div class="institution-index">ИНСТИТУТ 0'+(i+1)+'</div><h4>'+esc(s.title)+'</h4><p class="institution-status">'+esc(s.status)+'</p>'+
 '<p class="institution-body">'+esc(s.rights)+'</p><div class="institution-divider"></div><b>Главное противоречие</b><p>'+esc(s.diagnosis)+'</p>'+
 '<b>С кем согласовывать</b><div class="stakeholders">'+pills(s.actors)+'</div>'+
 '<button type="button" class="text-link" data-jump="economy" data-sector="'+s.neighbour+'">Связь с отраслью: '+esc(D.sectors.find(x=>x.id===s.neighbour).short)+' →</button>'+
 '</article>').join("");
}
function renderFederalLinks(){
 $("frgFederalBridges").innerHTML=D.federal.map((x,i)=>
 '<article class="bridge"><span>0'+(i+1)+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.body)+'</p><button type="button" class="text-link" data-jump="'+x.route+'"'+(x.sector?' data-sector="'+x.sector+'"':'')+'>'+(x.sector?'Открыть промышленный узел':'Открыть суверенитет')+' →</button></article>').join("");
}
$("frgMetrics").innerHTML=[
 ["ВВП",D.stats.gdp.toLocaleString("ru-RU")+" млрд G$","Объём экономики"],
 ["Промышленность",D.stats.industry+"%","Доля ВВП"],
 ["Инвестиции",D.stats.invest+"% ВВП","Формирование капитала"],
 ["Экспорт",D.stats.exports.toLocaleString("ru-RU",{minimumFractionDigits:1,maximumFractionDigits:1})+" млрд G$","Внешние продажи"]
].map(([name,value,note])=>'<div class="metric"><small>'+name+'</small><strong>'+value+'</strong><span>'+note+'</span></div>').join("");
renderIndustry();renderInstitutions();renderFederalLinks();
// Карта: государственные территории и особые режимы. Восточные контуры без внутренних обводок.
const west=G.states.filter(s=>s.region==="west"),east=G.states.filter(s=>s.region==="east"),saar=G.states.filter(s=>s.region==="saar");
const pathGroup=(a,cls,id,label)=>'<g class="'+cls+'" data-map-territory="'+id+'" role="button" tabindex="0" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+a.map(s=>'<path d="'+s.d+'"></path>').join("")+'</g>';
function drawMap(){
 const highlightWest=territory==="unity"||territory==="trade";
 const highlightEast=territory==="gdr"||territory==="trade"||territory==="unity";
 const h=pathGroup(east,"map-gdr"+(highlightEast?" active":""),"gdr","Германская Демократическая Республика")+
 pathGroup(west,"map-frg"+(highlightWest?" active":""),"unity","Федеративная Республика Германия")+
 pathGroup(saar,"map-saar"+(territory==="saar"?" active":""),"saar","Саар")+
 '<g class="map-berlin'+(territory==="berlin"?" active":"")+'" role="button" tabindex="0" data-map-territory="berlin" aria-label="Западный Берлин"><circle cx="446" cy="199" r="13"></circle><circle class="core" cx="446" cy="199" r="4"></circle><title>Западный Берлин</title></g>'+
 '<text class="map-text west" x="190" y="333">ФРГ</text><text class="map-text east" x="415" y="320">ГДР</text><text class="map-text berlin" x="463" y="177">Берлин</text><text class="map-text saar" x="40" y="457">Саар</text>';
 $("frgMap").innerHTML=h;
 $("frgMap").querySelectorAll("[data-map-territory]").forEach(el=>{
  const choose=()=>{territory=el.dataset.mapTerritory;renderTerritory()};
  el.addEventListener("click",choose);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}});
 });
}
function renderTerritory(){
 const t=D.division.find(x=>x.id===territory);
 $("frgTerritoryNav").innerHTML=D.division.map(x=>'<button type="button" data-territory="'+x.id+'" aria-pressed="'+(territory===x.id)+'" class="'+(territory===x.id?"active":"")+'">'+esc(x.name)+'</button>').join("");
 $("frgTerritoryTitle").textContent=t.name;
 $("frgTerritoryStatus").textContent=t.status;
 $("frgTerritoryCore").textContent=t.core;
 $("frgTerritoryObstacle").textContent=t.vulnerability;
 $("frgTerritoryPartners").innerHTML=pills(t.partners);
 $("frgTerritoryRisks").innerHTML=ul(t.risks);
 $("frgInterfacesTitle").textContent=t.name+" · вопросы, которые нельзя обойти";
 $("frgInterfaces").innerHTML=t.interfaces.map((x,i)=>
 '<article class="interface-card"><span>КОНТУР 0'+(i+1)+'</span><h4>'+esc(x.label)+'</h4><p>'+esc(x.detail)+'</p></article>').join("");
 $("frgTerritoryDecision").textContent=t.decision+" "+t.tension;
 $("frgTerritoryNav").querySelectorAll("[data-territory]").forEach(b=>b.onclick=()=>{territory=b.dataset.territory;renderTerritory()});
 drawMap();
}
renderTerritory();
$("frgSources").innerHTML=D.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">'+esc(x.name)+' ↗</a>').join("");
})();
