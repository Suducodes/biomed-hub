import { h, mount, icon } from '../ui.js';
import { YEARS, SEM_LABEL, subjectsOf, subjectById, CATEGORY_META } from '../data.js';
import { librarySubject, store, loadManifest } from '../storage.js';
import { navigate } from '../router.js';

// ---------- /#/curriculum (year grid) ----------
export function renderCurriculum() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'B.E. Biomedical Engineering · <span class="accent">R2021</span>' }),
      h('p', {}, 'Four years, eight semesters. Open any year to see its semesters; open a semester to find subjects, notes and past papers.'),
    ),
  );

  const grid = h('div', { class: 'grid grid--2' });
  YEARS.forEach(y => {
    const semCount = y.sems.reduce((a, s) => a + subjectsOf(s).length, 0);
    grid.appendChild(h('div', { class: 'year-card', onclick: () => navigate(`#/curriculum/year/${y.y}`) },
      h('div', { class: 'year-card__num' }, String(y.y)),
      h('div', { style: { flex: 1 } },
        h('h3', {}, y.label, h('span', { class: 'year-card__sub' }, ` · Sem ${y.sems.map(s => SEM_LABEL[s-1]).join(' & ')}`)),
        h('p', {}, y.blurb),
        h('div', { class: 'year-card__meta' },
          h('span', { class: 'chip chip--cyan' }, `${semCount} subjects`),
          ...y.sems.map(s => h('span', { class: 'chip' }, `Sem ${SEM_LABEL[s-1]}`)),
        ),
      ),
    ));
  });

  mount('#view', head, grid);
}

// ---------- Breadcrumb helper ----------
function crumb(parts) {
  // parts: [{ label, href? }] — last item shown as plain text
  const wrap = h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' });
  parts.forEach((p, i) => {
    if (i > 0) wrap.appendChild(h('span', { class: 'crumbs__sep' }, '›'));
    if (p.href) wrap.appendChild(h('a', { class: 'crumbs__link', href: p.href }, p.label));
    else wrap.appendChild(h('span', { class: 'crumbs__cur' }, p.label));
  });
  return wrap;
}

// ---------- /#/curriculum/year/:y ----------
export function renderYear({ y }) {
  const year = YEARS.find(x => String(x.y) === String(y));
  if (!year) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Year not found')));

  mount('#view',
    crumb([{ label: 'Curriculum', href: '#/curriculum' }, { label: year.label }]),
    h('div', { class: 'page-head' },
      h('div', {},
        h('h1', { html: `Year ${y} — <span class="accent">${year.sems.map(s => 'Sem ' + SEM_LABEL[s-1]).join(' & ')}</span>` }),
        h('p', {}, year.blurb),
      ),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/curriculum') }, '← All years'),
      ),
    ),
    h('div', { class: 'grid grid--2' },
      ...year.sems.map(s => semCard(s)),
    ),
  );
}

function semCard(sem) {
  const subjects = subjectsOf(sem);
  return h('div', { class: 'year-card', onclick: () => navigate(`#/curriculum/sem/${sem}`) },
    h('div', { class: 'year-card__num year-card__num--sm' }, SEM_LABEL[sem-1]),
    h('div', { style: { flex: 1 } },
      h('h3', {}, `Semester ${SEM_LABEL[sem-1]}`),
      h('p', {}, `${subjects.length} subjects · ${subjects.reduce((c, s) => c + (s.credits || 0), 0)} credits`),
      h('div', { class: 'year-card__meta' },
        ...['PCC', 'ESC', 'BSC', 'HSMC', 'PEC', 'OEC', 'EEC', 'MNC']
          .map(cat => {
            const n = subjects.filter(s => s.category === cat).length;
            if (!n) return null;
            const meta = CATEGORY_META[cat];
            return h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, `${cat} · ${n}`);
          }).filter(Boolean),
      ),
    ),
  );
}

