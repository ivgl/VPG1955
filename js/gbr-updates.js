"use strict";
(function(){
const s=window.VPI_GBR_DRAFT;if(!s)return;
const $=id=>document.getElementById(id);
const fmt=v=>Number(v).toFixed(3).replace(".",",");
let loss=0,conversion=0;
const lossBtns=[0,25,50,75,100].map(v=>'<button data-loss="'+v+'" type="button">'+v+'%</button>').join("");
$("gbrStressPanel").innerHTML='<div class="overline">Стресс-тест валютных резервов</div><p>Какая часть условной конвертируемой экспортной выручки перестала поступать?</p><div id="gbrLossChoices" class="gbr-chips">'+lossBtns+'</div><div id="gbrStressResult" class="gbr-stress-result"></div><p class="note">Выручка для теста — условные 0,60 млрд $, а не установленная статистика 1955 года.</p>';
$("gbrSterlingExperiment").innerHTML='<div class="overline">Стерлинговые договоры</div><h3>Перевод расчётов из долларов в фунты</h3><p>Согласование с партнёрами может уменьшить спрос на доллары, но нельзя расходовать резервы других стран. Требуются торговые соглашения.</p><div id="gbrSterlingChoices" class="gbr-chips">'+[0,10,25].map(v=>'<button data-settle="'+v+'" type="button">'+v+'% контрактов</button>').join("")+'</div><p id="gbrSterlingOutcome" class="note"></p>';
$("gbrTradeStructure").innerHTML='<div class="gbr-trade-cols">'+[["Экспорт",s.tradeStructure.exports],["Импорт",s.tradeStructure.imports]].map(q=>'<div><h4>'+q[0]+'</h4>'+q[1].map(t=>'<div class="gbr-trade-sector"><strong>'+t.label+'</strong><p>'+t.detail+'</p></div>').join("")+'</div>').join("")+'</div><p class="note">Это качественные категории, без неподтверждённых долей экспорта и импорта.</p>';
function render(){
const raw=$("fxEnd").textContent;const reserve=Number(raw.replace(/[^\d,.-]/g,"").replace(",","."));
const lost=s.finance.stressConvertibleExportReceiptsUSD*loss/100;
const saved=s.finance.eligibleSettlementDollarOutflowUSD*conversion/100;
const remaining=(Number.isFinite(reserve)?reserve:s.finance.reserveUSD)-lost+saved;
$("gbrStressResult").textContent="После условного шока резерв: "+fmt(Math.max(0,remaining))+" млрд $. "+(remaining<0?"Валютный разрыв — часть внешних платежей не обеспечена.":"Платежи пока покрываются в демонстрационной модели.");
$("gbrSterlingOutcome").textContent="Гипотетическое уменьшение долларовых платежей: "+fmt(saved)+" млрд $; требуется согласие сторон и проверка договоров.";
document.querySelectorAll("[data-loss]").forEach(b=>b.classList.toggle("active",Number(b.dataset.loss)===loss));
document.querySelectorAll("[data-settle]").forEach(b=>b.classList.toggle("active",Number(b.dataset.settle)===conversion));
}
$("gbrLossChoices").addEventListener("click",e=>{const b=e.target.closest("[data-loss]");if(b){loss=Number(b.dataset.loss);render()}});
$("gbrSterlingChoices").addEventListener("click",e=>{const b=e.target.closest("[data-settle]");if(b){conversion=Number(b.dataset.settle);render()}});
$("sectorPaces").addEventListener("click",render);$("economyReset").addEventListener("click",render);render();
const party=document.createElement("div");party.className="gbr-party-outlook";$("socialNarrative").after(party);
function renderParties(){const x=Number($("policy-health").value)+Number($("policy-housing").value)+Number($("policy-wages").value);
party.innerHTML="<strong>Позиции партий: качественная оценка</strong><p>"+(x>=9?"Акцент на социальных программах может получить поддержку лейбористов и профсоюзов, но потребует объяснений бюджетным консерваторам.":"Ограничение социальных обязательств может вызвать критику лейбористов и профсоюзов. Консерваторы также неоднородны.")+"</p><small>Никаких автоматических голосов или бонусов — реальные решения и парламентский процесс проверяет судья.</small>";}
$("socialControls").addEventListener("input",renderParties);renderParties();
})();