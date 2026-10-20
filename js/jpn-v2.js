"use strict";
/* Japan 1955 national mechanics: read-only player interface, fixed canonical trade inputs. */
(function(){
const A=window.VPI_JPN_ATLAS_1955,G=window.VPI_JPN_GEO;
if(!A||!G){console.error("Japan mechanics data missing");return}
const $=id=>document.getElementById(id);
const safe=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const items=x=>x.map(v=>'<li>'+safe(v)+'</li>').join("");
const pills=x=>x.map(v=>'<span>'+safe(v)+'</span>').join("");
const num=(x,d=2)=>Number(x).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
const tabs=["politics","industry","currency"];
let party="dem",issue="government",route="conserv",port="kitakyushu",shock="normal",sector="steel",loopStage="fx",trade="energy",priority="exports";
function openTab(id,scroll=false){
 if(!tabs.includes(id))return;
 document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("current",on);b.setAttribute("aria-selected",String(on))});
 document.querySelectorAll(".pane").forEach(s=>{const on=s.id===id;s.classList.toggle("current",on);s.hidden=!on});
 try{history.replaceState(null,"","#"+id)}catch(e){}
 if(scroll)document.querySelector(".tabs")?.scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>openTab(b.dataset.tab)));
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-jump]");if(!b)return;
 if(b.dataset.targetSector&&A.sectors.some(s=>s.id===b.dataset.targetSector)){sector=b.dataset.targetSector;port=sectors.find(s=>s.id===sector).hub;renderIndustry();renderPort()}
 if(b.dataset.targetTrade&&A.trade.some(s=>s.id===b.dataset.targetTrade)){trade=b.dataset.targetTrade;renderTrade()}
 if(b.dataset.targetPort&&A.ports.some(p=>p.id===b.dataset.targetPort)){port=b.dataset.targetPort;renderPort()}
 openTab(b.dataset.jump,true)
});
openTab(tabs.includes(location.hash.slice(1))?location.hash.slice(1):"politics");
// 1955 political realignments: no predetermined combination, no fabricated January seats.
const parties=A.politics.parties,polIssues=A.politics.issues,paths=A.politics.routes;
function renderParty(){
 const p=parties.find(p=>p.id===party);
 $("jpnPartyList").innerHTML=parties.map(x=>'<button type="button" data-party="'+x.id+'" class="party-card '+x.family+(party===x.id?" active":"")+'" aria-pressed="'+(party===x.id)+'"><strong>'+safe(x.name)+'</strong><span>'+safe(x.tag)+'</span></button>').join("");
 $("jpnPartyName").textContent=p.name;$("jpnPartyLeader").textContent=p.leader;$("jpnPartyAgenda").textContent=p.agenda;
 $("jpnPartyFamily").textContent=p.tag;$("jpnPartyFamily").className="family-tag "+p.family;
 const c=A.parliament.caucuses.find(x=>x.id===p.id);
 $("jpnPartySeats").textContent=c?"Депутаты в Палате представителей: "+c.seats+" из "+A.parliament.size:"";
 $("jpnPartyDeal").textContent=p.negotiation;$("jpnPartyBarrier").textContent=p.barrier;
 $("jpnIssueButtons").innerHTML=polIssues.map(x=>'<button type="button" data-issue="'+x.id+'" class="'+(issue===x.id?"active":"")+'" aria-pressed="'+(issue===x.id)+'">'+safe(x.name)+'</button>').join("");
 $("jpnPartyIssue").textContent=p.issues[issue];
 $("jpnPartyList").querySelectorAll("[data-party]").forEach(el=>el.onclick=()=>{party=el.dataset.party;renderParty()});
 $("jpnIssueButtons").querySelectorAll("[data-issue]").forEach(el=>el.onclick=()=>{issue=el.dataset.issue;renderParty()});
}
function renderRoutes(){
 const p=paths.find(x=>x.id===route);
 $("jpnPoliticalRoutes").innerHTML=paths.map((x,i)=>'<button type="button" class="route-card'+(x.id===route?" active":"")+'" data-route="'+x.id+'" aria-pressed="'+(x.id===route)+'"><small>ЛИНИЯ 0'+(i+1)+'</small><strong>'+safe(x.name)+'</strong><span>'+safe(x.question)+'</span></button>').join("");
 $("jpnRouteTitle").textContent=p.name;$("jpnRouteQuestion").textContent=p.question;
 $("jpnRouteMembers").innerHTML=p.members.map(id=>{const f=parties.find(x=>x.id===id);return '<button type="button" data-route-party="'+id+'">'+safe(f.name)+' ↗</button>'}).join("");
 $("jpnRouteNote").textContent=p.note;$("jpnRouteAgenda").innerHTML=items(p.agenda);$("jpnRouteRisks").innerHTML=items(p.obstacles);
 $("jpnPoliticalRoutes").querySelectorAll("[data-route]").forEach(el=>el.onclick=()=>{route=el.dataset.route;renderRoutes()});
 $("jpnRouteMembers").querySelectorAll("[data-route-party]").forEach(el=>el.onclick=()=>{party=el.dataset.routeParty;renderParty();document.querySelector(".party-overview")?.scrollIntoView({behavior:"smooth",block:"nearest"})});
}
renderParty();renderRoutes();
// Island ports: approximate coastline and eight geographic centers.
const projection=(lon,lat)=>[(lon-123.8)*30,(47.2-lat)*37];
const ports=A.ports,shocks=A.shocks,sectors=A.sectors;
const portSector={muroran:"steel",niigata:"steel",tokyo:"electronics",nagoya:"cars",osaka:"textiles",kobe:"ships",kitakyushu:"steel",nagasaki:"ships"};
const industryAtPort=id=>sectors.filter(s=>s.hub===id||portSector[id]===s.id||(id==="kobe"&&s.id==="textiles")||(id==="muroran"&&s.id==="ships"));
function drawMap(){
 $("japanMap").innerHTML=G.islands.map(d=>'<path class="japan-coast" d="'+d+'"></path>').join("")+
 '<text x="48" y="290" class="water-label">Японское море</text><text x="525" y="605" class="water-label">Тихий океан</text>'+
 ports.map(p=>{const [x,y]=projection(p.lon,p.lat),affected=shocks.find(s=>s.id===shock).affected.includes(p.id);
 return '<g data-port-map="'+p.id+'" tabindex="0" role="button" class="port-point'+(port===p.id?" selected":"")+(affected?" affected":"")+'" aria-label="'+safe(p.name)+'"><circle class="port-halo" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(port===p.id?17:13)+'"></circle><circle class="port-dot" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7"></circle><title>'+safe(p.name)+'</title></g>'}).join("");
 $("japanMap").querySelectorAll("[data-port-map]").forEach(el=>{
 const go=()=>{port=el.dataset.portMap;sector=portSector[port]||sector;renderIndustry();renderPort()};
 el.addEventListener("click",go);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}});
 });
}
function renderPort(){
 const p=ports.find(x=>x.id===port),s=shocks.find(x=>x.id===shock);
 $("jpnPortNav").innerHTML=ports.map(x=>'<button type="button" data-port="'+x.id+'" class="'+(x.id===port?"active":"")+'" aria-pressed="'+(x.id===port)+'">'+safe(x.name)+'</button>').join("");
 $("jpnPortName").textContent=p.name;$("jpnPortArea").textContent=p.area;$("jpnPortRole").textContent=p.specialty;
 $("jpnPortSupply").textContent=p.dependency;$("jpnPortChain").textContent=p.lines;$("jpnPortLimit").textContent=p.options;
 $("jpnPortIndustries").innerHTML=industryAtPort(port).map(s=>'<button type="button" data-port-industry="'+s.id+'">'+safe(s.name)+' ↗</button>').join("");
 $("jpnPortIndustries").querySelectorAll("[data-port-industry]").forEach(b=>b.onclick=()=>{sector=b.dataset.portIndustry;renderIndustry()});
 $("jpnSupplyScenarios").innerHTML=shocks.map(x=>'<button type="button" data-shock="'+x.id+'" class="'+(x.id===shock?"active":"")+'" aria-pressed="'+(x.id===shock)+'">'+safe(x.name)+'</button>').join("");
 const hit=s.affected.includes(port),isNormal=shock==="normal";
 $("jpnSupplyDescription").className="supply-result"+(!isNormal?" warning":"");
 $("jpnSupplyDescription").innerHTML='<strong>'+safe(s.name)+'</strong><p>'+safe(s.impact)+'</p><p><b>'+safe(p.name)+':</b> '+(isNormal?"Снабжение зависит от действующих контрактов, мощности портов и валютных платежей.":hit?"Узел затронут напрямую. Нужно оценить пропускную способность, дополнительные расходы и запасные маршруты.":"Прямого воздействия на этот узел не выделено. Возможны косвенные последствия через смежные отрасли.")+'</p>';
 $("jpnPortNav").querySelectorAll("[data-port]").forEach(b=>b.onclick=()=>{port=b.dataset.port;sector=portSector[port]||sector;renderIndustry();renderPort()});
 $("jpnSupplyScenarios").querySelectorAll("[data-shock]").forEach(b=>b.onclick=()=>{shock=b.dataset.shock;renderPort()});
 drawMap();renderSupplyLoop();renderCascade();
}
function renderIndustry(){
 const s=sectors.find(x=>x.id===sector);
 $("jpnIndustryButtons").innerHTML=sectors.map(x=>'<button type="button" data-sector="'+x.id+'" class="industry-btn'+(sector===x.id?" active":"")+'" aria-pressed="'+(sector===x.id)+'"><span>'+safe(x.icon)+'</span><b>'+safe(x.name)+'</b><small>'+safe(x.hubName)+'</small></button>').join("");
 $("jpnIndustryName").textContent=s.name;$("jpnIndustryBase").textContent=s.base;
 $("jpnIndustryChain").textContent=s.chain;$("jpnIndustryEnergy").textContent=s.energy;
 $("jpnIndustryImports").textContent=s.imports;$("jpnIndustryLimit").textContent=s.limit;$("jpnIndustryStake").textContent=s.stakeholders;
 $("jpnToCurrency").dataset.jump="currency";$("jpnToCurrency").dataset.targetTrade=s.foreign;
 $("jpnIndustryButtons").querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{sector=b.dataset.sector;port=sHub(b.dataset.sector);renderIndustry();renderPort()});
 renderSupplyLoop();renderCascade();
}

