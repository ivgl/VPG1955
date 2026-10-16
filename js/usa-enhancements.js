"use strict";
/* Player-facing supplementary maps and coalition reference. Read-only: official state comes from judge's public snapshot, not clicks. */
(function(){
const geo=window.VPI_USA_MAPS;if(!geo)return;
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const originalStates=(typeof STATES!=="undefined"?STATES:[]);
const statesById=new Map(originalStates.map(s=>[s.id,s]));
const names=Object.fromEntries("Alabama:AL|Arizona:AZ|Arkansas:AR|California:CA|Colorado:CO|Connecticut:CT|Delaware:DE|Florida:FL|Georgia:GA|Idaho:ID|Illinois:IL|Indiana:IN|Iowa:IA|Kansas:KS|Kentucky:KY|Louisiana:LA|Maine:ME|Maryland:MD|Massachusetts:MA|Michigan:MI|Minnesota:MN|Mississippi:MS|Missouri:MO|Montana:MT|Nebraska:NE|Nevada:NV|New Hampshire:NH|New Jersey:NJ|New Mexico:NM|New York:NY|North Carolina:NC|North Dakota:ND|Ohio:OH|Oklahoma:OK|Oregon:OR|Pennsylvania:PA|Rhode Island:RI|South Carolina:SC|South Dakota:SD|Tennessee:TN|Texas:TX|Utah:UT|Vermont:VT|Virginia:VA|Washington:WA|West Virginia:WV|Wisconsin:WI|Wyoming:WY|District of Columbia:DC".split("|").map(x=>x.split(":")));
// Factions: qualitative people/policy links, not invented vote counts.
const factions=[
 {id:"south",name:"Южные демократы",sub:"Консервативные региональные политики",t:"Сильные позиции в некоторых комитетах, защита сегрегации и прав штатов. Возможны индивидуальные сделки по бюджету, сельскому хозяйству и инфраструктуре — но не автоматическая поддержка гражданских прав."},
 {id:"liberal",name:"Либеральные демократы",sub:"Северные и западные реформаторы",t:"Часто выступают за федеральные гражданские права, социальные программы и трудовое законодательство. Конкретная поддержка зависит от состава коалиции и текста законопроекта."},
 {id:"urban",name:"Городские демократы",sub:"Муниципальные союзы и профсоюзные сети",t:"Влияют на занятость, городские инвестиции и представительство разных общин. Это не единая дисциплинированная фракция, а полезное направление политических переговоров."},
 {id:"moderate",name:"Умеренные республиканцы",sub:"Часть политического крыла Эйзенхауэра",t:"Готовы искать межпартийные компромиссы по федеральным законам и управлению. Позиции различаются по налогам, социальной политике и полномочиям Вашингтона."},
 {id:"conservative",name:"Консервативные республиканцы",sub:"Ограничение расходов и федеральных полномочий",t:"Возможен конфликт с умеренными членами собственной партии по государственным программам. По некоторым темам позиции могут совпадать с консервативными демократами."}
];
const factionRoot=document.querySelector(".factions");
if(factionRoot){
 factionRoot.innerHTML=factions.map(x=>'<button type="button" class="faction usa-faction" data-usa-faction="'+x.id+'"><b>'+escapeHtml(x.name)+'</b><span>'+escapeHtml(x.sub)+'</span></button>').join("");
 const detail=document.createElement("div");detail.className="usa-focus";detail.id="usFactionInfo";factionRoot.after(detail);
 function selectFaction(id){const x=factions.find(z=>z.id===id);if(!x)return;detail.innerHTML="<strong>"+escapeHtml(x.name)+"</strong><p>"+escapeHtml(x.t)+"</p>";factionRoot.querySelectorAll("[data-usa-faction]").forEach(b=>b.classList.toggle("active",b.dataset.usaFaction===id))}
 factionRoot.querySelectorAll("[data-usa-faction]").forEach(b=>b.addEventListener("click",()=>selectFaction(b.dataset.usaFaction)));
 selectFaction("south");
}
// Geolocated European alliance assets, NOT guaranteed bonuses.
const bases=[
 {id:"keflavik",title:"Кефлавик",country:"Исландия",lon:-22.6,lat:63.98,kind:"Авиабаза и обеспечение трансатлантических коммуникаций",status:"Двустороннее соглашение исландской стороны о размещении сил; финансирование не означает владение территорией."},
 {id:"lakenheath",title:"RAF Lakenheath",country:"Великобритания",lon:.56,lat:52.41,kind:"Американская авиация, база на британской территории",status:"Доступ в рамках англо-американских договорённостей, условия определяет принимающая сторона."},
 {id:"wiesbaden",title:"Висбаден — Рейн-Майн",country:"ФРГ",lon:8.23,lat:50.05,kind:"Военно-воздушные объекты, снабжение и переброска сил",status:"Западная Германия начала 1955 года ещё не обладает полностью вступившим в силу новым суверенным статусом."},
 {id:"laon",title:"Лаон",country:"Франция",lon:3.6,lat:49.57,kind:"Авиабаза НАТО во Франции",status:"Базирование зависит от двусторонних прав, французского государства и союзных договорённостей."},
 {id:"aviano",title:"Авиано",country:"Италия",lon:12.61,lat:46.03,kind:"Авиационный опорный пункт в Южной Европе",status:"Союзное размещение и инфраструктура не создают автоматически новые самолёты или расчёты."},
 {id:"spain",title:"Испанские соглашения",country:"Испания",lon:-3.46,lat:40.47,kind:"Соглашения 1953 года, развитие будущей базы в Торрехоне",status:"На январь 1955 года сеть строится; не считать будущие объекты полностью действующими."}
];
const allied=document.getElementById("allies"),firstStack=allied?.querySelector(".stack");
if(firstStack){
 firstStack.insertAdjacentHTML("afterbegin",'<article class="card usa-alliances"><div class="secthead"><div><div class="label">Европейское направление</div><h2>Сеть американских военных узлов</h2></div><span class="badge dark">Карта</span></div><p>Нажмите объект: карта показывает действующий тип доступа, международные ограничения и стратегическую задачу.</p><svg id="usaEuropeMap" viewBox="0 0 960 500" aria-label="Географическая карта американских объектов в Европе"></svg><div class="usa-map-pills" id="usaBaseChoices"></div><div class="usa-focus" id="usaBaseDetail"></div><p class="micro" id="usaBaseSupport"></p></article>');
 const pr=(lon,lat)=>[(lon+25)*13.4,(72-lat)*12.5];
 const continent=geo.westernEurope.countries.map(c=>'<path class="usa-europe-shape" d="'+c.path+'"><title>'+escapeHtml(c.name)+'</title></path>').join("");
 const pins=bases.map(b=>{const [x,y]=pr(b.lon,b.lat);return '<circle role="button" tabindex="0" data-us-base="'+b.id+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="8" class="usa-europe-pin" aria-label="'+escapeHtml(b.title)+'"><title>'+escapeHtml(b.title)+'</title></circle>'}).join("");
 document.getElementById("usaEuropeMap").innerHTML=continent+pins;
 document.getElementById("usaBaseChoices").innerHTML=bases.map(b=>'<button type="button" data-us-choice="'+b.id+'">'+escapeHtml(b.title)+'</button>').join("");
 const choose=id=>{const b=bases.find(x=>x.id===id);if(!b)return;
 document.getElementById("usaBaseDetail").innerHTML="<strong>"+escapeHtml(b.title)+" · "+escapeHtml(b.country)+"</strong><p>"+escapeHtml(b.kind)+"</p><p>"+escapeHtml(b.status)+"</p>";
 document.querySelectorAll("[data-us-base],[data-us-choice]").forEach(x=>x.classList.toggle("active",x.dataset.usBase===id||x.dataset.usChoice===id));
 };
 document.querySelectorAll("[data-us-base],[data-us-choice]").forEach(b=>{
  const fn=()=>choose(b.dataset.usBase||b.dataset.usChoice);b.addEventListener("click",fn);
  b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fn()}});
 });
 const slider=document.getElementById("allySlider"),msg=document.getElementById("usaBaseSupport");
 const update=()=>{const pct=Number(slider?.value||0);msg.textContent="Сценарные расходы на союзную сеть: "+pct.toFixed(1).replace(".",",")+"% ВВП. Повышение расходов может финансировать подготовку, обслуживание и соглашения, но конкретные объекты и права меняются только по игровым постам и вердиктам."};
 slider?.addEventListener("input",update);update();choose("wiesbaden");
}
// Civil-rights geography. The old gamey progress controls are superseded; legacy script ran before this enhancement.
const civil=document.getElementById("civil");
if(civil){
 civil.innerHTML='<div class="usa-civil-grid"><article class="card"><div class="secthead"><div><div class="label">Юридическая и политическая карта</div><h2>Десегрегация школ по штатам</h2></div><span class="badge dark">Справочник 1955</span></div><p class="description">Различайте законодательное положение до решения Верховного суда 1954 года, фактическое исполнение после решения и сопротивление местных властей. Никаких очков, которые нужно накопить для права провести реформу.</p><div class="usa-map-legend"><span><i class="mandatory"></i> Прежний закон требовал сегрегацию</span><span><i class="allowed"></i> Ранее допускалась</span><span><i class="other"></i> Отдельной оценки пока нет</span></div><svg id="usaStateGeo" viewBox="0 0 990 470" role="group" aria-label="Карта 48 штатов и округа Колумбия"></svg><p class="micro">Аляска и Гавайи в январе 1955 года ещё не имеют статуса штатов. Географические контуры современные, политико-правовое содержание относится к исходному 1955 году.</p><div id="usaStateChoices" class="usa-map-pills"></div></article><article class="card"><div class="label">Выбранная территория</div><h2 id="usaStateName">—</h2><span id="usaStateLaw" class="badge dark">—</span><p id="usaStateInfo"></p><div class="line"></div><h3>Что может предпринять игрок</h3><p>Инициировать федеральное законодательство, договариваться с конгрессменами, обращаться в суды, защищать школьников, финансировать инфраструктуру или искать политический компромисс. Результаты зависят от полномочий и ситуации в конкретном штате.</p><p class="micro">Нельзя по одному цвету определять фактическое положение всех школ: требуется отдельный подтверждённый игровой статус.</p></article></div>';
 const svg=document.getElementById("usaStateGeo");
 svg.innerHTML=geo.usStates.states.map(s=>{
  const code=names[s.name]||"?",record=statesById.get(code),law=record?.law||"нет подтверждённой оценки";
  return '<path tabindex="0" role="button" data-usa-state="'+escapeHtml(code)+'" data-law="'+escapeHtml(law)+'" class="usa-state-shape" d="'+s.path+'" aria-label="'+escapeHtml(s.name)+'"><title>'+escapeHtml(s.name)+'</title></path>';
 }).join("");
 const focused=originalStates;document.getElementById("usaStateChoices").innerHTML=focused.map(s=>'<button type="button" data-us-quick="'+s.id+'">'+escapeHtml(s.name)+'</button>').join("");
 function showState(code){
  const x=originalStates.find(x=>x.id===code),name=geo.usStates.states.find(s=>names[s.name]===code)?.name||code;
  document.getElementById("usaStateName").textContent=x?x.name:name;
  document.getElementById("usaStateLaw").textContent=x?(x.law==="обязательная"?"Исторически обязательная сегрегация":"Исторически разрешённая сегрегация"):"Нужна отдельная исходная проверка";
  document.getElementById("usaStateInfo").textContent=x?"В исходном прототипе сопротивление властей оценивалось как «"+x.resistance+"». Это качественный ориентир, не автоматический модификатор. Фактический ход интеграции школ в игровом 1955 году пока не утверждён.":"Штат или федеральный округ показан для географической полноты. Точный школьный правовой и фактический статус в нашем публичном стартовом состоянии пока не заполнен.";
  document.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>b.classList.toggle("active",b.dataset.usaState===code||b.dataset.usQuick===code));
 }
 document.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>{
  const cb=()=>showState(b.dataset.usaState||b.dataset.usQuick);b.addEventListener("click",cb);
  b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cb()}});
 });
 showState("TX");
}
})();