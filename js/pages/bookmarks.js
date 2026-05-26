import { h, mount, icon } from '../ui.js?v=5f017ca';
import { CATEGORY_META, subjectById } from '../data.js?v=5f017ca';
import { store, toast } from '../storage.js?v=5f017ca';
import { navigate } from '../router.js?v=5f017ca';

export function renderBookmarks() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'Your <span class="accent">Bookmarks</span>' }),
      h('p', {}, 'Notes you saved for the next pass. Quick recall, zero friction.'),
    ),
  );
  const ids = store.bookmarks();
  const notes = store.notes().filter(n => ids.includes(n.id));
  if (notes.length === 0) {
    return mount('#view', head, h('div', { class: 'empty' }, icon('bookmark'), h('h4', {}, 'No bookmarks yet'), h('p', {}, 'Open any of your notes and click Bookmark.')));
  }
  mount('#view', head,
    h('div', { class: 'list' },
      ...notes.map(n => {
        const s = subjectById(n.subjectId);
        const meta = s ? CATEGORY_META[s.category] : null;
        return h('div', { class: 'note-row', onclick: () => navigate(`#/notes/${n.id}`) },
          h('div', {},
            h('h4', {}, n.title),
            h('div', { class: 'note-row__meta' },
              s && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
              ...(n.tags || []).slice(0, 3).map(t => h('span', { class: 'chip' }, '#' + t)),
            ),
          ),
          h('div', { class: 'note-row__right' },
            h('button', { class: 'icon-btn', title: 'Remove', onclick: (e) => {
              e.stopPropagation();
              store.set('bookmarks', ids.filter(x => x !== n.id));
              toast('Bookmark removed'); renderBookmarks();
            }}, icon('trash')),
          ),
        );
      }),
    ),
  );
}
