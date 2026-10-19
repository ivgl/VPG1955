"use strict";
/* A shared, read-only chamber renderer; drawn seats match historical-group counts exactly.
   Always distinguishes last election returns from later parliamentary realignments. */
(function(){
  const DATA=window.VPI_PARLIAMENTS_1955||{};
  const script=document.currentScript;
  const code=(script?.dataset?.parliament||"").toLowerCase();
  const d=DATA[code];
  if(!d)return;
  const nav=document.querySelector("nav.tabs");
  if(!nav)return;
  const safe=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
  const id="vpi-parliament-"+code;
  const box=document.createElement("section");box.id=id;box.className="vpi-parliament";box.setAttribute("aria-label","Парламент и выборы: "+d.name);
  let chosenChamber=0,chosenGroup=0;
  const number=x=>new Intl.NumberFormat("ru-RU").format(x);
  function seatsSVG(ch){
    const count=ch.groups.reduce((s,g)=>s+g.seats,0);
    const rows=count>=500?10:count>=400?9:count>=220?8:count>=100?6:5;
    const radii=Array.from({length:rows},(_,i)=>105+(205/(rows-1))*i);
    const sumR=radii.reduce((a,b)=>a+b,0),distributions=radii.map(r=>Math.floor(r/sumR*count));
    const remainders=radii.map((r,i)=>({i,score:r/sumR*count-distributions[i]})).sort((a,b)=>b.score-a.score);
    let remainder=count-distributions.reduce((a,b)=>a+b,0);
    for(const r of remainders){if(!remainder--)break;distributions[r.i]++}
    const nodes=[];
    for(let row=0;row<rows;row++){
      const r=radii[row],n=distributions[row];
      for(let i=0;i<n;i++){
        const theta=Math.PI*(1-(i+0.5)/n);
        nodes.push({theta,r,x:380+Math.cos(theta)*r,y:340-Math.sin(theta)*r});
      }
    }
    // Fill with groups by polar angle, keeping exact seat totals.
    nodes.sort((a,b)=>b.theta-a.theta||a.r-b.r);
    let k=0;
    for(let group=0;group<ch.groups.length;group++)
       for(let i=0;i<ch.groups[group].seats;i++)nodes[k++].group=group;
    const dots=nodes.map((p,i)=>{
      const g=ch.groups[p.group];
      const active=chosenGroup===p.group;
      return '<circle data-seat-party="'+p.group+'" tabindex="-1" class="vpi-parl-seat'+(active?' vpi-seat-selected':'')+'" r="'+(count>500?'3.65':count>250?'4.8':'6')+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" fill="'+g.color+'"><title>'+safe(g.name)+" · "+g.seats+" мест"+'</title></circle>';
    }).join("");
    return '<svg class="vpi-parl-svg" viewBox="0 0 760 375" role="img" aria-label="'+safe(ch.name)+" — "+count+" мест по парламентским группам"+'">'+
    '<path d="M 65 340 H 695" stroke="currentColor" opacity=".1" stroke-width="2"/>'+dots+
    '<text x="380" y="352" text-anchor="middle" class="vpi-parl-centre">1955</text></svg>';
  }
  function render(){
    const ch=d.chambers[chosenChamber],total=ch.groups.reduce((s,g)=>s+g.seats,0);
    const g=ch.groups[chosenGroup]||ch.groups[0];
    box.innerHTML=
    '<div class="vpi-parl-heading"><div><span class="vpi-parl-kicker">ИНСТИТУТЫ · 1 ЯНВАРЯ 1955</span><h2>Парламент и выборы</h2><p>'+safe(d.government)+'</p></div>'+
    '<div class="vpi-parl-clock"><span>Ближайшие выборы</span><strong>'+safe(d.next)+'</strong><small>'+safe(d.nextNote)+'</small></div></div>'+
    '<div class="vpi-parl-dates"><span><b>Предыдущие выборы:</b> '+safe(d.previous)+'</span><span>'+safe(d.info)+'</span></div>'+
    '<div class="vpi-parl-wrap"><div class="vpi-parl-main">'+
      (d.chambers.length>1?'<div class="vpi-parl-chambers">'+d.chambers.map((c,i)=>'<button type="button" data-parl-chamber="'+i+'" class="'+(chosenChamber===i?'active':'')+'" aria-pressed="'+(chosenChamber===i)+'">'+safe(c.name)+'</button>').join("")+'</div>':'')+
      '<div class="vpi-parl-bar"><strong>'+safe(ch.name)+'</strong><span>'+number(total)+' мест'+(ch.majority?' · большинство от '+ch.majority:'')+'</span></div>'+
      seatsSVG(ch)+
      '<div class="vpi-parl-reference">'+safe(ch.sourceDate)+'</div>'+
      '<div class="vpi-parl-parties">'+ch.groups.map((x,i)=>'<button type="button" data-parl-party="'+i+'" aria-pressed="'+(i===chosenGroup)+'" class="'+(i===chosenGroup?'active':'')+'"><i style="background:'+x.color+'"></i><span>'+safe(x.name)+'</span><b>'+number(x.seats)+'</b></button>').join("")+'</div>'+
    '</div><aside class="vpi-parl-detail">'+
      '<span class="vpi-parl-kicker">ВЫБРАННАЯ ПОЛИТИЧЕСКАЯ СИЛА</span><h3>'+safe(g.name)+'</h3>'+
      '<div class="vpi-parl-big">'+number(g.seats)+'<span> из '+number(total)+' мест</span></div>'+
      '<div class="vpi-parl-meter"><span style="background:'+g.color+';width:'+((g.seats/total)*100).toFixed(1)+'%"></span></div>'+
      '<p>'+safe(g.summary)+'</p>'+
      
      '<div class="vpi-parl-sources"><strong>Источники</strong>'+d.sources.map(u=>'<a href="'+safe(u)+'" target="_blank" rel="noopener noreferrer">Результаты и парламентская история ↗</a>').join("")+'</div>'+
    '</aside></div>';
  }
  box.addEventListener("click",e=>{
    const c=e.target.closest("[data-parl-chamber]");
    if(c){chosenChamber=Number(c.dataset.parlChamber);chosenGroup=0;render();return;}
    const p=e.target.closest("[data-parl-party],[data-seat-party]");
    if(p){chosenGroup=Number(p.dataset.parlParty??p.dataset.seatParty);render();}
  });
  nav.parentNode.insertBefore(box,nav);
  render();
})();