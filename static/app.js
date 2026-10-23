'use strict';
/* HSK тренажёр — одностраничное приложение без сборки.
   Данные тестов: tests/catalog.json + tests/<id>/test.json
   Результаты/словарь/ошибки хранятся на диске через server.py (data/). */

// ---------------- справочник типов вопросов ----------------
const SECTIONS = { listening: 'Аудирование', reading: 'Чтение', writing: 'Письмо' };
const TAGS = {
  lmeaning: { sec: 'listening', name: 'Скрытый смысл реплики', tip: 'В коротких диалогах ответ почти никогда не звучит дословно. Учи реакции-шаблоны: 放心吧 / 忘不了 = «обязательно сделаю», 哪里 / 别提了 = отрицание или жалоба, 那怎么行 = несогласие. Записывай такие фразы в словарь со СМЫСЛОМ, а не дословным переводом.' },
  lplace: { sec: 'listening', name: 'Место и ситуация', tip: 'Ловить слова-маркеры: 订桌/点菜 → ресторан, 存钱/取号/业务 → банк, 登机/航班 → аэропорт, 宴会/招待 → банкет. Составь для себя списки «место → 10 типичных слов».' },
  ltime: { sec: 'listening', name: 'Время и числа', tip: 'Пиши числа и даты прямо во время аудио. Классическая ловушка: в диалоге звучат две даты (今天15号 и 下个月中旬), спрашивают про одну. Выучи 月初 / 中旬 / 月底, 下周一二, 过两天.' },
  lperson: { sec: 'listening', name: 'Люди, профессии, отношения', tip: 'Запоминай косвенные обозначения: 我们家那位 = муж/жена, 领导, 同事, 班主任. Профессию определяют по действию (剪头发 → 理发师), отношения — по обращениям и теме (送文件给经理 → коллеги).' },
  lreason: { sec: 'listening', name: 'Причина', tip: 'Ищи ответ после 因为 / 由于 / 可是 / 结果 / 别提了. Часто упоминаются два обстоятельства — правильное то, что реально помешало (купила билет → но рейс отменили).' },
  ldetail: { sec: 'listening', name: 'Факты и детали', tip: 'До начала аудио прочитай 4 варианта и пойми, чем они отличаются. Во время прослушивания ставь отметку у каждого услышанного варианта — в монологах вопросы идут по порядку текста.' },
  linfer: { sec: 'listening', name: 'Вывод «что можно узнать»', tip: 'Правильный вариант — перефраз (做了大量的广告 → 做了很多宣传; 辞职…在银行上班 → 换工作了). Неправильные варианты используют слова из диалога, но искажают смысл. Тренируй синонимы и антонимы.' },
  lattitude: { sec: 'listening', name: 'Тон, эмоции, мнение', tip: 'Выучи лексику эмоций и тона HSK5: 责备 安慰 询问 夸奖 吃惊 愤怒 骄傲 满意 严格 疼爱 表扬 批评. Обращай внимание на интонацию и частицы 吧 / 嘛 / 呢 / 啊.' },
  laction: { sec: 'listening', name: 'Что делает человек', tip: 'Ответ всегда косвенный: «мультик сейчас закончится» → смотрит TV; «на трассе езжай медленнее» → ведёт машину. Спрашивай себя: где он и что у него в руках?' },
  rword: { sec: 'reading', name: 'Пропуск: выбор слова', tip: 'Это проверка сочетаемости (搭配): 戴眼镜, 充满活力, 欣赏景色, 一点儿办法也没有. Учи слова парами «глагол + объект», а для похожих слов (好像/相似/相同, 允许/赞成) выписывай разницу с примерами.' },
  rsent: { sec: 'reading', name: 'Пропуск: вставка фразы', tip: 'Читай предложение ДО и ПОСЛЕ пропуска, смотри на связки (要想…, 所以, 但是) и на пунктуацию (кавычки + «？» = вопрос). Подставь вариант и перечитай целиком.' },
  rmatch: { sec: 'reading', name: 'Совпадение по смыслу (61–70)', tip: 'Сначала варианты, потом текст. Вычёркивай варианты с абсолютами (都 / 从不 / 必须 / 没有) и несовпадающими цифрами. Верный ответ — перефраз одной фразы текста, а не «здравый смысл».' },
  rdetail: { sec: 'reading', name: 'Детали в длинном тексте', tip: 'Вопрос → ключевое слово → поиск в тексте (сканирование, не чтение подряд). Вопросы идут в порядке текста — это экономит время.' },
  rmain: { sec: 'reading', name: 'Главная мысль', tip: 'Главная мысль обычно в первом или последнем абзаце (道理, 告诉我们, 体会到). Отбрасывай варианты, которые верны, но слишком частные.' },
  rwordmeaning: { sec: 'reading', name: 'Значение слова/фразы в контексте', tip: 'Не вспоминай словарное значение — выводи из соседних предложений. Подставь вариант вместо слова и проверь, сохраняется ли смысл.' },
  rinfer: { sec: 'reading', name: 'Вывод по тексту', tip: 'Для каждого варианта ищи доказательство в тексте. Ловушки противоречат одной детали или говорят то, что герой ДУМАЛ, а не то, что было.' },
  rreason: { sec: 'reading', name: 'Причина и цель', tip: 'Ищи связки 因为 / 为了 / 所以 / 原来 / 想. Различай ожидание персонажа и реальность (保罗以为… 没想到…).' },
  wadv: { sec: 'writing', name: 'Порядок: наречия и модальные', tip: 'Формула: Подлежащее + время + наречие (已经/常常/偶尔/一定/总共) + модальный (会/能/要) + предложная группа + глагол + дополнение.' },
  wattr: { sec: 'writing', name: 'Определения и 的', tip: 'Порядок определения: притяжательное (他的) → указательное (这/那) → числ.+счётн. (一个/这段) → описание + 的 → существительное.' },
  wprep: { sec: 'writing', name: 'Предлоги и устойчивые конструкции', tip: 'Учи конструкции целиком: 给…留下…印象, 对…感兴趣, 跟…一样, 向…道歉, 被…所…' },
  wba: { sec: 'writing', name: 'Конструкция 把', tip: 'S + (已经/没/不) + 把 + O + V + результат/了. Наречия и отрицание — перед 把.' },
  wessay: { sec: 'writing', name: 'Сочинение (99–100)', tip: 'Шаблон: 1) время/место/кто; 2) что произошло (все 5 слов!); 3) чем закончилось + чувство/вывод. Пиши 90–110 иероглифов, используй 因为…所以, 虽然…但是, 不但…而且, 于是, 终于.' },
};
const RUBRIC = [
  'пусто / не по теме', 'несколько фраз', 'коротко, много ошибок',
  'смысл понятен, есть ошибки или не все слова', 'хорошо, мелкие ошибки', 'все слова, 80+ иероглифов, связно и без ошибок',
];

