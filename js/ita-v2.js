"use strict";
/* Italy 1955 — read-only national mechanics, independent from the shared Parliament renderer. */
(function(){
 const D=window.VPI_ITALY_1955;const G=window.VPI_REMAINING_GEO?.ita;if(!D){console.error("Italy mechanics data unavailable");return;}
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
 $("itaIndustries").querySelectorAll("button").forEach(btn=>btn.onclick=()=>{branch=btn.dataset.branch;resource=find(I.branches,branch).needs[0];renderBranches();renderAgreements();});
 }
 function renderAgreements(){
  const agreement=find(I.agreements,branch);
  const groups=[
   ["Предприятия",agreement.company],
   ["Государство и IRI",agreement.government],
   ["Работники и профсоюзы",agreement.workers]
  ];
  $("itaIndustryAgreements").innerHTML=groups.map((x,i)=>'<article class="ita-agreement-party"><span class="ita-party-number">0'+(i+1)+'</span><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></article>').join("");
  $("itaAgreementTension").textContent=agreement.tension;
 }
 function projectedPoint(p){
  const t=G.transform;
  return {x:t.offsetX+p.lon*t.scale*t.cos,y:t.offsetY-p.lat*t.scale};
 }
 function renderIndustrialMap(){
  if(!G||!G.shapes?.length){
   $("itaIndustryMap").innerHTML='<text x="160" y="70" font-size="7">Географический контур недоступен. Досье городов остаются ниже.</text>';
   return;
  }
  const cityCoords=Object.fromEntries(I.mapSites.map(p=>[p.id,projectedPoint(p)]));
  const connect=ids=>ids.map((id,i)=>(i?"L":"M")+cityCoords[id].x.toFixed(1)+" "+cityCoords[id].y.toFixed(1)).join(" ")+" Z";
  const offsets={
   turin:{x:-14,y:17,anchor:"end"},
   ivrea:{x:-17,y:-12,anchor:"end"},
   milan:{x:18,y:-10,anchor:"start"},
   genoa:{x:15,y:16,anchor:"start"}
  };
  $("itaIndustryMap").innerHTML=
   '<rect x="150" y="10" width="215" height="160" fill="#d9e9e9"/>'+
   G.shapes.map(x=>'<path d="'+esc(x.d)+'" class="ita-natural-land"><title>'+esc(x.name)+'</title></path>').join("")+
   '<path class="ita-industry-links" d="'+connect(["turin","milan","genoa"])+'"/>'+
   '<text class="ita-geo-ocean" x="161" y="153">Лигурийское море</text>'+
   I.mapSites.map(p=>{
     const point=cityCoords[p.id],pos=offsets[p.id],on=p.id===city;
     const lx=point.x+pos.x,ly=point.y+pos.y;
     return '<g class="ita-geo-pin'+(on?' active':'')+'" data-city-pin="'+p.id+'" tabindex="0" role="button" aria-label="'+esc(p.name)+'">'+
      '<path d="M'+point.x.toFixed(2)+' '+point.y.toFixed(2)+' L'+(lx+(pos.anchor==="start"?-3:3)).toFixed(2)+' '+(ly-2).toFixed(2)+'" class="ita-geo-leader"/>'+
      '<circle cx="'+point.x.toFixed(2)+'" cy="'+point.y.toFixed(2)+'" r="'+(on?'3.6':'2.8')+'"/>'+
      '<text x="'+lx.toFixed(2)+'" y="'+ly.toFixed(2)+'" text-anchor="'+pos.anchor+'">'+esc(p.name)+'</text><title>'+esc(p.name)+'</title></g>';
   }).join("");
  $("itaIndustryMap").querySelectorAll("[data-city-pin]").forEach(n=>{
   const change=()=>{city=n.dataset.cityPin;renderCity();};
   n.onclick=change;
   n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();change();$("itaIndustryMap").querySelector('[data-city-pin="'+city+'"]')?.focus({preventScroll:true});}}
  });
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
 function renderRegion(){
  const x=find(S.places,region);
  $("itaRegionName").textContent=x.name;
  $("itaRegionRole").textContent=x.role;
  $("itaRegionProblem").textContent=x.question;
  $("itaRegionSolution").textContent=x.solution;
  $("itaRegionButtons").innerHTML=S.places.map(a=>'<button type="button" data-region="'+a.id+'" aria-pressed="'+(a.id===region)+'" class="'+(a.id===region?'active':'')+'"><strong>'+esc(a.name)+'</strong><small>'+esc(a.role)+'</small></button>').join("");
  $("itaRegionButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;renderRegion()});
 }
 function renderLevers(){const x=find(S.levers,lever);
 $("itaSocialLevers").innerHTML=S.levers.map((a,i)=>'<button type="button" data-lever="'+a.id+'" aria-pressed="'+(a.id===lever)+'" class="'+(a.id===lever?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(a.name)+'</strong></button>').join("");
 $("itaLeverName").textContent=x.name;$("itaLeverGain").textContent=x.benefit;$("itaLeverCost").textContent=x.tradeoff;
 $("itaSocialLevers").querySelectorAll("button").forEach(b=>b.onclick=()=>{lever=b.dataset.lever;renderLevers();});}
 $("itaCassaInfo").textContent=S.cassa;
 $("itaSources").innerHTML=D.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a>').join("");
 renderBranches();renderAgreements();renderCity();renderStrategies();renderPartner();renderUnions();renderRegion();renderLevers();
 const requested=location.hash.slice(1);tab(["industry","energy","society"].includes(requested)?requested:"industry");
})();