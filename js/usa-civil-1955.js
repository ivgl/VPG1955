"use strict";
(function(){
 const root=document.getElementById("usaCivilPlanner");
 const geo=window.VPI_USA_MAPS,raw=window.VPI_USA_STATES_1950;
 if(!root||!geo||!raw||typeof STATES==="undefined")return;
 const EV={AL:11,AZ:4,AR:8,CA:32,CO:6,CT:8,DE:3,FL:10,GA:12,ID:4,IL:27,IN:13,IA:10,KS:8,KY:10,LA:10,ME:5,MD:9,MA:16,MI:20,MN:11,MS:8,MO:13,MT:4,NE:6,NV:3,NH:4,NJ:16,NM:4,NY:45,NC:14,ND:4,OH:25,OK:8,OR:6,PA:32,RI:4,SC:8,SD:4,TN:11,TX:24,UT:4,VT:3,VA:12,WA:9,WV:8,WI:12,WY:3};
 const stateIds=Object.fromEntries("Alabama:AL|Arizona:AZ|Arkansas:AR|California:CA|Colorado:CO|Connecticut:CT|Delaware:DE|Florida:FL|Georgia:GA|Idaho:ID|Illinois:IL|Indiana:IN|Iowa:IA|Kansas:KS|Kentucky:KY|Louisiana:LA|Maine:ME|Maryland:MD|Massachusetts:MA|Michigan:MI|Minnesota:MN|Mississippi:MS|Missouri:MO|Montana:MT|Nebraska:NE|Nevada:NV|New Hampshire:NH|New Jersey:NJ|New Mexico:NM|New York:NY|North Carolina:NC|North Dakota:ND|Ohio:OH|Oklahoma:OK|Oregon:OR|Pennsylvania:PA|Rhode Island:RI|South Carolina:SC|South Dakota:SD|Tennessee:TN|Texas:TX|Utah:UT|Vermont:VT|Virginia:VA|Washington:WA|West Virginia:WV|Wisconsin:WI|Wyoming:WY|District of Columbia:DC".split("|").map(x=>x.split(":")));
 const focus=Object.fromEntries(STATES.map(s=>[s.id,s]));
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const pct=x=>Number(x).toLocaleString("ru-RU",{minimumFractionDigits:1,maximumFractionDigits:1})+"%";
 const digits=x=>Number(x).toLocaleString("ru-RU");
 let selected="MS";
 root.innerHTML=
 '<div class="usa-state-intro"><div><div class="label">Гражданские права и политическое сопротивление</div><h2>Штаты и федеральная власть</h2><p>Исследуйте, какие местные группы способны затормозить десегрегацию, как они связаны с Конгрессом и что даст устранение барьеров в образовании и занятости.</p></div><span class="badge dark">1955 год</span></div>'+
 '<div class="usa-civil-grid">'+
 '<article class="card usa-state-map-card"><div class="secthead"><div><div class="label">Карта США</div><h3>Выберите штат</h3></div><span class="badge dark">48 штатов</span></div>'+
 '<div class="usa-map-legend"><span><i class="mandatory"></i> Сегрегация предписывалась</span><span><i class="allowed"></i> Допускалась</span><span><i class="other"></i> Другие штаты</span></div>'+
 '<svg id="usaStateGeo" viewBox="0 0 990 470" role="group" aria-label="Штаты США: школьная политика после решения Brown"></svg>'+
 '<div class="usa-map-pills" id="usaStateChoices"></div>'+
 '<p class="micro">Цвет обозначает правовой режим до решения Верховного суда 1954 года, а не результат сегодняшних реформ. Выберите любую территорию на карте.</p></article>'+
 '<article class="card usa-state-dossier"><div class="label">Политический портрет штата</div><div class="usa-state-heading"><h2 id="usStateName">—</h2><span id="usStateLaw" class="badge dark"></span></div>'+
 '<div class="usa-state-kpis"><div><strong id="usBlackPct">—</strong><span>афроамериканцев · перепись 1950</span></div><div><strong id="usStateEV">—</strong><span>голосов выборщиков</span></div></div>'+
 '<div class="usa-demography"><div class="usa-demography-track"><span id="usBlackBar"></span></div><p id="usBlackInfo"></p></div>'+
 '<div class="usa-section-label">Основная проблема</div><p class="usa-state-headline" id="usStateHeadline"></p>'+
 '<div class="usa-section-label">Кто способен заблокировать изменения</div><ul id="usStateBarriers" class="usa-blockers"></ul>'+
 '</article>'+
 '<article class="card usa-power-panel"><div class="secthead"><div><div class="label">Вашингтон и региональная политика</div><h3>Кому придётся противостоять или договариваться</h3></div></div>'+
 '<p id="usStateCongress" class="usa-congress-summary"></p>'+
 '<div class="usa-senators"><span class="usa-section-label">Сенаторы штата · 1955</span><div id="usStateSenators"></div></div>'+
 '<div class="usa-section-label">Связи между штатами</div><p class="subtle">Эти территории могут оказаться частью общей политической коалиции. Нажмите штат, чтобы сравнить интересы.</p>'+
 '<div id="usConnectedStates" class="usa-neighbor-list"></div>'+
 '<p class="usa-note">Сопротивление соседей и позиция депутатов не меняются автоматически: всё зависит от содержания инициативы и политических переговоров.</p>'+
 '<button type="button" class="usa-jump-link" id="usCongressJump">Посмотреть коалиции в Конгрессе →</button></article>'+
 '<article class="card usa-opportunities"><div class="label">Возможности для администрации</div><h3>Что может изменить решение проблемы</h3><div id="usStateOpportunities" class="usa-opportunity-grid"></div><p class="micro">Демографическая доля не равна числу сторонников или противников реформы. Улучшение доступа к образованию и труду открывает экономический потенциал, но не гарантирует фиксированный прирост ВВП.</p></article>'+
 '</div><div class="usa-data-source">Демография: <a href="'+esc(raw.source)+'" target="_blank" rel="noopener noreferrer">перепись 1950 года, таблица по штатам ↗</a>. Политические сети: <a href="https://history.house.gov/Exhibitions-and-Publications/BAIC/Historical-Essays/Keeping-the-Faith/Pre-Congressional/" target="_blank" rel="noopener noreferrer">архив Палаты представителей ↗</a>.</div>';
 const $=id=>root.querySelector("#"+id);
 $("usaStateGeo").innerHTML=geo.usStates.states.map(s=>{
   const code=stateIds[s.name]||"?"; const r=focus[code];
   return '<path role="button" tabindex="0" data-usa-state="'+esc(code)+'" data-law="'+esc(r?.law||"иное")+'" class="usa-state-shape" d="'+s.path+'" aria-label="'+esc(s.name)+'"><title>'+esc(s.name)+'</title></path>';
 }).join("");
 $("usaStateChoices").innerHTML=STATES.map(s=>'<button type="button" data-us-quick="'+s.id+'">'+esc(s.name)+'</button>').join("");
 const generic={headline:"Оцените местные школы, власть округов и положение гражданских прав",barriers:["Школьные советы и местная администрация","Законодательство и правоприменение штата","Партийные объединения и местные экономические интересы"],congress:"Федеральные законодатели от штата действуют в зависимости от повестки, партийных коалиций и избирателей.",connections:[],opportunities:["Равный доступ к образованию","Новые возможности работы и обучения","Расширение политического участия"]};
 function render(){
  const r=focus[selected],p=raw.profiles[selected]||generic;
  const geographicName=geo.usStates.states.find(s=>stateIds[s.name]===selected)?.name;
  const title=r?.name||geographicName||selected;
  const share=raw.blackPct[selected],count=raw.blackCount[selected],senators=raw.senators1955[selected];
  $("usStateName").textContent=title;
  $("usStateLaw").textContent=r?(r.law==="обязательная"?"Обязательная сегрегация до 1954":"Сегрегация допускалась до 1954"):"Региональная система школ";
  $("usBlackPct").textContent=share===undefined?"—":pct(share);
  $("usStateEV").textContent=EV[selected]===undefined?"—":String(EV[selected]);
  $("usBlackBar").style.width=(share||0)+"%";
  $("usBlackInfo").textContent=count?"По переписи 1950 года — "+digits(count)+" афроамериканцев. Это число жителей, а не участников политической борьбы.":"Доля жителей по переписи 1950 года. По ней нельзя подсчитать численность политической оппозиции.";
  $("usStateHeadline").textContent=p.headline;
  $("usStateBarriers").innerHTML=p.barriers.map((s,i)=>'<li><span class="usa-blocker-index">'+(i+1)+'</span><span>'+esc(s)+'</span></li>').join("");
  $("usStateCongress").textContent=p.congress;
  $("usStateSenators").innerHTML=senators?senators.map(s=>'<span class="usa-senator">'+esc(s)+'</span>').join(""):'<span class="subtle">Кандидатуры для подробной карточки ещё не выделены</span>';
  $("usConnectedStates").innerHTML=(p.connections||[]).length?p.connections.map(code=>'<button type="button" data-us-connected="'+code+'">'+esc(focus[code]?.name||code)+' <span>↗</span></button>').join(""):'<span class="subtle">Для этой территории отдельные межштатные связи не выделены</span>';
  $("usStateOpportunities").innerHTML=p.opportunities.map((item,i)=>'<div class="usa-opportunity-item"><span class="usa-opportunity-num">0'+(i+1)+'</span><span>'+esc(item)+'</span></div>').join("");
  root.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>{let code=b.dataset.usaState||b.dataset.usQuick;b.classList.toggle("active",code===selected);});
  root.querySelectorAll("[data-us-connected]").forEach(b=>b.onclick=()=>choose(b.dataset.usConnected));
 }
 function choose(id){if(!id||id==="?"||!(id in raw.blackPct))return;selected=id;render();}
 root.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>{
  const click=()=>choose(b.dataset.usaState||b.dataset.usQuick);
  b.addEventListener("click",click);
  b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click()}});
 });
 $("usCongressJump").onclick=()=>{document.querySelector('[data-pane="politics"]')?.click();document.getElementById("usaCoalitionRoot")?.scrollIntoView({behavior:"smooth",block:"start"});};
 render();
})();