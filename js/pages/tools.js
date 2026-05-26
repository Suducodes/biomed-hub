import { h, mount, icon } from '../ui.js?v=5f017ca';
import { navigate } from '../router.js?v=5f017ca';

// Tools hub — PhET-style: vertical category sidebar on the left, grid of
// matching simulation cards on the right.
//
// Mobile: sidebar collapses to a horizontal scroller above the grid.

const CATEGORIES = [
  { id: 'all',         label: 'All tools',        emoji: '✦' },
  { id: 'cardio',      label: 'Cardiology',       emoji: '❤' },
  { id: 'electronics', label: 'Electronics',      emoji: '⚡' },
  { id: 'physio',      label: 'Physiology',       emoji: '🧠' },
  { id: 'chem',        label: 'Chemistry',        emoji: '⚗' },
  { id: 'imaging',     label: 'Imaging',          emoji: '🩻' },
  { id: 'code',        label: 'Code & Circuits',  emoji: '💻' },
  { id: 'utility',     label: 'Utilities',        emoji: '🧰' },
];

const TOOLS = [
  // ---------- Cardiology ----------
  { id: 'ecg',    cats: ['cardio'],    title: 'ECG Lab',                  desc: 'Live ECG simulator on grid paper. Tweak BPM, noise, amplitude, switch rhythms.',                tags: ['Live canvas', 'HTML5'], accent: '#34d399', href: '#/ecg' },
  { id: 'rhythm', cats: ['cardio'],    title: 'Rhythm Trainer',           desc: 'Quiz: identify the rhythm in 4 choices. Tracks score, streak, all-time best.',                 tags: ['Game', 'HTML5'],       accent: '#fb7185', href: '#/rhythm' },

  // ---------- Electronics ----------
  { id: 'opamp',  cats: ['electronics'], title: 'Op-amp Gain Visualizer', desc: 'Slide Rf, Rin, amp, frequency — see inverting / non-inverting gain + live waveforms.',         tags: ['Interactive', 'HTML5'], accent: '#22d3ee', href: '#/sim/opamp' },
  { id: 'rc',     cats: ['electronics'], title: 'RC Low-pass Bode',       desc: 'Drag R and C; watch cutoff frequency, magnitude (dB) and phase response in real time.',       tags: ['Interactive', 'HTML5'], accent: '#60a5fa', href: '#/sim/rc' },

  // ---------- Physiology ----------
  { id: 'phet-neuron',   cats: ['physio', 'cardio'], title: 'Neuron · PhET',            desc: 'Hodgkin-Huxley action potential. Voltage-clamp, stimulus, see Na⁺/K⁺ gates.',                          tags: ['PhET'],   accent: '#34d399', href: '#/sim/phet/neuron' },
  { id: 'phet-membrane', cats: ['physio'],           title: 'Membrane Transport · PhET',desc: 'Channels and pumps move ions across the membrane. Foundational cell physiology.',                     tags: ['PhET'],   accent: '#a78bfa', href: '#/sim/phet/membrane-transport' },

  // ---------- Chemistry ----------
  { id: 'phet-beers', cats: ['chem', 'imaging'], title: "Beer's Law Lab · PhET", desc: 'Spectrophotometry from scratch. The physics behind pulse oximetry & biochem assays.',                        tags: ['PhET'],   accent: '#fbbf24', href: '#/sim/phet/beers-law-lab' },
  { id: 'phet-ph',    cats: ['chem'],            title: 'pH Scale · PhET',        desc: 'Dilute, mix, measure pH. Quick biochem refresher.',                                                          tags: ['PhET'],   accent: '#f472b6', href: '#/sim/phet/ph-scale' },
  { id: 'phet-conc',  cats: ['chem'],            title: 'Concentration · PhET',   desc: 'Dissolve, dilute, watch saturation. Direct application to drug dosing & lab assays.',                       tags: ['PhET'],   accent: '#60a5fa', href: '#/sim/phet/concentration' },

  // ---------- Imaging ----------
  { id: 'phet-sound', cats: ['imaging'],         title: 'Sound Waves · PhET',    desc: 'Waves, interference, doppler — physics behind ultrasound.',                                                    tags: ['PhET'],   accent: '#22d3ee', href: '#/sim/phet/sound' },

  // ---------- Code & Circuits ----------
  { id: 'sandbox', cats: ['code'],     title: 'Code Sandbox',          desc: 'In-browser editor + runner for JavaScript and Python (NumPy / SciPy via Pyodide). No setup.',                            tags: ['HTML5', 'IDE'], accent: '#a78bfa', href: '#/sandbox' },
  { id: 'wokwi',   cats: ['code'],     title: 'Wokwi (external)',      desc: 'Full Arduino / ESP32 / Raspberry Pi Pico breadboard simulator. Free in your browser.',                                  tags: ['External', 'µC'], accent: '#fbbf24', href: 'https://wokwi.com/', external: true },
  { id: 'tinker',  cats: ['code'],     title: 'Tinkercad Circuits (external)', desc: 'Drag-drop breadboard + microcontroller simulator with code mode. Great for Sem 5 microcontroller lab.',         tags: ['External', 'µC'], accent: '#34d399', href: 'https://www.tinkercad.com/circuits', external: true },

  // ---------- Utilities ----------
  { id: 'calc',       cats: ['utility', 'cardio'], title: 'Biomed Calculators',   desc: 'BMI · MAP · eGFR · CMRR · Nyquist · Beer–Lambert · IV drip · op-amp gain · HVL.',                          tags: ['HTML5'],  accent: '#a78bfa', href: '#/calc' },
  { id: 'whiteboard', cats: ['utility'],           title: 'Whiteboard',           desc: 'Sketch quick diagrams. Pen, eraser, colours, undo, save as PNG. Auto-saves locally.',                       tags: ['HTML5'],  accent: '#fbbf24', href: '#/whiteboard' },
  { id: 'mindmap',    cats: ['utility'],           title: 'Concept Map',          desc: 'Radial view of all subjects in any semester, coloured by category. Click any node.',                        tags: ['HTML5'],  accent: '#f472b6', href: '#/mindmap' },
  { id: 'glossary',   cats: ['utility'],           title: 'Lab Equipment',        desc: 'Quick-reference glossary of common hospital and lab instrumentation.',                                       tags: ['Reference'], accent: '#60a5fa', href: '#/glossary' },
  { id: 'buddy',      cats: ['utility'],           title: 'Study Buddy',          desc: 'Offline keyword Q&A over the syllabus + quick-links to NotebookLM / ChatGPT / Claude.',                     tags: ['HTML5', 'AI'], accent: '#2dd4bf', href: '#/buddy' },
];

