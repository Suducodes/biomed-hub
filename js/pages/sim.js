import { h, mount, icon } from '../ui.js';
import { navigate } from '../router.js';

// Generic simulation page — handles two cases:
//   #/sim/phet/<sim-id>   → iframe-embed an official PhET HTML5 simulation
//   #/sim/opamp           → our own op-amp visualizer

// --- PhET catalogue ------------------------------------------------
const PHET = {
  'neuron':              { title: 'Neuron — Action Potential',  blurb: 'Voltage-clamp, stimulate, watch Na⁺/K⁺ channels drive the action potential. Hodgkin-Huxley made visible.' },
  'membrane-channels':   { title: 'Membrane Channels',          blurb: 'Place channels into the membrane and observe selective transport. Foundational cell physiology.' },
  'beers-law-lab':       { title: "Beer's Law Lab",             blurb: 'Spectrophotometer + concentration. The physics behind pulse oximetry and biochem assays.' },
  'ph-scale':            { title: 'pH Scale',                   blurb: 'Mix common substances, watch the pH change. Quick biochem refresher.' },
  'sound-waves':         { title: 'Sound Waves',                blurb: 'Waves, interference, doppler — physics behind ultrasound.' },
  'concentration':       { title: 'Concentration',              blurb: 'Dilution, saturation, solvent / solute. Applies to drug dosing & lab assays.' },
};

export function renderSim({ kind, id }) {
  if (kind === 'phet') return renderPhet(id);
  if (id === 'opamp')  return renderOpamp();
  return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Unknown simulation')));
}

// --- PhET iframe page ----------------------------------------------
function renderPhet(simId) {
  const meta = PHET[simId];
  if (!meta) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'PhET sim not found')));
  const url = `https://phet.colorado.edu/sims/html/${simId}/latest/${simId}_en.html`;

  mount('#view',
    h('div', { class: 'page-head' },
      h('div', {},
        h('h1', { html: `<span class="accent">${meta.title}</span>` }),
        h('p', {}, meta.blurb),
      ),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/tools') }, '← All tools'),
        h('a', { class: 'btn btn--primary', href: url, target: '_blank', rel: 'noopener' }, 'Open in new tab'),
      ),
    ),
    h('div', { class: 'sim-frame' },
      h('iframe', {
        src: url,
        allowfullscreen: '',
        loading: 'lazy',
        title: meta.title,
      }),
    ),
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('p', { style: { color: 'var(--muted)', margin: 0, fontSize: 13 } },
        'Hosted by ', h('a', { href: 'https://phet.colorado.edu', target: '_blank', rel: 'noopener', style: { color: 'var(--cyan)' } }, 'PhET Interactive Simulations'),
        ', University of Colorado Boulder. Used here under their Creative Commons licence — credit and link as shown.'),
    ),
  );
}

