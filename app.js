/* ============================================================
   Nederlands! · Curso de neerlandês para brasileiros
   Vanilla JS SPA · sem dependências · dados em data/lessons/*.json
   ============================================================ */
'use strict';

/* ---------- word roles: the color bridge between NL and PT ---------- */
const ROLES = {
  qw:   { label: 'palavra de pergunta', emoji: '❓', sample: ['Wat', 'Qual'] },
  verb: { label: 'verbo',               emoji: '⚙️', sample: ['is', 'é'] },
  noun: { label: 'substantivo',         emoji: '📦', sample: ['naam', 'nome'] },
  art:  { label: 'artigo',              emoji: '🏷️', sample: ['de', 'o'] },
  pron: { label: 'pronome',             emoji: '👤', sample: ['hem', 'dele'] },
  prep: { label: 'preposição',          emoji: '🔗', sample: ['van', 'de'] },
  adj:  { label: 'adjetivo',            emoji: '🎨', sample: ['groot', 'grande'] },
  adv:  { label: 'advérbio',            emoji: '💨', sample: ['morgen', 'amanhã'] },
  neg:  { label: 'negação',             emoji: '🚫', sample: ['niet', 'não'] },
  num:  { label: 'número',              emoji: '🔢', sample: ['twee', 'dois'] },
  conj: { label: 'conjunção',           emoji: '🌉', sample: ['omdat', 'porque'] },
  part: { label: 'partícula separável', emoji: '✂️', sample: ['op', '(op)'] },
  punc: { label: 'pontuação',           emoji: '·',  sample: ['?', '?'] },
  x:    { label: 'outro',               emoji: '·',  sample: ['-', '-'] },
};

const UNIT_COLORS = { A1:'#2E7D32', A2:'#558B2F', B1:'#F9A825', B2:'#EF6C00', C1:'#C62828', C2:'#6A1B9A' };
const UNIT_INFO = {
  A1:{ name:'Sobrevivência', emoji:'🌱' }, A2:{ name:'Autonomia', emoji:'⭐' },
  B1:{ name:'Independência', emoji:'🌳' }, B2:{ name:'Fluência', emoji:'🚀' },
  C1:{ name:'Proficiência', emoji:'🎓' }, C2:{ name:'Maestria', emoji:'👑' },
};
const SRS_DAYS = [0, 0, 1, 3, 7, 21]; // index = box (1..5)
const STORE_KEY = 'nlcurso.v1';

/* ---------- clock emojis: visualize the hour (our edge over Babbel/Duolingo) ---------- */
const HOUR_EMOJI = { // 1..12 o'clock + half hours
  '1':'🕐','2':'🕑','3':'🕒','4':'🕓','5':'🕔','6':'🕕','7':'🕖','8':'🕗','9':'🕘','10':'🕙','11':'🕚','12':'🕛','0':'🕛',
  '1.5':'🕜','2.5':'🕝','3.5':'🕞','4.5':'🕟','5.5':'🕠','6.5':'🕡','7.5':'🕢','8.5':'🕣','9.5':'🕤','10.5':'🕥','11.5':'🕦','12.5':'🕧',
};
function hourEmoji(h, half) { return HOUR_EMOJI[half ? (((h % 12) || 12) + '.5') : String(((h % 12) || 12))] || '🕐'; }
// decorate any "HH:MM" or "half X" mention in text with the matching clock emoji
function clockify(text) {
  return String(text || '')
    .replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (m, h, mi) => {
      const hh = +h, half = mi === '30';
      return `${m} ${hourEmoji(half ? hh : hh, half)}`;
    })
    .replace(/\bhalf\s+(een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf)\b/gi, (m, w) => {
      const map = { een:1,twee:2,drie:3,vier:4,vijf:5,zes:6,zeven:7,acht:8,negen:9,tien:10,elf:11,twaalf:12 };
      const target = map[w.toLowerCase()]; // "half drie" = 2:30 -> clock at 2.5
      return `${m} ${hourEmoji(target - 1, true)}`;
    });
}

/* ---------- state ---------- */
let S = load();
function load() {
  try { return Object.assign({ xp:0, streak:{last:'',count:0}, lessons:{}, srs:{}, mistakes:{}, premium:false, deviceId:'' },
    JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
  catch { return { xp:0, streak:{last:'',count:0}, lessons:{}, srs:{}, mistakes:{}, premium:false, deviceId:'' }; }
}

/* ---------- premium: device id + entitlement check (see api/premium-status.js) ---------- */
function deviceId() {
  if (!S.deviceId) { S.deviceId = 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); save(); }
  return S.deviceId;
}
async function checkPremiumStatus() {
  if (!window.NL_CONFIG || !window.NL_CONFIG.PREMIUM_ENABLED) return;
  try {
    const r = await fetch('/api/premium-status?device=' + encodeURIComponent(deviceId()));
    const d = await r.json();
    if (S.premium !== !!d.premium) { S.premium = !!d.premium; save(); }
  } catch { /* offline or api not ready: keep last known state */ }
}
function isPremium() { return !!S.premium; }
function adSlotHTML(id) {
  if (isPremium() || !window.NL_CONFIG || !window.NL_CONFIG.ADSENSE_CLIENT) return '';
  return `<div class="ad-slot" id="${id}"><small class="muted">📢 espaço reservado ·
    <a href="#/premium">remova anúncios com o Premium ⭐</a></small></div>`;
}
/* ---------- mistakes quicklist: every wrong answer gets extra attention ---------- */
function recordMistake(m) {
  const key = m.lesson + '|' + norm(m.q || m.answer || Math.random());
  const prev = S.mistakes[key];
  S.mistakes[key] = { ...m, key, count: (prev ? prev.count : 0) + 1, ts: Date.now() };
  save(); updateMistakeBadge();
}
function clearMistake(key) { delete S.mistakes[key]; save(); updateMistakeBadge(); }
function mistakeList() { return Object.values(S.mistakes).sort((a, b) => b.count - a.count || b.ts - a.ts); }
function updateMistakeBadge() {
  const n = mistakeList().length, b = document.getElementById('mistakeBadge');
  if (b) { b.hidden = n === 0; b.textContent = n; }
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(S)); paintStats(); }
function today() { return new Date().toISOString().slice(0,10); }
function touchStreak() {
  const t = today();
  if (S.streak.last === t) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0,10);
  S.streak.count = (S.streak.last === y) ? S.streak.count + 1 : 1;
  S.streak.last = t;
}
function addXP(n) { S.xp += n; save(); toast(`+${n} ⚡`); }

/* ---------- data ---------- */
let MANIFEST = null;
const CACHE = {};
async function manifest() {
  if (!MANIFEST) MANIFEST = await (await fetch('data/lessons/index.json')).json();
  return MANIFEST;
}
async function lesson(id) {
  if (!CACHE[id]) CACHE[id] = await (await fetch(`data/lessons/${id}.json`)).json();
  return CACHE[id];
}

/* ---------- tts ---------- */
const hasTTS = 'speechSynthesis' in window;
function speak(text) {
  if (!hasTTS) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[🔊▶️]/g,''));
  const voices = speechSynthesis.getVoices();
  const v = voices.find(v => /^nl(-BE)?/i.test(v.lang) && /BE|Belg/i.test(v.lang + v.name))
        || voices.find(v => /^nl/i.test(v.lang));
  if (v) u.voice = v;
  u.lang = (v && v.lang) || 'nl-NL';
  u.rate = 0.88;
  speechSynthesis.speak(u);
}
if (hasTTS) speechSynthesis.getVoices(); // warm up voice list

/* ---------- utils ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g,' ')
    .replace(/[.!?,;:]+$/,'').normalize('NFD').replace(/[̀-ͯ]/g,'');
}
function shuffle(a) { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 1800);
}
function paintStats() {
  $('#xpStat').textContent = S.xp;
  $('#streakStat').textContent = S.streak.count;
  const pn = document.getElementById('premiumNav');
  if (pn) { pn.textContent = isPremium() ? '🏆' : '⭐'; pn.title = isPremium() ? 'Você é Premium!' : 'Nederlands! Premium'; }
}
function lessonProgress(id, exCount) {
  const st = S.lessons[id];
  if (!st) return 0;
  if (st.done) return 100;
  return Math.min(99, Math.round(100 * (st.seen || 0) / Math.max(1, exCount)));
}

/* ---------- aligned phrase renderer (the bridge) ---------- */
function tokHTML(tokens, phraseId, side) {
  return tokens.map((tk, i) =>
    `<span class="tok r-${esc(tk.r || 'x')}" data-p="${phraseId}" data-r="${esc(tk.r || 'x')}"
      title="${esc((ROLES[tk.r] || ROLES.x).emoji + ' ' + (ROLES[tk.r] || ROLES.x).label)}">${esc(tk.t)}</span>`
  ).join(' ');
}
function phraseHTML(ph, idx) {
  const nl = ph.nl.map(t => t.t).join(' ').replace(/ ([?.!,])/g, '$1');
  return `<div class="phrase" data-idx="${idx}">
    <div class="row"><span class="flag">🇧🇪</span><span>${tokHTML(ph.nl, idx, 'nl')}</span>
      ${hasTTS ? `<button class="speak-btn speak" data-say="${esc(nl)}" title="Ouvir">🔊</button>` : ''}</div>
    <div class="row"><span class="flag">🇧🇷</span><span>${tokHTML(ph.pt, idx, 'pt')}</span></div>
    ${ph.lit ? `<div class="lit">🔍 literal: ${esc(clockify(ph.lit))}</div>` : ''}
    ${ph.note ? `<div class="note">💡 ${esc(clockify(ph.note))}</div>` : ''}
  </div>`;
}
function bindPhraseEvents(root) {
  root.querySelectorAll('.tok').forEach(el => {
    el.addEventListener('click', () => {
      const on = el.classList.contains('hl');
      root.querySelectorAll('.tok.hl').forEach(t => t.classList.remove('hl'));
      if (!on) root.querySelectorAll(`.tok[data-p="${el.dataset.p}"][data-r="${el.dataset.r}"]`)
        .forEach(t => t.classList.add('hl'));
    });
  });
  root.querySelectorAll('.speak').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); speak(b.dataset.say); }));
}
function legendStrip(phrases) {
  const used = new Set();
  phrases.forEach(p => [...p.nl, ...p.pt].forEach(t => { if (t.r && t.r !== 'punc' && t.r !== 'x') used.add(t.r); }));
  return `<div class="legend-strip">${[...used].map(r =>
    `<span><span class="r-${r}">${ROLES[r].emoji} ${ROLES[r].label}</span></span>`).join('')}
    <span><a href="#/legenda">🎨 legenda completa</a></span></div>`;
}

