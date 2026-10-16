"use strict";
/* Read-only FRG army state and interactive MARKET CONTEXT, not an unapproved growth formula. */
(function(){
const $=id=>document.getElementById(id);
const ready=[
 ["Личный состав","Бундесвер ещё не учреждён. Подготовка руководящих кадров — отдельная программа."],
 ["Правовая основа","Парижские соглашения подписаны, но ещё не вступили в силу. Необходимо завершить юридические процедуры."],
 ["Учебная инфраструктура","Существуют подготовительные структуры, массовая система военного обучения ещё не создана."],
 ["Соединения","Нет официально сформированных соединений Бундесвера на дату начала игры."]
];
$("frgArmyReadiness").innerHTML=ready.map(x=>'<div class="frg-ready-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join("");
const context={
 steel:{title:"Уголь и сталь",home:"Восстановление городов, строительство и заводские закупки поддерживают спрос.",external:"Экспорт зависит от промышленного цикла Западной Европы, контрактов и транспортных путей.",limit:"Новые плавильные мощности требуют энергии, кокса и долгосрочных заказов."},
 machines:{title:"Машиностроение",home:"Новые мощности промышленности создают внутренний спрос на станки.",external:"Нужны конкурентные экспортные заказы и доступ к иностранным покупателям.",limit:"Высокая квалификация и длительные циклы изготовления оборудования."},
 cars:{title:"Автомобилестроение",home:"Доступность кредита, реальные зарплаты и инфраструктура ограничивают внутренний авторынок.",external:"Расширение экспорта требует дилеров, портов, торговых условий и маркетинга.",limit:"Сталь, рабочие кадры, платежеспособность покупателей и транспорт."},
 chem:{title:"Химическая промышленность",home:"Внутренние потребители — производство, сельское хозяйство, промышленность.",external:"Для быстрого увеличения продаж нужны рынки химической продукции и договоры.",limit:"Энергия, сырьё, исследовательские кадры и промышленные стандарты."}
};
const panel=$("frgMarketMessage"),detail=$("frgMarketContext");
const holder=document.createElement("div");holder.className="frg-market-controls";
holder.innerHTML='<button type="button" data-market-view="home">Внутренний спрос</button><button type="button" data-market-view="export">Экспорт</button><button type="button" data-market-view="limits">Структурные риски</button>';
panel.before(holder);
const breakdown=document.createElement("div");breakdown.className="frg-market-breakdown";detail.before(breakdown);
let currentView="home";
function update(){
 const cards=[...document.querySelectorAll("#industryCards [data-sector]")];
 const selected=document.querySelector("#industryCards .sector-card.selected")?.dataset.sector||"cars";
 const info=context[selected]||context.cars;
 const veryFast=cards.filter(c=>c.querySelector(".rate")?.textContent?.trim()==="Быстрый рост").length;
 const risk=veryFast>=3?"Высокая общая нагрузка: быстрый рост сразу в "+veryFast+" отраслях требует новых заказчиков и рынков.":"Быстрый рост выбран в "+veryFast+" из "+cards.length+" отраслей. По каждой необходимы реальные покупатели и поставки.";
 panel.textContent=risk+" Переключайте направления ниже и выбирайте отрасль выше.";
 const row=[["home","Внутренний спрос",info.home],["export","Экспортные рынки",info.external],["limits","Узкие места",info.limit]];
 breakdown.innerHTML=row.map(([id,title,text])=>'<div '+(id===currentView?'':'hidden')+'><strong>'+title+' · '+info.title+'</strong>'+text+'</div>').join("");
 detail.textContent="Это качественная справка. Численность покупателей и экспортные заказы пока не имеют утверждённого количественного индикатора; судья проверит фактические контракты.";
 holder.querySelectorAll("[data-market-view]").forEach(b=>b.classList.toggle("active",b.dataset.marketView===currentView));
}
holder.addEventListener("click",e=>{const b=e.target.closest("[data-market-view]");if(b){currentView=b.dataset.marketView;update()}});
$("growthOptions").addEventListener("click",()=>requestAnimationFrame(update));
$("industryCards").addEventListener("click",()=>requestAnimationFrame(update));
update();
})();