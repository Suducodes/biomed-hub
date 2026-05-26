import { h, mount } from '../ui.js?v=5f017ca';
import { KB, SUBJECTS } from '../data.js?v=5f017ca';
import { store } from '../storage.js?v=5f017ca';

// Study Buddy — purely client-side keyword search over a curated syllabus
// knowledge base AND each student's own notes. No external API, no tokens, no
// account, no cost. For deeper, document-grounded chat we provide one-click
// links to free third-party assistants (NotebookLM, ChatGPT, Claude) that
// students sign into with their own accounts.

const HISTORY_KEY = 'buddyHistory';
function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
function setHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-50))); }

export function renderBuddy() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Study</span> Buddy' }),
      h('p', {}, 'Ask anything across the R2021 syllabus and your own notes. Runs entirely in your browser — no internet roundtrip, no API tokens, zero cost.'),
    ),
  );

  const log = h('div', { class: 'chat__log' });
  const input = h('input', { class: 'input', placeholder: 'Ask: "What is CMRR?" or "Explain Nyquist"…' });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  function bubble(text, who) {
    const b = h('div', { class: 'bubble bubble--' + who }, text);
    log.appendChild(b); log.scrollTop = log.scrollHeight;
  }

  function send() {
    const q = input.value.trim(); if (!q) return;
    input.value = ''; bubble(q, 'you');
    const a = answer(q);
    setTimeout(() => bubble(a, 'bot'), 200);
    const hist = getHistory(); hist.push({ q, a, ts: Date.now() }); setHistory(hist);
  }

  const hist = getHistory();
  if (hist.length === 0) {
    bubble('Hi! I can look things up across the BioMed Hub syllabus and your notes. Try asking about CMRR, MRI relaxation, Pan-Tompkins, op-amps, or Nyquist sampling.', 'bot');
  } else {
    hist.slice(-10).forEach(({ q, a }) => { bubble(q, 'you'); bubble(a, 'bot'); });
  }

  mount('#view', head,
    h('div', { class: 'chat' },
      log,
      h('form', { class: 'chat__form', onsubmit: (e) => { e.preventDefault(); send(); } },
        input,
        h('button', { class: 'btn btn--primary', type: 'submit' }, 'Ask'),
      ),
    ),

    // --- Honesty card ---
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'How this works'),
      h('p', { style: { color: 'var(--muted)', margin: '0 0 8px', fontSize: 13.5 } },
        'Keyword-matching against a curated knowledge base plus your local notes. ',
        h('b', {}, 'It does not call any AI provider'), ' — there are no tokens, no API key, no cost ever, and nothing leaves your browser. ',
        'For document-grounded conversation (chatting with a specific PDF), use the assistants below.'),
    ),

    // --- External AI assistants ---
    h('h3', { style: { fontFamily: 'Space Grotesk', marginTop: 22, marginBottom: 10 } }, 'Deeper PDF chat — free third-party assistants'),
    h('p', { style: { color: 'var(--muted)', margin: '0 0 14px', fontSize: 13.5 } },
      'Each student signs in with their own free Google / OpenAI / Anthropic account. The Hub never sees or pays for the conversation.'),
    h('div', { class: 'grid grid--3' },
      assistantCard({
        name: 'Google NotebookLM',
        tag: 'Best for PDFs',
        desc: 'Upload any notes PDF — NotebookLM answers from it with citations to the exact page. Free with a Google account.',
        href: 'https://notebooklm.google.com/',
        accent: '#34d399',
        steps: ['Open NotebookLM', 'New notebook → Add source → upload the PDF', 'Ask any question — answers cite the page'],
      }),
      assistantCard({
        name: 'ChatGPT',
        tag: 'Free tier · PDF upload',
        desc: 'Paste a PDF or its text into ChatGPT for explanation, summaries, mock-MCQs.',
        href: 'https://chat.openai.com/',
        accent: '#22d3ee',
        steps: ['Open ChatGPT', 'Attach the PDF (paperclip)', 'Prompt: "Summarise + give 5 MCQs"'],
      }),
      assistantCard({
        name: 'Claude',
        tag: 'Free tier · long PDFs',
        desc: 'Anthropic\'s assistant — particularly good at long documents and structured study guides.',
        href: 'https://claude.ai/',
        accent: '#a78bfa',
        steps: ['Open Claude', 'Drop the PDF in the chat', 'Ask: "Make a 1-page revision sheet"'],
      }),
    ),
  );
}

function assistantCard({ name, tag, desc, href, accent, steps }) {
  return h('div', { class: 'cl-card', style: { '--accent': accent } },
    h('div', { class: 'cl-card__band' }),
    h('div', { class: 'cl-card__head' },
      h('div', { class: 'cl-card__num', style: { background: accent, fontSize: 18 } }, name[0]),
      h('div', { class: 'cl-card__title' },
        h('h4', {}, name),
        h('div', { class: 'cl-card__sub' }, tag),
      ),
    ),
    h('div', { style: { padding: '0 18px 12px' } },
      h('p', { style: { color: 'var(--muted)', fontSize: 13, margin: '0 0 10px' } }, desc),
      h('ol', { style: { color: 'var(--muted)', fontSize: 12.5, paddingLeft: 18, margin: '0 0 12px' } },
        ...steps.map(s => h('li', { style: { margin: '3px 0' } }, s)),
      ),
      h('a', { class: 'btn btn--primary btn--sm', href, target: '_blank', rel: 'noopener', style: { width: '100%', justifyContent: 'center' } },
        'Open ' + name, ' →'),
    ),
  );
}

function answer(q) {
  const ql = q.toLowerCase();
  for (const item of KB) if (item.keys.some(k => ql.includes(k))) return '📘 ' + item.a;
  for (const s of SUBJECTS) {
    if (ql.includes(s.id.toLowerCase()) || ql.includes(s.name.toLowerCase())) {
      return `📚 ${s.name} (${s.id}, Sem ${s.sem}) — ${s.blurb}`;
    }
  }
  const hits = store.notes().filter(n => {
    const t = (n.title + ' ' + (n.body || '') + ' ' + (n.tags || []).join(' ')).toLowerCase();
    return t.includes(ql);
  });
  if (hits.length) {
    const top = hits[0];
    return `📝 Found in your note "${top.title}":\n\n${top.body.split('\n').slice(0, 12).join('\n')}`;
  }
  return `I don't have an entry for that yet. Try a shorter keyword like "CMRR", "Nyquist", "MRI", "T1", "op-amp" — or for a deep dive, open the PDF in NotebookLM (see below).`;
}
