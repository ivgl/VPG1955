"use strict";
/* UK player tools: one explicit reference reserve + optional shock. Scenario results never enter canonical state. */
(function(){
const state=window.VPI_GBR_DRAFT;
if(!state)return;
const $=id=>document.getElementById(id);
const fmt=(v,d=2)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
const fx=state.finance;
let lossPct=0,sterlingPct=0;
const stress=$("gbrStressPanel");
stress.innerHTML='<p>Как изменится запас прочности при потере конвертируемой экспортной выручки?</p><div class="gbr-chips" id="gbrLossChoices">'+[0,25,50,75,100].map(v=>'<button type="button" data-loss="'+v+'">'+v+'% выручки</button>').join("")+'</div><p class="note">Тестовая конвертируемая выручка: 0,60 млрд $ в год. Это не статистика внешней торговли страны; показатель нужен только для демонстрации шока.</p>';
$("gbrSterlingExperiment").innerHTML='<div class="overline">Валютная дипломатия</div><h3>Соглашения о платежах в фунтах</h3><p>Можно договориться с торговыми партнёрами о части расчётов в стерлингах вместо долларов. Это требует согласия другой стороны и может вызвать дипломатические споры.</p><div class="gbr-chips" id="gbrSterlingChoices">'+[0,10,25].map(v=>'<button type="button" data-settle="'+v+'">'+v+'% договоров</button>').join("")+'</div><p class="note" id="gbrSterlingOutcome"></p>';
function safe(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("gbrTradeStructure").innerHTML='<div class="gbr-trade-cols">'+[["Экспорт",state.tradeStructure.exports],["Импорт",state.tradeStructure.imports]].map(group=>'<div><h4>'+group[0]+'</h4>'+group[1].map(x=>'<div class="gbr-trade-sector"><strong>'+safe(x.label)+'</strong><p>'+safe(x.detail)+'</p></div>').join("")+'</div>').join("")+'</div><p class="note">Это качественная структура торговли, пока без количественных долей отраслей.</p>';
function equipmentUSD(){
 return [...document.querySelectorAll("#sectorCards [data-sector]")].reduce((sum,b)=>{
   const id=b.dataset.sector,option=state.economy.extraUSDForModernisation.find(x=>x.id===id);
   if(!option)return sum;
   const pace=b.querySelector(".pace-indicator")?.textContent?.trim()||"";
   return sum+(pace==="Постепенная"?option.slow:pace==="Ускоренная"?option.fast:0);
 },0);
}
function stressRecompute(){
 const loss=fx.stressConvertibleExportReceiptsUSD*lossPct/100;
 const saving=fx.eligibleSettlementDollarOutflowUSD*sterlingPct/100;
 const equipment=equipmentUSD();
 const delta=-loss+saving-equipment;
 const remain=fx.reserveUSD+delta;
 const benchmark=fx.imports1954GBP*fx.usdPerGBP;
 const months=12*Math.max(0,remain)/benchmark;
 $("fxEnd").textContent=fmt(Math.max(0,remain),3)+" млрд $";
 $("fxDelta").textContent=(delta>0?"+":"")+fmt(delta,3)+" млрд $";
 $("fxCoverage").textContent=fmt(Math.max(0,remain)/benchmark*100,1)+"%";
 $("fxMonths").textContent=fmt(months,1)+" мес.";
 $("fxBar").style.width=Math.max(0,Math.min(100,Math.max(0,remain)/benchmark*100))+"%";
 $("fxBar").classList.toggle("critical",remain<=0||months<3);
 $("fxOutlook").textContent=(remain<0?"Валютный разрыв "+fmt(-remain,3)+" млрд $.":"Остаток валютных резервов остаётся положительным.")+" Потеря выручки: "+fmt(loss,3)+" млрд $, уменьшение долларовых платежей по условным договорам: "+fmt(saving,3)+" млрд $, импорт оборудования для выбранных отраслевых программ: "+fmt(equipment,3)+" млрд $. Это только изменение относительно исходных резервов, а НЕ полный платёжный баланс следующего года.";
 $("fxOutlook").classList.toggle("critical",remain<=0||months<3);
 $("gbrSterlingOutcome").textContent="Предполагаемое сокращение долларовых платежей: "+fmt(saving,3)+" млрд $. Перевод в фунты не создаёт ресурсов и требует договорённости с поставщиками.";
 document.querySelectorAll("[data-loss]").forEach(b=>{const a=Number(b.dataset.loss)===lossPct;b.classList.toggle("active",a);b.setAttribute("aria-pressed",String(a))});
 document.querySelectorAll("[data-settle]").forEach(b=>{const a=Number(b.dataset.settle)===sterlingPct;b.classList.toggle("active",a);b.setAttribute("aria-pressed",String(a))});
}
$("gbrLossChoices").addEventListener("click",e=>{const b=e.target.closest("[data-loss]");if(b){lossPct=Number(b.dataset.loss);stressRecompute()}});
$("gbrSterlingChoices").addEventListener("click",e=>{const b=e.target.closest("[data-settle]");if(b){sterlingPct=Number(b.dataset.settle);stressRecompute()}});
const budgetInfo=document.createElement("div");budgetInfo.className="gbr-budget-guide";
budgetInfo.innerHTML='<strong>Как пользоваться балансом</strong><p>«Сохранение» социальных обязательств = изменение 0% ВВП. Расширение NHS, жилья или гарантий требует дополнительных расходов; сокращение даёт условную экономию, но повышает политические риски. Отдельные проекты переоснащения и подготовки кадров конкурируют за тот же ограниченный ресурс.</p><div id="gbrBudgetParts"></div><p class="note">Расходы — примерные доли ВВП, а не фактический бюджет или подтверждённая стоимость реформ.</p>';
$("budgetExplanation").after(budgetInfo);
function budgetParts(){
 const sources=[
 ["Изменение социальных расходов",$("socialCost").textContent],
 ["Переоснащение отраслей",$("modernCost").textContent],
 ["Переобучение работников",$("retrainCost").textContent]
 ];
 $("gbrBudgetParts").innerHTML=sources.map(x=>'<div class="gbr-budget-part"><span>'+x[0]+'</span><strong>'+x[1].split(":").slice(1).join(":").trim()+'</strong></div>').join("")+
 '<div class="gbr-budget-part total"><span>Всего дополнительных расходов</span><strong>'+$("budgetSpent").textContent+' из '+$("budgetLimit").textContent+'% ВВП</strong></div>';
}
const party=document.createElement("div");party.className="gbr-party-outlook";
$("socialNarrative").after(party);
function partySummary(){
 const h=Number($("policy-health").value),w=Number($("policy-wages").value),housing=Number($("policy-housing").value);
 const generous=h+w+housing>7;
 party.innerHTML='<strong>Парламентская цена курса</strong><p>'+(generous?"Дополнительные социальные расходы могут стать предметом соглашения с лейбористами и профсоюзами, но их надо оплатить и провести через парламент.":"Экономия на социальных программах может уменьшить потребность в финансировании модернизации, но вызовет спор с частью профсоюзов и лейбористов.")+'</p><small>Это качественный политический риск, а не гарантированное голосование.</small>';
}
function refreshLater(){requestAnimationFrame(()=>{stressRecompute();budgetParts();partySummary()})}
for(const id of ["sectorCards","sectorPaces","socialControls","economyReset","sectorLabour"]){$(id).addEventListener(id==="socialControls"||id==="sectorLabour"?"input":"click",refreshLater)}
stressRecompute();budgetParts();partySummary();
})();