import { h, mount, icon } from '../ui.js';
import { navigate } from '../router.js';

// Tools hub — one heading in the sidebar, this grid inside.
// Each card is a "block" in the PhET sense: a preview, name, tags, click → run.
//
// Built-in tools live at #/<route>.  External (PhET) sims live at #/sim/<id>.

const TOOLS = [
  // ---------- Built-in interactive ----------
  {
    id: 'ecg', kind: 'builtin',
    title: 'ECG Lab',
    desc: 'Live ECG simulator on grid paper. Tweak BPM, noise, amplitude, switch between Normal / AFib / VFib rhythms.',
    tags: ['Cardio', 'Interactive', 'Live canvas'],
    accent: '#34d399',
    href: '#/ecg',
    art: 'ecg',
  },
  {
    id: 'rhythm', kind: 'builtin',
    title: 'Rhythm Trainer',
    desc: 'A flashcard game on top of the ECG engine — identify the rhythm in 4 choices. Track your best score.',
    tags: ['Cardio', 'Quiz game', 'Skills'],
    accent: '#fb7185',
    href: '#/rhythm',
    art: 'flame',
  },
  {
    id: 'opamp', kind: 'builtin',
    title: 'Op-amp Gain Visualizer',
    desc: 'Slide Rf and Rin. Watch inverting & non-inverting gain plus the live output waveform. Perfect for U21BM201.',
    tags: ['Electronics', 'Interactive'],
    accent: '#22d3ee',
    href: '#/sim/opamp',
    art: 'graph',
  },
  {
    id: 'calc', kind: 'builtin',
    title: 'Biomed Calculators',
    desc: 'BMI · MAP · eGFR · CMRR · Nyquist · Beer–Lambert · IV drip · op-amp gain · half-value layer.',
    tags: ['Clinical', 'Utility'],
    accent: '#a78bfa',
    href: '#/calc',
    art: 'calc',
  },
  {
    id: 'whiteboard', kind: 'builtin',
    title: 'Whiteboard',
    desc: 'Quick sketch tool. Pen, eraser, colors, undo, save as PNG. Auto-saves your drawing locally.',
    tags: ['Utility'],
    accent: '#fbbf24',
    href: '#/whiteboard',
    art: 'edit',
  },
  {
    id: 'mindmap', kind: 'builtin',
    title: 'Concept Map',
    desc: 'Radial visualisation of all subjects in any semester, coloured by category. Click to jump in.',
    tags: ['Navigation'],
    accent: '#f472b6',
    href: '#/mindmap',
    art: 'graph',
  },
  {
    id: 'glossary', kind: 'builtin',
    title: 'Lab Equipment Glossary',
    desc: 'Quick-reference of common hospital and lab instrumentation, by department.',
    tags: ['Reference'],
    accent: '#60a5fa',
    href: '#/glossary',
    art: 'brain',
  },
  {
    id: 'buddy', kind: 'builtin',
    title: 'Study Buddy',
    desc: 'Keyword Q&A over the syllabus knowledge base. Plus quick-links to NotebookLM / ChatGPT / Claude.',
    tags: ['AI', 'Offline'],
    accent: '#2dd4bf',
    href: '#/buddy',
    art: 'buddy',
  },

  // ---------- External: PhET embedded simulations ----------
  {
    id: 'phet-neuron', kind: 'phet',
    title: 'Neuron · PhET',
    desc: 'Hodgkin-Huxley neuron with voltage-clamp + stimulus. Watch sodium/potassium gates open and the action potential propagate.',
    tags: ['Physiology', 'PhET'],
    accent: '#34d399',
    href: '#/sim/phet/neuron',
  },
  {
    id: 'phet-membrane', kind: 'phet',
    title: 'Membrane Transport · PhET',
    desc: 'Channels, pumps, gradients — see how ions and molecules cross the cell membrane.',
    tags: ['Cell biology', 'PhET'],
    accent: '#a78bfa',
    href: '#/sim/phet/membrane-channels',
  },
  {
    id: 'phet-beers', kind: 'phet',
    title: "Beer's Law Lab · PhET",
    desc: 'Spectrophotometry from scratch. Foundational for pulse oximetry and clinical biochem assays.',
    tags: ['Optics', 'PhET'],
    accent: '#fbbf24',
    href: '#/sim/phet/beers-law-lab',
  },
  {
    id: 'phet-ph', kind: 'phet',
    title: 'pH Scale · PhET',
    desc: 'Dilute, mix, measure pH and concentration of common substances. Quick refresher for biochem.',
    tags: ['Chemistry', 'PhET'],
    accent: '#f472b6',
    href: '#/sim/phet/ph-scale',
  },
  {
    id: 'phet-sound', kind: 'phet',
    title: 'Sound Waves · PhET',
    desc: 'Wave propagation, interference, the doppler effect — physics behind ultrasound.',
    tags: ['Imaging', 'PhET'],
    accent: '#22d3ee',
    href: '#/sim/phet/sound-waves',
  },
  {
    id: 'phet-conc', kind: 'phet',
    title: 'Concentration · PhET',
    desc: 'Dissolve, dilute, watch saturation. Direct application to drug dosing & lab assays.',
    tags: ['Chemistry', 'PhET'],
    accent: '#60a5fa',
    href: '#/sim/phet/concentration',
  },
];

