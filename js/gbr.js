"use strict";
/* GBR demonstration: public historical reference data + speculative user scenario.
   Never writes to Google Drive, GitHub, or the judge. */
(function(){
const source=window.VPI_GBR_DRAFT;
if(!source||source.status!=="DEMONSTRATION_ONLY"){document.body.textContent="Не удалось загрузить публичный черновик Британии";return}
const d=JSON.parse(JSON.stringify(source));
const init=JSON.parse(JSON.stringify(source));
const $=id=>document.getElementById(id);
const number=(v,n=2)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:n,maximumFractionDigits:n});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const bound=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const sectionNames=["sterling","empire","economy"];
function openTab(id){
 document.querySelectorAll(".tab").forEach(b=>{const yes=b.dataset.tab===id;b.classList.toggle("current",yes);b.setAttribute("aria-selected",String(yes))});
 document.querySelectorAll(".pane").forEach(p=>{const yes=p.id===id;p.classList.toggle("current",yes);p.hidden=!yes});
 if(history.replaceState)history.replaceState(null,"","#"+id);
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>openTab(b.dataset.tab)));
const initialHash=location.hash.slice(1);if(sectionNames.includes(initialHash))openTab(initialHash);

// A completed post remains a proposal. Currency reserves are USD bn; programme costs are GAME% ВВП bn.
const fxInputs=[
 ["extraDollarImportsUSD","Новые валютные закупки","Дополнительные импортные контракты, млрд $",0,3,.05],
 ["extraDollarReceiptsUSD","Дополнительные валютные доходы","Подтверждённый экспорт или другие поступления, млрд $",0,3,.05],
 ["newConfirmedCreditUSD","Новый внешний кредит","По сценарию только при реальном согласии кредитора, млрд $",0,3,.05],
 ["otherUSDPayments","Другие внешние обязательства","Выплаты и переводы в конвертируемой валюте, млрд $",0,2,.05]
];
function renderFxControls(){
 $("fxControls").innerHTML=fxInputs.map(([id,label,info,min,max,step])=>
 '<div class="control-row"><div class="control-heading"><label for="fx-'+id+'">'+esc(label)+'</label><strong data-fx-value="'+id+'">'+number(d.finance[id])+'</strong></div><small>'+esc(info)+'</small><input id="fx-'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+d.finance[id]+'" data-fx="'+id+'"></div>').join("");
 document.querySelectorAll("[data-fx]").forEach(el=>el.addEventListener("input",()=>{d.finance[el.dataset.fx]=Number(el.value);updateFx()}));
}
function modernImportUSD(){
 return d.industries.reduce((sum,sector)=>{
  const row=d.economy.extraUSDForModernisation.find(x=>x.id===sector.id);
  return sum+(sector.pace===1?row.slow:sector.pace===2?row.fast:0);
 },0);
}
function fxProjection(){
 const f=d.finance,extraEquipment=modernImportUSD(),tradeWorldUSD=f.imports1954GBP*f.usdPerGBP;
 const totalImportUSD=tradeWorldUSD+f.extraDollarImportsUSD+extraEquipment;
 const end=f.reserveUSD+f.baselineConvertibleFlowUSD+f.extraDollarReceiptsUSD+f.newConfirmedCreditUSD-f.extraDollarImportsUSD-f.otherUSDPayments-extraEquipment;
 const paid=Math.max(0,end);
 return {end,paid,shortfall:Math.max(0,-end),extraEquipment,coveragePct:100*paid/totalImportUSD,months:12*paid/totalImportUSD,delta:end-f.reserveUSD,importBase:tradeWorldUSD};
}
function updateFx(){
 const f=d.finance,x=fxProjection(),t=f.exports1954GBP-f.imports1954GBP;
 $("tradeExports").textContent=number(f.exports1954GBP,3)+" млрд £";
 $("tradeImports").textContent=number(f.imports1954GBP,3)+" млрд £";
 $("tradeBalance").textContent=(t>=0?"+":"")+number(t,3)+" млрд £";
 $("fxStart").textContent=number(f.reserveUSD,3)+" млрд $";
 $("fxEnd").textContent=number(x.paid,3)+" млрд $";
 $("fxDelta").textContent=(x.delta>0?"+":"")+number(x.delta,3)+" млрд $";
 $("fxCoverage").textContent=number(x.coveragePct,1)+"%";
 $("fxMonths").textContent=number(x.months,1)+" мес.";
 $("fxBar").style.width=bound(x.coveragePct,0,100)+"%";
 $("fxBar").classList.toggle("critical",x.end<=0||x.months<3);
 fxInputs.forEach(([id])=>{
  $("fx-"+id).value=f[id];
  document.querySelector('[data-fx-value="'+id+'"]').textContent=number(f[id])+" млрд $";
 });
 const indicator=x.shortfall>0?
 "Платёжный разрыв "+number(x.shortfall,3)+" млрд $. Запланированные платежи нельзя оплатить без нового кредита, поступления валюты или пересмотра закупок.":
 x.months<3?"Покрытие импорта менее трёх месяцев — предупреждение макета о слабом запасе ликвидности, а НЕ автоматически объявленный дефолт.":
 "Дополнительные платежи помещаются в сценарный объём резервов. Показатель месяцев импорта — ориентир запаса, а не разрешение потратить все резервы.";
 $("fxOutlook").textContent=indicator+" Учтено импортное оборудование для программ модернизации: "+number(x.extraEquipment,3)+" млрд $.";
 $("fxOutlook").classList.toggle("critical",x.end<=0||x.months<3);
 if(!$("fxDraft").hidden)$("fxDraftText").value=fxProposal();
}
function fxProposal(){
 const p=fxProjection(),f=d.finance;
 return [
 "Великобритания, "+d.year+" год. ПРОЕКТ решения по внешним расчётам.",
 "Исторический ориентир на начало года: резервы "+number(f.reserveUSD,3)+" млрд $ в методологии МВФ.",
 "Дополнительные закупки за внешнюю валюту: "+number(f.extraDollarImportsUSD)+" млрд $.",
 "Импорт оборудования для модернизации: "+number(p.extraEquipment,3)+" млрд $.",
 "Новые подтверждённые валютные поступления: "+number(f.extraDollarReceiptsUSD)+" млрд $.",
 "Предлагаемые внешние кредиты: "+number(f.newConfirmedCreditUSD)+" млрд $ (не считать полученными до соглашения).",
 "Прочие внешние платежи: "+number(f.otherUSDPayments)+" млрд $.",
 "Ориентир резервов после предполагаемых операций: "+number(p.end,3)+" млрд $, покрытие импорта "+number(p.months,1)+" месяца.",
 "Прошу судью проверить валютную конвертируемость, условия торговли и кредита, сроки и законность платежей.",
 "Это не автоматическая заявка и не утверждённый государственный баланс."
 ].join("\n");
}
async function copyDraft(textId,statusId){
 const target=$(textId);
 try{
  if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(target.value);
  else {target.focus();target.select();if(!document.execCommand("copy"))throw Error("clipboard");}
  $(statusId).textContent="Скопировано";
 }catch(e){target.focus();target.select();$(statusId).textContent="Текст выделен; скопируйте вручную";}
}
$("fxGenerate").addEventListener("click",()=>{$("fxDraft").hidden=false;$("fxDraftText").value=fxProposal()});
$("fxCopy").addEventListener("click",()=>copyDraft("fxDraftText","fxCopyStatus"));
$("fxReset").addEventListener("click",()=>{d.finance=JSON.parse(JSON.stringify(init.finance));updateFx()});
renderFxControls();
$("fxParInfo").textContent=d.finance.methodologicalNote;
$("sterlingPartners").innerHTML=d.sterling.map((p,i)=>'<button class="pill" data-partner="'+i+'" type="button">'+esc(p.name)+'</button>').join("");
function partner(index){
 const x=d.sterling[index];if(!x)return;
 document.querySelectorAll("[data-partner]").forEach(b=>b.classList.toggle("active",Number(b.dataset.partner)===index));
 $("sterlingDetail").innerHTML="<strong>"+esc(x.name)+"</strong><p>"+esc(x.status)+"</p><small>"+esc(x.info)+"</small>";
}
document.querySelectorAll("[data-partner]").forEach(b=>b.addEventListener("click",()=>partner(Number(b.dataset.partner))));
partner(0);

