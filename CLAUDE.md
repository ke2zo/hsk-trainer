# HSK тренажёр

Локальный сайт для решения пробных тестов HSK. Пользователь общается по-русски.

Запуск: `python3 server.py` (или двойной клик по `start.command`) → http://localhost:8765. Без зависимостей.

## Структура
- `server.py` — статика (с поддержкой Range для mp3) + API: `GET/POST /api/results`, `DELETE /api/results/<id>`, `GET/PUT /api/store/<name>`.
- `static/app.js` — всё приложение (hash-роутер). Типы вопросов и советы — объект `TAGS` в начале файла.
- `tests/catalog.json` — список тестов в каталоге.
- `tests/<id>/test.json` — сам тест, рядом `listening.mp3` и `img/`.
- `data/results/*.json` — попытки пользователя (ответы, «не уверен», время, метки аудио). `data/vocab.json` — словарь, `data/mistakes.json` — прогресс по работе над ошибками.

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
Когда пользователь просит проанализировать результаты — читать `data/results/*.json` вместе с `test.json`, считать точность по `tag`, учитывать `unsure`, тексты сочинений в `essays`.
