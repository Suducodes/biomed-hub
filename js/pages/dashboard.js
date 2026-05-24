import { h, mount, icon } from '../ui.js';
import { YEARS, SUBJECTS, SEM_LABEL, CATEGORY_META } from '../data.js';
import { store, loadManifest, getManifest } from '../storage.js';
import { navigate } from '../router.js';

export async function renderDashboard() {
  await loadManifest();
  const m = getManifest();
  const cloudNotes  = Object.values(m.subjects || {}).reduce((s, b) => s + (b.notes  || []).length, 0);
  const cloudPapers = Object.values(m.subjects || {}).reduce((s, b) => s + (b.papers || []).length, 0);
  const localNotes  = store.notes().length;
  const u = store.user();

  const hero = h('section', { class: 'hero' },
    h('div', { class: 'hero__eyebrow' }, 'BioMed Hub · B.E. Biomedical Engineering · R2021'),
    h('h2', { html: 'A <span class="accent">digital library</span> built for biomed students.' }),
    h('p', {}, 'Curated notes, every past paper and a toolbox for the syllabus — all in one place, free, and shared by the batch.'),
    h('div', { class: 'hero__actions' },
      h('button', { class: 'btn btn--primary', onclick: () => navigate('#/curriculum') }, icon('subjects'), 'Browse curriculum'),
      h('button', { class: 'btn btn--ghost',   onclick: () => navigate('#/notes/new') },  icon('plus'),     'Add a private note'),
      h('button', { class: 'btn btn--ghost',   onclick: () => navigate('#/pomodoro') },   icon('pomo'),     'Focus timer'),
    ),
  );

  const stats = h('div', { class: 'grid grid--4', style: { marginTop: 22 } },
    stat('subjects', SUBJECTS.length, 'Subjects (R2021)'),
    stat('notes',    cloudNotes,      'Curated notes'),
    stat('papers',   cloudPapers,     'Past papers'),
    stat('flame',    u.streak + 'd',  'Your streak'),
  );

  // Year cards (entry into curriculum)
  const yearGrid = h('div', { class: 'grid grid--2' },
    ...YEARS.map(y => h('div', { class: 'year-card', onclick: () => navigate(`#/curriculum/year/${y.y}`) },
      h('div', { class: 'year-card__num' }, String(y.y)),
      h('div', { style: { flex: 1 } },
        h('h3', {}, y.label, h('span', { class: 'year-card__sub' }, ` · Sem ${y.sems.map(s => SEM_LABEL[s-1]).join(' & ')}`)),
        h('p', {}, y.blurb),
      ),
    )),
  );

  // Recently uploaded admin items (across all subjects)
  const recent = recentLibraryItems(m, 5);

  // Welcome card if user is fresh
  const welcomeCard = (localNotes === 0 && u.xp === 0)
    ? h('div', { class: 'card', style: { marginTop: 22, background: 'linear-gradient(135deg, rgba(167,139,250,0.10), rgba(34,211,238,0.06))', borderColor: 'rgba(167,139,250,0.25)' } },
        h('h3', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'First time here?'),
        h('p', { style: { margin: 0, color: 'var(--muted)' } }, 'Notes you write live in YOUR browser only. Open any subject from the curriculum to see batch-curated PDFs and add your own private notes alongside.'),
      )
    : null;

  mount('#view',
    hero,
    stats,
    welcomeCard,
    sectionTitle('Jump into your year', () => navigate('#/curriculum')),
    yearGrid,
    h('div', { class: 'grid grid--2', style: { marginTop: 20 } },
      h('div', {},
        sectionTitle('Recently added to library'),
        recent.length === 0
          ? h('div', { class: 'empty' }, h('h4', {}, 'Library is empty'), h('p', {}, 'The admin will upload notes & papers — they will appear here.'))
          : h('div', { class: 'list' }, ...recent.map(libRow)),
      ),
      h('div', {},
        sectionTitle('Useful tools'),
        h('div', { class: 'grid grid--2' },
          toolTile('ecg',    'ECG Lab',     'Live waveform sim'),
          toolTile('calc',   'Calculators', 'BMI · MAP · CMRR · …'),
          toolTile('flash',  'Flashcards',  'Spaced repetition'),
          toolTile('buddy',  'Study Buddy', 'Syllabus search'),
        ),
      ),
    ),
  );
}

function sectionTitle(title, more) {
  const el = h('div', { class: 'section-title' }, h('h3', {}, title));
  if (more) el.appendChild(h('span', { class: 'more', onclick: more }, 'See all →'));
  return el;
}
function stat(iconName, val, label) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon' }, icon(iconName)),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, label)),
  );
}
function toolTile(iconName, title, sub) {
  const map = { ecg: '#/ecg', calc: '#/calc', flash: '#/flashcards', buddy: '#/buddy' };
  return h('div', { class: 'tool-tile', onclick: () => navigate(map[iconName] || '#/') },
    h('div', { class: 'tool-tile__icon' }, icon(iconName)),
    h('div', {}, h('h5', {}, title), h('p', {}, sub)),
  );
}
function recentLibraryItems(m, n) {
  const out = [];
  Object.entries(m.subjects || {}).forEach(([sid, b]) => {
    (b.notes  || []).forEach(it => out.push({ ...it, sid, kind: 'note' }));
    (b.papers || []).forEach(it => out.push({ ...it, sid, kind: 'paper' }));
  });
  out.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
  return out.slice(0, n);
}
function libRow(it) {
  const subj = SUBJECTS.find(s => s.id === it.sid);
  const meta = CATEGORY_META[subj?.category || 'PCC'];
  return h('a', { class: 'note-row', href: it.file, target: '_blank', rel: 'noopener', style: { textDecoration: 'none' } },
    h('div', {},
      h('h4', {}, it.title),
      h('div', { class: 'note-row__meta' },
        subj && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, subj.id),
        h('span', { class: 'chip' }, it.kind === 'paper' ? `Paper · ${it.year || ''}` : 'Note'),
        it.addedAt && h('span', { class: 'chip' }, it.addedAt),
      ),
    ),
    h('div', { class: 'note-row__right' }, icon('download')),
  );
}
