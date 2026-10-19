"use strict";
(function(){
 const root=document.getElementById("usaCivilPlanner"),geo=window.VPI_USA_MAPS;
 if(!root||!geo||typeof STATES==="undefined")return;
 const EV={AL:11,AZ:4,AR:8,CA:32,CO:6,CT:8,DE:3,FL:10,GA:12,ID:4,IL:27,IN:13,IA:10,KS:8,KY:10,LA:10,ME:5,MD:9,MA:16,MI:20,MN:11,MS:8,MO:13,MT:4,NE:6,NV:3,NH:4,NJ:16,NM:4,NY:45,NC:14,ND:4,OH:25,OK:8,OR:6,PA:32,RI:4,SC:8,SD:4,TN:11,TX:24,UT:4,VT:3,VA:12,WA:9,WV:8,WI:12,WY:3};
 const democrats1952=new Set(["AL","AR","GA","KY","LA","MS","NC","SC","WV"]);
 const stateIds=Object.fromEntries("Alabama:AL|Arizona:AZ|Arkansas:AR|California:CA|Colorado:CO|Connecticut:CT|Delaware:DE|Florida:FL|Georgia:GA|Idaho:ID|Illinois:IL|Indiana:IN|Iowa:IA|Kansas:KS|Kentucky:KY|Louisiana:LA|Maine:ME|Maryland:MD|Massachusetts:MA|Michigan:MI|Minnesota:MN|Mississippi:MS|Missouri:MO|Montana:MT|Nebraska:NE|Nevada:NV|New Hampshire:NH|New Jersey:NJ|New Mexico:NM|New York:NY|North Carolina:NC|North Dakota:ND|Ohio:OH|Oklahoma:OK|Oregon:OR|Pennsylvania:PA|Rhode Island:RI|South Carolina:SC|South Dakota:SD|Tennessee:TN|Texas:TX|Utah:UT|Vermont:VT|Virginia:VA|Washington:WA|West Virginia:WV|Wisconsin:WI|Wyoming:WY|District of Columbia:DC".split("|").map(x=>x.split(":")));
 const stateById=Object.fromEntries(STATES.map(s=>[s.id,s]));
 const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const rate=[0,.2,.4,.6],caps=[0,2,4,6];
 const methods=[
  ["courts","Суды и правовая защита","Судебные дела, защита прав школьников, контроль исполнения федеральных решений."],
  ["deals","Переговоры и стимулы","Финансирование школ, договорённости с губернаторами и местными учреждениями."],
  ["force","Федеральное вмешательство","Прямое обеспечение исполнения закона при повышенном риске конфликта с местными властями."]
 ];
 const plan={selected:"TX",targets:[],mode:2,method:"deals",fiscal:718.28};
 const $=id=>root.querySelector("#"+id);
 root.innerHTML='<div class="usa-civil-grid"><article class="card"><div class="secthead"><div><div class="label">Гражданские права</div><h2>Десегрегация школ по штатам</h2></div><span class="badge dark">48 штатов</span></div>'+
 '<p>Выберите направления федеральной реформы. У каждого штата — своя степень сопротивления, политический вес и история голосования.</p>'+
 '<div class="usa-map-legend"><span><i class="mandatory"></i> Обязательная сегрегация до 1954</span><span><i class="allowed"></i> Допускалась</span><span><i class="other"></i> Иные штаты</span></div>'+
 '<svg id="usaStateGeo" viewBox="0 0 990 470" role="group" aria-label="Карта 48 штатов США"></svg>'+
 '<div class="usa-map-pills" id="usaStateChoices"></div>'+
 '<div class="usa-election-strip"><div><strong>531</strong><span>всего выборщиков</span></div><div><strong>266</strong><span>порог победы</span></div><div><strong id="usaTargetEv">0</strong><span>выборщиков в программе</span></div></div>'+
 '<p class="micro">Выборщики показывают политический вес территории. Федеральная реформа не переводит голоса к партии автоматически.</p></article>'+
 '<article class="card"><div class="label">Выбранный штат</div><h2 id="usaStateTitle">Техас</h2><span id="usaStateLaw" class="badge dark">—</span><p id="usaStateBio"></p>'+
 '<div class="usa-election-strip"><div><strong id="usaStateEv">—</strong><span>голосов выборщиков</span></div><div><strong id="usaLastWinner">—</strong><span>победитель выборов 1952</span></div></div>'+
 '<p id="usaStateRisk" class="subtle"></p><button type="button" class="action" id="usaTargetToggle">Включить в программу</button></article>'+
 '<article class="card"><div class="label">Стратегия Белого дома</div><h2>Федеральная программа</h2><p>Определите масштаб, метод и приоритетные штаты. Законодательная поддержка зависит от работы с Конгрессом.</p>'+
 '<div class="usa-topics" id="usaCivilModes">'+caps.map((v,i)=>'<button type="button" data-us-civmode="'+i+'">'+(i===0?"Без программы":v+" штата")+'</button>').join('')+'</div>'+
 '<div class="label" style="margin-top:15px">Способ действия</div><div class="usa-topics" id="usaCivilMethods">'+methods.map(x=>'<button type="button" data-us-method="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><p class="subtle" id="usaMethodInfo"></p>'+
 '<div class="inputline"><label for="usaFiscal">Федеральные расходы, млрд G$</label><input id="usaFiscal" class="num" type="number" min="0" step="0.01" value="718.28"></div>'+
 '<div class="metricGrid"><div class="metric"><span>Расходы на программу</span><strong id="usaCivCost">—</strong><span>млрд G$</span></div><div class="metric"><span>Сопротивление в выбранных штатах</span><strong id="usaCivRisk">—</strong><span>ориентир для исполнения</span></div></div>'+
 '<div class="label">Целевые штаты · <span id="usaTargetMax">0 / 4</span></div><div id="usaTargetList" class="listStates"></div>'+
 '<div class="controls"><button type="button" class="action secondary" id="usaCivClear">Очистить</button><button type="button" class="action" id="usaCivCopy">Скопировать план</button></div><p class="micro" id="usaCivCopyStatus"></p></article></div>';
 const map=$("usaStateGeo");
 map.innerHTML=geo.usStates.states.map(x=>{const id=stateIds[x.name]||"?",r=stateById[id];return '<path role="button" tabindex="0" data-usa-state="'+id+'" data-law="'+(r?.law||"иное")+'" class="usa-state-shape" d="'+x.path+'" aria-label="'+esc(x.name)+'"><title>'+esc(x.name)+'</title></path>';}).join("");
 $("usaStateChoices").innerHTML=STATES.map(s=>'<button type="button" data-us-quick="'+s.id+'">'+esc(s.name)+'</button>').join("");
 function render(){
  plan.targets=plan.targets.slice(0,caps[plan.mode]);
  const id=plan.selected,r=stateById[id],name=r?.name||geo.usStates.states.find(x=>stateIds[x.name]===id)?.name||id;
  const sum=plan.targets.reduce((s,x)=>s+(EV[x]||0),0),score={низкое:1,среднее:2,высокое:3};
  const avg=plan.targets.length?plan.targets.reduce((s,x)=>s+(score[stateById[x]?.resistance]||1),0)/plan.targets.length:0;
  $("usaStateTitle").textContent=name;
  $("usaStateLaw").textContent=r?(r.law==="обязательная"?"Сегрегация была обязательной":"Сегрегация допускалась"):"Иная правовая ситуация";
  $("usaStateBio").textContent=r?"Решение Верховного суда действует; в этом штате до 1954 года сегрегация была "+r.law+" по местным нормам.":"Потребуется учитывать особенности местной школьной системы.";
  $("usaStateEv").textContent=EV[id]??"—";
  $("usaLastWinner").textContent=id==="DC"?"—":democrats1952.has(id)?"Демократы":"Республиканцы";
  $("usaStateRisk").textContent="Сопротивление местных властей: "+(r?.resistance||"отдельная оценка")+".";
  $("usaTargetEv").textContent=String(sum);
  $("usaTargetToggle").textContent=plan.targets.includes(id)?"Убрать из программы":"Включить в программу";
  $("usaTargetToggle").disabled=!r||(!plan.targets.includes(id)&&plan.targets.length>=caps[plan.mode]);
  $("usaTargetMax").textContent=plan.targets.length+" / "+caps[plan.mode];
  $("usaTargetList").innerHTML=plan.targets.length?plan.targets.map(code=>'<span class="pill">'+esc(stateById[code].name)+' · '+EV[code]+'</span>').join(""):'<span class="micro">Выберите штаты на карте</span>';
  $("usaCivCost").textContent=(plan.fiscal*rate[plan.mode]/100).toLocaleString("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2});
  $("usaCivRisk").textContent=!plan.targets.length?"—":avg<1.7?"Низкое":avg<2.5?"Среднее":"Высокое";
  $("usaMethodInfo").textContent=methods.find(x=>x[0]===plan.method)[2];
  root.querySelectorAll("[data-us-civmode]").forEach(b=>b.classList.toggle("active",Number(b.dataset.usCivmode)===plan.mode));
  root.querySelectorAll("[data-us-method]").forEach(b=>b.classList.toggle("active",b.dataset.usMethod===plan.method));
  root.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>{const code=b.dataset.usaState||b.dataset.usQuick;b.classList.toggle("active",code===id);b.classList.toggle("target",plan.targets.includes(code));b.setAttribute("aria-pressed",String(plan.targets.includes(code)));});
 }
 root.querySelectorAll("[data-usa-state],[data-us-quick]").forEach(b=>{const click=()=>{plan.selected=b.dataset.usaState||b.dataset.usQuick;render()};b.addEventListener("click",click);b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();}})});
 root.querySelectorAll("[data-us-civmode]").forEach(b=>b.onclick=()=>{plan.mode=Number(b.dataset.usCivmode);render()});
 root.querySelectorAll("[data-us-method]").forEach(b=>b.onclick=()=>{plan.method=b.dataset.usMethod;render()});
 $("usaFiscal").addEventListener("input",e=>{plan.fiscal=Math.max(0,Number(e.target.value)||0);render()});
 $("usaTargetToggle").onclick=()=>{const id=plan.selected,i=plan.targets.indexOf(id);if(i>=0)plan.targets.splice(i,1);else if(stateById[id]&&plan.targets.length<caps[plan.mode])plan.targets.push(id);render()};
 $("usaCivClear").onclick=()=>{plan.targets=[];render()};
 $("usaCivCopy").onclick=()=>{
  const names=plan.targets.map(id=>stateById[id].name+" ("+EV[id]+" выборщиков)").join(", ")||"[выбрать штаты]";
  const txt="США, 1955. Программа школьной десегрегации. Метод: "+methods.find(x=>x[0]===plan.method)[1]+". Штаты: "+names+". Расходы: "+rate[plan.mode].toFixed(1)+"% федеральных расходов, "+(plan.fiscal*rate[plan.mode]/100).toFixed(2)+" млрд G$. Меры, сроки и переговоры: [описать].";
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>$("usaCivCopyStatus").textContent="Текст скопирован.").catch(()=>window.prompt("Скопируйте план",txt));else window.prompt("Скопируйте план",txt);
 };
 render();
})();