// World map, separated legal statuses and actual functions.
let selectedTerritory="suez",activeFilter="all";
function group(t){return t.type==="commonwealth"?"partners":t.importance==="key"?"military":"civil"}
function isVisible(t){return activeFilter==="all"||group(t)===activeFilter}
const proj=(lon,lat)=>[(lon+180)*960/360,(84-lat)*490/168];
function drawEmpire(){
 const geo=window.VPI_GBR_WORLD;
 $("mapCount").textContent=d.territories.length+" записей";
 if(!geo||!geo.paths){$("empireMap").textContent="Нет карты";return}
 const shapes=geo.paths.map(c=>'<path class="world-shape" d="'+c.d+'"><title>'+esc(c.name)+'</title></path>').join("");
 const pins=d.territories.map(t=>{const [x,y]=proj(t.lon,t.lat);
  return '<circle role="button" tabindex="0" aria-label="'+esc(t.name)+'" data-pin="'+t.id+'" class="world-point '+(t.type==="home"?"home":t.type)+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7"><title>'+esc(t.name)+'</title></circle>';
 }).join("");
 $("empireMap").innerHTML=shapes+pins+'<text class="world-marker-text" id="mapSelectedLabel" x="20" y="476"></text>';
 document.querySelectorAll("[data-pin]").forEach(p=>{const act=()=>selectPlace(p.dataset.pin);p.addEventListener("click",act);p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act()}})});
 $("territoryButtons").innerHTML=d.territories.map(t=>'<button type="button" class="region-pill" data-place="'+t.id+'">'+esc(t.name)+'</button>').join("");
 document.querySelectorAll("[data-place]").forEach(b=>b.addEventListener("click",()=>selectPlace(b.dataset.place)));
 document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;applyFilter()}));
 applyFilter();
 selectPlace(selectedTerritory);
}
function applyFilter(){
 document.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeFilter));
 document.querySelectorAll("[data-place]").forEach(b=>{const t=d.territories.find(x=>x.id===b.dataset.place);b.hidden=!isVisible(t)});
 document.querySelectorAll("[data-pin]").forEach(b=>{const t=d.territories.find(x=>x.id===b.dataset.pin);b.style.display=isVisible(t)?"":"none"});
}
function selectPlace(id){
 const t=d.territories.find(x=>x.id===id);if(!t)return;
 selectedTerritory=id;
 if(!isVisible(t)){activeFilter="all";applyFilter()}
 $("placeName").textContent=t.name;
 $("placeType").textContent=t.type==="home"?"Метрополия / база":t.type==="colony"?"Колония / британское управление":t.type==="agreement"?"Базирование или права по договору":"Независимое государство";
 $("placeFacility").textContent=t.facility;
 $("placeScale").textContent=t.baseSize;
 $("placeStatus").textContent=t.status;$("placeAccess").textContent=t.access;
 $("placeRole").textContent=t.role;$("placeNear").textContent=t.near;$("placeLong").textContent=t.long;
 $("placeCapabilities").innerHTML=t.capabilities.map(c=>"<li>"+esc(c)+"</li>").join("");
 document.querySelectorAll("[data-place]").forEach(b=>b.classList.toggle("active",b.dataset.place===id));
 document.querySelectorAll("[data-pin]").forEach(b=>{const yes=b.dataset.pin===id;b.classList.toggle("active",yes);b.setAttribute("r",yes?"10":"7")});
 if($("mapSelectedLabel"))$("mapSelectedLabel").textContent="Выбрано: "+t.name;
}
drawEmpire();

