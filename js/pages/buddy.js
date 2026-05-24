import { h, mount } from '../ui.js';
import { KB, SUBJECTS } from '../data.js';
import { store } from '../storage.js';

// A rule-based "Study Buddy". It scans a curated knowledge base, then any of
// the student's notes for keyword hits, and stitches an answer. Honest about
// what it is: a fast lookup, not a generative model.

const HISTORY_KEY = 'buddyHistory';
function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
function setHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-50))); }

export function renderBuddy() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Study</span> Buddy' }),
      h('p', {}, 'Ask anything from the syllabus. Pulls from a curated knowledge base and your own notes — no internet needed.'),
    ),
  );

  const log = h('div', { class: 'chat__log' });
  const input = h('input', { class: 'input', placeholder: 'Ask: "What is CMRR?" or "Explain Nyquist"…' });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  function bubble(text, who) {
    const b = h('div', { class: 'bubble bubble--' + who }, text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }

  function send() {
    const q = input.value.trim(); if (!q) return;
    input.value = '';
    bubble(q, 'you');
    const a = answer(q);
    setTimeout(() => bubble(a, 'bot'), 220);
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
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'How this works'),
      h('p', { style: { color: 'var(--muted)', margin: 0 } }, 'Keyword-matching against a curated syllabus knowledge base plus your local notes. Not a hallucinating model — what you get is sourced from data you can see and edit.'),
    ),
  );
}

function answer(q) {
  const ql = q.toLowerCase();

  for (const item of KB) {
    if (item.keys.some(k => ql.includes(k))) return '📘 ' + item.a;
  }

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

  return `I don't have an entry for that yet. Try a shorter keyword like "CMRR", "Nyquist", "MRI", "T1", "op-amp" — or jot a note on the topic and I'll learn from it.`;
}