// --- In-house Op-amp visualiser ------------------------------------
let opampRaf = null;
function renderOpamp() {
  let mode = 'inv';
  let rin = 10, rf = 100, amp = 1, freq = 1; // kΩ / V / Hz

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Op-amp</span> Gain Visualizer' }),
      h('p', {}, 'Adjust Rf, Rin and the input. Watch the inverting / non-inverting gain and the live output waveform.'),
    ),
    h('div', { class: 'page-head__actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/tools') }, '← All tools'),
    ),
  );

  const canvas = h('canvas', { class: 'ecg-canvas', style: { height: '240px' } });
  canvas.width = 1200; canvas.height = 240;

  // controls
  const rinI = range('Rin (kΩ)', 1, 100, rin, v => { rin = +v; refresh(); });
  const rfI  = range('Rf (kΩ)',  1, 500, rf,  v => { rf  = +v; refresh(); });
  const ampI = range('Vin amplitude (V)', 0.1, 1.0, amp, v => { amp = +v; }, 0.05);
  const freqI = range('Vin frequency (Hz)', 0.5, 5, freq, v => { freq = +v; }, 0.1);
  const modeBtns = h('div', { class: 'kind-pills' },
    pill('inv', 'Inverting'),
    pill('non', 'Non-inverting'),
  );
  function pill(v, label) {
    const b = h('button', { class: 'kind-pill' + (v === mode ? ' is-active' : ''), onclick: () => { mode = v; [...modeBtns.children].forEach(x => x.classList.toggle('is-active', x.dataset.m === v)); refresh(); } }, h('span', {}, label));
    b.dataset.m = v;
    return b;
  }

  const gainEl = h('div', { class: 'pomo__time', style: { fontSize: 44 } }, '');
  const explainEl = h('div', { style: { color: 'var(--muted)', fontSize: 13, marginTop: 6, textAlign: 'center' } }, '');

  function gain() {
    return mode === 'inv' ? -rf / rin : 1 + rf / rin;
  }
  function refresh() {
    const g = gain();
    gainEl.textContent = `${g.toFixed(2)} ×`;
    gainEl.style.color = mode === 'inv' ? '#fb7185' : '#22d3ee';
    explainEl.innerHTML = mode === 'inv'
      ? `Inverting amp: gain = −R<sub>f</sub>/R<sub>in</sub> = −${rf}/${rin} = ${g.toFixed(2)}`
      : `Non-inverting amp: gain = 1 + R<sub>f</sub>/R<sub>in</sub> = 1 + ${rf}/${rin} = ${g.toFixed(2)}`;
  }

  // canvas loop — draw input sine + scaled output
  function start() {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t0 = performance.now();
    function frame(now) {
      const t = (now - t0) / 1000;
      ctx.fillStyle = '#04080f'; ctx.fillRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = 'rgba(148,163,184,0.10)'; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const mid = H / 2;
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

      const g = gain();
      const scaleY = (H / 2 - 12) / Math.max(amp * Math.max(Math.abs(g), 1), 1);
      // input (cyan)
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(34,211,238,0.5)'; ctx.shadowBlur = 6;
      for (let x = 0; x < W; x++) {
        const ph = (x / W) * 4 * Math.PI * freq + t * 2 * Math.PI * freq;
        const v = amp * Math.sin(ph);
        const y = mid - v * scaleY;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // output (violet/rose depending on mode)
      ctx.beginPath();
      ctx.strokeStyle = mode === 'inv' ? '#fb7185' : '#34d399';
      ctx.shadowColor = mode === 'inv' ? 'rgba(251,113,133,0.5)' : 'rgba(52,211,153,0.5)';
      ctx.lineWidth = 2.4;
      for (let x = 0; x < W; x++) {
        const ph = (x / W) * 4 * Math.PI * freq + t * 2 * Math.PI * freq;
        const v = amp * Math.sin(ph) * g;
        const y = mid - v * scaleY;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // legend
      ctx.fillStyle = '#22d3ee'; ctx.font = '12px JetBrains Mono';
      ctx.fillText('Vin', 14, 20);
      ctx.fillStyle = mode === 'inv' ? '#fb7185' : '#34d399';
      ctx.fillText('Vout', 14, 40);

      opampRaf = requestAnimationFrame(frame);
    }
    if (opampRaf) cancelAnimationFrame(opampRaf);
    opampRaf = requestAnimationFrame(frame);
  }

  mount('#view',
    head,
    h('div', { class: 'sim-controls' },
      modeBtns,
      h('div', { class: 'sim-knobs' }, rinI, rfI, ampI, freqI),
    ),
    h('div', { class: 'pomo', style: { padding: '18px' } }, gainEl, explainEl),
    h('div', { class: 'ecg-wrap', style: { marginTop: 14 } }, canvas),
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'What you’re seeing'),
      h('ul', { style: { color: 'var(--muted)', fontSize: 13, margin: 0, paddingLeft: 18 } },
        h('li', {}, 'Cyan trace = the input sine wave (Vin).'),
        h('li', {}, 'Green/rose trace = Vout = Vin × gain. Inverting flips the sign (180° phase shift).'),
        h('li', {}, 'In a real op-amp, output saturates near the supply rails (±Vcc). This sim is ideal: no clipping.'),
        h('li', {}, 'Try Rf = 100k, Rin = 10k → gain ×10. Then switch to non-inverting — same Rs, gain ×11.'),
      ),
    ),
  );
  refresh();
  start();
}

function range(label, min, max, val, on, step = 1) {
  const i = h('input', { type: 'range', min, max, value: val, step, oninput: (e) => { on(+e.target.value); v.textContent = (+e.target.value).toFixed(step < 1 ? 2 : 0); } });
  const v = h('span', { class: 'sim-knob__val' }, (+val).toFixed(step < 1 ? 2 : 0));
  return h('div', { class: 'sim-knob' },
    h('div', { class: 'sim-knob__head' },
      h('span', { class: 'sim-knob__label' }, label),
      v,
    ),
    i,
  );
}

export function stopSim() { if (opampRaf) cancelAnimationFrame(opampRaf); opampRaf = null; }
