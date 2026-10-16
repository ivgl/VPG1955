"use strict";
// USSR interface draft. All influence percentages, bloc scores and budget shares are fictional, non-canonical UI fixtures.
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
  // NPC links are descriptive and dynamic: no figure has permanently guaranteed alignment.
  var peopleByInstitution={
    presidium:["molotov","mikoyan","kaganovich","bulganin"],
    secretariat:["suslov"],
    sovmin:["bulganin","mikoyan","kaganovich"],
    gosplan:["saburov"],
    army:["bulganin","zhukov"],
    security:["serov"],
    regions:["furtseva"]
  };
  var figures=[
    {id:"molotov",name:"Вячеслав Молотов",caption:"МИД · Президиум ЦК",view:"Осторожность во внешней политике, защита преемственности и сильной роли высшего партийного руководства.",interaction:"Дипломатические инициативы, кадровые коалиции, вопросы международного курса.",detail:"Министр иностранных дел и влиятельный член Президиума ЦК. Способен поддержать или оспорить инициативу независимо от должности её автора."},
    {id:"bulganin",name:"Николай Булганин",caption:"Министр обороны · Совмин",view:"Сочетает интересы государственных органов и военного управления, ориентируется на исполнимость решений и коалиции руководства.",interaction:"Оборонная политика, назначения, распределение полномочий.",detail:"На 1 января 1955 года — министр обороны СССР. Его последующие назначения в альтернативной игре не предрешены."},
    {id:"mikoyan",name:"Анастас Микоян",caption:"Совмин · Президиум ЦК",view:"Прагматичное хозяйственное управление, торговля и практическая осуществимость преобразований.",interaction:"Реформы хозяйства, снабжение, торговые переговоры и поиск компромиссов.",detail:"Опытный руководитель, связанный с экономическими ведомствами и высшей политикой. Его позиция зависит от содержания проекта."},
    {id:"kaganovich",name:"Лазарь Каганович",caption:"Совмин · Президиум ЦК",view:"Сильная административная дисциплина, приоритет управляемости и опыт отраслевого хозяйственного руководства.",interaction:"Промышленная политика, министерства, кадровые назначения.",detail:"Влиятельный участник высшего руководства. Его нельзя автоматически считать постоянным союзником или противником конкретного игрока."},
    {id:"suslov",name:"Михаил Суслов",caption:"Секретарь ЦК КПСС",view:"Партийная дисциплина, идеологическая последовательность и контроль политической линии.",interaction:"Партийные решения, идеологическая аргументация и кадровая поддержка.",detail:"Секретарь ЦК. Его политические предпочтения учитываются как ориентир, но не дают автоматического согласия на любую инициативу."},
    {id:"saburov",name:"Максим Сабуров",caption:"Председатель Госплана",view:"Реалистичность плановых заданий, баланс ресурсов и промышленное развитие; исторически сближался с Хрущёвым, но не связан обязательной игровой лояльностью.",interaction:"Пятилетний план, межотраслевой баланс, техническое исполнение программ.",detail:"Возглавляет Госплан на 1 января 1955 года. Историческая реорганизация плановых органов позднее в 1955 году не происходит автоматически."},
    {id:"zhukov",name:"Георгий Жуков",caption:"Первый замминистра обороны",view:"Боеспособность армии, профессиональное военное руководство и реальные возможности вооружённых сил.",interaction:"Военные реформы, готовность армии, кадровые вопросы Министерства обороны.",detail:"Первый заместитель министра обороны в начале 1955 года. Военный авторитет не равен бесконтрольному управлению армией."},
    {id:"serov",name:"Иван Серов",caption:"Председатель КГБ",view:"Сохранение управляемости органов безопасности и контроль исполнения поручений руководства.",interaction:"Государственная безопасность, назначение руководителей, аппаратное согласование.",detail:"Председатель КГБ при Совете министров СССР с 1954 года. Его действия ограничены полномочиями и решениями компетентных органов."},
    {id:"furtseva",name:"Екатерина Фурцева",caption:"Московский горком КПСС",view:"Работа с местным партийным аппаратом, кадровое продвижение и организация решений в крупном политическом центре.",interaction:"Региональная партийная поддержка, кадровые назначения, выполнение директив.",detail:"С ноября 1954 года — первый секретарь Московского городского комитета партии. Была близка к Хрущёву, но её поддержка не гарантируется автоматически."}
  ];
  // Scores below are NOT historical estimates. Replace only after moderator approves public initial state.
  var bloc=[
    {id:"gdr",name:"ГДР",flag:"🇩🇪",desc:"Германское направление",relation:76,stability:48,context:"Опорное направление советских войск в Центральной Европе, тесно связанное с СССР и германским вопросом.",specialty:"Стратегическая глубина на центральноевропейском направлении, железнодорожная и промышленная инфраструктура.",near:"Общественное недовольство после событий 1953 года и поддержание управляемости хозяйства.",long:"Германский вопрос, зависимость от советского военного присутствия, необходимость экономической устойчивости."},
    {id:"pol",name:"Польша",flag:"🇵🇱",desc:"Сухопутные коммуникации",relation:74,stability:58,context:"Крупный западный партнёр СССР с тесной военно-политической связью и значимыми национальными интересами.",specialty:"Сухопутный коридор в Центральную Европу, промышленная база, транспорт и снабжение.",near:"Внутрипартийные противоречия и хозяйственные запросы общества.",long:"Согласование интересов Москвы с национальной политикой и экономической самостоятельностью."},
    {id:"cze",name:"Чехословакия",flag:"🇨🇿",desc:"Индустриальная база",relation:82,stability:72,context:"Промышленно развитое социалистическое государство, связанное с СССР военной и экономической кооперацией.",specialty:"Станкостроение, машиностроение, вооружения и опыт промышленного сотрудничества.",near:"Баланс собственных производственных потребностей и согласованных внешних заказов.",long:"Модернизация индустрии, социальные ожидания и устойчивость планового хозяйства."},
    {id:"hun",name:"Венгрия",flag:"🇭🇺",desc:"Дунайский узел",relation:66,stability:37,context:"Советское влияние велико, но политические противоречия в руководстве и вопросы экономической политики требуют внимания.",specialty:"Дунайские коммуникации, промышленность и транспортное положение в центре региона.",near:"Споры о реформах, уровень жизни и доверие к правительству.",long:"Отношения центра и общества, самостоятельность политического курса и риск нарастания кризиса. Восстание в 1956 году не предрешено."},
    {id:"rou",name:"Румыния",flag:"🇷🇴",desc:"Нефть и Чёрное море",relation:72,stability:64,context:"Политическое и военное сотрудничество с СССР сочетается с собственными интересами румынского руководства.",specialty:"Нефтяной сектор, черноморское направление, логистика и промышленная кооперация.",near:"Согласование военного присутствия, поставок и отраслевых потребностей.",long:"Расширение самостоятельности руководства и определение условий экономической зависимости."},
    {id:"bgr",name:"Болгария",flag:"🇧🇬",desc:"Южный фланг",relation:83,stability:71,context:"Близкое сотрудничество с Москвой на балканском направлении при наличии самостоятельных внутренних задач.",specialty:"Южное стратегическое направление, сельскохозяйственные поставки и региональные коммуникации.",near:"Модернизация экономики и выполнение конкретных договорённостей.",long:"Балканский баланс сил, индустриализация и устойчивость внутренних институтов."},
    {id:"alb",name:"Албания",flag:"🇦🇱",desc:"Адриатическое направление",relation:75,stability:62,context:"Союзническая ориентация на СССР при географической изолированности и ограниченных внутренних ресурсах.",specialty:"Адриатическое побережье и потенциальные точки морского взаимодействия — только при согласованных правах доступа.",near:"Нехватка кадров, оборудования и сложности снабжения.",long:"Высокая зависимость от помощи и удалённость от основных советских коммуникаций."}
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
    $("institutionPeople").innerHTML=(peopleByInstitution[id]||[]).map(function(personId){var f=figures.find(function(x){return x.id===personId});return f?'<button class="person-chip" type="button" data-person="'+safe(f.id)+'">'+safe(f.name)+' <span aria-hidden="true">↗</span></button>':""}).join("");
    document.querySelectorAll("[data-person]").forEach(function(el){el.addEventListener("click",function(){selectFigure(el.dataset.person);$("figureDetail").scrollIntoView({behavior:"smooth",block:"nearest"})})});
  }
  function selectFigure(id){
    var f=figures.find(function(x){return x.id===id});if(!f)return;
    document.querySelectorAll("[data-figure]").forEach(function(el){el.classList.toggle("is-active",el.dataset.figure===id);el.setAttribute("aria-pressed",String(el.dataset.figure===id))});
    document.querySelectorAll("[data-leader]").forEach(function(el){el.classList.toggle("is-active",el.dataset.leader===id)});
    $("figureDetail").innerHTML="<strong>"+safe(f.name)+"</strong><p>"+safe(f.detail)+"</p><div class='figure-position'><b>Взгляды и интересы</b><p>"+safe(f.view)+"</p></div><div class='figure-position'><b>О чём можно договариваться</b><p>"+safe(f.interaction)+"</p></div>";
  }
  $("figureButtons").innerHTML=figures.map(function(f){return '<button type="button" class="figure-button" data-figure="'+f.id+'" aria-pressed="false"><b>'+safe(f.name)+'</b><small>'+safe(f.caption)+'</small></button>'}).join("");
  document.querySelectorAll("[data-figure]").forEach(function(el){el.addEventListener("click",function(){selectFigure(el.dataset.figure)})});
  document.querySelectorAll("[data-leader]").forEach(function(el){el.addEventListener("click",function(){var who=el.dataset.leader;document.querySelectorAll("[data-leader]").forEach(function(other){other.classList.toggle("is-active",other===el)});selectInstitution(who==="khrushchev"?"secretariat":"sovmin")})});
  selectFigure("molotov");renderInstitutions();

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
  function updateDependencies(){
    var v=Object.fromEntries(planData.map(function(x){return [x.id,x.value]}));
    var rows=[
      ["Металл, энергетика и станки","Поставляют оборудование обороне, сельскому хозяйству и гражданским заводам.",v.industry],
      ["Вооружения и оборонные программы","Нужны не только заявки обороны, но и металл, комплектующие, инженеры.",Math.min(v.defense,v.industry)],
      ["Тракторостроение и аграрная техника","Требуют мощностей тяжёлой промышленности и вложений в село.",Math.min(v.agriculture,v.industry)],
      ["Производство товаров и строительство","Потребительская отрасль нуждается в машинах, энергии и транспорте.",Math.min(v.civil,v.industry)]
    ];
    $("industryDependencies").innerHTML=rows.map(function(r){
      return '<div class="industry-link"><strong>'+safe(r[0])+'</strong><span>'+safe(r[1])+'</span><small>Меньший из связанных приоритетов: '+r[2]+'/100 условных единиц (не физический выпуск)</small></div>';
    }).join("");
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
    updateDependencies();
  }
  $("resetPlan").addEventListener("click",function(){[35,25,20,20].forEach(function(v,i){planData[i].value=v});renderPlan()});
  renderPlan();

  // Text is generated locally and never submitted to the judge.
  function planMessage(){
    var lines=[
      "СССР, 1955 год. Проект предложения Госплану (не утверждённая заявка).",
      "Предлагаю перераспределить 100% условного объёма НОВЫХ капиталовложений:",
      ...planData.map(function(x){return "— "+x.name+": "+x.value+"%"}),
      "",
      "Прошу согласовать объём реальных вложений в G$, источники финансирования, сроки, материалы, инженерные кадры и производственные мощности.",
      "Приоритеты не означают гарантированного роста выпуска и не заменяют действующие программы.",
      "Предполагаемые конкретные проекты, исполнители и сроки: [указать в игровом посте]."
    ];
    return lines.join("\n");
  }
  $("generatePlan").addEventListener("click",function(){
    $("planDraftText").value=planMessage();
    $("draftOutput").hidden=false;
    $("copyPlanStatus").textContent="";
  });
  // An edited distribution invalidates a previously generated snapshot.
  document.querySelectorAll("[data-plan]").forEach(function(el){el.addEventListener("input",function(){if(!$("draftOutput").hidden){$("planDraftText").value=planMessage();$("copyPlanStatus").textContent="Текст пересчитан."}})});
  $("resetPlan").addEventListener("click",function(){if(!$("draftOutput").hidden){$("planDraftText").value=planMessage();$("copyPlanStatus").textContent="Текст пересчитан."}});
  $("copyPlan").addEventListener("click",async function(){
    var value=$("planDraftText").value;
    try {
      if(navigator.clipboard&&navigator.clipboard.writeText){
        await navigator.clipboard.writeText(value);
      }else{
        $("planDraftText").focus();$("planDraftText").select();
        if(!document.execCommand("copy"))throw Error("Clipboard is unavailable");
      }
      $("copyPlanStatus").textContent="Скопировано";
    }catch(e){
      $("planDraftText").focus();$("planDraftText").select();
      $("copyPlanStatus").textContent="Выделенный текст можно скопировать вручную";
    }
  });

  // Map is only a navigational aid. Historical boundaries are simplified.
  function drawBlocMap(){
    var geo=window.VPI1955_MAPS&&window.VPI1955_MAPS.europe;
    if(!geo){$("blocMap").textContent="Карта недоступна";return}
    var parts=geo.countries.map(function(c){
      var interactive=c.id!=="context";
      return '<path class="europe-country '+(interactive?"bloc-shape":"")+'" '+(interactive?'data-map-bloc="'+c.id+'" tabindex="0" role="button" aria-label="'+safe(c.name)+'"':"")+' d="'+c.d+'"><title>'+safe(c.name)+'</title></path>';
    });
    parts.push('<path class="europe-country bloc-shape" data-map-bloc="gdr" tabindex="0" role="button" aria-label="ГДР" d="'+geo.gdr+'"><title>ГДР</title></path>');
    var labels=[["ГДР",260,124],["Польша",445,145],["Чехословакия",346,230],["Венгрия",438,316],["Румыния",593,358],["Болгария",603,454],["Албания",457,531],["Югославия",360,444]];
    labels.forEach(function(p){parts.push('<text class="bloc-map-label" x="'+p[1]+'" y="'+p[2]+'">'+safe(p[0])+'</text>')});
    $("blocMap").innerHTML=parts.join("");
    var yug=["Croatia","Slovenia","Bosnia and Herzegovina","Republic of Serbia","Macedonia","Montenegro"];
    document.querySelectorAll("#blocMap path.europe-country").forEach(function(p){
      var t=p.querySelector("title");if(!t)return;
      if(yug.indexOf(t.textContent)>=0)p.classList.add("historic-yug");
      if(t.textContent==="Czech Republic"||t.textContent==="Slovakia")p.classList.add("historic-cze");
    });
    document.querySelectorAll("[data-map-bloc]").forEach(function(el){
      var activate=function(){selectCountry(el.dataset.mapBloc)};
      el.addEventListener("click",activate);
      el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();activate()}})
    });
  }
  $("blocCards").innerHTML=bloc.map(function(x){return '<button type="button" class="bloc-card" data-country="'+x.id+'" aria-pressed="false"><span class="flag">'+x.flag+'</span><span class="bloc-meta"><strong>'+safe(x.name)+'</strong><small>'+safe(x.desc)+'</small></span></button>'}).join("");
  document.querySelectorAll("[data-country]").forEach(function(el){el.addEventListener("click",function(){selectCountry(el.dataset.country)})});
  function selectCountry(id){
    var x=bloc.find(function(y){return y.id===id});if(!x)return;
    document.querySelectorAll("[data-country]").forEach(function(el){var active=el.dataset.country===id;el.classList.toggle("is-active",active);el.setAttribute("aria-pressed",String(active))});
    document.querySelectorAll("[data-map-bloc]").forEach(function(el){var active=el.dataset.mapBloc===id;el.classList.toggle("is-active",active);el.setAttribute("aria-pressed",String(active))});
    $("countryFlag").textContent=x.flag;$("countryName").textContent=x.name;
    $("countryRelation").textContent=x.relation+" / 100";$("countryPressure").textContent=x.stability+" / 100";
    $("relationFill").style.width=x.relation+"%";$("stabilityFill").style.width=x.stability+"%";
    $("relationTrack").setAttribute("aria-valuenow",String(x.relation));$("stabilityTrack").setAttribute("aria-valuenow",String(x.stability));
    $("countryContext").textContent=x.context;$("countrySpecialty").textContent=x.specialty;
    $("countryNear").textContent=x.near;$("countryLong").textContent=x.long;
  }
  drawBlocMap();
  selectCountry("hun");
})();