// ---------- /#/curriculum/sem/:n ----------
export function renderSemester({ n }) {
  const sem = +n;
  if (sem < 1 || sem > 8) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Bad semester')));
  const subjects = subjectsOf(sem);
  const year = YEARS.find(y => y.sems.includes(sem));

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: `Semester <span class="accent">${SEM_LABEL[sem-1]}</span> · subjects` }),
      h('p', {}, `${subjects.length} subjects · click any to open notes and past papers.`),
    ),
    h('div', { class: 'page-head__actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => navigate(`#/curriculum/year/${year.y}`) }, `← Year ${year.y}`),
    ),
  );

  // Group by category
  const groups = {};
  subjects.forEach(s => { (groups[s.category] = groups[s.category] || []).push(s); });
  const order = ['PCC', 'ESC', 'BSC', 'HSMC', 'PEC', 'OEC', 'EEC', 'MNC'];
  const body = h('div', {});
  order.filter(c => groups[c]).forEach(cat => {
    const meta = CATEGORY_META[cat];
    body.appendChild(h('div', { class: 'section-title' },
      h('h3', {}, meta.label, h('span', { class: 'chip', style: { marginLeft: 10, color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, cat)),
    ));
    body.appendChild(h('div', { class: 'grid grid--3' }, ...groups[cat].map(subjectCard)));
  });

  mount('#view',
    crumb([
      { label: 'Curriculum', href: '#/curriculum' },
      { label: year.label,   href: `#/curriculum/year/${year.y}` },
      { label: `Sem ${SEM_LABEL[sem-1]}` },
    ]),
    head,
    body,
  );
}

function subjectCard(s) {
  const meta = CATEGORY_META[s.category];
  return h('div', { class: 'subject-card', onclick: () => navigate(`#/subject/${s.id}`) },
    h('div', { class: 'subject-card__art', style: { background: `linear-gradient(135deg, ${meta.color}, transparent)` } }),
    h('span', { class: 'subject-card__code', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
    h('h4', {}, s.name),
    h('p', {}, s.blurb),
    h('div', { class: 'subject-card__meta' },
      h('span', {}, h('b', {}, s.credits), ' credits'),
      h('span', {}, ' · ', s.type),
    ),
  );
}

// ---------- /#/subject/:id (subject detail) ----------
export async function renderSubject({ id }) {
  const s = subjectById(id);
  if (!s) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Subject not found')));
  const meta = CATEGORY_META[s.category];
  const year = YEARS.find(y => y.sems.includes(s.sem));

  // Hero
  const hero = h('section', { class: 'subject-hero', style: { background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}08 100%), rgba(15,23,42,0.5)` } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
      h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
      h('span', { class: 'chip' }, `Sem ${SEM_LABEL[s.sem-1]}`),
      h('span', { class: 'chip' }, meta.label),
    ),
    h('h1', {}, s.name),
    h('p', {}, s.blurb),
    h('div', { class: 'meta' },
      h('span', { class: 'chip' }, `${s.credits} credits`),
      h('span', { class: 'chip' }, s.type),
    ),
  );

  // Syllabus image (populated after manifest load)
  const syllabusMount = h('div', { id: 'syllabus-mount' });

  // Tabs
  const tabsRow = h('div', { class: 'tabs' });
  const content = h('div', {});
  let active = 'Admin Notes';
  const tabs = ['Admin Notes', 'My Notes', 'Past Papers', 'About'];

  function paint() {
    [...tabsRow.children].forEach(c => c.classList.toggle('is-active', c.textContent === active));
    content.innerHTML = '';
    const lib = librarySubject(s.id);
    if (active === 'Admin Notes')  content.appendChild(adminNotes(s, lib));
    if (active === 'My Notes')     content.appendChild(myNotes(s));
    if (active === 'Past Papers')  content.appendChild(papers(s, lib));
    if (active === 'About')        content.appendChild(aboutSubject(s));
  }

  tabs.forEach(t => tabsRow.appendChild(h('div', { class: 'tab', onclick: () => { active = t; paint(); } }, t)));

  mount('#view',
    crumb([
      { label: 'Curriculum',         href: '#/curriculum' },
      { label: year.label,           href: `#/curriculum/year/${year.y}` },
      { label: `Sem ${SEM_LABEL[s.sem-1]}`, href: `#/curriculum/sem/${s.sem}` },
      { label: s.name },
    ]),
    h('div', { class: 'page-head', style: { marginBottom: 14 } },
      h('div', {}),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => navigate(`#/curriculum/sem/${s.sem}`) }, `← All Sem ${SEM_LABEL[s.sem-1]} subjects`),
      ),
    ),
    hero,
    syllabusMount,
    tabsRow,
    content,
  );

  // ensure manifest is loaded, then paint syllabus + tab content
  await loadManifest();
  paintSyllabus(syllabusMount, s, librarySubject(s.id));
  paint();
}

