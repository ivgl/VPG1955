"use strict";
/* Egypt 1955 public mechanics. All alternatives are exploratory; no official state writes. */
(function(){
 const D=window.VPI_EGYPT_1955;if(!D){console.error("Egypt public atlas missing");return;}
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=(n,p=1)=>Number(n).toLocaleString("ru-RU",{minimumFractionDigits:p,maximumFractionDigits:p});
 const find=(a,id)=>a.find(x=>x.id===id);
 let scheme="current",object="portsaid",agr="water",aswan="water",region="delta",arab="gaza";
 function showTab(t){
  if(!["suez","nile","arab"].includes(t))return;
  document.querySelectorAll(".tab").forEach(b=>{const active=b.dataset.tab===t;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));});
  document.querySelectorAll(".pane").forEach(p=>{p.hidden=p.dataset.pane!==t;});
  try{history.replaceState(null,"","#"+t)}catch(_){}
 }
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>showTab(location.hash.slice(1)));
 const fact=(title,value,sub,extra="")=>'<div class="stat"><small>'+esc(title)+'</small><strong>'+esc(value)+'</strong><span>'+esc(sub)+'</span>'+(extra?'<em>'+esc(extra)+'</em>':'')+'</div>';
 $("egySuezFacts").innerHTML=fact("Сборы с судов",fmt(D.suez.receipts)+" млн","Егип. фунтов · 1954")+
 fact("Египту от компании",fmt(D.suez.egyptReceipts)+" млн","Егип. фунтов · 1954")+
 fact("Число проходов",fmt(D.suez.ships,0),"Судов · 1954")+
 fact("Расходы казны",fmt(D.suez.budgetBenchmark)+" млн","Егип. фунтов · 1954/55");
 $("egyEconomicFacts").innerHTML=fact("Население",fmt(D.economy.population/1e6)+" млн","Жителей")+
 fact("ВВП",fmt(D.economy.gdp)+" млрд","Междунар. $ 2011 г.")+
 fact("Сельское хозяйство",fmt(D.economy.agriculture,0)+"%","ВВП")+
 fact("Промышленность",fmt(D.economy.industry,0)+"%","ВВП");
 function renderScheme(){
  const s=find(D.suez.schemes,scheme);
  $("egySuezSchemes").innerHTML=D.suez.schemes.map((x,i)=>'<button type="button" class="egy-scheme-btn'+(x.id===scheme?' active':'')+'" aria-pressed="'+(x.id===scheme)+'" data-scheme="'+x.id+'"><small>0'+(i+1)+' · '+esc(x.title)+'</small><strong>'+esc(x.name)+'</strong><span>'+esc(x.status)+'</span></button>').join("");
  const amount=s.min===s.max?fmt(s.min):fmt(s.min)+"–"+fmt(s.max),pctLo=s.min/D.suez.budgetBenchmark*100,pctHi=s.max/D.suez.budgetBenchmark*100;
  $("egySuezSchemeStatus").textContent=s.status;$("egySuezIncome").textContent=amount+" млн";
  $("egySuezBudgetShare").textContent=fmt(pctLo)+(s.min===s.max?"%":"–"+fmt(pctHi)+"%");
  $("egySuezBudgetBar").style.width=Math.max(1,Math.min(100,pctHi*9))+"%";
  $("egySuezSchemeName").textContent=s.name;$("egySuezSchemeExplained").textContent=s.explain;
  $("egySuezSchemeAction").textContent=s.action;$("egySuezSchemeRisk").textContent=s.risk;
  $("egySuezSchemes").querySelectorAll("button").forEach(b=>b.onclick=()=>{scheme=b.dataset.scheme;renderScheme();});
 }
 const suezBase='<defs><linearGradient id="suezSea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ecf5f3"/><stop offset="1" stop-color="#c5e2e1"/></linearGradient></defs>'+
 '<rect width="610" height="495" rx="12" fill="#e6d5ba"/><path d="M0 0H610V70Q500 64 420 78Q344 87 230 90Q106 95 0 80Z" fill="url(#suezSea)"/>'+
 '<path d="M0 450 Q180 409 264 438 Q390 461 610 431 V495 H0Z" fill="url(#suezSea)"/>'+
 '<path d="M268 73Q271 136 287 182Q309 225 308 287Q313 357 344 405" class="egy-canal-shadow"/>'+
 '<path d="M268 73Q271 136 287 182Q309 225 308 287Q313 357 344 405" class="egy-canal-path"/>'+
 '<text x="43" y="45" class="egy-water-label">Средиземное море</text><text x="399" y="470" class="egy-water-label">Красное море</text>'+
 '<text x="30" y="265" class="egy-water-label">Египет</text>';
 function renderSuezMap(){
  const labels={portsaid:[20,-14],ismailia:[15,-13],suez:[14,26],base:[20,20]};
  $("egySuezMap").innerHTML=suezBase+D.suez.places.map(p=>{const v=labels[p.id],on=p.id===object;
   return '<g class="egy-map-point'+(on?' active':'')+'" data-object-pin="'+p.id+'" role="button" tabindex="0" aria-label="'+esc(p.name)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(on?10:8)+'"/><text class="egy-map-label" x="'+(p.x+v[0])+'" y="'+(p.y+v[1])+'">'+esc(p.name)+'</text><title>'+esc(p.name)+'</title></g>';
  }).join("");
  $("egySuezMap").querySelectorAll("[data-object-pin]").forEach(b=>{
   const click=()=>{object=b.dataset.objectPin;renderSuez();};
   b.onclick=click;b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();$("egySuezMap").querySelector('[data-object-pin="'+object+'"]')?.focus({preventScroll:true});}};
  });
 }
 function renderSuez(){
  const x=find(D.suez.places,object);
  $("egySuezPlaceName").textContent=x.name;$("egySuezPlacePosition").textContent=x.position;
  $("egySuezFocus").textContent=x.focus;$("egySuezRights").textContent=x.rights;$("egySuezPressure").textContent=x.pressure;
  $("egySuezPlaces").innerHTML=D.suez.places.map(p=>'<button type="button" data-object="'+p.id+'" aria-pressed="'+(object===p.id)+'" class="'+(object===p.id?'active':'')+'">'+esc(p.name)+'</button>').join("");
  $("egySuezPlaces").querySelectorAll("button").forEach(b=>b.onclick=()=>{object=b.dataset.object;renderSuez();});
  renderSuezMap();
 }
 $("egySuezTimeline").innerHTML=D.suez.milestones.map(m=>'<div class="egy-time-event"><b>'+esc(m.year)+'</b><strong>'+esc(m.title)+'</strong><p>'+esc(m.text)+'</p></div>').join("");
 function renderAgr(){
  const p=find(D.nile.channels,agr);
  $("egyAgrOptions").innerHTML=D.nile.channels.map((x,i)=>'<button type="button" data-agr="'+x.id+'" aria-pressed="'+(agr===x.id)+'" class="egy-agr-option'+(agr===x.id?' active':'')+'"><small>0'+(i+1)+' · '+esc(x.category)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("egyAgrTitle").textContent=p.name;$("egyAgrWhy").textContent=p.why;
  $("egyAgrNeeds").innerHTML=p.requires.map(x=>'<li>'+esc(x)+'</li>').join("");
  $("egyAgrSynergies").textContent=p.synergies;$("egyAgrTradeoffs").textContent=p.tradeoffs;
  $("egyAgrOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{agr=b.dataset.agr;renderAgr();});
 }
 $("egyAswanIntro").textContent=D.nile.aswan.intro;
 $("egyAswanSteps").innerHTML=D.nile.aswan.steps.map((s,i)=>'<div class="egy-aswan-step"><small>0'+(i+1)+'</small><strong>'+esc(s)+'</strong></div>').join("");
 function renderAswan(){
  const p=find(D.nile.aswan.aspects,aswan);
  $("egyAswanButtons").innerHTML=D.nile.aswan.aspects.map(x=>'<button type="button" data-aswan="'+x.id+'" aria-pressed="'+(x.id===aswan)+'" class="'+(x.id===aswan?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("egyAswanName").textContent=p.name;$("egyAswanValue").textContent=p.value;
  $("egyAswanButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{aswan=b.dataset.aswan;renderAswan();});
 }
 const nileMap='<rect width="610" height="490" rx="10" fill="#e5d8bd"/><path d="M0 0H610V62Q450 103 370 84Q259 76 0 55Z" fill="#c5e4e2"/>'+
 '<path class="egy-canal-shadow" d="M348 94Q362 165 371 235Q388 330 434 460"/><path class="egy-canal-path" d="M348 94Q362 165 371 235Q388 330 434 460"/>'+
 '<path d="M348 122Q287 104 263 71M353 137Q412 112 442 74" fill="none" stroke="#69b5ba" stroke-width="6" stroke-linecap="round"/>'+
 '<text x="65" y="52" class="egy-water-label">Средиземное море</text><text x="63" y="275" class="egy-water-label">Пустыня</text>';
 function renderNile(){
  const p=find(D.nile.regions,region);
  $("egyRegionName").textContent=p.name;$("egyRegionRole").textContent=p.role;$("egyRegionDetail").textContent=p.detail;
  $("egyNileRegions").innerHTML=D.nile.regions.map(x=>'<button type="button" data-region="'+x.id+'" aria-pressed="'+(x.id===region)+'" class="'+(x.id===region?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("egyNileRegions").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;renderNile();});
  $("egyNileMap").innerHTML=nileMap+D.nile.regions.map(x=>'<g class="egy-map-point'+(x.id===region?' active':'')+'" data-region-pin="'+x.id+'" role="button" tabindex="0" aria-label="'+esc(x.name)+'"><circle cx="'+x.x+'" cy="'+x.y+'" r="'+(x.id===region?10:8)+'"/><text class="egy-map-label" x="'+(x.x+14)+'" y="'+(x.y-11)+'">'+esc(x.name)+'</text></g>').join("");
  $("egyNileMap").querySelectorAll("[data-region-pin]").forEach(b=>{
   const click=()=>{region=b.dataset.regionPin;renderNile();};
   b.onclick=click;b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();}};
  });
 }
 const W=D.world,placement={gaza:[265,122],sudan:[192,321],syria:[386,79],iraq:[516,125],jordan:[368,206],saudi:[485,320],west:[74,115]};
 $("egyArabIntro").textContent=W.intro;
 function renderArab(){
  const a=find(W.places,arab);
  $("egyArabName").textContent=a.name;$("egyArabStatus").textContent=a.status;
  $("egyArabFocus").textContent=a.focus;$("egyArabOpportunity").textContent=a.opportunity;$("egyArabCost").textContent=a.cost;
  $("egyArabButtons").innerHTML=W.places.map(x=>'<button type="button" data-arab="'+x.id+'" aria-pressed="'+(arab===x.id)+'" class="'+(arab===x.id?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("egyArabButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{arab=b.dataset.arab;renderArab();});
  const cairo=[304,245];
  $("egyArabNetwork").innerHTML='<svg viewBox="0 0 610 425" role="group" aria-label="Схема дипломатических связей Каира с арабскими странами и внешними державами">'+
   '<text x="28" y="390" font-size="12" fill="#9fa896">Общее влияние не означает политический контроль</text>'+
   W.places.map(p=>'<path class="egy-arab-link" d="M'+cairo.join(" ")+' L'+placement[p.id].join(" ")+'"/>').join("")+
   '<circle cx="'+cairo[0]+'" cy="'+cairo[1]+'" r="29" class="egy-arab-cairo"/><text x="'+cairo[0]+'" y="'+(cairo[1]+4)+'" text-anchor="middle" fill="#fff" font-weight="850" font-size="13">КАИР</text>'+
   W.places.map(p=>{const xy=placement[p.id],on=p.id===arab;
     return '<g data-arab-pin="'+p.id+'" class="egy-arab-pin'+(on?' active':'')+'" tabindex="0" role="button" aria-label="'+esc(p.name)+'"><circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(on?12:9)+'"/><text x="'+(xy[0]+(xy[0]>420?-5:12))+'" y="'+(xy[1]-14)+'" text-anchor="'+(xy[0]>420?'end':'start')+'">'+esc(p.name)+'</text><title>'+esc(p.name)+'</title></g>';
   }).join("")+'</svg>';
  $("egyArabNetwork").querySelectorAll("[data-arab-pin]").forEach(b=>{
    const click=()=>{arab=b.dataset.arabPin;renderArab();};
    b.onclick=click;b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();}};
  });
 }
 $("egyArabTensions").innerHTML=W.tensions.map(x=>'<div class="egy-tension"><b>'+esc(x.name)+'</b><p>'+esc(x.text)+'</p></div>').join("");
 $("egySources").innerHTML=D.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name)+' ↗</a>').join("");
 renderScheme();renderSuez();renderAgr();renderAswan();renderNile();renderArab();
 showTab(["suez","nile","arab"].includes(location.hash.slice(1))?location.hash.slice(1):"suez");
})();
