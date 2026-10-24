# Паспорта игроков 1955 · переработка отображения
Дата: 24.10.2026. Обновлены существующие **12 Google Sheets**, URL и ID сохранены. В закрытом `ivgl/VPG1955-state` изменений не было. Одна вкладка `1955` на страну, новый год после судейства открывается новым листом.

## Что теперь есть
- Четыре основные колонки: **Показатель, Значение, Единица, Пояснение**; старые служебные колонки `Статус / инструменты`, `Источник / пояснение`, `Судейское применение / условия` удалены из отображения (E–F очищены и скрыты, D используется только для полезного комментария игроку).
- Девять разделов: обзор; экономика; бюджет; торговля; население и занятость; социальные и административные показатели; политика; армия и вооружение; страновые особенности.
- Для каждой страны из `country.economy.trade_export_shares` и `trade_import_shares` получена структурная таблица с отдельными **«Экспорт, %»** и **«Импорт, %»**. Каждая колонка из 6 категорий независимо суммируется до 100%. Доли сценарные, не архивные торговые данные.
- Вооружение взято из [RC 0.10 · Военная ведомость 1955](https://docs.google.com/spreadsheets/d/17RmPQZ8oEZ55SG_3kDwwqUDgk1wUZQ5-xZbTX3BFjJc/edit): все 15 категорий и показатели **всего**, **боеготово**, **современное/предыдущее/устаревшее**, а также оценка потенциального производства танков и военных самолётов за год. **ВНИМАНИЕ:** эта ведомость прямо помечена как сценарная оценка и `НЕ официальный HEAD`. Для включения в обязательные расчёты судейства требуется отдельное утверждение; в таблицах это явно подписано. Производственный потенциал не равен фактическому ежегодному выпуску.
- Исправлены языковые коды политических систем, русские подписи индексов (100 = стартовая база, не максимальное значение), длинные имена и тексты.
- Единый сдержанный дизайн: тёмные секционные заголовки, бирюзовая шапка, полосы читаемости, заданная ширина колонок, перенос длинных строк, замороженные верхние 4 строки.

## Контроль после записи
- 12/12 повторно прочитаны: торговля 100%/100%, 15 военных категорий, нет прежних служебных заголовков, заполнены политическая система и глава правительства.
- Численность сил и макроэкономика берутся из официальных `countries/*.json`, а военная техника — из отдельно обозначенной RC0.10.
- Используется только существующая учётная таблица игрока; ссылок не меняли. Права доступа по-прежнему ограничены, пока администратор не выдаст просмотр.

## Ссылки
| Страна | Паспорт игрока |
|---|---|
| США | [Google Sheet](https://docs.google.com/spreadsheets/d/1mZ6Dxv-9GyrTdypHeS_rH-gzQ3y2BFFKMJuDQnnZxOE/edit) |
| СССР | [Google Sheet](https://docs.google.com/spreadsheets/d/1eXVr9RiXujD6dS5lWzU0YM0b1c65FmWmpno46AwVaA0/edit) |
| Великобритания | [Google Sheet](https://docs.google.com/spreadsheets/d/15dq9TU1PEOGP_O6ImK-RrkD-FM-KGP4g5bjQd3s2xHc/edit) |
| Франция | [Google Sheet](https://docs.google.com/spreadsheets/d/1fmnf4_XDzAbCCL3K0FYsLiWiUp6WP8KnrNz0ZHJpR2s/edit) |
| ФРГ | [Google Sheet](https://docs.google.com/spreadsheets/d/14WoFrbaOibKq8-VNyW2naBFMKtmrIklDRga8gshIKGg/edit) |
| Япония | [Google Sheet](https://docs.google.com/spreadsheets/d/1l1I2740xbT7TzcIAqhibIXXrQvUS13RDEFQ8tXkZqVM/edit) |
| КНР | [Google Sheet](https://docs.google.com/spreadsheets/d/109y3wB9wwCQUm4GR4hL5C1mVGuPKPDaNo0cJTR5bhKo/edit) |
| Египет | [Google Sheet](https://docs.google.com/spreadsheets/d/14XES71rFh7RCJEyukpnZDjPl0jb9M_tc2RTyF1_k4Rw/edit) |
| Индия | [Google Sheet](https://docs.google.com/spreadsheets/d/15MV5M01mgd4-UhyuDaOTWAdXbpJ5QeqFBn9Yo5BNt4U/edit) |
| Израиль | [Google Sheet](https://docs.google.com/spreadsheets/d/1UHCwt3fqOcrtGVTndOdzk_fpjHS0UHoeUXdAuYBSjao/edit) |
| Италия | [Google Sheet](https://docs.google.com/spreadsheets/d/1BkFvBkZaCdqISkN7ia7ZT5cOGBfs95iAct7LD16B5aA/edit) |
| Югославия | [Google Sheet](https://docs.google.com/spreadsheets/d/1UQphmyOQlQ-ZfpnZLVA9DwC8Zmdqvk8dgYbo8nMdg4M/edit) |

## Генератор отображения
`scripts/player-view-renderer-1955.js` в публичном репозитории `ivgl/VPG1955` хранит код восстановления отображения. Сам генератор не изменяет официальный `HEAD.json`, `manifest_1955.json` или JSON государств.
