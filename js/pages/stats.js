import { h, mount, icon } from '../ui.js?v=960a27c';
import { SUBJECTS, SEM_LABEL, CATEGORY_META, YEARS } from '../data.js?v=960a27c';
import { store, loadManifest, getManifest } from '../storage.js?v=960a27c';
import { navigate } from '../router.js?v=960a27c';

// Library-wide statistics. Everything here is derived from the live
// manifest.json + each visitor's local activity, so the numbers are real
// without needing a database.
//
// For real cross-user download counts, plug Cloudflare Web Analytics into
// index.html (see DEPLOY.md → Analytics). The hook is invisible to students.

export async function renderStats() {
  await loadManifest();
  const m = getManifest();

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Library</span> stats' }),
      h('p', {}, 'How the shared library is filling up — and a snapshot of your own progress. Shared numbers update live as the admin uploads new content.'),
    ),
  );

  // ---------- global counts ----------
  let cloudNotes = 0, cloudPapers = 0, cloudSyll = 0;
  const subjectsWithContent = new Set();
  const items = [];
  Object.entries(m.subjects || {}).forEach(([sid, b]) => {
    cloudNotes += (b.notes || []).length;
    cloudPapers += (b.papers || []).length;
    if (b.syllabus) cloudSyll++;
    if ((b.notes || []).length || (b.papers || []).length || b.syllabus) subjectsWithContent.add(sid);
    (b.notes  || []).forEach(it => items.push({ ...it, sid, kind: 'note' }));
    (b.papers || []).forEach(it => items.push({ ...it, sid, kind: 'paper' }));
  });

  const topStats = h('div', { class: 'grid grid--4', style: { marginBottom: 22 } },
    stat('📘', cloudNotes,                                            'Curated notes'),
    stat('📄', cloudPapers,                                           'Past papers'),
    stat('🖼', cloudSyll,                                             'Syllabus images'),
    stat('📚', `${subjectsWithContent.size} / ${SUBJECTS.length}`,    'Subjects covered'),
  );

  // ---------- per-semester completion bars ----------
  const semSection = h('div', { class: 'card' },
    h('h3', { style: { margin: '0 0 14px', fontFamily: 'Space Grotesk' } }, 'Completion by semester'),
    ...SEM_LABEL.map((sl, i) => {
      const sem = i + 1;
      const subj = SUBJECTS.filter(s => s.sem === sem);
      const covered = subj.filter(s => subjectsWithContent.has(s.id)).length;
      const pct = subj.length ? Math.round((covered / subj.length) * 100) : 0;
      return h('div', { class: 'sem-bar', onclick: () => navigate(`#/curriculum/sem/${sem}`) },
        h('div', { class: 'sem-bar__lbl' }, `Sem ${sl}`),
        h('div', { class: 'sem-bar__track' }, h('div', { class: 'sem-bar__fill', style: { width: pct + '%' } })),
        h('div', { class: 'sem-bar__pct' }, `${covered} / ${subj.length} subjects`),
      );
    }),
  );

  // ---------- recently added ----------
  items.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
  const recent = items.slice(0, 8);
  const recentSection = h('div', { class: 'card' },
    h('h3', { style: { margin: '0 0 14px', fontFamily: 'Space Grotesk' } }, 'Recently added to library'),
    recent.length === 0
      ? h('div', { style: { color: 'var(--muted)', fontSize: 13 } }, 'Library is empty — drop your first PDF into the repo and the GitHub Action will fill this in.')
      : h('div', { class: 'list' }, ...recent.map(it => recentRow(it))),
  );

  // ---------- subjects awaiting content ----------
  const waiting = SUBJECTS.filter(s => !subjectsWithContent.has(s.id) && ['PCC', 'ESC', 'BSC', 'HSMC'].includes(s.category)).slice(0, 8);
  const waitingSection = h('div', { class: 'card' },
    h('h3', { style: { margin: '0 0 14px', fontFamily: 'Space Grotesk' } }, 'Subjects awaiting content'),
    waiting.length === 0
      ? h('div', { style: { color: 'var(--muted)', fontSize: 13 } }, '🎉 Every subject has at least one item — beautiful.')
      : h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          ...waiting.map(s => {
            const meta = CATEGORY_META[s.category];
            return h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14', cursor: 'pointer' }, onclick: () => navigate(`#/subject/${s.id}`) },
              `${s.id} · ${s.name}`);
          }),
        ),
  );

  // ---------- personal corner ----------
  const u = store.user();
  const pomo = store.pomoStats();
  const personal = h('div', { class: 'card', style: { background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(167,139,250,0.04))' } },
    h('h3', { style: { margin: '0 0 12px', fontFamily: 'Space Grotesk' } }, 'Your activity (this browser only)'),
    h('p', { style: { color: 'var(--muted)', fontSize: 12.5, margin: '0 0 12px' } },
      'Each student has their own private notes, streak and flashcard progress — nothing leaves your device. Open on another browser or phone and you get a fresh slate.'),
    h('div', { class: 'grid grid--4' },
      mini('🔥', `${u.streak}d`,                'Streak'),
      mini('📝', store.notes().length,          'My notes'),
      mini('🎯', pomo.sessions,                 'Focus sessions'),
      mini('⭐', u.xp,                          'XP'),
    ),
  );

  mount('#view',
    head,
    topStats,
    semSection,
    h('div', { class: 'grid grid--2', style: { marginTop: 18 } }, recentSection, waitingSection),
    h('div', { style: { marginTop: 18 } }, personal),
  );
}

function stat(em, val, lbl) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon', style: { fontSize: 22, background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.25)', color: '#a78bfa' } }, em),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}
function mini(em, val, lbl) {
  return h('div', { class: 'stat', style: { padding: '12px' } },
    h('div', { class: 'stat__icon', style: { fontSize: 20, width: 36, height: 36, background: 'rgba(34,211,238,0.10)', borderColor: 'rgba(34,211,238,0.22)', color: '#22d3ee' } }, em),
    h('div', {}, h('div', { class: 'stat__val', style: { fontSize: 18 } }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}
function recentRow(it) {
  const subj = SUBJECTS.find(s => s.id === it.sid);
  const meta = CATEGORY_META[subj?.category || 'PCC'];
  return h('a', { class: 'note-row', href: it.file, target: '_blank', rel: 'noopener', style: { textDecoration: 'none' } },
    h('div', {},
      h('h4', {}, it.title),
      h('div', { class: 'note-row__meta' },
        subj && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, subj.id),
        h('span', { class: 'chip' }, it.kind === 'paper' ? `Paper · ${it.year || ''}` : (it.unit != null ? `Unit ${it.unit}` : 'Note')),
        it.addedAt && h('span', { class: 'chip' }, it.addedAt),
      ),
    ),
    h('div', { class: 'note-row__right' }, icon('download')),
  );
}
