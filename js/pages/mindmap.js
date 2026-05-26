import { h, mount } from '../ui.js?v=5f017ca';
import { SEM_LABEL, subjectsOf, CATEGORY_META } from '../data.js?v=5f017ca';
import { navigate } from '../router.js?v=5f017ca';

// Radial map: pick a semester, see its subjects arranged around a central node,
// coloured by category. Click any subject to jump to its detail page.

export function renderMindmap() {
  let sem = 3; // default: first PCC-heavy semester

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Concept</span> Map' }),
      h('p', {}, 'A bird’s-eye view of all subjects in a semester, coloured by category. Click any node to jump into its detail.'),
    ),
    h('div', { class: 'page-head__actions' },
      h('select', { class: 'select', onchange: e => { sem = +e.target.value; draw(); } },
        ...SEM_LABEL.map((sl, i) => h('option', { value: i+1, selected: (i+1) === sem ? '' : null }, `Semester ${sl}`)),
      ),
    ),
  );

  const wrap = h('div', { class: 'graph-wrap' });

  function draw() {
    wrap.innerHTML = '';
    const subjects = subjectsOf(sem);
    const W = wrap.clientWidth || 1000;
    const H = 540;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.35;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'graph-svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // Links
    subjects.forEach((s, i) => {
      const a = (i / subjects.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('class', 'graph-link');
      l.setAttribute('x1', cx); l.setAttribute('y1', cy);
      l.setAttribute('x2', x);  l.setAttribute('y2', y);
      svg.appendChild(l);
    });

    // Subject nodes
    subjects.forEach((s, i) => {
      const a = (i / subjects.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      const meta = CATEGORY_META[s.category];

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'graph-node');
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => navigate(`#/subject/${s.id}`));

      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 22);
      c.setAttribute('fill', meta.color + '40');
      c.setAttribute('stroke', meta.color);
      g.appendChild(c);

      // Code label inside
      const code = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      code.setAttribute('x', x); code.setAttribute('y', y + 4);
      code.setAttribute('font-weight', '700');
      code.setAttribute('font-size', '10');
      code.textContent = s.category;
      g.appendChild(code);

      // Subject name
      const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const labelOnRight = Math.cos(a) > 0;
      const lx = x + Math.cos(a) * 30;
      const ly = y + Math.sin(a) * 30 + 4;
      name.setAttribute('x', lx); name.setAttribute('y', ly);
      name.setAttribute('text-anchor', labelOnRight ? 'start' : 'end');
      name.setAttribute('font-size', '11');
      name.textContent = s.name.length > 32 ? s.name.slice(0, 30) + '…' : s.name;
      g.appendChild(name);

      svg.appendChild(g);
    });

    // Centre
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'graph-node center');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 42);
    g.appendChild(c);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy);
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('font-size', '11');
    txt.textContent = 'SEMESTER';
    g.appendChild(txt);
    const txt2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt2.setAttribute('x', cx); txt2.setAttribute('y', cy + 18);
    txt2.setAttribute('font-weight', '700');
    txt2.setAttribute('font-size', '22');
    txt2.textContent = SEM_LABEL[sem-1];
    g.appendChild(txt2);
    svg.appendChild(g);

    wrap.appendChild(svg);
  }

  // Category legend
  const legend = h('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 } },
    ...Object.entries(CATEGORY_META).map(([k, m]) =>
      h('span', { class: 'chip', style: { color: m.color, borderColor: m.color + '40', background: m.color + '14' } }, `${k} · ${m.label}`)
    ),
  );

  mount('#view', head, wrap, legend);
  setTimeout(draw, 0);
}
