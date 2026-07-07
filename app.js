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
const SRS_DAYS = [0, 0, 1, 3, 7, 21]; // index = box (1..5)
const STORE_KEY = 'nlcurso.v1';

/* ---------- state ---------- */
let S = load();
function load() {
  try { return Object.assign({ xp:0, streak:{last:'',count:0}, lessons:{}, srs:{} },
    JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
  catch { return { xp:0, streak:{last:'',count:0}, lessons:{}, srs:{} }; }
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
    ${ph.lit ? `<div class="lit">🔍 literal: ${esc(ph.lit)}</div>` : ''}
    ${ph.note ? `<div class="note">💡 ${esc(ph.note)}</div>` : ''}
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
window.addEventListener('DOMContentLoaded', () => { paintStats(); route(); updateDueBadge(); });

async function route() {
  const app = $('#app');
  const h = location.hash.replace(/^#\/?/, '');
  try {
    if (h === '' || h === '/') return renderHome(app);
    if (h === 'legenda') return renderLegend(app);
    if (h === 'revisao') return renderReview(app);
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
  app.innerHTML = `
  <div class="hero">
    <h1>🧇 Nederlands! O curso de neerlandês para brasileiros 🇧🇷→🇧🇪</h1>
    <p class="muted">Lições com <b>frases alinhadas por cores</b> 🎨 (mesmo tipo de palavra = mesmo estilo nas duas línguas),
    exercícios estilo Babbel 🏋️, flashcards inteligentes 🃏 e áudio 🔊. Baseado no
    <a href="livro.html">Livro Infográfico 📖</a>.</p>
    ${next ? `<a class="btn primary" href="#/les/${next.id}">▶️ Continuar: ${next.emoji} ${esc(next.title)}</a>` : '<p>🏆 Curso completo!</p>'}
    <img src="assets/infographics/cefr-ladder.svg" alt="A escada de níveis A1 a C2" loading="lazy">
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
      <p class="center"><button class="btn primary" id="goPractice">🏋️ Praticar agora →</button></p>`;
    bindPhraseEvents(body);
    body.querySelectorAll('.speak').forEach(b => b.addEventListener('click', () => speak(b.dataset.say)));
    $('#goPractice').addEventListener('click', () => {
      body.closest('#app').querySelector('[data-t="pr"]').click();
    });
  }
  if (t === 'pr') runExercises(body, L);
  if (t === 'fc') runFlashcards(body, L, L.vocab.map(v => ({ ...v, key: L.id + '|' + v.nl })));
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
          const ok = norm(made) === norm(ex.answer);
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
