"use strict";
/* FRG 1955 interactive draft: no persistence, no canonical gameplay updates. */
(function(){
const $=id=>document.getElementById(id);
const initialHash=location.hash.slice(1);
function tab(id){document.querySelectorAll(".tab").forEach(b=>{const a=b.dataset.tab===id;b.classList.toggle("active",a);b.setAttribute("aria-selected",String(a))});document.querySelectorAll(".pane").forEach(s=>{let a=s.id===id;s.classList.toggle("active",a);s.hidden=!a});if(history.replaceState)history.replaceState(null,"","#"+id)}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
if(["sovereignty","industry","social","germany"].includes(initialHash))tab(initialHash);
const safe=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const steps=[
 {id:"signed",title:"Парижские соглашения подписаны",period:"Октябрь 1954",needs:"Документы уже согласованы и подписаны до старта кампании.",opens:"Подготовка к ратификации и вступлению в силу.",detail:"Начальное историческое условие, не достижение игрока 1955 года.",pr:[]},
 {id:"ratified",title:"Ратификация и новый статус ФРГ",period:"Переговоры и правовая процедура",needs:"Ратификация необходимых соглашений, выполнение условий вступления в силу, позиции союзных держав.",opens:"Расширение внутреннего и внешнего суверенитета с сохраняющимися специальными правами союзников.",detail:"Исторически договоры вступили в силу 5 мая 1955 года. Это не автоматический результат игрового года.",pr:["signed"]},
 {id:"alliance",title:"Система международной безопасности",period:"Союзники и совместное планирование",needs:"Вступление в НАТО/ЗЕС на согласованных условиях или утверждённая альтернативная договорная конструкция.",opens:"Возможности военной помощи, подготовки и совместимости, но не готовую национальную армию.",detail:"НАТО исторически стало важным условием восстановления военного потенциала ФРГ. Другой путь возможен по судейскому решению.",pr:["ratified"]},
 {id:"ministry",title:"Военное ведомство и правовая база",period:"Парламент · министерства",needs:"Правовые полномочия, гражданский и парламентский контроль, структура управления и бюджет.",opens:"Право начинать организацию собственных вооружённых сил и кадровую подготовку.",detail:"Исторический прототип — ведомство Бланка и его преобразование в министерство обороны.",pr:["ratified"]},
 {id:"cadres",title:"Подготовка первых военнослужащих",period:"Обучение и оснащение",needs:"Набор, офицерские кадры, инструкторы, техника, казармы и оплаченная подготовка.",opens:"Первые кадрированные и учебные подразделения. Они ещё не полноценные боеготовые дивизии.",detail:"В истории первые военнослужащие получили назначения в ноябре 1955 года.",pr:["ministry"]},
 {id:"units",title:"Боеспособные соединения",period:"Развёртывание армии",needs:"Подготовленные кадры, снабжение, вооружение, инфраструктура, совместные учения и фактические сроки развёртывания.",opens:"Оценка конкретных частей по общим военным правилам ВПИ. Бонусные дивизии не появляются за членство в альянсе.",detail:"Организационный этап важен, но реальная готовность каждого соединения считается отдельно.",pr:["cadres"]}
];
const completed=new Set(["signed"]);
let selectedStep="ratified";
function accessible(s){return s.pr.every(x=>completed.has(x))}
function rebuildDeps(){let changed=true;while(changed){changed=false;steps.forEach(s=>{if(s.id!=="signed"&&completed.has(s.id)&&!accessible(s)){completed.delete(s.id);changed=true}})}}
function renderSteps(){
 $("milestoneCount").textContent=completed.size+" / "+steps.length+" этапов";
 $("roadmap").innerHTML=steps.map((s,i)=>{
  const done=completed.has(s.id),ready=accessible(s),lock=!ready&&!done,sel=selectedStep===s.id;
  return '<button type="button" class="milestone '+(done?"done ":"")+(lock?"locked ":"")+(sel?"selected":"")+'" data-step="'+s.id+'" aria-pressed="'+(done?"true":"false")+'"><span class="number">'+(done?"✓":String(i+1).padStart(2,"0"))+'</span><span><span class="title">'+safe(s.title)+'</span><small>'+safe(s.period)+'</small></span><span class="side">'+(done?"Пройдено":lock?"Условия не выполнены":"Открыт")+'</span></button>';
 }).join("");
 document.querySelectorAll("[data-step]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.step;selectedStep=id;const s=steps.find(x=>x.id===id);if(id!=="signed"&&accessible(s)){completed.has(id)?completed.delete(id):completed.add(id);rebuildDeps()}renderSteps();renderArmy()}));
 const st=steps.find(x=>x.id===selectedStep);
 $("milestoneTitle").textContent=st.title;$("milestoneText").textContent=st.detail;
 $("milestoneNeeds").textContent=st.needs;$("milestoneUnlocks").textContent=st.opens;
 $("milestoneState").textContent=completed.has(st.id)?"Отмечено пройденным только в демонстрационном сценарии.":accessible(st)?"Доступно для пробного прохождения. Нажмите карточку этапа, чтобы отметить выполнение.":"Для пробного прохождения сначала завершите предшествующие этапы.";
}
$("resetMilestones").addEventListener("click",()=>{completed.clear();completed.add("signed");selectedStep="ratified";Object.keys(army).forEach(k=>army[k]=0);renderSteps();renderArmy()});
const army={cadres:0,equipment:0,training:0,logistics:0};
const armyParts=[["cadres","Личный состав","Кадры и набор"],["equipment","Вооружение","Техника и материальная часть"],["training","Учебные центры","Инструкторы и полигоны"],["logistics","Снабжение","Казармы, транспорт, склады"]];
function renderArmy(){
 let unlocked=completed.has("ministry");
 $("armyLock").textContent=unlocked?"Пробная правовая база создана. Вы можете моделировать развитие организационной системы.":"Разблокируется после пробного завершения этапа «Военное ведомство и правовая база».";
 $("armyControls").innerHTML=armyParts.map(([id,title,desc])=>'<div class="army-field"><label for="army-'+id+'">'+title+'</label><strong>'+army[id]+' / 4</strong><input id="army-'+id+'" data-army="'+id+'" type="range" min="0" max="4" step="1" value="'+army[id]+'" '+(unlocked?"":"disabled")+'><p class="fine">'+desc+'</p></div>').join("");
 document.querySelectorAll("[data-army]").forEach(s=>s.addEventListener("input",()=>{army[s.dataset.army]=Number(s.value);renderArmy()}));
 const min=Math.min(...Object.values(army)); $("armyGrade").textContent="Этап "+(unlocked?min:0)+" / 4";
 $("armyMeter").style.width=(unlocked?min*25:0)+"%";
 $("armyComment").textContent=unlocked?(min===0?"Недостаточно хотя бы одного критического элемента организации.":min===4?"Условная организационная система сформирована. Готовность частей требует отдельного расчёта.":"Самый отстающий компонент ограничивает развитие всей системы."):"Вооружённые силы ещё не созданы.";
}
renderSteps();renderArmy();
const sectors=[
 {id:"steel",name:"Уголь и сталь",subtitle:"Сырьё и основа промышленности",growth:3,desc:"Шахты, металлургия и энергетическая база питают другие отрасли. Расширение зависит от модернизации, транспортных мощностей и занятости."},
 {id:"machines",name:"Машиностроение",subtitle:"Станки, оборудование, экспорт",growth:3,desc:"Машины и оборудование позволяют модернизировать заводы дома и продавать продукцию за рубеж. Узкие места — инженеры, инвестиции и экспортный спрос."},
 {id:"cars",name:"Автомобилестроение",subtitle:"Заводы и потребительский спрос",growth:4,desc:"Автомобили — один из символов экономического подъёма. Рост требует рабочих, стали, станков, логистики и доступа к внешним рынкам."},
 {id:"chem",name:"Химическая промышленность",subtitle:"Технологии и внешняя торговля",growth:3,desc:"Сложное производство, экспорт и химические материалы зависят от специалистов, сырья, энергии и капитальных вложений."}
];
const rates=["Спад","Нет роста","Слабый рост","Нормальный рост","Быстрый рост"];
const burdens=[0,7,16,26,39];
let selectedSector="cars";
function labour(){const demand=sectors.reduce((s,x)=>s+burdens[x.growth],0);const supply=75+Number($("training").value)+Number($("migration").value);const shortage=Math.max(0,demand-supply);return {demand,supply,shortage};}
function renderSectors(){
 $("industryCards").innerHTML=sectors.map(s=>'<button class="sector-card '+(s.id===selectedSector?"selected":"")+'" type="button" data-sector="'+s.id+'"><b>'+safe(s.name)+'</b><small>'+safe(s.subtitle)+'</small><div class="sector-progress"><span style="width:'+(s.growth*25)+'%"></span></div><span class="rate">'+safe(rates[s.growth])+'</span></button>').join("");
 document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>{selectedSector=b.dataset.sector;renderSectors()}));
 const s=sectors.find(x=>x.id===selectedSector);$("sectorTitle").textContent=s.name;$("sectorText").textContent=s.desc;$("sectorLabel").textContent=rates[s.growth];
 $("growthOptions").innerHTML=rates.map((r,i)=>'<button type="button" class="growth-btn '+(s.growth===i?"active":"")+'" data-growth="'+i+'" aria-pressed="'+(s.growth===i)+'">'+safe(r)+'</button>').join("");
 document.querySelectorAll("[data-growth]").forEach(b=>b.addEventListener("click",()=>{s.growth=Number(b.dataset.growth);renderSectors();renderSocial()}));
 renderLabour();
}
function renderLabour(){
 const m=labour();$("trainingValue").textContent=$("training").value+" усл. ед.";$("migrationValue").textContent=$("migration").value+" усл. ед.";
 $("workersDemand").textContent=m.demand+" усл. ед.";$("workersSupply").textContent=m.supply+" усл. ед.";
 $("labourFill").style.width=Math.min(100,m.demand/m.supply*100)+"%";$("labourFill").classList.toggle("overloaded",m.shortage>0);
 $("labourMessage").classList.toggle("warning",m.shortage>0);
 $("labourMessage").textContent=m.shortage>0?"Условный дефицит: "+m.shortage+" ед. При таком ускорении всем отраслям одновременно может не хватить кадров. Понадобятся обучение, миграционные договоры или снижение темпов.":"В условном сценарии кадрового резерва достаточно. Снабжение материалами, энергия и капитал всё равно требуют отдельной проверки.";
}
["training","migration"].forEach(id=>$(id).addEventListener("input",()=>{renderLabour();renderSocial()}));
renderSectors();
function renderSocial(){
 const v=Number($("socialSlider").value),m=labour();
 const protect=Math.round(22+v*.66),invest=Math.round(84-v*.40),equality=Math.round(23+v*.56);
 const potential=Math.max(0,Math.round(invest-Math.min(35,m.shortage*.35)));
 $("socialNumber").textContent=v+" / 100";
 $("socialExplanation").innerHTML=v<30?"<strong>Курс на свободу рынка</strong><p>Меньше прямого регулирования и больше стимулов для частных инвестиций. Общественные риски зависят от условий труда, зарплат и доступности услуг.</p>":v>70?"<strong>Курс на широкие гарантии</strong><p>Выше приоритет страхования, защиты работников и общественных услуг. Финансирование и согласие политических партнёров становятся особенно важными.</p>":"<strong>Смешанная модель социального рынка</strong><p>Правительство пытается сочетать частные инвестиции с социальными институтами и коллективными переговорами. Исход зависит от исполнения и состояния экономики.</p>";
 const signals=[
 ["Потенциал инвестиционных стимулов",potential,"Схематический индекс. Не прогноз прироста ВВП."],
 ["Социальная защищённость",protect,"Направление политики; нужны реальные расходы."],
 ["Возможный эффект на равенство",equality,"Модельный ориентир, не официальный индекс равенства."]
 ];
 $("socialSignals").innerHTML=signals.map(([title,val,note])=>'<div class="social-signal"><div class="inline-label"><span>'+title+'</span><strong>'+val+' / 100</strong></div><div class="track"><span style="width:'+val+'%"></span></div><small>'+note+'</small></div>').join("");
}
$("socialSlider").addEventListener("input",renderSocial);renderSocial();
const dossier={
 frg:{title:"Федеративная Республика Германия",status:"ФРГ · собственные федеральные органы",context:"Канцлер Конрад Аденауэр возглавляет западногерманское правительство. Парижские соглашения уже подписаны, но на 01.01.1955 ещё не вступили в силу.",rel:"Права держав-победительниц сохраняются в вопросах Германии в целом и Берлина; окончательное восстановление суверенитета зависит от договоров.",near:"Ратификация союзных соглашений, укрепление полномочий и создание армии.",long:"Соотношение западной интеграции, дипломатии с ГДР и идеи мирного объединения."},
 gdr:{title:"Германская Демократическая Республика",status:"ГДР · отдельное социалистическое государство",context:"Восточная Германия находится в советской сфере влияния. ФРГ не управляет её правительством или хозяйством.",rel:"Межгерманский вопрос связан с позицией СССР, западных держав и международным признанием.",near:"Определить линию Бонна по контактам, признанию, коммуникациям и передвижению людей.",long:"Поиск договорного пути к изменению германского раздела без одностороннего изменения границ."},
 saar:{title:"Саарская область",status:"Саар · особое положение при тесной связи с Францией",context:"На 01.01.1955 Саар не является землёй ФРГ. Его статус связан с отдельными договорённостями и планируемым голосованием о европейском статусе.",rel:"Дипломатические отношения с Францией и воля местного населения определяют возможное урегулирование.",near:"Переговоры с Парижем и подготовка к политическому определению статуса.",long:"Возможная политическая и хозяйственная интеграция в ФРГ после согласованных решений."},
 berlin:{title:"Западный Берлин",status:"Особый статус · права западных держав",context:"Западный Берлин не является обычной федеральной землёй ФРГ в 1955 году, несмотря на тесные политические и экономические связи.",rel:"Правовой статус, доступ и защита зависят от четырёхстороннего порядка и ответственности союзников.",near:"Поддержка экономики, снабжения и транспортного сообщения с городом.",long:"Безопасность Берлина, отношения между секторами и любой будущий общегерманский договор."}
};
let activeRegion="frg";
function makeMap(){
 const geo=window.VPI1955_MAPS?.germany;if(!geo){$("germanMap").textContent="Не удалось загрузить географическую основу";return}
 const parts=geo.states.map(s=>'<path tabindex="0" role="button" aria-label="'+safe(s.name)+' — '+(s.region==="west"?"ФРГ":s.region==="east"?"ГДР":s.region==="saar"?"Саар":"Берлин")+'" class="geo-path" data-region="'+(s.region==="west"?"frg":s.region==="east"?"gdr":s.region)+'" d="'+s.d+'"><title>'+safe(s.name)+'</title></path>');
 parts.push('<text class="map-label" x="198" y="332">ФРГ</text><text class="map-label" x="423" y="324">ГДР</text>');
 parts.push('<path class="map-label-line" d="M135,425 L88,449"/><text class="map-label secondary" x="33" y="466">Саар</text>');
 parts.push('<circle class="map-pin" role="button" tabindex="0" aria-label="Западный Берлин" data-region="berlin" cx="446" cy="199" r="10"/><path class="map-label-line" d="M456,189 L496,164"/><text class="map-label secondary" x="497" y="161">Берлин</text>');
 $("germanMap").innerHTML=parts.join("");
 document.querySelectorAll("[data-region]").forEach(el=>{const activate=()=>chooseRegion(el.dataset.region);el.addEventListener("click",activate);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate()}})});
 chooseRegion("frg");
}
function chooseRegion(id){
 activeRegion=id;const d=dossier[id];if(!d)return;
 document.querySelectorAll("[data-region]").forEach(el=>el.classList.toggle("active",el.dataset.region===id));
 $("geoTitle").textContent=d.title;$("geoStatus").textContent=d.status;$("geoContext").textContent=d.context;
 $("geoRelations").textContent=d.rel;$("geoNear").textContent=d.near;$("geoLong").textContent=d.long;
}
makeMap();
})();