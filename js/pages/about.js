import { h, mount, icon } from '../ui.js?v=5f017ca';

// About the Author — Sudarshan.
// Kept tasteful: one screen, the story, the why, and a contact strip.

export function renderAbout() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'About the <span class="accent">Author</span>' }),
      h('p', {}, 'Why BioMed Hub exists, and who is behind it.'),
    ),
  );

  const card = h('div', { class: 'author-hero' },
    h('div', { class: 'author-avatar' }, 'S'),
    h('div', {},
      h('div', { class: 'author-name' }, 'Sudarshan'),
      h('div', { class: 'author-role' }, 'B.E. Biomedical Engineering · KPR Institute, Coimbatore'),
      h('div', { style: { marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' } },
        h('a', { class: 'btn btn--ghost btn--sm', href: 'https://github.com/Suducodes', target: '_blank', rel: 'noopener' }, '⌥ GitHub'),
        h('a', { class: 'btn btn--ghost btn--sm', href: 'mailto:hello@example.com' }, '✉ Email'),
        h('a', { class: 'btn btn--ghost btn--sm', href: '#/admin' }, '🔐 Admin'),
      ),
    ),
  );

  const story = h('div', { class: 'grid grid--2', style: { marginTop: 20 } },
    h('div', { class: 'card' },
      h('h3', { style: { margin: '0 0 8px', fontFamily: 'Space Grotesk' } }, 'The story'),
      h('p', { style: { color: 'var(--muted)', margin: 0, lineHeight: 1.7 } },
        'Studying biomedical engineering means juggling anatomy textbooks, instrumentation lab manuals, signal processing math and clinical observations — usually scattered across WhatsApp PDFs, dusty drives, and a senior\'s pen-drive. BioMed Hub is the version of that life I wished existed in my first year: one place, well organised, fast on phone, free, and built by a student for students.'),
    ),
    h('div', { class: 'card' },
      h('h3', { style: { margin: '0 0 8px', fontFamily: 'Space Grotesk' } }, 'What I believe'),
      h('ul', { style: { color: 'var(--muted)', margin: 0, paddingLeft: 18, lineHeight: 1.7 } },
        h('li', {}, 'Notes are 10× more useful when they\'re a click away from past papers.'),
        h('li', {}, 'A student\'s personal scratchpad should be private by default.'),
        h('li', {}, 'No login walls. No ads. No surveillance. Free is sustainable when the architecture is right.'),
        h('li', {}, 'Tools beat textbooks: a tiny ECG simulator teaches more than three pages of theory.'),
      ),
    ),
  );

  const tech = h('div', { class: 'card', style: { marginTop: 16 } },
    h('h3', { style: { margin: '0 0 12px', fontFamily: 'Space Grotesk' } }, 'Tech behind the scenes'),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
      ...[
        'Vanilla HTML/CSS/JS · zero build step',
        'ES modules · no bundler',
        'localStorage · zero backend cost',
        'GitHub Pages · free hosting',
        'GitHub Actions · auto-builds the library manifest',
        'GitHub REST API · drag-drop uploads from /admin',
        'Canvas · ECG / rhythm trainer / whiteboard',
        'SVG · concept maps',
      ].map(t => h('span', { class: 'chip chip--cyan' }, t)),
    ),
    h('p', { style: { color: 'var(--muted)', marginTop: 12, fontSize: 13, lineHeight: 1.7 } },
      'Total moving parts: 1 static site, 1 GitHub repo, 0 servers, 0 databases. The whole thing fits in your browser tab and a folder of PDFs.'),
  );

  const credits = h('div', { class: 'card', style: { marginTop: 16, background: 'linear-gradient(135deg, rgba(167,139,250,0.10), rgba(34,211,238,0.05))' } },
    h('h3', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'A thank-you'),
    h('p', { style: { color: 'var(--muted)', margin: 0, lineHeight: 1.7 } },
      'To every senior who scanned their notes and shared them, every batchmate who proof-read a unit, and the open-source community whose work shows up in every line of code here. ❤'),
  );

  mount('#view', head, card, story, tech, credits);
}
