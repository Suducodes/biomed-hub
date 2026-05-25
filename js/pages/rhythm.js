import { h, mount, icon } from '../ui.js?v=7cbd43e';
import { awardXP, touchStreak, toast } from '../storage.js?v=7cbd43e';

// Heart Rhythm Trainer — a quiz that draws a procedurally-generated ECG for
// each round and asks the student to pick the right rhythm out of 4 options.
// Builds on the ECG engine. Tracks streak + best score in localStorage.

const RHYTHMS = [
  { id: 'normal',      label: 'Normal Sinus Rhythm',  bpm: 72,  desc: 'Regular P–QRS–T, rate 60–100, P precedes every QRS.' },
  { id: 'sinus_tach',  label: 'Sinus Tachycardia',    bpm: 130, desc: 'Sinus rhythm, rate > 100 bpm.' },
  { id: 'sinus_brady', label: 'Sinus Bradycardia',    bpm: 48,  desc: 'Sinus rhythm, rate < 60 bpm.' },
  { id: 'afib',        label: 'Atrial Fibrillation',  bpm: 110, desc: 'Irregularly irregular RR, no discrete P waves.' },
  { id: 'vfib',        label: 'Ventricular Fibrillation', bpm: 0, desc: 'Chaotic baseline, no recognisable QRS — peri-arrest.' },
  { id: 'av_block',    label: '3rd-degree AV Block',  bpm: 38,  desc: 'Atrial & ventricular activity dissociated; very slow ventricular rate.' },
];

const BEST_KEY = 'biomedhub:v2:rhythmBest';
function getBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || { best: 0, played: 0 }; } catch { return { best: 0, played: 0 }; } }
function setBest(v) { localStorage.setItem(BEST_KEY, JSON.stringify(v)); }

let raf = null;
let state = { round: 0, score: 0, current: null, locked: false, started: false };

export function renderRhythm() {
  const stats = getBest();

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Heart Rhythm</span> Trainer' }),
      h('p', {}, 'Recognise the rhythm in 8 seconds. Build the muscle memory you’ll need on every viva and clinical round.'),
    ),
  );

  const stat = h('div', { class: 'grid grid--3', style: { marginBottom: 14 } },
    bigStat('🎯', state.score, 'Current score'),
    bigStat('🏆', stats.best,  'All-time best'),
    bigStat('🎮', stats.played, 'Games played'),
  );

  const canvas = h('canvas', { class: 'ecg-canvas', style: { height: '220px' } });
  canvas.width = 1200; canvas.height = 220;

  const choices = h('div', { class: 'rhythm-choices' });

  const startBtn = h('button', { class: 'btn btn--primary', onclick: startGame }, icon('flame'), 'Start round');

  const result = h('div', { class: 'rhythm-result' });

  mount('#view',
    head,
    stat,
    h('div', { class: 'ecg-wrap' }, canvas),
    h('div', { class: 'rhythm-actions' }, startBtn, h('span', { id: 'rhythm-prompt', class: 'rhythm-prompt' }, 'Press start to begin.')),
    choices,
    result,
    h('div', { class: 'card', style: { marginTop: 18 } },
      h('h4', { style: { margin: '0 0 8px', fontFamily: 'Space Grotesk' } }, 'How it works'),
      h('ul', { style: { color: 'var(--muted)', fontSize: 13, margin: 0, paddingLeft: 18 } },
        h('li', {}, 'Each round draws a randomly-selected rhythm. Pick it from the four buttons.'),
        h('li', {}, 'Correct → +1, your score goes up. Wrong → game over, see the answer.'),
        h('li', {}, 'Your best-ever score is saved in this browser.'),
      ),
    ),
  );

  startEcgLoop(canvas);
  return () => stopEcgLoop();

  function startGame() {
    state = { round: 1, score: 0, current: pickRhythm(), locked: false, started: true };
    document.getElementById('rhythm-prompt').textContent = `Round ${state.round} — what is this rhythm?`;
    startBtn.style.display = 'none';
    renderChoices();
    result.innerHTML = '';
  }

  function renderChoices() {
    choices.innerHTML = '';
    const opts = sample4Including(state.current);
    opts.forEach(r => {
      const b = h('button', { class: 'rhythm-choice', onclick: () => choose(r.id) }, r.label);
      choices.appendChild(b);
    });
  }

  function choose(id) {
    if (state.locked) return;
    state.locked = true;
    if (id === state.current.id) {
      state.score += 1;
      awardXP(3, 'rhythm trainer');
      touchStreak();
      flash(result, '✓ Correct!', 'ok', state.current.desc);
      setTimeout(() => {
        state.round += 1;
        state.current = pickRhythm();
        state.locked = false;
        document.getElementById('rhythm-prompt').textContent = `Round ${state.round} — what is this rhythm? (score ${state.score})`;
        renderChoices();
        result.innerHTML = '';
      }, 1400);
    } else {
      flash(result, `✗ Wrong — it was ${state.current.label}`, 'err', state.current.desc);
      const s = getBest();
      s.played += 1;
      if (state.score > s.best) s.best = state.score;
      setBest(s);
      setTimeout(() => {
        startBtn.style.display = '';
        startBtn.textContent = ''; startBtn.append(icon('flame'), document.createTextNode(' Play again'));
        document.getElementById('rhythm-prompt').textContent = `Game over · final score ${state.score}. Hit play again!`;
        choices.innerHTML = '';
      }, 1800);
    }
  }
}

