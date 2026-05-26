import { h, mount, icon } from '../ui.js?v=960a27c';
import { EQUIPMENT } from '../data.js?v=960a27c';

export function renderGlossary() {
  let q = '';

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'Lab <span class="accent">Equipment</span> Glossary' }),
      h('p', {}, 'A quick reference for hospital and lab instrumentation you’ll see in clinicals and your viva.'),
    ),
  );

  const search = h('input', { class: 'input', placeholder: 'Filter by name or tag…', oninput: e => { q = e.target.value; render(); } });
  const toolbar = h('div', { class: 'toolbar' }, search);
  const grid = h('div', { class: 'grid grid--2' });

  function render() {
    grid.innerHTML = '';
    const ql = q.toLowerCase();
    EQUIPMENT.filter(e => !ql || (e.name + e.desc + e.tag).toLowerCase().includes(ql)).forEach(e => {
      grid.appendChild(h('div', { class: 'resource' },
        h('div', { class: 'resource__icon' }, icon('brain')),
        h('div', {},
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('h5', {}, e.name),
            h('span', { class: 'chip chip--cyan' }, e.tag),
          ),
          h('p', {}, e.desc),
        ),
      ));
    });
  }
  mount('#view', head, toolbar, grid);
  render();
}
