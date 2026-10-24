
function makePlayerView(o,inv,prod,cap=180,id=5551955){
const S=o.economy.stats,E=o.economy,P=o.politics,M=o.military;
const names={USA:"США",URS:"СССР",GBR:"Великобритания",FRA:"Франция",FRG:"ФРГ",JPN:"Япония",CHN:"КНР",EGY:"Египет",IND:"Индия",ISR:"Израиль",ITA:"Италия",YUG:"Югославия"};
const cats=[["energy","Энергоресурсы"],["food","Продовольствие"],["raw_materials","Сырьё"],["machinery_technology","Машины и технологии"],["finished_goods","Готовая продукция"],["services","Услуги"]];
const sum=x=>Object.values(x||{}).reduce((a,b)=>a+Number(b||0),0);
if(Math.abs(sum(E.trade_export_shares)-100)>1e-6||Math.abs(sum(E.trade_import_shares)-100)>1e-6)throw Error(o.id+" trade shares invalid");
if(!Array.isArray(inv)||inv.length!==15)throw Error(o.id+" missing military inventory");
const R=[],add=(cells,kind="data")=>R.push({cells,kind}),sec=s=>add([s],"section"),head=()=>add(["Показатель","Значение","Единица","Пояснение"],"head");
const n=x=>x==null?"—":Math.round(x*1000)/1000;
const p=(name,val,unit="",note="")=>add([name,typeof val==="string"&&val.length>48?"":n(val),unit,typeof val==="string"&&val.length>48?(val+(note?"; "+note:"")):note]);
add([names[o.id]+" · ПАСПОРТ ГОСУДАРСТВА · 1955"],"title");
add(["Положение на 1 января 1955 года  |  Публичное представление статистики"],"subtitle");
add(["Денежные суммы — млрд игровых G$, ВВП по ППС — в международных долларах 2011 года. Официальные изменения учитываются только после судейства."],"note");
add([],"gap");
sec("01  /  ОБЩАЯ СВОДКА");head();
for(const [t,k,u] of [["Население","population","человек"],["ВВП по ППС","gdp_real_billion_2011_intl","млрд междунар. $2011"],["Рост ВВП","gdp_growth_pct","% за год"],["Доходы бюджета","fiscal_revenue_total_billion","млрд G$"],["Расходы бюджета","fiscal_spending_total_billion","млрд G$"],["Баланс бюджета","fiscal_budget_balance_billion","млрд G$"],["Госдолг","fiscal_debt_total_billion","млрд G$"],["Экспорт","exports_billion","млрд G$"],["Импорт","imports_billion","млрд G$"]])p(t,S[k],u);
p("Глава правительства",P.head_of_government,"на 01.01.1955");
sec("02  /  ЭКОНОМИКА");head();
for(const [t,k,u] of [["ВВП на душу","gdp_per_capita_2011_intl","междунар. $2011"],["Инфляция","consumer_inflation_pct","%"],["Инвестиции","investment_share_gdp_pct","% ВВП"],["Промышленность","industry_share_pct","% ВВП"],["Сельское хозяйство","agriculture_share_pct","% ВВП"],["Сфера услуг","services_share_pct","% ВВП"],["Производительность","productivity_hour_index","индекс, база 100"],["Научно-технологический потенциал","science_technology_index","шкала 0–100"]])p(t,S[k],u,k==="productivity_hour_index"?"100 — базовая точка, не максимум":k==="science_technology_index"?"Игровая оценка":"");
sec("03  /  БЮДЖЕТ И ГОСУДАРСТВЕННЫЙ ДОЛГ");head();
for(const [t,k] of [["Налоги","fiscal_tax_billion"],["Прочие доходы","fiscal_nontax_billion"],["Доходы, всего","fiscal_revenue_total_billion"],["Социальные расходы","fiscal_spend_social_billion"],["Расходы на экономику","fiscal_spend_economy_billion"],["Военные расходы","fiscal_spend_defense_billion"],["Управление","fiscal_spend_admin_billion"],["Прочие расходы","fiscal_spend_other_billion"],["Расходы, всего","fiscal_spending_total_billion"],["Баланс бюджета","fiscal_budget_balance_billion"],["Внутренний долг","fiscal_debt_domestic_billion"],["Внешний долг","fiscal_debt_fx_billion"],["Долг, всего","fiscal_debt_total_billion"]])p(t,S[k],"млрд G$");
p("Долг / ВВП",S.fiscal_debt_gdp_pct,"%","Игровая пропорция");
p("Ставка обслуживания долга",S.fiscal_interest_rate_pct,"%");
if(S.policy_rate_pct!=null)p("Ключевая ставка",S.policy_rate_pct,"%");
sec("04  /  ТОРГОВЛЯ И РЕЗЕРВЫ");head();
for(const [t,k] of [["Экспорт товаров и услуг","exports_billion"],["Импорт товаров и услуг","imports_billion"],["Торговое сальдо","net_exports_billion"],["Валютные резервы","reserves_billion"],["Чистый приток капитала","net_capital_inflow_billion"],["Прямые зарубежные инвестиции","fdi_inflow_billion"]])p(t,S[k],"млрд G$",k==="reserves_billion"?"Не свободный бюджетный фонд":k==="net_capital_inflow_billion"||k==="fdi_inflow_billion"?"Оценка, не гарантированное поступление":"");
if(E.reserve_coverage?.months!=null)p("Резервы / товарный импорт",E.reserve_coverage.months,"месяцев","Исторический ориентир, не жёсткий предел");
p("Внешний валютный индекс",S.fx_external_value_index,"база 100","Индекс изменения, не максимум");
add(["СТРУКТУРА ТОРГОВЛИ · процентное распределение"],"sub");
add(["Категория","Экспорт, %","Импорт, %","Обе колонки независимо дают 100%"],"tradeHead");
for(const [k,t] of cats)add([t,E.trade_export_shares[k],E.trade_import_shares[k],"Оценочные доли"],"trade");
add(["ИТОГО",100,100,"100% экспорта и 100% импорта"],"tradeTotal");
sec("05  /  НАСЕЛЕНИЕ И ЗАНЯТОСТЬ");head();
for(const [t,k,u] of [["Рождаемость","birth_rate_per_1000","на 1000 в год"],["Смертность","death_rate_per_1000","на 1000 в год"],["Сальдо миграции","net_migration_people","человек/год"],["Дети 0–14","age_0_14_pct","%"],["Возраст 15–64","age_15_64_pct","%"],["Возраст 65+","age_65_plus_pct","%"],["Доля рабочей силы","labor_participation_pct","%"],["Безработица","unemployment_pct","%"],["Численность занятых","employment_people","человек"],["Реальные доходы","real_household_income_index","база 100"]])p(t,S[k],u,k==="real_household_income_index"?"100 — исходная точка, не максимум":"");
if(S.income_gini!=null)p("Индекс Джини",S.income_gini,"0–100","Выше — больше неравенство");
sec("06  /  СОЦИАЛЬНЫЕ И АДМИНИСТРАТИВНЫЕ ПОКАЗАТЕЛИ");head();
for(const [t,k,h] of [["Образование","education_index","Выше — лучше"],["Здравоохранение","healthcare_index","Выше — лучше"],["Работоспособность институтов","institutional_capacity_index","Выше — лучше"],["Коррупционные риски","corruption_exposure_index","Выше — риски больше"]])p(t,S[k],"шкала 0–100","Игровая оценка. "+h);
sec("07  /  ПОЛИТИЧЕСКОЕ УСТРОЙСТВО");head();
p("Политическая система",(P.system||"").replaceAll("_"," "),"система","Описание институтов — в национальных механиках");
p("Руководство",P.head_of_government);
p("Правящая сила",P.governing_force);
if(P.legislature)p("Законодательный орган",P.legislature);
if(P.last_national_election)p("Последние выборы",P.last_national_election);
if(P.next_election_rule)p("Избирательный цикл",P.next_election_rule,"ориентир","Исторические события после старта могут измениться");
sec("08  /  АРМИЯ И ГОТОВНОСТЬ");head();
p("Действующие военнослужащие",M.active_personnel,"человек","Все виды вооружённых сил");
p("Подготовленный резерв",M.reserve_personnel,"человек","Не означает полностью оснащённые соединения");
p("Степень готовности",({HIGH:"Высокая",STANDARD:"Стандартная",LOW:"Низкая",NOT_ESTABLISHED:"Федеральная армия не создана"}[M.readiness]||M.readiness),"качественная");
if(M.partial_mobilization_window)p("Частичная мобилизация",M.partial_mobilization_window);
if(M.large_scale_mobilization_window)p("Крупное развёртывание",M.large_scale_mobilization_window);
add(["ВООРУЖЕНИЕ · рабочая игровая ведомость RC 0.10 (не утверждено в официальном HEAD)"],"sub");
add(["Категория техники","Всего","Боеготово","Современное / предыдущее / устаревшее"],"tradeHead");
for(const v of inv)add([v[2],+v[3],+v[8],v[4]+" / "+v[5]+" / "+v[6]],"trade");
add(["Промышленный потенциал: танки",+prod[2],"в год","Оценочная мощность, не фактический выпуск"],"tradeTotal");
add(["Промышленный потенциал: самолёты",+prod[3],"в год","Оценочная мощность, не фактический выпуск"],"tradeTotal");
add(["Ведомость RC 0.10 — ориентировочная; цифры общего парка включают боеготовое. Перечисленные поколения составляют общий парк, не прибавляются к нему. Нуждается в утверждении для военного судейства."],"caution");
sec("09  /  СТРАНОВЫЕ ОСОБЕННОСТИ");head();
for(const txt of o.feature_notes||[])p("Стартовые обстоятельства",String(txt).slice(0,260));
for(const x of o.active_processes||[])p(x.name||"Действующий процесс",String(x.description||"").slice(0,250),"с "+(x.since||"ранее"),"Продолжение зависит от игры");
p("Национальные механики","https://ivgl.github.io/VPG1955/countries/"+(o.id==="URS"?"ussr":o.id.toLowerCase())+".html","ссылка");
add(["Это представление для игрока, а не официальный источник истины. Показатели истории и игрового баланса уточняются через судейство. Изменения сохраняются в официальном состоянии отдельно."],"foot");
if(R.length>cap)throw Error(o.id+" needs "+R.length+" rows, has "+cap);
const rgb=(r,g,b)=>({red:r/255,green:g/255,blue:b/255}),dark=rgb(28,56,68),teal=rgb(36,104,101),pale=rgb(224,239,234),light=rgb(248,251,249),white=rgb(255,255,255),gray=rgb(105,124,128),warn=rgb(255,243,221);
function makeCell(v,k,col,i){
let bg=white,fg=dark,bold=false,size=10;
if(k==="title"||k==="section"){bg=dark;fg=white;bold=true;size=k==="title"?16:11}
else if(["sub","head","tradeHead","tradeTotal"].includes(k)){bg=pale;fg=teal;bold=true}
else if(k==="subtitle"){bg=light;fg=teal;bold=true}
else if(k==="note"||k==="foot"){bg=light;fg=gray}
else if(k==="caution"){bg=warn}
else if(i%2===0)bg=light;
if(col===0&&(k==="data"||k==="trade"))bold=true;
return {userEnteredValue:typeof v==="number"?{numberValue:v}:v==null||v===""?undefined:{stringValue:String(v)},userEnteredFormat:{backgroundColor:bg,textFormat:{fontFamily:"Arial",fontSize:size,bold,foregroundColor:fg},verticalAlignment:"MIDDLE",horizontalAlignment:col===1?"RIGHT":"LEFT",wrapStrategy:"WRAP",padding:{top:6,bottom:6,left:10,right:10},numberFormat:typeof v==="number"?{type:"NUMBER",pattern:Number.isInteger(v)?"#,##0":"#,##0.###"}:{type:"TEXT"}}};
}
const req=[
{unmergeCells:{range:{sheetId:id,startRowIndex:0,endRowIndex:cap,startColumnIndex:0,endColumnIndex:6}}},
{repeatCell:{range:{sheetId:id,startRowIndex:0,endRowIndex:cap,startColumnIndex:0,endColumnIndex:6},cell:{},fields:"userEnteredValue,userEnteredFormat,note"}},
{updateCells:{range:{sheetId:id,startRowIndex:0,endRowIndex:R.length,startColumnIndex:0,endColumnIndex:4},rows:R.map((x,i)=>({values:Array.from({length:4},(_,j)=>makeCell(x.cells[j],x.kind,j,i))})),fields:"userEnteredValue,userEnteredFormat"}},
{updateSheetProperties:{properties:{sheetId:id,gridProperties:{frozenRowCount:4,hideGridlines:true}},fields:"gridProperties.frozenRowCount,gridProperties.hideGridlines"}}];
[255,160,185,415].forEach((width,j)=>req.push({updateDimensionProperties:{range:{sheetId:id,dimension:"COLUMNS",startIndex:j,endIndex:j+1},properties:{pixelSize:width,hiddenByUser:false},fields:"pixelSize,hiddenByUser"}}));
for(let j=4;j<6;j++)req.push({updateDimensionProperties:{range:{sheetId:id,dimension:"COLUMNS",startIndex:j,endIndex:j+1},properties:{hiddenByUser:true},fields:"hiddenByUser"}});
req.push({updateDimensionProperties:{range:{sheetId:id,dimension:"ROWS",startIndex:0,endIndex:R.length},properties:{pixelSize:35},fields:"pixelSize"}});
for(let i=0;i<R.length;i++){
const k=R[i].kind;if(["title","subtitle","note","section","sub","caution","foot"].includes(k)){
req.push({mergeCells:{range:{sheetId:id,startRowIndex:i,endRowIndex:i+1,startColumnIndex:0,endColumnIndex:4},mergeType:"MERGE_ALL"}});
req.push({updateDimensionProperties:{range:{sheetId:id,dimension:"ROWS",startIndex:i,endIndex:i+1},properties:{pixelSize:k==="title"?46:k==="note"||k==="foot"?55:k==="caution"?62:34},fields:"pixelSize"}});
}else if(k==="data"){const x=R[i].cells;const lines=Math.max(...x.map((v,j)=>Math.ceil(String(v||"").length/[34,20,24,55][j])));if(lines>=3)req.push({updateDimensionProperties:{range:{sheetId:id,dimension:"ROWS",startIndex:i,endIndex:i+1},properties:{pixelSize:Math.min(164,lines*16+12)},fields:"pixelSize"}})}
}
return {requests:req,metric:{id:o.id,rows:R.length,inv:inv.length,exportTotal:sum(E.trade_export_shares),importTotal:sum(E.trade_import_shares)}};
}