// ---------- Syllabus image ----------
function paintSyllabus(mountEl, s, lib) {
  mountEl.innerHTML = '';
  if (!lib.syllabus) return;  // nothing uploaded yet
  mountEl.appendChild(h('div', { class: 'syllabus-card' },
    h('div', { class: 'syllabus-card__head' },
      h('h3', { style: { margin: 0, fontFamily: 'Space Grotesk' } }, 'Syllabus'),
      lib.syllabusDraft ? h('span', { class: 'chip chip--amber' }, 'draft (local)') : null,
      h('span', { class: 'spacer', style: { flex: 1 } }),
      h('a', { class: 'btn btn--ghost btn--sm', href: lib.syllabus, target: '_blank', rel: 'noopener' }, 'Open original'),
    ),
    h('img', { class: 'syllabus-card__img', src: lib.syllabus, alt: `${s.name} syllabus`, loading: 'lazy' }),
  ));
}

// ---------- Tab contents ----------
function adminNotes(s, lib) {
  if (!lib.notes.length) {
    return h('div', { class: 'empty' },
      icon('notes'),
      h('h4', {}, 'No curated notes yet for this subject'),
      h('p', {}, 'The admin will upload official unit-wise notes here. In the meantime, add your own under the "My Notes" tab.'),
    );
  }

  // Group notes by unit (Google-Classroom-style card grid).
  const groups = new Map();
  lib.notes.forEach(n => {
    const k = (n.unit ?? '').toString().trim();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(n);
  });
  const orderedKeys = [...groups.keys()].sort((a, b) => {
    const na = a === '' ? Infinity : +a;
    const nb = b === '' ? Infinity : +b;
    return na - nb;
  });

  // Cycle accent colours so each card has a distinct edge.
  const accents = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#fb7185', '#2dd4bf'];

  const wrap = h('div', { class: 'cl-grid' });
  orderedKeys.forEach((k, idx) => {
    const items = groups.get(k);
    const accent = accents[idx % accents.length];
    const heading = k === '' ? 'General' : `Unit ${k}`;
    // The first item's title gives the unit its descriptive title (if matches pattern).
    const subtitle = items[0]?.title && items[0].title !== heading ? items[0].title : '';
    const card = h('div', { class: 'cl-card', style: { '--accent': accent } },
      h('div', { class: 'cl-card__band' }),
      h('div', { class: 'cl-card__head' },
        h('div', { class: 'cl-card__num', style: { background: accent } }, k === '' ? '∗' : k),
        h('div', { class: 'cl-card__title' },
          h('h4', {}, heading),
          subtitle && k !== '' ? h('div', { class: 'cl-card__sub' }, subtitle) : null,
        ),
        h('div', { class: 'cl-card__count' }, items.length, ' file', items.length === 1 ? '' : 's'),
      ),
      h('div', { class: 'cl-card__files' },
        ...items.map(it => h('a', { class: 'cl-file', href: it.file, target: '_blank', rel: 'noopener' },
          h('div', { class: 'cl-file__icon' }, '📄'),
          h('div', { class: 'cl-file__body' },
            h('div', { class: 'cl-file__title' }, it.title, it.draft ? h('span', { class: 'chip chip--amber', style: { marginLeft: 8 } }, 'draft') : null),
            it.addedAt ? h('div', { class: 'cl-file__sub' }, 'Posted ' + it.addedAt) : null,
          ),
          h('a', { class: 'cl-file__dl', href: it.file, download: '', title: 'Download', onclick: (e) => e.stopPropagation() }, '⬇'),
        )),
      ),
    );
    wrap.appendChild(card);
  });
  return wrap;
}

function papers(s, lib) {
  if (!lib.papers.length) {
    return h('div', { class: 'empty' },
      icon('papers'),
      h('h4', {}, 'No past papers uploaded yet'),
      h('p', {}, 'When papers are added for this subject, they will appear here.'),
    );
  }
  // Group by year (newest first)
  const groups = new Map();
  lib.papers.forEach(p => {
    const k = String(p.year || '—');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  });
  const orderedKeys = [...groups.keys()].sort((a, b) => (b || 0) - (a || 0));
  const wrap = h('div', {});
  orderedKeys.forEach(k => {
    wrap.appendChild(h('div', { class: 'unit-group' },
      h('div', { class: 'unit-group__head' },
        h('div', { class: 'unit-group__pill' }, k === '—' ? '?' : k.slice(-2)),
        h('h4', {}, k === '—' ? 'Year not set' : k),
        h('span', { class: 'chip' }, `${groups.get(k).length} paper${groups.get(k).length === 1 ? '' : 's'}`),
      ),
      h('div', { class: 'list' }, ...groups.get(k).map(it => pdfRow(it, s, 'paper'))),
    ));
  });
  return wrap;
}

