// Shared UI helpers: element creation, icons, modal, sidebar nav, command palette, DNA bg.

import { SUBJECTS } from './data.js?v=7cbd43e';
import { store, on } from './storage.js?v=7cbd43e';
import { navigate } from './router.js?v=7cbd43e';

// --- DOM helpers -----------------------------------------------------
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

export function mount(target, ...children) {
  if (typeof target === 'string') target = document.querySelector(target);
  target.innerHTML = '';
  for (const c of children.flat()) {
    if (c == null) continue;
    target.appendChild(c.nodeType ? c : document.createTextNode(c));
  }
}

// --- Icon library ----------------------------------------------------
export const ICONS = {
  home:      '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  subjects:  '<path d="M4 5h16M4 12h16M4 19h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  notes:     '<path d="M6 3h10l4 4v14H6zM16 3v4h4M9 13h6M9 17h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
  papers:    '<path d="M7 4h9l4 4v12H7zM16 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 13h6M10 17h6M10 9h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  flash:     '<path d="M13 2L5 14h6l-1 8 9-12h-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  pomo:      '<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13V8M9 3h6M12 5V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ecg:       '<path d="M3 12h4l2-6 3 12 2-6h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  calc:      '<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7h6M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  forum:     '<path d="M21 12a8 8 0 1 1-3-6.2L21 4l-1 4.2A8 8 0 0 1 21 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  brain:     '<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3V7a3 3 0 0 0-3-3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 4v16M15 4v16" fill="none" stroke="currentColor" stroke-width="2"/>',
  graph:     '<circle cx="6" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 7.5l3 8.5M16.5 7.5l-3 8.5M8 6h8" fill="none" stroke="currentColor" stroke-width="2"/>',
  buddy:     '<circle cx="12" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  bookmark:  '<path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  user:      '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  search:    '<path d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  trash:     '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  edit:      '<path d="M14 3l7 7-11 11H3v-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  plus:      '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  arrow:     '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  flame:     '<path d="M12 2c0 3-4 4-4 8a4 4 0 0 0 8 0c0-2-2-3-2-5 3 1 4 3 4 7a6 6 0 0 1-12 0c0-5 6-6 6-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  star:      '<path d="M12 3l2.7 6.3L21 10l-5 4.7L17.3 21 12 17.5 6.7 21 8 14.7 3 10l6.3-.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  pin:       '<path d="M12 2v8l4 4H8l4-4M12 14v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  download:  '<path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  check:     '<path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.innerHTML = ICONS[name] || ICONS.plus;
  return svg;
}

// --- Sidebar nav -----------------------------------------------------
const NAV = [
  { section: 'Library' },
  { href: '#/',            label: 'Home',          icon: 'home' },
  { href: '#/curriculum',  label: 'Curriculum',    icon: 'subjects' },
  { href: '#/notes',       label: 'My Notes',      icon: 'notes' },
  { href: '#/papers',      label: 'Past Papers',   icon: 'papers' },
  { section: 'Practice' },
  { href: '#/flashcards',  label: 'Flashcards',    icon: 'flash' },
  { href: '#/pomodoro',    label: 'Focus Timer',   icon: 'pomo' },
  { href: '#/buddy',       label: 'Study Buddy',   icon: 'buddy' },
  { section: 'Tools' },
  { href: '#/ecg',         label: 'ECG Lab',       icon: 'ecg' },
  { href: '#/rhythm',      label: 'Rhythm Trainer',icon: 'flame' },
  { href: '#/whiteboard',  label: 'Whiteboard',    icon: 'edit' },
  { href: '#/calc',        label: 'Calculators',   icon: 'calc' },
  { href: '#/mindmap',     label: 'Concept Map',   icon: 'graph' },
  { href: '#/glossary',    label: 'Lab Equipment', icon: 'brain' },
  { section: 'You' },
  { href: '#/forum',       label: 'Discussion',    icon: 'forum' },
  { href: '#/calendar',    label: 'Calendar',      icon: 'calendar' },
  { href: '#/bookmarks',   label: 'Bookmarks',     icon: 'bookmark' },
  { href: '#/stats',       label: 'Library Stats', icon: 'star' },
  { href: '#/about',       label: 'About',         icon: 'user' },
];

