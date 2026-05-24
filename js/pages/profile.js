import { h, mount, icon } from '../ui.js';
import { store, toast } from '../storage.js';

const BADGES = [
  { id: 'first-note',  em: '📓', lbl: 'Scribe',         pts: 'Save your first note' },
  { id: 'pomodoro-1',  em: '🍅', lbl: 'Pomodoro Rookie',pts: '1 focus session' },
  { id: 'pomodoro-10', em: '🚀', lbl: 'Focus Master',   pts: '10 focus sessions' },
  { id: 'streak-7',    em: '🔥', lbl: 'Week Warrior',   pts: '7-day streak' },
  { id: 'srs-50',      em: '🧠', lbl: 'Drill Sergeant', pts: '50 cards reviewed' },
  { id: 'sharer-3',    em: '🌐', lbl: 'Community',      pts: '3 forum posts' },
  { id: 'paper-tiger', em: '🐅', lbl: 'Paper Tiger',    pts: 'Browse all PYQs' },
  { id: 'omni',        em: '🌟', lbl: 'Omni-Scholar',   pts: 'Try every section' },
];

export function renderProfile() {
  const u = store.user();
  const pomo = store.pomoStats();
  const notes = store.notes().length;
  const xpPerLevel = 500;
  const level = Math.floor(u.xp / xpPerLevel) + 1;
  const inLevel = u.xp % xpPerLevel;
  const initials = u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const left = h('div', { class: 'profile-card' },
    h('div', { class: 'profile-avatar' }, initials),
    h('div', { class: 'profile-name' }, u.name),
    h('div', { class: 'profile-handle' }, u.handle),
    h('div', { style: { marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' } },
      h('span', { class: 'chip chip--cyan' }, u.branch),
      h('span', { class: 'chip chip--violet' }, 'Sem ' + u.semester),
    ),
    h('div', { style: { marginTop: 18, fontSize: 12, color: 'var(--muted)' } }, 'Level ' + level + ' · ' + u.xp + ' XP'),
    h('div', { class: 'xp-bar' }, h('div', { style: { width: (inLevel / xpPerLevel * 100) + '%' } })),
    h('div', { style: { fontSize: 11, color: 'var(--muted)' } }, `${xpPerLevel - inLevel} XP to level ${level + 1}`),

    h('button', { class: 'btn btn--ghost', style: { marginTop: 16, width: '100%' }, onclick: rename }, 'Edit name'),
  );

  const right = h('div', {},
    h('div', { class: 'grid grid--3' },
      stat('🔥', u.streak + 'd', 'Current streak'),
      stat('📚', notes,           'Notes written'),
      stat('🎯', pomo.sessions,   'Pomodoros'),
    ),
    h('h3', { style: { fontFamily: 'Space Grotesk', marginTop: 22 } }, 'Achievements'),
    h('div', { class: 'badges' },
      ...BADGES.map(b => h('div', { class: 'badge' + (u.achievements.includes(b.id) ? '' : ' locked') },
        h('div', { class: 'em' }, b.em),
        h('div', { class: 'lbl' }, b.lbl),
        h('div', { class: 'pts' }, b.pts),
      )),
    ),
    h('h3', { style: { fontFamily: 'Space Grotesk', marginTop: 22 } }, 'Danger zone'),
    h('div', { class: 'card', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h('div', {},
        h('div', { style: { fontWeight: 600 } }, 'Reset local data'),
        h('div', { style: { color: 'var(--muted)', fontSize: 12 } }, 'Wipes notes, threads, flashcards, stats — and reloads.'),
      ),
      h('button', { class: 'btn btn--danger', onclick: () => {
        if (!confirm('Wipe all local data?')) return;
        Object.keys(localStorage).filter(k => k.startsWith('biomedhub:')).forEach(k => localStorage.removeItem(k));
        toast('Reset'); location.reload();
      }}, 'Reset'),
    ),
  );

  function rename() {
    const name = prompt('Your name?', u.name); if (!name) return;
    u.name = name; store.set('user', u);
    toast('Saved'); renderProfile();
  }

  mount('#view',
    h('div', { class: 'page-head' },
      h('div', {},
        h('h1', { html: 'Your <span class="accent">Profile</span>' }),
        h('p', {}, 'Track your progress, badges and stats over time.'),
      ),
    ),
    h('div', { class: 'profile-grid' }, left, right),
  );
}

function stat(em, val, lbl) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon', style: { fontSize: 22, background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.25)', color: '#a78bfa' } }, em),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}
