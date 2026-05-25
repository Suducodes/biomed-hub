import { h, mount, icon } from '../ui.js?v=94729f9';
import { YEARS, SUBJECTS, SEM_LABEL, CATEGORY_META, KB, STARTER_FLASHCARDS } from '../data.js?v=94729f9';
import { store, loadManifest, getManifest, todayISO } from '../storage.js?v=94729f9';
import { navigate } from '../router.js?v=94729f9';

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
    dailyChallengeCard(),
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
// --- Daily challenge: deterministic by date so the whole batch gets the same item ---
function dailyChallengeCard() {
  const items = [
    ...KB.map(k => ({ kind: 'kb', q: k.keys[0].toUpperCase() + '? — quick recall', a: k.a })),
    ...STARTER_FLASHCARDS.map(f => ({ kind: 'card', q: f.front, a: f.back })),
  ];
  const seed = todayISO().split('-').join('') | 0;
  const idx = Math.abs(seed) % items.length;
  const today = items[idx];
  const seenKey = 'biomedhub:v2:dcSeen:' + todayISO();
  const seen = localStorage.getItem(seenKey) === '1';

  const ans = h('div', { class: 'daily__answer', style: { display: seen ? 'block' : 'none' } }, today.a);
  const btn = h('button', { class: 'btn btn--primary btn--sm', onclick: () => {
    ans.style.display = 'block';
    localStorage.setItem(seenKey, '1');
    btn.style.display = 'none';
  } }, 'Reveal');
  if (seen) btn.style.display = 'none';

  return h('div', { class: 'daily', style: { marginTop: 18 } },
    h('div', { class: 'daily__eyebrow' }, '🌅  Daily Challenge · ' + new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })),
    h('div', { class: 'daily__q' }, today.q),
    h('div', { class: 'daily__actions' }, btn, h('span', { class: 'daily__hint' }, 'New question every day. Try to answer it in your head first.')),
    ans,
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
