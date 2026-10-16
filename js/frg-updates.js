"use strict";
/* FRG informational enhancements — read-only on-page cards. Dynamic figures are examples until official public state is approved. */
(function(){
const $=id=>document.getElementById(id);
const initial=[
 ["Кадры","Армейский личный состав пока не сформирован. Ведомство Бланка готовит организационные решения."],
 ["Правовой статус","Парижские соглашения подписаны, но ещё не вступили в силу. Объём полномочий зависит от ратификации."],
 ["Учебная база","Подготовительная работа существует; полноценная массовая система обучения военных кадров ещё не создана."],
 ["Боевые соединения","У Бундесвера пока нет подтверждённых развернутых соединений: армия ещё не создана."]
];
$("frgArmyReadiness").innerHTML=initial.map(x=>'<div class="frg-ready-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join("");
const marketContexts={
 steel:"Мировой спрос на сталь, реконструкция Европы и внутренние инфраструктурные проекты. Для роста нужны сырьё, энергия и реальные контракты.",
 machines:"Новые станки позволяют другим заводам расширять выпуск; важно, сможет ли внутренний и экспортный рынок поглотить оборудование.",
 cars:"Автомобили требуют массового платежеспособного спроса, дорог, экспорта и доступного кредита. Предприятия не могут бесконечно продавать растущий выпуск на том же рынке.",
 chem:"Химия ориентирована на внутреннее промышленное потребление и экспортные заказы; нужны валютные рынки, сырьё и НИОКР."
};
function updateMarkets(){
 const cards=[...document.querySelectorAll("[data-sector]")];
 const fast=cards.filter(card=>card.querySelector(".rate")?.textContent==="Быстрый рост").length;
 const total=cards.length;
 const name=document.querySelector(".sector-card.selected")?.dataset.sector||"cars";
 const high=fast>=3;
 $("frgMarketMessage").textContent=high?
 "Быстрый рост задан сразу для "+fast+" из "+total+" отраслей. Даже при достаточных рабочих и станках возможны избыток выпуска, ценовая конкуренция и трудности сбыта. Для устойчивости нужны экспортные соглашения, рост внутренней покупательной способности и инфраструктура.":
 "Быстрый рост выбран для "+fast+" из "+total+" отраслей. Следующая проверка — доступный спрос, экспортные заказы и кредитование покупателей; одной мощности завода недостаточно.";
 $("frgMarketContext").textContent="Выбранная отрасль: "+(marketContexts[name]||"Уточните внутренний спрос и внешние рынки.")+" Численной оценки покупателей и экспорта в утверждённых данных пока нет.";
}
$("growthOptions").addEventListener("click",updateMarkets);
$("industryCards").addEventListener("click",updateMarkets);
updateMarkets();
})();