/* ---------- router ---------- */
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => { paintStats(); route(); updateDueBadge(); updateMistakeBadge(); checkPremiumStatus(); });

async function route() {
  const app = $('#app');
  const hFull = location.hash.replace(/^#\/?/, '');
  const h = hFull.split('?')[0];
  const qs = new URLSearchParams(hFull.split('?')[1] || '');
  try {
    if (h === '' || h === '/') return renderHome(app);
    if (h === 'legenda') return renderLegend(app);
    if (h === 'revisao') return renderReview(app);
    if (h === 'woordenboek') return renderWoordenboek(app);
    if (h === 'klanken') return renderKlanken(app);
    if (h === 'belgie') return renderBelgie(app);
    if (h === 'decks') return renderDecks(app);
    if (h === 'dificuldades') return renderMistakes(app);
    if (h === 'spelletjes') return renderGamesHub(app);
    if (h === 'premium') return renderPremium(app, qs);
    if (h === 'maandelijst') return renderMaandOverzicht(app);
    const mm = h.match(/^maandelijst\/([\w-]+)$/);
    if (mm) return renderMaandDetail(app, mm[1]);
    const mg = h.match(/^spelletjes\/([\w-]+)$/);
    if (mg) return renderGameDomain(app, mg[1]);
    const mn = h.match(/^nivel\/([A-C][12])$/i);
    if (mn) return renderLevel(app, mn[1].toUpperCase());
    const m = h.match(/^les\/([\w-]+)(\/praticar)?$/);
    if (m) return renderLesson(app, m[1], !!m[2]);
    renderHome(app);
  } catch (e) {
    app.innerHTML = `<div class="card">😵 Erro ao carregar: ${esc(e.message)}<br>
      <a href="#/">← voltar ao início</a></div>`;
  }
}

/* ---------- home ---------- */
async function renderHome(app) {
  const man = await manifest();
  const units = {};
  man.lessons.forEach(l => (units[l.unit] = units[l.unit] || []).push(l));
  const next = man.lessons.find(l => !(S.lessons[l.id] && S.lessons[l.id].done));
  const dailyHTML = await dailyWidgetHTML();
  app.innerHTML = `
  <div class="hero">
    <h1>🧇 Nederlands! O curso de neerlandês para brasileiros 🇧🇷→🇧🇪</h1>
    <p class="muted">Lições com <b>frases alinhadas por cores</b> 🎨 (mesmo tipo de palavra = mesmo estilo nas duas línguas),
    exercícios estilo Babbel 🏋️, flashcards inteligentes 🃏 e áudio 🔊. Baseado no
    <a href="livro.html">Livro Infográfico 📖</a>.</p>
    ${next ? `<a class="btn primary" href="#/les/${next.id}">▶️ Continuar: ${next.emoji} ${esc(next.title)}</a>` : '<p>🏆 Curso completo!</p>'}
    <img src="assets/infographics/cefr-ladder.svg" alt="A escada de níveis A1 a C2" loading="lazy">
    ${dailyHTML}
    <p><a class="btn small" href="#/maandelijst">🗓️ Woordenlijst do mês</a></p>
    <p class="muted" style="margin:.6em 0 .2em"><b>👉 Escolha um nível</b> para ver TUDO dele (lições, frases e vocabulário):</p>
    <div class="level-picker">${['A1','A2','B1','B2','C1','C2'].map(u =>
      `<a class="level-btn" href="#/nivel/${u}" style="background:${UNIT_COLORS[u]}">${u}<small>${UNIT_INFO[u].emoji} ${UNIT_INFO[u].name}</small></a>`).join('')}</div>
  </div>
  ${adSlotHTML('adHome')}
  <div class="home-tiles">
    <a class="home-tile" href="#/spelletjes">🧩<b>Spelletjes</b><small>arrastar e soltar</small></a>
    <a class="home-tile" href="#/klanken">🔊<b>Klanken</b><small>treino de sons</small></a>
    <a class="home-tile" href="#/decks">🃏<b>Baralhos</b><small>flashcards por tema</small></a>
    <a class="home-tile" href="#/belgie">🇧🇪<b>Ontdek België</b><small>país, cultura, história</small></a>
    <a class="home-tile" href="#/woordenboek">🔎<b>Woordenboek</b><small>dicionário + emojis</small></a>
    <a class="home-tile" href="#/dificuldades">🎯<b>Dificuldades</b><small>seus erros, juntos</small></a>
    <a class="home-tile" href="#/revisao">🧠<b>Revisão</b><small>repetição espaçada</small></a>
  </div>
  ${Object.entries(units).map(([u, ls]) => `
    <div class="unit-head"><span class="unit-badge" style="background:${UNIT_COLORS[u] || '#555'}">${u}</span>
      <h2 style="margin:0;font-size:1.2rem">${unitTitle(u)}</h2></div>
    <div class="lesson-grid">${ls.map(l => {
      const pct = lessonProgress(l.id, l.exercises || 10);
      return `<a class="lesson-card" href="#/les/${l.id}">
        <span class="em">${l.emoji}</span><h3>${esc(l.title)}</h3>
        <span class="pct">${l.phrases || 0} frases · ${l.exercises || 0} exercícios ${pct === 100 ? '· ✅' : ''}</span>
        <div class="progressbar"><div style="width:${pct}%"></div></div></a>`;
    }).join('')}</div>`).join('')}`;
  const daily = app.querySelector('.daily-card');
  if (daily) {
    bindPhraseEvents(daily);
    daily.querySelectorAll('.speak,.dspeak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
  }
}
function unitTitle(u) {
  return { A1:'Sobrevivência 🌱', A2:'Autonomia básica ⭐ (inburgering)', B1:'Independência 🌳',
           B2:'Fluência funcional 🚀', C1:'Proficiência 🎓', C2:'Maestria 👑' }[u] || u;
}

/* ---------- lesson ---------- */
async function renderLesson(app, id, practice) {
  const L = await lesson(id);
  const tab = practice ? 'pr' : (renderLesson._tab === id + 'fc' ? 'fc' : 'ap');
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a> › ${L.unit}</div>
    <div class="lesson-top"><span class="em">${L.emoji}</span>
      <div><h1 style="margin:0;font-size:1.5rem">${esc(L.title)}</h1>
      <span class="pill" style="background:${UNIT_COLORS[L.unit]};color:#fff">${L.unit}</span></div></div>
    <div class="tabs">
      <button class="tab ${tab==='ap'?'active':''}" data-t="ap">📖 Aprender</button>
      <button class="tab ${tab==='pr'?'active':''}" data-t="pr">🏋️ Praticar (${L.exercises.length})</button>
      <button class="tab ${tab==='fc'?'active':''}" data-t="fc">🃏 Flashcards (${L.vocab.length})</button>
    </div>
    <div id="tabBody"></div>`;
  app.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
    app.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderLesson._tab = b.dataset.t === 'fc' ? id + 'fc' : '';
    showTab(b.dataset.t, L);
  }));
  showTab(tab, L);
}

function showTab(t, L) {
  const body = $('#tabBody');
  if (t === 'ap') {
    body.innerHTML = `
      ${(L.teaching || []).map(c => `<div class="card"><h3>${c.emoji || '📌'} ${esc(c.title)}</h3>${c.html}</div>`).join('')}
      ${L.infographic ? `<img class="infographic" src="${esc(L.infographic)}" alt="Infográfico da lição" loading="lazy">` : ''}
      <h2 style="margin-top:22px">🎨 Frases-ponte <small class="muted" style="font-size:.85rem">(toque numa palavra para ver o par dela!)</small></h2>
      ${legendStrip(L.phrases)}
      ${L.phrases.map((p, i) => phraseHTML(p, i)).join('')}
      <h2 style="margin-top:22px">🧩 Vocabulário com quebra de palavras</h2>
      <table class="vocab"><tr><th></th><th>palavra</th><th>quebra 🧩</th><th>português</th></tr>
      ${L.vocab.map(v => `<tr>
        <td>${v.art ? `<span class="pill art-${v.art}">${v.art}</span>` : ''}</td>
        <td class="v-nl">${esc(v.nl)} ${hasTTS ? `<button class="speak-btn speak" data-say="${esc(v.nl)}">🔊</button>` : ''}</td>
        <td class="v-split">${esc(v.split || '')}</td>
        <td>${v.emoji || ''} ${esc(v.pt)}</td></tr>`).join('')}</table>
      <div id="socialCard"></div>
      ${adSlotHTML('adLesson')}
      <p class="center"><button class="btn primary" id="goPractice">🏋️ Praticar agora →</button></p>`;
    bindPhraseEvents(body);
    body.querySelectorAll('.speak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
    $('#goPractice').addEventListener('click', () => {
      body.closest('#app').querySelector('[data-t="pr"]').click();
    });
    fillSocialCard(L.id);
  }
  if (t === 'pr') runExercises(body, L);
  if (t === 'fc') runFlashcards(body, L, L.vocab.map(v => ({ ...v, key: L.id + '|' + v.nl })));
}

/* ---------- turn any exercise into a reviewable mistake card ---------- */
function mistakeFromEx(ex, L) {
  const base = { lesson: L.id, lessonTitle: L.title, lessonEmoji: L.emoji, unit: L.unit, type: ex.type };
  if (ex.type === 'mc')     return { ...base, q: ex.q, nl: ex.options[ex.answer], pt: ex.q, answer: ex.options[ex.answer] };
  if (ex.type === 'listen') return { ...base, q: 'Ouça: ' + ex.nl, nl: ex.nl, pt: ex.options[ex.answer], answer: ex.nl };
  if (ex.type === 'fill')   return { ...base, q: `${ex.before} ___ ${ex.after || ''}`, nl: ex.answer, pt: ex.hint || '', answer: ex.answer };
  if (ex.type === 'order')  return { ...base, q: ex.pt, nl: ex.answer, pt: ex.pt, answer: ex.answer };
  if (ex.type === 'match')  return { ...base, q: 'Pares: ' + ex.pairs.map(p => p[0]).join(', '), nl: ex.pairs.map(p => p[0]).join(' · '), pt: ex.pairs.map(p => p[1]).join(' · '), answer: ex.pairs.map(p => p[0] + '=' + p[1]).join(', ') };
  return { ...base, q: '(exercício)', nl: '', pt: '', answer: '' };
}

/* ---------- exercise runner ---------- */
function runExercises(body, L) {
  const exs = L.exercises;
  let i = 0, score = 0, firstTry = true;
  const st = S.lessons[L.id] = S.lessons[L.id] || {};

  function header() {
    return `<div class="ex-progress"><a href="#/les/${L.id}" class="btn small">✖</a>
      <div class="progressbar"><div style="width:${Math.round(100 * i / exs.length)}%"></div></div>
      <b>${i + 1}/${exs.length}</b></div>`;
  }
  function next() {
    if (!firstTry) recordMistake(mistakeFromEx(exs[i], L)); // stumbled -> quicklist
    i++; st.seen = Math.max(st.seen || 0, i); save();
    firstTry = true;
    i < exs.length ? show() : end();
  }
  function feedback(ok, explain, answerText) {
    const el = document.createElement('div');
    el.className = 'feedback ' + (ok ? 'ok' : 'bad');
    el.innerHTML = (ok ? '✅ Juist! (Certo!)' : `❌ Quase! Resposta: <b>${esc(answerText || '')}</b>`) +
      (explain ? `<small>💡 ${esc(explain)}</small>` : '');
    body.querySelector('.exwrap').appendChild(el);
    const nav = document.createElement('div');
    nav.className = 'ex-nav';
    nav.innerHTML = `<button class="btn primary">Continuar →</button>`;
    nav.querySelector('button').addEventListener('click', next);
    body.querySelector('.exwrap').appendChild(nav);
    if (ok) { score += firstTry ? 1 : 0.5; addXP(firstTry ? 10 : 4); }
  }
  function lock() { body.querySelectorAll('.opt,.chip,.fill-input,#chk').forEach(x => x.disabled = true); }

  function show() {
    const ex = exs[i];
    let inner = '';
    if (ex.type === 'mc') inner = `
      <p class="ex-q">🤔 ${esc(ex.q)}</p>
      <div class="options">${ex.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
    if (ex.type === 'listen') inner = `
      <p class="ex-q">🎧 Ouça e escolha o significado:</p>
      <p class="center"><button class="big-audio" id="play">▶️</button></p>
      <div class="options">${ex.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
    if (ex.type === 'fill') inner = `
      <p class="ex-q">✍️ Complete: ${esc(ex.before)} <b>___</b> ${esc(ex.after || '')}</p>
      ${ex.hint ? `<p class="muted">💭 dica: ${esc(ex.hint)}</p>` : ''}
      <p><input class="fill-input" id="fin" autocomplete="off" autocapitalize="off" placeholder="digite em neerlandês...">
      <button class="btn" id="chk">Verificar ✓</button></p>`;
    if (ex.type === 'order') inner = `
      <p class="ex-q">🧱 Monte a frase: <span class="muted">"${esc(ex.pt)}"</span></p>
      <div class="built" id="built"></div>
      <div class="chips" id="chips">${shuffle(ex.tokens.map((t, k) => ({ t, k }))).map(o =>
        `<button class="chip" data-k="${o.k}">${esc(o.t)}</button>`).join('')}</div>
      <button class="btn small" id="undo">↩️ desfazer</button>`;
    if (ex.type === 'match') inner = `
      <p class="ex-q">🔗 Ligue os pares:</p>
      <div class="match-grid">
        <div class="match-col" id="mleft">${shuffle(ex.pairs.map((p, k) => ({ t: p[0], k }))).map(o =>
          `<button class="mitem" data-k="${o.k}">🇧🇪 ${esc(o.t)}</button>`).join('')}</div>
        <div class="match-col" id="mright">${shuffle(ex.pairs.map((p, k) => ({ t: p[1], k }))).map(o =>
          `<button class="mitem" data-k="${o.k}">🇧🇷 ${esc(o.t)}</button>`).join('')}</div>
      </div>`;
    if (ex.type === 'pronounce') inner = `
      <p class="ex-q">🗣️ Pronuncie em voz alta:</p>
      <p class="pronounce-phrase">${esc(ex.nl)}</p>
      ${ex.pt ? `<p class="muted">🇧🇷 ${esc(ex.pt)}</p>` : ''}
      <p class="center"><button class="big-audio" id="playRef" title="Ouvir referência">🔊</button></p>
      <div class="pronounce-rec center">
        <button class="btn" id="recBtn">🎙️ Gravar minha voz</button>
        <p class="muted" id="recStatus" hidden></p>
        <div id="recPlayback" hidden></div>
      </div>
      <p class="center"><button class="btn primary" id="pronounceDone" hidden>Já pratiquei, continuar →</button></p>`;
    body.innerHTML = header() + `<div class="card exwrap">${inner}</div>`;

    if (ex.type === 'mc' || ex.type === 'listen') {
      if (ex.type === 'listen') { const p = $('#play'); p.addEventListener('click', () => speak(ex.nl)); setTimeout(() => speak(ex.nl), 300); }
      body.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
        const ok = +b.dataset.k === ex.answer;
        if (ok) { b.classList.add('correct'); lock(); feedback(true, ex.explain); }
        else { b.classList.add('wrong'); b.disabled = true; if (firstTry) { firstTry = false; }
          else { lock(); body.querySelector(`.opt[data-k="${ex.answer}"]`).classList.add('correct');
            feedback(false, ex.explain, ex.options[ex.answer]); } }
      }));
    }
    if (ex.type === 'fill') {
      const check = () => {
        const val = norm($('#fin').value);
        const ok = [ex.answer, ...(ex.alt || [])].some(a => norm(a) === val);
        $('#fin').classList.add(ok ? 'correct' : 'wrong');
        if (ok) { lock(); feedback(true, ex.explain); }
        else if (firstTry) { firstTry = false; toast('🤏 Tente mais uma vez!'); $('#fin').addEventListener('input', () => $('#fin').classList.remove('wrong'), { once: true }); }
        else { lock(); feedback(false, ex.explain, ex.answer); }
      };
      $('#chk').addEventListener('click', check);
      $('#fin').addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      $('#fin').focus();
    }
    if (ex.type === 'order') {
      const picked = [];
      $('#chips').addEventListener('click', e => {
        const c = e.target.closest('.chip'); if (!c || c.disabled) return;
        c.disabled = true; picked.push(c);
        $('#built').innerHTML = picked.map(p => `<span class="chip">${p.textContent}</span>`).join('');
        if (picked.length === ex.tokens.length) {
          const made = picked.map(p => p.textContent).join(' ');
          const ok = [ex.answer, ...(ex.altAnswers || [])].some(a => norm(made) === norm(a));
          lock();
          ok ? feedback(true, ex.explain) : feedback(false, ex.explain, ex.answer);
        }
      });
      $('#undo').addEventListener('click', () => {
        const c = picked.pop(); if (c) c.disabled = false;
        $('#built').innerHTML = picked.map(p => `<span class="chip">${p.textContent}</span>`).join('');
      });
    }
    if (ex.type === 'match') {
      let selL = null, doneCount = 0;
      const cols = { l: $('#mleft'), r: $('#mright') };
      cols.l.addEventListener('click', e => {
        const it = e.target.closest('.mitem'); if (!it || it.classList.contains('done')) return;
        cols.l.querySelectorAll('.sel').forEach(x => x.classList.remove('sel'));
        it.classList.add('sel'); selL = it;
      });
      cols.r.addEventListener('click', e => {
        const it = e.target.closest('.mitem'); if (!it || !selL || it.classList.contains('done')) return;
        if (it.dataset.k === selL.dataset.k) {
          it.classList.add('done'); selL.classList.add('done'); selL.classList.remove('sel'); selL = null;
          if (++doneCount === ex.pairs.length) feedback(true, ex.explain);
        } else { firstTry = false; it.classList.add('flash'); setTimeout(() => it.classList.remove('flash'), 500); }
      });
    }
    if (ex.type === 'pronounce') {
      $('#playRef').addEventListener('click', () => speak(ex.nl));
      const recBtn = $('#recBtn'), status = $('#recStatus'), playback = $('#recPlayback'), doneBtn = $('#pronounceDone');
      const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
      let mediaRecorder = null, chunks = [], stream = null, recording = false;

      function offerContinue(msg) {
        recBtn.hidden = true;
        status.hidden = false;
        status.textContent = msg;
        doneBtn.hidden = false;
      }
      if (!canRecord) {
        offerContinue('🎙️ Gravação de voz não disponível neste navegador. Ouça a referência e repita em voz alta.');
      } else {
        recBtn.addEventListener('click', async () => {
          if (recording) { mediaRecorder.stop(); recording = false; status.hidden = true; return; }
          try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
          catch (e) { offerContinue('🎙️ Microfone não autorizado. Ouça a referência e repita em voz alta.'); return; }
          chunks = [];
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = e => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            playback.hidden = false;
            playback.innerHTML = `<audio controls src="${URL.createObjectURL(blob)}"></audio>`;
            stream.getTracks().forEach(t => t.stop());
            recBtn.textContent = '🎙️ Gravar de novo';
            doneBtn.hidden = false;
          };
          mediaRecorder.start();
          recording = true;
          recBtn.textContent = '⏹️ Parar gravação';
          status.hidden = false;
          status.textContent = '🔴 Gravando...';
        });
      }
      doneBtn.addEventListener('click', () => {
        recBtn.disabled = true; doneBtn.disabled = true;
        feedback(true, ex.explain);
      });
    }
  }

  function end() {
    const pct = Math.round(100 * score / exs.length);
    st.done = true; st.best = Math.max(st.best || 0, pct);
    touchStreak(); save(); updateDueBadge();
    const em = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '🌱';
    body.innerHTML = `<div class="card endscreen">
      <div class="big">${em}</div>
      <h2>${pct}% · ${pct >= 70 ? 'Goed gedaan! (Mandou bem!)' : 'Blijven oefenen! (Continue treinando!)'}</h2>
      <p class="muted">🔥 sequência: ${S.streak.count} dia(s) · ⚡ ${S.xp} XP total</p>
      <p><button class="btn" id="again">🔁 Refazer</button>
      <a class="btn" href="#/les/${L.id}">📖 Rever a lição</a>
      <a class="btn primary" href="#/">➡️ Próxima lição</a></p></div>`;
    $('#again').addEventListener('click', () => runExercises(body, L));
  }
  show();
}

/* ---------- flashcards / SRS ---------- */
function dueCards() {
  const now = Date.now();
  return Object.entries(S.srs).filter(([, v]) => v.due <= now).map(([k]) => k);
}
async function updateDueBadge() {
  const n = dueCards().length;
  const b = $('#dueBadge'); b.hidden = n === 0; b.textContent = n;
}
function gradeCard(key, grade) { // 0=again 1=hard 2=easy
  const c = S.srs[key] || { box: 0, due: 0 };
  c.box = grade === 0 ? 1 : grade === 1 ? Math.max(1, c.box) : Math.min(5, (c.box || 0) + 1);
  c.due = Date.now() + SRS_DAYS[c.box] * 864e5;
  S.srs[key] = c; save(); updateDueBadge();
}
function runFlashcards(body, L, cards) {
  let q = shuffle(cards), i = 0;
  function show() {
    if (i >= q.length) {
      body.innerHTML = `<div class="card endscreen"><div class="big">🃏✨</div>
        <h2>Revisão concluída!</h2>
        <p class="muted">As cartas voltam quando estiver na hora de revisar (repetição espaçada 🧠).</p>
        <p><a class="btn primary" href="#/">🏠 Início</a></p></div>`;
      touchStreak(); save(); return;
    }
    const c = q[i];
    body.innerHTML = `
      <p class="center muted">carta ${i + 1} de ${q.length} 🃏</p>
      <div class="fc" id="fc"><div class="fc-inner">
        <div class="fc-face">
          ${c.art ? `<span class="pill art-${c.art}">${c.art}</span>` : ''}
          <span class="fc-word">${esc(c.nl)}</span>
          ${hasTTS ? `<button class="speak-btn" id="say" style="font-size:1.5rem">🔊</button>` : ''}
          <span class="muted">toque para virar 👆</span>
        </div>
        <div class="fc-face fc-back">
          <span style="font-size:1.4rem">${c.emoji || ''} <b>${esc(c.pt)}</b></span>
          ${c.split ? `<span class="v-split">🧩 ${esc(c.split)}</span>` : ''}
        </div>
      </div></div>
      <div class="fc-grade" id="grade" hidden>
        <button class="btn" data-g="0">😵 De novo</button>
        <button class="btn" data-g="1">😐 Difícil</button>
        <button class="btn good" data-g="2">😎 Fácil</button>
      </div>`;
    const fc = $('#fc');
    fc.addEventListener('click', e => {
      if (e.target.id === 'say') { e.stopPropagation(); speak(c.nl); return; }
      fc.classList.toggle('flip'); $('#grade').hidden = false;
    });
    $('#grade').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      gradeCard(c.key, +b.dataset.g);
      if (+b.dataset.g === 0) q.push(c); // see it again this session
      i++; show();
    }));
  }
  show();
}

/* ---------- global review (due cards from all lessons) ---------- */
async function renderReview(app) {
  app.innerHTML = `<h1>🃏 Revisão inteligente</h1><div class="loading">⏳ Buscando cartas...</div>`;
  const man = await manifest();
  const due = new Set(dueCards());
  const cards = [];
  for (const l of man.lessons) {
    const hasAny = [...due].some(k => k.startsWith(l.id + '|'));
    if (!hasAny) continue;
    const L = await lesson(l.id);
    L.vocab.forEach(v => { const key = l.id + '|' + v.nl; if (due.has(key)) cards.push({ ...v, key }); });
  }
  if (!cards.length) {
    app.innerHTML = `<h1>🃏 Revisão inteligente</h1>
      <div class="card center"><p style="font-size:2.5rem">🎉</p>
      <p><b>Nenhuma carta para revisar agora!</b></p>
      <p class="muted">Estude as lições e as palavras entram aqui automaticamente, na hora certa de revisar (repetição espaçada 🧠).</p>
      <a class="btn primary" href="#/">📚 Ir para as lições</a></div>`;
    return;
  }
  app.innerHTML = `<h1>🃏 Revisão inteligente <span class="muted" style="font-size:1rem">${cards.length} carta(s) vencida(s)</span></h1><div id="fcbody"></div>`;
  runFlashcards($('#fcbody'), null, cards);
}

/* ---------- social media per lesson (📱 Ver na prática) ---------- */
let SOCIAL = null;
async function socialData() {
  if (SOCIAL === null) {
    try { SOCIAL = await (await fetch('data/social.json')).json(); } catch { SOCIAL = {}; }
  }
  return SOCIAL;
}
async function fillSocialCard(id) {
  const soc = (await socialData())[id];
  const el = document.getElementById('socialCard');
  if (!soc || !soc.length || !el) return;
  el.innerHTML = `<div class="card social-card"><h3>📱 Ver na prática (redes e vídeos)</h3>
    <p class="muted" style="margin-top:0"><small>Conteúdo real em neerlandês sobre este tema. Ouvir nativos é metade do aprendizado! 🎧</small></p>
    <div class="social-links">${soc.map(s =>
      `<a class="social-link" href="${esc(s.url)}" target="_blank" rel="noopener">
        <span class="social-icon">${esc(s.icon)}</span>
        <span><b>${esc(s.label)}</b><br><small class="muted">${esc(s.src || '')}</small></span> ↗</a>`).join('')}
    </div></div>`;
}

/* ---------- woordenboek: dicionário + busca rápida + emojis ---------- */
let ALLVOCAB = null, EMOJI = null;
async function allVocab() {
  if (ALLVOCAB) return ALLVOCAB;
  const man = await manifest();
  const out = [];
  const seen = new Set();
  const packs = await Promise.all(man.lessons.map(async l => ({ l, L: await lesson(l.id) })));
  for (const { l, L } of packs) {
    for (const v of L.vocab) {
      const k = norm(v.nl);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ...v, from: l.id, fromEmoji: l.emoji });
    }
  }
  try {  // extra dictionary entries beyond the lessons
    const extra = await (await fetch('data/woordenboek-extra.json')).json();
    for (const v of extra) {
      const k = norm(v.nl);
      if (!seen.has(k)) { seen.add(k); out.push(v); }
    }
  } catch { /* optional file */ }
  ALLVOCAB = out.sort((a, b) => norm(a.nl).localeCompare(norm(b.nl)));
  return ALLVOCAB;
}
async function emojiIndex() {
  if (!EMOJI) { try { EMOJI = await (await fetch('data/emoji/index.json')).json(); } catch { EMOJI = []; } }
  return EMOJI; // rows: [emoji, label_pt, tags_pt, label_nl, tags_nl]
}
async function renderWoordenboek(app) {
  app.innerHTML = `
    <h1>🔎 Woordenboek <small class="muted" style="font-size:1rem">dicionário + busca rápida</small></h1>
    <div class="card">
      <input class="fill-input" id="dictQ" style="max-width:100%" autocomplete="off"
        placeholder="🔍 digite em neerlandês OU português... (ex: huis, casa, afspraak, médico)">
      <p class="muted" style="margin:.5em 0 0"><small>💡 Busca nas palavras do curso (com a quebra 🧩), no banco de
      <b>1900+ emojis bilíngues</b> 😀 e oferece atalhos para dicionários externos.</small></p>
    </div>
    <div id="dictOut"><p class="muted center">⌨️ Comece a digitar...</p></div>`;
  const [vocab, emo] = await Promise.all([allVocab(), emojiIndex()]);
  const out = $('#dictOut'), q = $('#dictQ');
  q.focus();
  q.addEventListener('input', () => {
    const s = norm(q.value);
    if (s.length < 2) { out.innerHTML = `<p class="muted center">⌨️ Digite pelo menos 2 letras... (${vocab.length} palavras + ${emo.length} emojis na base)</p>`; return; }
    const words = vocab.filter(v => norm(v.nl).includes(s) || norm(v.pt).includes(s) || norm(v.split || '').includes(s)).slice(0, 40);
    const emojis = emo.filter(r => norm(r[1]).includes(s) || norm(r[2]).includes(s) || norm(r[3]).includes(s) || norm(r[4]).includes(s)).slice(0, 24);
    const enc = encodeURIComponent(q.value.trim());
    out.innerHTML = `
      ${words.length ? `<table class="vocab"><tr><th></th><th>palavra</th><th>quebra 🧩</th><th>português</th><th>lição</th></tr>
        ${words.map(v => `<tr>
          <td>${v.art ? `<span class="pill art-${v.art}">${v.art}</span>` : ''}</td>
          <td class="v-nl">${esc(v.nl)} ${hasTTS ? `<button class="speak-btn dspeak" data-say="${esc(v.nl)}">🔊</button>` : ''}</td>
          <td class="v-split">${esc(v.split || '')}</td>
          <td>${v.emoji || ''} ${esc(v.pt)}</td>
          <td>${v.from ? `<a href="#/les/${v.from}" title="ver lição">${v.fromEmoji || '📖'}</a>` : '📕'}</td></tr>`).join('')}</table>`
      : `<div class="card center">🤷 Nada no vocabulário do curso para "<b>${esc(q.value)}</b>".</div>`}
      ${emojis.length ? `<div class="card"><h3>😀 Emojis que combinam <small class="muted" style="font-size:.8rem">(toque para copiar)</small></h3>
        <div class="emoji-grid">${emojis.map(r => `<button class="emoji-hit" data-e="${esc(r[0])}" title="🇧🇷 ${esc(r[1])} · 🇧🇪 ${esc(r[3])}">${r[0]}<small>${esc(r[3])}</small></button>`).join('')}</div></div>` : ''}
      <div class="card"><h3>🌍 Não achou? Busque fora:</h3>
        <p class="ext-links">
          <a class="btn small" target="_blank" rel="noopener" href="https://glosbe.com/nl/pt/${enc}">📗 Glosbe NL→PT</a>
          <a class="btn small" target="_blank" rel="noopener" href="https://glosbe.com/pt/nl/${enc}">📘 Glosbe PT→NL</a>
          <a class="btn small" target="_blank" rel="noopener" href="https://translate.google.com/?sl=auto&tl=pt&text=${enc}&op=translate">🌐 Google Translate</a>
          <a class="btn small" target="_blank" rel="noopener" href="https://www.deepl.com/translator#nl/pt/${enc}">🤖 DeepL</a>
          <a class="btn small" target="_blank" rel="noopener" href="https://www.vandale.nl/gratis-woordenboek/nederlands/betekenis/${enc}">📙 Van Dale (NL)</a>
        </p></div>`;
    out.querySelectorAll('.dspeak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
    out.querySelectorAll('.emoji-hit').forEach(b => b.addEventListener('click', () => {
      navigator.clipboard && navigator.clipboard.writeText(b.dataset.e);
      toast(`${b.dataset.e} copiado!`);
    }));
  });
}

/* ---------- reusable vocab table ---------- */
function vocabRow(v) {
  return `<tr>
    <td>${v.art ? `<span class="pill art-${v.art}">${v.art}</span>` : ''}</td>
    <td class="v-nl">${esc(v.nl)} ${hasTTS ? `<button class="speak-btn vspeak" data-say="${esc(v.nl)}">🔊</button>` : ''}</td>
    <td class="v-split">${esc(v.split || '')}</td>
    <td>${v.emoji ? v.emoji + ' ' : ''}${esc(clockify(v.pt))}</td></tr>`;
}
function vocabTableHTML(list) {
  return `<table class="vocab"><tr><th></th><th>palavra</th><th>quebra 🧩</th><th>português</th></tr>
    ${list.map(vocabRow).join('')}</table>`;
}
function bindVspeak(root) { root.querySelectorAll('.vspeak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say))); }

/* ---------- LEVEL selector: click A1 -> all A1 content ---------- */
async function renderLevel(app, unit) {
  app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div><h1>${UNIT_INFO[unit].emoji} Nível ${unit} <span class="muted" style="font-size:1rem">${UNIT_INFO[unit].name}</span></h1><div class="loading">⏳ Reunindo tudo do ${unit}...</div>`;
  const man = await manifest();
  const ls = man.lessons.filter(l => l.unit === unit);
  const packs = await Promise.all(ls.map(l => lesson(l.id)));
  const allPhrases = packs.flatMap(L => L.phrases.map(p => ({ ...p, _from: L.emoji })));
  const allVocab = []; const seen = new Set();
  packs.forEach(L => L.vocab.forEach(v => { const k = norm(v.nl); if (!seen.has(k)) { seen.add(k); allVocab.push(v); } }));
  const c = UNIT_COLORS[unit];
  const levelGames = GAME_DOMAINS.filter(d => d.level === unit);
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <div class="level-hero" style="border-color:${c}">
      <span class="level-chip" style="background:${c}">${unit}</span>
      <div><h1 style="margin:0">${UNIT_INFO[unit].emoji} ${UNIT_INFO[unit].name}</h1>
      <span class="muted">${ls.length} lições · ${allPhrases.length} frases · ${allVocab.length} palavras ·
      ${packs.reduce((s, L) => s + L.exercises.length, 0)} exercícios${levelGames.length ? ` · ${levelGames.length} jogo(s) 🧩` : ''}</span></div>
    </div>
    <div class="tabs" id="lvltabs">
      <button class="tab active" data-t="les">📚 Lições</button>
      <button class="tab" data-t="phr">🎨 Frases</button>
      <button class="tab" data-t="voc">🧩 Vocabulário</button>
      ${levelGames.length ? `<button class="tab" data-t="jog">🧩 Jogos</button>` : ''}
    </div>
    <div id="lvlbody"></div>`;
  const body = $('#lvlbody');
  const tabs = {
    les: () => {
      body.innerHTML = `<div class="lesson-grid">${ls.map(l => {
        const pct = lessonProgress(l.id, l.exercises || 10);
        return `<a class="lesson-card" href="#/les/${l.id}"><span class="em">${l.emoji}</span>
          <h3>${esc(l.title)}</h3><span class="pct">${l.phrases} frases · ${l.exercises} exercícios ${pct === 100 ? '· ✅' : ''}</span>
          <div class="progressbar"><div style="width:${pct}%"></div></div></a>`; }).join('')}</div>
        <p class="center" style="margin-top:16px"><button class="btn primary" id="fcAll">🃏 Flashcards de TODO o ${unit} (${allVocab.length})</button></p>`;
      $('#fcAll').addEventListener('click', () => {
        app.innerHTML = `<div class="crumb"><a href="#/nivel/${unit}">← ${unit}</a></div><h1>🃏 ${unit} completo</h1><div id="fcx"></div>`;
        runFlashcards($('#fcx'), null, allVocab.map(v => ({ ...v, key: 'lvl-' + unit + '|' + v.nl })));
      });
    },
    phr: () => {
      body.innerHTML = legendStrip(allPhrases) + allPhrases.map((p, i) => phraseHTML(p, i)).join('');
      bindPhraseEvents(body);
      body.querySelectorAll('.speak').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); speak(b.dataset.say); }));
    },
    voc: () => { body.innerHTML = vocabTableHTML(allVocab); bindVspeak(body); },
    jog: () => {
      body.innerHTML = `<div class="game-grid">${levelGames.map(d => `<a class="game-tile" href="#/spelletjes/${d.id}" style="border-color:${d.color}">
        <span class="game-em" style="background:${d.color}22">${d.emoji}</span><b>${d.label}</b></a>`).join('')}</div>`;
    },
  };
  app.querySelectorAll('#lvltabs .tab').forEach(b => b.addEventListener('click', () => {
    app.querySelectorAll('#lvltabs .tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); tabs[b.dataset.t]();
  }));
  tabs.les();
}

/* ---------- KLANKEN: native sound trainer (long vs short, digraphs) ---------- */
async function renderKlanken(app) {
  app.innerHTML = `<h1>🔊 Klanken <span class="muted" style="font-size:1rem">o treino de sons</span></h1><div class="loading">⏳...</div>`;
  let K; try { K = await (await fetch('data/klanken.json')).json(); } catch { app.innerHTML = '<div class="card">Em breve 🔜</div>'; return; }
  const sc = (o) => `<button class="klank-word" data-say="${esc(o.word)}">
      <span class="klank-letter">${esc(o.letter)}</span>
      <span class="klank-ex">${o.emoji || ''} ${esc(o.word)}<small>${esc(o.pt)}</small></span>
      ${hasTTS ? '<span class="klank-play">🔊</span>' : ''}</button>`;
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🔊 Klanken: ouça e sinta a diferença</h1>
    <p class="muted">${esc(K.intro || '')} ${hasTTS ? '' : '⚠️ Seu navegador não tem voz neerlandesa; instale uma para ouvir.'}</p>
    <h2>⚖️ Vogal curta vs longa <small class="muted" style="font-size:.8rem">(muda o significado!)</small></h2>
    ${K.minimalPairs.map(p => `<div class="card klank-pair">
      <div class="klank-vs">${sc(p.short)}<span class="vs">⚔️</span>${sc(p.long)}</div>
      <p class="klank-tip">💡 ${esc(p.tipPt || '')}</p></div>`).join('')}
    <h2 style="margin-top:22px">🔤 Dígrafos e sons especiais</h2>
    <div class="klank-grid">${K.digraphs.map(d => `<div class="card klank-single">
      <button class="klank-word big" data-say="${esc(d.word)}">
        <span class="klank-letter">${esc(d.letter)}</span>
        <span class="klank-ex">${d.emoji || ''} ${esc(d.word)}<small>${esc(d.pt)}</small></span>
        ${hasTTS ? '<span class="klank-play">🔊</span>' : ''}</button>
      <p class="klank-tip">🗣️ ${esc(d.ptSound || '')}${d.tipPt ? ' · ' + esc(d.tipPt) : ''}</p></div>`).join('')}</div>`;
  app.querySelectorAll('.klank-word').forEach(b => b.addEventListener('click', () => { speak(b.dataset.say); b.classList.add('said'); setTimeout(() => b.classList.remove('said'), 400); }));
}

/* ---------- BELGIË: geography, cities, politics, sport, culture, history, fun facts ---------- */
async function renderBelgie(app) {
  app.innerHTML = `<h1>🇧🇪 Ontdek België</h1><div class="loading">⏳...</div>`;
  let B; try { B = await (await fetch('data/belgie.json')).json(); } catch { app.innerHTML = '<div class="card">Em breve 🔜</div>'; return; }
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🇧🇪 Ontdek België <span class="muted" style="font-size:1rem">Descubra a Bélgica (e a Holanda)</span></h1>
    <p class="muted">Conhecer o país é parte da integração (inburgering). Fatos verificados na Wikipédia, com o vocabulário em neerlandês. 🧠</p>
    <div class="chips" id="belnav">${B.sections.map((s, i) => `<button class="chip" data-i="${i}">${s.emoji} ${esc(s.title.split(' · ')[0])}</button>`).join('')}</div>
    <div id="belbody"></div>`;
  const body = $('#belbody');
  function showSec(i) {
    const s = B.sections[i];
    app.querySelectorAll('#belnav .chip').forEach((c, k) => c.classList.toggle('sel', k === i));
    body.innerHTML = `<div class="card"><h2>${s.emoji} ${esc(s.title)}</h2>
      ${s.intro ? `<p class="muted">${esc(s.intro)}</p>` : ''}
      <div class="fact-list">${(s.facts || []).map(f => `<div class="fact">
        <span class="fact-emoji">${f.emoji || '•'}</span>
        <div>${f.nl ? `<b class="v-nl">${esc(f.nl)}</b> ${hasTTS && f.nl ? `<button class="speak-btn bspeak" data-say="${esc(f.nl)}">🔊</button>` : ''}${f.name ? `<b>${esc(f.name)}</b>` : ''}<br>` : ''}
        <span>${esc(f.pt || f.fact || '')}</span></div></div>`).join('')}</div>
      ${(s.vocab && s.vocab.length) ? `<h3 style="margin-top:16px">🧩 Vocabulário</h3>${vocabTableHTML(s.vocab)}` : ''}
    </div>`;
    body.querySelectorAll('.bspeak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
    bindVspeak(body);
    body.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  app.querySelectorAll('#belnav .chip').forEach(c => c.addEventListener('click', () => showSec(+c.dataset.i)));
  showSec(0);
}

/* ---------- DECKS: open-source style flashcard decks ---------- */
async function renderDecks(app) {
  app.innerHTML = `<h1>🃏 Baralhos</h1><div class="loading">⏳...</div>`;
  let D; try { D = await (await fetch('data/decks.json')).json(); } catch { app.innerHTML = '<div class="card">Em breve 🔜</div>'; return; }
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🃏 Baralhos de flashcards <span class="muted" style="font-size:1rem">estilo Quizlet, mas aberto</span></h1>
    <p class="muted">Temas prontos para memorizar. Cada baralho usa repetição espaçada 🧠. <small>${esc(D.attribution || '')}</small></p>
    <div class="lesson-grid">${D.decks.map(dk => `<button class="lesson-card" data-deck="${esc(dk.id)}">
      <span class="em">${dk.emoji}</span><h3>${esc(dk.title)}</h3>
      <span class="pct">${dk.cards.length} cartas · ${esc(dk.desc || '')}</span></button>`).join('')}</div>`;
  app.querySelectorAll('[data-deck]').forEach(b => b.addEventListener('click', () => {
    const dk = D.decks.find(x => x.id === b.dataset.deck);
    app.innerHTML = `<div class="crumb"><a href="#/decks">← Baralhos</a></div><h1>${dk.emoji} ${esc(dk.title)}</h1><div id="deckfc"></div>`;
    runFlashcards($('#deckfc'), null, dk.cards.map(v => ({ ...v, key: 'deck-' + dk.id + '|' + v.nl })));
  }));
}

/* ---------- MISTAKES quicklist: extra attention where it is needed ---------- */
function renderMistakes(app) {
  const list = mistakeList();
  if (!list.length) {
    app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div><h1>🎯 Minhas dificuldades</h1>
      <div class="card center"><p style="font-size:2.5rem">🌟</p><p><b>Nenhum erro registrado. Mandou bem!</b></p>
      <p class="muted">Quando você errar um exercício, a palavra ou frase aparece aqui automaticamente, para você dar atenção extra.</p>
      <a class="btn primary" href="#/">📚 Ir às lições</a></div>`;
    return;
  }
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🎯 Minhas dificuldades <span class="muted" style="font-size:1rem">${list.length} item(s)</span></h1>
    <p class="muted">Tudo que você errou, junto, para revisar com foco. Erros repetidos aparecem no topo 🔺.</p>
    <p><button class="btn primary" id="drill">🃏 Treinar todas como flashcards</button>
    <button class="btn" id="clearAll">🧹 Limpar tudo</button></p>
    <div class="mistake-list">${list.map(m => `<div class="card mistake" data-key="${esc(m.key)}">
      <div class="mistake-top"><span class="pill" style="background:${UNIT_COLORS[m.unit] || '#888'};color:#fff">${esc(m.unit || '')}</span>
        <span class="muted">${m.lessonEmoji || ''} ${esc(m.lessonTitle || '')}</span>
        ${m.count > 1 ? `<span class="rep">🔺 ${m.count}x</span>` : ''}
        <button class="del-mistake" title="Já aprendi" data-key="${esc(m.key)}">✓ aprendi</button></div>
      <div class="mistake-body"><b class="v-nl">${esc(m.nl || m.answer || '')}</b>
        ${hasTTS && (m.nl || m.answer) ? `<button class="speak-btn mspeak" data-say="${esc(m.nl || m.answer)}">🔊</button>` : ''}
        <span class="muted"> — ${esc(clockify(m.pt || m.q || ''))}</span></div></div>`).join('')}</div>`;
  app.querySelectorAll('.mspeak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
  app.querySelectorAll('.del-mistake').forEach(b => b.addEventListener('click', () => { clearMistake(b.dataset.key); renderMistakes(app); }));
  $('#clearAll').addEventListener('click', () => { if (confirm('Limpar toda a lista de dificuldades?')) { S.mistakes = {}; save(); updateMistakeBadge(); renderMistakes(app); } });
  $('#drill').addEventListener('click', () => {
    app.innerHTML = `<div class="crumb"><a href="#/dificuldades">← dificuldades</a></div><h1>🃏 Treino de dificuldades</h1><div id="mfc"></div>`;
    runFlashcards($('#mfc'), null, list.map(m => ({ nl: m.nl || m.answer, pt: m.pt || m.q, split: '', art: null, emoji: '🎯', key: 'mist|' + m.key })));
  });
}

/* ============================================================
   🧩 SPELLETJES: drag-and-drop games (native pointer events,
   works identically with mouse and touch, mobile + desktop)
   ============================================================ */
const GAME_DOMAINS = [
  { id:'taal',        emoji:'🔤', label:'Palavras',    color:'#1D4E89', type:'sort-vocab' },
  { id:'zinnen',       emoji:'🧱', label:'Frases',      color:'#C8401F', type:'build', file:'games-sciences.json', key:'zinnen' },
  { id:'geografie',    emoji:'🗺️', label:'Geografia',   color:'#17756B', type:'sort',  file:'games-sciences.json',   key:'geografie' },
  { id:'politiek',     emoji:'🏛️', label:'Política',    color:'#6A1B9A', type:'sort',  file:'games-humanities.json', key:'politiek' },
  { id:'nieuws',       emoji:'📰', label:'Notícias',    color:'#455A64', type:'sort',  file:'games-humanities.json', key:'nieuws' },
  { id:'sport',        emoji:'⚽', label:'Esporte',     color:'#2E7D32', type:'sort',  file:'games-sciences.json',   key:'sport' },
  { id:'kunst',        emoji:'🎨', label:'Arte',        color:'#EF6C00', type:'match', file:'games-humanities.json', key:'kunst' },
  { id:'geschiedenis', emoji:'📜', label:'História',    color:'#8D6E63', type:'timeline', file:'games-humanities.json', key:'geschiedenis' },
  { id:'biologie',     emoji:'🧬', label:'Biologia',    color:'#00838F', type:'sort',  file:'games-sciences.json',   key:'biologie' },
  { id:'esthetiek',    emoji:'✨', label:'Estética',    color:'#AD1457', type:'sort',  file:'games-sciences.json',   key:'esthetiek' },
  { id:'idiomen',      emoji:'🗝️', label:'Idiomatismos', color:'#6A1B9A', type:'match', file:'games-c2.json', key:'idiomen', level:'C2' },
  { id:'nuance',       emoji:'🎯', label:'Nuance (C2)', color:'#B0207E', type:'sort',  file:'games-c2.json', key:'nuance',  level:'C2' },
];
const GAME_FILE_CACHE = {};
async function gameFile(name) {
  if (!GAME_FILE_CACHE[name]) { try { GAME_FILE_CACHE[name] = await (await fetch('data/' + name)).json(); } catch { GAME_FILE_CACHE[name] = {}; } }
  return GAME_FILE_CACHE[name];
}
async function gamesForDomain(dom) {
  if (dom.type === 'sort-vocab') { // built live from the course vocabulary (de vs het)
    const vocab = (await allVocab()).filter(v => v.art);
    const rounds = [];
    for (let i = 0; i < vocab.length; i += 8) {
      const slice = shuffle(vocab).slice(0, 8); // fresh random 8 each round
      rounds.push({ title: 'DE ou HET?', instruction: 'Arraste cada palavra para o artigo certo',
        buckets: [{ id:'de', label:'DE', emoji:'🟧' }, { id:'het', label:'HET', emoji:'🟩' }],
        items: slice.map(v => ({ nl: v.nl.replace(/^(de|het)\s+/, ''), pt: v.pt, emoji: v.emoji || '🔤', bucket: v.art })) });
      if (rounds.length >= 6) break;
    }
    return rounds;
  }
  const data = await gameFile(dom.file);
  return data[dom.key] || [];
}

async function renderGamesHub(app) {
  app.innerHTML = `
    <div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🧩 Spelletjes <span class="muted" style="font-size:1rem">arraste e solte para aprender</span></h1>
    <p class="muted">Jogos de arrastar-e-soltar em 10 áreas: palavras, frases, política, notícias, esporte,
    geografia, arte, história, biologia e estética. Funciona igual no celular (toque) e no computador (mouse). 👆🖱️</p>
    <div class="game-grid">${GAME_DOMAINS.map(d => `<a class="game-tile" href="#/spelletjes/${d.id}" style="border-color:${d.color}">
      ${d.level ? `<span class="game-lvl" style="background:${d.color}">${d.level}</span>` : ''}
      <span class="game-em" style="background:${d.color}22">${d.emoji}</span><b>${d.label}</b></a>`).join('')}</div>`;
}

async function renderGameDomain(app, domId) {
  const dom = GAME_DOMAINS.find(d => d.id === domId);
  if (!dom) return renderGamesHub(app);
  app.innerHTML = `<div class="crumb"><a href="#/spelletjes">🧩 Spelletjes</a></div><h1>${dom.emoji} ${dom.label}</h1><div class="loading">⏳...</div>`;
  const rounds = await gamesForDomain(dom);
  if (!rounds.length) { app.innerHTML = `<div class="crumb"><a href="#/spelletjes">🧩 Spelletjes</a></div><div class="card">Em breve 🔜</div>`; return; }
  let idx = 0, wonRounds = 0;
  const wrap = document.createElement('div');
  app.innerHTML = `<div class="crumb"><a href="#/spelletjes">🧩 Spelletjes</a></div>
    <div class="game-progress"><h1 style="margin:0">${dom.emoji} ${esc(dom.label)}</h1>
    <div class="progressbar" style="flex:1;margin:0 12px"><div style="width:${Math.round(100*idx/rounds.length)}%"></div></div>
    <b>${idx+1}/${rounds.length}</b></div>`;
  app.appendChild(wrap);
  function playRound() {
    const bar = app.querySelector('.progressbar > div'); if (bar) bar.style.width = Math.round(100*idx/rounds.length) + '%';
    const cnt = app.querySelector('.game-progress b'); if (cnt) cnt.textContent = `${idx+1}/${rounds.length}`;
    const r = rounds[idx];
    if (dom.type === 'sort' || dom.type === 'sort-vocab') playSort(wrap, r, onWin);
    else if (dom.type === 'timeline') playTimeline(wrap, r, onWin);
    else if (dom.type === 'match') playMatch(wrap, r, onWin);
    else if (dom.type === 'build') playBuild(wrap, r, onWin);
  }
  function onWin() {
    wonRounds++; addXP(15); recordMistake.lastWin = true;
    idx++;
    if (idx < rounds.length) setTimeout(playRound, 900);
    else setTimeout(() => {
      wrap.innerHTML = `<div class="card endscreen"><div class="big">🏆</div><h2>${dom.label} completo!</h2>
        <p class="muted">${wonRounds} rodada(s) · ⚡ ${S.xp} XP total</p>
        <p><button class="btn" id="again">🔁 Jogar de novo</button><a class="btn primary" href="#/spelletjes">🧩 Outros jogos</a></p></div>`;
      $('#again').addEventListener('click', () => { idx = 0; wonRounds = 0; playRound(); });
    }, 900);
  }
  playRound();
}

/* ---------- universal pointer-based drag helper ---------- */
function makeDraggable(el, onDrop) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', ev => {
    if (el.classList.contains('placed')) return;
    ev.preventDefault();
    const startRect = el.getBoundingClientRect();
    const offX = ev.clientX - startRect.left, offY = ev.clientY - startRect.top;
    const parent = el.parentElement, placeholder = document.createElement('span');
    placeholder.className = 'drag-ghost-slot'; placeholder.style.width = startRect.width + 'px'; placeholder.style.height = startRect.height + 'px';
    parent.insertBefore(placeholder, el);
    document.body.appendChild(el);
    el.classList.add('dragging');
    el.style.width = startRect.width + 'px';
    const move = e => { el.style.left = (e.clientX - offX) + 'px'; el.style.top = (e.clientY - offY) + 'px'; };
    move(ev);
    const up = e => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      el.classList.remove('dragging');
      el.style.position = ''; el.style.left = ''; el.style.top = ''; el.style.width = '';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const dropZone = under && under.closest ? under.closest('[data-dropzone]') : null;
      if (dropZone && onDrop(el, dropZone)) { placeholder.remove(); }
      else { parent.insertBefore(el, placeholder); placeholder.remove(); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
}

/* ---------- game type: SORT (drag chips into labeled buckets) ---------- */
function playSort(wrap, r, onWin) {
  let remaining = r.items.length, wrong = 0;
  wrap.innerHTML = `<div class="card">
    <h3>${esc(r.title)}</h3><p class="muted">${esc(r.instruction || 'Arraste cada item para o grupo certo')}</p>
    <div class="drop-buckets">${r.buckets.map(b => `<div class="bucket" data-dropzone data-bucket="${esc(b.id)}">
      <div class="bucket-head">${b.emoji || '📦'} ${esc(b.label)}</div><div class="bucket-body"></div></div>`).join('')}</div>
    <div class="drag-pool">${shuffle(r.items).map((it, i) => `<span class="drag-chip" data-answer="${esc(it.bucket)}" data-i="${i}">
      ${it.emoji || ''} <b>${esc(it.nl)}</b><small>${esc(it.pt)}</small></span>`).join('')}</div>
    <p class="game-feedback" id="gfb"></p></div>`;
  wrap.querySelectorAll('.drag-chip').forEach(chip => makeDraggable(chip, (el, zone) => {
    const ok = zone.dataset.bucket === el.dataset.answer;
    if (ok) {
      zone.querySelector('.bucket-body').appendChild(el);
      el.classList.add('placed', 'correct-drop');
      remaining--;
      $('#gfb').innerHTML = '✅ Isso!';
      if (remaining === 0) { $('#gfb').innerHTML = wrong === 0 ? '🌟 Perfeito, sem erros!' : '🎉 Rodada concluída!'; onWin(); }
      return true;
    }
    wrong++; recordMistake({ lesson: 'jogo:' + (r.title || ''), lessonTitle: r.title, lessonEmoji: '🧩', unit: '', q: el.textContent, nl: el.querySelector('b').textContent, pt: el.querySelector('small').textContent, answer: el.querySelector('b').textContent });
    $('#gfb').innerHTML = `❌ Tente de novo: <b>${esc(el.querySelector('b').textContent)}</b> não é desse grupo.`;
    el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
    return false;
  }));
}

/* ---------- game type: TIMELINE (drag events into chronological order) ---------- */
function playTimeline(wrap, r, onWin) {
  const order = r.events.map(e => e.year);
  let placedYears = [];
  wrap.innerHTML = `<div class="card">
    <h3>${esc(r.title)}</h3><p class="muted">${esc(r.instruction || 'Arraste os eventos para a ordem certa')}</p>
    <div class="timeline-track" data-dropzone></div>
    <div class="drag-pool">${shuffle(r.events).map((e, i) => `<span class="drag-chip wide" data-year="${e.year}" data-i="${i}">
      ${e.emoji || '📅'} <b>${esc(e.nl)}</b><small>${esc(e.pt)}</small></span>`).join('')}</div>
    <p class="game-feedback" id="gfb"></p></div>`;
  const track = wrap.querySelector('.timeline-track');
  wrap.querySelectorAll('.drag-chip').forEach(chip => makeDraggable(chip, (el, zone) => {
    if (zone !== track) return false;
    const y = +el.dataset.year;
    // insert at correct visual position based on year (helps confirm ordering visually)
    let inserted = false;
    for (const child of [...track.children]) {
      if (+child.dataset.year > y) { track.insertBefore(el, child); inserted = true; break; }
    }
    if (!inserted) track.appendChild(el);
    el.classList.add('placed');
    placedYears.push(y);
    const isSorted = [...track.children].every((c, i, arr) => i === 0 || +arr[i-1].dataset.year <= +c.dataset.year);
    if (!isSorted) { recordMistake({ lesson:'jogo:'+r.title, lessonTitle:r.title, lessonEmoji:'📜', unit:'', q:el.textContent, nl:el.querySelector('b').textContent, pt:'ordem cronológica', answer:el.querySelector('b').textContent }); }
    $('#gfb').innerHTML = isSorted ? '✅ Ordem certa até agora!' : '🤔 Reveja a ordem: um evento está fora de lugar.';
    if (placedYears.length === order.length) {
      const finalOK = [...track.children].every((c, i, arr) => i === 0 || +arr[i-1].dataset.year <= +c.dataset.year);
      $('#gfb').innerHTML = finalOK ? '🌟 Linha do tempo completa e correta!' : '🎉 Completo! (reveja a ordem quando puder)';
      onWin();
    }
    return true;
  }));
}

/* ---------- game type: MATCH (drag a term card onto its description) ---------- */
function playMatch(wrap, r, onWin) {
  let remaining = r.pairs.length;
  wrap.innerHTML = `<div class="card">
    <h3>${esc(r.title)}</h3><p class="muted">${esc(r.instruction || 'Arraste cada termo para a descrição certa')}</p>
    <div class="match-columns">
      <div class="drag-pool vertical">${shuffle(r.pairs.map((p, i) => ({ p, i }))).map(o => `<span class="drag-chip wide" data-i="${o.i}">${o.p.emoji || '🎯'} <b>${esc(o.p.nl)}</b></span>`).join('')}</div>
      <div class="drop-targets">${shuffle(r.pairs.map((p, i) => ({ p, i }))).map(o => `<div class="target-desc" data-dropzone data-i="${o.i}">${esc(o.p.pt)}</div>`).join('')}</div>
    </div>
    <p class="game-feedback" id="gfb"></p></div>`;
  wrap.querySelectorAll('.drag-chip').forEach(chip => makeDraggable(chip, (el, zone) => {
    const ok = zone.dataset.i === el.dataset.i;
    if (ok) {
      zone.innerHTML = `${el.innerHTML}<div class="target-answer">${zone.textContent}</div>`;
      zone.classList.add('correct-drop'); el.remove(); remaining--;
      $('#gfb').innerHTML = '✅ Combinou!';
      if (remaining === 0) { $('#gfb').innerHTML = '🌟 Todos os pares corretos!'; onWin(); }
      return true;
    }
    recordMistake({ lesson:'jogo:'+r.title, lessonTitle:r.title, lessonEmoji:'🎨', unit:'', q:el.textContent, nl:el.querySelector('b').textContent, pt: zone.textContent, answer: el.querySelector('b').textContent });
    $('#gfb').innerHTML = '❌ Não é esse par, tente outra descrição.';
    el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
    return false;
  }));
}

/* ---------- game type: BUILD (drag word tokens in order to build a sentence) ---------- */
function playBuild(wrap, r, onWin) {
  const target = r.tokens.join(' ');
  let placed = [];
  wrap.innerHTML = `<div class="card">
    <h3>🧱 ${esc(r.title)}</h3><p class="muted">tradução: <i>${esc(r.pt)}</i></p>
    <div class="built-sentence" data-dropzone></div>
    <div class="drag-pool">${shuffle(r.tokens.map((t, i) => ({ t, i }))).map(o => `<span class="drag-chip" data-i="${o.i}">${esc(o.t)}</span>`).join('')}</div>
    <div style="display:flex;gap:8px"><button class="btn small" id="resetB">↩️ desfazer tudo</button></div>
    <p class="game-feedback" id="gfb"></p></div>`;
  const zone = wrap.querySelector('.built-sentence');
  function checkDone() {
    if (placed.length !== r.tokens.length) return;
    const made = [...zone.children].map(c => c.textContent).join(' ');
    if (norm(made) === norm(target)) {
      $('#gfb').innerHTML = `🌟 Perfeito! "${esc(target)}"${r.explain ? '<br><small>💡 ' + esc(r.explain) + '</small>' : ''}`;
      onWin();
    } else {
      recordMistake({ lesson:'jogo:'+r.title, lessonTitle:r.title, lessonEmoji:'🧱', unit:'', q:r.pt, nl:target, pt:r.pt, answer:target });
      $('#gfb').innerHTML = `❌ Quase! A ordem certa é: <b>${esc(target)}</b>${r.explain ? '<br><small>💡 ' + esc(r.explain) + '</small>' : ''}`;
    }
  }
  wrap.querySelectorAll('.drag-chip').forEach(chip => makeDraggable(chip, (el, dz) => {
    if (dz !== zone) return false;
    zone.appendChild(el); el.classList.add('placed'); placed.push(el.dataset.i);
    checkDone();
    return true;
  }));
  $('#resetB').addEventListener('click', () => { const b = wrap.querySelector('.drag-pool'); [...zone.children].forEach(c => { c.classList.remove('placed'); b.appendChild(c); }); placed = []; $('#gfb').innerHTML = ''; });
}

/* ---------- daily word/phrase widget (home) + monthly wordlists ---------- */
async function dailyWidgetHTML() {
  let d; try { d = await (await fetch('data/daily/latest.json')).json(); } catch { return ''; }
  if (!d || !d.word) return '';
  return `<div class="card daily-card">
    <div class="daily-head">📅 <b>Hoje · Hoje (${esc(d.date || '')})</b></div>
    <div class="daily-word">
      <span class="daily-em">${d.word.emoji || '🔤'}</span>
      <div><b class="v-nl">${d.word.art ? `<span class="pill art-${d.word.art}">${d.word.art}</span> ` : ''}${esc(d.word.nl)}</b>
        ${hasTTS ? `<button class="speak-btn dspeak" data-say="${esc(d.word.nl)}">🔊</button>` : ''}
        <br><small class="muted">${esc(d.word.pt)}${d.word.split ? ' · 🧩 ' + esc(d.word.split) : ''}</small></div>
    </div>
    ${d.phrase ? `<div class="daily-phrase">${phraseHTML(d.phrase, 'daily')}</div>` : ''}
  </div>`;
}
async function renderMaandOverzicht(app) {
  app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div><h1>🗓️ Woordenlijsten do mês</h1><div class="loading">⏳...</div>`;
  let idx; try { idx = await (await fetch('data/maandelijst/index.json')).json(); } catch { idx = []; }
  if (!idx.length) { app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div><div class="card">Em breve 🔜</div>`; return; }
  app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>🗓️ Woordenlijsten do mês <span class="muted" style="font-size:1rem">um baralho temático novo todo mês</span></h1>
    <div class="lesson-grid">${idx.map(m => `<a class="lesson-card" href="#/maandelijst/${m.month}">
      <span class="em">${m.emoji}</span><h3>${esc(m.theme)}</h3><span class="pct">${esc(m.month)}</span></a>`).join('')}</div>`;
}
async function renderMaandDetail(app, month) {
  app.innerHTML = `<div class="crumb"><a href="#/maandelijst">← meses</a></div><div class="loading">⏳...</div>`;
  let d; try { d = await (await fetch(`data/maandelijst/${month}.json`)).json(); } catch { app.innerHTML = '<div class="card">Não encontrado 🤷</div>'; return; }
  app.innerHTML = `<div class="crumb"><a href="#/maandelijst">← meses</a></div>
    <h1>${d.emoji} ${esc(d.theme)}</h1><p class="muted">${esc(d.intro || '')}</p>
    <p><button class="btn primary" id="playFc">🃏 Estudar como flashcards (${d.cards.length})</button></p>
    ${vocabTableHTML(d.cards)}`;
  bindVspeak(app);
  $('#playFc').addEventListener('click', () => {
    app.innerHTML = `<div class="crumb"><a href="#/maandelijst/${month}">← ${esc(d.theme)}</a></div><h1>${d.emoji} ${esc(d.theme)}</h1><div id="mfc2"></div>`;
    runFlashcards($('#mfc2'), null, d.cards.map(v => ({ ...v, key: 'maand-' + month + '|' + v.nl })));
  });
}

/* ---------- premium: paywall + upsell screen ---------- */
async function renderPremium(app, qs) {
  if (qs && qs.get('success') === '1') { toast('🎉 Pagamento recebido! Ativando...'); setTimeout(checkPremiumStatus, 1200); setTimeout(checkPremiumStatus, 4000); }
  const enabled = window.NL_CONFIG && window.NL_CONFIG.PREMIUM_ENABLED;
  app.innerHTML = `<div class="crumb"><a href="#/">🏠 Início</a></div>
    <h1>⭐ Nederlands! Premium</h1>
    ${isPremium() ? `<div class="card center"><p style="font-size:2.5rem">🏆</p>
      <p><b>Você já é Premium! Dank je wel! 💛</b></p><a class="btn primary" href="#/">📚 Voltar às lições</a></div>` : `
    <div class="card">
      <p class="muted">O curso inteiro continua <b>100% gratuito</b>, para sempre. O Premium é para quem quer apoiar o
      projeto e ganhar mimos extras. ✨</p>
      <ul class="checklist">
        <li>🚫 Sem anúncios em lugar nenhum</li>
        <li>📄 Exportar qualquer lição em PDF para imprimir</li>
        <li>🏅 Certificado de conclusão por nível (A1...C1)</li>
        <li>🃏 Baralhos e jogos exclusivos, liberados na hora</li>
        <li>💛 Você ajuda a manter o projeto vivo e gratuito para outros brasileiros</li>
      </ul>
      ${enabled ? `<p><button class="btn primary" id="buyBtn">⭐ Tornar-se Premium</button></p><p id="buyMsg" class="muted"></p>`
        : `<p class="muted">💤 A compra ainda não foi ativada pelo administrador do site. Volte em breve!</p>`}
    </div>`}`;
  const buy = document.getElementById('buyBtn');
  if (buy) buy.addEventListener('click', async () => {
    buy.disabled = true; document.getElementById('buyMsg').textContent = '⏳ Abrindo pagamento seguro...';
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: deviceId() }) });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else { document.getElementById('buyMsg').textContent = '⚠️ ' + (d.message || 'Indisponível agora.'); buy.disabled = false; }
    } catch { document.getElementById('buyMsg').textContent = '⚠️ Erro de conexão.'; buy.disabled = false; }
  });
}

/* ---------- legend ---------- */
function renderLegend(app) {
  app.innerHTML = `
    <h1>🎨 A legenda das cores: a ponte entre as línguas</h1>
    <div class="card"><p>Nas frases deste curso, <b>cada tipo de palavra tem um estilo fixo, igual nas duas línguas</b>.
    O <span class="r-verb">verbo</span> neerlandês e o <span class="r-verb">verbo</span> português têm a mesma cor;
    o <span class="r-noun">substantivo</span> também, e assim por diante. Seu cérebro aprende a "ver" a estrutura
    da frase antes mesmo de entender cada palavra. 🧠✨</p>
    <p class="muted">Exemplo: <span class="r-qw">Wat</span> <span class="r-verb">is</span> <span class="r-art">de</span>
    <span class="r-noun">naam</span> <span class="r-prep">van</span> <span class="r-pron">hem</span>? →
    <span class="r-qw">Qual</span> <span class="r-verb">é</span> <span class="r-art">o</span>
    <span class="r-noun">nome</span> <span class="r-pron">dele</span>?</p></div>
    <div class="legend-table">
      ${Object.entries(ROLES).filter(([k]) => k !== 'punc' && k !== 'x').map(([k, r]) => `
        <div class="legend-row"><span style="font-size:1.3rem">${r.emoji}</span>
          <span class="sample"><span class="r-${k}">${esc(r.sample[0])}</span> = <span class="r-${k}">${esc(r.sample[1])}</span></span>
          <b>${esc(r.label)}</b></div>`).join('')}
    </div>
    <p class="center" style="margin-top:18px"><a class="btn primary" href="#/">📚 Voltar às lições</a></p>`;
}
