import { h, mount, icon } from '../ui.js?v=94729f9';
import { SUBJECTS } from '../data.js?v=94729f9';
import { store, awardXP, touchStreak, toast } from '../storage.js?v=94729f9';

// Lightweight SM-2-ish spaced repetition.
// quality: 1 (again), 2 (hard), 3 (good), 4 (easy)
function updateSRS(card, srs, quality) {
  const now = Date.now();
  const s = srs[card.id] || { ease: 2.5, interval: 0, reps: 0 };
  if (quality < 3) { s.reps = 0; s.interval = 1; }
  else {
    s.reps += 1;
    if (s.reps === 1) s.interval = 1;
    else if (s.reps === 2) s.interval = 3;
    else s.interval = Math.round(s.interval * s.ease);
  }
  s.ease = Math.max(1.3, s.ease + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02)));
  s.due = now + s.interval * 86400000;
  srs[card.id] = s;
  return srs;
}

export function renderFlashcards() {
  let filterSubj = '';
  let queue = [];
  let i = 0;
  let flipped = false;

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Flashcards</span> · Spaced Repetition' }),
      h('p', {}, 'A scientific way to drill core concepts. The harder a card is, the more often it returns.'),
    ),
  );

  const subjSel = h('select', { class: 'select', onchange: e => { filterSubj = e.target.value; rebuild(); } },
    h('option', { value: '' }, 'All decks'),
    ...SUBJECTS.map(s => h('option', { value: s.id }, s.name)),
  );
  const toolbar = h('div', { class: 'toolbar' }, subjSel, h('div', { class: 'spacer' }), h('button', { class: 'btn btn--ghost', onclick: addCard }, icon('plus'), 'Add card'));

  const stage = h('div', { class: 'flash-stage' });

  function rebuild() {
    queue = store.flashcards().filter(c => !filterSubj || c.subjectId === filterSubj);
    const srs = store.srs();
    queue.sort((a, b) => (srs[a.id]?.due || 0) - (srs[b.id]?.due || 0));
    i = 0; flipped = false;
    render();
  }

  function render() {
    stage.innerHTML = '';
    if (queue.length === 0) {
      stage.appendChild(h('div', { class: 'empty' }, icon('flash'), h('h4', {}, 'No cards yet'), h('p', {}, 'Add your first flashcard.')));
      return;
    }
    if (i >= queue.length) {
      stage.appendChild(h('div', { class: 'card', style: { textAlign: 'center', padding: 40 } },
        h('div', { style: { fontSize: 36 } }, '🎉'),
        h('h3', { style: { fontFamily: 'Space Grotesk', margin: '10px 0 4px' } }, 'Deck complete'),
        h('p', { style: { color: 'var(--muted)' } }, 'You crushed the queue. Come back tomorrow.'),
        h('button', { class: 'btn btn--primary', style: { marginTop: 14 }, onclick: rebuild }, 'Restart')));
      return;
    }
    const c = queue[i];
    const s = SUBJECTS.find(x => x.id === c.subjectId);
    const card = h('div', { class: 'flash-card' + (flipped ? ' is-flipped' : ''), onclick: () => { flipped = !flipped; render(); } },
      h('div', { class: 'inner' },
        h('div', { class: 'face' }, c.front),
        h('div', { class: 'face face--back' }, c.back),
      ),
    );
    stage.appendChild(h('div', { class: 'flash-progress' }, `Card ${i + 1} / ${queue.length} · ${s?.code || ''}`));
    stage.appendChild(card);

    const actions = h('div', { class: 'flash-actions' });
    if (!flipped) {
      actions.appendChild(h('button', { class: 'btn btn--primary', onclick: () => { flipped = true; render(); } }, 'Reveal answer'));
    } else {
      [
        { lbl: 'Again',  q: 1, cls: 'btn--danger' },
        { lbl: 'Hard',   q: 2, cls: 'btn--ghost' },
        { lbl: 'Good',   q: 3, cls: 'btn--ghost' },
        { lbl: 'Easy',   q: 4, cls: 'btn--primary' },
      ].forEach(b => actions.appendChild(h('button', { class: `btn ${b.cls}`, onclick: () => grade(b.q) }, b.lbl)));
    }
    stage.appendChild(actions);
  }

  function grade(quality) {
    const c = queue[i];
    const srs = store.srs();
    store.set('srs', updateSRS(c, srs, quality));
    awardXP(quality >= 3 ? 5 : 2, 'reviewed a card');
    touchStreak();
    i += 1; flipped = false; render();
  }

  function addCard() {
    const front = prompt('Front of card?'); if (!front) return;
    const back  = prompt('Back of card?');  if (!back) return;
    const subjectId = filterSubj || SUBJECTS[0].id;
    const next = [...store.flashcards(), { id: 'c' + Date.now(), subjectId, front, back }];
    store.set('flashcards', next);
    toast('Card added');
    rebuild();
  }

  mount('#view', head, toolbar, stage);
  rebuild();
}