// ---------------- утилиты ----------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const L = i => 'ABCD'[i];
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const norm = s => String(s || '').replace(/[\s，。？！、,.?!：:“”"]/g, '');
const zhCount = s => (String(s || '').match(/[一-鿿]/g) || []).length;
const fmtTime = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const fmtDate = t => new Date(t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const dayKey = t => new Date(t).toISOString().slice(0, 10);
const color = p => p >= 80 ? 'var(--ok)' : p >= 60 ? 'var(--warn)' : 'var(--bad)';

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
async function api(path, method = 'GET', body) {
  const r = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status}`);
  return r.json();
}
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { } }
const b64enc = s => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(bin); };
const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));

// ---------------- хранилище ----------------
// github  — приватный репозиторий с данными (results/*.json, vocab.json, mistakes.json), работает и на GitHub Pages;
// local   — server.py, папка data/;
// browser — только localStorage этого браузера.
const GH_DEFAULT_REPO = 'ke2zo/hsk-data';
const Store = {
  mode: null, gh: null, sha: {}, queue: Promise.resolve(),
  async init() {
    this.gh = lsGet('hsk.gh');
    if (this.gh?.token) { this.mode = 'github'; return; }
    try {
      const r = await fetch('/api/results', { cache: 'no-store' });
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) { this.mode = 'local'; return; }
    } catch { }
    this.mode = lsGet('hsk.browserOnly') ? 'browser' : null;
  },
  where() {
    return { github: `репозиторий ${this.gh?.repo}`, local: 'папка data/ на компьютере', browser: 'только этот браузер' }[this.mode] || 'не настроено';
  },
  async loadAll() {
    if (this.mode === 'local') {
      const [results, vocab, mistakes, drills] = await Promise.all([api('/api/results'), api('/api/store/vocab'), api('/api/store/mistakes'), api('/api/store/drills')]);
      return { results, vocab, mistakes, drills };
    }
    if (this.mode === 'github') {
      const r = await this.ghReq('results');
      let results = [];
      if (r.ok) {
        const files = (await r.json()).filter(f => f.name.endsWith('.json'));
        results = await Promise.all(files.map(f => this.ghGet(f.path)));
      } else if (r.status !== 404) throw new Error(`GitHub ${r.status}`);
      const [vocab, mistakes, drills] = await Promise.all([this.ghGet('vocab.json'), this.ghGet('mistakes.json'), this.ghGet('drills.json')]);
      return { results, vocab, mistakes, drills };
    }
    return lsGet('hsk.data') || { results: [] };
  },
  saveResult(r) {
    if (this.mode === 'local') return api('/api/results', 'POST', r);
    if (this.mode === 'github') return this.ghPut(`results/${r.id}.json`, r, `result ${r.testId} ${new Date(r.finishedAt).toISOString().slice(0, 16)}`);
    return this.saveBrowser();
  },
  deleteResult(id) {
    if (this.mode === 'local') return api('/api/results/' + id, 'DELETE');
    if (this.mode === 'github') return this.ghDel(`results/${id}.json`);
    return this.saveBrowser();
  },
  save(name, obj) {
    if (this.mode === 'local') return api('/api/store/' + name, 'PUT', obj);
    if (this.mode === 'github') return this.ghPut(`${name}.json`, obj, `update ${name}`);
    return this.saveBrowser();
  },
  saveBrowser() { lsSet('hsk.data', { results: S.results, vocab: S.vocab, mistakes: S.mistakes, drills: S.drills }); return Promise.resolve(); },

  ghReq(path, opts = {}, repo = this.gh.repo, token = this.gh.token) {
    return fetch(`https://api.github.com/repos/${repo}${path == null ? '' : '/contents/' + path}`, {
      ...opts, cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
  },
  async ghGet(path) {
    const r = await this.ghReq(path);
    if (r.status === 404) { delete this.sha[path]; return null; }
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    const j = await r.json(); this.sha[path] = j.sha;
    return JSON.parse(b64dec(j.content));
  },
  // записи идут по очереди, чтобы не было конфликтов sha
  enqueue(fn) {
    const p = this.queue.then(fn);
    this.queue = p.catch(e => toast('Не удалось сохранить в GitHub: ' + e.message));
    return this.queue;
  },
  ghPut(path, obj, message) {
    const run = async retry => {
      const body = { message, content: b64enc(JSON.stringify(obj, null, 1)) };
      if (this.sha[path]) body.sha = this.sha[path];
      const r = await this.ghReq(path, { method: 'PUT', body: JSON.stringify(body) });
      if ((r.status === 409 || r.status === 422) && retry) { await this.ghGet(path); return run(false); }
      if (!r.ok) throw new Error(`${r.status}`);
      this.sha[path] = (await r.json()).content.sha;
    };
    return this.enqueue(() => run(true));
  },
  ghDel(path) {
    return this.enqueue(async () => {
      if (!this.sha[path]) await this.ghGet(path);
      if (!this.sha[path]) return;
      const r = await this.ghReq(path, { method: 'DELETE', body: JSON.stringify({ message: `delete ${path}`, sha: this.sha[path] }) });
      if (!r.ok) throw new Error(`${r.status}`);
      delete this.sha[path];
    });
  },
};

// ---------------- состояние ----------------
const S = { catalog: [], tests: {}, results: [], vocab: [], mistakes: {}, drills: {} };
let timerHandle = null;
let segAudio = null;

async function getTest(id) {
  if (!S.tests[id]) {
    const t = await (await fetch(`tests/${id}/test.json`)).json();
    t.base = `tests/${id}/`;
    t.qs = {};          // n -> {q, group, part, section}
    for (const sec of t.sections) for (const part of sec.parts) for (const g of part.groups) for (const q of g.questions) {
      q.type = q.type || 'choice';
      t.qs[q.n] = { q, group: g, part, section: sec };
    }
    S.tests[id] = t;
  }
  return S.tests[id];
}
const saveVocab = () => Store.save('vocab', S.vocab);
const saveMistakes = () => Store.save('mistakes', S.mistakes);
const saveDrills = () => Store.save('drills', S.drills);
const draft = { get: () => lsGet('hsk.draft'), set: d => lsSet('hsk.draft', d) };

// ---------------- подсчёт баллов ----------------
function grade(test, q, ans) {
  if (q.type === 'essay') return null;
  if (ans == null || ans === '') return 'skip';
  if (q.type === 'order') return q.accepted.some(a => norm(a) === norm(ans)) ? 'ok' : 'wrong';
  return ans === q.answer ? 'ok' : 'wrong';
}
function scoreResult(test, r) {
  const out = { sections: {}, byQ: {}, total: null };
  for (const sec of test.sections) {
    if (!r.sections.includes(sec.id)) continue;
    let correct = 0, total = 0, essayPts = 0, essayN = 0, essayScored = 0;
    for (const part of sec.parts) for (const g of part.groups) for (const q of g.questions) {
      if (q.type === 'essay') {
        essayN++;
        const s = r.selfScores?.[q.n];
        if (s != null) { essayScored++; essayPts += s; }
        out.byQ[q.n] = { status: null, essay: true };
        continue;
      }
      const st = grade(test, q, r.answers[q.n]);
      total++; if (st === 'ok') correct++;
      out.byQ[q.n] = { status: st, unsure: !!r.unsure?.[q.n] };
    }
    let score;
    if (sec.id === 'writing') {
      // ≈ шкала: 8 предложений = 50 баллов, 2 сочинения по 25 (самооценка 0–5)
      score = Math.round(correct / total * 50 + (essayN ? essayPts / (essayN * 5) * 50 : 0));
    } else score = Math.round(correct / total * 100);
    out.sections[sec.id] = { correct, total, score, essayPending: essayN > essayScored };
  }
  if (['listening', 'reading', 'writing'].every(s => out.sections[s])) {
    out.total = Object.values(out.sections).reduce((a, s) => a + s.score, 0);
  }
  return out;
}

// ---------------- роутер ----------------
const routes = [
  [/^#?\/?$/, home],
  [/^#\/catalog$/, catalogView],
  [/^#\/test\/([\w-]+)$/, testView],
  [/^#\/run$/, runView],
  [/^#\/result\/([\w-]+)$/, resultView],
  [/^#\/stats$/, statsView],
  [/^#\/mistakes$/, mistakesView],
  [/^#\/vocab$/, vocabView],
  [/^#\/hsk\/([1-5])$/, hskView],
  [/^#\/words$/, synView],
  [/^#\/grammar$/, gramView],
  [/^#\/guide$/, guideView],
  [/^#\/settings$/, settingsView],
];
async function render() {
  clearInterval(timerHandle); timerHandle = null;
  if (segAudio) segAudio.pause();
  const h = location.hash || '#/';
  if (!Store.mode && !/^#\/(settings|guide)$/.test(h)) { location.hash = '#/settings'; return; }
  $$('.topbar nav a').forEach(a => a.classList.toggle('active', h.startsWith(a.getAttribute('href'))));
  for (const [re, fn] of routes) {
    const m = h.match(re);
    if (m) { await fn(...m.slice(1)); return; }
  }
  $('#app').innerHTML = '<p>Страница не найдена. <a href="#/">На главную</a></p>';
}
const view = html => { $('#app').innerHTML = html; window.scrollTo(0, 0); };

// ---------------- главная ----------------
async function home() {
  const d = draft.get();
  const full = S.results.filter(r => r.sections.length === 3).sort((a, b) => b.finishedAt - a.finishedAt);
  let readiness = '<span class="muted">Пройди полный тест, чтобы увидеть оценку готовности</span>';
  if (full[0]) {
    const t = await getTest(full[0].testId), sc = scoreResult(t, full[0]);
    readiness = `<div class="score-big" style="color:${sc.total >= 180 ? 'var(--ok)' : 'var(--bad)'}">${sc.total}<span class="muted" style="font-size:18px"> / 300</span></div>
      <div class="muted small">последний полный тест · проходной балл 180</div>`;
  }
  const mcount = (await collectMistakes()).length;
  const recent = [...S.results].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 5);
  const recentRows = [];
  for (const r of recent) {
    const t = await getTest(r.testId), sc = scoreResult(t, r);
    recentRows.push(`<tr><td><a href="#/result/${r.id}">${esc(t.level)} · ${esc(t.title)}</a></td>
      <td>${r.sections.map(s => `${SECTIONS[s]}: <b>${sc.sections[s].score}</b>`).join(' · ')}</td>
      <td class="muted small">${fmtDate(r.finishedAt)}</td></tr>`);
  }
  view(`
    <div class="row" style="align-items:flex-start">
      <div><h1>你好！Готовимся к HSK</h1><p class="muted">Решай тесты, разбирай ошибки, отслеживай слабые места.</p></div>
      <div class="spacer"></div><div class="card" style="min-width:240px">${readiness}</div>
    </div>
    ${d ? `<div class="card" style="border-color:var(--accent)"><div class="row">
      <div><b>Незавершённая попытка</b><div class="muted small">${esc(d.testTitle)} · ${SECTIONS[d.sections[d.secIdx]]} · ${d.mode === 'exam' ? 'экзамен' : 'тренировка'}</div></div>
      <div class="spacer"></div><button class="btn" data-act="dropDraft">Удалить</button><a class="btn primary" href="#/run">Продолжить</a></div></div>` : ''}
    <div class="grid">
      <a class="tile" href="#/catalog"><div class="ico">试</div><b>Каталог тестов</b><span class="muted small">${S.catalog.length} тест(ов)</span></a>
      <a class="tile" href="#/mistakes"><div class="ico">错</div><b>Работа над ошибками</b><span class="muted small">${mcount} вопрос(ов) к повторению</span></a>
      <a class="tile" href="#/stats"><div class="ico">析</div><b>Статистика</b><span class="muted small">слабые места и прогресс</span></a>
      <a class="tile" href="#/vocab"><div class="ico">词</div><b>Мой словарь</b><span class="muted small">${S.vocab.length} слов · карточки</span></a>
      <a class="tile" href="#/words"><div class="ico">近</div><b>Похожие слова</b><span class="muted small">穿/戴, 了解/理解… · упражнения</span></a>
      <a class="tile" href="#/grammar"><div class="ico">语</div><b>Грамматика</b><span class="muted small">把, 被, связки, порядок слов</span></a>
      <a class="tile" href="#/guide"><div class="ico">法</div><b>Как готовиться</b><span class="muted small">стратегии и план</span></a>
    </div>
    <h2>Последние попытки</h2>
    ${recentRows.length ? `<div class="card"><table>${recentRows.join('')}</table></div>` : '<p class="muted">Пока пусто — начни с <a href="#/catalog">каталога</a>.</p>'}
  `);
}

// ---------------- каталог ----------------
async function catalogView() {
  const levels = {};
  for (const c of S.catalog) (levels[c.level] ||= []).push(c);
  let html = '<h1>Каталог тестов</h1>';
  for (const [lvl, items] of Object.entries(levels)) {
    html += `<h2>${esc(lvl)}</h2><div class="grid">`;
    for (const c of items) {
      const rs = S.results.filter(r => r.testId === c.id);
      let best = '';
      if (rs.length) {
        const t = await getTest(c.id);
        const tot = rs.map(r => scoreResult(t, r).total).filter(x => x != null);
        best = tot.length ? `<span class="pill ${Math.max(...tot) >= 180 ? 'ok' : 'warn'}">лучший: ${Math.max(...tot)}</span>` : '';
      }
      html += `<a class="tile" href="#/test/${c.id}"><div class="ico">${esc(c.title)}</div>
        <span class="muted small">${esc(c.note || '')}</span>
        <div class="row" style="margin-top:8px"><span class="pill">${rs.length} попыт.</span>${best}</div></a>`;
    }
    html += '</div>';
  }
  view(html);
}

// ---------------- страница теста ----------------
let chosenMode = lsGet('hsk.mode') || 'exam';
async function testView(id) {
  const t = await getTest(id);
  const rs = S.results.filter(r => r.testId === id).sort((a, b) => b.finishedAt - a.finishedAt);
  const secRows = t.sections.map(s => {
    const n = s.parts.reduce((a, p) => a + p.groups.reduce((b, g) => b + g.questions.length, 0), 0);
    return `<tr><td><b>${s.title}</b> <span class="zh muted" style="font-size:15px">${s.titleZh}</span></td><td>${n} вопр.</td><td>${s.timeLimitMin} мин</td>
      <td style="text-align:right"><button class="btn sm" data-act="start" data-test="${id}" data-secs="${s.id}">Только этот раздел</button></td></tr>`;
  }).join('');
  const hist = rs.map(r => {
    const sc = scoreResult(t, r);
    return `<tr><td><a href="#/result/${r.id}">${fmtDate(r.finishedAt)}</a></td><td>${r.mode === 'exam' ? 'экзамен' : 'тренировка'}</td>
      <td>${r.sections.map(s => `${SECTIONS[s]} <b>${sc.sections[s].score}</b>`).join(' · ')}</td><td><b>${sc.total ?? ''}</b></td></tr>`;
  }).join('');
  view(`
    <p><a href="#/catalog">← Каталог</a></p>
    <h1>${esc(t.level)} · ${esc(t.title)}</h1>
    <p class="muted">${esc(t.source || '')}</p>
    <div class="card">
      <div class="row"><b>Режим:</b>
        <div class="seg"><button data-act="mode" data-mode="exam" class="${chosenMode === 'exam' ? 'on' : ''}">Экзамен</button><button data-act="mode" data-mode="practice" class="${chosenMode === 'practice' ? 'on' : ''}">Тренировка</button></div>
      </div>
      <p class="muted small" id="modehint">${modeHint()}</p>
      <table>${secRows}</table>
      <div class="row" style="margin-top:14px"><div class="spacer"></div>
        <button class="btn primary" data-act="start" data-test="${id}" data-secs="${t.sections.map(s => s.id).join(',')}">▶ Полный тест</button></div>
    </div>
    <h2>История попыток</h2>
    ${hist ? `<div class="card"><table><tr><th>Дата</th><th>Режим</th><th>Разделы</th><th>Итог</th></tr>${hist}</table></div>` : '<p class="muted">Ещё не решал.</p>'}
  `);
}
const modeHint = () => chosenMode === 'exam'
  ? 'Как на настоящем экзамене: таймер на раздел, аудио без перемотки, ответы и разбор — только в конце.'
  : 'Без давления: аудио можно ставить на паузу и перематывать, ответ проверяется сразу, можно открыть текст аудио.';

async function startAttempt(testId, secs) {
  const t = await getTest(testId);
  if (draft.get() && !confirm('Есть незавершённая попытка. Начать новую и удалить старую?')) return;
  draft.set({
    id: 'r' + Date.now(), testId, testTitle: `${t.level} · ${t.title}`, mode: chosenMode, sections: secs, secIdx: 0,
    startedAt: Date.now(), secStartedAt: Date.now(), answers: {}, unsure: {}, times: {}, audioTimes: {}, orders: {}, secDur: {}, checked: {},
  });
  location.hash = '#/run';
}

// ---------------- прохождение ----------------
function passageHtml(text, answers, group) {
  let s = esc(text);
  s = s.replace(/\[\[(.+?)\]\]/g, '<u>$1</u>');
  s = s.replace(/\{(\d+)\}/g, (_, n) => {
    const q = group.questions.find(x => x.n == n);
    const a = answers?.[n];
    const fill = q && a ? esc(q.options['ABCD'.indexOf(a)]) : '&nbsp;';
    return `<span class="blank" data-blank="${n}"><small>${n}</small>${fill}</span>`;
  });
  return s;
}

function questionHtml(t, q, d, mode) {
  const ans = d.answers[q.n];
  const reveal = mode === 'review' || (d.mode === 'practice' && d.checked[q.n]);
  let body = '';
  if (q.type === 'choice') {
    body = `<div class="opts">${q.options.map((o, i) => {
      const l = L(i); let cls = ans === l ? 'sel' : '';
      if (reveal) cls = l === q.answer ? 'right' : (ans === l ? 'wrong' : '');
      return `<button class="opt ${cls}" data-act="choose" data-n="${q.n}" data-l="${l}" ${reveal ? 'disabled' : ''}><b>${l}</b><span>${esc(o)}</span></button>`;
    }).join('')}</div>`;
  } else if (q.type === 'order') {
    const used = d.orders[q.n] || [];
    const st = reveal ? grade(t, q, ans) : null;
    body = `<div class="answerline ${st === 'ok' ? 'ok' : st ? 'bad' : ''}">${used.map((wi, k) => `<button class="chip" data-act="unpick" data-n="${q.n}" data-k="${k}" ${reveal ? 'disabled' : ''}>${esc(q.words[wi])}</button>`).join('') || '<span class="muted small">нажимай на слова ниже по порядку</span>'}</div>
      ${reveal ? '' : `<div class="chips">${q.words.map((w, i) => `<button class="chip ${used.includes(i) ? 'used' : ''}" data-act="pick" data-n="${q.n}" data-i="${i}">${esc(w)}</button>`).join('')}</div>`}
      ${reveal ? `<div class="transcript">✔ ${q.accepted.map(esc).join('<br>✔ ')}${q.note ? `<div class="muted small" style="font-family:sans-serif">${esc(q.note)}</div>` : ''}</div>` : ''}`;
  } else if (q.type === 'essay') {
    const text = d.essays?.[q.n] ?? d.answers[q.n] ?? '';
    body = `<div style="margin:8px 0 0 38px">
      ${q.image ? `<img src="${t.base}${q.image}" style="max-height:240px;border-radius:8px;display:block;margin-bottom:8px">` : ''}
      ${q.required ? `<div data-req="${q.n}">${reqHtml(q, text)}</div>` : ''}
      ${mode === 'review' ? `<div class="transcript" style="margin-left:0">${esc(text) || '<span class="muted">(пусто)</span>'}</div>`
        : `<textarea data-essay="${q.n}" placeholder="写在这里…">${esc(text)}</textarea>`}
      <div class="muted small" data-count="${q.n}">иероглифов: ${zhCount(text)} / ~${q.minChars}</div></div>`;
  }
  const isListen = t.qs[q.n].section.id === 'listening';
  const tools = [];
  if (mode !== 'review' && q.type !== 'essay') tools.push(`<button class="unsure ${d.unsure[q.n] ? 'on' : ''}" data-act="unsure" data-n="${q.n}">? не уверен</button>`);
  if (d.mode === 'practice' && mode !== 'review' && q.type === 'order' && !reveal) tools.push(`<button class="btn sm" data-act="checkorder" data-n="${q.n}">Проверить</button>`);
  if (isListen && reveal && q.transcript) tools.push(`<details><summary>Текст аудио</summary><div class="transcript" style="margin-left:0">${esc(q.transcript)}</div></details>`);
  const prompt = q.prompt || (reveal && q.q ? q.q : '');
  return `<div class="q" id="q${q.n}"><div class="qhead"><span class="qnum">${q.n}.</span><span class="zh">${esc(prompt)}</span></div>
    ${body}<div class="qtools">${tools.join('')}</div></div>`;
}
const reqHtml = (q, text) => q.required.map(w => `<span class="req ${text.includes(w) ? 'ok' : ''}">${esc(w)}</span>`).join('');

async function runView() {
  const d = draft.get();
  if (!d) { location.hash = '#/'; return; }
  const t = await getTest(d.testId);
  const sec = t.sections.find(s => s.id === d.sections[d.secIdx]);
  const qs = sec.parts.flatMap(p => p.groups.flatMap(g => g.questions));
  const last = d.secIdx === d.sections.length - 1;
  let html = `
    <div class="runbar">
      <div class="row">
        <b>${esc(d.testTitle)} · ${sec.title}</b><span class="pill ${d.mode === 'exam' ? 'blue' : 'warn'}">${d.mode === 'exam' ? 'экзамен' : 'тренировка'}</span>
        <span class="muted small">раздел ${d.secIdx + 1}/${d.sections.length}</span>
        <div class="spacer"></div><span class="timer" id="timer">--:--</span>
        <button class="btn primary sm" data-act="finishSec">${last ? 'Завершить тест' : 'Следующий раздел →'}</button>
      </div>
      ${sec.audio ? playerHtml(t, sec, d) : ''}
      <div class="navgrid" id="navgrid">${qs.map(q => `<a href="javascript:void(0)" data-act="jump" data-n="${q.n}" id="nav${q.n}">${q.n}</a>`).join('')}</div>
    </div>`;
  for (const part of sec.parts) {
    html += `<div class="part-title">${esc(part.title)} <span class="muted small" style="font-family:sans-serif">${esc(part.instructions)}</span></div>`;
    for (const g of part.groups) {
      html += `<div class="group">`;
      if (g.label && !g.passage) html += `<div class="muted small">${esc(g.label)}</div>`;
      if (g.passage) html += `<div class="passage zh" data-passage>${g.image ? `<img src="${t.base}${g.image}" alt="">` : ''}${passageHtml(g.passage, d.answers, g)}</div>`;
      for (const q of g.questions) html += questionHtml(t, q, d, 'run');
      if (g.transcript && d.mode === 'practice') html += `<details style="margin-top:8px"><summary>Текст аудио (${esc(g.label || '')})</summary><div class="transcript" style="margin-left:0">${esc(g.transcript)}</div></details>`;
      html += `</div>`;
    }
  }
  view(html);
  refreshNav(t, d, qs);
  if (sec.audio) setupPlayer(d);
  const limit = (sec.timeLimitMin || 0) * 60;
  const tick = () => {
    const el = $('#timer'); if (!el) return;
    const spent = (Date.now() - draft.get().secStartedAt) / 1000;
    if (d.mode === 'exam' && limit) {
      const left = limit - spent; el.textContent = fmtTime(left); el.classList.toggle('low', left < 300);
      if (left <= 0) { clearInterval(timerHandle); toast('Время раздела вышло'); finishSection(); }
    } else el.textContent = fmtTime(spent);
  };
  tick(); timerHandle = setInterval(tick, 1000);
}

function playerHtml(t, sec, d) {
  const src = t.base + sec.audio;
  if (d.mode === 'practice') return `<div class="player"><audio id="audio" src="${src}" controls preload="metadata"></audio>
    <button class="btn sm" data-act="back5">−5 с</button>
    <select id="rate"><option value="0.8">0.8×</option><option value="0.9">0.9×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select></div>`;
  return `<div class="player"><audio id="audio" src="${src}" preload="metadata"></audio>
    <button class="btn sm" id="playbtn" data-act="play">▶ Запустить аудио</button>
    <div class="bar"><i id="abar" style="width:0"></i></div><span class="small muted" id="atime">0:00</span></div>`;
}
function setupPlayer(d) {
  const a = $('#audio');
  const pos = lsGet('hsk.audiopos');
  a.addEventListener('loadedmetadata', () => { if (pos && pos.id === d.id) a.currentTime = pos.t; }, { once: true });
  a.addEventListener('timeupdate', () => {
    if ($('#abar')) { $('#abar').style.width = pct(a.currentTime, a.duration || 1) + '%'; $('#atime').textContent = `${fmtTime(a.currentTime)} / ${fmtTime(a.duration || 0)}`; }
    if (Math.floor(a.currentTime) % 3 === 0) lsSet('hsk.audiopos', { id: d.id, t: a.currentTime });
  });
  a.addEventListener('ended', () => { if ($('#playbtn')) $('#playbtn').textContent = '✓ Аудио закончилось'; toast('Аудио закончилось — проверь ответы и переходи дальше'); });
  const rate = $('#rate'); if (rate) rate.onchange = () => { a.playbackRate = +rate.value; };
}

function refreshNav(t, d, qs) {
  for (const q of qs) {
    const el = $('#nav' + q.n); if (!el) continue;
    let cls = '';
    const a = q.type === 'essay' ? d.essays?.[q.n] : d.answers[q.n];
    if (a) cls = 'done';
    if (d.mode === 'practice' && d.checked[q.n]) cls = grade(t, q, d.answers[q.n]) === 'ok' ? 'ok' : 'bad';
    if (d.unsure[q.n]) cls = 'uns';
    el.className = cls;
  }
}
async function rerenderQ(n) {
  const d = draft.get(), t = await getTest(d.testId);
  const { q, group, section } = t.qs[n];
  const el = $('#q' + n); if (!el) return;
  el.outerHTML = questionHtml(t, q, d, 'run');
  const p = $('#q' + n).closest('.group').querySelector('[data-passage]');
  if (p) p.innerHTML = (group.image ? `<img src="${t.base}${group.image}" alt="">` : '') + passageHtml(group.passage, d.answers, group);
  refreshNav(t, d, section.parts.flatMap(pp => pp.groups.flatMap(g => g.questions)));
}
function updDraft(fn) { const d = draft.get(); fn(d); draft.set(d); return d; }
function stamp(d, n) {
  d.times[n] = Date.now() - d.secStartedAt;
  const a = $('#audio'); if (a && !a.paused) d.audioTimes[n] = a.currentTime;
  else if (a && a.currentTime > 0) d.audioTimes[n] = a.currentTime;
}

async function finishSection() {
  const d = draft.get(); if (!d) return;
  const t = await getTest(d.testId);
  const sec = t.sections.find(s => s.id === d.sections[d.secIdx]);
  const qs = sec.parts.flatMap(p => p.groups.flatMap(g => g.questions));
  const left = qs.filter(q => !(q.type === 'essay' ? d.essays?.[q.n] : d.answers[q.n])).length;
  const exp = (d.mode === 'exam' && (Date.now() - d.secStartedAt) / 1000 >= (sec.timeLimitMin || 0) * 60);
  if (!exp && left && !confirm(`Без ответа: ${left}. Завершить раздел?`)) return;
  d.secDur[sec.id] = Date.now() - d.secStartedAt;
  if (d.secIdx < d.sections.length - 1) {
    d.secIdx++; d.secStartedAt = Date.now(); draft.set(d); lsSet('hsk.audiopos', null); runView(); return;
  }
  const r = {
    id: d.id, testId: d.testId, mode: d.mode, sections: d.sections, startedAt: d.startedAt, finishedAt: Date.now(),
    answers: d.answers, unsure: d.unsure, times: d.times, audioTimes: d.audioTimes, essays: d.essays || {}, secDur: d.secDur, selfScores: {},
  };
  for (const n in r.essays) r.answers[n] = r.essays[n];
  r.summary = scoreResult(t, r);
  S.results.push(r);
  await Store.saveResult(r);
  draft.set(null); lsSet('hsk.audiopos', null);
  location.hash = '#/result/' + r.id;
}

// ---------------- результат и разбор ----------------
let reviewFilter = 'all';
async function resultView(rid) {
  const r = S.results.find(x => x.id === rid);
  if (!r) { view('<p>Результат не найден.</p>'); return; }
  const t = await getTest(r.testId), sc = scoreResult(t, r);
  const kpis = r.sections.map(s => {
    const x = sc.sections[s];
    return `<div class="kpi"><div class="l">${SECTIONS[s]}</div><div class="v" style="color:${color(x.score)}">${x.score}<span class="muted" style="font-size:15px"> /100</span></div>
      <div class="l">${x.correct}/${x.total} верно${s === 'writing' ? ' (91–98)' : ''}${x.essayPending ? ' · <b style="color:var(--warn)">оцени сочинения ↓</b>' : ''}${r.secDur?.[s] ? ` · ${fmtTime(r.secDur[s] / 1000)}` : ''}</div></div>`;
  }).join('');
  const tagStats = tagAgg([r]);
  let html = `
    <p><a href="#/test/${r.testId}">← ${esc(t.level)} · ${esc(t.title)}</a></p>
    <div class="row"><h1 style="margin:0">Результат</h1><span class="muted">${fmtDate(r.finishedAt)} · ${r.mode === 'exam' ? 'экзамен' : 'тренировка'}</span>
      <div class="spacer"></div><button class="btn sm" data-act="copyResult" data-rid="${r.id}">Скопировать для Claude</button><button class="btn sm danger" data-act="delResult" data-rid="${r.id}">Удалить</button></div>
    ${sc.total != null ? `<div class="card row" style="margin-top:14px"><div class="score-big" style="color:${sc.total >= 180 ? 'var(--ok)' : 'var(--bad)'}">${sc.total}</div><div><b>${sc.total >= 180 ? 'Проходной балл набран ✓' : `До проходного (180) не хватает ${180 - sc.total}`}</b><div class="muted small">Письмо считается приблизительно: 91–98 = 50 баллов, сочинения = 50 (по твоей самооценке).</div></div></div>` : ''}
    <div class="kpis" style="margin-top:14px">${kpis}</div>
    <h2>По типам вопросов</h2><div class="card">${tagBars(tagStats)}</div>
    ${weakTips(tagStats)}`;
  const essays = r.sections.includes('writing') ? t.sections.find(s => s.id === 'writing').parts.flatMap(p => p.groups.flatMap(g => g.questions)).filter(q => q.type === 'essay') : [];
  if (essays.length) {
    html += `<h2>Самооценка сочинений</h2>`;
    for (const q of essays) {
      const text = r.essays?.[q.n] || '';
      const cur = r.selfScores?.[q.n];
      html += `<div class="card"><div class="row"><b>${q.n}.</b><span class="zh" style="font-size:15px">${esc(q.prompt)}</span><div class="spacer"></div>
        <button class="btn sm" data-act="copyEssay" data-rid="${r.id}" data-n="${q.n}">Проверить с Claude (копировать)</button></div>
        ${q.required ? `<div>${reqHtml(q, text)}</div>` : ''}
        <div class="transcript" style="margin-left:0">${esc(text) || '<span class="muted">(пусто)</span>'}</div>
        <div class="muted small">иероглифов: ${zhCount(text)} (нужно ~${q.minChars})</div>
        <div class="row" style="margin-top:8px">${RUBRIC.map((txt, i) => `<button class="btn sm ${cur === i ? 'primary' : ''}" title="${esc(txt)}" data-act="selfScore" data-rid="${r.id}" data-n="${q.n}" data-v="${i}">${i}</button>`).join('')}
        <span class="muted small">${cur != null ? esc(RUBRIC[cur]) : 'наведи на балл, чтобы увидеть критерий'}</span></div></div>`;
    }
  }
  html += `<h2>Разбор</h2>
    <div class="row" style="margin-bottom:10px"><div class="seg">
      ${[['all', 'Все'], ['wrong', 'Ошибки'], ['unsure', 'Не уверен']].map(([k, v]) => `<button data-act="rfilter" data-f="${k}" data-rid="${r.id}" class="${reviewFilter === k ? 'on' : ''}">${v}</button>`).join('')}
    </div><span class="muted small">Выдели слово в тексте и нажми «+ в словарь», чтобы сохранить его.</span></div>`;
  const dd = { answers: r.answers, unsure: r.unsure || {}, orders: {}, essays: r.essays, mode: r.mode, checked: {} };
  for (const n in r.answers) { const q = t.qs[n]?.q; if (q?.type === 'order') dd.orders[n] = orderIdx(q, r.answers[n]); }
  for (const secId of r.sections) {
    const sec = t.sections.find(s => s.id === secId);
    html += `<h3>${sec.title}</h3>`;
    for (const part of sec.parts) for (const g of part.groups) {
      const shown = g.questions.filter(q => q.type !== 'essay' && passFilter(sc.byQ[q.n]));
      if (!shown.length) continue;
      html += `<div class="group">`;
      if (g.passage) html += `<details ${g.passage.includes('{') || g.passage.length < 260 ? 'open' : ''}><summary>Текст ${esc(g.label || '')}</summary><div class="passage zh">${g.image ? `<img src="${t.base}${g.image}" alt="">` : ''}${passageHtml(g.passage, r.answers, g)}</div></details>`;
      if (g.transcript) html += `<details><summary>Текст аудио ${esc(g.label || '')}</summary><div class="transcript" style="margin-left:0">${esc(g.transcript)}</div></details>`;
      for (const q of shown) {
        const b = sc.byQ[q.n];
        let qh = questionHtml(t, q, dd, 'review');
        const badge = b.status === 'ok' ? '<span class="pill ok">верно</span>' : b.status === 'skip' ? '<span class="pill bad">нет ответа</span>' : '<span class="pill bad">ошибка</span>';
        const extra = `${badge}${b.unsure ? '<span class="pill warn">не уверен</span>' : ''}<span class="pill">${esc(TAGS[q.tag]?.name || q.tag)}</span>
          ${segmentFor(t, r, q.n) ? `<button class="btn sm" data-act="seg" data-rid="${r.id}" data-n="${q.n}">▶ фрагмент аудио</button>` : ''}
          <button class="btn sm" data-act="ask" data-test="${t.id}" data-n="${q.n}" data-ans="${esc(r.answers[q.n] || '')}">Спросить Claude</button>
          <button class="btn sm" data-act="addWord" data-src="${esc(t.title)} #${q.n}">+ в словарь</button>`;
        qh = qh.replace('<div class="qtools">', `<div class="qtools">${extra}`);
        html += qh;
      }
      html += `</div>`;
    }
  }
  view(html);
}
const passFilter = b => reviewFilter === 'all' || (reviewFilter === 'wrong' && b.status !== 'ok') || (reviewFilter === 'unsure' && b.unsure);
function orderIdx(q, text) {
  // восстановить порядок фишек по строке ответа
  const res = [], used = new Set(); let rest = norm(text);
  while (rest) {
    const i = q.words.findIndex((w, k) => !used.has(k) && rest.startsWith(norm(w)));
    if (i < 0) break; used.add(i); res.push(i); rest = rest.slice(norm(q.words[i]).length);
  }
  return res;
}
// фрагмент аудио: от предыдущего ответа до текущего (по меткам времени, записанным во время теста)
function segmentFor(t, r, n) {
  if (t.qs[n].section.id !== 'listening' || r.audioTimes?.[n] == null) return null;
  const end = r.audioTimes[n];
  const prev = Object.entries(r.audioTimes).map(([k, v]) => [+k, v]).filter(([k, v]) => k < n && v < end).map(([, v]) => v);
  let start = prev.length ? Math.max(...prev) : Math.max(0, end - 60);
  if (end - start > 150) start = end - 60;
  return { src: t.base + t.qs[n].section.audio, start: Math.max(0, start - 2), end: end + 1 };
}
function playSegment(seg, btn) {
  if (!segAudio) segAudio = new Audio();
  if (!segAudio.paused && segAudio._btn === btn) { segAudio.pause(); return; }
  if (!segAudio.src.endsWith(seg.src)) segAudio.src = seg.src;
  segAudio._btn = btn;
  const go = () => { segAudio.currentTime = seg.start; segAudio.play(); };
  segAudio.readyState >= 1 ? go() : segAudio.addEventListener('loadedmetadata', go, { once: true });
  segAudio.ontimeupdate = () => { if (segAudio.currentTime >= seg.end) segAudio.pause(); };
  segAudio.onpause = () => { if (segAudio._btn) segAudio._btn.textContent = '▶ фрагмент аудио'; };
  btn.textContent = '■ стоп';
}

// ---------------- аналитика ----------------
function tagAgg(results) {
  const agg = {};
  for (const r of results) {
    const t = S.tests[r.testId]; if (!t) continue;
    const sc = scoreResult(t, r);
    for (const [n, b] of Object.entries(sc.byQ)) {
      if (b.essay) continue;
      const tag = t.qs[n].q.tag;
      const a = agg[tag] ||= { ok: 0, n: 0, unsure: 0 };
      a.n++; if (b.status === 'ok') a.ok++; if (b.unsure) a.unsure++;
    }
  }
  return agg;
}
function tagBars(agg) {
  const rows = Object.entries(agg).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  if (!rows.length) return '<p class="muted">Нет данных.</p>';
  return rows.map(([tag, a]) => {
    const p = pct(a.ok, a.n);
    return `<div class="hbar"><div><span class="pill">${SECTIONS[TAGS[tag]?.sec] || ''}</span> ${esc(TAGS[tag]?.name || tag)}</div>
      <div class="track"><i style="width:${p}%;background:${color(p)}"></i></div>
      <div class="num"><b>${p}%</b> <span class="muted">${a.ok}/${a.n}${a.unsure ? ` · ?${a.unsure}` : ''}</span></div></div>`;
  }).join('');
}
function weakTips(agg, limit = 3) {
  const weak = Object.entries(agg).filter(([, a]) => a.n >= 2 && (a.ok / a.n < 0.8 || a.unsure / a.n >= 0.3))
    .sort((a, b) => (a[1].ok - a[1].unsure * 0.5) / a[1].n - (b[1].ok - b[1].unsure * 0.5) / b[1].n).slice(0, limit);
  if (!weak.length) return '';
  return `<h2>Что подтянуть в первую очередь</h2>` + weak.map(([tag, a]) =>
    `<div class="tip"><b>${esc(TAGS[tag]?.name || tag)}</b> — ${pct(a.ok, a.n)}% верно${a.unsure ? `, ${a.unsure} раз не уверен` : ''}<div>${esc(TAGS[tag]?.tip || '')}</div></div>`).join('');
}
async function statsView() {
  for (const r of S.results) await getTest(r.testId);
  const rs = [...S.results].sort((a, b) => a.finishedAt - b.finishedAt);
  if (!rs.length) { view('<h1>Статистика</h1><p class="muted">Пока нет результатов. Реши тест в <a href="#/catalog">каталоге</a>.</p>'); return; }
  const recent = rs.slice(-5);
  const all = tagAgg(rs), last = tagAgg(recent);
  const secHist = { listening: [], reading: [], writing: [] };
  for (const r of rs) { const sc = scoreResult(S.tests[r.testId], r); for (const s of r.sections) secHist[s].push({ t: r.finishedAt, v: sc.sections[s].score }); }
  let totalQ = 0, okQ = 0, unsQ = 0, unsOk = 0;
  for (const r of rs) for (const b of Object.values(scoreResult(S.tests[r.testId], r).byQ)) {
    if (b.essay) continue; totalQ++; if (b.status === 'ok') okQ++; if (b.unsure) { unsQ++; if (b.status === 'ok') unsOk++; }
  }
  const pace = ['listening', 'reading', 'writing'].map(s => {
    const xs = rs.filter(r => r.secDur?.[s] && r.mode === 'exam'); if (!xs.length) return '';
    const avg = xs.reduce((a, r) => a + r.secDur[s], 0) / xs.length / 1000;
    const lim = { listening: 35, reading: 45, writing: 40 }[s] * 60;
    return `<div class="kpi"><div class="l">${SECTIONS[s]}: среднее время</div><div class="v">${fmtTime(avg)}</div><div class="l">лимит ${fmtTime(lim)}</div></div>`;
  }).join('');
  view(`
    <h1>Статистика и слабые места</h1>
    <div class="kpis">
      <div class="kpi"><div class="l">Попыток</div><div class="v">${rs.length}</div></div>
      <div class="kpi"><div class="l">Точность (всё время)</div><div class="v" style="color:${color(pct(okQ, totalQ))}">${pct(okQ, totalQ)}%</div><div class="l">${okQ}/${totalQ}</div></div>
      <div class="kpi"><div class="l">«Не уверен» → угадал</div><div class="v">${unsQ ? pct(unsOk, unsQ) + '%' : '—'}</div><div class="l">${unsQ} отметок; если ≈25–50% — это угадывание</div></div>
      ${pace}
    </div>
    <h2>Динамика по разделам</h2><div class="card">${trendChart(secHist)}</div>
    ${weakTips(last, 4).replace('Что подтянуть в первую очередь', 'Что подтянуть в первую очередь (последние 5 попыток)')}
    <h2>Точность по типам вопросов</h2>
    <div class="card"><h3 style="margin-top:0">Последние ${recent.length} попыт.</h3>${tagBars(last)}</div>
    ${rs.length > recent.length ? `<div class="card"><h3 style="margin-top:0">За всё время</h3>${tagBars(all)}</div>` : ''}
    <p class="muted small">Совет: скажи Claude «проанализируй мои результаты» — все попытки сохраняются (${esc(Store.where())}), по ним можно составить персональный план.</p>
  `);
}
function trendChart(h) {
  const W = 760, H = 220, P = 34;
  const series = Object.entries(h).filter(([, v]) => v.length);
  const n = Math.max(...series.map(([, v]) => v.length));
  const colors = { listening: '#2457c5', reading: '#c8102e', writing: '#1f8a4c' };
  const x = i => P + (n <= 1 ? (W - 2 * P) / 2 : i * (W - 2 * P) / (n - 1)), y = v => H - P - v / 100 * (H - 2 * P);
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}">`;
  for (const g of [0, 60, 80, 100]) svg += `<line x1="${P}" x2="${W - P}" y1="${y(g)}" y2="${y(g)}" stroke="currentColor" opacity="${g === 60 ? .35 : .12}" ${g === 60 ? 'stroke-dasharray="4 4"' : ''}/><text x="4" y="${y(g) + 4}" font-size="11" fill="currentColor" opacity=".6">${g}</text>`;
  for (const [s, v] of series) {
    svg += `<polyline fill="none" stroke="${colors[s]}" stroke-width="2.5" points="${v.map((p, i) => `${x(i)},${y(p.v)}`).join(' ')}"/>`;
    v.forEach((p, i) => { svg += `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="${colors[s]}"><title>${SECTIONS[s]}: ${p.v} (${fmtDate(p.t)})</title></circle>`; });
  }
  svg += '</svg>';
  return svg + `<div class="row small">${series.map(([s]) => `<span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${colors[s]}"></span> ${SECTIONS[s]}</span>`).join('')}<span class="muted">пунктир — 60 баллов (≈ проходной уровень раздела)</span></div>`;
}

// ---------------- работа над ошибками ----------------
// Вопрос попадает сюда, если в последней попытке он решён неверно или с пометкой «не уверен».
// Уходит, когда решён правильно 2 раза в разные дни.
async function collectMistakes() {
  const latest = {};
  for (const r of [...S.results].sort((a, b) => a.finishedAt - b.finishedAt)) {
    const t = await getTest(r.testId), sc = scoreResult(t, r);
    for (const [n, b] of Object.entries(sc.byQ)) {
      if (b.essay) continue;
      latest[`${r.testId}#${n}`] = { testId: r.testId, n: +n, bad: b.status !== 'ok' || b.unsure, at: r.finishedAt, rid: r.id, ans: r.answers[n] };
    }
  }
  return Object.entries(latest).filter(([k, v]) => {
    if (!v.bad) return false;
    const m = S.mistakes[k];
    return !(m && m.mastered && m.masteredAt > v.at);
  }).map(([k, v]) => ({ key: k, ...v }));
}
let M = null; // {queue, i, answered}
async function mistakesView() {
  const list = await collectMistakes();
  if (M && M.queue.length) return mistakeCard();
  const by = {};
  for (const m of list) { const t = await getTest(m.testId); const tag = t.qs[m.n].q.tag; (by[tag] ||= []).push(m); }
  view(`
    <h1>Работа над ошибками</h1>
    <p class="muted">Здесь собираются вопросы, на которые ты ответил неверно или отметил «не уверен». Вопрос уходит из списка, когда ты решишь его правильно <b>2 раза в разные дни</b> — так работает интервальное повторение.</p>
    ${list.length ? `<div class="card"><div class="row"><b>Всего: ${list.length}</b><div class="spacer"></div>
      <button class="btn primary" data-act="mstart" data-tag="">Тренировать все (вперемешку)</button></div></div>
      <div class="card">${Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([tag, xs]) => `<div class="hbar" style="grid-template-columns:1fr auto auto">
        <div><span class="pill">${SECTIONS[TAGS[tag]?.sec]}</span> ${esc(TAGS[tag]?.name || tag)}</div><b>${xs.length}</b>
        <button class="btn sm" data-act="mstart" data-tag="${tag}">Тренировать</button></div>`).join('')}</div>`
      : '<p class="card">🎉 Список пуст. Реши новый тест — ошибки появятся здесь автоматически.</p>'}
  `);
}
async function mistakeCard() {
  const item = M.queue[M.i];
  if (!item) {
    view(`<div class="card flash"><div class="w">完成!</div><p>Решено ${M.done} · верно ${M.ok}</p><button class="btn primary" data-act="mexit">К списку</button></div>`);
    M = null; return;
  }
  const t = await getTest(item.testId);
  const { q, group, section } = t.qs[item.n];
  const d = { answers: {}, unsure: {}, orders: {}, essays: {}, mode: 'practice', checked: {} };
  if (M.answered) { d.answers[q.n] = M.answered; d.checked[q.n] = true; if (q.type === 'order') d.orders[q.n] = orderIdx(q, M.answered); }
  else if (q.type === 'order') d.orders[q.n] = M.order || [];
  const r = S.results.find(x => x.id === item.rid);
  const seg = r && segmentFor(t, r, q.n);
  let ctx = '';
  if (section.id === 'listening') {
    const tr = q.transcript || group.transcript;
    ctx = `<div class="row">${seg ? `<button class="btn" data-act="seg" data-rid="${r.id}" data-n="${q.n}">▶ фрагмент аудио</button>` : '<span class="muted small">Фрагмент аудио недоступен — прочитай текст.</span>'}</div>
      <details ${M.answered || !seg ? 'open' : ''} style="margin-top:8px"><summary>Текст аудио</summary><div class="transcript" style="margin-left:0">${esc(tr)}</div></details>
      ${q.q ? `<p class="zh">问：${esc(q.q)}</p>` : ''}`;
  } else if (group.passage) ctx = `<div class="passage zh">${passageHtml(group.passage, d.answers, group)}</div>`;
  view(`
    <div class="row"><a href="javascript:void(0)" data-act="mexit">← К списку</a><div class="spacer"></div>
      <span class="muted">${M.i + 1} / ${M.queue.length}</span><span class="pill">${esc(t.title)} #${q.n}</span><span class="pill">${esc(TAGS[q.tag]?.name)}</span></div>
    <div class="group" style="margin-top:12px">${ctx}${questionHtml(t, q, d, 'mistake').replace('<div class="qtools">', '<div class="qtools" style="display:none">')}
      ${q.type === 'order' && !M.answered ? `<div class="qtools"><button class="btn sm" data-act="mcheck">Проверить</button></div>` : ''}
      ${M.answered ? `<div class="qtools"><span class="pill ${grade(t, q, M.answered) === 'ok' ? 'ok' : 'bad'}">${grade(t, q, M.answered) === 'ok' ? 'верно' : 'неверно, правильно: ' + (q.answer || '')}</span>
        <button class="btn sm" data-act="ask" data-test="${t.id}" data-n="${q.n}" data-ans="${esc(M.answered)}">Спросить Claude</button>
        <button class="btn sm" data-act="addWord" data-src="${esc(t.title)} #${q.n}">+ в словарь</button>
        <div class="spacer"></div><button class="btn primary" data-act="mnext">Дальше →</button></div>
        <div class="tip">${esc(TAGS[q.tag]?.tip || '')}</div>` : ''}
    </div>`);
}
async function mistakeAnswer(ans) {
  const item = M.queue[M.i], t = await getTest(item.testId), q = t.qs[item.n].q;
  M.answered = ans; M.done++;
  const ok = grade(t, q, ans) === 'ok'; if (ok) M.ok++;
  const m = S.mistakes[item.key] ||= { streak: 0, days: [] };
  const today = dayKey(Date.now());
  if (ok) { if (!m.days.includes(today)) { m.days.push(today); m.streak++; } }
  else { m.streak = 0; m.days = []; m.mastered = false; }
  if (m.streak >= 2) { m.mastered = true; m.masteredAt = Date.now(); }
  saveMistakes();
  mistakeCard();
}

// ---------------- словарь ----------------
let flash = null;
// официальный список HSK 2.0 (уровни 1–5, ~2500 слов) с русским переводом: static/hsk-words.json
let HSK = null;
const hskWords = async () => HSK ||= await fetch('static/hsk-words.json').then(r => r.json());
let hskLevel = lsGet('hsk.level') || 5;
async function vocabView() {
  if (flash) return flashView();
  const due = todayCards().length;
  const hsk = await hskWords(), mine = new Set(S.vocab.map(v => v.w));
  const lvl = hsk.filter(x => x.l === hskLevel), have = lvl.filter(x => mine.has(x.w)).length;
  view(`
    <h1>Мой словарь</h1>
    <div class="card"><div class="row">
      <button class="btn primary" data-act="addWord" data-src="вручную">+ Добавить слово</button>
      <button class="btn" data-act="flashStart" ${S.vocab.length ? '' : 'disabled'}>Карточки (${due} на сегодня)</button>
      <div class="spacer"></div><button class="btn sm" data-act="exportCsv" ${S.vocab.length ? '' : 'disabled'}>Экспорт CSV (Anki / Pleco)</button></div>
      <p class="muted small">Добавляй незнакомые слова из разбора теста: выдели слово мышкой → «+ в словарь». Карточки работают по системе Лейтнера: знаешь — интервал растёт (1→3→7→14→30 дней), не знаешь — карточка возвращается завтра.</p></div>
    <div class="card"><div class="row">
      <b>Слова HSK</b><div class="seg">
        ${[1, 2, 3, 4, 5].map(l => `<button data-act="hskLevel" data-l="${l}" class="${l === hskLevel ? 'on' : ''}">${l}</button>`).join('')}
      </div><span class="muted">в словаре ${have} из ${lvl.length}</span>
      <div class="spacer"></div>
      <button class="btn primary" data-act="hskAddAll" data-l="${hskLevel}" ${have < lvl.length ? '' : 'disabled'}>+ Добавить все (${lvl.length - have})</button>
      <a class="btn" href="#/hsk/${hskLevel}">Весь список</a></div>
      <div class="bar" style="margin-top:12px"><i style="width:${pct(have, lvl.length)}%;background:var(--ok)"></i></div>
      <p class="muted small">Все слова уровня с пиньинем и переводом. HSK 5 — это 1300 новых слов поверх 1200 слов HSK 1–4. Новых карточек приходит не больше ${NEW_PER_DAY} в день (свои слова из тестов — первыми), так весь уровень пройдёшь за ~2 месяца.</p></div>
    ${S.vocab.length ? `<div class="card"><table><tr><th>Слово</th><th>Пиньинь</th><th>Перевод</th><th>Откуда</th><th>Уровень</th><th></th></tr>
      ${S.vocab.map((v, i) => `<tr><td class="zh">${esc(v.w)}</td><td>${esc(v.py)}</td><td>${esc(v.tr)}</td><td class="muted small">${esc(v.src)}</td><td>${v.box || 0}</td>
        <td><button class="btn sm ghost" data-act="delWord" data-i="${i}">✕</button></td></tr>`).reverse().join('')}</table></div>` : '<p class="muted">Словарь пуст.</p>'}
  `);
}
async function hskView(l) {
  l = +l;
  const mine = new Set(S.vocab.map(v => v.w)), list = (await hskWords()).filter(x => x.l === l);
  view(`
    <div class="row"><a href="#/vocab">← Словарь</a></div>
    <h1>Слова HSK ${l} <span class="muted" style="font-size:16px">${list.length}</span></h1>
    <div class="card"><div class="row">
      <input type="search" data-hsksearch placeholder="Поиск: иероглиф, пиньинь или перевод" style="flex:1;min-width:200px">
      <button class="btn" data-act="hskAddAll" data-l="${l}">Добавить все в словарь</button></div></div>
    <div class="card"><table><tr><th>Слово</th><th>Пиньинь</th><th>Перевод</th><th></th></tr>
      ${list.map(x => `<tr data-hskrow="${esc([x.w, x.py, x.py.normalize('NFD').replace(/[̀-ͯ]/g, ''), x.tr].join(' ').toLowerCase())}"><td class="zh">${esc(x.w)}</td><td>${esc(x.py)}</td><td>${esc(x.tr)}</td>
        <td>${mine.has(x.w) ? '<span class="muted small">в словаре</span>' : `<button class="btn sm" data-act="hskAddOne" data-w="${esc(x.w)}">+</button>`}</td></tr>`).join('')}
    </table></div>`);
}
async function addHskWords(words) {
  const mine = new Set(S.vocab.map(v => v.w)), now = Date.now();
  const nv = words.filter(x => !mine.has(x.w)).map(x => ({ w: x.w, py: x.py, tr: x.tr, src: `HSK ${x.l}`, added: now, box: 0 }));
  if (nv.length) { S.vocab.push(...nv); await saveVocab(); }
  return nv.length;
}
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
// новые (ещё ни разу не отвеченные) карточки выдаются не больше NEW_PER_DAY в день;
// слова, добавленные вручную из тестов, идут раньше слов из списка HSK
const NEW_PER_DAY = 20;
function todayCards() {
  const today = dayKey(Date.now());
  const left = Math.max(0, NEW_PER_DAY - S.vocab.filter(v => v.first && dayKey(v.first) === today).length);
  const fresh = S.vocab.filter(v => !v.next);
  const newOnes = [...fresh.filter(v => !/^HSK/.test(v.src || '')), ...fresh.filter(v => /^HSK/.test(v.src || ''))].slice(0, left);
  return [...S.vocab.filter(v => v.next && v.next <= Date.now()), ...newOnes];
}
function flashView() {
  const v = flash.queue[flash.i];
  if (!v) { flash = null; view(`<div class="card flash"><div class="w">好!</div><p>Карточки на сегодня закончились.</p><a class="btn primary" href="#/vocab" data-act="flashExit">К словарю</a></div>`); return; }
  view(`<div class="row"><a href="javascript:void(0)" data-act="flashExit">← Словарь</a><div class="spacer"></div><span class="muted">${flash.i + 1}/${flash.queue.length}</span></div>
    <div class="card flash"><div class="w">${esc(v.w)}</div>
    ${flash.show ? `<p style="font-size:20px">${esc(v.py)}</p><p style="font-size:18px">${esc(v.tr)}</p>
      <div class="row" style="justify-content:center"><button class="btn" data-act="flashAns" data-ok="0">Не помню</button><button class="btn primary" data-act="flashAns" data-ok="1">Помню</button></div>`
      : `<button class="btn primary" data-act="flashShow">Показать</button>`}</div>`);
}
function wordDialog(src) {
  const sel = String(window.getSelection() || '').trim().slice(0, 30);
  const dlg = $('#dlg');
  dlg.innerHTML = `<form method="dialog"><h3 style="margin-top:0">Новое слово</h3>
    <label>Слово</label><input type="text" name="w" value="${esc(sel)}" required class="zh">
    <label>Пиньинь</label><input type="text" name="py">
    <label>Перевод / смысл</label><input type="text" name="tr">
    <div class="row" style="margin-top:16px"><div class="spacer"></div><button class="btn" value="cancel">Отмена</button><button class="btn primary" value="ok">Сохранить</button></div></form>`;
  dlg.showModal();
  // если слово есть в списке HSK — подставляем пиньинь и перевод
  const f0 = dlg.querySelector('form');
  const fill = async () => {
    const x = (await hskWords()).find(x => x.w === f0.w.value.trim());
    if (x && !f0.py.value && !f0.tr.value) { f0.py.value = x.py; f0.tr.value = x.tr; }
  };
  f0.w.addEventListener('change', fill); fill();
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    const f = dlg.querySelector('form'); const w = f.w.value.trim(); if (!w) return;
    if (S.vocab.some(v => v.w === w)) { toast('Это слово уже в словаре'); return; }
    S.vocab.push({ w, py: f.py.value.trim(), tr: f.tr.value.trim(), src, added: Date.now(), box: 0 });
    saveVocab(); toast(`«${w}» добавлено в словарь`);
    if (location.hash === '#/vocab') vocabView();
  };
}

// ---------------- похожие слова и грамматика ----------------
// упражнения — static/drills.json; прогресс — S.drills[`${kind}:${группа}:${i}`] = { n, ok, last }
let DR = null, X = null;   // X — текущая тренировка
const drillsData = async () => DR ||= await fetch('static/drills.json').then(r => r.json());
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
const drillHash = kind => kind === 'syn' ? '#/words' : '#/grammar';
function groupStat(kind, g) {
  let n = 0, ok = 0, seen = 0;
  g.items.forEach((_, i) => { const p = S.drills[`${kind}:${g.id}:${i}`]; if (p) { seen++; n += p.n; ok += p.ok; } });
  return n ? `<span class="pill ${pct(ok, n) >= 80 ? 'ok' : pct(ok, n) >= 60 ? 'warn' : 'bad'}">${pct(ok, n)}% · ${seen}/${g.items.length}</span>`
    : `<span class="muted small">не начато · ${g.items.length}</span>`;
}
async function synView() {
  if (X?.kind === 'syn') return drillCard();
  const { synonyms } = await drillsData();
  view(`<h1>Похожие слова</h1>
    <div class="card"><div class="row"><b>${synonyms.length} групп</b><div class="spacer"></div>
      <button class="btn primary" data-act="xstart" data-kind="syn">Тренировать вперемешку (15)</button></div>
      <p class="muted small">В чтении, часть 1 (46–60) почти каждый пропуск — выбор между похожими словами: 穿/戴, 相似/相同, 允许/赞成… Вперемешку сначала идут новые и те, где ты ошибся в прошлый раз.</p></div>
    ${synonyms.map(g => `<div class="card"><div class="row"><b class="zh" style="font-size:20px">${g.words.map(esc).join(' / ')}</b><div class="spacer"></div>
      ${groupStat('syn', g)}<button class="btn sm" data-act="xstart" data-kind="syn" data-g="${g.id}">Тренировать</button></div>
      <p class="small" style="margin:8px 0 0">${esc(g.rule)}</p></div>`).join('')}`);
}
async function gramView() {
  if (X?.kind === 'gram') return drillCard();
  const { grammar } = await drillsData();
  view(`<h1>Грамматика HSK 5</h1>
    <div class="card"><div class="row"><b>${grammar.length} тем</b><div class="spacer"></div>
      <button class="btn primary" data-act="xstart" data-kind="gram">Тренировать вперемешку (15)</button></div>
      <p class="muted small">Порядок слов, 把/被, дополнения и связки нужны для письма (91–98) и сочинения, скрытый смысл фраз — для аудирования.</p></div>
    ${grammar.map(g => `<div class="card"><div class="row"><b>${esc(g.title)}</b><div class="spacer"></div>
      ${groupStat('gram', g)}<button class="btn sm" data-act="xstart" data-kind="gram" data-g="${g.id}">Тренировать</button></div>
      <details style="margin-top:8px"><summary>Правило и примеры</summary><p class="small">${esc(g.rule)}</p>
        <ul class="zh">${g.examples.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details></div>`).join('')}`);
}
async function drillStart(kind, gid) {
  const data = await drillsData();
  let queue = (kind === 'syn' ? data.synonyms : data.grammar).filter(g => !gid || g.id === gid)
    .flatMap(g => g.items.map((item, i) => ({ g, item, key: `${kind}:${g.id}:${i}` })));
  queue = shuffle(queue);
  // вперемешку: сначала новые и ошибочные
  if (!gid) queue = queue.sort((a, b) => (S.drills[a.key]?.last ? 1 : 0) - (S.drills[b.key]?.last ? 1 : 0)).slice(0, 15);
  for (const e of queue) {
    if (e.item.type === 'order') { do e.words = shuffle(e.item.w); while (e.words.join('') === e.item.w.join('')); }
    else e.opts = shuffle(e.item.o || e.g.words);
  }
  X = { kind, queue, i: 0, ok: 0, done: 0, ans: null, pick: [] };
  drillCard();
}
// подставляет ответ в пропуски ＿＿ (для пар связок «即使…也» — по частям)
const fillBlanks = (s, a) => { const parts = a ? a.split('…') : []; let k = 0; return esc(s).replace(/＿＿/g, () => a ? `<u style="color:var(--ok)">${esc(parts[k++] ?? '')}</u>` : '＿＿＿'); };
function drillCard() {
  const e = X.queue[X.i];
  if (!e) {
    view(`<div class="card flash"><div class="w">完成!</div><p>Решено ${X.done} · верно ${X.ok}</p><button class="btn primary" data-act="xexit">К списку</button></div>`);
    X = null; return;
  }
  const it = e.item;
  let body;
  if (it.type === 'order') {
    body = `<p class="muted">Составь предложение: ${esc(it.tr)}</p>
      <div class="answerline ${X.ans ? (X.right ? 'ok' : 'bad') : ''}" style="margin-left:0">${X.pick.map((wi, k) => `<button class="chip" data-act="xunpick" data-k="${k}" ${X.ans ? 'disabled' : ''}>${esc(e.words[wi])}</button>`).join('') || '<span class="muted small">нажимай на слова ниже по порядку</span>'}</div>
      ${X.ans ? '' : `<div class="chips" style="margin-left:0">${e.words.map((w, i) => `<button class="chip ${X.pick.includes(i) ? 'used' : ''}" data-act="xpick" data-i="${i}">${esc(w)}</button>`).join('')}</div>
        <div class="qtools"><button class="btn sm" data-act="xcheck" ${X.pick.length ? '' : 'disabled'}>Проверить</button></div>`}`;
  } else {
    body = `<p class="zh" style="font-size:20px">${fillBlanks(it.s, X.ans && it.a)}</p>
      <div class="opts" style="margin-left:0">${e.opts.map((o, k) => {
        const cls = X.ans ? (o === it.a ? 'right' : o === X.ans ? 'wrong' : '') : '';
        return `<button class="opt ${cls}" data-act="xchoose" data-k="${k}" ${X.ans ? 'disabled' : ''}><b>${L(k)}</b><span>${esc(o)}</span></button>`;
      }).join('')}</div>`;
  }
  const right = it.type === 'order' ? it.a[0] : it.a;
  view(`<div class="row"><a href="javascript:void(0)" data-act="xexit">← К списку</a><div class="spacer"></div>
      <span class="muted">${X.i + 1} / ${X.queue.length}</span><span class="pill ${e.g.words ? 'zh' : ''}">${esc(e.g.title || e.g.words.join(' / '))}</span></div>
    <div class="group mixed" style="margin-top:12px">${body}
      ${X.ans ? `<div class="qtools"><span class="pill ${X.right ? 'ok' : 'bad'}">${X.right ? 'верно' : 'неверно, правильно: ' + esc(right)}</span>
        <div class="spacer"></div><button class="btn primary" data-act="xnext">Дальше →</button></div>
        ${it.why ? `<div class="tip">${esc(it.why)}</div>` : ''}${X.right ? '' : `<div class="tip small">${esc(e.g.rule)}</div>`}` : ''}
    </div>`);
}
function drillAnswer(ans, right) {
  const e = X.queue[X.i], p = S.drills[e.key] ||= { n: 0, ok: 0 };
  X.ans = ans; X.right = right; X.done++; if (right) X.ok++;
  p.n++; if (right) p.ok++; p.last = right;
  saveDrills(); drillCard();
}

// ---------------- запросы для Claude ----------------
function claudePrompt(t, n, ans) {
  const { q, group, section } = t.qs[n];
  const ctx = section.id === 'listening' ? `Текст аудио:\n${q.transcript || group.transcript}\nВопрос: ${q.q}` :
    group.passage ? `Текст:\n${group.passage.replace(/\{(\d+)\}/g, '（$1）').replace(/\[\[|\]\]/g, '')}${q.prompt ? `\nВопрос: ${q.prompt}` : ''}` : '';
  const opts = q.options ? q.options.map((o, i) => `${L(i)}. ${o}`).join('\n') : `Слова: ${q.words.join(' / ')}`;
  const right = q.answer || q.accepted.join(' / ');
  return `Я готовлюсь к ${t.level}. Тест ${t.title}, раздел «${section.title}», вопрос ${n}.\n\n${ctx}\n\n${opts}\n\nМой ответ: ${ans || '(нет ответа)'}\nПравильный ответ: ${right}\n\nОбъясни по-русски, почему правильный ответ именно такой и почему мой ошибочный; разбери ключевые слова/грамматику (с пиньинем) и дай совет, как не ошибаться в таких вопросах.`;
}
function essayPrompt(t, q, text) {
  return `Я готовлюсь к ${t.level}. Проверь моё сочинение (задание ${q.n}): «${q.prompt}»${q.required ? ` Обязательные слова: ${q.required.join('、')}.` : ''}${q.image ? ' (Задание по картинке: мужчина и женщина в деловой одежде разговаривают у кулера с водой, держат стаканчики.)' : ''}\n\nМой текст:\n${text}\n\nОцени по шкале 0–5, исправь ошибки (покажи исправленный вариант), объясни ошибки по-русски и дай образцовый вариант на ~90 иероглифов.`;
}
async function copy(text, msg = 'Скопировано — вставь в чат с Claude') {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(msg); }
}

// ---------------- гайд ----------------
function guideView() {
  view(`<div class="guide">
  <h1>Как готовиться к HSK 5</h1>
  <div class="card"><b>Формат:</b> аудирование 45 вопросов (~30 мин) · чтение 45 вопросов (45 мин) · письмо 10 заданий (40 мин). Максимум 300, проходной — 180. Каждый раздел по 100 баллов, отдельного порога по разделам нет, но держи ≥ 60 в каждом.</div>

  <h2>Цикл работы с этим сайтом</h2>
  <ol>
    <li><b>Диагностика.</b> Первый тест реши в режиме «Экзамен» полностью — это честная точка отсчёта.</li>
    <li><b>Разбор в тот же день.</b> Пройди все ошибки и «не уверен». Для аудирования: сначала переслушай фрагмент без текста, потом прочитай текст, потом слушай снова, пока не услышишь каждое слово.</li>
    <li><b>Словарь.</b> Каждое незнакомое слово из разбора — в «Мой словарь». Ежедневно 10 минут карточек.</li>
    <li><b>Работа над ошибками</b> через 1 и через 3 дня — вопрос уходит, когда решишь его правильно дважды в разные дни.</li>
    <li><b>Отработка слабых типов.</b> Открой «Статистику» → блок «Что подтянуть» и тренируй именно эти навыки.</li>
    <li><b>Новый тест</b> через неделю. Пришли Claude PDF + mp3 — он добавит тест в каталог.</li>
    <li><b>Анализ.</b> Раз в 1–2 недели проси Claude «проанализируй мои результаты» — он прочитает твои сохранённые попытки и составит план.</li>
  </ol>
  <p class="tip"><b>Отмечай «? не уверен»</b> честно. Угаданный ответ — такая же дыра в знаниях, как ошибка; сайт добавит его в работу над ошибками и учтёт в статистике.</p>

  <h2>Аудирование</h2>
  <ul>
    <li>В паузах между вопросами <b>читай варианты следующего вопроса</b>: по ним можно угадать тему (место? профессия? причина?).</li>
    <li>Правильный ответ — почти всегда <b>перефраз</b>, а не дословная фраза из аудио. Вариант, повторяющий слова из диалога, часто ловушка.</li>
    <li>Последняя реплика в коротком диалоге обычно самая важная.</li>
    <li>В монологах (31–45) вопросы идут по порядку текста — отмечай ответы прямо во время прослушивания.</li>
    <li>Тренировка: <b>шэдоуинг</b> (повторяй за диктором с задержкой 1 секунда) по транскриптам из разборов, 10–15 мин в день.</li>
    <li>Диктант: включай фрагмент и записывай иероглифами — сразу видно, какие слова не узнаёшь на слух.</li>
  </ul>

  <h2>Чтение — распределение 45 минут</h2>
  <ul>
    <li>46–60 (пропуски): ~12 мин. Смотри на сочетаемость слов: 戴眼镜, 充满活力, 欣赏风景.</li>
    <li>61–70 (совпадение по смыслу): ~10 мин. Сначала варианты, потом текст. Абсолютные слова (都、从来、必须) — подозрительны.</li>
    <li>71–90 (длинные тексты): ~20 мин. Сначала вопросы, потом поиск ответа в тексте. Не переводи всё подряд.</li>
    <li>Оставь 2–3 минуты, чтобы <b>не оставлять пустых ответов</b> — штрафа за ошибку нет.</li>
  </ul>

  <h2>Письмо</h2>
  <ul>
    <li>91–98 (порядок слов): ≤ 10 минут. Найди сказуемое → подлежащее → дополнение → обстоятельства. Формула: <span class="zh">主语 + 时间 + 副词 + 能愿动词 + 介词短语 + 动词 + 补语 + 宾语</span>.</li>
    <li>99 (5 слов): сначала придумай мини-историю, в которой естественно встречаются все слова. Отметь использованные слова — сайт подсвечивает их зелёным.</li>
    <li>100 (картинка): кто? где? что делают? почему? чем кончилось? — 5 предложений ≈ 80–100 иероглифов.</li>
    <li>Структура: <span class="zh">开头（时间、地点、人物）→ 经过 → 结果 / 感受</span>. Связки: <span class="zh">因为…所以、虽然…但是、于是、后来、终于、总之</span>.</li>
    <li>Пиши иероглифы <b>от руки</b> хотя бы для сочинений — на бумажном экзамене нет автокоррекции. (На компьютерном HSK — пиньинь-ввод, тренируйся печатать.)</li>
    <li>Кнопка «Проверить с Claude» копирует сочинение с заданием — вставь в чат, получишь исправления и балл.</li>
  </ul>

  <h2>Недельный план (≈ 1–1.5 ч в день)</h2>
  <table>
    <tr><th>День</th><th>Что делать</th></tr>
    <tr><td>Пн</td><td>Аудирование: один раздел в режиме «Тренировка» + шэдоуинг 15 мин</td></tr>
    <tr><td>Вт</td><td>Чтение: раздел с таймером, разбор, слова в словарь</td></tr>
    <tr><td>Ср</td><td>Работа над ошибками + карточки + 2 сочинения</td></tr>
    <tr><td>Чт</td><td>Слабые типы вопросов из статистики (по советам), диктант по аудио</td></tr>
    <tr><td>Пт</td><td>Порядок слов (91–98) из прошлых тестов + грамматика слабых конструкций</td></tr>
    <tr><td>Сб</td><td>Полный тест в режиме «Экзамен»</td></tr>
    <tr><td>Вс</td><td>Разбор теста, анализ с Claude, отдых</td></tr>
  </table>
  <p class="muted small">Слова: HSK5 = 2500 слов. Если в тексте больше 3–4 незнакомых слов на абзац — словарь пока важнее тестов: добавь 20 новых слов в день.</p>
  </div>`);
}

// ---------------- настройки ----------------
function settingsView() {
  const gh = Store.gh || {};
  view(`
    <h1>Настройки сохранения</h1>
    <div class="card"><b>Результаты сохраняются:</b> ${Store.mode ? esc(Store.where()) : '<span style="color:var(--warn)">ещё не настроено — выбери вариант ниже</span>'}</div>
    <h2>Синхронизация через GitHub (рекомендуется)</h2>
    <div class="card">
      <p>Попытки, словарь и работа над ошибками сохраняются в твой <b>приватный</b> репозиторий: одинаково на компьютере и телефоне, и Claude может их анализировать.</p>
      <ol class="small">
        <li>Открой <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">создание токена</a> (Fine-grained token).</li>
        <li>Token name: <code>hsk</code>, Expiration — на свой выбор (например, 1 год).</li>
        <li>Repository access → <b>Only select repositories</b> → <code>${esc((gh.repo || GH_DEFAULT_REPO).split('/')[1])}</code>.</li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b>.</li>
        <li>Generate token → скопируй и вставь ниже.</li>
      </ol>
      <label class="small muted">Репозиторий с данными</label>
      <input type="text" id="ghRepo" value="${esc(gh.repo || GH_DEFAULT_REPO)}" style="width:100%">
      <label class="small muted" style="display:block;margin-top:8px">Токен</label>
      <input type="password" id="ghToken" placeholder="${gh.token ? 'токен сохранён — вставь новый, чтобы заменить' : 'github_pat_…'}" style="width:100%" autocomplete="off">
      <p class="muted small">Токен хранится только в этом браузере и даёт доступ только к выбранному репозиторию.</p>
      <div class="row"><button class="btn primary" data-act="ghSave">Подключить</button>
        ${gh.token ? '<button class="btn danger" data-act="ghOff">Отключить на этом устройстве</button>' : ''}</div>
    </div>
    ${Store.mode !== 'github' && Store.mode !== 'browser' && Store.mode !== 'local' ? `<h2>Без синхронизации</h2>
    <div class="card row"><span class="muted">Результаты будут жить только в этом браузере (можно сделать резервную копию ниже).</span><div class="spacer"></div>
      <button class="btn" data-act="browserOnly">Сохранять только в браузере</button></div>` : ''}
    ${Store.mode ? `<h2>Резервная копия</h2>
    <div class="card row"><button class="btn" data-act="exportAll">Скачать все данные (JSON)</button>
      <label class="btn">Загрузить из файла<input type="file" accept=".json" id="importFile" hidden></label>
      <span class="muted small">Импорт добавляет недостающие попытки и слова, ничего не удаляет.</span></div>` : ''}
  `);
  const f = $('#importFile');
  if (f) f.onchange = async () => {
    try { await importData(JSON.parse(await f.files[0].text())); toast('Данные загружены'); }
    catch (e) { toast('Не удалось прочитать файл: ' + e.message); }
  };
}
async function importData(d) {
  const have = new Set(S.results.map(r => r.id));
  for (const r of d.results || []) if (r && !have.has(r.id)) { S.results.push(r); await Store.saveResult(r); }
  const words = new Set(S.vocab.map(v => v.w));
  const nv = (d.vocab || []).filter(v => !words.has(v.w));
  if (nv.length) { S.vocab.push(...nv); await saveVocab(); }
  if (d.mistakes && Object.keys(d.mistakes).length) { S.mistakes = { ...d.mistakes, ...S.mistakes }; await saveMistakes(); }
  if (d.drills && Object.keys(d.drills).length) { S.drills = { ...d.drills, ...S.drills }; await saveDrills(); }
}
async function connectGitHub() {
  const repo = $('#ghRepo').value.trim().replace(/^https:\/\/github.com\//, '').replace(/\/$/, '');
  const token = $('#ghToken').value.trim() || Store.gh?.token;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { toast('Репозиторий в формате owner/name'); return; }
  if (!token) { toast('Вставь токен'); return; }
  const r = await Store.ghReq(null, {}, repo, token).catch(() => null);
  if (!r || !r.ok) { toast(r?.status === 404 ? 'Репозиторий не найден или у токена нет к нему доступа' : `GitHub ответил ${r?.status || 'ошибкой сети'} — проверь токен`); return; }
  const prev = Store.mode === 'browser' ? lsGet('hsk.data') : null;
  lsSet('hsk.gh', { repo, token });
  Store.gh = { repo, token }; Store.mode = 'github'; Store.sha = {};
  const d = await Store.loadAll();
  S.results = (d.results || []).filter(Boolean); S.vocab = d.vocab || []; S.mistakes = d.mistakes || {}; S.drills = d.drills || {};
  if (prev) { await importData(prev); lsSet('hsk.data', null); lsSet('hsk.browserOnly', null); }
  toast('GitHub подключён ✓');
  location.hash = '#/';
}

// ---------------- обработчики ----------------
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, n = el.dataset.n;
  switch (act) {
    case 'mode': chosenMode = el.dataset.mode; lsSet('hsk.mode', chosenMode);
      $$('[data-act=mode]').forEach(b => b.classList.toggle('on', b === el)); $('#modehint').textContent = modeHint(); break;
    case 'start': startAttempt(el.dataset.test, el.dataset.secs.split(',')); break;
    case 'dropDraft': if (confirm('Удалить незавершённую попытку?')) { draft.set(null); render(); } break;
    case 'choose': {
      if (M && location.hash === '#/mistakes') { if (!M.answered) mistakeAnswer(el.dataset.l); break; }
      const d = updDraft(d => { d.answers[n] = el.dataset.l; stamp(d, n); if (d.mode === 'practice') d.checked[n] = true; });
      if (d.mode === 'practice') rerenderQ(n);
      else {
        $$(`[data-act=choose][data-n="${n}"]`).forEach(b => b.classList.toggle('sel', b === el));
        const t = await getTest(d.testId), g = t.qs[n].group;
        if (g.passage) { const p = $('#q' + n).closest('.group').querySelector('[data-passage]'); p.innerHTML = (g.image ? `<img src="${t.base}${g.image}" alt="">` : '') + passageHtml(g.passage, d.answers, g); }
        refreshNav(t, d, t.qs[n].section.parts.flatMap(p => p.groups.flatMap(g => g.questions)));
      }
      break;
    }
    case 'unsure': updDraft(d => { d.unsure[n] = !d.unsure[n]; if (!d.unsure[n]) delete d.unsure[n]; }); rerenderQ(n); break;
    case 'pick': case 'unpick': {
      if (M && location.hash === '#/mistakes') {
        const t = await getTest(M.queue[M.i].testId), q = t.qs[n].q;
        M.order = M.order || [];
        if (act === 'pick') M.order.push(+el.dataset.i); else M.order.splice(+el.dataset.k, 1);
        mistakeCard(); break;
      }
      const d0 = draft.get(), t = await getTest(d0.testId), q = t.qs[n].q;
      updDraft(d => {
        const o = d.orders[n] ||= [];
        if (act === 'pick') o.push(+el.dataset.i); else o.splice(+el.dataset.k, 1);
        d.answers[n] = o.map(i => q.words[i]).join('');
        if (!o.length) delete d.answers[n];
        stamp(d, n);
      });
      rerenderQ(n); break;
    }
    case 'checkorder': updDraft(d => { d.checked[n] = true; }); rerenderQ(n); break;
    case 'jump': $('#q' + n)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    case 'play': { const a = $('#audio'); if (a.paused) { a.play(); el.textContent = '❚❚ Пауза'; } else { a.pause(); el.textContent = '▶ Продолжить'; } break; }
    case 'back5': { const a = $('#audio'); a.currentTime = Math.max(0, a.currentTime - 5); break; }
    case 'finishSec': finishSection(); break;
    case 'rfilter': reviewFilter = el.dataset.f; { const y = scrollY; await resultView(el.dataset.rid); scrollTo(0, y); } break;
    case 'seg': { const r = S.results.find(x => x.id === el.dataset.rid); const t = await getTest(r.testId); playSegment(segmentFor(t, r, +n), el); break; }
    case 'ask': { const t = await getTest(el.dataset.test); copy(claudePrompt(t, +n, el.dataset.ans)); break; }
    case 'addWord': wordDialog(el.dataset.src); break;
    case 'delWord': if (confirm('Удалить слово?')) { S.vocab.splice(+el.dataset.i, 1); saveVocab(); vocabView(); } break;
    case 'selfScore': {
      const r = S.results.find(x => x.id === el.dataset.rid);
      r.selfScores = { ...r.selfScores, [n]: +el.dataset.v };
      r.summary = scoreResult(await getTest(r.testId), r);
      Store.saveResult(r);
      const y = scrollY; await resultView(r.id); scrollTo(0, y); break;
    }
    case 'copyEssay': { const r = S.results.find(x => x.id === el.dataset.rid), t = await getTest(r.testId); copy(essayPrompt(t, t.qs[n].q, r.essays?.[n] || '')); break; }
    case 'copyResult': {
      const r = S.results.find(x => x.id === el.dataset.rid), t = await getTest(r.testId), sc = scoreResult(t, r);
      const wrong = Object.entries(sc.byQ).filter(([, b]) => b.status && b.status !== 'ok').map(([k]) => `${k}(${r.answers[k] || '—'}→${t.qs[k].q.answer || t.qs[k].q.accepted[0]})`);
      copy(`Мой результат ${t.level} ${t.title} (${fmtDate(r.finishedAt)}): ${r.sections.map(s => `${SECTIONS[s]} ${sc.sections[s].score}`).join(', ')}${sc.total != null ? `, итого ${sc.total}/300` : ''}.\nОшибки: ${wrong.join(', ') || 'нет'}.\nНе уверен: ${Object.keys(r.unsure || {}).join(', ') || 'нет'}.\nПроанализируй мои слабые места и дай план. Файл результата: results/${r.id}.json (${Store.where()})`);
      break;
    }
    case 'delResult': if (confirm('Удалить эту попытку навсегда?')) { S.results = S.results.filter(x => x.id !== el.dataset.rid); await Store.deleteResult(el.dataset.rid); location.hash = '#/stats'; } break;
    case 'mstart': {
      const list = (await collectMistakes());
      const sel = [];
      for (const m of list) { const t = await getTest(m.testId); if (!el.dataset.tag || t.qs[m.n].q.tag === el.dataset.tag) sel.push(m); }
      M = { queue: sel.sort(() => Math.random() - .5), i: 0, done: 0, ok: 0, answered: null }; mistakeCard(); break;
    }
    case 'mcheck': { const t = await getTest(M.queue[M.i].testId), q = t.qs[M.queue[M.i].n].q; mistakeAnswer((M.order || []).map(i => q.words[i]).join('')); break; }
    case 'mnext': M.i++; M.answered = null; M.order = null; if (segAudio) segAudio.pause(); mistakeCard(); break;
    case 'mexit': M = null; mistakesView(); break;
    case 'flashStart': flash = { queue: todayCards().sort(() => Math.random() - .5), i: 0, show: false }; if (!flash.queue.length) { flash = null; toast('На сегодня карточек нет'); } else flashView(); break;
    case 'flashShow': flash.show = true; flashView(); break;
    case 'flashAns': {
      const v = flash.queue[flash.i];
      if (!v.next) v.first = Date.now();
      v.box = el.dataset.ok === '1' ? Math.min((v.box || 0) + 1, BOX_DAYS.length - 1) : 1;
      v.next = Date.now() + BOX_DAYS[v.box] * 864e5 - 3600e3;
      saveVocab(); flash.i++; flash.show = false; flashView(); break;
    }
    case 'flashExit': flash = null; vocabView(); break;
    case 'xstart': drillStart(el.dataset.kind, el.dataset.g); break;
    case 'xchoose': if (X && !X.ans) { const e = X.queue[X.i], o = e.opts[+el.dataset.k]; drillAnswer(o, o === e.item.a); } break;
    case 'xpick': X.pick.push(+el.dataset.i); drillCard(); break;
    case 'xunpick': X.pick.splice(+el.dataset.k, 1); drillCard(); break;
    case 'xcheck': { const e = X.queue[X.i], ans = X.pick.map(i => e.words[i]).join(''); drillAnswer(ans, e.item.a.some(a => norm(a) === norm(ans))); break; }
    case 'xnext': X.i++; X.ans = null; X.pick = []; drillCard(); break;
    case 'xexit': { const k = X?.kind || (location.hash === '#/grammar' ? 'gram' : 'syn'); X = null; k === 'syn' ? synView() : gramView(); break; }
    case 'hskLevel': hskLevel = +el.dataset.l; lsSet('hsk.level', hskLevel); vocabView(); break;
    case 'hskAddOne': {
      await addHskWords((await hskWords()).filter(x => x.w === el.dataset.w));
      el.outerHTML = '<span class="muted small">в словаре</span>'; break;
    }
    case 'hskAddAll': {
      const l = +el.dataset.l;
      toast(`Добавлено слов: ${await addHskWords((await hskWords()).filter(x => x.l === l))}`);
      location.hash === '#/vocab' ? vocabView() : hskView(l); break;
    }
    case 'ghSave': connectGitHub(); break;
    case 'ghOff': if (confirm('Отключить синхронизацию на этом устройстве? Данные в репозитории останутся.')) { lsSet('hsk.gh', null); location.hash = '#/settings'; location.reload(); } break;
    case 'browserOnly': lsSet('hsk.browserOnly', true); await Store.init(); { const d = await Store.loadAll(); S.results = d.results || []; S.vocab = d.vocab || []; S.mistakes = d.mistakes || {}; S.drills = d.drills || {}; } location.hash = '#/'; break;
    case 'exportAll': {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ results: S.results, vocab: S.vocab, mistakes: S.mistakes, drills: S.drills }, null, 1)], { type: 'application/json' }));
      a.download = `hsk-backup-${dayKey(Date.now())}.json`; a.click(); break;
    }
    case 'exportCsv': {
      const csv = S.vocab.map(v => [v.w, v.py, v.tr].map(x => `"${String(x || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'hsk-vocab.csv'; a.click(); break;
    }
  }
});
document.addEventListener('input', e => {
  if (e.target.matches('[data-hsksearch]')) {
    const q = e.target.value.trim().toLowerCase();
    $$('[data-hskrow]').forEach(tr => { tr.hidden = !!q && !tr.dataset.hskrow.includes(q); });
    return;
  }
  const n = e.target.dataset.essay; if (!n) return;
  const text = e.target.value;
  updDraft(d => { (d.essays ||= {})[n] = text; d.times[n] = Date.now() - d.secStartedAt; });
  $(`[data-count="${n}"]`).textContent = `иероглифов: ${zhCount(text)} / ~80`;
  const req = $(`[data-req="${n}"]`);
  if (req) getTest(draft.get().testId).then(t => { req.innerHTML = reqHtml(t.qs[n].q, text); });
});
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/mistakes')) M = null; if (location.hash !== '#/vocab') flash = null; if (X && location.hash !== drillHash(X.kind)) X = null; render(); });

(async function init() {
  try {
    S.catalog = await fetch('tests/catalog.json').then(r => r.json());
    await Store.init();
    if (!Store.mode) { if (!location.hash.startsWith('#/guide')) location.hash = '#/settings'; render(); return; }
    const d = await Store.loadAll();
    S.results = (d.results || []).filter(Boolean); S.vocab = d.vocab || []; S.mistakes = d.mistakes || {}; S.drills = d.drills || {};
  } catch (err) {
    $('#app').innerHTML = `<div class="card"><b>Не удалось загрузить данные.</b><p class="muted small">${esc(err.message)}</p>
      <p>Если сохранение настроено через GitHub — проверь токен в <a href="#/settings">настройках</a>.</p></div>`;
    return;
  }
  render();
})();