export function renderTools() {
  let cat = 'all';

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Tools</span> & Simulations' }),
      h('p', {}, 'Pick a category on the left. Interactive labs, code sandboxes and curated PhET simulations — all in your browser.'),
    ),
  );

  const sidebar = h('nav', { class: 'tools-side', 'aria-label': 'Tool categories' });
  CATEGORIES.forEach(c => {
    const count = c.id === 'all' ? TOOLS.length : TOOLS.filter(t => t.cats.includes(c.id)).length;
    const a = h('button', { class: 'tools-side__item' + (c.id === cat ? ' is-active' : ''), onclick: () => { cat = c.id; render(); } },
      h('span', { class: 'tools-side__emoji' }, c.emoji),
      h('span', { class: 'tools-side__label' }, c.label),
      h('span', { class: 'tools-side__count' }, String(count)),
    );
    a.dataset.cat = c.id;
    sidebar.appendChild(a);
  });

  const grid = h('div', { class: 'tools-grid' });

  function render() {
    [...sidebar.children].forEach(b => b.classList.toggle('is-active', b.dataset.cat === cat));
    grid.innerHTML = '';
    const list = TOOLS.filter(t => cat === 'all' || t.cats.includes(cat));
    if (!list.length) {
      grid.appendChild(h('div', { class: 'empty' }, h('h4', {}, 'Nothing here yet'), h('p', {}, 'More tools coming.')));
      return;
    }
    list.forEach(t => grid.appendChild(toolCard(t)));
  }

  mount('#view',
    head,
    h('div', { class: 'tools-layout' }, sidebar, grid),
  );
  render();
}

function toolCard(t) {
  const inner = [
    h('div', { class: 'tool-card__chip' }, t.tags[0] || 'Tool'),
    h('h4', {}, t.title, t.external ? h('span', { class: 'tool-card__ext' }, '↗') : null),
    h('p', {}, t.desc),
    h('div', { class: 'tool-card__tags' }, ...t.tags.map(x => h('span', { class: 'chip' }, x))),
  ];
  const attrs = {
    class: 'tool-card',
    style: { '--accent': t.accent },
    href: t.href,
    ...(t.external ? { target: '_blank', rel: 'noopener' } : {}),
  };
  return h('a', attrs, ...inner);
}
