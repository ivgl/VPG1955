"use strict";
/* Italy 1955 — read-only national mechanics, independent from the shared Parliament renderer. */
(function(){
 const D=window.VPI_ITALY_1955;if(!D){console.error("Italy mechanics data unavailable");return;}
 const $=id=>document.getElementById(id),fmt=(x,p=1)=>Number(x).toLocaleString("ru-RU",{minimumFractionDigits:p,maximumFractionDigits:p});
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const find=(xs,id)=>xs.find(x=>x.id===id);
 let branch="auto",resource="steel",city="turin",strategy="po",partner="egypt",union="cgil",region="naples",lever="south";
 function tab(t){if(!["industry","energy","society"].includes(t))return;document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));});document.querySelectorAll(".pane").forEach(e=>{e.hidden=e.dataset.pane!==t;});try{history.replaceState(null,"","#"+t)}catch(_){}}
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>tab(location.hash.slice(1)));
 const stat=(a,b,c,alt=false)=>'<div class="stat'+(alt?' ita-stat-strong':'')+'"><small>'+esc(a)+'</small><strong>'+esc(b)+'</strong><span>'+esc(c)+'</span></div>';
 $("itaIndustryStats").innerHTML=[
 stat("Население",fmt(D.economy.population/1e6)+" млн","Жителей"),
 stat("ВВП",fmt(D.economy.gdp)+" млрд","Междунар. $ 2011 г."),
 stat("ВВП на человека",fmt(D.economy.gdp_pc,0),"Междунар. $ 2011 г."),
 stat("Промышленность",fmt(D.economy.industry,0)+"%","Доля ВВП"),
 stat("Рост экономики",fmt(D.economy.growth)+"%","Годовой показатель",true),
 stat("Инвестиции",fmt(D.economy.investment,0)+"%","Доля ВВП")].join("");
 $("itaVanoniIntro").textContent=D.vanoni.description;$("itaVanoniStatus").textContent=D.vanoni.status;
 $("itaVanoniGoals").innerHTML=D.vanoni.goals.map(x=>'<div class="ita-goal"><strong>'+esc(x.label)+'</strong><p>'+esc(x.sub)+'</p></div>').join("");
 const I=D.industry;
 function renderBranches(){
 const b=find(I.branches,branch);
 $("itaIndustries").innerHTML=I.branches.map((x,i)=>'<button type="button" data-branch="'+x.id+'" aria-pressed="'+(x.id===branch)+'" class="'+(x.id===branch?'active':'')+'"><small>0'+(i+1)+' · '+esc(x.label)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
 $("itaIndustryName").textContent=b.name;$("itaIndustryLabel").textContent=b.label;$("itaIndustryAssets").textContent=b.asset;$("itaIndustryGain").textContent=b.opportunity;
 $("itaIndustryProblem").textContent=b.problem;$("itaIndustryPartners").textContent=b.partners;
 $("itaIndustries").querySelectorAll("button").forEach(btn=>btn.onclick=()=>{branch=btn.dataset.branch;resource=find(I.branches,branch).needs[0];renderBranches();renderResources();});
 }
 function renderResources(){
 const selected=find(I.branches,branch),r=find(I.resources,resource);
 $("itaIndustryResources").innerHTML=I.resources.map(x=>'<button type="button" data-resource="'+x.id+'" aria-pressed="'+(x.id===resource)+'" class="'+(selected.needs.includes(x.id)?' needed':'')+(x.id===resource?' active':'')+'"><strong>'+esc(x.name)+'</strong><small>'+(selected.needs.includes(x.id)?'Нужен выбранной отрасли':'Общий ресурс')+'</small></button>').join("");
 $("itaResourceName").textContent=r.name;$("itaResourceGood").textContent=r.good;$("itaResourceRisk").textContent=r.risk;
 $("itaIndustryResources").querySelectorAll("button").forEach(btn=>btn.onclick=()=>{resource=btn.dataset.resource;renderResources();});
 }
 const industrialXY={turin:[155,166],milan:[441,132],genoa:[316,336],ivrea:[211,73]};
 function renderIndustrialMap(){
 const coords=industrialXY,links='<path class="ita-industry-links" d="M155 166 L441 132 L316 336 Z M155 166 L211 73 L441 132"/>';
 $("itaIndustryMap").innerHTML='<rect width="640" height="445" rx="13" fill="#f0f5f0"/><path d="M40 330 Q240 310 360 400 Q490 427 640 310 V445 H0Z" fill="#d9e9eb"/><text x="65" y="407" class="ita-sea-text">Лигурийское море</text><path d="M85 235 Q150 100 250 103 Q405 42 520 118 Q568 188 474 266 Q370 300 230 278 Q120 310 85 235Z" fill="#dce9d9" stroke="#fbfcf8" stroke-width="4"/>'+links+
 I.mapSites.map(p=>{const xy=coords[p.id],on=p.id===city,ox=p.id==="milan"?-12:14,anchor=p.id==="milan"?"end":"start";return '<g class="ita-map-pin'+(on?' active':'')+'" data-city-pin="'+p.id+'" tabindex="0" role="button" aria-label="'+esc(p.name)+'"><circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(on?10:7)+'"/><text x="'+(xy[0]+ox)+'" y="'+(xy[1]-14)+'" text-anchor="'+anchor+'">'+esc(p.name)+'</text></g>'}).join("");
 $("itaIndustryMap").querySelectorAll("[data-city-pin]").forEach(n=>{const act=()=>{city=n.dataset.cityPin;renderCity()};n.onclick=act;n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}}});
 }
 function renderCity(){const x=find(I.mapSites,city);$("itaCityName").textContent=x.name;$("itaCityRole").textContent=x.role;$("itaCityTradeoff").textContent=x.tradeoff;
 $("itaIndustryCities").innerHTML=I.mapSites.map(v=>'<button type="button" data-city="'+v.id+'" aria-pressed="'+(v.id===city)+'" class="'+(v.id===city?'active':'')+'">'+esc(v.name)+'</button>').join("");
 $("itaIndustryCities").querySelectorAll("button").forEach(b=>b.onclick=()=>{city=b.dataset.city;renderCity()});renderIndustrialMap();}
 $("itaEuropeNote").textContent=I.europe;
 const E=D.energy;$("itaEnergyIntro").textContent=E.intro;
 $("itaEnergyChain").innerHTML=E.chain.map((x,i)=>'<div class="ita-chain-cell"><small>0'+(i+1)+'</small><b>'+esc(x.name)+'</b><p>'+esc(x.detail)+'</p></div>').join("");
 function renderStrategies(){const x=find(E.strategies,strategy);
 $("itaEnergyStrategies").innerHTML=E.strategies.map((s,i)=>'<button type="button" data-energy="'+s.id+'" aria-pressed="'+(s.id===strategy)+'" class="'+(s.id===strategy?'active':'')+'"><small>0'+(i+1)+' · '+esc(s.kicker)+'</small><strong>'+esc(s.name)+'</strong></button>').join("");
 $("itaEnergyName").textContent=x.name;$("itaEnergyTag").textContent=x.kicker;$("itaEnergyFacts").textContent=x.facts;$("itaEnergyGain").textContent=x.gain;$("itaEnergyNeed").textContent=x.need;$("itaEnergyRisk").textContent=x.risk;$("itaEnergyPartners").textContent=x.partners;
 $("itaEnergyStrategies").querySelectorAll("button").forEach(b=>b.onclick=()=>{strategy=b.dataset.energy;renderStrategies();});
 }
 function renderPartner(){const x=find(E.partners,partner);
 $("itaEnergyPartnersSelect").innerHTML=E.partners.map((a,i)=>'<button type="button" data-partner="'+a.id+'" aria-pressed="'+(a.id===partner)+'" class="'+(a.id===partner?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(a.name)+'</strong></button>').join("");
 $("itaPartnerName").textContent=x.name;$("itaPartnerRelation").textContent=x.relation;$("itaPartnerOpportunity").textContent=x.opportunity;$("itaPartnerLimit").textContent=x.limit;
 $("itaEnergyPartnersSelect").querySelectorAll("button").forEach(b=>b.onclick=()=>{partner=b.dataset.partner;renderPartner();});
 }
 const S=D.society;$("itaSocietyIntro").textContent=S.intro;
 const total=S.leftSeats.pci+S.leftSeats.psi;
 $("itaLeftSeats").textContent=fmt(total,0);$("itaLeftPct").textContent=fmt(100*total/S.leftSeats.total,1)+"%";$("itaLeftWidth").style.width=(100*total/S.leftSeats.total).toFixed(2)+"%";
 function renderUnions(){const x=find(S.unionGroups,union);
 $("itaUnions").innerHTML=S.unionGroups.map((a,i)=>'<button type="button" data-union="'+a.id+'" aria-pressed="'+(a.id===union)+'" class="'+(a.id===union?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(a.name)+'</strong><span>'+esc(a.kicker)+'</span></button>').join("");
 $("itaUnionName").textContent=x.name;$("itaUnionTag").textContent=x.kicker;$("itaUnionDetails").textContent=x.details;$("itaUnionNegotiation").textContent=x.negotiation;$("itaUnionFriction").textContent=x.friction;
 $("itaUnions").querySelectorAll("button").forEach(b=>b.onclick=()=>{union=b.dataset.union;renderUnions();});
 }
 const outline='<rect x="0" y="0" width="640" height="540" rx="12" fill="#edf3f1"/><path class="ita-peninsula" d="M205 58 L255 56 L300 77 L343 68 L361 91 L345 121 L372 143 L374 181 L414 210 L425 246 L472 245 L503 272 L540 298 L507 308 L463 293 L443 321 L466 339 L455 360 L427 336 L411 309 L390 291 L379 263 L365 249 L340 230 L328 202 L304 193 L291 173 L264 159 L235 160 L203 141 L171 153 L156 122 L176 88 Z"/><path class="ita-island" d="M330 390 Q375 363 419 379 L449 402 L416 414 Q385 417 359 440 L335 427 Z"/><ellipse class="ita-island" cx="283" cy="329" rx="24" ry="50" transform="rotate(15 283 329)"/><text class="ita-sea-text" x="42" y="358">Тирренское море</text><text class="ita-sea-text" x="478" y="414">Ионическое море</text>';
 const manualXY={torino:[218,120],bologna:[333,160],rome:[366,254],naples:[412,301],puglia:[493,277],sicily:[392,400]};
 function renderSocialMap(){
 $("itaRegionsMap").innerHTML=outline+S.places.map(p=>{const xy=manualXY[p.id],on=p.id===region,left=p.id==="puglia",offset=p.id==="naples"?18:14;return '<g role="button" tabindex="0" aria-label="'+esc(p.name)+'" data-region-pin="'+p.id+'" class="ita-map-pin'+(on?' active':'')+'"><circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(on?10:7)+'"/><text x="'+(xy[0]+(left?-offset:offset))+'" y="'+(xy[1]-11)+'" text-anchor="'+(left?'end':'start')+'">'+esc(p.name)+'</text></g>'}).join("");
 $("itaRegionsMap").querySelectorAll("[data-region-pin]").forEach(n=>{const act=()=>{region=n.dataset.regionPin;renderRegion();};n.onclick=act;n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}}});
 }
 function renderRegion(){const x=find(S.places,region);
 $("itaRegionName").textContent=x.name;$("itaRegionRole").textContent=x.role;$("itaRegionProblem").textContent=x.question;$("itaRegionSolution").textContent=x.solution;
 $("itaRegionButtons").innerHTML=S.places.map(a=>'<button type="button" data-region="'+a.id+'" aria-pressed="'+(a.id===region)+'" class="'+(a.id===region?'active':'')+'">'+esc(a.name)+'</button>').join("");
 $("itaRegionButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;renderRegion()});renderSocialMap();}
 function renderLevers(){const x=find(S.levers,lever);
 $("itaSocialLevers").innerHTML=S.levers.map((a,i)=>'<button type="button" data-lever="'+a.id+'" aria-pressed="'+(a.id===lever)+'" class="'+(a.id===lever?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(a.name)+'</strong></button>').join("");
 $("itaLeverName").textContent=x.name;$("itaLeverGain").textContent=x.benefit;$("itaLeverCost").textContent=x.tradeoff;
 $("itaSocialLevers").querySelectorAll("button").forEach(b=>b.onclick=()=>{lever=b.dataset.lever;renderLevers();});}
 $("itaCassaInfo").textContent=S.cassa;
 $("itaSources").innerHTML=D.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a>').join("");
 renderBranches();renderResources();renderCity();renderStrategies();renderPartner();renderUnions();renderRegion();renderLevers();
 const requested=location.hash.slice(1);tab(["industry","energy","society"].includes(requested)?requested:"industry");
})();