function stageDescription(s,id){
 const l=s.loop;
 return ({
 fx:"Для этой отрасли необходима оплачиваемая иностранная закупка: "+s.fx+" Выделение иенового кредита само по себе не даёт валюты.",
 import:"Иностранный платёж направляется на: "+l.import+". Нужны импортная лицензия, согласованный контракт и расчёты.",
 port:l.transport+". Без причала, фрахта и внутренней доставки зарубежная закупка ещё не становится ресурсом завода.",
 power:l.power+". Производственный этап: "+l.produce+". Нехватка энергии или комплектующих может остановить последующие стадии.",
 market:l.sell+". Должны выполняться требования по качеству, срокам поставки и доступу на рынок.",
 return:l.earn+". Если экспорт не оплачен, валютный бюджет не пополнен, даже если продукция изготовлена."
 })[id];
}
function sectorIsAffected(s){
 const p=sectors.find(x=>x.id===sector),hit=shocks.find(x=>x.id===shock).affected.includes(port);
 if(shock==="normal")return false;
 if(shock==="ore")return ["steel","ships","cars"].includes(s.id)||hit;
 if(shock==="freight")return true;
 if(shock==="fuel")return hit||s.loop.energyExposure==="high";
 return hit;
}
function renderSupplyLoop(){
 const s=sectors.find(s=>s.id===sector);
 $("jpnCycleSectorName").textContent=s.name;
 $("jpnCyclePortName").textContent=ports.find(x=>x.id===port).name;
 $("jpnSupplyLoop").innerHTML=A.supplyLoopStages.map((stage,i)=>{
 const on=loopStage===stage.id,atRisk=sectorIsAffected(s)&&shock!=="normal"&&((shock==="ore"&&["import","power","market","return"].includes(stage.id))||(shock==="fuel"&&["port","power","market","return"].includes(stage.id))||(shock==="freight"&&["port","market","return"].includes(stage.id)));
 return '<button type="button" data-loop-stage="'+stage.id+'" class="loop-stage'+(on?" active":"")+(atRisk?" at-risk":"")+'" aria-pressed="'+on+'"><small>0'+(i+1)+' · '+safe(stage.verb)+'</small><strong>'+safe(stage.name)+'</strong></button>'
 }).join("");
 const current=A.supplyLoopStages.find(x=>x.id===loopStage);
 $("jpnLoopStageName").textContent=s.name+" · "+current.name;
 $("jpnLoopStageDetail").textContent=stageDescription(s,loopStage);
 $("jpnLoopCoreRisk").textContent=s.loop.coreRisk;
 $("jpnSupplyLoop").querySelectorAll("[data-loop-stage]").forEach(b=>b.onclick=()=>{loopStage=b.dataset.loopStage;renderSupplyLoop()});
}
function renderCascade(){
 const s=sectors.find(x=>x.id===sector),p=ports.find(x=>x.id===port),q=shocks.find(x=>x.id===shock),hit=sectorIsAffected(s),normal=shock==="normal";
 $("jpnImpactIndicator").textContent=normal?"Штатное снабжение":q.name;
 $("jpnImpactIndicator").className="jpn-impact-indicator"+(normal?"":hit?" risk":" indirect");
 $("jpnImpactTitle").textContent=normal?"Что обеспечивает следующий цикл импорта":hit?"Как перебой передаётся по цепочке":"Что меняется при этом перебое";
 $("jpnCascade").hidden=normal;
 if(normal){
  $("jpnCascade").innerHTML="";
  $("jpnCascadeConclusion").textContent="Поступление ресурсов, выпуск продукции и получение экспортной выручки зависят от контрактов и сроков. Чтобы проверить конкретную уязвимость, выбери перебой в блоке отрасли рядом с картой.";
  return;
 }
 const stage=[
 {title:"1 · Поставка",body:shock==="ore"?"Руда или металл могут поступить позже необходимого срока.":shock==="fuel"?"Затраты на топливо и энергоснабжение увеличиваются.":"Доставка и морские перевозки могут задержаться."},
 {title:"2 · Производство",body:hit?"Для "+s.name.toLowerCase()+" возникают дополнительные издержки, задержка сырья или ограничение выпуска.":"Прямого сбоя в выбранной отрасли не выделено; остаётся зависимость от общих перевозок и поставщиков."},
 {title:"3 · Продажа",body:hit?"Отгрузка готовой продукции и получение платежа по контракту могут сдвинуться.":"Изменения спроса, качества или стоимости перевозок всё равно могут повлиять на исполнение договора."},
 {title:"4 · Следующая закупка",body:hit?"Запоздавшая экспортная выручка ограничивает доступную валюту для новых иностранных заказов.":"Следующий цикл импорта зависит от того, когда поступит доступная валютная выручка."}
 ];
 $("jpnCascade").innerHTML=stage.map((x,i)=>'<div class="cascade-step'+(hit&&i>0?" risk":"")+'"><small>'+safe(x.title)+'</small><p>'+safe(x.body)+'</p></div>').join("");
 $("jpnCascadeConclusion").textContent="Цепочка: "+s.name+" · "+p.name+". "+(hit?"Под угрозой не только нынешний выпуск, но и оплата следующего импорта.":"Прямого сбоя в выбранной отрасли не выявлено; проверь косвенные зависимости.")+" Масштаб последствий зависит от резервов сырья, контрактов и действий правительства.";
}

