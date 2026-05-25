// Persistence + global state.
// localStorage wrapper for student-side prefs, plus a cloud-manifest fetcher
// for everything the admin has uploaded (notes & papers).

import { STARTER_FLASHCARDS, STARTER_EVENTS } from './data.js';

const NS = 'biomedhub:v2';   // bumped after curriculum restructure
const k = (key) => `${NS}:${key}`;

function read(key, fallback) {
  try {
    const v = localStorage.getItem(k(key));
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(k(key), JSON.stringify(value)); } catch {}
}

export const store = {
  // Notes added BY STUDENTS (live in their browser only — privacy by default).
  notes:      () => read('notes', []),
  threads:    () => read('threads', []),
  flashcards: () => read('flashcards', STARTER_FLASHCARDS),
  events:     () => read('events', STARTER_EVENTS),
  bookmarks:  () => read('bookmarks', []),
  pomoStats:  () => read('pomoStats', { sessions: 0, minutes: 0, dates: {} }),
  user:       () => read('user', {
    name: 'Student',
    handle: '@biomed',
    branch: 'Biomedical Engineering',
    semester: 3,
    xp: 0,
    streak: 0,
    lastActive: todayISO(),
    achievements: [],
  }),
  srs:        () => read('srs', {}), // flashcard SRS map

  // Admin draft manifest — used by the in-app admin to compose entries that
  // can be exported as JSON and committed to the cloud manifest.
  draftLibrary: () => read('draftLibrary', { subjects: {} }),

  // Per-subject unit completion tracker (private, browser-local).
  // shape: { "U21BM301": { "1": true, "3": true }, ... }
  unitProgress: () => read('unitProgress', {}),

  set(key, value) { write(key, value); emit(key, value); },
};

export function toggleUnitDone(subjectId, unit) {
  const p = store.unitProgress();
  p[subjectId] = p[subjectId] || {};
  if (p[subjectId][unit]) delete p[subjectId][unit];
  else p[subjectId][unit] = true;
  store.set('unitProgress', p);
  return !!p[subjectId][unit];
}
export function isUnitDone(subjectId, unit) {
  const p = store.unitProgress();
  return !!(p[subjectId] && p[subjectId][unit]);
}
export function subjectProgress(subjectId, totalUnits) {
  if (!totalUnits) return { done: 0, total: 0, pct: 0 };
  const p = store.unitProgress()[subjectId] || {};
  const done = Object.keys(p).length;
  return { done, total: totalUnits, pct: Math.round((done / totalUnits) * 100) };
}

// --- pub/sub ---
const subs = new Map();
export function on(key, fn) {
  if (!subs.has(key)) subs.set(key, new Set());
  subs.get(key).add(fn);
  return () => subs.get(key).delete(fn);
}
function emit(key, value) {
  if (subs.has(key)) subs.get(key).forEach(fn => fn(value));
}

// --- XP / streak helpers ---
export function awardXP(amount, reason = '') {
  const u = store.user();
  u.xp += amount;
  store.set('user', u);
  return { newXP: u.xp, reason };
}
export function touchStreak() {
  const u = store.user();
  const today = todayISO();
  if (u.lastActive === today) return u.streak;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yest = dateISO(y);
  if (u.lastActive === yest) u.streak += 1; else u.streak = 1;
  u.lastActive = today;
  store.set('user', u);
  return u.streak;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// --- Local-time date helpers (NOT UTC) ---
// Using toISOString() previously caused the calendar to show "tomorrow" as
// today after ~6:30 PM IST, because toISOString returns UTC.
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function dateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// --- toast ---
export function toast(msg, kind = 'ok') {
  const root = document.getElementById('toasts');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }, 2400);
  setTimeout(() => el.remove(), 2800);
}

// ============================================================
// CLOUD LIBRARY — manifest.json fetcher
// ============================================================
//
// The cloud-side admin (the site owner) commits a `library/manifest.json`
// to the repo. It is fetched once on load and cached. Shape:
//
// {
//   "subjects": {
//     "U21BM301": {
//       "notes":  [{ id, title, file, by, addedAt, tags }],
//       "papers": [{ id, title, file, year, type, university, addedAt }]
//     }
//   }
// }
//
// Each `file` is a path relative to the site root, e.g.
// "library/U21BM301/anatomy-unit1.pdf". The student clicks → opens in a new
// tab, or downloads via the download button.

let MANIFEST = null;
let MANIFEST_PROMISE = null;

export function loadManifest() {
  if (MANIFEST_PROMISE) return MANIFEST_PROMISE;
  MANIFEST_PROMISE = fetch('library/manifest.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : { subjects: {} })
    .catch(() => ({ subjects: {} }))
    .then(m => { MANIFEST = m; return m; });
  return MANIFEST_PROMISE;
}
export function getManifest() { return MANIFEST || { subjects: {} }; }

// Combine manifest + admin draft (locally pending entries) for a given subject.
// Includes the curated `syllabus` image (cloud first, draft wins if set).
export function librarySubject(subjectId) {
  const cloud = (getManifest().subjects || {})[subjectId] || {};
  const draft = (store.draftLibrary().subjects || {})[subjectId] || {};
  return {
    syllabus: draft.syllabus || cloud.syllabus || null,
    syllabusDraft: !!draft.syllabus && !cloud.syllabus,
    notes:  [...(cloud.notes  || []), ...((draft.notes  || []).map(x => ({ ...x, draft: true })))],
    papers: [...(cloud.papers || []), ...((draft.papers || []).map(x => ({ ...x, draft: true })))],
  };
}
