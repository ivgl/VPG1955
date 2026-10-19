"use strict";
/* Игровая модель переговорных групп США. Не исторический поимённый перечень: 
   места по партиям подтверждены источниками, внутреннее деление является 
   предложением для обсуждения баланса перед первым ходом. */
window.VPI_USA_FACTIONS_1955={
  year:1955,
  status:"BALANCE_PROPOSAL_NOT_CANON",
  house:{label:"Палата представителей",majority:218,total:435,groups:[
    {id:"south",name:"Южные демократы",party:"Д",seats:95,theme:"Защита регионального порядка и полномочий штатов."},
    {id:"liberal",name:"Либеральные демократы",party:"Д",seats:71,theme:"Гражданские права, федеральные реформы и социальные гарантии."},
    {id:"urban",name:"Городские демократы",party:"Д",seats:66,theme:"Индустриальные города, профсоюзы и инфраструктура."},
    {id:"moderate",name:"Умеренные республиканцы",party:"Р",seats:110,theme:"Компромиссное крыло президента."},
    {id:"conservative",name:"Консервативные республиканцы",party:"Р",seats:93,theme:"Сдерживание расходов и расширения федеральной власти."}
  ]},
  senate:{label:"Сенат",majority:49,total:96,groups:[
    {id:"south",name:"Южные демократы",party:"Д",seats:20,theme:"Региональная автономия и позиции профильных комитетов."},
    {id:"liberal",name:"Либеральные демократы",party:"Д",seats:16,theme:"Гражданские права и социальное законодательство."},
    {id:"urban",name:"Городские демократы",party:"Д",seats:12,theme:"Трудовые, городские и промышленные интересы."},
    {id:"moderate",name:"Умеренные республиканцы",party:"Р",seats:24,theme:"Межпартийные сделки и курс Эйзенхауэра."},
    {id:"conservative",name:"Консервативные республиканцы",party:"Р",seats:23,theme:"Бюджетная дисциплина и местные полномочия."},
    {id:"independent",name:"Независимый",party:"Н",seats:1,theme:"Самостоятельное голосование по конкретному законопроекту."}
  ]},
  topics:[
    {id:"rights",name:"Гражданские права",desc:"Крупная федеральная реформа затрагивает полномочия штатов, партийную дисциплину и позиции комитетов.",support:{south:"no",liberal:"yes",urban:"maybe",moderate:"maybe",conservative:"no",independent:"maybe"}},
    {id:"budget",name:"Бюджет и налоги",desc:"Конкретные статьи расходов и налоги способны менять союзы между партийными крыльями.",support:{south:"maybe",liberal:"maybe",urban:"yes",moderate:"yes",conservative:"maybe",independent:"maybe"}},
    {id:"infrastructure",name:"Федеральные инвестиции",desc:"Транспорт, энергетика и заказы дают пространство для межрегиональных соглашений.",support:{south:"maybe",liberal:"yes",urban:"yes",moderate:"yes",conservative:"maybe",independent:"maybe"}}
  ],
  sources:["https://history.house.gov/Congressional-Overview/Profiles/84th/","https://www.senate.gov/history/partydiv.htm"]
};