export function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  NAV.forEach(item => {
    if (item.section) {
      nav.appendChild(h('div', { class: 'nav__section' }, item.section));
      return;
    }
    const a = h('a', { class: 'nav__link', href: item.href });
    a.appendChild(icon(item.icon));
    a.appendChild(h('span', {}, item.label));
    nav.appendChild(a);
  });
  highlightNav();
  window.addEventListener('hashchange', highlightNav);
}
function highlightNav() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('#nav .nav__link').forEach(a => {
    const href = a.getAttribute('href');
    const active = href === hash ||
      (href !== '#/' && hash.startsWith(href));
    a.classList.toggle('is-active', active);
  });
}

// --- Streak card -----------------------------------------------------
export function renderStreakCard() {
  const u = store.user();
  const el = document.getElementById('streak-card');
  el.innerHTML = '';
  el.append(
    h('div', { class: 'flame' }, '🔥'),
    h('div', {},
      h('div', { class: 'lbl' }, 'Streak'),
      h('div', { class: 'val' }, `${u.streak} day${u.streak === 1 ? '' : 's'}`),
    ),
  );
  // The topbar avatar now links to Library Stats (📊) — no per-user initials.
}

// --- Modal -----------------------------------------------------------
export function modal({ title, body, actions = [] }) {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  const close = () => root.innerHTML = '';
  const panel = h('div', { class: 'modal__panel' },
    h('h3', {}, title),
    body,
    h('div', { class: 'modal__actions' },
      ...actions.map(a => h('button', { class: `btn ${a.class || 'btn--ghost'}`, onclick: () => { const r = a.onClick?.(); if (r !== false) close(); } }, a.label))
    )
  );
  const m = h('div', { class: 'modal', onclick: (e) => { if (e.target.classList.contains('modal')) close(); } }, panel);
  root.appendChild(m);
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  return { close };
}

// --- Command palette -------------------------------------------------
let paletteIdx = 0;
let paletteItems = [];

export function setupPalette() {
  const el = document.getElementById('palette');
  const input = document.getElementById('palette-input');
  const open = () => { el.hidden = false; input.value = ''; renderPalette(''); input.focus(); };
  const close = () => { el.hidden = true; };

  document.getElementById('open-palette').addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && !el.hidden) close();
    else if (!el.hidden && e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
    else if (!el.hidden && e.key === 'ArrowUp')   { e.preventDefault(); moveSel(-1); }
    else if (!el.hidden && e.key === 'Enter')     { e.preventDefault(); pickSel(); close(); }
    else if (e.key === '?' && e.target === document.body) { showShortcuts(); }
  });
  input.addEventListener('input', () => renderPalette(input.value));
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
}

function moveSel(d) {
  paletteIdx = Math.max(0, Math.min(paletteItems.length - 1, paletteIdx + d));
  const list = document.querySelectorAll('#palette-results .palette__item');
  list.forEach((n, i) => n.classList.toggle('is-active', i === paletteIdx));
  list[paletteIdx]?.scrollIntoView({ block: 'nearest' });
}
function pickSel() {
  const item = paletteItems[paletteIdx];
  if (item) item.action();
}

function renderPalette(q) {
  const results = document.getElementById('palette-results');
  results.innerHTML = '';
  const ql = q.toLowerCase().trim();
  paletteItems = [];

  const groups = {};
  function add(group, label, desc, action, iconName = 'arrow') {
    if (ql && !(label.toLowerCase().includes(ql) || (desc || '').toLowerCase().includes(ql))) return;
    if (!groups[group]) groups[group] = [];
    groups[group].push({ label, desc, action, iconName });
  }

  // Pages
  NAV.filter(n => n.href).forEach(n => add('Pages', n.label, 'Go to ' + n.label, () => navigate(n.href), n.icon));
  // Subjects (jump straight into subject detail)
  SUBJECTS.forEach(s => add('Subjects', s.name, s.id + ' · Sem ' + s.sem, () => navigate(`#/subject/${s.id}`), 'subjects'));
  // Notes
  store.notes().forEach(n => add('My notes', n.title, '#' + (n.tags || []).join(' #'), () => navigate(`#/notes/${n.id}`), 'notes'));
  // Quick actions
  add('Actions', 'New note',                'Create a fresh markdown note',     () => navigate('#/notes/new'),    'plus');
  add('Actions', 'Start a focus session',   '25 min Pomodoro',                  () => navigate('#/pomodoro'),     'pomo');
  add('Actions', 'Run flashcards',          'Practice with spaced repetition',  () => navigate('#/flashcards'),   'flash');
  add('Actions', 'Open admin panel',        'Upload notes & papers to library', () => navigate('#/admin'),        'plus');

  Object.entries(groups).forEach(([g, items]) => {
    results.appendChild(h('div', { class: 'palette__group' }, g));
    items.forEach(it => {
      const idx = paletteItems.length;
      const node = h('div', { class: 'palette__item', onclick: () => { it.action(); document.getElementById('palette').hidden = true; } },
        icon(it.iconName),
        h('div', {}, it.label),
        h('div', { class: 'desc' }, it.desc || '')
      );
      node.addEventListener('mouseenter', () => { paletteIdx = idx; moveSel(0); });
      results.appendChild(node);
      paletteItems.push(it);
    });
  });

  paletteIdx = 0;
  moveSel(0);
}