// Integrated budget, industrial costs and social compromise. All% ВВП values are illustrative.
const labels=["Сокращение","Ограничение","Поддержание","Расширение","Ускорение"];
const socialFields=[
 ["health","Медицина / NHS","Финансирование существующей системы здравоохранения"],
 ["housing","Жилищные программы","Строительство, качество и доступность жилья"],
 ["wages","Занятость и трудовые соглашения","Помощь работникам, переговоры и социальные гарантии"]
];
const paces=["Без перестройки","Постепенная","Ускоренная"];
let selectedSector="coal";
function socialCost(){
 return socialFields.reduce((s,[id])=>s+d.economy.socialAnnualPctGDP[id][d.social[id]],0);
}
function retoolCost(s){return s.pace===1?s.gradualPctGDP:s.pace===2?s.fastPctGDP:0}
function needK(s){return s.pace===1?s.baseWorkersK*.5:s.pace===2?s.baseWorkersK:0}
function budget(){
 let manufacturing=d.industries.reduce((v,s)=>v+retoolCost(s),0);
 let need=d.industries.reduce((v,s)=>v+needK(s),0);
 let covered=d.industries.reduce((v,s)=>v+(s.agreement?needK(s):0),0);
 let training=covered*d.economy.trainingCostPctGDPPerThousand;
 let social=socialCost(),total=social+manufacturing+training,limit=d.economy.programBudgetLimitPctGDP;
 let deficit=Math.max(0,total-limit);
 return {social,manufacturing,training,need,covered,uncovered:need-covered,total,limit,deficit,percent:total/limit*100};
}
function renderSocialControls(){
 $("socialControls").innerHTML=socialFields.map(([id,label,desc])=>
  '<div class="social-row"><div class="social-row-head"><label for="policy-'+id+'">'+esc(label)+'</label><strong data-policy-value="'+id+'">—</strong></div><p>'+esc(desc)+'</p><input type="range" min="0" max="4" step="1" id="policy-'+id+'" data-policy="'+id+'"><div class="social-ruler"><span>Сокращать</span><span>Сохранять</span><span>Ускорять</span></div></div>').join("");
 document.querySelectorAll("[data-policy]").forEach(input=>input.addEventListener("input",()=>{d.social[input.dataset.policy]=Number(input.value);renderEconomy()}));
}
function renderIndustryCards(){
 $("sectorCards").innerHTML=d.industries.map(s=>'<button type="button" class="sector-card '+(selectedSector===s.id?"active":"")+'" data-sector="'+s.id+'"><strong>'+esc(s.name)+'</strong><small>'+esc(s.tag)+'</small><span class="pace-indicator">'+esc(paces[s.pace])+'</span></button>').join("");
 document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>{selectedSector=b.dataset.sector;renderIndustryCards()}));
 const s=d.industries.find(x=>x.id===selectedSector);
 $("sectorName").textContent=s.name;$("sectorLegacy").textContent=s.asset;$("sectorLimit").textContent=s.limitation;$("sectorOpportunity").textContent=s.opportunity;
 $("sectorPaces").innerHTML=paces.map((label,i)=>'<button type="button" data-pace="'+i+'" class="pace-btn '+(i===s.pace?"active":"")+'">'+esc(label)+'</button>').join("");
 document.querySelectorAll("[data-pace]").forEach(b=>b.addEventListener("click",()=>{s.pace=Number(b.dataset.pace);renderIndustryCards();renderEconomy()}));
 $("sectorLabour").checked=s.agreement;
}
$("sectorLabour").addEventListener("change",()=>{const s=d.industries.find(x=>x.id===selectedSector);s.agreement=$("sectorLabour").checked;renderEconomy()});
function renderEconomy(){
 const b=budget();
 $("budgetLimit").textContent=number(b.limit);
 $("budgetSpent").textContent=number(b.total)+" % ВВП";
 $("budgetPercent").textContent=number(b.percent,0)+"%";
 $("budgetGap").textContent=b.deficit>0?"Дефицит "+number(b.deficit)+" % ВВП":"Остаток "+number(b.limit-b.total)+" % ВВП";
 $("budgetGap").classList.toggle("warning",b.deficit>0);
 $("budgetFill").style.width=bound(b.percent,0,100)+"%";
 $("budgetFill").classList.toggle("over",b.percent>100);
 $("budgetExplanation").textContent=b.deficit>0?
  "Заявленные дополнительные программы превышают доступный лимит на "+number(b.deficit)+" % ВВП. Их нельзя считать оплаченными до одобрения дополнительных доходов, займа, сокращения других расходов или пересмотра плана.":
  "Остаток программы "+number(b.limit-b.total)+" % ВВП. Суммы и источники финансирования необходимо согласовать с действующим бюджетом.";
 $("socialCost").textContent="Социальная политика: "+number(b.social)+"% ВВП";
 $("modernCost").textContent="Модернизация: "+number(b.manufacturing)+"% ВВП";
 $("retrainCost").textContent="Переобучение: "+number(b.training)+"% ВВП";
 socialFields.forEach(([id])=>{
  $("policy-"+id).value=d.social[id];
  document.querySelector('[data-policy-value="'+id+'"]').textContent=labels[d.social[id]]+" · "+number(d.economy.socialAnnualPctGDP[id][d.social[id]])+"% ВВП";
 });
 const s=d.social;const conflictRatio=b.need?b.uncovered/b.need:0;
 const support=bound(Math.round(25+10*s.health+9*s.housing+7*s.wages-30*conflictRatio-Math.max(0,b.percent-100)*.16));
 const stability=bound(Math.round(43+6*s.health+5*s.housing+4*s.wages-33*conflictRatio-Math.max(0,b.percent-100)*.15));
 const equality=bound(Math.round(24+7*s.health+6*s.housing+5*s.wages));
 const friction=bound(Math.round(18+58*conflictRatio-7*s.wages+Math.max(0,b.percent-100)*.12));
 const readouts=[
  ["Условная поддержка социальной политики",support,"Не электоральный прогноз."],
  ["Устойчивость трудового компромисса",stability,"Отстающие программы и неоплаченные расходы снижают устойчивость."],
  ["Вектор к большему равенству",equality,"Не официальный индекс равенства ВПИ."],
  ["Риск трудовых споров",friction,"Реальные последствия определяет судья."]
 ];
 $("socialReadouts").innerHTML=readouts.map(([label,v,note])=>'<div class="score-row"><div class="score-top"><span>'+esc(label)+'</span><strong>'+v+'/100</strong></div><div class="score-track"><span style="width:'+v+'%"></span></div><small>'+esc(note)+'</small></div>').join("");
 $("socialNarrative").innerHTML="<strong>Связь двух политик</strong><p>Переподготовка "+number(b.covered,1)+" тыс. работников стоит "+number(b.training,3)+" % ВВП и требует времени. Без соглашений могут остаться "+number(b.uncovered,1)+" тыс. затронутых работников. Правительственная поддержка профсоюзов не заменяет отраслевые переговоры.</p>";
 $("projectCount").textContent=d.industries.filter(x=>x.pace>0).length+" / "+d.industries.length+" программ";
 $("activeProjects").textContent=d.industries.filter(x=>x.pace>0).length+" отраслей";
 $("trainingDemand").textContent=number(b.need,1)+" тыс. чел.";
 $("trainingCovered").textContent=number(b.covered,1)+" тыс. чел.";
 $("trainingUncovered").textContent=(b.need?number(100*b.uncovered/b.need,0):"0")+"%";
 $("industrialFriction").textContent=number(friction,0)+"/100";
 $("portfolioMessage").textContent=b.deficit>0?"Указанные программы не обеспечены источниками финансирования. Перенос расходов в будущее или кредит требуют отдельного решения судьи.":"Общий бюджет формально укладывается в демонстрационный лимит, но сроки, количество специалистов и поставки оборудования ещё подлежат проверке.";
 $("portfolioMessage").classList.toggle("warning",b.deficit>0);
 if(!$("economyDraft").hidden)$("economyDraftText").value=economyProposal();
 updateFx();
}
function economyProposal(){
 const b=budget();
 return [
  "Великобритания, "+d.year+" год. Проект новой экономической программы.",
  "Лимит новых программ (демо): "+number(b.limit)+" % ВВП.",
  ...socialFields.map(([id,label])=>label+": "+labels[d.social[id]]+" ("+number(d.economy.socialAnnualPctGDP[id][d.social[id]])+" % ВВП)"),
  ...d.industries.filter(s=>s.pace>0).map(s=>"Отрасль "+s.name+": "+paces[s.pace]+", капитал "+number(retoolCost(s))+" % ВВП, переобучение "+(s.agreement?"предусмотрено":"не предусмотрено")),
  "Заявлено всего: "+number(b.total)+" % ВВП; непокрытый дефицит: "+number(b.deficit)+" % ВВП.",
  "Работники к переподготовке: "+number(b.need,1)+" тыс.; оплаченные места: "+number(b.covered,1)+" тыс.",
  "Дополнительное импортное оборудование: "+number(modernImportUSD(),3)+" млрд $.",
  "Прошу судью проверить ресурсы, источники финансирования, согласия профсоюзов, законы и календарь реализации.",
  "Это сценарный черновик; показатели не являются автоматически исполненными."
 ].join("\n");
}
$("economyGenerate").addEventListener("click",()=>{$("economyDraft").hidden=false;$("economyDraftText").value=economyProposal()});
$("economyCopy").addEventListener("click",()=>copyDraft("economyDraftText","economyCopyStatus"));
$("economyReset").addEventListener("click",()=>{
 d.economy=JSON.parse(JSON.stringify(init.economy));
 d.industries=JSON.parse(JSON.stringify(init.industries));
 d.social=JSON.parse(JSON.stringify(init.social));
 renderIndustryCards();renderEconomy();
});
renderSocialControls();
renderIndustryCards();
renderEconomy();
})();