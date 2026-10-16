"use strict";
/* France 1955: all interaction is research and proposals. Nothing is sent to a judge or automatically applied. */
(function(){
const src=window.VPI_FRA_DRAFT,geo=window.VPI_FRA_GEO,eu=window.VPI1955_MAPS?.europe;
if(!src){document.body.insertAdjacentText("afterbegin","Ошибка: справочник Франции не загрузился");return}
const d=JSON.parse(JSON.stringify(src));
const $=id=>document.getElementById(id);
const safe=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function tab(id){
 document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("current",on);b.setAttribute("aria-selected",String(on))});
 document.querySelectorAll(".pane").forEach(p=>{const on=p.id===id;p.classList.toggle("current",on);p.hidden=!on});
 if(history.replaceState)history.replaceState(null,"","#"+id);
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
const hash=location.hash.slice(1);if(["parliament","algeria","europe","planning"].includes(hash))tab(hash);
// Political groups are historic July 1951 reference sizes. By January 1955 those totals are no longer a current whip count.
const parties=d.parliament.blocs;
let selectedParty="radical";
const negotiation=new Set();
const palette=["#a65963","#6c90ab","#bf995d","#5d9c8e","#777e9e","#a6a881","#6a9caa","#9fa5a1"];
$("fraParliamentStack").innerHTML=parties.map((p,i)=>'<span role="button" tabindex="0" data-party="'+p.id+'" title="'+safe(p.name)+': '+p.seats1951+' мандатов в 1951" style="width:'+(p.seats1951/d.parliament.referenceMembers*100)+'%;background:'+palette[i]+'"></span>').join("");
$("fraPartyButtons").innerHTML=parties.map((p,i)=>'<button type="button" class="party-choice" data-party="'+p.id+'"><strong>'+safe(p.name)+'</strong><small>'+p.seats1951+' мандатов · 1951</small></button>').join("");
function showParty(id){
 const p=parties.find(x=>x.id===id);if(!p)return;selectedParty=id;
 $("fraPartyName").textContent=p.name;$("fraPartyCount").textContent="Исторический ориентир: "+p.seats1951+" депутатов в 1951 году";
 $("fraPartyStance").textContent=p.stance;$("fraPartyDeal").textContent=p.deal;
 $("fraPartyInclude").checked=negotiation.has(id);
 document.querySelectorAll("[data-party]").forEach(el=>{const on=el.dataset.party===id;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on))});
}
function showNegotiation(){
 const selected=parties.filter(x=>negotiation.has(x.id));
 const count=selected.reduce((s,x)=>s+x.seats1951,0);
 $("fraCoalitionSum").textContent=count+" / "+d.parliament.referenceMembers+" мест (состав 1951)";
 $("fraCoalitionNames").textContent=selected.length?selected.map(x=>x.name).join(" · "):"Пока никто не выбран";
}
document.querySelectorAll("[data-party]").forEach(el=>{const activate=()=>showParty(el.dataset.party);el.addEventListener("click",activate);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate()}})});
$("fraPartyInclude").addEventListener("change",()=>{if($("fraPartyInclude").checked)negotiation.add(selectedParty);else negotiation.delete(selectedParty);showNegotiation()});
$("fraCoalitionReset").addEventListener("click",()=>{negotiation.clear();showParty(selectedParty);showNegotiation()});
showParty(selectedParty);showNegotiation();
// Algeria - an informational map with genuine actor differences, not fictional 0..100 loyalty.
const actorData=d.algeria.actors;
let actorCurrent=actorData[0].id;
$("fraAlgeriaActors").innerHTML=actorData.map(x=>'<button class="actor-btn" type="button" data-actor="'+x.id+'">'+safe(x.name)+'</button>').join("");
function showActor(id){
 const a=actorData.find(x=>x.id===id);if(!a)return;actorCurrent=id;
 $("fraActorName").textContent=a.name;$("fraActorFocus").textContent=a.focus;$("fraActorMoves").textContent=a.moves;
 document.querySelectorAll("[data-actor]").forEach(b=>b.classList.toggle("active",b.dataset.actor===id));
}
document.querySelectorAll("[data-actor]").forEach(b=>b.addEventListener("click",()=>showActor(b.dataset.actor)));
showActor("government");
const algeria=geo?.algeria;
if(algeria){
 const pins=d.algeria.regions.map((r,i)=>{const x=Math.round((r.lon+10)*28),y=Math.round((39-r.lat)*16);
  return '<circle class="fra-city-pin" role="button" tabindex="0" data-algeria-place="'+i+'" cx="'+x+'" cy="'+y+'" r="9" aria-label="'+safe(r.name)+'"><title>'+safe(r.name)+'</title></circle>';
 });
 $("fraAlgeriaMap").innerHTML='<path class="fra-algeria-land" d="'+algeria.path+'"></path>'+pins.join("");
}
$("fraAlgeriaPlaces").innerHTML=d.algeria.regions.map((r,i)=>'<button class="location-btn" type="button" data-algeria-place="'+i+'">'+safe(r.name)+'</button>').join("");
function placeAlgeria(i){
 const r=d.algeria.regions[i];if(!r)return;
 $("fraLocationNote").textContent=r.name+": "+r.notes;
 document.querySelectorAll("[data-algeria-place]").forEach(el=>{const on=Number(el.dataset.algeriaPlace)===i;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on))});
}
document.querySelectorAll("[data-algeria-place]").forEach(el=>{const fn=()=>placeAlgeria(Number(el.dataset.algeriaPlace));el.addEventListener("click",fn);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fn()}})});
placeAlgeria(1);
// ECSC 1955 partner cards and navigable geographic underpinning.
const partners=d.europe;
const europeNames={France:"france",Germany:"frg",Italy:"ita",Belgium:"bel",Netherlands:"nld"};
let partnerActive="frg";
if(eu){
 const shapes=eu.countries.map(c=>{const id=europeNames[c.name]||"";
  return '<path class="fra-eu-shape'+(id?' member':'')+'"'+(id?' role="button" tabindex="0" data-eu="'+id+'" aria-label="'+safe(c.name)+'"':'')+' d="'+c.d+'"><title>'+safe(c.name)+'</title></path>';
 });
 $("fraEuropeMap").innerHTML=shapes.join("");
}
$("fraEuropeanPartners").innerHTML=partners.map(p=>'<button type="button" class="partner-btn" data-eu="'+p.id+'">'+safe(p.name)+'</button>').join("");
function showEurope(id){
 const p=partners.find(x=>x.id===id);if(!p)return;partnerActive=id;
 $("fraEuropeName").textContent=p.name;$("fraEuropeStatus").textContent=p.status;$("fraEuropeSubject").textContent=p.subject;
 document.querySelectorAll("[data-eu]").forEach(el=>{const on=el.dataset.eu===id;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on))});
}
document.querySelectorAll("[data-eu]").forEach(el=>{const fn=()=>showEurope(el.dataset.eu);el.addEventListener("click",fn);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fn()}})});
showEurope("frg");
// Monnet-type indicative planning: firms are not direct ministries.
const industries=d.industries;
let sectorId="energy",importId="oil";
$("fraSectorChoices").innerHTML=industries.map(s=>'<button class="sector-choice" data-sector="'+s.id+'" type="button">'+safe(s.name)+'</button>').join("");
function showSector(id){
 const s=industries.find(x=>x.id===id);if(!s)return;sectorId=id;
 $("fraSectorTitle").textContent=s.name;$("fraSectorAsset").textContent="Исходная база: "+s.asset;$("fraSectorLimit").textContent=s.constraint;$("fraSectorStep").textContent=s.step;
 document.querySelectorAll("[data-sector]").forEach(b=>b.classList.toggle("active",b.dataset.sector===id));
 if(!$("fraDraft").hidden)makeDraft();
}
document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>showSector(b.dataset.sector)));
$("fraImports").innerHTML=d.imports.map(x=>'<button type="button" class="actor-btn" data-import="'+x.id+'">'+safe(x.name)+'</button>').join("");
function showImport(id){
 const t=d.imports.find(x=>x.id===id);if(!t)return;importId=id;
 $("fraImportTitle").textContent=t.name;$("fraImportPressure").textContent=t.pressure;$("fraImportNegotiations").textContent=t.negotiations;
 document.querySelectorAll("[data-import]").forEach(b=>b.classList.toggle("active",b.dataset.import===id));
 if(!$("fraDraft").hidden)makeDraft();
}
document.querySelectorAll("[data-import]").forEach(b=>b.addEventListener("click",()=>showImport(b.dataset.import)));
function showCofinance(){
 const n=Number($("fraCofinance").value);
 $("fraCofinanceValue").textContent=n+"% намеченного проекта";
 $("fraCofinanceText").textContent=n>=30?"Ориентир частного участия достигнут; без согласия предприятий это ещё не подписанный договор.":"При ограниченном частном участии возрастёт нагрузка на казну или придётся сократить масштаб проекта.";
 if(!$("fraDraft").hidden)makeDraft();
}
$("fraCofinance").addEventListener("input",showCofinance);
function makeDraft(){
 const s=industries.find(x=>x.id===sectorId),i=d.imports.find(x=>x.id===importId);
 $("fraDraftText").value=[
 "Французская республика · "+d.year+" год · черновик хозяйственного решения.",
 "Приоритет: "+s.name+".",
 "Предлагаемый проект: "+s.step,
 "Планируемое частное софинансирование: "+$("fraCofinance").value+"% (без подтверждённых договоров).",
 "Критическое ограничение для импорта: "+i.name+". "+i.pressure,
 "Прошу судью проверить законный бюджетный источник, согласие банков и предприятий, оборудование, внешнюю валюту, сроки (строительство не вводится в день публикации).",
 "Это предложение для литературного поста, не исполненная инвестиция и не утверждённые расходы."
 ].join("\n");
}
$("fraDraftGenerate").addEventListener("click",()=>{$("fraDraft").hidden=false;makeDraft()});
$("fraCopy").addEventListener("click",async()=>{
 try{if(!navigator.clipboard?.writeText)throw Error("unavailable");await navigator.clipboard.writeText($("fraDraftText").value);$("fraCopyStatus").textContent="Скопировано"}catch(e){$("fraDraftText").focus();$("fraDraftText").select();$("fraCopyStatus").textContent="Выделено, скопируйте вручную"}
});
showSector("energy");showImport("oil");showCofinance();
})();