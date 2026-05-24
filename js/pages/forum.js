import { h, mount, icon } from '../ui.js';
import { SUBJECTS, CATEGORY_META, subjectById } from '../data.js';
import { store, uid, toast } from '../storage.js';
import { navigate } from '../router.js';

export function renderForum() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'Batch <span class="accent">Discussion</span>' }),
      h('p', {}, 'Ask, answer, upvote. Threads are stored locally on each device for now — see the deploy guide for a real shared backend.'),
    ),
    h('div', { class: 'page-head__actions' },
      h('button', { class: 'btn btn--primary', onclick: newThread }, icon('plus'), 'New thread'),
    ),
  );
  const list = h('div', { class: 'list' });
  function render() {
    list.innerHTML = '';
    const threads = store.threads().slice().sort((a, b) => b.votes - a.votes);
    if (!threads.length) {
      list.appendChild(h('div', { class: 'empty' }, icon('forum'), h('h4', {}, 'No threads yet'), h('p', {}, 'Be the first to start a discussion.')));
      return;
    }
    threads.forEach(t => {
      const s = subjectById(t.subjectId);
      const meta = s ? CATEGORY_META[s.category] : null;
      list.appendChild(h('div', { class: 'thread-row', onclick: () => navigate(`#/forum/${t.id}`) },
        h('div', { class: 'thread-row__avatar' }, t.author[0]),
        h('div', {},
          h('h5', {}, t.title),
          h('div', { class: 'preview' },
            s && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14', marginRight: 6 } }, s.id),
            (t.body || '').slice(0, 110), '…',
          ),
        ),
        h('div', { class: 'thread-row__stats' },
          h('span', {}, '▲ ' + t.votes),
          h('span', {}, '💬 ' + t.replies),
        ),
      ));
    });
  }
  function newThread() {
    const title = prompt('Thread title?'); if (!title) return;
    const body = prompt("What's on your mind?"); if (!body) return;
    const t = { id: 't' + uid(), title, body, subjectId: SUBJECTS[0].id, author: store.user().name.split(' ')[0], replies: 0, votes: 1, posts: [] };
    store.set('threads', [t, ...store.threads()]);
    toast('Thread posted');
    render();
  }
  mount('#view', head, list);
  render();
}

export function renderThread({ id }) {
  const t = store.threads().find(x => x.id === id);
  if (!t) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Thread not found')));
  const s = subjectById(t.subjectId);
  const meta = s ? CATEGORY_META[s.category] : null;
  if (!t.posts) t.posts = [];

  const replyInput = h('textarea', { class: 'textarea', placeholder: 'Write a reply…', style: { minHeight: 80 } });

  function postReply() {
    const text = replyInput.value.trim(); if (!text) return;
    t.posts.push({ id: uid(), author: store.user().name.split(' ')[0], text, ts: Date.now() });
    t.replies = t.posts.length;
    const all = store.threads();
    const idx = all.findIndex(x => x.id === t.id); all[idx] = t;
    store.set('threads', all);
    replyInput.value = ''; toast('Reply posted');
    renderThread({ id });
  }
  function upvote() { t.votes += 1; const all = store.threads(); const i = all.findIndex(x => x.id === t.id); all[i] = t; store.set('threads', all); renderThread({ id }); }

  mount('#view',
    h('div', { class: 'page-head' },
      h('div', {},
        h('h1', {}, t.title),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' } },
          s && h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, `${s.id} · ${s.name}`),
          h('span', { class: 'chip' }, 'by ' + t.author),
        ),
      ),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/forum') }, '← Back'),
        h('button', { class: 'btn btn--primary', onclick: upvote }, '▲ Upvote (' + t.votes + ')'),
      ),
    ),
    h('div', { class: 'card', style: { padding: 22 } }, h('p', { style: { margin: 0, lineHeight: 1.7 } }, t.body)),
    h('h3', { style: { fontFamily: 'Space Grotesk', marginTop: 22 } }, `Replies (${t.posts.length})`),
    ...t.posts.map(p => h('div', { class: 'card', style: { marginTop: 8 } },
      h('div', { style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 } },
        h('div', { class: 'thread-row__avatar' }, p.author[0]),
        h('div', { style: { fontWeight: 600 } }, p.author),
        h('div', { style: { color: 'var(--muted)', fontSize: 12 } }, new Date(p.ts).toLocaleString()),
      ),
      h('div', { style: { lineHeight: 1.6 } }, p.text),
    )),
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('label', { class: 'label' }, 'Your reply'),
      replyInput,
      h('div', { style: { textAlign: 'right', marginTop: 10 } },
        h('button', { class: 'btn btn--primary', onclick: postReply }, 'Reply')),
    ),
  );
}
