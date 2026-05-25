import { h, mount, icon } from '../ui.js?v=94729f9';

// A handcrafted ECG-like waveform generator + canvas renderer.
// Procedurally generates P, QRS, T waves with adjustable BPM, noise, and arrhythmia mode.

let raf = null;
let cfg = { bpm: 72, noise: 0.04, mode: 'normal', amp: 1.0 };
let cursor = 0;

export function renderECG() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">ECG</span> Lab — Live Simulator' }),
      h('p', {}, 'Play with heart rate, add noise, switch rhythms. A useful way to feel what filters and detectors have to deal with.'),
    ),
  );

  const canvas = h('canvas', { class: 'ecg-canvas' });
  canvas.width = 1200; canvas.height = 260;

  const info = h('div', { class: 'ecg-info' },
    h('span', {}, 'HR: ', h('b', { id: 'ecg-bpm' }, String(cfg.bpm) + ' bpm')),
    h('span', {}, 'Mode: ', h('b', { id: 'ecg-mode' }, cfg.mode)),
    h('span', {}, 'Noise: ', h('b', { id: 'ecg-noise' }, cfg.noise.toFixed(2))),
    h('span', {}, '25 mm/s sweep · 10 mm/mV gain'),
  );

  const controls = h('div', { class: 'ecg-controls' },
    range('BPM', 30, 200, cfg.bpm, v => { cfg.bpm = v; document.getElementById('ecg-bpm').textContent = v + ' bpm'; }),
    range('Noise', 0, 0.3, cfg.noise, v => { cfg.noise = +v; document.getElementById('ecg-noise').textContent = v.toFixed(2); }, 0.01),
    range('Amp', 0.4, 1.6, cfg.amp, v => { cfg.amp = +v; }, 0.05),
    select('Rhythm', ['normal', 'tachycardia', 'bradycardia', 'afib', 'vfib'], cfg.mode, v => { cfg.mode = v; document.getElementById('ecg-mode').textContent = v;
      if (v === 'tachycardia') cfg.bpm = 130;
      if (v === 'bradycardia') cfg.bpm = 48;
      if (v === 'afib') cfg.bpm = 110;
      if (v === 'normal') cfg.bpm = 72;
      document.getElementById('ecg-bpm').textContent = cfg.bpm + ' bpm';
    }),
  );

  mount('#view', head,
    h('div', { class: 'ecg-wrap' }, canvas, info, controls),
    h('div', { class: 'card', style: { marginTop: 16 } },
      h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'How is this built?'),
      h('p', { style: { color: 'var(--muted)', margin: 0 } }, 'A periodic kernel models P, QRS and T using shaped Gaussians; AFib randomises RR interval; VFib swaps the kernel for chaotic high-frequency noise. Grid is drawn at standard 25 mm/s sweep speed.'),
    ),
  );

  start(canvas);
}

function range(label, min, max, val, on, step = 1) {
  const lbl = h('label', { style: { fontSize: 12, color: 'var(--muted)' } }, label);
  const i = h('input', { type: 'range', min, max, value: val, step, oninput: (e) => on(+e.target.value), style: { width: 140 } });
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } }, lbl, i);
}
function select(label, opts, val, on) {
  const lbl = h('label', { style: { fontSize: 12, color: 'var(--muted)' } }, label);
  const s = h('select', { class: 'select', onchange: e => on(e.target.value), style: { width: 160 } },
    ...opts.map(o => h('option', { value: o, selected: o === val ? '' : null }, o)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } }, lbl, s);
}

function start(canvas) {
  const ctx = canvas.getContext('2d');
  if (raf) cancelAnimationFrame(raf);
  const W = canvas.width, H = canvas.height;
  const buf = new Float32Array(W);
  let nextBeat = 0;
  let lastFrame = performance.now();

  function ecgValue(t) {
    // t is "time since last R peak" in seconds.
    if (cfg.mode === 'vfib') {
      return (Math.sin(t * 40) + Math.sin(t * 65 + 1) + Math.sin(t * 23)) * 0.35;
    }
    const gauss = (mu, sigma, amp) => amp * Math.exp(-((t - mu) ** 2) / (2 * sigma * sigma));
    const p   = gauss(-0.16, 0.025, 0.15);
    const q   = gauss(-0.025, 0.012, -0.20);
    const r   = gauss( 0.000, 0.011,  1.20);
    const sw  = gauss( 0.025, 0.014, -0.30);
    const tw  = gauss( 0.220, 0.060,  0.30);
    return (p + q + r + sw + tw) * cfg.amp;
  }

  function nextRR() {
    // base RR interval from BPM
    const base = 60 / cfg.bpm;
    if (cfg.mode === 'afib') return base * (0.6 + Math.random() * 0.9);
    return base;
  }

  // Pixels per second: standard 25 mm/s. We'll define 25 mm = 100 px.
  const PX_PER_SEC = 100;
  const STEP_S = 1 / PX_PER_SEC;

  function frame(now) {
    const dt = (now - lastFrame) / 1000;
    lastFrame = now;
    const advance = Math.floor(dt * PX_PER_SEC);

    for (let i = 0; i < advance; i++) {
      cursor = (cursor + 1) % W;
      const t = cursor * STEP_S;
      // Time relative to last R peak
      if (t >= nextBeat) nextBeat = t + nextRR();
      const tFromR = t - (nextBeat - nextRR());
      const v = ecgValue(tFromR) + (Math.random() - 0.5) * cfg.noise;
      buf[cursor] = v;
    }

    // Background grid (medical paper)
    ctx.fillStyle = '#0a121f';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(244,114,182,0.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(244,114,182,0.22)';
    for (let x = 0; x <= W; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Trace
    ctx.beginPath();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(52,211,153,0.7)'; ctx.shadowBlur = 8;
    const mid = H / 2;
    const scale = H / 3;
    let pen = false;
    for (let x = 0; x < W; x++) {
      const xi = (cursor + 1 + x) % W;
      const y = mid - buf[xi] * scale;
      if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Sweep cursor
    ctx.fillStyle = 'rgba(34,211,238,0.55)';
    ctx.fillRect(W - 1, 0, 2, H);

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

export function stopECG() { if (raf) cancelAnimationFrame(raf); raf = null; }
