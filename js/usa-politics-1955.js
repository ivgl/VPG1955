"use strict";
(function(){
 const source=window.VPI_USA_FACTIONS_1955,root=document.getElementById("usaCoalitionRoot");
 if(!source||!root)return;
 let topic="rights";
 let votes={};
 const chambers=["house","senate"];
 const modes={yes:"Поддержка",maybe:"Переговоры",no:"Против"};
 const safe=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 function reset(){
  const start=source.topics.find(x=>x.id===topic).support;
  votes=Object.fromEntries(chambers.map(ch=>[ch,Object.fromEntries(source[ch].groups.map(g=>[g.id,start[g.id]||"maybe"]))]));
 }
 function counts(ch){
  const out={yes:0,maybe:0,no:0};
  source[ch].groups.forEach(g=>out[votes[ch][g.id]]+=g.seats);
  return out;
 }
 function panel(ch){
  const x=source[ch],n=counts(ch),missing=Math.max(0,x.majority-n.yes);
  const note=missing===0?"Большинство собрано.":n.yes+n.maybe<x.majority?"Даже все переговорные группы не обеспечат большинства.":"Для большинства необходимо ещё "+missing+" голосов.";
  return '<section class="card soft usa-chamber"><div class="secthead"><div><h3>'+safe(x.label)+'</h3><p class="micro">'+x.total+' мест · большинство '+x.majority+'</p></div><span class="badge dark">'+n.yes+' за</span></div>'+
   '<div class="usa-vote-track"><span style="width:'+(n.yes/x.total*100)+'%"></span><span class="waiting" style="width:'+(n.maybe/x.total*100)+'%"></span></div>'+
   '<p class="subtle">Поддержка '+n.yes+' · Переговоры '+n.maybe+' · Против '+n.no+'</p><p class="usa-majority-msg">'+note+'</p>'+
   x.groups.map(g=>'<div class="usa-vote-group"><div><b>'+safe(g.name)+'</b><span class="micro">'+g.party+' · '+g.seats+' мест</span><small>'+safe(g.theme)+'</small></div><div class="usa-vote-buttons">'+Object.keys(modes).map(mode=>'<button type="button" data-us-vote="'+ch+':'+g.id+':'+mode+'" class="'+(votes[ch][g.id]===mode?"active "+mode:"")+'" aria-pressed="'+(votes[ch][g.id]===mode)+'">'+modes[mode]+'</button>').join('')+'</div></div>').join('')+'</section>';
 }
 function render(){
  const chosen=source.topics.find(x=>x.id===topic);
  root.innerHTML='<div class="usa-topics">'+source.topics.map(x=>'<button type="button" data-us-topic="'+x.id+'" class="'+(x.id===topic?"active":"")+'">'+safe(x.name)+'</button>').join('')+'</div><p class="subtle">'+safe(chosen.desc)+'</p>'+
   '<div class="usa-chamber-grid">'+chambers.map(panel).join('')+'</div>'+
   '<p class="micro">Численность внутренних фракций — рабочая игровая раскладка. Состав партий известен по итогам выборов; голоса отдельных депутатов могут отличаться от позиции группы.</p>'+
   '<button type="button" class="action secondary" id="copyUSADeal">Скопировать проект коалиции</button><span id="usDealStatus" class="micro"></span>';
  root.querySelectorAll("[data-us-topic]").forEach(b=>b.onclick=()=>{topic=b.dataset.usTopic;reset();render()});
  root.querySelectorAll("[data-us-vote]").forEach(b=>b.onclick=()=>{const a=b.dataset.usVote.split(":");votes[a[0]][a[1]]=a[2];render()});
  root.querySelector("#copyUSADeal").onclick=()=>{
   const lines=["США, 1955. Законопроект: "+chosen.name+"."];
   chambers.forEach(ch=>{const x=source[ch],n=counts(ch);lines.push(x.label+": за "+n.yes+", переговоры "+n.maybe+", против "+n.no+"; порог "+x.majority+".");lines.push("Группы для переговоров: "+x.groups.filter(g=>votes[ch][g.id]==="maybe").map(g=>g.name+" ("+g.seats+")").join(", ")+".")});
   lines.push("Предлагаемые уступки и содержание законопроекта: [указать].");
   const txt=lines.join("\n");
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>root.querySelector("#usDealStatus").textContent=" Скопировано.").catch(()=>window.prompt("Скопируйте план",txt));
   else window.prompt("Скопируйте план",txt);
  };
 }
 reset();render();
})();