// ---------- helpers ----------
function bigStat(em, val, lbl) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon', style: { fontSize: 22, background: 'rgba(251,113,133,0.10)', borderColor: 'rgba(251,113,133,0.25)', color: '#fb7185' } }, em),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}
function pickRhythm() { return RHYTHMS[Math.floor(Math.random() * RHYTHMS.length)]; }
function sample4Including(target) {
  const set = new Set([target]);
  while (set.size < 4) set.add(RHYTHMS[Math.floor(Math.random() * RHYTHMS.length)]);
  return [...set].sort(() => Math.random() - 0.5);
}
function flash(node, msg, kind, desc) {
  node.innerHTML = '';
  node.appendChild(h('div', { class: 'rhythm-feedback ' + (kind === 'ok' ? 'is-ok' : 'is-err') }, h('strong', {}, msg), h('div', { style: { color: 'var(--muted)', fontSize: 13, marginTop: 6 } }, desc)));
}

// ---------- ECG draw loop, parameterised by state.current ----------
let cursor = 0;
let buf = null;
let lastFrame = 0;
let nextBeat = 0;
const PX = 100;          // pixels per second
const STEP = 1 / PX;

function startEcgLoop(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  buf = new Float32Array(W);
  cursor = 0; nextBeat = 0; lastFrame = performance.now();

  function frame(now) {
    const r = state.current;
    const bpm = r ? r.bpm : 72;
    const dt = (now - lastFrame) / 1000;
    lastFrame = now;
    const advance = Math.floor(dt * PX);
    for (let i = 0; i < advance; i++) {
      cursor = (cursor + 1) % W;
      const t = cursor * STEP;
      if (!r) { buf[cursor] = 0; continue; }
      if (r.id === 'vfib') {
        buf[cursor] = (Math.sin(t * 40) + Math.sin(t * 65 + 1) + Math.sin(t * 23)) * 0.35 + (Math.random() - 0.5) * 0.12;
        continue;
      }
      if (t >= nextBeat) {
        let rr = 60 / Math.max(20, bpm);
        if (r.id === 'afib') rr *= 0.6 + Math.random() * 0.9;
        nextBeat = t + rr;
      }
      const lastBeat = nextBeat - (60 / Math.max(20, bpm)) * (r.id === 'afib' ? 1.2 : 1);
      const tFromR = t - lastBeat;
      // P-QRS-T kernel
      const g = (mu, sigma, amp) => amp * Math.exp(-((tFromR - mu) ** 2) / (2 * sigma * sigma));
      let p = g(-0.16, 0.025, 0.15);
      if (r.id === 'afib') p = (Math.random() - 0.5) * 0.06;  // fibrillatory baseline
      const q  = g(-0.025, 0.012, -0.20);
      const R  = g( 0.000, 0.011,  1.20);
      const s2 = g( 0.025, 0.014, -0.30);
      const tw = g( 0.220, 0.060,  0.30);
      let v = (p + q + R + s2 + tw);
      if (r.id === 'av_block' && Math.random() < 0.4) v = (p + tw) * 0.6;  // dropped QRS occasionally
      buf[cursor] = v + (Math.random() - 0.5) * 0.03;
    }

    // Draw
    ctx.fillStyle = '#04080f'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(244,114,182,0.10)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(244,114,182,0.22)';
    for (let x = 0; x <= W; x += 100) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }

    ctx.beginPath();
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(52,211,153,0.7)'; ctx.shadowBlur = 8;
    const mid = H / 2, scale = H / 3;
    for (let x = 0; x < W; x++) {
      const xi = (cursor + 1 + x) % W;
      const y = mid - buf[xi] * scale;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(34,211,238,0.55)';
    ctx.fillRect(W - 1, 0, 2, H);

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

export function stopRhythm() { if (raf) cancelAnimationFrame(raf); raf = null; }
function stopEcgLoop() { stopRhythm(); }
