"use strict";
/* VPI1955 – France 1956 proposed coalition, UI only. No canonical data mutations. */
(function(){
 const root=document.getElementById("fco1956");
 if(!root)return;
 const factions=[
  {id:"gaullists",name:"Голлисты",seats:89,color:"#537d9c",sub:"Безопасность · промышленность",ministers:["Жак Шабан-Дельмас — внутренние дела","Пьер Кёниг — национальная оборона","Эдуар Корнильон-Молинье — промышленность и торговля","Морис Кув де Мюрвиль — иностранные дела (кандидат де Голля)"],ideas:"Сильная исполнительная власть, суверенитет, оборона и промышленная модернизация.",deal:"Возвращение генерала к руководству кабинетом и перспектива законной конституционной реформы.",risk:"Расходы на оборону и промышленность необходимо согласовывать с финансовым ведомством радикалов. Перемены в Конституции требуют согласия MRP и других фракций."},
  {id:"mrp",name:"MRP",seats:86,color:"#b78b46",sub:"Конституция · Европа",ministers:["Робер Лекур — юстиция","Пьер-Анри Тетжен — заморские территории"],ideas:"Парламентские гарантии, европейская интеграция, союзнические обязательства и правовые реформы.",deal:"Де Голль обязуется действовать в рамках Конституции и сохранять европейский курс.",risk:"Конституционная реформа не должна обойти парламент. По Алжиру партия требует соблюдения правовых гарантий; Министерство заморских территорий не управляет алжирскими департаментами напрямую."},
  {id:"radicals",name:"Радикалы",seats:60,color:"#9971a0",sub:"Финансы · образование",ministers:["Эдгар Фор — финансы и экономика","Жан Бертуэн — национальное образование"],ideas:"Финансовая устойчивость, республиканские свободы, умеренный реформизм и парламентский контроль.",deal:"Получают ключевой финансовый портфель и право участвовать в согласовании правительственной программы.",risk:"Крупные государственные расходы требуют сметы и бюджетной процедуры. Радикалы не едины по Алжиру и усилению исполнительной власти."},
  {id:"cnip",name:"CNIP",seats:88,color:"#579179",sub:"Частный сектор · аграрии",ministers:["Жан Сурбе — сельское хозяйство"],ideas:"Финансовая дисциплина, защита предпринимателей и сельского хозяйства, сохранение французских позиций в Алжире.",deal:"Поддержка курса на стабильность, экономическую осторожность и представительство в правительстве.",risk:"Крупный парламентский блок имеет только один министерский портфель. Меры по налогам, аграрным субсидиям и статусу Алжира требуют постоянных переговоров."}
 ];
 const issues=[
  {id:"algeria",title:"Алжир",common:"Все участники хотят восстановить безопасность и управляемость.",friction:"Голлисты и CNIP сильнее акцентируют суверенитет и безопасность, радикалы и MRP — политические преобразования и правовые гарантии. Оборона и МВД требуют финансирования от министра Фора."},
  {id:"constitution",title:"Конституция",common:"Союзники признают необходимость более устойчивых правительств; Мишель Дебре готовит предложения.",friction:"Голлисты выступают за более сильную исполнительную власть, MRP и радикалы требуют сохранить реальную роль парламента. Одного решения премьера для изменения Конституции недостаточно."},
  {id:"budget",title:"Бюджет",common:"Партии согласны с необходимостью экономической модернизации и разумных государственных финансов.",friction:"Финансовое ведомство возглавляет радикал Эдгар Фор; CNIP защищает частный сектор и налоговую умеренность; голлисты добиваются ресурсов для обороны и промышленности."},
  {id:"europe",title:"Европа",common:"Члены коалиции согласились сохранять международные обязательства Франции.",friction:"MRP настаивает на дальнейшем европейском сотрудничестве, а голлисты требуют учитывать суверенитет страны. Внешняя политика остаётся в ведении главы правительства и назначенного им министра."}
 ];
 const own=323, total=626;
 const partyContainer=root.querySelector("[data-fco-parties]"), detail=root.querySelector("[data-fco-detail]"), topics=root.querySelector("[data-fco-topics]"), issueBox=root.querySelector("[data-fco-issue]");
 const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 root.querySelector("[data-fco-bar]").innerHTML=factions.map(f=>'<span title="'+safe(f.name)+' — '+f.seats+' мест" style="flex:'+f.seats+';background:'+f.color+'"></span>').join("")+'<span style="flex:'+(total-own)+';background:#e1e9e5" title="Вне правительственной коалиции — '+(total-own)+' мест"></span>';
 partyContainer.innerHTML=factions.map(f=>'<button type="button" class="fco-party" data-fco-party="'+f.id+'" aria-pressed="false"><span class="fco-party-top"><i class="fco-dot" style="background:'+f.color+'"></i><span class="fco-party-count">'+f.seats+'</span></span><span class="fco-party-name">'+safe(f.name)+'</span><span class="fco-party-sub">'+safe(f.sub)+'</span></button>').join("");
 let activeParty="gaullists", activeIssue="algeria";
 function renderParty(){
  const f=factions.find(x=>x.id===activeParty);
  partyContainer.querySelectorAll("[data-fco-party]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.fcoParty===activeParty)));
  detail.innerHTML='<div class="fco-detail-card"><span class="fco-eyebrow">Министерства и ведомства</span><h4>'+safe(f.name)+'</h4><ul class="fco-ministers">'+f.ministers.map(m=>'<li>'+safe(m)+'</li>').join("")+'</ul><b>Основные идеи</b><p>'+safe(f.ideas)+'</p></div><div class="fco-detail-card fco-accent" style="border-left-color:'+f.color+'"><span class="fco-eyebrow">Политическое досье</span><h4>'+f.seats+' депутатов коалиции</h4><b>Почему поддерживают кабинет</b><p>'+safe(f.deal)+'</p><b>Когда возникнут разногласия</b><p>'+safe(f.risk)+'</p></div>';
 }
 function renderIssue(){
  topics.querySelectorAll("[data-fco-issue]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.fcoIssue===activeIssue)));
  const i=issues.find(x=>x.id===activeIssue);
  issueBox.innerHTML='<div><b>Общая позиция</b><p>'+safe(i.common)+'</p></div><div><b>Что придётся согласовывать</b><p>'+safe(i.friction)+'</p></div>';
 }
 topics.innerHTML=issues.map(i=>'<button type="button" data-fco-issue="'+i.id+'" aria-pressed="false">'+safe(i.title)+'</button>').join("");
 partyContainer.addEventListener("click",e=>{const b=e.target.closest("[data-fco-party]");if(!b)return;activeParty=b.dataset.fcoParty;renderParty()});
 topics.addEventListener("click",e=>{const b=e.target.closest("[data-fco-issue]");if(!b)return;activeIssue=b.dataset.fcoIssue;renderIssue()});
 renderParty();renderIssue();
})();
