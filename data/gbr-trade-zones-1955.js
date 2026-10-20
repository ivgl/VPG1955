"use strict";
/* Analytic geographical and settlement scenario. NOT HISTORICAL TRADE COUNTS or canonical state. */
window.VPI_GBR_TRADE_ZONES_1955={
  "version": "2026-10-20-01",
  "referenceDate": "1955-01-01",
  "modelStatus": "PROPOSED_FOR_ADMIN_REVIEW",
  "method": "Sector totals follow official GBR export/import shares and G$ trade totals; zone allocation is an explicit editorial game balance scenario to be reviewed, NOT measured historic trade, not actual foreign currency payments, and not approved canonical state.",
  "notes": {
    "methodology": "Каждый сектор распределён между четырьмя торгово-расчётными контурами. Сумма долей сектора равна 100%; суммы по контурам складываются в официальный общий экспорт/импорт. Это не статистика валюты каждой сделки.",
    "map": "География на основе современных контуров. В 1955 году границы и суверенный статус ряда территорий отличались. Цвет обозначает ведущую институциональную связь, а не единственную валюту торговли.",
    "history": "Платежи между стерлинговой зоной и европейскими странами могли использовать переводные фунты; зоны на карте являются аналитическими категориями, а не взаимоисключающими валютными системами."
  },
  "zones": [
    {
      "id": "sterling",
      "name": "Стерлинговая зона",
      "short": "Фунт £",
      "label": "Расчёты в стерлингах",
      "color": "#317b72",
      "description": "Британия, ряд независимых участников Содружества и зависимые территории. Стерлинговые балансы, валютный контроль и общая заинтересованность в устойчивости фунта.",
      "constraint": "Долларовые покупки зоны ограничиваются наличием конвертируемой валюты. Партнёры могут предъявлять требования к своим фунтовым активам.",
      "examples": "Индия, Австралия, Пакистан, Цейлон, Малайя; многие колонии",
      "policy": "Стабильность фунта, условия доступа к рынкам, управление расчётами и соглашения с держателями стерлингов.",
      "center": [
        704,
        255
      ],
      "countries": [
        "England",
        "Ireland",
        "India",
        "Pakistan",
        "Bangladesh",
        "Sri Lanka",
        "Malaysia",
        "Australia",
        "New Zealand",
        "South Africa",
        "Kenya",
        "Uganda",
        "United Republic of Tanzania",
        "Ghana",
        "Nigeria",
        "Zambia",
        "Zimbabwe",
        "Malawi",
        "Botswana",
        "Lesotho",
        "Swaziland",
        "Cyprus",
        "Gambia",
        "Sierra Leone",
        "Jamaica",
        "Belize",
        "The Bahamas",
        "Trinidad and Tobago",
        "Guyana",
        "Fiji",
        "Papua New Guinea",
        "Solomon Islands",
        "Brunei",
        "Sudan"
      ]
    },
    {
      "id": "dollar",
      "name": "Долларовая зона",
      "short": "Доллар $",
      "label": "Долларовые расчёты",
      "color": "#c79451",
      "description": "США и Канада — важнейшие направления платежей в свободно конвертируемой валюте, включая поставки техники, продовольствия и материалов.",
      "constraint": "Платёж нельзя автоматически произвести в фунтах. Требуются долларовая выручка, свободные резервы, согласованные кредиты либо изменение торговли.",
      "examples": "США, Канада и связанные с ними рынки",
      "policy": "Расширять долларовую экспортную выручку, заключать соглашения об импорте и искать финансирование.",
      "center": [
        243,
        120
      ],
      "countries": [
        "USA",
        "Canada",
        "Puerto Rico"
      ]
    },
    {
      "id": "europe",
      "name": "Европейский платёжный союз",
      "short": "Клиринг ЕПС",
      "label": "Европейский многосторонний клиринг",
      "color": "#668da9",
      "description": "Значительная часть западноевропейских взаимных платежей сводилась через Европейский платёжный союз: вместо отдельного расчёта по каждой паре стран сопоставлялись многосторонние позиции.",
      "constraint": "Клиринг облегчает торговлю, но не отменяет необходимость урегулировать дефицитные позиции и соблюдать правила системы.",
      "examples": "Франция, ФРГ, Италия, Бенилюкс, Скандинавия и другие участники",
      "policy": "Договоры о закупках и экспорте, конкурентоспособность, управление торговыми дисбалансами.",
      "center": [
        515,
        115
      ],
      "countries": [
        "France",
        "Germany",
        "Italy",
        "Belgium",
        "Netherlands",
        "Luxembourg",
        "Austria",
        "Denmark",
        "Norway",
        "Sweden",
        "Switzerland",
        "Portugal",
        "Iceland",
        "Greece",
        "Turkey"
      ]
    },
    {
      "id": "other",
      "name": "Прочие расчёты",
      "short": "Иные режимы",
      "label": "Двусторонние и смешанные расчёты",
      "color": "#a2aab5",
      "description": "Страны вне трёх основных контуров: расчёты могли идти через двусторонние соглашения, переводные фунты, другие валюты и специальные режимы.",
      "constraint": "Отсутствие единой клиринговой сети может усложнять платежи; режим зависит от конкретного соглашения и контрагента.",
      "examples": "Часть Азии, Латинской Америки, Восточная Европа, Ближний Восток",
      "policy": "Специальные торговые соглашения, клиринговые договоры, условия оплаты и государственное кредитование.",
      "center": [
        725,
        285
      ],
      "countries": [
        "China",
        "Japan",
        "Indonesia",
        "Thailand",
        "Argentina",
        "Brazil",
        "Mexico",
        "Chile",
        "Egypt",
        "Iran",
        "Iraq",
        "Saudi Arabia",
        "Israel",
        "South Korea",
        "Taiwan",
        "Spain",
        "Finland",
        "Poland",
        "Czech Republic",
        "Slovakia",
        "Hungary",
        "Romania",
        "Bulgaria",
        "Albania",
        "Russia",
        "Ukraine",
        "Belarus",
        "Moldova",
        "Republic of Serbia",
        "Croatia",
        "Slovenia",
        "Bosnia and Herzegovina",
        "Montenegro",
        "Macedonia",
        "Morocco",
        "Algeria",
        "Tunisia",
        "Ethiopia",
        "Somalia",
        "Libya",
        "Yemen"
      ]
    }
  ],
  "sectors": [
    {
      "id": "energy",
      "name": "Энергия и топливо",
      "hint": "Уголь, нефть, топливо"
    },
    {
      "id": "food",
      "name": "Продовольствие",
      "hint": "Сельхозтовары и продукты"
    },
    {
      "id": "raw_materials",
      "name": "Сырьё",
      "hint": "Руды, металл, хлопок, каучук"
    },
    {
      "id": "machinery_technology",
      "name": "Машины и технологии",
      "hint": "Экспорт серийных машин и импорт специализированных станков"
    },
    {
      "id": "finished_goods",
      "name": "Готовая продукция",
      "hint": "Промышленные товары"
    },
    {
      "id": "services",
      "name": "Услуги",
      "hint": "Транспорт, финансовые и прочие услуги"
    }
  ],
  "allocation": {
    "exports": {
      "energy": {
        "sterling": 30,
        "dollar": 5,
        "europe": 45,
        "other": 20
      },
      "food": {
        "sterling": 40,
        "dollar": 10,
        "europe": 30,
        "other": 20
      },
      "raw_materials": {
        "sterling": 45,
        "dollar": 12,
        "europe": 25,
        "other": 18
      },
      "machinery_technology": {
        "sterling": 28,
        "dollar": 12,
        "europe": 45,
        "other": 15
      },
      "finished_goods": {
        "sterling": 37,
        "dollar": 10,
        "europe": 40,
        "other": 13
      },
      "services": {
        "sterling": 42,
        "dollar": 16,
        "europe": 27,
        "other": 15
      }
    },
    "imports": {
      "energy": {
        "sterling": 25,
        "dollar": 34,
        "europe": 20,
        "other": 21
      },
      "food": {
        "sterling": 48,
        "dollar": 28,
        "europe": 10,
        "other": 14
      },
      "raw_materials": {
        "sterling": 47,
        "dollar": 25,
        "europe": 12,
        "other": 16
      },
      "machinery_technology": {
        "sterling": 10,
        "dollar": 32,
        "europe": 47,
        "other": 11
      },
      "finished_goods": {
        "sterling": 23,
        "dollar": 20,
        "europe": 44,
        "other": 13
      },
      "services": {
        "sterling": 40,
        "dollar": 13,
        "europe": 31,
        "other": 16
      }
    }
  },
  "sources": [
    {
      "title": "МВФ: соглашения и переводные фунты, январь 1955",
      "url": "https://www.elibrary.imf.org/view/journals/024/1955/002/article-A001-en.xml"
    },
    {
      "title": "Банк Англии: годовой отчёт 1955",
      "url": "https://www.bankofengland.co.uk/-/media/boe/files/annual-report/1955/boe-1955.pdf"
    }
  ]
};
