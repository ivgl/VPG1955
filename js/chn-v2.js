"use strict";
/* China national mechanics, 1955-01-01. Read-only player visualization: no automatic adjudication. */
(function(){
 const D=window.VPI_CHN_ATLAS_1955,G=window.VPI_REMAINING_GEO&&window.VPI_REMAINING_GEO.chn;
 if(!D||!G){console.error("CHN atlas or map unavailable");return;}
 const $=id=>document.getElementById(id);
 const esc=x=>String(x===undefined||x===null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const projectData=D.tabs.find(x=>x.id==="industry"),regionData=D.tabs.find(x=>x.id==="provinces"),worldData=D.tabs.find(x=>x.id==="world");
 const projects=projectData.choices,policies=projectData.tools,regions=regionData.items,scenarios=regionData.scenarios,cases=worldData.items;
 let project="steel",stage=0,policy="plan",region="liaoning",scenario="normal",govStep=0,worldCase="ussr";
 function openTab(id,scroll=false){
  if(!["plan","country","external"].includes(id))return;
  document.querySelectorAll(".tab").forEach(b=>{let active=b.dataset.tab===id;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));});
  document.querySelectorAll(".pane").forEach(p=>{const on=p.dataset.pane===id;p.hidden=!on;p.classList.toggle("active",on);});
  try{history.replaceState(null,"","#"+id)}catch(e){}
  if(scroll)document.querySelector(".tabs").scrollIntoView({behavior:"smooth",block:"start"});
 }
 document.querySelectorAll(".tab").forEach(x=>x.addEventListener("click",()=>openTab(x.dataset.tab)));
 document.addEventListener("click",e=>{const b=e.target.closest("[data-jump]");if(!b)return;
  if(b.dataset.region&&regions.some(p=>p.id===b.dataset.region)){region=b.dataset.region;renderRegion();}
  if(b.dataset.project&&projects.some(p=>p.id===b.dataset.project)){project=b.dataset.project;renderProject();}
  if(b.dataset.case&&cases.some(x=>x.id===b.dataset.case)){worldCase=b.dataset.case;renderWorld();}
  openTab(b.dataset.jump,true);
 });
 const f=n=>Number(n).toLocaleString("ru-RU",{maximumFractionDigits:2});
 const stats=[
  ["Население",f(D.metrics.population/1e6)+" млн","Начало 1955 года"],
  ["Сельское хозяйство",f(D.metrics.agriculture_share_pct)+"%","Доля экономики · игровая модель"],
  ["Промышленность",f(D.metrics.industry_share_pct)+"%","Доля экономики · игровая модель"],
  ["Инвестиции",f(D.metrics.investment_share_gdp_pct)+"%","Доля ВВП · игровая оценка"]
 ];
 $("cnStats").innerHTML=stats.map(([name,value,note])=>'<div class="stat"><small>'+esc(name)+'</small><strong>'+esc(value)+'</strong><span>'+esc(note)+'</span></div>').join("");
 function renderProject(){
  const p=projects.find(x=>x.id===project);
  $("projectButtons").innerHTML=projects.map((x,i)=>'<button type="button" class="project-choice'+(project===x.id?" active":"")+'" aria-pressed="'+(project===x.id)+'" data-project="'+x.id+'"><span class="number">0'+(i+1)+'</span><span><strong>'+esc(x.title)+'</strong><small>'+esc(x.tag)+'</small></span></button>').join("");
  $("projName").textContent=p.title;$("projTag").textContent=p.tag;$("projAsset").textContent=p.asset;$("projIssue").textContent=p.issue;
  $("projConditions").innerHTML=p.conditions.map(t=>'<li>'+esc(t)+'</li>').join("");
  $("projImpact").textContent=p.impact;
  $("projectButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{project=b.dataset.project;stage=0;renderProject();renderStages();});
 }
 function renderStages(){
  $("cnProjectFlow").innerHTML=D.projectStages.map((x,i)=>'<button type="button" class="flow-node'+(stage===i?" active":"")+'" aria-pressed="'+(stage===i)+'" data-stage="'+i+'"><small>0'+(i+1)+' · '+esc(x.caption)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("stageName").textContent=D.projectStages[stage].name;
  $("stageBody").textContent=D.projectStages[stage].detail;
  $("cnProjectFlow").querySelectorAll("button").forEach(b=>b.onclick=()=>{stage=Number(b.dataset.stage);renderStages();});
 }
 function renderPolicies(){
  $("policyButtons").innerHTML=policies.map(x=>'<button type="button" class="policy-btn'+(policy===x.id?" active":"")+'" data-policy="'+x.id+'" aria-pressed="'+(policy===x.id)+'"><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></button>').join("");
  let p=policies.find(x=>x.id===policy);
  $("policyName").textContent=p.title;$("policyDetail").textContent=p.detail;
  $("policyButtons").querySelectorAll("button").forEach(b=>b.onclick=()=>{policy=b.dataset.policy;renderPolicies();});
 }
 function renderGov(){
  $("govSteps").innerHTML=D.adminStages.map((x,i)=>'<button type="button" class="gov-stage'+(i===govStep?" active":"")+'" data-gov="'+i+'" aria-pressed="'+(i===govStep)+'"><small>0'+(i+1)+'</small><strong>'+esc(x.title)+'</strong></button>').join("");
  $("govDetail").textContent=D.adminStages[govStep].text;
  $("govSteps").querySelectorAll("button").forEach(b=>b.onclick=()=>{govStep=Number(b.dataset.gov);renderGov();});
 }
 const pt=(lon,lat)=>[G.transform.offsetX+lon*G.transform.scale*G.transform.cos,G.transform.offsetY-lat*G.transform.scale];
 function drawMap(){
  const affected=scenarios.find(x=>x.id===scenario).affected;
  const shape=G.shapes.map(s=>'<path class="cn-land" d="'+esc(s.d)+'"></path>').join("");
  const points=regions.map(r=>{
   const c=pt(r.lon,r.lat),selected=r.id===region,hit=affected.includes(r.id);
   const short=r.name.split("·")[1]?r.name.split("·")[1].trim():r.name;
   return '<g role="button" tabindex="0" data-region-map="'+r.id+'" aria-label="'+esc(r.name)+'" class="map-region'+(selected?" active":"")+(hit?" affected":"")+'"><circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="'+(selected?8.4:6.5)+'"></circle><text x="'+(c[0]+11).toFixed(1)+'" y="'+(c[1]-7).toFixed(1)+'">'+esc(short)+'</text><title>'+esc(r.name)+'</title></g>';
  }).join("");
  $("cnRegionMap").innerHTML=shape+'<text class="map-water" x="540" y="410">Тихий океан</text>'+points;
  $("cnRegionMap").querySelectorAll("[data-region-map]").forEach(e=>{const select=()=>{region=e.dataset.regionMap;renderRegion();};e.addEventListener("click",select);e.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select();}})});
 }
 function renderRegion(){
  const r=regions.find(x=>x.id===region),s=scenarios.find(x=>x.id===scenario);
  $("regionTitle").textContent=r.name;$("regionStatus").textContent=r.status;
  $("regionIssue").textContent=r.issue;$("regionAction").textContent=r.action;$("regionNote").textContent=r.note;
  $("cnRegionChoices").innerHTML=regions.map(x=>'<button type="button" data-region="'+x.id+'" class="'+(region===x.id?"active":"")+'" aria-pressed="'+(region===x.id)+'">'+esc(x.name.split("·").slice(-1)[0].trim())+'</button>').join("");
  $("cnScenarioChoice").innerHTML=scenarios.map(x=>'<button type="button" data-scenario="'+x.id+'" class="'+(scenario===x.id?"active":"")+'" aria-pressed="'+(scenario===x.id)+'">'+esc(x.label)+'</button>').join("");
  $("cnScenarioText").textContent=s.detail;
  $("cnRegionChoices").querySelectorAll("button").forEach(b=>b.onclick=()=>{region=b.dataset.region;renderRegion();});
  $("cnScenarioChoice").querySelectorAll("button").forEach(b=>b.onclick=()=>{scenario=b.dataset.scenario;renderRegion();});
  drawMap();
 }
 function renderWorld(){
  const c=cases.find(x=>x.id===worldCase);
  $("cnWorldChoices").innerHTML=cases.map((x,i)=>'<button type="button" class="case-btn'+(worldCase===x.id?" active":"")+'" data-case="'+x.id+'" aria-pressed="'+(worldCase===x.id)+'"><small>0'+(i+1)+'</small><strong>'+esc(x.name)+'</strong><span>'+esc(x.status)+'</span></button>').join("");
  $("worldName").textContent=c.name;$("worldStatus").textContent=c.status;$("worldRole").textContent=c.role;
  $("worldBarrier").textContent=c.barrier;$("worldMoves").textContent=c.moves;
  $("cnWorldChoices").querySelectorAll("button").forEach(b=>b.onclick=()=>{worldCase=b.dataset.case;renderWorld();});
 }
 const labels={energy:"Энергия",food:"Продовольствие",raw_materials:"Сырьё",machinery_technology:"Машины и технологии",finished_goods:"Готовые товары",services:"Услуги"};
 function tradeBars(id,kind){
  const groups=D.trade[kind];
  $(id).innerHTML=Object.keys(labels).map(k=>'<div class="trade-row"><span>'+esc(labels[k])+'</span><div class="bar"><span class="'+(kind==="imports"?"import":"")+'" style="width:'+Number(groups[k])+'%"></span></div><b>'+f(groups[k])+'%</b></div>').join("");
 }
 tradeBars("cnTradeExports","exports");tradeBars("cnTradeImports","imports");
 $("cnSources").innerHTML=D.sources.map(s=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.name)+' ↗</a>').join("");
 renderProject();renderStages();renderPolicies();renderGov();renderRegion();renderWorld();
 openTab(["plan","country","external"].includes(location.hash.slice(1))?location.hash.slice(1):"plan");
})();