function pdfRow(item, subject, kind) {
  const href = item.file;
  return h('div', { class: 'pyq-card' },
    h('div', { class: 'pyq-card__sig', style: { background: 'linear-gradient(135deg,#22d3ee,#a78bfa)' } },
      kind === 'paper' && item.year ? h('span', {}, String(item.year)) : null,
      kind === 'paper' ? (item.type || 'P')[0] : 'PDF',
    ),
    h('div', { class: 'pyq-card__body' },
      h('h5', {}, item.title, item.draft ? h('span', { class: 'chip chip--amber', style: { marginLeft: 8 } }, 'draft (local)') : null),
      h('div', { class: 'meta' },
        kind === 'paper'
          ? `${item.type || 'Regular'} · ${item.year || ''} · ${item.university || ''}`
          : `${item.by ? 'by ' + item.by : ''} ${(item.tags || []).map(t => '#' + t).join(' ')}`,
      ),
    ),
    h('div', { class: 'pyq-card__act' },
      h('a', { class: 'btn btn--ghost btn--sm', href, target: '_blank', rel: 'noopener' }, 'Open'),
      h('a', { class: 'btn btn--primary btn--sm', href, download: '' }, icon('download'), 'Download'),
    ),
  );
}

function myNotes(s) {
  const my = store.notes().filter(n => n.subjectId === s.id);
  const banner = h('div', { class: 'private-banner' },
    h('div', { class: 'private-banner__icon' }, '🔒'),
    h('div', { style: { flex: 1 } },
      h('div', { style: { fontWeight: 600, fontSize: 13.5 } }, 'These notes are private to you.'),
      h('div', { style: { color: 'var(--muted)', fontSize: 12.5, marginTop: 2 } },
        'Saved only in this browser — never uploaded, never seen by classmates or the admin. Open on a new device to start fresh there.'),
    ),
    h('button', { class: 'btn btn--primary btn--sm', onclick: () => navigate(`#/notes/new?subject=${s.id}`) }, icon('plus'), 'New note'),
  );
  if (!my.length) {
    return h('div', {}, banner, h('div', { class: 'empty' }, icon('notes'), h('h4', {}, 'No personal notes yet'), h('p', {}, 'Markdown supported — headings, code, tables, lists. Will only ever be visible on this browser.')));
  }
  return h('div', {}, banner,
    h('div', { class: 'list' },
      ...my.map(n => h('div', { class: 'note-row', onclick: () => navigate(`#/notes/${n.id}`) },
        h('div', {},
          h('h4', {}, n.pinned ? '📌 ' : '', n.title),
          h('div', { class: 'note-row__meta' }, ...(n.tags || []).slice(0, 4).map(t => h('span', { class: 'chip' }, '#' + t))),
          h('div', { class: 'note-row__preview' }, (n.body || '').replace(/[#>*`]/g, '').slice(0, 150)),
        ),
      )),
    ),
  );
}

function aboutSubject(s) {
  return h('div', { class: 'grid grid--2' },
    h('div', { class: 'card' },
      h('h4', { style: { margin: '0 0 8px', fontFamily: 'Space Grotesk' } }, 'About'),
      h('p', { style: { color: 'var(--muted)', margin: 0 } }, s.blurb),
    ),
    h('div', { class: 'card' },
      h('h4', { style: { margin: '0 0 8px', fontFamily: 'Space Grotesk' } }, 'Details'),
      h('table', { style: { width: '100%', fontSize: 13.5 } },
        h('tbody', {},
          row('Course code', s.id),
          row('Semester',    SEM_LABEL[s.sem-1]),
          row('Category',    `${CATEGORY_META[s.category].label} (${s.category})`),
          row('Type',        s.type),
          row('Credits',     String(s.credits)),
        ),
      ),
    ),
  );
}
function row(k, v) {
  return h('tr', {},
    h('td', { style: { padding: '4px 8px', color: 'var(--muted)', width: 140 } }, k),
    h('td', { style: { padding: '4px 8px', fontWeight: 600 } }, v),
  );
}
