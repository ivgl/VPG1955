"use strict";
/* Interactive British 1955 interface draft. This only reads PUBLIC DEMONSTRATION DATA.
   Nothing is transmitted to the game judge or persisted in a game save. */
(function(){
const source=window.VPI_GBR_DRAFT;
if(!source||source.status!=="DEMONSTRATION_ONLY"){document.body.insertAdjacentHTML("afterbegin","<p>Нет демонстрационных данных Великобритании</p>");return}
const data=JSON.parse(JSON.stringify(source));
const $=id=>document.getElementById(id);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,low=0,high=100)=>Math.min(high,Math.max(low,v));
const fxBase=JSON.parse(JSON.stringify(data.finance));
const socialBase=JSON.parse(JSON.stringify(data.social));

function openTab(id){
 document.querySelectorAll(".tab").forEach(b=>{const active=b.dataset.tab===id;b.classList.toggle("current",active);b.setAttribute("aria-selected",String(active))});
 document.querySelectorAll(".pane").forEach(el=>{const active=el.id===id;el.classList.toggle("current",active);el.hidden=!active});
 if(history.replaceState)history.replaceState(null,"","#"+id);
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>openTab(b.dataset.tab)));
const hash=location.hash.slice(1);if(["sterling","empire","social","industry"].includes(hash))openTab(hash);

// Financial foreign-exchange illustration, not the domestic budget.
const fxFields=[
 ["exportReceipts","Экспортные и прочие валютные поступления","Подтверждённые долларовые поступления"],
 ["dollarImports","Импорт с оплатой во внешней валюте","Техника, сырьё и другие закупки"],
 ["externalObligations","Прочие внешние платежи","Погашение обязательств и международные расходы"],
 ["confirmedCredit","Согласованные внешние кредиты","Только оформленные заимствования, не бесплатный доход"]
];
function buildFxControls(){
 $("fxControls").innerHTML=fxFields.map(([key,label,hint])=>
 '<div class="control-row"><div class="control-heading"><label for="fx-'+key+'">'+esc(label)+'</label><strong data-fx-label="'+key+'">0</strong></div><input type="range" id="fx-'+key+'" data-fx="'+key+'" min="0" max="180" step="5" value="'+data.finance[key]+'"><small>'+esc(hint)+'</small></div>').join("");
 document.querySelectorAll("[data-fx]").forEach(inp=>inp.addEventListener("input",()=>{data.finance[inp.dataset.fx]=Number(inp.value);drawFx()}));
}
function drawFx(){
 const f=data.finance,projected=f.reserve+f.exportReceipts+f.confirmedCredit-f.dollarImports-f.externalObligations;
 const paid=clamp(projected,0,99999),unpaid=Math.max(0,-projected),delta=projected-f.reserve;
 $("fxStart").textContent=f.reserve+" ед.";$("fxEnd").textContent=(unpaid?0:paid)+" ед.";$("fxEnd").classList.toggle("warning",unpaid>0||projected<f.reserve*.4);
 $("fxDelta").textContent=(delta>0?"+":"")+delta+" ед.";
 $("fxBar").style.width=clamp(paid/Math.max(1,f.reserve+f.exportReceipts+f.confirmedCredit)*100)+"%";
 $("fxBar").classList.toggle("critical",unpaid>0||projected<f.reserve*.4);
 fxFields.forEach(([key])=>{const inp=$("fx-"+key);inp.value=f[key];document.querySelector('[data-fx-label="'+key+'"]').textContent=f[key]+" ед."});
 const message=unpaid>0?
   "В условном сценарии не хватает "+unpaid+" единиц внешней валюты. Заявленные платежи не могут все состояться: потребуются новые источники или изменение закупок.":
   projected<f.reserve*.4?
   "Заметное сокращение резервов. Игроку стоит оценить доверие к фунту, режим импорта и возможные переговоры о кредитах.":
   "На уровне демонстрационной модели валютных поступлений хватает на заявленные платежи. Реальные договоры, сроки и ограничения требуют судейской проверки.";
 $("fxOutlook").textContent=message;$("fxOutlook").classList.toggle("critical",unpaid>0||projected<f.reserve*.4);
}
$("fxReset").addEventListener("click",()=>{data.finance=JSON.parse(JSON.stringify(fxBase));drawFx()});
buildFxControls();drawFx();
$("fxParInfo").textContent=data.finance.parityInfo;
$("sterlingPartners").innerHTML=data.sterling.map((x,i)=>'<button type="button" class="pill" data-partner="'+i+'" aria-pressed="false">'+esc(x.name)+'</button>').join("");
function showPartner(idx){
 const x=data.sterling[idx];if(!x)return;
 document.querySelectorAll("[data-partner]").forEach(b=>{const selected=Number(b.dataset.partner)===idx;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected))});
 $("sterlingDetail").innerHTML="<strong>"+esc(x.name)+"</strong><p>"+esc(x.status)+"</p><small>"+esc(x.info)+"</small>";
}
document.querySelectorAll("[data-partner]").forEach(b=>b.addEventListener("click",()=>showPartner(Number(b.dataset.partner))));
showPartner(0);