const sHub=id=>sectors.find(x=>x.id===id).hub;
renderPort();renderIndustry();
// Fixed-rate, game G$ ledger with all six canonical categories.
const stats=A.stats,tradeGroups=A.trade;
const money=(x)=>num(x)+" млрд G$";
$("jpnFxMetrics").innerHTML=[
["Экспорт",money(stats.exports),"Внешние продажи"],
["Импорт",money(stats.imports),"Внешние закупки"],
["Торговый баланс",money(stats.netExports),"Экспорт минус импорт"],
["Валютные резервы",money(stats.reserves),"Стартовый резерв"]
].map(([label,val,sub])=>'<div class="fx-metric"><small>'+safe(label)+'</small><strong>'+safe(val)+'</strong><span>'+safe(sub)+'</span></div>').join("");
$("jpnExportNumber").textContent=money(stats.exports);$("jpnImportNumber").textContent=money(stats.imports);
const palette=["#b57e65","#718d8b","#c09d63","#6e9d83","#768bad","#ac818a"];
function bars(){
 for(const [kind,id] of [["exportPct","jpnExportBar"],["importPct","jpnImportBar"]]){
  $(""+id).innerHTML=tradeGroups.map((r,i)=>'<button type="button" data-bar-category="'+r.id+'" style="width:'+r[kind]+'%;background:'+palette[i]+'" title="'+safe(r.name)+': '+r[kind]+'%" aria-label="'+safe(r.name)+': '+r[kind]+'%"></button>').join("");
  $(""+id).querySelectorAll("[data-bar-category]").forEach(b=>b.onclick=()=>{trade=b.dataset.barCategory;renderTrade()});
 }
}
function renderTrade(){
 const c=tradeGroups.find(x=>x.id===trade);
 $("jpnTradeCategories").innerHTML=tradeGroups.map((x,i)=>'<button type="button" data-trade="'+x.id+'" class="'+(x.id===trade?"active":"")+'" aria-pressed="'+(x.id===trade)+'"><i style="background:'+palette[i]+'"></i>'+safe(x.name)+'</button>').join("");
 $("jpnTradeName").textContent=c.name;$("jpnTradeScope").textContent=c.scope;
 $("jpnExportShare").textContent=c.exportPct+"%";$("jpnImportShare").textContent=c.importPct+"%";
 const exports=stats.exports*c.exportPct/100,imports=stats.imports*c.importPct/100;
 $("jpnExportValue").textContent=money(exports);$("jpnImportValue").textContent=money(imports);
 const diff=exports-imports;
 $("jpnTradeNet").textContent=(diff>=0?"+":"")+money(diff);
 $("jpnTradeCaveat").textContent=diff<0?"По этой категории закупки превышают продажи. Покрытие обеспечивается прочими экспортными поступлениями, финансовыми потоками или валютными резервами.":"По этой категории выручка от экспорта превышает стоимость импорта. Её доступность для иных закупок зависит от платежей и валютного бюджета.";
 $("jpnTradeCategories").querySelectorAll("[data-trade]").forEach(b=>b.onclick=()=>{trade=b.dataset.trade;renderTrade()});
}
bars();renderTrade();
$("jpnFxFlow").innerHTML=A.financeProcess.map((x,i)=>'<article class="flow-stage"><span>'+safe(x.label)+'</span><h4>'+safe(x.head)+'</h4><p>'+safe(x.desc)+'</p></article>').join("");
function renderPriority(){
 const x=A.financePriorities.find(y=>y.id===priority);
 $("jpnFxPriorities").innerHTML=A.financePriorities.map((p,i)=>'<button type="button" data-priority="'+p.id+'" class="fx-priority'+(p.id===priority?" active":"")+'" aria-pressed="'+(p.id===priority)+'"><small>0'+(i+1)+' / '+safe(p.type)+'</small><strong>'+safe(p.name)+'</strong></button>').join("");
 $("jpnFxPriorityName").textContent=x.name;$("jpnFxPositive").textContent=x.good;
 $("jpnFxObstacles").innerHTML=items(x.limits);$("jpnFxPrice").textContent=x.cost;
 $("jpnFxIndustries").innerHTML=x.ties.map(id=>{const s=sectors.find(y=>y.id===id);return '<button type="button" data-jump="industry" data-target-sector="'+id+'">'+safe(s.name)+' →</button>'}).join("");
 $("jpnFxPriorities").querySelectorAll("[data-priority]").forEach(b=>b.onclick=()=>{priority=b.dataset.priority;renderPriority()});
}
renderPriority();
$("jpnSources").innerHTML=A.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+safe(x.url)+'">'+safe(x.title)+' ↗</a>').join("");
})();
