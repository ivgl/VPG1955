"use strict";
/*
 * Six country interfaces. Reference cards and illustrative post drafts ONLY.
 * No writes to official state; current public config is only a prototype.
 */
(function(){
 const d=window.VPI_COUNTRY_CONFIG, maps=window.VPI_REMAINING_GEO;
 const $=id=>document.getElementById(id);
 const escapeHtml=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 if(!d||d.code!==document.body.dataset.country||!maps?.[d.code]){
  document.body.insertAdjacentHTML("afterbegin",'<p class="warning">Не удалось загрузить данные страницы. Попробуйте обновить страницу.</p>');return;
 }
 document.documentElement.style.setProperty("--national-accent",d.highlight||"#52776b");
 let activeTab=d.tabs[0].id;
 const selected={},toolSelected={},scenarioSelected={},done={},draftOpen={};
 d.tabs.forEach(t=>{
  selected[t.id]=(t.items||t.choices||[])[0]?.id||"";
  toolSelected[t.id]=t.tools?.[0]?.id||"";
  scenarioSelected[t.id]=t.scenarios?.find(s=>s.id==="normal")?.id||t.scenarios?.[0]?.id||"";
  if(t.kind==="projects")for(const item of t.choices)done[t.id+":"+item.id]=new Set();
 });
 const shares=d.tabs.find(t=>t.kind==="allocation");
 const alloc=shares?Object.fromEntries(shares.items.map(x=>[x.id,x.value])):null;
 window.VPI_REMAINING_SESSION={allocation:alloc};
 const valueOf=t=>(t.items||t.choices||[]).find(x=>x.id===selected[t.id]);
 const icons={dossier:"landmark",projects:"factory",map:"map-pinned",allocation:"layers"};
 function openTab(id){
  if(!d.tabs.some(t=>t.id===id))return;
  activeTab=id;
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("current",on);b.setAttribute("aria-selected",String(on))});
  document.querySelectorAll(".pane").forEach(s=>{const on=s.dataset.pane===id;s.hidden=!on;s.classList.toggle("current",on)});
  history.replaceState?.(null,"","#"+id);
  render(d.tabs.find(t=>t.id===id));
 }
 function mapSVG(tab){
  const geographic=maps[d.code],def=geographic.transform;
  const toPoint=(lon,lat)=>[Math.round(lon*def.cos*def.scale+def.offsetX),Math.round(-lat*def.scale+def.offsetY)];
  const current=scenarioSelected[tab.id];
  const sc=tab.scenarios?.find(x=>x.id===current);
  const affected=sc?.affected||[];
  const shapes=geographic.shapes.map((s,i)=>'<path class="geo-outline" d="'+s.d+'"><title>'+escapeHtml(s.name)+'</title></path>').join("");
  const markers=tab.items.filter(x=>Number.isFinite(x.lon)&&Number.isFinite(x.lat)).map(x=>{
   const [px,py]=toPoint(x.lon,x.lat),active=selected[tab.id]===x.id;
   return '<circle class="geo-marker'+(active?' active':'')+(affected.includes(x.id)?' affected':'')+'" role="button" tabindex="0" aria-label="'+escapeHtml(x.name)+'" aria-pressed="'+active+'" data-map-id="'+x.id+'" data-section="'+tab.id+'" cx="'+px+'" cy="'+py+'" r="'+(active?11:8)+'"><title>'+escapeHtml(x.name)+'</title></circle>';
  }).join("");
  return '<svg class="country-svg" viewBox="'+geographic.viewBox+'" role="group" aria-label="Географическая карта — современная схематическая подложка"><rect x="0" y="0" width="700" height="460" fill="transparent"/>'+shapes+markers+'</svg>';
 }
 function cards(t,arr,kind){
  return '<div class="item-grid">'+arr.map(o=>{
   const chosen=selected[t.id]===o.id;
   const subtitle=o.tag||o.position||o.status||"";
   return '<button type="button" class="item-card'+(chosen?' active':'')+'" data-select="'+o.id+'" data-section="'+t.id+'" aria-pressed="'+chosen+'"><strong>'+escapeHtml(o.title||o.name)+'</strong><small>'+escapeHtml(subtitle)+'</small></button>';
  }).join("")+'</div>';
 }
 function detail(t,item){
  if(!item)return '<p>Данные уточняются.</p>';
  return '<div class="eyebrow">Карточка положения</div><h3>'+escapeHtml(item.name||item.title)+'</h3>'+
  (item.status?'<span class="status-line">'+escapeHtml(item.status)+'</span>':'')+
  (item.role?'<div class="entry"><b>Зачем это важно</b><p>'+escapeHtml(item.role)+'</p></div>':'')+
  (item.barrier?'<div class="entry"><b>Ограничение</b><p>'+escapeHtml(item.barrier)+'</p></div>':'')+
  (item.moves?'<div class="entry"><b>Что может предпринять игрок</b><p>'+escapeHtml(item.moves)+'</p></div>':'')+
  '<div class="soft-note"><b>Что отобразится после вердикта?</b><p>Изменится подтверждённый договор, должность, стадия процесса или правовой статус — только если соответствующий результат утверждён судьёй. Выбор карточки ничего не изменяет.</p></div>'+
  '<button type="button" class="outline-btn" data-compose="'+t.id+'">Подготовить вопросы для поста</button>'+
  '<div class="draft-host" id="draft-'+t.id+'" '+(!draftOpen[t.id]?'hidden':'')+'></div>';
 }
 function dossier(t){
  const v=valueOf(t);
  return '<div class="split"><section class="panel">'+
   '<div class="eyebrow">Участники и ситуации</div><h3>Что сейчас известно</h3>'+cards(t,t.items)+
   '<p class="fine">Историческое положение на начало 1955 года. Любая дальнейшая развилка зависит от решений игроков и судьи.</p></section>'+
   '<aside class="panel detail-panel">'+detail(t,v)+'</aside></div>';
 }
 function projectDetail(t,it){
  const selectedTool=t.tools.find(x=>x.id===toolSelected[t.id]);
  const checks=done[t.id+":"+it.id];
  return '<div class="eyebrow">Выбранная программа</div><h3>'+escapeHtml(it.title)+'</h3><span class="status-line">'+escapeHtml(it.tag)+'</span>'+
  '<div class="entry"><b>Отправная точка</b><p>'+escapeHtml(it.asset)+'</p></div>'+
  '<div class="entry"><b>Что мешает</b><p>'+escapeHtml(it.issue)+'</p></div>'+
  '<div class="entry"><b>Чем обернётся преждевременный запуск</b><p>'+escapeHtml(it.impact)+'</p></div>'+
  '<div class="section-title">Какую политику предложить?</div>'+
  '<div class="tool-options">'+t.tools.map(tool=>'<button type="button" class="tool-btn'+(tool.id===selectedTool.id?' active':'')+'" data-tool="'+tool.id+'" data-section="'+t.id+'"><strong>'+escapeHtml(tool.title)+'</strong><span>'+escapeHtml(tool.detail)+'</span></button>').join("")+'</div>'+
  '<div class="section-title">Что игрок намерен предусмотреть в посте</div>'+
  '<div class="check-list">'+it.conditions.map((c,i)=>'<label class="check-line"><input type="checkbox" data-condition="'+i+'" data-section="'+t.id+'" '+(checks.has(i)?'checked':'')+'><span>'+escapeHtml(c)+'</span></label>').join("")+'</div>'+
  '<p class="fine">Галочки означают только содержание проекта. Они не подтверждают исполнение, не создают ресурсы и не начисляют бонусы.</p>'+
  '<div class="draft-actions"><button type="button" class="primary-btn" data-compose="'+t.id+'">Сформировать черновик поста</button></div>'+
  '<div class="draft-host" id="draft-'+t.id+'" '+(!draftOpen[t.id]?'hidden':'')+'></div>';
 }
 function projects(t){
  return '<div class="split"><section class="panel"><div class="eyebrow">Программы для изучения</div><h3>Выбери направление</h3>'+cards(t,t.choices)+
   '<div class="soft-note"><b>Не обязательное меню действий</b><p>Игрок может предложить другую программу, которой нет в списке. Судья оценивает её по государственным ресурсам и реальным институтам.</p></div></section>'+
   '<aside class="panel detail-panel">'+projectDetail(t,valueOf(t))+'</aside></div>';
 }
 function mapTab(t){
  const v=valueOf(t),sc=t.scenarios?.find(s=>s.id===scenarioSelected[t.id]);
  return '<div class="split map-layout"><section class="panel map-panel"><div class="eyebrow">Географический справочник</div><h3>Регионы и хозяйственные узлы</h3>'+
   '<div class="geo-frame">'+mapSVG(t)+'</div>'+
   '<p class="fine">Контуры — современная упрощённая географическая подложка. Не являются юридическими границами января 1955 года, особенно в спорных районах.</p>'+
   cards(t,t.items)+'<div class="map-legend"><span><i class="pin"></i> Выбранный узел</span><span><i class="risk"></i> Затронут демонстрационным сценарием</span></div></section>'+
   '<aside class="panel detail-panel"><div class="eyebrow">Региональная карточка</div><h3>'+escapeHtml(v?.name||"")+'</h3>'+
   '<span class="status-line">'+escapeHtml(v?.status||"")+'</span>'+
   '<div class="entry"><b>В чём проблема</b><p>'+escapeHtml(v?.issue)+'</p></div>'+
   '<div class="entry"><b>Какие действия возможны</b><p>'+escapeHtml(v?.action)+'</p></div>'+
   '<div class="entry"><b>Важно помнить</b><p>'+escapeHtml(v?.note)+'</p></div>'+
   (t.scenarios?.length?'<div class="section-title">Проверить зависимость</div><div class="scenario-chips">'+t.scenarios.map(s=>'<button type="button" class="chip-btn'+(s.id===scenarioSelected[t.id]?' active':'')+'" data-scenario="'+s.id+'" data-section="'+t.id+'">'+escapeHtml(s.label)+'</button>').join("")+'</div>'+
    '<div class="scenario-result"><b>'+escapeHtml(sc?.label)+'</b><p>'+escapeHtml(sc?.detail)+'</p>'+
    '<small>'+(sc?.affected?.includes(v?.id)?'Выбранный регион напрямую отмечен в этом сценарии.':'Прямого воздействия в этой схеме не отмечено; косвенные последствия возможны.')+'</small></div>':'')+
   '<p class="fine">Выбор сценария — исследование риска, а не событие, которое автоматически случилось в игре.</p></aside></div>';
 }
 function allocation(t){
  const total=Object.values(alloc).reduce((a,b)=>a+b,0);
  const regions=t.items.map(x=>'<div class="allocation-row"><div class="allocation-top"><button type="button" data-select="'+x.id+'" data-section="'+t.id+'" class="allocation-name">'+escapeHtml(x.name)+'</button><strong>'+alloc[x.id]+'%</strong></div><div class="alloc-bar"><span style="width:'+alloc[x.id]+'%"></span></div><small>'+escapeHtml(x.needs)+'</small></div>').join("");
  const from=selected[t.id]||t.items[0].id;
  return '<div class="split"><section class="panel"><div class="eyebrow">Проект деления единого фонда</div><h3>Шесть получателей, сумма 100%</h3><div class="geo-frame">'+mapSVG(t)+'</div><p class="fine">Современные приблизительные контуры республик как географический ориентир; это не точная карта границ и полномочий 1955 года.</p>'+regions+
   '<div class="total-strip">Всего распределено <b>'+total+'%</b> · свободных дополнительных денег от изменения доли не появляется</div>'+
   '<p class="fine">'+escapeHtml(t.fundNote)+'</p></section>'+
   '<aside class="panel detail-panel"><div class="eyebrow">Перенос между республиками</div><h3>Каждое увеличение имеет источник</h3>'+
   '<label class="field-label" for="allocFrom">Уменьшить долю</label><select id="allocFrom">'+t.items.map(x=>'<option value="'+x.id+'" '+(x.id==="srb"?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join("")+'</select>'+
   '<label class="field-label" for="allocTo">Увеличить долю</label><select id="allocTo">'+t.items.map(x=>'<option value="'+x.id+'" '+(x.id==="bih"?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join("")+'</select>'+
   '<label class="field-label" for="allocAmount">Перенести процентных пунктов</label><select id="allocAmount"><option value="5">5 п.п.</option><option value="10">10 п.п.</option><option value="15">15 п.п.</option></select>'+
   '<button type="button" class="primary-btn" data-transfer="1">Перенести долю</button><div role="status" id="allocFeedback" class="soft-note">Распределение — пробная записка о приоритетах. Реальный фонд и правомочность утверждает судья.</div>'+
   '<div class="section-title">Зачем республике средства</div><div class="entry"><b>'+escapeHtml(valueOf(t)?.name)+'</b><p>'+escapeHtml(valueOf(t)?.needs)+'</p></div>'+
   '<div class="entry"><b>Вероятный спор</b><p>'+escapeHtml(valueOf(t)?.tension)+'</p></div>'+
   '<button type="button" class="outline-btn" data-reset-alloc="1">Восстановить демонстрационный фонд</button><br><button type="button" class="outline-btn" data-compose="'+t.id+'">Сформировать предложение по фонду</button><div class="draft-host" id="draft-'+t.id+'" '+(!draftOpen[t.id]?'hidden':'')+'></div></aside></div>';
 }
 function render(t){
  const pane=$("pane-"+t.id);if(!pane)return;
  const content=t.kind==="projects"?projects(t):t.kind==="map"?mapTab(t):t.kind==="allocation"?allocation(t):dossier(t);
  pane.innerHTML='<div class="section-header"><div class="eyebrow">'+escapeHtml(t.code)+'</div><h2>'+escapeHtml(t.headline)+'</h2><p>'+escapeHtml(t.intro)+'</p></div>'+content;
  if(draftOpen[t.id])displayDraft(t);
  window.VPI_COUNTRY_V2?.enhance?.(d,t,pane,{allocation:alloc,rerender:()=>render(t)});
 }
 function draftText(t){
  if(t.kind==="allocation"){
   return d.name+", 1955. ПРОЕКТ распределения федерального фонда.\n"+
    t.items.map(r=>r.name+": "+alloc[r.id]+"%").join("\n")+
    "\nСумма: 100%. Это условный план, не утверждённый бюджет. Уточнить реальный размер фонда, полномочия республиканских органов, проекты и согласование.";
  }
  if(t.kind==="projects"){
   const it=valueOf(t),tool=t.tools.find(x=>x.id===toolSelected[t.id]),checks=done[t.id+":"+it.id];
   return [d.name+", "+d.date+". ЧЕРНОВИК инициативы для литературного поста.","Предложение: "+it.title,"Исходная база: "+it.asset,
   "Важнейшее ограничение: "+it.issue,
   "Предпочитаемый способ: "+tool.title+" — "+tool.detail,
   "Что предполагается предусмотреть:",
   ...it.conditions.filter((_,i)=>checks.has(i)).map(x=>"• "+x),
   "Пока не раскрытые условия:",
   ...it.conditions.filter((_,i)=>!checks.has(i)).map(x=>"• "+x),
   "Возможная цена решения: "+it.impact,
   "Указать реальные объёмы, сроки, источники финансирования, согласие участников и правовые условия. Галочки не означают выполнение.",
   "Черновик НЕ подан и НЕ исполнен; судья рассматривает текст игрового поста."].join("\n");
  }
  const it=valueOf(t);
  return [d.name+", "+d.date+". Вопросы для возможного игрового поста.","Тема: "+it.name,"Исходное положение: "+it.status,
   "Интерес: "+it.role,"Юридические/экономические ограничения: "+it.barrier,
   "Возможное направление переговоров: "+it.moves,
   "Предусмотреть позиции других игроков и государств, финансирование и сроки. Изменение не происходит без судейского вердикта."].join("\n");
 }
 function displayDraft(t){
  const node=$("draft-"+t.id);if(!node)return;node.hidden=false;
  node.innerHTML='<label for="draft-text-'+t.id+'">Текст-помощник для поста</label><textarea id="draft-text-'+t.id+'" rows="11" readonly></textarea>'+
   '<button type="button" class="outline-btn" data-copy="'+t.id+'">Копировать текст</button><span class="copy-status" role="status" id="copy-status-'+t.id+'"></span>';
  $("draft-text-"+t.id).value=draftText(t);
 }
 function transfer(){
  const t=shares,from=$("allocFrom").value,to=$("allocTo").value,amount=Number($("allocAmount").value);
  if(!alloc||from===to||!Number.isFinite(amount)||amount<=0||alloc[from]<amount){
   $("allocFeedback").textContent="Укажите две разные республики и доступную долю у источника.";return;
  }
  alloc[from]-=amount;alloc[to]+=amount;
  selected[t.id]=to;render(t);
  $("allocFeedback").textContent="Изменено только ваше пробное распределение: "+amount+" п.п. из "+t.items.find(x=>x.id===from).name+" в "+t.items.find(x=>x.id===to).name+". Фонд по-прежнему равен 100%.";
 }
 async function copy(t){
  const field=$("draft-text-"+t.id),status=$("copy-status-"+t.id);
  try{
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(field.value);
   else{field.focus();field.select();if(!document.execCommand("copy"))throw Error("no clipboard")}
   status.textContent="Текст скопирован.";
  }catch(e){field.focus();field.select();status.textContent="Текст выделен — скопируйте вручную."}
 }
 // Event delegation keeps maps and cards functional after rerender, including on mobile.
 document.addEventListener("click",e=>{
  const tab=e.target.closest("[data-tab]");if(tab){openTab(tab.dataset.tab);return}
  const c=e.target.closest("[data-select],[data-map-id]");
  if(c){const tid=c.dataset.section;const t=d.tabs.find(x=>x.id===tid);if(!t)return;
   selected[tid]=c.dataset.select||c.dataset.mapId;render(t);return;}
  const tool=e.target.closest("[data-tool]");if(tool){toolSelected[tool.dataset.section]=tool.dataset.tool;render(d.tabs.find(x=>x.id===tool.dataset.section));return}
  const scene=e.target.closest("[data-scenario]");if(scene){scenarioSelected[scene.dataset.section]=scene.dataset.scenario;render(d.tabs.find(x=>x.id===scene.dataset.section));return}
  const compose=e.target.closest("[data-compose]");if(compose){const id=compose.dataset.compose;draftOpen[id]=true;displayDraft(d.tabs.find(x=>x.id===id));return}
  const copyBtn=e.target.closest("[data-copy]");if(copyBtn){copy(d.tabs.find(x=>x.id===copyBtn.dataset.copy));return}
  const t=e.target.closest("[data-transfer]");if(t){transfer();return}
  if(e.target.closest("[data-reset-alloc]")){shares.items.forEach(x=>alloc[x.id]=x.value);render(shares);$("allocFeedback").textContent="Демонстрационное распределение восстановлено (100%).";}
 });
 document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target.matches?.("[data-map-id]")){
   e.preventDefault();const tid=e.target.dataset.section;selected[tid]=e.target.dataset.mapId;render(d.tabs.find(x=>x.id===tid));
  }
 });
 document.addEventListener("change",e=>{
  if(e.target.matches("[data-condition]")){
   const id=e.target.dataset.section,it=selected[id],set=done[id+":"+it],idx=Number(e.target.dataset.condition);
   if(e.target.checked)set.add(idx);else set.delete(idx);
   if(draftOpen[id])displayDraft(d.tabs.find(x=>x.id===id));
  }
 });
 d.tabs.forEach(t=>render(t));
 const hash=location.hash.replace("#","");openTab(d.tabs.some(t=>t.id===hash)?hash:d.tabs[0].id);
})();