// Geographic reference map and legally distinct territory cards.
const world=window.VPI_GBR_WORLD;
const territories=data.territories;
let placeActive="suez";
const project=(lon,lat)=>[(lon+180)*960/360,(84-lat)*490/168];
function drawMap(){
 $("mapCount").textContent=territories.length+" точек";
 if(!world||!world.paths){$("empireMap").textContent="Географическая подложка не загрузилась";return}
 const horiz=[-60,-30,0,30,60].map(lat=>{const y=project(0,lat)[1];return '<path class="world-grid" d="M0 '+y.toFixed(1)+' H960"/>'}).join("");
 const land=world.paths.map(f=>'<path class="world-shape" d="'+f.d+'"><title>'+esc(f.name)+'</title></path>').join("");
 const pins=territories.map(t=>{const p=project(t.lon,t.lat);return '<circle role="button" tabindex="0" aria-label="'+esc(t.name)+'" data-pin="'+t.id+'" class="world-point '+t.type+'" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="7"><title>'+esc(t.name)+'</title></circle>'}).join("");
 $("empireMap").innerHTML=horiz+land+pins+'<text class="world-marker-text" id="mapSelectedLabel" x="20" y="460"></text>';
 document.querySelectorAll("[data-pin]").forEach(p=>{
   const act=()=>showPlace(p.dataset.pin);
   p.addEventListener("click",act);
   p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act()}})
 });
}
$("territoryButtons").innerHTML=territories.map(t=>'<button type="button" class="region-pill" data-place="'+t.id+'">'+esc(t.name)+'</button>').join("");
document.querySelectorAll("[data-place]").forEach(b=>b.addEventListener("click",()=>showPlace(b.dataset.place)));
function showPlace(id){
 const t=territories.find(x=>x.id===id);if(!t)return;placeActive=id;
 $("placeName").textContent=t.name;$("placeStatus").textContent=t.status;$("placeRole").textContent=t.role;
 $("placeNear").textContent=t.near;$("placeLong").textContent=t.long;
 $("placeType").textContent=t.type==="colony"?"Британская администрация":t.type==="agreement"?"Договорный доступ / иностранное государство":"Независимый партнёр Содружества";
 document.querySelectorAll("[data-place]").forEach(b=>{const active=b.dataset.place===id;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
 document.querySelectorAll("[data-pin]").forEach(p=>{const active=p.dataset.pin===id;p.classList.toggle("active",active);p.setAttribute("aria-pressed",String(active));p.setAttribute("r",active?"10":"7")});
 if($("mapSelectedLabel"))$("mapSelectedLabel").textContent="Выбрано: "+t.name;
}
drawMap();showPlace(placeActive);

// Post-war compromise. Separate sector policies, not an ideological one-dimensional slider.
const policyFields=[
 ["health","Служба здравоохранения","Объём и качество услуг Национальной службы здравоохранения (NHS)."],
 ["housing","Жильё и местные службы","Доступность жилья, строительство и условия жизни."],
 ["wages","Тарифные соглашения и занятость","Переговоры с профсоюзами, переобучение и условия труда."],
 ["publicIndustry","Государственные отрасли","Инвестиции и ответственность правительства в национализированных секторах."]
];
const policyScale=["Сокращать","Сдерживать","Сохранять","Расширять","Ускорять"];
function buildSocial(){
 $("socialControls").innerHTML=policyFields.map(([id,label,desc])=>
 '<div class="social-row"><div class="social-row-head"><label for="policy-'+id+'">'+esc(label)+'</label><strong data-policy-value="'+id+'">—</strong></div><p>'+esc(desc)+'</p><input type="range" id="policy-'+id+'" data-policy="'+id+'" min="0" max="4" step="1" value="'+data.social[id]+'"><div class="social-ruler"><span>Сокращать</span><span>Сохранять</span><span>Ускорять</span></div></div>').join("");
 document.querySelectorAll("[data-policy]").forEach(inp=>inp.addEventListener("input",()=>{data.social[inp.dataset.policy]=Number(inp.value);drawSocial();drawPortfolio()}));
}
function industryPressure(){
 return data.industries.reduce((a,s)=>a+(s.pace===2?(s.agreement?1:3):s.pace===1&&!s.agreement?1:0),0);
}
function drawSocial(){
 const s=data.social,pr=industryPressure();
 const fiscal=clamp(Math.round(14+11*s.health+11*s.housing+6*s.wages+9*s.publicIndustry));
 const support=clamp(Math.round(22+10*s.health+8*s.housing+9*s.wages+3*s.publicIndustry-pr*2));
 const tension=clamp(Math.round(44+pr*8-9*s.wages-3*s.health));
 const eq=clamp(Math.round(28+6*s.health+7*s.housing+5*s.wages));
 const rows=[
  ["Бюджетная нагрузка",fiscal,"Условный индекс расходов, а не процент бюджета."],
  ["Стабильность социального компромисса",support,"Модельная устойчивость договорённостей."],
  ["Трудовая напряжённость",tension,"Чем выше, тем больше потенциальных конфликтов."],
  ["Направление изменения равенства",eq,"Не официальный индекс равенства ВПИ."]
 ];
 $("socialReadouts").innerHTML=rows.map(([title,v,detail])=>
 '<div class="score-row"><div class="score-top"><span>'+esc(title)+'</span><strong>'+v+' / 100</strong></div><div class="score-track"><span style="width:'+v+'%"></span></div><small>'+esc(detail)+'</small></div>').join("");
 policyFields.forEach(([id])=>{$("policy-"+id).value=s[id];document.querySelector('[data-policy-value="'+id+'"]').textContent=policyScale[s[id]]});
 const warning=fiscal>=80?"Выбранный социальный курс создаёт высокую условную бюджетную нагрузку. Понадобятся источники финансирования и политическое согласие.":tension>=65?"Модернизация производств и политика переговоров создают заметный риск трудовых споров.":"Сценарий допускает компромисс, но итог зависит от государственных расходов, спроса на труд и конкретных законов.";
 $("socialNarrative").innerHTML="<strong>На что обратить внимание судье</strong><p>"+esc(warning)+"</p>";
}
$("socialReset").addEventListener("click",()=>{data.social=JSON.parse(JSON.stringify(socialBase));drawSocial();drawPortfolio()});
buildSocial();

// Industrial modernisation: program capacity and transition costs, not guaranteed production growth.
const industry=data.industries;
let sectorActive=industry[0].id;
const paceLabels=["Оставить как есть","Постепенно обновлять","Ускоренно перестраивать"];
function showSectors(){
 $("sectorCards").innerHTML=industry.map(s=>
 '<button type="button" data-sector="'+s.id+'" class="sector-card '+(s.id===sectorActive?"active":"")+'"><strong>'+esc(s.name)+'</strong><small>'+esc(s.tag)+'</small><span class="pace-indicator">'+esc(paceLabels[s.pace])+'</span></button>').join("");
 document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>{sectorActive=b.dataset.sector;showSectors()}));
 const s=industry.find(x=>x.id===sectorActive);
 $("sectorName").textContent=s.name;$("sectorLegacy").textContent=s.asset;$("sectorLimit").textContent=s.limitation;$("sectorOpportunity").textContent=s.opportunity;
 $("sectorPaces").innerHTML=paceLabels.map((label,v)=>'<button type="button" class="pace-btn '+(s.pace===v?"active":"")+'" data-pace="'+v+'" aria-pressed="'+(s.pace===v)+'">'+esc(label)+'</button>').join("");
 document.querySelectorAll("[data-pace]").forEach(b=>b.addEventListener("click",()=>{s.pace=Number(b.dataset.pace);showSectors();drawPortfolio();drawSocial()}));
 $("sectorLabour").checked=s.agreement;
 drawPortfolio();
}
$("sectorLabour").addEventListener("change",()=>{const s=industry.find(x=>x.id===sectorActive);s.agreement=$("sectorLabour").checked;drawPortfolio();drawSocial()});
function drawPortfolio(){
 const active=industry.filter(s=>s.pace>0).length,accelerated=industry.filter(s=>s.pace===2).length;
 const work=industry.reduce((v,s)=>v+s.pace*(s.agreement?2:3),0),pressure=industryPressure();
 const risks=clamp(20+pressure*9-data.social.wages*5);
 $("projectCount").textContent=active+" из "+industry.length+" активных";
 $("activeProjects").textContent=active+" / "+industry.length;
 $("trainingDemand").textContent=work+" условных ед.";
 $("industrialFriction").textContent=risks+" / 100";
 const overloaded=accelerated>2||work>13;
 $("portfolioMessage").classList.toggle("warning",overloaded);
 $("portfolioMessage").textContent=overloaded?
 "Несколько программ одновременно повышают потребность в станках, обучении и инвестициях. Судье стоит проверить реальные сроки. Переговоры с профсоюзами снижают риск конфликта, но не дают бесплатных ресурсов.":
 "Сценарная нагрузка на модернизацию ограничена. Однако даже отдельным проектам нужны реальные инвестиции, подготовка и согласие участников.";
}
showSectors();drawSocial();
})();