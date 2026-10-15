"use strict";
// USSR interface draft. All influence shares and national relationship labels are fictional UI fixtures.
(function(){
  var institutions=[
    {id:"presidium",name:"Президиум ЦК",subtitle:"Коллективные решения",parts:[43,37,20],summary:"Высшее коллективное партийное руководство. Коалиции и личные договорённости важнее одной должности.",access:"Поддержка крупных политических решений, ключевых кадровых перестановок и общего курса.",limit:"Нужны реальные союзники среди членов руководства. Один игрок не распоряжается всем Президиумом."},
    {id:"secretariat",name:"Секретариат ЦК",subtitle:"Партийные кадры",parts:[63,18,19],summary:"Организация партийной работы и кадровой политики. Важный источник влияния первого секретаря.",access:"Продвижение политических решений по партийной вертикали и влияние на назначения.",limit:"Партийный аппарат не заменяет Совет министров и хозяйственные ведомства."},
    {id:"sovmin",name:"Совет министров",subtitle:"Государственное управление",parts:[20,62,18],summary:"Исполнительный аппарат правительства и министерств.",access:"Подготовка и исполнение государственных программ, координация ведомств и бюджета.",limit:"Системные реформы требуют политического согласования и наличия ресурсов."},
    {id:"gosplan",name:"Госплан СССР",subtitle:"Плановая экономика",parts:[25,60,15],summary:"Подготовка и согласование государственных хозяйственных планов.",access:"Плановые приоритеты, ресурсные заявки, производственные задания.",limit:"План не создаёт металл, станки и рабочую силу из ничего."},
    {id:"army",name:"Вооружённые силы",subtitle:"Самостоятельный центр",parts:[25,33,42],summary:"Военное руководство имеет собственную иерархию и профессиональные интересы.",access:"Влияние на оборонные реформы, назначения и стратегические программы при наличии полномочий.",limit:"Не является личным инструментом борьбы за партийную должность."},
    {id:"security",name:"КГБ",subtitle:"Органы госбезопасности",parts:[35,25,40],summary:"С 1954 года действует Комитет государственной безопасности при Совете министров СССР.",access:"Исполнение законных для игрового режима задач безопасности и работа профильного аппарата.",limit:"Политическое решение не означает автоматическое бесконтрольное подчинение руководства органов."},
    {id:"regions",name:"Партийные организации",subtitle:"Республики и области",parts:[53,25,22],summary:"Региональный партийный аппарат способен поддерживать или тормозить кадровую политику центра.",access:"Организация исполнения директив и работа с партийными кадрами на местах.",limit:"Региональные интересы, хозяйственная ситуация и местные руководители влияют на выполнение решений."}
  ];
  var figures=[
    {id:"khrushchev",name:"Никита Хрущёв",caption:"Первый секретарь ЦК",detail:"Первый секретарь ЦК КПСС. В игре предполагается один из двух основных игроков СССР. Полномочия партийного руководителя сильны, но требуют поддержки руководящих органов."},
    {id:"malenkov",name:"Георгий Маленков",caption:"Председатель Совмина",detail:"Председатель Совета министров СССР на 1 января 1955 года. Второй основной игрок, связанный с правительственным управлением и хозяйственной повесткой. Историческая отставка февраля 1955 года не обязательна для игры."},
    {id:"molotov",name:"Вячеслав Молотов",caption:"Глава МИД",detail:"Опытный участник высшего советского руководства, министр иностранных дел. Его собственные позиции не следует автоматически записывать в лагерь одного из игроков."},
    {id:"bulganin",name:"Николай Булганин",caption:"Военное руководство",detail:"В начале 1955 года возглавляет Министерство обороны. Может быть важным участником кадровых и государственных коалиций; последующие назначения определяются игровым ходом."},
    {id:"mikoyan",name:"Анастас Микоян",caption:"Хозяйственное руководство",detail:"Один из заметных руководителей советского государства с большим опытом хозяйственного администрирования. Его поддержка зависит от содержания конкретного решения."},
    {id:"kaganovich",name:"Лазарь Каганович",caption:"Государственный аппарат",detail:"Влиятельный участник высшего руководства, тесно связанный с хозяйственной и аппаратной системой. Не является автоматическим голосом одной фракции."},
    {id:"zhukov",name:"Георгий Жуков",caption:"Военная элита",detail:"В начале 1955 года занимает должность первого заместителя министра обороны. Военная поддержка зависит от реальных должностей, приказов и интересов армии."}
  ];
  var bloc=[
    {id:"gdr",name:"ГДР",flag:"🇩🇪",desc:"Германское направление",relation:"Тесная зависимость*",pressure:"Сохраняются противоречия*",context:"Немецкий вопрос и положение Берлина делают ГДР важнейшим стратегическим направлением. При оценке устойчивости полезно учитывать события 1953 года.",checks:["Права советских войск и доступ к объектам","Экономическая помощь и её реальные поставки","Решения руководства ГДР и реакция общества"],event:"Историческая развилка: воссоединение Германии, положение Берлина и устойчивость власти ГДР не предопределены."},
    {id:"pol",name:"Польша",flag:"🇵🇱",desc:"Коммуникации и политика",relation:"Близкие отношения*",pressure:"Внутренние противоречия*",context:"Польша — ключевое звено сухопутных коммуникаций, со своей историей и национальными интересами. Сотрудничество не означает полного отсутствия самостоятельной политики.",checks:["Действующие военные и транзитные соглашения","Снабжение и экономические обязательства","Положение в партии и обществе"],event:"Польские политические кризисы могут возникать из собственных внутренних процессов, а не по обязательному историческому расписанию."},
    {id:"cze",name:"Чехословакия",flag:"🇨🇿",desc:"Промышленная кооперация",relation:"Развитое сотрудничество*",pressure:"Относительная устойчивость*",context:"Крупная индустриальная и оборонно-промышленная база. Кооперация может быть ценной для СССР, если учтены мощности и потребности самой страны.",checks:["Торговые и производственные соглашения","Реальные поставки и технологические программы","Политические позиции руководства"],event:"Развитость промышленности не означает, что любые дополнительные военные поставки можно выполнить без перераспределения ресурсов."},
    {id:"hun",name:"Венгрия",flag:"🇭🇺",desc:"Реформы и напряжение",relation:"Зависимость от Москвы*",pressure:"Политическая напряжённость*",context:"Конфликты вокруг курса руководства, хозяйственные трудности и вопросы реформ создают сложную ситуацию. Лояльность правительства и отношение общества нужно оценивать отдельно.",checks:["Персональный состав руководства и внутрипартийные споры","Экономическая ситуация и социальные требования","Присутствие советских войск и правовой статус"],event:"Сценарий венгерского кризиса: реформы, протесты и сопротивление могут развиться, но восстание 1956 года не должно возникать автоматически."},
    {id:"rou",name:"Румыния",flag:"🇷🇴",desc:"Балканские интересы",relation:"Сотрудничество*",pressure:"Вопросы самостоятельности*",context:"Экономическая и военная связь с СССР сочетается с интересами местного руководства. Степень самостоятельности может меняться в ходе партии.",checks:["Базы и статус военного присутствия","Обязательства по поставкам и помощи","Политика правящей партии"],event:"Изменение советских военных обязательств способно повлиять на дипломатические позиции местного руководства."},
    {id:"bgr",name:"Болгария",flag:"🇧🇬",desc:"Балканское направление",relation:"Близкое сотрудничество*",pressure:"Локальные противоречия*",context:"Сотрудничество с СССР важно для обороны и модернизации; отдельно учитываются местные политические и хозяйственные потребности.",checks:["Военная подготовка и совместные программы","Торговля и экономическая помощь","Балканская дипломатическая обстановка"],event:"Устойчивость союза определяется практическими договорённостями и внутренними условиями, а не одной универсальной шкалой."},
    {id:"alb",name:"Албания",flag:"🇦🇱",desc:"Изолированная логистика",relation:"Союзническая ориентация*",pressure:"Зависимость от внешней помощи*",context:"Удалённое положение усложняет военное снабжение и инфраструктурные программы. Руководство Албании сохраняет собственные интересы.",checks:["Морская логистика и возможности снабжения","Потребности в военной и экономической помощи","Двусторонние договорённости"],event:"Укрепление присутствия требует реальной логистики, политических договорённостей и ресурсов."}
  ];
  var planData=[
    {id:"industry",name:"Тяжёлая промышленность",desc:"Станки, металл, энергетика, новые заводы",value:35,color:"#337c77"},
    {id:"defense",name:"Оборонные программы",desc:"Военное производство, техника и инфраструктура",value:25,color:"#ba8550"},
    {id:"agriculture",name:"Село и механизация",desc:"Техника, транспорт и сельскохозяйственная база",value:20,color:"#7e9a60"},
    {id:"civil",name:"Товары и жильё",desc:"Потребительское снабжение, жильё, инфраструктура",value:20,color:"#7e92b4"}
  ];
  var $=function(id){return document.getElementById(id)};
  function safe(text){return String(text).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function switchTab(name){
    document.querySelectorAll(".tab").forEach(function(el){var active=el.dataset.tab===name;el.classList.toggle("is-active",active);el.setAttribute("aria-selected",String(active))});
    document.querySelectorAll(".pane").forEach(function(el){var active=el.id===name;el.classList.toggle("is-active",active);el.hidden=!active});
    if(history.replaceState)history.replaceState(null,"","#"+name);
  }
  document.querySelectorAll(".tab").forEach(function(el){el.addEventListener("click",function(){switchTab(el.dataset.tab)})});
  var initialHash=location.hash.slice(1);
  if(["politics","gosplan","bloc"].indexOf(initialHash)>=0)switchTab(initialHash);

  function renderInstitutions(){
    $("institutions").innerHTML=institutions.map(function(x){return '<button class="institution" type="button" data-institution="'+x.id+'" aria-pressed="false"><span class="inst-title">'+safe(x.name)+'</span><div class="inst-track" aria-hidden="true"><span class="p" style="width:'+x.parts[0]+'%"></span><span class="g" style="width:'+x.parts[1]+'%"></span><span class="o" style="width:'+x.parts[2]+'%"></span></div><small>'+safe(x.subtitle)+'</small></button>'}).join("");
    document.querySelectorAll("[data-institution]").forEach(function(el){el.addEventListener("click",function(){selectInstitution(el.dataset.institution)})});
    selectInstitution("presidium");
  }
  function selectInstitution(id){
    var v=institutions.find(function(x){return x.id===id});if(!v)return;
    document.querySelectorAll("[data-institution]").forEach(function(el){var active=el.dataset.institution===id;el.classList.toggle("is-active",active);el.setAttribute("aria-pressed",String(active))});
    $("instName").textContent=v.name;$("instSummary").textContent=v.summary;
    var names=["Партийная группа","Правительственная группа","Другие центры"];
    var colors=["var(--party)","var(--gov)","var(--third)"];
    $("instBars").innerHTML=v.parts.map(function(p,i){return '<div class="influence-row"><div class="influence-label"><span>'+names[i]+'</span><b>'+p+'%</b></div><div class="inst-track"><span style="width:'+p+'%;background:'+colors[i]+'"></span></div></div>'}).join("");
    $("instAccess").textContent=v.access;$("instLimit").textContent=v.limit;
  }
  function selectFigure(id){
    var f=figures.find(function(x){return x.id===id});if(!f)return;
    document.querySelectorAll("[data-figure]").forEach(function(el){el.classList.toggle("is-active",el.dataset.figure===id);el.setAttribute("aria-pressed",String(el.dataset.figure===id))});
    document.querySelectorAll("[data-leader]").forEach(function(el){el.classList.toggle("is-active",el.dataset.leader===id)});
    $("figureDetail").innerHTML="<strong>"+safe(f.name)+"</strong><p>"+safe(f.detail)+"</p>";
  }
  $("figureButtons").innerHTML=figures.map(function(f){return '<button type="button" class="figure-button" data-figure="'+f.id+'" aria-pressed="false"><b>'+safe(f.name)+'</b><small>'+safe(f.caption)+'</small></button>'}).join("");
  document.querySelectorAll("[data-figure]").forEach(function(el){el.addEventListener("click",function(){selectFigure(el.dataset.figure)})});
  document.querySelectorAll("[data-leader]").forEach(function(el){el.addEventListener("click",function(){selectFigure(el.dataset.leader)})});
  selectFigure("khrushchev");renderInstitutions();

  function redistribute(id,newValue){
    var i=planData.findIndex(function(x){return x.id===id});if(i<0)return;
    var v=Math.max(0,Math.min(100,5*Math.round(Number(newValue)/5)));
    var rest=planData.filter(function(x){return x.id!==id});
    var previousRest=rest.reduce(function(s,x){return s+x.value},0);
    var unitCount=(100-v)/5;
    var weights=rest.map(function(x){return previousRest?x.value/previousRest:1/3});
    var exact=weights.map(function(w){return w*unitCount});
    var units=exact.map(Math.floor);
    var spare=unitCount-units.reduce(function(s,x){return s+x},0);
    var ranking=exact.map(function(n,k){return {k:k,rem:n-units[k]}}).sort(function(a,b){return b.rem-a.rem||a.k-b.k});
    for(var j=0;j<spare;j++)units[ranking[j].k]++;
    rest.forEach(function(x,j){x.value=units[j]*5});planData[i].value=v;
    renderPlan();
  }
  function signals(){
    var v=Object.fromEntries(planData.map(function(x){return [x.id,x.value]}));
    var rows=[];
    function add(label,body,kind){rows.push({label:label,body:body,kind:kind||""})}
    if(v.defense>=35&&v.industry<25)add("Узкое место для обороны","Высокий приоритет оборонных программ при слабом расширении промышленной базы. Судье стоит проверить станки, металл и сроки.","warn");
    else if(v.defense>=30&&v.industry>=30)add("Военный курс подкреплён промышленностью","Больше возможностей для долгосрочных заказов, но нужны реальные мощности и квалифицированные кадры.","good");
    else add("Военное производство","Приоритет обороны не означает автоматический прирост численности армии или техники.");
    if(v.industry<20)add("Промышленный резерв сокращён","В дальнейшем расширение гражданских и оборонных мощностей может упереться в недостаток оборудования.","warn");
    else if(v.industry>=35)add("Ставка на производственную базу","Промышленное развитие поддерживает будущие отраслевые проекты, но обычно требует времени и ресурсов.","good");
    if(v.civil<=15)add("Риск потребительского дефицита","Слабый приоритет жилья и товаров может усиливать социальное недовольство, если выпуск не компенсирован другими мерами.","warn");
    else if(v.civil>=35)add("Упор на уровень жизни","Можно улучшать снабжение и жильё, но часть долгосрочных инвестиций отвлекается от других отраслей.","good");
    else add("Потребительское снабжение","Устойчивость зависит не только от инвестиций, но и от реального выпуска и распределения.");
    if(v.agriculture<15)add("Внимание к селу недостаточно","Риск нехватки продовольствия и сельскохозяйственной техники при неблагоприятном урожае.","warn");
    else if(v.agriculture>=30)add("Аграрная модернизация","Может укреплять продовольственную базу после ввода техники и завершения сельскохозяйственных сезонов.","good");
    else add("Сельское хозяйство","Значение имеют урожай, техника, стимулы и продовольственные запасы.");
    return rows.slice(0,5);
  }
  function renderPlan(){
    if(!$("planControls").hasChildNodes()){
    $("planControls").innerHTML=planData.map(function(x){return '<div class="plan-row"><div class="plan-row-top"><label for="slider-'+x.id+'">'+safe(x.name)+'</label><span class="value" style="color:'+x.color+'">'+x.value+'</span></div><div class="plan-row-desc">'+safe(x.desc)+'</div><input type="range" min="0" max="100" step="5" value="'+x.value+'" id="slider-'+x.id+'" data-plan="'+x.id+'" aria-label="Условные инвестиционные единицы: '+safe(x.name)+'"></div>'}).join("");
    document.querySelectorAll("[data-plan]").forEach(function(el){el.addEventListener("input",function(){redistribute(el.dataset.plan,el.value)})});
    } else {
      planData.forEach(function(x){
        var slider=$("slider-"+x.id);
        if(slider)slider.value=x.value;
        var counter=slider&&slider.closest(".plan-row").querySelector(".value");
        if(counter)counter.textContent=x.value;
      });
    }
    $("planTotal").textContent=planData.reduce(function(a,b){return a+b.value},0);
    $("allocationTrack").innerHTML=planData.map(function(x){return '<span style="width:'+x.value+'%;background:'+x.color+'" title="'+safe(x.name)+' — '+x.value+'"></span>'}).join("");
    $("planSignals").innerHTML=signals().map(function(x){return '<div class="signal '+x.kind+'"><strong>'+safe(x.label)+'</strong><p>'+safe(x.body)+'</p></div>'}).join("");
  }
  $("resetPlan").addEventListener("click",function(){[35,25,20,20].forEach(function(v,i){planData[i].value=v});renderPlan()});
  renderPlan();

  $("blocCards").innerHTML=bloc.map(function(x){return '<button type="button" class="bloc-card" data-country="'+x.id+'" aria-pressed="false"><span class="flag">'+x.flag+'</span><span class="bloc-meta"><strong>'+safe(x.name)+'</strong><small>'+safe(x.desc)+'</small></span></button>'}).join("");
  document.querySelectorAll("[data-country]").forEach(function(el){el.addEventListener("click",function(){selectCountry(el.dataset.country)})});
  function selectCountry(id){
    var x=bloc.find(function(y){return y.id===id});if(!x)return;
    document.querySelectorAll("[data-country]").forEach(function(el){var active=el.dataset.country===id;el.classList.toggle("is-active",active);el.setAttribute("aria-pressed",String(active))});
    $("countryFlag").textContent=x.flag;$("countryName").textContent=x.name;$("countryRelation").textContent=x.relation;$("countryPressure").textContent=x.pressure;
    $("countryContext").textContent=x.context;
    $("countryChecklist").innerHTML=x.checks.map(function(t){return "<li>"+safe(t)+"</li>"}).join("");
    $("countryCrisis").innerHTML="<strong>Потенциальная развилка</strong>"+safe(x.event);
  }
  selectCountry("hun");
})();