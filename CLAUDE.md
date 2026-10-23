# HSK тренажёр

Локальный сайт для решения пробных тестов HSK. Пользователь общается по-русски.

Сайт: https://ke2zo.github.io/hsk-trainer/ (GitHub Pages из публичного репо `ke2zo/hsk-trainer`, ветка main).
Локально: `python3 server.py` (или двойной клик по `start.command`) → http://localhost:8765. Без зависимостей.

## Где хранятся результаты (`Store` в app.js)
- **github** (основной): приватный репо `ke2zo/hsk-data` — `results/*.json`, `vocab.json`, `mistakes.json`. Пишется браузером через fine-grained токен пользователя (Contents: read/write только на hsk-data), токен лежит в localStorage. Читать для анализа: `gh api repos/ke2zo/hsk-data/contents/results` или `git clone`.
- **local**: если токена нет и доступен server.py — папка `data/` (в .gitignore, т.к. репо сайта публичный).
- **browser**: только localStorage.

## Структура
- `server.py` — статика (с поддержкой Range для mp3) + API: `GET/POST /api/results`, `DELETE /api/results/<id>`, `GET/PUT /api/store/<name>`.
- `static/app.js` — всё приложение (hash-роутер). Типы вопросов и советы — объект `TAGS` в начале файла.
- `static/hsk-words.json` — слова HSK 2.0 уровней 1–5 (`{w, py, tr, l}`, русский перевод) из [LiudmilaLV/json_hsk](https://github.com/LiudmilaLV/json_hsk); пустые переводы дописаны вручную. Используется в «Словаре» (добавить 20 новых слов, весь список `#/hsk/<уровень>`) и для автозаполнения в диалоге «+ в словарь».
- `static/drills.json` — упражнения «Похожие слова» (`#/words`: `synonyms[] = {id, words, rule, items:[{s с ＿＿, a, why}]}`) и «Грамматика» (`#/grammar`: `grammar[] = {id, title, tag, rule, examples, items}`; пункт — выбор `{s, o, a, why}` или порядок слов `{type:"order", w:[слова по порядку], a:[верные варианты], tr}`; в парных связках ответ «即使…也» заполняет два ＿＿). Прогресс — `drills.json` в хранилище: `{"syn|gram:<id>:<i>": {n, ok, last}}`.
- `tests/catalog.json` — список тестов в каталоге.
- `tests/<id>/test.json` — сам тест, рядом `listening.mp3` и `img/`.
- Попытка (`results/<id>.json`): ответы, «не уверен», время, метки аудио, сочинения, самооценка. `vocab.json` — словарь, `mistakes.json` — прогресс по работе над ошибками.

## Как добавить новый тест (пользователь присылает PDF + mp3)
1. `pdftotext -layout` для текста, `pdfimages -j` для картинок. Ответы и текст аудио обычно в конце PDF; если нет — найти официальный ключ (например myhsk.org/files/hsk-5/tests/<код>/answers-<код>-(myhsk.org).pdf, digmandarin.com).
2. Создать `tests/<уровень>-<код>/test.json` по образцу `tests/hsk5-h51001/test.json`, скопировать mp3 как `listening.mp3`, картинки в `img/`.
3. Добавить запись в `tests/catalog.json`.

Формат вопросов:
- выбор: `{"n", "options":[4], "answer":"A-D", "tag", "prompt"?, "q"? (вопрос из аудио, показывается в разборе), "transcript"?}`
- группа: `{"label"?, "passage"?, "image"?, "transcript"?, "questions":[…]}`; в `passage` пропуск = `{46}`, подчёркивание = `[[текст]]`
- порядок слов: `{"type":"order", "words":[…], "accepted":[…], "note"}`
- сочинение: `{"type":"essay", "prompt", "required"?:[слова], "image"?, "minChars"}`
- `tag` — ключ из `TAGS` в `static/app.js` (lmeaning, lplace, ltime, lperson, lreason, ldetail, linfer, lattitude, laction, rword, rsent, rmatch, rdetail, rmain, rwordmeaning, rinfer, rreason, wadv, wattr, wprep, wba, wessay). Для других уровней HSK можно добавить новые теги.

## Анализ результатов
Когда пользователь просит проанализировать результаты — читать `results/*.json` из `ke2zo/hsk-data` (или `data/results/` локально) вместе с `test.json`, считать точность по `tag`, учитывать `unsure`, тексты сочинений в `essays`.
