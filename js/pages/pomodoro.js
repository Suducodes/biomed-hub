import { h, mount, icon } from '../ui.js?v=5f017ca';
import { store, awardXP, touchStreak, toast, todayISO } from '../storage.js?v=5f017ca';

const MODES = {
  focus: { label: 'Focus',       mins: 25, color: '#22d3ee' },
  short: { label: 'Short Break', mins: 5,  color: '#34d399' },
  long:  { label: 'Long Break',  mins: 15, color: '#a78bfa' },
};

let interval = null;
let mode = 'focus';
let remaining = MODES.focus.mins * 60;
let running = false;

export function renderPomodoro() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Focus</span> Timer' }),
      h('p', {}, '25 / 5 Pomodoro cycles. Build deep work into your day — the brain learns better with rhythm.'),
    ),
  );

  const ring = h('div', { class: 'pomo__ring' });
  const ringSvg = `
    <svg viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)">
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="6"/>
      <circle id="pomo-arc" cx="100" cy="100" r="92" fill="none" stroke="url(#pomo-g)" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${2 * Math.PI * 92}" stroke-dashoffset="0"/>
      <defs><linearGradient id="pomo-g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/>
      </linearGradient></defs>
    </svg>`;
  ring.innerHTML = ringSvg + `<div><div class="pomo__time" id="pomo-time">25:00</div><div class="pomo__mode" id="pomo-mode">FOCUS</div></div>`;

  const controls = h('div', { class: 'pomo__controls' },
    h('button', { class: 'btn btn--primary', id: 'pomo-toggle', onclick: toggle }, icon('pomo'), 'Start'),
    h('button', { class: 'btn btn--ghost', onclick: reset }, 'Reset'),
    h('button', { class: 'btn btn--ghost', onclick: () => setMode('focus') }, '25 min'),
    h('button', { class: 'btn btn--ghost', onclick: () => setMode('short') }, '5 min'),
    h('button', { class: 'btn btn--ghost', onclick: () => setMode('long')  }, '15 min'),
  );

  const stats = store.pomoStats();
  const statsCards = h('div', { class: 'grid grid--3', style: { marginTop: 22 } },
    statCard('🎯', stats.sessions, 'Sessions completed'),
    statCard('⏱', stats.minutes, 'Total minutes'),
    statCard('🔥', Object.keys(stats.dates).length, 'Active days'),
  );

  mount('#view', head, h('div', { class: 'pomo' }, ring, controls), statsCards);
  draw();
}

function statCard(em, val, lbl) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon', style: { fontSize: 22, background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.25)', color: '#a78bfa' } }, em),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}

function setMode(m) {
  if (interval) clearInterval(interval);
  running = false;
  mode = m;
  remaining = MODES[m].mins * 60;
  draw();
  document.getElementById('pomo-toggle').innerHTML = '';
  document.getElementById('pomo-toggle').append(icon('pomo'), document.createTextNode(' Start'));
}

function toggle() {
  const btn = document.getElementById('pomo-toggle');
  if (running) {
    clearInterval(interval); running = false;
    btn.innerHTML = ''; btn.append(icon('pomo'), document.createTextNode(' Resume'));
    return;
  }
  running = true;
  btn.innerHTML = ''; btn.append(document.createTextNode('Pause'));
  interval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) { clearInterval(interval); running = false; complete(); }
    draw();
  }, 1000);
}

function reset() {
  if (interval) clearInterval(interval);
  running = false;
  remaining = MODES[mode].mins * 60;
  draw();
  const btn = document.getElementById('pomo-toggle');
  btn.innerHTML = ''; btn.append(icon('pomo'), document.createTextNode(' Start'));
}

function complete() {
  if (mode === 'focus') {
    const s = store.pomoStats();
    s.sessions += 1;
    s.minutes += MODES.focus.mins;
    const today = todayISO();
    s.dates[today] = (s.dates[today] || 0) + 1;
    store.set('pomoStats', s);
    awardXP(20, 'completed a focus session');
    touchStreak();
    toast('Focus session complete · +20 XP', 'ok');
  } else {
    toast('Break over — back to it!');
  }
  remaining = MODES.focus.mins * 60;
  mode = 'focus';
  renderPomodoro();
}

function draw() {
  const m = Math.floor(remaining / 60), s = remaining % 60;
  const t = document.getElementById('pomo-time');
  const mEl = document.getElementById('pomo-mode');
  const arc = document.getElementById('pomo-arc');
  if (!t) return;
  t.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  mEl.textContent = MODES[mode].label.toUpperCase();
  const total = MODES[mode].mins * 60;
  const frac = remaining / total;
  const C = 2 * Math.PI * 92;
  arc.setAttribute('stroke-dashoffset', String(C * (1 - frac)));
}
