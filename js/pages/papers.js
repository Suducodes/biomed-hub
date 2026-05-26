import { h, mount, icon } from '../ui.js?v=5f017ca';
import { SUBJECTS, SEM_LABEL, CATEGORY_META } from '../data.js?v=5f017ca';
import { loadManifest, getManifest } from '../storage.js?v=5f017ca';
import { navigate } from '../router.js?v=5f017ca';

// Global "Past Papers" browser — flattens the cloud manifest across all
// subjects. Filterable by semester, subject, year, type.

export async function renderPapers() {
  await loadManifest();
  const all = flattenPapers();

  const years = [...new Set(all.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);

  let q = '', semFilter = '', subjFilter = '', yearFilter = '';

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'All <span class="accent">Past Papers</span>' }),
      h('p', {}, 'Every past paper across the four years of B.E. Biomedical Engineering. Filter by semester, subject or year, then download or open in your browser.'),
    ),
  );

  const search = h('input', { class: 'input', placeholder: 'Search title, university…', oninput: e => { q = e.target.value; render(); } });
  const semSel = h('select', { class: 'select', onchange: e => { semFilter = e.target.value; render(); } },
    h('option', { value: '' }, 'All semesters'),
    ...SEM_LABEL.map((sl, i) => h('option', { value: i+1 }, `Sem ${sl}`)),
  );
  const subjSel = h('select', { class: 'select', onchange: e => { subjFilter = e.target.value; render(); } },
    h('option', { value: '' }, 'All subjects'),
    ...SUBJECTS.map(s => h('option', { value: s.id }, `${s.id} · ${s.name}`)),
  );
  const yearSel = h('select', { class: 'select', onchange: e => { yearFilter = e.target.value; render(); } },
    h('option', { value: '' }, 'All years'),
    ...years.map(y => h('option', { value: y }, y)),
  );

  const toolbar = h('div', { class: 'toolbar' }, search, semSel, subjSel, yearSel);
  const grid = h('div', { class: 'grid grid--2' });

  function render() {
    const filtered = all.filter(p => {
      if (semFilter && String(p.subject.sem) !== semFilter) return false;
      if (subjFilter && p.subject.id !== subjFilter) return false;
      if (yearFilter && String(p.year) !== yearFilter) return false;
      if (q) {
        const t = (p.title + ' ' + (p.university || '') + ' ' + p.subject.name).toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    grid.innerHTML = '';
    if (!filtered.length) {
      grid.appendChild(h('div', { class: 'empty', style: { gridColumn: '1 / -1' } },
        icon('papers'),
        h('h4', {}, 'No papers match'),
        h('p', {}, 'Try clearing some filters, or wait for more papers to be uploaded.'),
      ));
      return;
    }
    filtered.forEach(p => grid.appendChild(paperRow(p)));
  }

  mount('#view', head, toolbar, grid);
  render();
}

function flattenPapers() {
  const m = getManifest();
  const out = [];
  Object.entries(m.subjects || {}).forEach(([sid, b]) => {
    const subject = SUBJECTS.find(x => x.id === sid);
    if (!subject) return;
    (b.papers || []).forEach(p => out.push({ ...p, subject }));
  });
  out.sort((a, b) => (b.year || 0) - (a.year || 0));
  return out;
}

function paperRow(p) {
  const meta = CATEGORY_META[p.subject.category];
  return h('div', { class: 'pyq-card' },
    h('div', { class: 'pyq-card__sig', style: { background: `linear-gradient(135deg, ${meta.color}, ${meta.color}aa)` } },
      p.year ? h('span', {}, String(p.year)) : null,
      (p.type || 'R')[0],
    ),
    h('div', { class: 'pyq-card__body' },
      h('h5', { onclick: () => navigate(`#/subject/${p.subject.id}`), style: { cursor: 'pointer' } }, p.subject.name),
      h('div', { class: 'meta' }, `${p.subject.id} · Sem ${SEM_LABEL[p.subject.sem-1]}`),
      h('div', { class: 'meta', style: { marginTop: 3 } }, `${p.type || 'Regular'} · ${p.year || ''}${p.university ? ' · ' + p.university : ''}`),
      h('div', { class: 'meta', style: { marginTop: 3 } }, p.title),
    ),
    h('div', { class: 'pyq-card__act' },
      h('a', { class: 'btn btn--ghost btn--sm', href: p.file, target: '_blank', rel: 'noopener' }, 'Open'),
      h('a', { class: 'btn btn--primary btn--sm', href: p.file, download: '' }, icon('download'), 'Download'),
    ),
  );
}