export function renderTools() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Tools</span> & Simulations' }),
      h('p', {}, 'Interactive labs in your browser — built-in tools and free PhET simulations curated for biomedical engineering. Click any card to launch.'),
    ),
  );

  // Filter chips
  const tags = new Set(['All']);
  TOOLS.forEach(t => t.tags.forEach(x => tags.add(x)));
  let active = 'All';
  const tagBar = h('div', { class: 'kind-pills', style: { marginBottom: 14 } });
  [...tags].forEach(t => {
    const b = h('button', { class: 'kind-pill' + (t === active ? ' is-active' : ''), onclick: () => { active = t; render(); } }, h('span', {}, t));
    b.dataset.tag = t;
    tagBar.appendChild(b);
  });

  const grid = h('div', { class: 'sim-grid' });

  function render() {
    [...tagBar.children].forEach(b => b.classList.toggle('is-active', b.dataset.tag === active));
    grid.innerHTML = '';
    const list = TOOLS.filter(t => active === 'All' || t.tags.includes(active));
    list.forEach(t => grid.appendChild(simCard(t)));
  }

  mount('#view', head, tagBar, grid);
  render();
}

function simCard(t) {
  return h('a', { class: 'sim-card', href: t.href, style: { '--accent': t.accent } },
    h('div', { class: 'sim-card__preview' },
      simArt(t),
      h('div', { class: 'sim-card__badge' }, t.kind === 'phet' ? 'PhET' : 'HTML5'),
    ),
    h('div', { class: 'sim-card__body' },
      h('h4', {}, t.title),
      h('p', {}, t.desc),
      h('div', { class: 'sim-card__tags' },
        ...t.tags.map(x => h('span', { class: 'chip' }, x)),
      ),
    ),
  );
}

// Each card gets a tiny stylised "screenshot" drawn in SVG.
function simArt(t) {
  if (t.id === 'ecg' || t.id === 'rhythm') return ecgArt();
  if (t.id === 'opamp') return opampArt();
  if (t.id === 'calc') return calcArt();
  if (t.id === 'whiteboard') return whiteboardArt();
  if (t.id === 'mindmap') return mindmapArt();
  if (t.id === 'glossary') return glossaryArt();
  if (t.id === 'buddy') return buddyArt();
  if (t.kind === 'phet') return phetArt(t.accent);
  return phetArt(t.accent);
}

