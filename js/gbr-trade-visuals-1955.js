"use strict";
/* UK 1955 settlement geography: interactive historical-regime map + MODEL trade matrix.
   Never updates game state. Estimates are subject to administrator approval. */
(function(){
  const atlas=window.VPI_GBR_ATLAS_1955;
  const model=window.VPI_GBR_TRADE_ZONES_1955;
  const world=window.VPI_GBR_WORLD;
  const root=document.getElementById("gbrSettlementAtlas");
  if(!root||!atlas||!model||!world){return}
  const $=id=>root.querySelector("#"+id);
  const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const n=(v,dp=2)=>Number(v).toLocaleString("ru-RU",{minimumFractionDigits:dp,maximumFractionDigits:dp});
  const gamedata=atlas.gameState;
  const amount={exports:gamedata.exports,imports:gamedata.imports};
  const originalShares={exports:gamedata.tradeExportShares,imports:gamedata.tradeImportShares};
  const zones=model.zones;
  const zoneIndex=new Map(zones.map(z=>[z.id,z]));
  const countryIndex=new Map();
  zones.forEach(zone=>zone.countries.forEach(country=>countryIndex.set(country,zone.id)));
  const rowAmount=(direction,sectorId,zoneId)=>
     amount[direction]*(originalShares[direction][sectorId]/100)*
     (model.allocation[direction][sectorId][zoneId]/100);
  const sumZone=(direction,zoneId)=>model.sectors.reduce((a,s)=>a+rowAmount(direction,s.id,zoneId),0);
  const getPct=(direction,zoneId)=>sumZone(direction,zoneId)/amount[direction]*100;
  const selected={zone:"sterling",direction:"imports",country:null,sector:null};
  const basicNames={"England":"Великобритания","USA":"США","Germany":"Германия (см. уточнение)","Bangladesh":"Восточный Пакистан","Sri Lanka":"Цейлон","Ghana":"Золотой Берег","Malaysia":"Малайя"};
  const titleCountry=c=>basicNames[c]||c;
  const mapIds=zones.map(z=>z.id);
  const legend=zones.map(z=>'<button type="button" class="gbr-zone-legend-item" data-zone="'+z.id+'" aria-pressed="false"><i style="--zone:'+esc(z.color)+'"></i><span>'+esc(z.name)+'</span></button>').join("");
  root.innerHTML=
    '<div class="gbr-tradeviz-heading"><div><span class="eyebrow">Валютная география · 1955</span><h3>Где фунт помогает торговать, а где нужны другие расчёты</h3><p>На карте обозначены основные торгово-расчётные контуры. Выберите зону или государство, чтобы увидеть значение этого направления для Британии.</p></div><span class="gbr-tradeviz-tag">Торговая система</span></div>'+
    '<div class="gbr-zone-layout"><div class="gbr-zone-map-panel"><div class="gbr-zone-map-wrap"><svg id="gbrZonesMap" viewBox="0 0 960 490" role="group" aria-label="Схематическая карта расчётных зон Великобритании 1955 года"></svg></div><div id="gbrZonesLegend" class="gbr-zones-legend" role="group" aria-label="Выбор торгово-расчётного контура">'+legend+'</div><p class="gbr-viz-foot">Картографическая основа использует современные очертания стран. Цвет — ведущая связь с расчётным контуром, а не единственная валюта сделок. Например, зона ЕПС на карте условно обозначает ФРГ, но не ГДР.</p></div>'+
    '<aside class="gbr-zone-detail"><span class="eyebrow">Торгово-расчётный контур</span><h4 id="gbrZoneName"></h4><div class="gbr-zone-type" id="gbrZoneType"></div><p id="gbrZoneDescription"></p><div class="gbr-zone-selected-country" id="gbrZoneSelectedCountry"></div><div class="gbr-zone-stat-pair"><div><small>Экспорт в контур · оценка</small><strong id="gbrZoneExport"></strong></div><div><small>Импорт из контура · оценка</small><strong id="gbrZoneImport"></strong></div></div><div class="gbr-zone-field"><b>Главное ограничение</b><p id="gbrZoneConstraint"></p></div><div class="gbr-zone-field"><b>Какие решения возможны</b><p id="gbrZonePolicy"></p></div><div class="gbr-zone-examples" id="gbrZoneExamples"></div></aside></div>'+
    '<div class="gbr-breakdown-heading"><div><span class="eyebrow">Объёмы торговли по расчётным контурам</span><h3>Экспорт и импорт по направлениям</h3><p>Числа ниже — согласуемое распределение <b>официальных игровых сумм</b> между расчётными контурами. Это не измеренная статистика 1955 года и не точная доля платежей в £ или $.</p></div><span class="gbr-proposal-tag">Модель для согласования</span></div>'+
    '<div id="gbrZoneTotals" class="gbr-zone-totals"></div>'+
    '<div class="gbr-matrix-bar"><div><span class="eyebrow">Отрасли × расчётные контуры</span><h3>Из чего складывается торговля</h3></div><div class="gbr-flow-modes" id="gbrFlowModes"><button data-flow="imports" type="button">Импорт</button><button data-flow="exports" type="button">Экспорт</button></div></div>'+
    '<div class="gbr-sector-matrix-wrap"><div class="gbr-sector-matrix" id="gbrSectorMatrix"></div></div>'+
    '<div class="gbr-matrix-summary" id="gbrMatrixSummary"></div>'+
    '<div class="gbr-model-method"><strong>Как читать числа:</strong> общий экспорт и импорт, а также доли шести отраслей уже зафиксированы в игре. <b>Распределение отраслей между зонами — новый проект баланса, ещё не утверждённый администратором.</b> Его суммы сверяются с игровыми итогами. Конкретная валюта контракта может отличаться от категории зоны. <a href="https://www.elibrary.imf.org/view/journals/024/1955/002/article-A001-en.xml" target="_blank" rel="noopener noreferrer">МВФ, исследование 1955 года ↗</a></div>';
  const worldCountry=world.paths.map(c=>({name:c.name,zone:countryIndex.get(c.name)||null,d:c.d}));
  function renderMap(){
    $("gbrZonesMap").innerHTML=worldCountry.map(c=>{
      const z=zoneIndex.get(c.zone);
      const cls=c.zone?"gbr-zone-country assigned "+(c.zone===selected.zone?"is-selected":"is-unselected"):"gbr-zone-country unassigned";
      const safeName=esc(titleCountry(c.name));
      return '<path d="'+c.d+'" class="'+cls+'"'+(z?' style="--zone:'+z.color+'" data-zone-country="'+esc(c.name)+'" data-zoneid="'+z.id+'" tabindex="0" role="button" aria-label="'+safeName+", "+esc(z.name)+'"':"")+'><title>'+safeName+(z?" — "+esc(z.name):" — не выделено")+'</title></path>';
    }).join("");
    $("gbrZonesMap").querySelectorAll("[data-zone-country]").forEach(el=>{
      const open=()=>{selected.zone=el.dataset.zoneid;selected.country=el.dataset.zoneCountry;renderAll()};
      el.addEventListener("click",open);
      el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
    });
  }
  function renderDetail(){
    const zone=zoneIndex.get(selected.zone);
    $("gbrZoneName").textContent=zone.name;
    $("gbrZoneType").textContent=zone.label;
    $("gbrZoneDescription").textContent=zone.description;
    $("gbrZoneConstraint").textContent=zone.constraint;
    $("gbrZonePolicy").textContent=zone.policy;
    $("gbrZoneExamples").textContent="Примеры: "+zone.examples;
    $("gbrZoneExport").textContent=n(sumZone("exports",zone.id),2)+" млрд G$";
    $("gbrZoneImport").textContent=n(sumZone("imports",zone.id),2)+" млрд G$";
    let note=selected.country?"Выбрано: "+titleCountry(selected.country)+" · "+zone.name:"Выбран весь контур";
    $("gbrZoneSelectedCountry").textContent=note;
    root.querySelectorAll("[data-zone]").forEach(el=>{
      const active=el.dataset.zone===selected.zone;
      el.classList.toggle("active",active);
      el.setAttribute("aria-pressed",String(active));
    });
  }
  function renderTotals(){
    $("gbrZoneTotals").innerHTML=["exports","imports"].map(direction=>{
      const title=direction==="exports"?"Экспорт":"Импорт";
      const t=amount[direction];
      return '<div class="gbr-zone-total-row"><div class="gbr-zone-total-head"><strong>'+title+'</strong><span>'+n(t,3)+' млрд G$ · игровой показатель</span></div>'+
        '<div class="gbr-zone-total-bar" aria-label="'+title+' по зонам">'+zones.map(zone=>{
          const pct=getPct(direction,zone.id);
          return '<button type="button" title="'+esc(zone.name)+' — '+n(sumZone(direction,zone.id),2)+' млрд G$" style="width:'+pct.toFixed(6)+'%;--zone:'+zone.color+'" class="'+(zone.id===selected.zone?"active":"")+'" data-zone-total="'+zone.id+'" aria-label="'+esc(zone.name)+': '+n(pct,1)+'%, '+n(sumZone(direction,zone.id),2)+' млрд G$"><span>'+n(pct,0)+'%</span></button>';
        }).join("")+'</div>'+
        '<div class="gbr-zone-totals-key">'+zones.map(zone=>'<button type="button" data-zone-total="'+zone.id+'"><i style="--zone:'+zone.color+'"></i><span>'+esc(zone.short)+'</span><strong>'+n(sumZone(direction,zone.id),2)+'</strong></button>').join("")+'</div></div>';
    }).join("");
    root.querySelectorAll("[data-zone-total]").forEach(el=>el.addEventListener("click",()=>{selected.zone=el.dataset.zoneTotal;selected.country=null;renderAll()}));
  }
  function renderMatrix(){
    const direction=selected.direction;
    const colheads=zones.map(z=>'<div class="gbr-sector-col-label" style="--zone:'+z.color+'"><i></i><span>'+esc(z.short)+'</span></div>').join("");
    const rows=model.sectors.map(sector=>{
      const part=originalShares[direction][sector.id],total=amount[direction]*part/100;
      return '<div class="gbr-sector-matrix-row"><div class="gbr-sector-name"><b>'+esc(sector.name)+'</b><small>'+n(part,0)+'% · '+n(total,2)+' G$</small></div>'+
        zones.map(zone=>{const value=rowAmount(direction,sector.id,zone.id),weight=model.allocation[direction][sector.id][zone.id];
        return '<button class="gbr-sector-cell'+(zone.id===selected.zone?" picked":"")+'" type="button" data-matrix-zone="'+zone.id+'" data-matrix-sector="'+sector.id+'" style="--zone:'+zone.color+'"><strong>'+n(value,2)+'</strong><small>'+weight+'% сектора</small><span class="gbr-cell-track"><i style="width:'+weight+'%"></i></span></button>';
        }).join("")+'</div>';
    }).join("");
    $("gbrSectorMatrix").innerHTML='<div class="gbr-sector-matrix-head"><div class="gbr-sector-col-label first">Сектор / млрд G$</div>'+colheads+'</div>'+rows+
    '<div class="gbr-sector-matrix-bottom"><div><b>Итого</b><small>'+n(amount[direction],3)+' млрд G$</small></div>'+zones.map(z=>'<div style="--zone:'+z.color+'"><b>'+n(sumZone(direction,z.id),2)+'</b><small>'+n(getPct(direction,z.id),1)+'% общей торговли</small></div>').join("")+'</div>';
    root.querySelectorAll("[data-matrix-zone]").forEach(el=>el.addEventListener("click",()=>{
      selected.zone=el.dataset.matrixZone;selected.sector=el.dataset.matrixSector;selected.country=null;renderAll();
    }));
    root.querySelectorAll("[data-flow]").forEach(el=>{
      const active=el.dataset.flow===direction;el.classList.toggle("active",active);el.setAttribute("aria-pressed",String(active));
    });
    const s=model.sectors.find(x=>x.id===selected.sector)||model.sectors.find(x=>x.id==="machinery_technology");
    const zone=zoneIndex.get(selected.zone),sectorValue=rowAmount(direction,s.id,zone.id);
    $("gbrMatrixSummary").innerHTML='<b>'+esc(zone.name)+' · '+(direction==="imports"?"импорт":"экспорт")+'</b><span>'+esc(s.name)+': '+n(sectorValue,2)+' млрд G$ в расчётном контуре ('+model.allocation[direction][s.id][zone.id]+'% отраслевого объёма). При изменении игры эти модельные распределения нужно пересматривать, а не автоматически переносить в официальный баланс.</span>';
  }
  function renderAll(){renderMap();renderDetail();renderTotals();renderMatrix()}
  $("gbrZonesLegend").querySelectorAll("[data-zone]").forEach(el=>el.addEventListener("click",()=>{
    selected.zone=el.dataset.zone;selected.country=null;renderAll();
  }));
  $("gbrFlowModes").querySelectorAll("[data-flow]").forEach(el=>el.addEventListener("click",()=>{
    selected.direction=el.dataset.flow;renderMatrix();
  }));
  renderAll();
})();
