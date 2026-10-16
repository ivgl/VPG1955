"use strict";
/* Japan 1955 demo: informational cards, optional draft composer and geographic supply overview.
   Never modifies official state or submits decisions to judge. */
(function(){
const d=window.VPI_JPN_DRAFT,geo=window.VPI_JPN_GEO;
const $=id=>document.getElementById(id);
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if(!d||d.status!=="DEMONSTRATION_ONLY"){document.body.insertAdjacentText("afterbegin","Не удалось загрузить данные японского черновика.");return}
const tabs=["politics","industry","islands"];
function openTab(id){
 if(!tabs.includes(id))return;
 document.querySelectorAll(".tab").forEach(b=>{const a=b.dataset.tab===id;b.classList.toggle("current",a);b.setAttribute("aria-selected",String(a))});
 document.querySelectorAll(".pane").forEach(el=>{const a=el.id===id;el.hidden=!a;el.classList.toggle("current",a)});
 if(history.replaceState)history.replaceState(null,"","#"+id);
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>openTab(b.dataset.tab)));
if(tabs.includes(location.hash.slice(1)))openTab(location.hash.slice(1));

const topics=[
 {id:"coalition",label:"Поддержка кабинета",text:"С кем заключить соглашение об инвеституре, бюджете и законодательной программе? Укажите конкретные уступки и способ провести голосование."},
 {id:"conservative",label:"Союз консерваторов",text:"Объединение возможно лишь после договорённости о лидерстве, партийных постах, программе, местных организациях и парламентской дисциплине. ЛДП ещё нет."},
 {id:"social",label:"Трудовые гарантии",text:"Ищите компромисс вокруг занятости, профсоюзов, жилья и условий модернизации, не предполагая единогласия социалистических фракций."},
 {id:"foreign",label:"Внешний курс",text:"Обсудите отношения с США, торговлю и дипломатические связи, учитывая разные позиции парламентариев. Нет заранее обязательных решений."}
];
let partyId="dem",topicId="coalition";
$("jpnSeatsNote").textContent=d.seatsNote;
$("partyButtons").innerHTML=d.parties.map(p=>'<button type="button" class="party-button" data-party="'+p.id+'"><strong>'+escapeHtml(p.name)+'</strong><span>'+escapeHtml(p.leader)+'</span></button>').join("");
$("negotiationTopics").innerHTML=topics.map(t=>'<button type="button" class="topic-btn" data-topic="'+t.id+'">'+escapeHtml(t.label)+'</button>').join("");
function renderPolitics(){
 const p=d.parties.find(p=>p.id===partyId),t=topics.find(t=>t.id===topicId);
 $("partyName").textContent=p.name;$("partyLeader").textContent="Лидер и фигуры: "+p.leader;
 $("partyPosition").textContent=p.position;$("partyPossible").textContent=p.possible;$("partyObstacle").textContent=p.obstacle;
 document.querySelectorAll("[data-party]").forEach(b=>{const on=b.dataset.party===partyId;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("[data-topic]").forEach(b=>{const on=b.dataset.topic===topicId;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 $("negotiationOutput").textContent="Собеседник: "+p.name+". Тема: "+t.label+". "+t.text+" Возможные предметы соглашения: "+p.possible+" Это информация для поста, не заключённый договор.";
}
$("partyButtons").addEventListener("click",e=>{const b=e.target.closest("[data-party]");if(b){partyId=b.dataset.party;renderPolitics()}});
$("negotiationTopics").addEventListener("click",e=>{const b=e.target.closest("[data-topic]");if(b){topicId=b.dataset.topic;renderPolitics()}});
renderPolitics();

// Industry uses concrete policy instruments. Options are intentions, not available action points.
const finance=d.instruments;
let sectorId="steel",financeId="bank",licenceId="review";
const agreements={};
for(const s of d.sectors)agreements[s.id]=new Set();
$("sectorButtons").innerHTML=d.sectors.map(s=>'<button type="button" class="sector-choice" data-sector="'+s.id+'"><span class="symbol">'+s.icon+'</span><strong>'+escapeHtml(s.name)+'</strong><small>'+escapeHtml(s.hubName)+'</small></button>').join("");
$("financeTools").innerHTML=finance.map(t=>'<button type="button" class="finance-tool" data-finance="'+t.id+'"><strong>'+escapeHtml(t.title)+'</strong>'+escapeHtml(t.description)+'</button>').join("");
$("licenceButtons").innerHTML=d.foreign.licences.map(t=>'<button type="button" class="licence-btn" data-licence="'+t.id+'">'+escapeHtml(t.title)+'</button>').join("");
const steps=[
 ["finance","Финансирование или договор с банком"],
 ["import","Валюта и разрешение на импорт"],
 ["supply","Контракт на сырьё и оборудование"],
 ["market","Проверенные покупатели / экспортный контракт"]
];
function sector(){return d.sectors.find(s=>s.id===sectorId)}
function preview(){
 const s=sector(),tool=finance.find(f=>f.id===financeId),licence=d.foreign.licences.find(l=>l.id===licenceId),done=agreements[s.id],left=steps.filter(x=>!done.has(x[0]));
 $("projectPreview").innerHTML='<strong>Сценарий промышленной программы</strong><p>Отрасль: '+escapeHtml(s.name)+'. Инструмент: '+escapeHtml(tool.title)+'. Импорт: '+escapeHtml(licence.title)+'.</p>'+
 '<p><b>Запланировано:</b> '+done.size+' из '+steps.length+' направлений. Это только состав задуманного игроком плана, не одобренные расходы и не выполненные этапы.</p>'+
 '<p><b>Что ещё стоит описать:</b> '+escapeHtml(left.length?left.map(x=>x[1]).join("; "):"подтверждение договоров, суммы, сроки, экспортные заказы и риски")+'.</p>';
 if(!$("industryDraft").hidden)makeDraft();
}
function showSector(){
 const s=sector();$("sectorTitle").textContent=s.name;$("sectorBase").textContent=s.base;
 $("sectorImports").textContent=s.imports;$("sectorFinance").textContent=s.financing;$("sectorMarket").textContent=s.market;$("sectorLimit").textContent=s.limit;
 $("projectChecks").innerHTML=steps.map(([id,label])=>'<label class="project-check"><input type="checkbox" data-step="'+id+'" '+(agreements[s.id].has(id)?"checked":"")+'><span>'+escapeHtml(label)+'</span></label>').join("");
 document.querySelectorAll("[data-sector]").forEach(b=>{const on=b.dataset.sector===s.id;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("[data-finance]").forEach(b=>{const on=b.dataset.finance===financeId;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("[data-licence]").forEach(b=>{const on=b.dataset.licence===licenceId;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 $("licenceNote").textContent=d.foreign.licences.find(x=>x.id===licenceId).detail;
 preview();
}
$("sectorButtons").addEventListener("click",e=>{const b=e.target.closest("[data-sector]");if(b){sectorId=b.dataset.sector;showSector()}});
$("financeTools").addEventListener("click",e=>{const b=e.target.closest("[data-finance]");if(b){financeId=b.dataset.finance;showSector()}});
$("licenceButtons").addEventListener("click",e=>{const b=e.target.closest("[data-licence]");if(b){licenceId=b.dataset.licence;showSector()}});
$("projectChecks").addEventListener("change",e=>{const input=e.target.closest("[data-step]");if(input){if(input.checked)agreements[sectorId].add(input.dataset.step);else agreements[sectorId].delete(input.dataset.step);preview()}});
function makeDraft(){
 const s=sector(),tool=finance.find(x=>x.id===financeId),lic=d.foreign.licences.find(x=>x.id===licenceId);
 const planned=steps.filter(x=>agreements[s.id].has(x[0])).map(x=>"- "+x[1]);
 $("industryDraftText").value=[
 "Япония, "+d.year+" год. ЧЕРНОВИК промышленного предложения для литературного поста.",
 "Отрасль: "+s.name+". Предпосылки: "+s.base,
 "Предлагаемое финансирование: "+tool.title+". "+tool.description,
 "Сценарный режим импорта: "+lic.title+". "+lic.detail,
 "Необходимые материалы и техника: "+s.imports,
 "Предполагаемый рынок: "+s.market,
 "Основное ограничение: "+s.limit,
 "Что намерен предпринять кабинет:",...(planned.length?planned:["- План ещё не заполнен"]),
 "Указать реальную стоимость, источники кредита, согласие предприятий, валютные лимиты, портовую логистику и сроки.",
 "Ни один отмеченный пункт не считается выполненным до вердикта судьи."
 ].join("\n");
}
$("industryDraftButton").addEventListener("click",()=>{$("industryDraft").hidden=false;makeDraft()});
$("industryCopy").addEventListener("click",async()=>{try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText($("industryDraftText").value);$("industryCopyStatus").textContent="Скопировано"}catch(e){$("industryDraftText").focus();$("industryDraftText").select();$("industryCopyStatus").textContent="Текст выделен: скопируйте вручную"}});
showSector();

// Geography only: modern outline; marks do not claim administrative power.
let portId="kitakyushu",shockId="normal";
const project=(lon,lat)=>[(lon-123.8)*30,(47.2-lat)*37];
function drawMap(){
 if(!geo?.islands){$("japanMap").textContent="Контуры островов недоступны";return}
 let base=geo.islands.map(p=>'<path class="island-shape" d="'+p+'"></path>').join("");
 const points=d.ports.map(n=>{const [x,y]=project(n.lon,n.lat);
   return '<circle role="button" tabindex="0" aria-label="'+escapeHtml(n.name)+'" data-port="'+n.id+'" class="island-pin" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="9"><title>'+escapeHtml(n.name)+'</title></circle>';
 }).join("");
 base+='<text class="map-water-label" x="40" y="290">Японское море</text><text class="map-water-label" x="526" y="600">Тихий океан</text>';
 $("japanMap").innerHTML=base+points;
 const activate=p=>{const fn=()=>showPort(p.dataset.port);p.addEventListener("click",fn);p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fn()}})};
 document.querySelectorAll("[data-port]").forEach(activate);
}
$("portButtons").innerHTML=d.ports.map(p=>'<button type="button" class="port-btn" data-port-choice="'+p.id+'">'+escapeHtml(p.name)+'</button>').join("");
$("shockButtons").innerHTML=d.shocks.map(s=>'<button type="button" class="shock-btn" data-shock="'+s.id+'">'+escapeHtml(s.name)+'</button>').join("");
function showPort(id){
 const p=d.ports.find(x=>x.id===id);if(!p)return;portId=id;
 $("portName").textContent=p.name;$("portArea").textContent=p.area;
 $("portSpecialty").textContent=p.specialty;$("portDependency").textContent=p.dependency;$("portOptions").textContent=p.options;
 document.querySelectorAll("[data-port],[data-port-choice]").forEach(el=>{const on=el.dataset.port===id||el.dataset.portChoice===id;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on));if(el.hasAttribute("r"))el.setAttribute("r",on?"13":"9")});
 renderShock();
}
function renderShock(){
 const shock=d.shocks.find(x=>x.id===shockId);
 document.querySelectorAll("[data-shock]").forEach(el=>{const on=el.dataset.shock===shockId;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("[data-port]").forEach(el=>el.classList.toggle("affected",shock.affected.includes(el.dataset.port)));
 const selected=d.ports.find(p=>p.id===portId);
 const isHit=shock.affected.includes(portId);
 $("shockResult").classList.toggle("warning",shockId!=="normal");
 $("shockResult").innerHTML='<strong>'+escapeHtml(shock.name)+'</strong><p>'+escapeHtml(shock.impact)+'</p>'+
 '<p><b>'+escapeHtml(selected.name)+':</b> '+(isHit?"в этом сценарии возможны задержки или дополнительные издержки.":"нет прямого выделенного воздействия в схеме; косвенные последствия всё равно возможны.")+'</p>'+
 '<p class="fine">Маркеры показывают возможные зависимости, а не неизбежные потери выпуска. Прогноз и последствия подтверждает судья.</p>';
}
$("portButtons").addEventListener("click",e=>{const b=e.target.closest("[data-port-choice]");if(b)showPort(b.dataset.portChoice)});
$("shockButtons").addEventListener("click",e=>{const b=e.target.closest("[data-shock]");if(b){shockId=b.dataset.shock;renderShock()}});
$("sectorHub").addEventListener("click",()=>{openTab("islands");showPort(sector().hub)});
$("japanMapNote").textContent=d.mapNote;
drawMap();showPort(portId);
})();