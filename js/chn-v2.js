"use strict";
/* VPI1955 China public country dashboard. Read-only exploration of national mechanics. */
(function(){
 const D=window.VPI_CHN_ATLAS_1955;
 if(!D){console.error("CHN public data unavailable");return;}
 const $=id=>document.getElementById(id);
 const html=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const num=(n,d=1)=>Number(n).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
 let project="steel",resource="coal",channel="allocation",ruralPolicy="procurement",region="henan",site="kinmen",lens="military";
 const P=D.plan,R=D.rural,S=D.strait;
 const find=(array,id)=>array.find(x=>x.id===id);
 function tab(name){
  if(!["plan","village","strait"].includes(name))return;
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===name;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));});
  document.querySelectorAll(".pane").forEach(s=>{const on=s.dataset.pane===name;s.hidden=!on;});
  try{history.replaceState(null,"","#"+name)}catch(e){}
 }
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>tab(location.hash.slice(1)==="country"?"village":location.hash.slice(1)==="external"?"strait":location.hash.slice(1)));
 const stats=[
  ["Население",num(D.economy.population/1e6)+" млн","Жителей страны"],
  ["ВВП",num(D.economy.gdp)+" млрд","Междунар. $ 2011 г."],
  ["ВВП на человека",num(D.economy.percap,0),"Междунар. $ 2011 г.","В "+num(D.economy.japanPercap/D.economy.percap)+" раза ниже Японии"],
  ["Сельское хозяйство",num(D.economy.agriculture,0)+"%","Доля ВВП"],
  ["Промышленность",num(D.economy.industry,0)+"%","Доля ВВП"],
  ["Инвестиции",num(D.economy.investment,0)+"%","Доля ВВП"]
 ];
 $("cnStats").innerHTML=stats.map(s=>'<div class="stat'+(s[3]?' stat-warning':'')+'"><small>'+html(s[0])+'</small><strong>'+html(s[1])+'</strong><span>'+html(s[2])+'</span>'+(s[3]?'<em>'+html(s[3])+'</em>':'')+'</div>').join("");
 $("cnPlanIntro").textContent=P.description;$("cnSovietHelp").textContent=P.soviet;
 function renderProjects(){
  const active=find(P.projects,project);
  $("projectButtons").innerHTML=P.projects.map((p,i)=>'<button type="button" data-project="'+p.id+'" class="cn-project-choice'+(p.id===project?' active':'')+'" aria-pressed="'+(p.id===project)+'"><span class="cn-project-number">0'+(i+1)+'</span><span><strong>'+html(p.name)+'</strong><small>'+html(p.category)+'</small></span></button>').join("");
  $("projName").textContent=active.name;$("projTag").textContent=active.category;
  $("projAsset").textContent=active.intro;$("projIssue").textContent=active.bottleneck;
  $("projImpact").textContent=active.effect;$("projPartners").textContent=active.partners;
  $("projectButtons").querySelectorAll("[data-project]").forEach(b=>b.onclick=()=>{project=b.dataset.project;resource=find(P.projects,project).needs[0];renderProjects();renderResources();});
 }
 function renderResources(){
  const active=find(P.projects,project),r=find(P.resources,resource);
  $("cnResourceNetwork").innerHTML=P.resources.map((x,i)=>'<button class="cn-resource-node'+(resource===x.id?' active':'')+(active.needs.includes(x.id)?' needed':'')+'" data-resource="'+x.id+'" aria-pressed="'+(resource===x.id)+'"><small>0'+(i+1)+'</small><strong>'+html(x.name)+'</strong><span>'+html(active.needs.includes(x.id)?'Нужен выбранной отрасли':'Связанный ресурс')+'</span></button>').join("");
  $("cnResourceName").textContent=r.name;$("cnResourceTip").textContent=r.tip;$("cnResourcePressure").textContent=r.pressure;
  $("cnResourceNetwork").querySelectorAll("button").forEach(b=>b.onclick=()=>{resource=b.dataset.resource;renderResources();});
 }
 function renderChannels(){
  const p=find(P.channels,channel);
  $("cnChannelButtons").innerHTML=P.channels.map(x=>'<button type="button" data-channel="'+x.id+'" aria-pressed="'+(channel===x.id)+'" class="cn-channel-btn'+(channel===x.id?' active':'')+'"><strong>'+html(x.name)+'</strong><small>'+html(x.short)+'</small></button>').join("");
  $("cnChannelName").textContent=p.name;$("cnChannelDetail").textContent=p.detail;
  $("cnChannelButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{channel=b.dataset.channel;renderChannels();});
 }
 function renderRural(){
  const p=find(R.policies,ruralPolicy);
  $("cnRuralPolicyButtons").innerHTML=R.policies.map((x,i)=>'<button type="button" data-rural="'+x.id+'" class="cn-rural-option'+(ruralPolicy===x.id?' active':'')+'" aria-pressed="'+(ruralPolicy===x.id)+'"><small>0'+(i+1)+' · '+html(x.sub)+'</small><strong>'+html(x.name)+'</strong></button>').join("");
  $("cnRuralName").textContent=p.name;$("cnRuralUrban").textContent=p.urban;$("cnRuralVillage").textContent=p.village;$("cnRuralConstraints").textContent=p.constraints;
  $("cnRuralPolicyButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{ruralPolicy=b.dataset.rural;renderRural();});
 }
 const G=window.VPI_REMAINING_GEO&&window.VPI_REMAINING_GEO.chn;
 function projectChina(lon,lat){return [G.transform.offsetX+lon*G.transform.scale*G.transform.cos,G.transform.offsetY-lat*G.transform.scale]}
 function renderRegion(){
  const r=find(R.regions,region);$("cnRegionName").textContent=r.name;$("cnRegionRole").textContent=r.role;
  $("cnRegionChallenge").textContent=r.challenge;$("cnRegionFocus").textContent=r.focus;
  $("cnRegionChoices").innerHTML=R.regions.map(x=>'<button type="button" data-region="'+x.id+'" aria-pressed="'+(x.id===region)+'" class="'+(x.id===region?'active':'')+'">'+html(x.name.split("·").pop().trim())+'</button>').join("");
  $("cnRegionChoices").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;renderRegion();});
  if(!G)return;
  const paths=G.shapes.map(x=>'<path class="cn-land" d="'+html(x.d)+'"></path>').join("");
  const pins=R.regions.map(x=>{
   const pt=projectChina(x.lon,x.lat),on=x.id===region;
   return '<g class="cn-region-point'+(on?' active':'')+'" data-region-pin="'+x.id+'" tabindex="0" role="button" aria-label="'+html(x.name)+'"><circle cx="'+pt[0].toFixed(1)+'" cy="'+pt[1].toFixed(1)+'" r="'+(on?8:6)+'"></circle><text x="'+(pt[0]+10).toFixed(1)+'" y="'+(pt[1]-8).toFixed(1)+'">'+html(x.name.split("·").pop().trim())+'</text><title>'+html(x.name)+'</title></g>';
  }).join("");
  $("cnRegionMap").innerHTML=paths+pins;
  $("cnRegionMap").querySelectorAll("[data-region-pin]").forEach(g=>{
   const action=()=>{region=g.dataset.regionPin;renderRegion();};
   g.onclick=action;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action();$("cnRegionMap").querySelector('[data-region-pin="'+region+'"]')?.focus({preventScroll:true});}};
  });
 }
 $("cnPrivateIndustry").textContent=R.privateIndustry;
 function mapX(lon){return 90+(lon-116)*74}
 function mapY(lat){return 35+(30-lat)*60}
 function renderStraitMap(){
  const bg='<defs><linearGradient id="cnSea" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#e8f4ef"/><stop offset="100%" stop-color="#d7e7e5"/></linearGradient></defs><rect width="750" height="550" fill="url(#cnSea)"/>'+
   '<path class="cn-strait-coast" d="M0 0 L275 0 Q293 40 287 83 L274 116 Q260 139 277 160 L269 187 Q254 218 243 244 Q226 281 241 309 L223 341 Q212 365 220 393 Q202 431 190 453 L181 550 L0 550 Z"/>'+
   '<path class="cn-strait-coastline" d="M275 0 Q293 40 287 83 L274 116 Q260 139 277 160 L269 187 Q254 218 243 244 Q226 281 241 309 L223 341 Q212 365 220 393 Q202 431 190 453 L181 550"/>'+
   '<path class="cn-strait-taiwan" d="M485 306 Q512 314 516 355 Q530 407 506 451 Q488 489 475 514 Q455 505 448 470 Q438 420 450 363 Q457 325 485 306 Z"/>'+
   '<g class="cn-strait-small-islands"><ellipse cx="360" cy="416" rx="8" ry="10"/><ellipse cx="352" cy="430" rx="5" ry="6"/><ellipse cx="368" cy="432" rx="4" ry="5"/><ellipse cx="254" cy="366" rx="6" ry="3"/><ellipse cx="383" cy="260" rx="5" ry="8"/></g>'+
   '<text class="cn-map-territory" x="49" y="155">КНР</text><text class="cn-map-water" x="335" y="212">Восточно-Китайское море</text><text class="cn-map-water" x="296" y="475">Тайваньский пролив</text><text class="cn-map-territory cn-map-taiwan-label" x="520" y="442">Тайвань</text>';
  const coords={mainland:[10,-13],kinmen:[-128,20],matsu:[-90,-13],dachen:[25,35],yijiangshan:[-120,-28],penghu:[-102,37],taiwan:[55,-38]};
  const spots=S.sites.map(x=>{
   const ax=mapX(x.lon),ay=mapY(x.lat),dx=x.id==="mainland"?-28:x.id==="dachen"?16:x.id==="yijiangshan"?-18:0,dy=x.id==="dachen"?19:x.id==="yijiangshan"?-25:0,sx=ax+dx,sy=ay+dy,o=coords[x.id]||[12,-9],labelX=sx+o[0],labelY=sy+o[1],on=x.id===site;
   const destX=labelX+(o[0]<0?52:-6);
   return '<g tabindex="0" role="button" class="cn-site-mark '+x.side+(on?' active':'')+'" data-site-map="'+x.id+'" aria-label="'+html(x.name)+'">'+
    (dx||dy?'<path d="M'+ax.toFixed(1)+','+ay.toFixed(1)+' L'+sx.toFixed(1)+','+sy.toFixed(1)+'" class="cn-pin-guide"/>':'')+
    (Math.abs(o[0])>40?'<path d="M'+sx.toFixed(1)+','+sy.toFixed(1)+' L'+destX.toFixed(1)+','+(labelY+4).toFixed(1)+'" class="cn-pin-guide"/>':'')+
    '<circle cx="'+sx.toFixed(1)+'" cy="'+sy.toFixed(1)+'" r="'+(on?12:8)+'" class="cn-map-hit"/>'+
    '<circle cx="'+sx.toFixed(1)+'" cy="'+sy.toFixed(1)+'" r="'+(on?6:4.6)+'" class="cn-site-pin"/>'+
    '<text x="'+labelX.toFixed(1)+'" y="'+labelY.toFixed(1)+'">'+html(x.short)+'</text><title>'+html(x.name)+' · '+html(x.controller)+'</title></g>';
  }).join("");
  $("cnStraitMap").innerHTML=bg+spots;
  $("cnStraitMap").querySelectorAll("[data-site-map]").forEach(g=>{
   const action=()=>{site=g.dataset.siteMap;renderSite();};
   g.onclick=action;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action();$("cnStraitMap").querySelector('[data-site-map="'+site+'"]')?.focus({preventScroll:true});}};
  });
 }
 function renderSite(){
  const x=find(S.sites,site),l=find(S.lenses,lens);
  $("cnStraitSites").innerHTML=S.sites.map(t=>'<button type="button" data-site="'+t.id+'" aria-pressed="'+(site===t.id)+'" class="cn-site-btn'+(site===t.id?' active':'')+'"><i class="'+t.side+'"></i>'+html(t.short)+'</button>').join("");
  $("cnSiteName").textContent=x.name;$("cnSiteControl").textContent=x.controller;
  $("cnSiteControl").className=x.side;$("cnSiteContext").textContent=x.context;
  $("cnLenses").innerHTML=S.lenses.map(t=>'<button type="button" data-lens="'+t.id+'" aria-pressed="'+(lens===t.id)+'" class="'+(lens===t.id?'active':'')+'">'+html(t.name)+'</button>').join("");
  $("cnLensHeading").textContent=l.name;$("cnLensBody").textContent=x[l.field];
  $("cnStraitSites").querySelectorAll("button").forEach(b=>b.onclick=()=>{site=b.dataset.site;renderSite();});
  $("cnLenses").querySelectorAll("button").forEach(b=>b.onclick=()=>{lens=b.dataset.lens;renderSiteLens();});
  renderStraitMap();
 }
 function renderSiteLens(){
  const x=find(S.sites,site),l=find(S.lenses,lens);
  $("cnLenses").querySelectorAll("button").forEach(b=>{b.classList.toggle("active",b.dataset.lens===lens);b.setAttribute("aria-pressed",String(b.dataset.lens===lens));});
  $("cnLensHeading").textContent=l.name;$("cnLensBody").textContent=x[l.field];
 }
 $("cnStraitSummary").textContent=S.summary;$("cnUSContext").textContent=S.usContext;
 $("cnStraitTimeline").innerHTML=S.timeline.map(x=>'<div class="cn-time-event"><b>'+html(x.date)+'</b><p>'+html(x.text)+'</p></div>').join("");
 $("cnSources").innerHTML=D.sources.map(s=>'<a href="'+html(s.url)+'" target="_blank" rel="noopener noreferrer">'+html(s.label)+' ↗</a>').join("");
 renderProjects();renderResources();renderChannels();renderRural();renderRegion();renderSite();
 tab({country:"village",external:"strait"}[location.hash.slice(1)]||(["plan","village","strait"].includes(location.hash.slice(1))?location.hash.slice(1):"plan"));
})();