// --- mini art helpers (inline SVGs) ---
function ecgArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <g stroke="rgba(244,114,182,0.18)" stroke-width="0.5">
      ${[0,40,80,120,160,200].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="120"/>`).join('')}
      ${[0,40,80,120].map(y => `<line x1="0" y1="${y}" x2="200" y2="${y}"/>`).join('')}
    </g>
    <path d="M0 60 L20 60 L25 55 L30 70 L35 30 L40 90 L45 55 L60 60 L80 60 L85 56 L90 50 L100 60 L120 60 L125 55 L130 70 L135 30 L140 90 L145 55 L160 60 L200 60"
      fill="none" stroke="#34d399" stroke-width="2" filter="drop-shadow(0 0 4px #34d399)"/>
  `);
}
function opampArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <polygon points="80,30 80,90 140,60" fill="none" stroke="#22d3ee" stroke-width="2"/>
    <text x="86" y="55" fill="#22d3ee" font-size="10" font-family="JetBrains Mono">+</text>
    <text x="86" y="80" fill="#22d3ee" font-size="10" font-family="JetBrains Mono">−</text>
    <line x1="20" y1="45" x2="80" y2="45" stroke="#a78bfa" stroke-width="1.5"/>
    <line x1="20" y1="75" x2="80" y2="75" stroke="#a78bfa" stroke-width="1.5"/>
    <line x1="140" y1="60" x2="180" y2="60" stroke="#34d399" stroke-width="1.5"/>
    <circle cx="20" cy="45" r="3" fill="#a78bfa"/>
    <circle cx="20" cy="75" r="3" fill="#a78bfa"/>
    <circle cx="180" cy="60" r="3" fill="#34d399"/>
  `);
}
function calcArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <text x="20" y="34" fill="#22d3ee" font-size="18" font-family="JetBrains Mono">CMRR</text>
    <text x="20" y="60" fill="#a78bfa" font-size="16" font-family="JetBrains Mono">= 20·log</text>
    <text x="118" y="65" fill="#a78bfa" font-size="10" font-family="JetBrains Mono">10</text>
    <text x="20" y="90" fill="#34d399" font-size="14" font-family="JetBrains Mono">(Ad / Acm)</text>
  `);
}
function whiteboardArt() {
  return svg(`
    <rect width="200" height="120" fill="#0a121f"/>
    ${[20,44,68,92].flatMap(y => [20,44,68,92,116,140,164,184].map(x => `<circle cx="${x}" cy="${y}" r="1" fill="rgba(148,163,184,0.20)"/>`)).join('')}
    <path d="M40 30 Q70 10 110 50 T180 80" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 90 Q50 100 70 90" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>
  `);
}
function mindmapArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <circle cx="100" cy="60" r="14" fill="rgba(167,139,250,0.30)" stroke="#a78bfa" stroke-width="1.5"/>
    ${[0,1,2,3,4,5].map(i => {
      const a = (i/6) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 40;
      const y = 60 + Math.sin(a) * 30;
      return `<line x1="100" y1="60" x2="${x}" y2="${y}" stroke="rgba(148,163,184,0.4)" stroke-width="1"/>
              <circle cx="${x}" cy="${y}" r="6" fill="rgba(34,211,238,0.30)" stroke="#22d3ee" stroke-width="1"/>`;
    }).join('')}
  `);
}
function glossaryArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <rect x="40" y="30" width="120" height="60" rx="6" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
    <circle cx="100" cy="60" r="4" fill="#fb7185"/>
    <path d="M60 60 L100 60 L100 50 L110 50" fill="none" stroke="#22d3ee" stroke-width="1.5"/>
    <path d="M140 60 L100 60" fill="none" stroke="#34d399" stroke-width="1.5"/>
    <rect x="60" y="76" width="80" height="8" rx="2" fill="rgba(96,165,250,0.4)"/>
  `);
}
function buddyArt() {
  return svg(`
    <rect width="200" height="120" fill="#04080f"/>
    <rect x="20" y="30" width="110" height="22" rx="11" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" stroke-width="0.5"/>
    <rect x="70" y="62" width="110" height="22" rx="11" fill="rgba(167,139,250,0.25)" stroke="#a78bfa" stroke-width="0.5"/>
    <rect x="20" y="94" width="80" height="14" rx="7" fill="rgba(52,211,153,0.25)" stroke="#34d399" stroke-width="0.5"/>
  `);
}
function phetArt(accent) {
  return svg(`
    <defs><linearGradient id="g${Math.floor(Math.random()*1000)}" x1="0" x2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${accent}88"/></linearGradient></defs>
    <rect width="200" height="120" fill="${accent}10"/>
    <circle cx="60" cy="60" r="20" fill="${accent}40" stroke="${accent}" stroke-width="1.5"/>
    <circle cx="140" cy="60" r="14" fill="${accent}40" stroke="${accent}" stroke-width="1.5"/>
    <circle cx="100" cy="40" r="6" fill="${accent}80"/>
    <circle cx="100" cy="85" r="6" fill="${accent}80"/>
    <line x1="60" y1="60" x2="100" y2="40" stroke="${accent}" stroke-dasharray="2 2"/>
    <line x1="60" y1="60" x2="100" y2="85" stroke="${accent}" stroke-dasharray="2 2"/>
    <line x1="140" y1="60" x2="100" y2="40" stroke="${accent}" stroke-dasharray="2 2"/>
    <line x1="140" y1="60" x2="100" y2="85" stroke="${accent}" stroke-dasharray="2 2"/>
  `);
}
function svg(inner) {
  const wrap = document.createElement('div');
  wrap.className = 'sim-card__svg';
  wrap.innerHTML = `<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  return wrap;
}
