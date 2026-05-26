import { h, mount, icon } from '../ui.js?v=960a27c';
import { toast } from '../storage.js?v=960a27c';

// Whiteboard — pen / color / eraser / undo / clear / save. Drawings live in
// localStorage so you don't lose them on a reload.

const KEY = 'biomedhub:v2:lastSketch';

export function renderWhiteboard() {
  let color = '#22d3ee';
  let size = 3;
  let isEraser = false;
  let drawing = false;
  let last = null;
  const strokes = [];   // for undo

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Whiteboard</span>' }),
      h('p', {}, 'Quick diagrams for circuits, anatomy or that lab observation that won\'t wait. Saved on this browser.'),
    ),
  );

  const canvas = h('canvas', { class: 'wb-canvas' });
  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const hh = Math.max(420, Math.min(700, w * 0.6));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = hh * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = hh + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  };

  const ctx = () => canvas.getContext('2d');

  function pt(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x, y };
  }
  function start(e) {
    e.preventDefault();
    drawing = true;
    last = pt(e);
    strokes.push({ color, size, isEraser, points: [last] });
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pt(e);
    strokes[strokes.length - 1].points.push(p);
    drawSegment(last, p, strokes[strokes.length - 1]);
    last = p;
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    persist();
  }
  function drawSegment(a, b, s) {
    const c = ctx();
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (s.isEraser) { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = 'rgba(0,0,0,1)'; c.lineWidth = s.size * 4; }
    else            { c.globalCompositeOperation = 'source-over';     c.strokeStyle = s.color;        c.lineWidth = s.size; }
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }
  function redraw() {
    const c = ctx();
    c.fillStyle = '#0a121f';
    c.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    c.fillStyle = 'rgba(148,163,184,0.10)';
    for (let x = 20; x < canvas.clientWidth; x += 24)
      for (let y = 20; y < canvas.clientHeight; y += 24) {
        c.beginPath(); c.arc(x, y, 1, 0, Math.PI * 2); c.fill();
      }
    strokes.forEach(s => {
      for (let i = 1; i < s.points.length; i++) drawSegment(s.points[i - 1], s.points[i], s);
    });
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end, { passive: false });

  const COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#fb7185', '#e6edf6'];
  const palette = h('div', { class: 'wb-palette' },
    ...COLORS.map(c => h('button', { class: 'wb-swatch', style: { background: c }, onclick: () => { color = c; isEraser = false; syncBtns(); } })),
  );
  function syncBtns() {
    [...palette.children].forEach(b => b.classList.toggle('is-active', b.style.background === color && !isEraser));
    eraserBtn.classList.toggle('is-active', isEraser);
  }

  const eraserBtn = h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { isEraser = !isEraser; syncBtns(); } }, '🧽 Eraser');
  const undoBtn = h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { strokes.pop(); redraw(); persist(); } }, '↶ Undo');
  const clearBtn = h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { if (confirm('Clear the board?')) { strokes.length = 0; redraw(); persist(); } } }, '🗑 Clear');
  const saveBtn = h('button', { class: 'btn btn--primary btn--sm', onclick: () => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `sketch-${Date.now()}.png`;
    a.click();
    toast('Saved sketch as PNG');
  } }, '⬇ Save PNG');
  const sizeRange = h('input', { type: 'range', min: 1, max: 12, value: 3, oninput: e => { size = +e.target.value; } });

  const toolbar = h('div', { class: 'wb-toolbar' },
    palette,
    h('div', { class: 'wb-tool-group' }, h('span', { class: 'wb-tool-label' }, 'Size'), sizeRange),
    eraserBtn, undoBtn, clearBtn, saveBtn,
  );

  const wrap = h('div', { class: 'wb-wrap' }, canvas);

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(strokes.slice(-200))); } catch {}
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      strokes.push(...data);
    } catch {}
  }

  mount('#view', head, toolbar, wrap);
  load();
  resize();
  syncBtns();
  window.addEventListener('resize', resize);
}
