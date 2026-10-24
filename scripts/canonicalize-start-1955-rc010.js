/* VPI 1955 canonical migration: enrich all twelve official country states with
   RC0.10 game-estimate equipment, and connect approved public mechanics to
   each legacy private module. Never use raw source sheet as canonical state
   after import. No adjudication or game effects are performed here. */
function migrateCountry(o, inventory, production) {
  const id=o.id, idOrder=["tanks","armored_vehicles","artillery_and_spg","air_defense_guns","jet_fighters","piston_fighters","bombers_and_attack_aircraft","other_aircraft","fleet_carriers","light_and_escort_carriers","battleships","cruisers","destroyers_and_frigates","submarines","small_combat_ships"];
  if(!inventory || inventory.length!==15)throw Error(id+" must have 15 equipment classes");
  const item={};
  for(let i=0;i<15;i++){const r=inventory[i],k=idOrder[i];if(r[0]!==id)throw Error("Bad owner of "+k);const v=[3,4,5,6,8].map(j=>Number(r[j]));
    if(v.some(x=>!Number.isSafeInteger(x)||x<0)||v[0]!==v[1]+v[2]+v[3]||v[4]>v[0])throw Error(id+" invalid inventory "+k);
    item[k]={label_ru:String(r[2]),total:v[0],combat_ready:v[4],generations:{modern:v[1],previous:v[2],obsolete:v[3]}};
  }
  if(!production||production[0]!==id)throw Error(id+": production row missing");
  const tankCap=Number(production[2]),planeCap=Number(production[3]);if(!Number.isSafeInteger(tankCap)||!Number.isSafeInteger(planeCap)||tankCap<0||planeCap<0)throw Error("Invalid military capacity");
  const E=o.military.equipment;
  // Retain the existing broad fields for old readers. Only map unambiguous categories.
  E.tanks=item.tanks.total;E.artillery=item.artillery_and_spg.total;
  E.fighters=item.jet_fighters.total+item.piston_fighters.total;
  E.bombers=item.bombers_and_attack_aircraft.total;
  E.capital_surface_ships=item.battleships.total+item.cruisers.total;
  E.aircraft_carriers=item.fleet_carriers.total+item.light_and_escort_carriers.total;
  E.submarines=item.submarines.total;
  // No exact transport or nuclear inventory in RC0.10. Preserve unknown nulls.
  E.transport_aircraft=null;E.nuclear_warheads=null;
  Object.assign(o.military,{
    equipment_inventory_1955:item,
    equipment_categories_count:15,
    equipment_source_status:"ADMIN_APPROVED_GAME_ESTIMATE_RC0.10_2026-10-24",
    equipment_source_url:"https://docs.google.com/spreadsheets/d/17RmPQZ8oEZ55SG_3kDwwqUDgk1wUZQ5-xZbTX3BFjJc/edit",
    equipment_effective_date:"1955-01-01",
    equipment_data_quality:"SCENARIO_ESTIMATE_NOT_ARCHIVAL_EXACT_INVENTORY",
    industrial_military_capacity_1955:{
      tanks_per_year_estimated_upper_capacity:tankCap,
      military_aircraft_per_year_estimated_upper_capacity:planeCap,
      capacity_not_actual_output:true,
      requires_orders_materials_workers_and_lead_time:true
    },
    production_capacity:"RC0.10_SCENARIO_CAPACITY_RECORDED_SEPARATELY",
    count_status:"START_GAME_ESTIMATE_BASELINE_APPROVED",
    rule:"Количества техники и поколений являются стартовой игровой оценкой. Боеготовые единицы входят в общий парк; поколения также входят в тот же парк. Оперативное наличие на конкретном театре, снабжение, мобилизация и фактический выпуск определяются отдельным судейством.",
    operational_constraints:"Нельзя считать весь парк, весь резерв или всю годовую потенциальную мощность немедленно доступными в одном районе. Неизвестны точные войсковая дислокация, отдельный транспортный авиапарк и полный стратегический инвентарь. Дополнительные оперативные сведения требуют судейской проверки."
  });
  Object.assign(o.readiness,{
    military_inventory_complete:true,
    military_equipment_15_class_game_baseline:true,
    detailed_operational_inventory_complete:false,
    military_game_estimates_admin_approved:true
  });
  o.provenance??={};
  o.provenance.equipment_inventory_1955={
    source:"VPI 1955 Military Overview with Generations RC0.10",
    location:o.military.equipment_source_url,
    effective_date:"1955-01-01",
    approved_for_start_game_by_user:"2026-10-24",
    quality:"Scenario game estimates, not certified historical counts",
    canonicalization:"Numbers copied into country JSON; authoritative only after HEAD and manifest update"
  };
  return o;
}
function migrateModule(m,id) {
 const slug=id==="URS"?"ussr":id.toLowerCase();
 m.status="APPROVED_PUBLIC_MECHANICS_LINKED_LEGACY_RULES_CONTEXT";
 m.public_mechanics={
   approval:"ADMIN_APPROVED",
   approval_date:"2026-10-24",
   public_url:"https://ivgl.github.io/VPG1955/countries/"+slug+".html",
   mechanics_count:3,
   source_of_display:"ivgl/VPG1955",
   interpretation:"The public page is an approved descriptive gameplay reference; decisions still require submissions and administrator verdicts.",
   legacy_material_policy:"module_rules_prior_draft and national_spirits are historical judging context, not an automatically effective competing rule set."
 };
 m.version="0.3-linked-to-public";
 return m;
}
