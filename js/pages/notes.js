import { h, mount, icon, modal } from '../ui.js?v=7cbd43e';
import { SUBJECTS, CATEGORY_META, subjectById } from '../data.js?v=7cbd43e';
import { store, uid, toast, awardXP, touchStreak } from '../storage.js?v=7cbd43e';
import { renderMD } from '../md.js?v=7cbd43e';
import { navigate } from '../router.js?v=7cbd43e';

// "My Notes" — personal markdown notes stored locally in the student's browser.

export function renderNotes() {
  let q = '', subjectFilter = '', sort = 'recent';

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'My <span class="accent">Notes</span>' }),
      h('p', {}, 'Your private markdown notes — saved in your browser only. Not synced.'),
    ),
    h('div', { class: 'page-head__actions' },
      h('button', { class: 'btn btn--primary', onclick: () => navigate('#/notes/new') }, icon('plus'), 'New note'),
    ),
  );

  const search = h('input', { class: 'input', placeholder: 'Search title, tag, content…', oninput: e => { q = e.target.value; render(); } });
  const subj = h('select', { class: 'select', onchange: e => { subjectFilter = e.target.value; render(); } },
    h('option', { value: '' }, 'All subjects'),
    ...SUBJECTS.map(s => h('option', { value: s.id }, `${s.id} · ${s.name}`)),
  );
  const sortSel = h('select', { class: 'select', onchange: e => { sort = e.target.value; render(); } },
    h('option', { value: 'recent' }, 'Most recent'),
    h('option', { value: 'pinned' }, 'Pinned first'),
    h('option', { value: 'az' }, 'A → Z'),
  );

  const toolbar = h('div', { class: 'toolbar' }, search, subj, sortSel);
  const list = h('div', { class: 'list' });

  function render() {
    const all = store.notes();
    let filtered = all.filter(n => {
      if (subjectFilter && n.subjectId !== subjectFilter) return false;
      if (q) {
        const t = (n.title + ' ' + (n.body || '') + ' ' + (n.tags || []).join(' ')).toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    if (sort === 'recent') filtered.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === 'az')     filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'pinned') filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);

    list.innerHTML = '';
    if (filtered.length === 0) {
      list.appendChild(h('div', { class: 'empty' },
        icon('notes'),
        h('h4', {}, 'No notes yet'),
        h('p', {}, 'Capture your first note — your future self will thank you.'),
        h('button', { class: 'btn btn--primary', style: { marginTop: 10 }, onclick: () => navigate('#/notes/new') }, 'New note'),
      ));
      return;
    }
    filtered.forEach(n => list.appendChild(noteRow(n, render)));
  }

  mount('#view', head, toolbar, list);
  render();
}

