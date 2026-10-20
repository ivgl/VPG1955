"use strict";
(function(){
const base=window.VPI_GBR_DRAFT,atlas=window.VPI_GBR_ATLAS_1955,world=window.VPI_GBR_WORLD;
if(!base||!atlas){console.error("GBR atlas data missing");return}
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=(v,dec=3)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:dec,maximumFractionDigits:dec});
const tabs=["sterling","empire","economy"];
let currentTab="sterling",selectedPlace="suez",selectedIndustry="ship",selectedSocial="labour",worldFilter="all";
function switchTab(id,move=true){
 if(!tabs.includes(id))return;
 currentTab=id;
 document.querySelectorAll("[data-gbr-tab]").forEach(el=>{const active=el.dataset.gbrTab===id;el.classList.toggle("active",active);el.setAttribute("aria-selected",String(active))});
 document.querySelectorAll(".pane").forEach(el=>{const active=el.id===id;el.classList.toggle("active",active);el.hidden=!active});
 document.querySelectorAll(".connection-link").forEach(el=>el.classList.toggle("active",el.dataset.jump===id));
 try{history.replaceState(null,"","#"+id)}catch{}
 if(move)document.querySelector("nav.tabs")?.scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll("[data-gbr-tab]").forEach(el=>el.addEventListener("click",()=>switchTab(el.dataset.gbrTab,false)));
document.addEventListener("click",e=>{
 const jump=e.target.closest("[data-jump]");
 if(jump){switchTab(jump.dataset.jump,true);return}
 const anchor=e.target.closest("[data-jump-anchor]");
 if(anchor){$(anchor.dataset.jumpAnchor)?.scrollIntoView({behavior:"smooth",block:"start"})}
});
// Парламент задаёт политическую рамку и расположен до национальных механик.
const parliament=document.getElementById("vpi-parliament-gbr");
const linksStart=document.querySelector(".connections");
if(parliament && linksStart)linksStart.parentNode.insertBefore(parliament,linksStart);
const fi=atlas.gameState;
const stats=[
 {name:"Экспорт · 1955",value:money(fi.exports)+" млрд G$",note:"Внешние поставки, игровая экономика"},
 {name:"Импорт · 1955",value:money(fi.imports)+" млрд G$",note:"Закупки товаров и услуг"},
 {name:"Сальдо внешней торговли",value:(fi.netExports<0?"−":"+")+money(Math.abs(fi.netExports))+" млрд G$",note:"Экспорт минус импорт",highlight:true},
 {name:"Резервы · старт 1955",value:money(fi.reserves)+" млрд G$",note:"Игровой внешний резерв, не долларовая наличность"}
];
$("sterlingStats").innerHTML=stats.map(s=>'<div class="stat-tile'+(s.highlight?" subdued":"")+'"><span>'+esc(s.name)+'</span><strong>'+esc(s.value)+'</strong><small>'+esc(s.note)+'</small></div>').join("");
const filters=[
 ["all","Все объекты"],
 ["colony","Территории"],
 ["agreement","По договорам"],
 ["commonwealth","Партнёры"],
 ["home","Базы метрополии"]
];
function isShown(x){return worldFilter==="all"||x.type===worldFilter}
const project=(lon,lat)=>[(lon+180)*960/360,(84-lat)*490/168];
function shapeType(t){return ["colony","agreement","commonwealth","home"].includes(t.type)?t.type:"agreement"}
function renderWorld(){
 if(!world?.paths){$("empireMap").innerHTML='<text x="480" y="245" text-anchor="middle">Карта недоступна</text>';return}
 const background=world.paths.map(x=>'<path class="world-shape" d="'+x.d+'"><title>'+esc(x.name)+'</title></path>').join("");
 const points=base.territories.map(t=>{const [x,y]=project(t.lon,t.lat);const cls="world-point "+shapeType(t);
  return '<circle class="'+cls+'" data-map-place="'+esc(t.id)+'" tabindex="0" role="button" aria-label="'+esc(t.name)+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7"><title>'+esc(t.name)+'</title></circle>';
 }).join("");
 $("empireMap").innerHTML=background+points+'<text id="mapSelectedLabel" class="map-selected-label" x="20" y="468"></text>';
 $("empireMap").querySelectorAll("[data-map-place]").forEach(el=>{
  const go=()=>choosePlace(el.dataset.mapPlace);
  el.addEventListener("click",go);
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}});
 });
 $("territoryButtons").innerHTML=base.territories.map(t=>'<button type="button" class="node-button" data-node-place="'+esc(t.id)+'"><span>'+esc(t.name)+'</span></button>').join("");
 $("territoryButtons").querySelectorAll("[data-node-place]").forEach(el=>el.onclick=()=>choosePlace(el.dataset.nodePlace));
 $("baseFilters").innerHTML=filters.map(([key,label])=>'<button type="button" data-world-filter="'+key+'">'+label+'</button>').join("");
 $("baseFilters").querySelectorAll("[data-world-filter]").forEach(el=>el.onclick=()=>{worldFilter=el.dataset.worldFilter;refreshWorldFilter()});
 refreshWorldFilter();choosePlace(selectedPlace);
}
function refreshWorldFilter(){
 $("baseFilters").querySelectorAll("[data-world-filter]").forEach(el=>{let a=el.dataset.worldFilter===worldFilter;el.classList.toggle("active",a);el.setAttribute("aria-pressed",String(a))});
 base.territories.forEach(t=>{let visible=isShown(t);
  const marker=$("empireMap").querySelector('[data-map-place="'+t.id+'"]');
  const node=$("territoryButtons").querySelector('[data-node-place="'+t.id+'"]');
  if(marker)marker.style.display=visible?"":"none";
  if(node)node.hidden=!visible;
 });
 $("empireTotal").textContent=base.territories.filter(isShown).length+" / "+base.territories.length+" объектов";
}
function renderTags(id,arr,cls="clean-list"){ $(id).innerHTML=(arr||[]).map(x=>'<li>'+esc(x)+'</li>').join("")}
function choosePlace(id){
 const t=base.territories.find(x=>x.id===id);if(!t)return;
 selectedPlace=id;
 if(!isShown(t)){worldFilter="all";refreshWorldFilter()}
 const more=atlas.territoryNotes[id]||{stakeholders:[],frictions:[],options:[],links:[]};
 const labels={colony:"Зависимая территория",agreement:"Договорные права",commonwealth:"Независимый партнёр",home:"Метрополия"};
 $("placeName").textContent=t.name;$("placeType").textContent=labels[t.type]||t.type;
 $("placeIssue").textContent=more.issue||t.role;
 $("placeFacility").textContent=t.facility||"Военные и гражданские коммуникации";
 $("placeScale").textContent=t.baseSize||"Роль зависит от объекта";
 $("placeLegal").textContent=t.status+". "+t.access+".";
 $("placeRole").textContent=t.role;
 renderTags("placeStakeholders",more.stakeholders);renderTags("placeFrictions",more.frictions);
 renderTags("placeOptions",more.options);
 $("placeLinks").innerHTML=(more.links||[]).map(link=>{
  const destination=base.territories.find(x=>x.id===link);return destination?'<button type="button" data-related="'+esc(link)+'">'+esc(destination.name)+' ↗</button>':""
 }).join("");
 $("placeLinks").querySelectorAll("[data-related]").forEach(b=>b.onclick=()=>choosePlace(b.dataset.related));
 $("territoryButtons").querySelectorAll("[data-node-place]").forEach(b=>b.classList.toggle("active",b.dataset.nodePlace===id));
 $("empireMap").querySelectorAll("[data-map-place]").forEach(el=>{const active=el.dataset.mapPlace===id;el.classList.toggle("active",active);el.setAttribute("r",active?"10":"7")});
 $("mapSelectedLabel").textContent="Выбрано: "+t.name;
}
renderWorld();
const industries=base.industries;
const industryNames={coal:"Уголь",ship:"Судостроение",textile:"Текстиль",cars:"Автомобили",aero:"Авиация"};
function renderIndustries(){
 $("industryButtons").innerHTML=industries.map((x,i)=>'<button type="button" data-industry="'+esc(x.id)+'" class="'+(selectedIndustry===x.id?"active":"")+'" aria-pressed="'+(selectedIndustry===x.id)+'"><small>0'+(i+1)+'</small><b>'+esc(industryNames[x.id]||x.name)+'</b><span>'+esc(x.tag)+'</span></button>').join("");
 const x=industries.find(y=>y.id===selectedIndustry)||industries[0],v=atlas.sectorNotes[x.id];
 $("industryName").textContent=x.name;
 $("industryIntro").textContent=x.asset;
 $("industryRegion").textContent="Основные районы · "+v.region;
 $("industryOwner").textContent=v.ownership;
 $("industryProblems").textContent=x.limitation+". "+v.pressure;
 $("industryTrade").textContent=v.trade;
 const renderPills=(id,items)=>$(id).innerHTML=items.map(a=>'<span>'+esc(a)+'</span>').join("");
 renderPills("industryActors",v.groups);renderPills("industryInputs",v.inputs);
 $("industryOptions").innerHTML=v.choices.map((a,i)=>'<div><small>Возможность '+(i+1)+'</small><strong>'+esc(a)+'</strong></div>').join("");
 $("industryPressure").textContent="Политический риск: "+v.pressure;
 $("industryButtons").querySelectorAll("[data-industry]").forEach(b=>b.onclick=()=>{selectedIndustry=b.dataset.industry;renderIndustries()});
}
renderIndustries();
const socials=atlas.socialNotes,keys=Object.keys(socials);
function renderSocial(){
 $("socialButtons").innerHTML=keys.map((key,i)=>{
  let d=socials[key];return '<button type="button" data-social="'+key+'" class="'+(selectedSocial===key?"active":"")+'" aria-pressed="'+(selectedSocial===key)+'"><small>0'+(i+1)+'</small><span><strong>'+esc(d.title)+'</strong><em>'+esc(d.sub)+'</em></span><i aria-hidden="true">↗</i></button>'
 }).join("");
 const x=socials[selectedSocial];
 $("socialTitle").textContent=x.title;$("socialStatus").textContent=x.status;
 $("socialSubtitle").textContent=x.sub;
 $("socialForces").innerHTML=x.forces.map(a=>'<span>'+esc(a)+'</span>').join("");
 $("socialTension").textContent=x.tension;
 $("socialOpportunity").textContent=x.opportunity;
 $("socialButtons").querySelectorAll("[data-social]").forEach(b=>b.onclick=()=>{selectedSocial=b.dataset.social;renderSocial()});
}
renderSocial();
$("gbrSources").innerHTML=atlas.sourceLinks.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a>').join("");
let hash=location.hash.replace("#","");
switchTab(tabs.includes(hash)?hash:"sterling",false);
})();