function showShortcuts() {
  modal({
    title: 'Keyboard shortcuts',
    body: h('div', { html: `
      <table style="width:100%; font-size:13px;">
        <tbody>
          <tr><td><kbd>Ctrl</kbd> + <kbd>K</kbd></td><td style="color:var(--muted)">Open command palette</td></tr>
          <tr><td><kbd>g</kbd> then <kbd>n</kbd></td><td style="color:var(--muted)">Go to Notes</td></tr>
          <tr><td><kbd>g</kbd> then <kbd>s</kbd></td><td style="color:var(--muted)">Go to Subjects</td></tr>
          <tr><td><kbd>n</kbd></td><td style="color:var(--muted)">New note</td></tr>
          <tr><td><kbd>?</kbd></td><td style="color:var(--muted)">This dialog</td></tr>
        </tbody>
      </table>
    ` }),
    actions: [{ label: 'Got it', class: 'btn--primary' }],
  });
}

// --- Mobile menu -----------------------------------------------------
export function setupMenu() {
  const btn = document.getElementById('menu-btn');
  const sb = document.getElementById('sidebar');
  btn?.addEventListener('click', () => sb.classList.toggle('is-open'));
  window.addEventListener('hashchange', () => sb.classList.remove('is-open'));
}

// --- Keybinds: g-n etc. ----------------------------------------------
export function setupKeybinds() {
  let gMode = false;
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key === 'g') { gMode = true; setTimeout(() => gMode = false, 800); return; }
    if (gMode) {
      gMode = false;
      if (e.key === 'n') navigate('#/notes');
      else if (e.key === 's') navigate('#/subjects');
      else if (e.key === 'p') navigate('#/pyqs');
      else if (e.key === 'h') navigate('#/');
      return;
    }
    if (e.key === 'n') navigate('#/notes/new');
  });
  document.getElementById('quick-add').addEventListener('click', () => navigate('#/notes/new'));
}

// --- Animated DNA / molecule background ------------------------------
export function startBackground() {
  const c = document.getElementById('bg-canvas');
  const ctx = c.getContext('2d');
  let w, hgt, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = c.width  = innerWidth * dpr;
    hgt = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  // Floating particles connected like a molecular graph.
  const N = 70;
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * w, y: Math.random() * hgt,
    vx: (Math.random() - 0.5) * 0.15 * dpr,
    vy: (Math.random() - 0.5) * 0.15 * dpr,
    r: (Math.random() * 1.4 + 0.6) * dpr,
    hue: ['#22d3ee', '#a78bfa', '#34d399'][Math.floor(Math.random() * 3)],
  }));

  let t = 0;
  function frame() {
    t += 0.005;
    ctx.clearRect(0, 0, w, hgt);

    // DNA-like double helix at left/right edges
    ctx.save();
    ctx.lineWidth = 1.4 * dpr;
    ctx.strokeStyle = 'rgba(34,211,238,0.25)';
    for (let edge = 0; edge < 2; edge++) {
      const ox = edge === 0 ? 60 * dpr : w - 60 * dpr;
      ctx.beginPath();
      for (let y = 0; y < hgt; y += 6 * dpr) {
        const x = ox + Math.sin(y * 0.01 + t) * 24 * dpr;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(167,139,250,0.20)';
      for (let y = 0; y < hgt; y += 6 * dpr) {
        const x = ox + Math.sin(y * 0.01 + t + Math.PI) * 24 * dpr;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // rungs
      ctx.strokeStyle = 'rgba(148,163,184,0.10)';
      for (let y = 0; y < hgt; y += 28 * dpr) {
        const x1 = ox + Math.sin(y * 0.01 + t) * 24 * dpr;
        const x2 = ox + Math.sin(y * 0.01 + t + Math.PI) * 24 * dpr;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      }
    }
    ctx.restore();

    // Particles + connections
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > hgt) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = 0.7;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const max = 130 * dpr * 130 * dpr;
        if (d2 < max) {
          ctx.strokeStyle = `rgba(148,163,184,${0.10 * (1 - d2 / max)})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
