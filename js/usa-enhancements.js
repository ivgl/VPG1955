"use strict";
(function(){
 const geo=window.VPI_USA_MAPS;
 if(!geo)return;
 const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const bases=[
 {id:"keflavik",title:"Кефлавик",country:"Исландия",lon:-22.6,lat:63.98,kind:"Авиабаза и обеспечение трансатлантических коммуникаций",status:"Оборонное соглашение 1951 года. Трансатлантическое обеспечение и противолодочная оборона."},
 {id:"lakenheath",title:"RAF Lakenheath",country:"Великобритания",lon:.56,lat:52.41,kind:"Стратегическая авиация США и трансатлантические переброски через британский аэродром",status:"Действующее англо-американское сотрудничество и авиационное размещение."},
 {id:"wiesbaden",title:"Висбаден",country:"ФРГ",lon:8.32,lat:50.05,kind:"Американская авиабаза и штабные структуры USAFE",status:"Действующий узел американских ВВС в западной Германии."},
  {id:"rheinmain",title:"Рейн-Майн",country:"ФРГ",lon:8.56,lat:50.03,kind:"Грузовая и пассажирская авиалогистика возле Франкфурта",status:"Транспортные перевозки и снабжение американского присутствия в Европе."},
 {id:"laon",title:"Лаон",country:"Франция",lon:3.6,lat:49.57,kind:"Авиабаза НАТО во Франции",status:"Размещение в рамках союзнических соглашений с Францией."},
 {id:"aviano",title:"Авиано",country:"Италия",lon:12.61,lat:46.03,kind:"Аэродром союзной авиации, соглашение об использовании от октября 1954 года",status:"Открытие постоянного присутствия американской стороны намечено на февраль 1955 года."},
 {id:"spain",title:"Испанские соглашения",country:"Испания",lon:-3.46,lat:40.47,kind:"Испано-американские соглашения 1953 года о строительстве аэродромов",status:"Торрехон — согласованная программа развития авиационной инфраструктуры."}
];
const allied=document.getElementById("allies"),firstStack=allied?.querySelector(".stack");
if(firstStack){
 firstStack.insertAdjacentHTML("afterbegin",'<article class="card usa-alliances"><div class="secthead"><div><div class="label">Европейское направление</div><h2>Сеть американских военных узлов</h2></div><span class="badge dark">Карта</span></div><p>Выберите объект, чтобы изучить его стратегическую задачу и союзные договорённости.</p><svg id="usaEuropeMap" viewBox="0 0 960 500" aria-label="Географическая карта американских объектов в Европе"></svg><div class="usa-map-pills" id="usaBaseChoices"></div><div class="usa-focus" id="usaBaseDetail"></div><p class="micro" id="usaBaseSupport"></p></article>');
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
 const update=()=>{const pct=Number(slider?.value||0);msg.textContent="Поддержка союзной сети: "+pct.toFixed(1).replace(".",",")+"% ВВП. Направления расходов: аэродромы, склады, связь, обучение и поставки партнёрам."};
 slider?.addEventListener("input",update);update();choose("wiesbaden");
}

})();