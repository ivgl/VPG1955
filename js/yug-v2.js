"use strict";
/* Yugoslavia 1955: public read-only exploratory mechanics. No state writes. */
(function(){
 const D=window.VPI_YUGOSLAVIA_1955;if(!D){console.error("Yugoslavia data missing");return;}
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=(v,d=1)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d});
 const find=(xs,id)=>xs.find(x=>x.id===id);
 const W=D.workers,F=D.federation,P=D.diplomacy;
 let enterprise="steel",rep="srb",part="kos",partner="india",lever="technology",showSerbia=false;
 let wage=W.assumptions.defaultWages;
 let allocations=Object.fromEntries(F.republics.map(r=>[r.id,r.share]));
 let serbiaAlloc=Object.fromEntries(F.serbia.parts.map(r=>[r.id,r.share]));
 function setTab(t){
  if(!["workers","federation","world"].includes(t))return;
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));});
  document.querySelectorAll(".pane").forEach(p=>{p.hidden=p.dataset.pane!==t;});
  try{history.replaceState(null,"","#"+t)}catch(e){}
 }
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
 window.addEventListener("hashchange",()=>setTab(location.hash.slice(1)));
 const stat=(label,num,note)=>'<div class="stat"><small>'+esc(label)+'</small><strong>'+esc(num)+'</strong><span>'+esc(note)+'</span></div>';
 $("yugEconomyStats").innerHTML=[
  stat("Население",fmt(D.economy.population/1e6)+" млн","Жителей"),
  stat("ВВП",fmt(D.economy.gdp)+" млрд","Междунар. $ 2011 года"),
  stat("Сельское хозяйство",fmt(D.economy.agriculture,0)+"%","Доля ВВП"),
  stat("Инвестиции",fmt(D.economy.investment,0)+"%","Доля ВВП")
 ].join("");
 $("yugWorkersIntro").textContent=W.intro;
 $("yugCouncilParties").innerHTML=W.parties.map(x=>'<div><b>'+esc(x.name)+'</b><p>'+esc(x.stake)+'</p></div>').join("");
 function renderEnterprise(){
  const e=find(W.enterprises,enterprise);
  $("yugEnterpriseOptions").innerHTML=W.enterprises.map((x,i)=>'<button type="button" data-enterprise="'+x.id+'" aria-pressed="'+(enterprise===x.id)+'" class="'+(x.id===enterprise?'active':'')+'"><small>0'+(i+1)+' · '+esc(x.tag)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("yugEnterpriseName").textContent=e.name;$("yugEnterpriseTag").textContent=e.tag;$("yugEnterpriseAssets").textContent=e.asset;
  $("yugEnterpriseInvestment").textContent=e.positive;$("yugEnterpriseWages").textContent=e.wages;
  $("yugEnterpriseOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{enterprise=b.dataset.enterprise;renderEnterprise();renderBudget();});
 }
 function renderBudget(){
  const investing=Math.round((100-wage)*W.assumptions.investmentToCommunityRatio);
  const publicPart=100-wage-investing;
  $("yugWageValue").textContent=wage+"%";
  $("yugWagesOut").textContent=wage+"%";
  $("yugInvestOut").textContent=investing+"%";
  $("yugPublicOut").textContent=publicPart+"%";
  $("yugBudgetStack").innerHTML='<div class="yug-budget-wage" style="width:'+wage+'%" title="Дополнительные выплаты: '+wage+'%"></div>'+
   '<div class="yug-budget-invest" style="width:'+investing+'%" title="Реинвестиции: '+investing+'%"></div>'+
   '<div class="yug-budget-public" style="width:'+publicPart+'%" title="Местные программы: '+publicPart+'%"></div>';
  const x=find(W.enterprises,enterprise);
  $("yugBudgetWarning").textContent=(wage>=70?"Рабочий совет направляет большую часть доступного остатка на текущие выплаты. ":
  wage<=20?"Основная часть доступного остатка остаётся на накопление и дополнительные общественные программы. ":
  "Коллектив распределяет остаток между текущим доходом и будущими возможностями. ")+x.constraint;
  $("yugWageSlider").style.setProperty("--fill",wage+"%");
 }
 $("yugWageSlider").addEventListener("input",()=>{wage=Math.max(0,Math.min(100,Number($("yugWageSlider").value)||0));renderBudget();});
 $("yugFederationIntro").textContent=F.intro;
 $("yugFederationFootnote").textContent=F.allocation_note;
 $("yugSerbiaIntro").textContent=F.serbia.intro;
 // Redistribute the unchanged 100-unit envelope; retain proportional allocation among all other recipients.
 function balance(obj,target,value){
  const ids=Object.keys(obj),next=Math.max(0,Math.min(100,Math.round(value)));
  const others=ids.filter(k=>k!==target),remaining=100-next;
  const old=others.reduce((sum,k)=>sum+obj[k],0);
  const ideal=others.map((k,i)=>({k,exact:old>0?remaining*obj[k]/old:remaining/others.length,i}));
  const rounded=ideal.map(p=>({k:p.k,v:Math.floor(p.exact),frac:p.exact-Math.floor(p.exact),i:p.i}));
  let left=remaining-rounded.reduce((sum,p)=>sum+p.v,0);
  rounded.sort((a,b)=>b.frac-a.frac||a.i-b.i);
  for(let j=0;j<left;j++)rounded[j%rounded.length].v++;
  obj[target]=next;rounded.forEach(p=>{obj[p.k]=p.v});
 }
 const colors={slo:"#6f9a81",cro:"#aab97a",bih:"#d0a878",srb:"#638b9d",mne:"#9a86af",mkd:"#bd8883"};
 function renderFederation(){
  const r=find(F.republics,rep);
  $("yugRepublicName").textContent=r.name;$("yugRepublicRole").textContent=r.role;
  $("yugRepublicNeeds").textContent=r.needs;$("yugRepublicTension").textContent=r.tension;
  $("yugSerbiaPrompt").hidden=rep!=="srb";
  if(rep!=="srb"){showSerbia=false;$("yugSerbiaSection").hidden=true;}
  $("yugFederationBar").innerHTML=F.republics.map(x=>'<div title="'+esc(x.name)+': '+allocations[x.id]+'%" style="width:'+allocations[x.id]+'%;background:'+colors[x.id]+'"></div>').join("");
  $("yugRepublicSliders").innerHTML=F.republics.map(x=>'<div class="yug-republic-row'+(x.id===rep?' selected':'')+'"><button type="button" data-republic="'+x.id+'" aria-pressed="'+(rep===x.id)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.capital)+'</small></button>'+
  '<label class="yug-range-small"><input type="range" min="0" max="100" step="1" data-rep-slider="'+x.id+'" value="'+allocations[x.id]+'" aria-label="Доля федерального проекта: '+esc(x.name)+'"><output>'+allocations[x.id]+'%</output></label></div>').join("");
  $("yugRepublicSliders").querySelectorAll("[data-republic]").forEach(b=>b.onclick=()=>{rep=b.dataset.republic;renderFederation();});
  $("yugRepublicSliders").querySelectorAll("[data-rep-slider]").forEach(slider=>slider.addEventListener("input",()=>{
    const was=slider.dataset.repSlider;balance(allocations,was,Number(slider.value));rep=was;renderFederation();
  }));
 }
 function renderSerbia(){
  $("yugSerbiaSection").hidden=!showSerbia;
  const x=find(F.serbia.parts,part);
  $("yugSerbiaPartName").textContent=x.name;
  $("yugSerbiaStatus").textContent=x.status;
  $("yugSerbiaProfile").textContent=x.profile;
  $("yugSerbiaNeeds").textContent=x.needs;
  $("yugSerbiaTension").textContent=x.tension;
  $("yugSerbianAllocations").innerHTML=F.serbia.parts.map(x=>
   '<div class="yug-serbia-row'+(x.id===part?' selected':'')+'"><button type="button" data-serbia-part="'+x.id+'" aria-pressed="'+(part===x.id)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.status)+'</small></button><label><input type="range" min="0" max="100" step="1" value="'+serbiaAlloc[x.id]+'" data-serbia-range="'+x.id+'" aria-label="Доля внутри Сербии: '+esc(x.name)+'"><output>'+serbiaAlloc[x.id]+'%</output></label></div>'
  ).join("");
  $("yugSerbianAllocations").querySelectorAll("[data-serbia-part]").forEach(b=>b.onclick=()=>{part=b.dataset.serbiaPart;renderSerbia();});
  $("yugSerbianAllocations").querySelectorAll("[data-serbia-range]").forEach(slider=>slider.addEventListener("input",()=>{
   balance(serbiaAlloc,slider.dataset.serbiaRange,Number(slider.value));part=slider.dataset.serbiaRange;renderSerbia();
  }));
 }
 $("yugOpenSerbia").addEventListener("click",()=>{showSerbia=true;rep="srb";renderFederation();renderSerbia();});
 $("yugDiplomacyIntro").textContent=P.intro;
 $("yugNonalignedNote").textContent=P.non_aligned_note;
 const positions={india:[473,302],usa:[125,123],ussr:[442,87],balkan:[410,200],egypt:[212,308],europe:[150,218]};
 function renderNetwork(){
  const base=[299,207];
  $("yugDiplomacyNetwork").innerHTML='<svg viewBox="0 0 600 400" role="group" aria-label="Схема независимых дипломатических отношений Югославии">'+
  '<rect width="600" height="400" rx="12" fill="#f0f2f0"/>'+
  P.nodes.map(x=>'<path class="yug-network-link" d="M'+base.join(" ")+' L'+positions[x.id].join(" ")+'"/>').join("")+
  '<circle cx="'+base[0]+'" cy="'+base[1]+'" r="40" class="yug-network-center"/><text x="'+base[0]+'" y="'+(base[1]+4)+'" class="yug-network-center-text" text-anchor="middle">БЕЛГРАД</text>'+
  P.nodes.map(x=>{const p=positions[x.id],on=x.id===partner,right=p[0]>360;return '<g class="yug-network-pin'+(on?' active':'')+'" data-network-pin="'+x.id+'" role="button" tabindex="0" aria-label="'+esc(x.name)+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(on?12:9)+'"/><text x="'+(p[0]+(right?-13:13))+'" y="'+(p[1]-13)+'" text-anchor="'+(right?'end':'start')+'">'+esc(x.name)+'</text><title>'+esc(x.name)+'</title></g>';}).join("")+
  '</svg>';
  $("yugDiplomacyNetwork").querySelectorAll("[data-network-pin]").forEach(n=>{const change=()=>{partner=n.dataset.networkPin;renderDiplomacy();};n.onclick=change;n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();change();$("yugDiplomacyNetwork").querySelector('[data-network-pin="'+partner+'"]')?.focus({preventScroll:true});}}});
 }
 function renderDiplomacy(){
  const x=find(P.nodes,partner);
  $("yugPartnerName").textContent=x.name;$("yugPartnerStatus").textContent=x.status;
  $("yugPartnerOpening").textContent=x.opening;$("yugPartnerGain").textContent=x.gain;$("yugPartnerRisk").textContent=x.risk;
  $("yugDiplomacyOptions").innerHTML=P.nodes.map(x=>'<button type="button" data-dip="'+x.id+'" aria-pressed="'+(x.id===partner)+'" class="'+(x.id===partner?'active':'')+'">'+esc(x.name)+'</button>').join("");
  $("yugDiplomacyOptions").querySelectorAll("button").forEach(b=>b.onclick=()=>{partner=b.dataset.dip;renderDiplomacy();});
  renderNetwork();
 }
 function renderLevers(){
  const x=find(P.levers,lever);
  $("yugDiplomacyLevers").innerHTML=P.levers.map((x,i)=>'<button type="button" data-lever="'+x.id+'" aria-pressed="'+(x.id===lever)+'" class="'+(x.id===lever?'active':'')+'"><small>0'+(i+1)+'</small><strong>'+esc(x.name)+'</strong></button>').join("");
  $("yugLeverName").textContent=x.name;$("yugLeverText").textContent=x.text;
  $("yugDiplomacyLevers").querySelectorAll("button").forEach(b=>b.onclick=()=>{lever=b.dataset.lever;renderLevers();});
 }
 $("yugSources").innerHTML=D.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name)+' ↗</a>').join("");
 renderEnterprise();renderBudget();renderFederation();renderSerbia();renderDiplomacy();renderLevers();
 setTab(["workers","federation","world"].includes(location.hash.slice(1))?location.hash.slice(1):"workers");
})();