function noteRow(n, refresh) {
  const s = subjectById(n.subjectId);
  const meta = s ? CATEGORY_META[s.category] : null;
  return h('div', { class: 'note-row', onclick: (e) => { if (e.target.closest('button')) return; navigate(`#/notes/${n.id}`); } },
    h('div', {},
      h('h4', {}, n.pinned ? '📌 ' : '', n.title),
      h('div', { class: 'note-row__meta' },
        s && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
        ...(n.tags || []).slice(0, 4).map(t => h('span', { class: 'chip' }, '#' + t)),
      ),
      h('div', { class: 'note-row__preview' }, (n.body || '').replace(/[#>*`]/g, '').slice(0, 160)),
    ),
    h('div', { class: 'note-row__right' },
      h('button', { class: 'icon-btn', title: 'Edit', onclick: (e) => { e.stopPropagation(); navigate(`#/notes/${n.id}/edit`); } }, icon('edit')),
      h('button', { class: 'icon-btn', title: 'Delete', onclick: (e) => { e.stopPropagation(); confirmDelete(n, refresh); } }, icon('trash')),
    ),
  );
}

function confirmDelete(n, refresh) {
  modal({
    title: 'Delete note?',
    body: h('p', { style: { color: 'var(--muted)' } }, `"${n.title}" will be removed. This cannot be undone.`),
    actions: [
      { label: 'Cancel', class: 'btn--ghost' },
      { label: 'Delete', class: 'btn--danger', onClick: () => {
        const notes = store.notes().filter(x => x.id !== n.id);
        store.set('notes', notes);
        toast('Note deleted');
        refresh?.();
      }},
    ],
  });
}

// --- Editor ---------------------------------------------------------
export function renderNoteEditor({ id }) {
  let note;
  if (id === 'new') {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    note = {
      id: uid(),
      title: '',
      subjectId: params.get('subject') || SUBJECTS[0].id,
      tags: [],
      body: '# New note\n\nStart writing…',
      author: store.user().name.split(' ')[0],
      createdAt: Date.now(),
      pinned: false,
      isNew: true,
    };
  } else {
    note = store.notes().find(n => n.id === id);
    if (!note) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Note not found')));
  }

  const titleI  = h('input', { class: 'input', placeholder: 'Title…', value: note.title });
  const subjSel = h('select', { class: 'select' },
    ...SUBJECTS.map(s => h('option', { value: s.id, selected: s.id === note.subjectId ? '' : null }, `${s.id} · ${s.name}`)),
  );
  const tagsI = h('input', { class: 'input', placeholder: 'tags, comma-separated', value: (note.tags || []).join(', ') });
  const bodyI = h('textarea', { class: 'textarea', placeholder: '# Heading\n\nMarkdown body…' });
  bodyI.value = note.body;
  const preview = h('div', { class: 'md' });

  function refreshPreview() { preview.innerHTML = renderMD(bodyI.value); }
  bodyI.addEventListener('input', refreshPreview);
  refreshPreview();

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: note.isNew ? 'New <span class="accent">note</span>' : 'Edit <span class="accent">note</span>' }),
      h('p', {}, 'Markdown — headings, code, tables, lists, blockquotes. Saved locally in your browser only.'),
    ),
    h('div', { class: 'page-head__actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/notes') }, 'Cancel'),
      h('button', { class: 'btn btn--primary', onclick: save }, icon('check'), 'Save'),
    ),
  );

  function save() {
    if (!titleI.value.trim()) { toast('Add a title', 'err'); return; }
    note.title = titleI.value.trim();
    note.subjectId = subjSel.value;
    note.tags = tagsI.value.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    note.body = bodyI.value;
    note.createdAt = note.isNew ? Date.now() : note.createdAt;
    delete note.isNew;

    const all = store.notes();
    const idx = all.findIndex(x => x.id === note.id);
    if (idx >= 0) all[idx] = note; else all.unshift(note);
    store.set('notes', all);
    awardXP(10, 'saved a note');
    touchStreak();
    toast('Saved · +10 XP');
    navigate(`#/notes/${note.id}`);
  }

  mount('#view',
    head,
    h('div', { class: 'card', style: { marginBottom: 16 } },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Title'), titleI),
      h('div', { class: 'field-row' },
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Subject'), subjSel),
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Tags'), tagsI),
      ),
    ),
    h('div', { class: 'editor-grid' },
      h('div', { class: 'editor__pane' }, h('h5', {}, 'Write'), bodyI),
      h('div', { class: 'editor__pane' }, h('h5', {}, 'Preview'), preview),
    ),
  );
}

// --- Read view ------------------------------------------------------
export function renderNoteView({ id }) {
  const note = store.notes().find(n => n.id === id);
  if (!note) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Note not found')));
  const s = subjectById(note.subjectId);
  const meta = s ? CATEGORY_META[s.category] : null;

  const bookmarks = store.bookmarks();
  const isBookmarked = bookmarks.includes(note.id);

  mount('#view',
    h('div', { class: 'page-head' },
      h('div', {},
        h('h1', {}, note.pinned ? '📌 ' : '', note.title),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 } },
          s && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, `${s.id} · ${s.name}`),
          ...(note.tags || []).map(t => h('span', { class: 'chip' }, '#' + t)),
        ),
      ),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => {
          const all = store.notes(); const x = all.find(n => n.id === note.id); x.pinned = !x.pinned;
          store.set('notes', all); toast(x.pinned ? 'Pinned' : 'Unpinned');
          renderNoteView({ id });
        } }, icon('pin'), note.pinned ? 'Unpin' : 'Pin'),
        h('button', { class: 'btn btn--ghost', onclick: () => {
          const b = store.bookmarks();
          const next = isBookmarked ? b.filter(x => x !== note.id) : [...b, note.id];
          store.set('bookmarks', next); toast(isBookmarked ? 'Bookmark removed' : 'Bookmarked');
          renderNoteView({ id });
        } }, icon('bookmark'), isBookmarked ? 'Bookmarked' : 'Bookmark'),
        h('button', { class: 'btn btn--primary', onclick: () => navigate(`#/notes/${id}/edit`) }, icon('edit'), 'Edit'),
      ),
    ),
    h('div', { class: 'card md', style: { padding: 24 }, html: renderMD(note.body) }),
  );
}
