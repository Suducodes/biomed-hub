import { h, mount, icon } from '../ui.js';
import { SUBJECTS, SEM_LABEL, CATEGORY_META } from '../data.js';
import { store, getManifest, loadManifest, toast, todayISO } from '../storage.js';

// Admin panel — composes JSON snippets for `library/manifest.json`.
// Three modes:
//   1. Add note            — one PDF, with optional Unit #
//   2. Add past paper      — one PDF, with year / type / university
//   3. Set syllabus image  — one image URL per subject
//   4. Bulk add notes      — paste many units at once
//
// Workflow:
//   1. Upload the PDFs to your storage (GitHub repo or Cloudflare R2 etc.)
//   2. Compose entries here → live in localStorage as DRAFTS and appear
//      (with a "draft (local)" badge) in the subject pages so you can preview.
//   3. Click "Export merged manifest.json" → drop the file into the repo.
//   4. Click "Clear drafts" once committed.

export async function renderAdmin() {
  await loadManifest();
  const cloud = getManifest();
  const draft = store.draftLibrary();

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Admin</span> · upload library' }),
      h('p', {}, 'Add notes, past papers and syllabus images to the cloud library. Compose entries here, preview them in the subject pages, then export and commit.'),
    ),
  );

  const counts = countItems(cloud, draft);
  const stats = h('div', { class: 'grid grid--4', style: { marginBottom: 18 } },
    miniStat('📘', counts.cloudNotes,  'Cloud notes'),
    miniStat('📄', counts.cloudPapers, 'Cloud papers'),
    miniStat('🖼️', counts.cloudSyll,   'Syllabus images'),
    miniStat('📝', counts.draftItems,  'Pending drafts'),
  );

  // Shared subject picker (used by all forms)
  const subjSel = makeSubjectSelect('U21BM301');

  // Mode tabs
  const modeTabs = h('div', { class: 'tabs', style: { marginBottom: 16 } });
  const modeBody = h('div', {});
  let mode = 'note';

  function setMode(m) {
    mode = m;
    [...modeTabs.children].forEach(c => c.classList.toggle('is-active', c.dataset.mode === m));
    modeBody.innerHTML = '';
    if (m === 'note')     modeBody.appendChild(noteForm(subjSel));
    if (m === 'paper')    modeBody.appendChild(paperForm(subjSel));
    if (m === 'syllabus') modeBody.appendChild(syllabusForm(subjSel));
    if (m === 'bulk')     modeBody.appendChild(bulkForm(subjSel));
  }
  [
    ['note',     'Add note'],
    ['paper',    'Add paper'],
    ['syllabus', 'Set syllabus image'],
    ['bulk',     'Bulk add units'],
  ].forEach(([k, label]) => {
    const t = h('div', { class: 'tab', dataset: { mode: k }, onclick: () => setMode(k) }, label);
    modeTabs.appendChild(t);
  });

  // Pending drafts column
  const draftList = h('div', {});
  function renderDrafts() {
    draftList.innerHTML = '';
    const d = store.draftLibrary();
    const ids = Object.keys(d.subjects || {});
    if (!ids.length) {
      draftList.appendChild(h('div', { class: 'empty' }, icon('notes'), h('h4', {}, 'No drafts yet'), h('p', {}, 'Add an entry on the left — it will appear here.')));
      return;
    }
    ids.forEach(sid => {
      const subj = SUBJECTS.find(x => x.id === sid);
      const block = d.subjects[sid];
      const items = [
        ...(block.notes  || []).map(n => ({ ...n, kind: 'note' })),
        ...(block.papers || []).map(p => ({ ...p, kind: 'paper' })),
      ];
      const card = h('div', { class: 'card', style: { marginBottom: 10 } },
        h('div', { style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' } },
          h('span', { class: 'chip chip--cyan' }, sid),
          h('div', { style: { fontWeight: 600, flex: 1 } }, subj?.name || sid),
          block.syllabus ? h('span', { class: 'chip chip--violet' }, '🖼 syllabus set') : null,
        ),
        block.syllabus ? h('div', { class: 'note-row', style: { background: 'rgba(167,139,250,0.06)' } },
          h('div', {},
            h('h4', {}, 'Syllabus image'),
            h('div', { class: 'note-row__preview', style: { fontFamily: 'JetBrains Mono', color: 'var(--muted)' } }, block.syllabus),
          ),
          h('div', { class: 'note-row__right' },
            h('button', { class: 'icon-btn', title: 'Remove syllabus draft', onclick: () => { delete block.syllabus; cleanup(d, sid); store.set('draftLibrary', d); toast('Removed'); renderAdmin(); } }, icon('trash')),
          ),
        ) : null,
        ...items.map(it => h('div', { class: 'note-row' },
          h('div', {},
            h('h4', {}, it.title,
              h('span', { class: 'chip chip--amber', style: { marginLeft: 8 } }, it.kind === 'paper' ? `paper · ${it.year || '—'}` : (it.unit != null && it.unit !== '' ? `unit ${it.unit}` : 'note')),
            ),
            h('div', { class: 'note-row__preview', style: { fontFamily: 'JetBrains Mono', color: 'var(--muted)' } }, it.file),
          ),
          h('div', { class: 'note-row__right' },
            h('button', { class: 'icon-btn', title: 'Delete draft', onclick: () => removeDraft(sid, it) }, icon('trash')),
          ),
        )),
      );
      draftList.appendChild(card);
    });
  }
  function cleanup(d, sid) {
    const b = d.subjects[sid];
    if (!b) return;
    const empty = !b.syllabus && !(b.notes || []).length && !(b.papers || []).length;
    if (empty) delete d.subjects[sid];
  }
  function removeDraft(sid, item) {
    const d = store.draftLibrary();
    const block = d.subjects[sid];
    if (item.kind === 'note')  block.notes  = (block.notes  || []).filter(n => n.id !== item.id);
    if (item.kind === 'paper') block.papers = (block.papers || []).filter(p => p.id !== item.id);
    cleanup(d, sid);
    store.set('draftLibrary', d);
    toast('Removed from drafts'); renderAdmin();
  }

  function exportManifest() {
    const merged = JSON.parse(JSON.stringify(getManifest() || { subjects: {} }));
    merged.version = (merged.version || 0) + 1;
    const d = store.draftLibrary();
    Object.entries(d.subjects || {}).forEach(([sid, block]) => {
      merged.subjects[sid] = merged.subjects[sid] || {};
      const target = merged.subjects[sid];
      if (block.syllabus) target.syllabus = block.syllabus;
      target.notes  = [...(target.notes  || []), ...((block.notes  || []).map(({ draft, ...rest }) => rest))];
      target.papers = [...(target.papers || []), ...((block.papers || []).map(({ draft, ...rest }) => rest))];
    });
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manifest.json';
    a.click();
    toast('Downloaded manifest.json — commit it to library/');
  }

  function clearDrafts() {
    if (!confirm('Clear all drafts? Only do this AFTER you committed manifest.json.')) return;
    store.set('draftLibrary', { subjects: {} });
    toast('Drafts cleared'); renderAdmin();
  }

  const helpCard = h('div', { class: 'card', style: { marginTop: 14, background: 'rgba(34,211,238,0.05)' } },
    h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'Once you are happy with the drafts'),
    h('p', { style: { color: 'var(--muted)', margin: '0 0 12px', fontSize: 13 } },
      '1. Click ', h('b', {}, 'Export merged manifest.json'), ' → drag the file into ',
      h('code', { style: { background: 'rgba(148,163,184,0.12)', padding: '2px 6px', borderRadius: 4 } }, 'library/'),
      ' on GitHub. ',
      '2. Commit & push — within a minute, all students see the new items. ',
      '3. Click ', h('b', {}, 'Clear drafts'), ' to reset the local pending list.'),
    h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      h('button', { class: 'btn btn--primary', onclick: exportManifest }, icon('download'), 'Export merged manifest.json'),
      h('button', { class: 'btn btn--ghost', onclick: clearDrafts }, 'Clear drafts'),
    ),
  );

  mount('#view',
    head,
    stats,
    h('div', { class: 'grid grid--2' },
      h('div', {},
        h('div', { class: 'card' },
          h('h4', { style: { margin: '0 0 12px', fontFamily: 'Space Grotesk' } }, 'Add a library item'),
          h('div', { class: 'field' }, h('label', { class: 'label' }, 'Subject'), subjSel),
          modeTabs,
          modeBody,
        ),
      ),
      h('div', {},
        h('h3', { style: { fontFamily: 'Space Grotesk', margin: '0 0 12px' } }, 'Pending drafts'),
        draftList,
        helpCard,
      ),
    ),
  );

  setMode('note');
  renderDrafts();
}

// ---------- Mode forms ----------
function noteForm(subjSel) {
  const unitI  = h('input', { class: 'input', type: 'number', min: 1, max: 10, placeholder: 'e.g. 1' });
  const titleI = h('input', { class: 'input', placeholder: 'e.g. "Cells, Tissues & Homeostasis"' });
  const fileI  = h('input', { class: 'input', placeholder: 'library/U21BM301/unit1.pdf  OR  https://r2.../unit1.pdf' });
  const byI    = h('input', { class: 'input', placeholder: 'Your name (optional)' });
  const tagsI  = h('input', { class: 'input', placeholder: 'tags, comma-separated' });

  return h('div', {},
    h('div', { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Unit # (optional)'), unitI),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Author (optional)'), byI),
    ),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'Title'), titleI),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'File path or URL'), fileI),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'Tags'), tagsI),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { class: 'btn btn--primary', onclick: () => {
        if (!titleI.value.trim() || !fileI.value.trim()) { toast('Title and file path required', 'err'); return; }
        const d = store.draftLibrary();
        const sid = subjSel.value;
        d.subjects[sid] = d.subjects[sid] || { notes: [], papers: [] };
        d.subjects[sid].notes = d.subjects[sid].notes || [];
        d.subjects[sid].notes.push({
          id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
          title: titleI.value.trim(),
          file: fileI.value.trim().replace(/^\/+/, ''),
          unit: unitI.value ? +unitI.value : undefined,
          by: byI.value.trim() || undefined,
          tags: tagsI.value.split(',').map(x => x.trim()).filter(Boolean),
          addedAt: todayISO(),
        });
        store.set('draftLibrary', d);
        toast('Note added to drafts'); renderAdmin();
      }}, icon('plus'), 'Add to drafts'),
      h('button', { class: 'btn btn--ghost', onclick: () => { unitI.value=''; titleI.value=''; fileI.value=''; byI.value=''; tagsI.value=''; } }, 'Clear'),
    ),
  );
}

function paperForm(subjSel) {
  const titleI = h('input', { class: 'input', placeholder: 'e.g. "Anatomy & Physiology — Reg 2024"' });
  const fileI  = h('input', { class: 'input', placeholder: 'library/U21BM301/papers/2024-reg.pdf  OR  https://...' });
  const yearI  = h('input', { class: 'input', type: 'number', placeholder: '2024' });
  const typeI  = h('select', { class: 'select' }, ...['Regular','Supplementary','Internal','Model'].map(v => h('option', { value: v }, v)));
  const uniI   = h('input', { class: 'input', placeholder: 'KPR Institute / Anna University / …' });

  return h('div', {},
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'Title'), titleI),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'File path or URL'), fileI),
    h('div', { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Year'), yearI),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Type'), typeI),
    ),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'University / Institute'), uniI),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { class: 'btn btn--primary', onclick: () => {
        if (!titleI.value.trim() || !fileI.value.trim()) { toast('Title and file path required', 'err'); return; }
        const d = store.draftLibrary();
        const sid = subjSel.value;
        d.subjects[sid] = d.subjects[sid] || { notes: [], papers: [] };
        d.subjects[sid].papers = d.subjects[sid].papers || [];
        d.subjects[sid].papers.push({
          id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
          title: titleI.value.trim(),
          file: fileI.value.trim().replace(/^\/+/, ''),
          year: +yearI.value || null,
          type: typeI.value,
          university: uniI.value.trim(),
          addedAt: todayISO(),
        });
        store.set('draftLibrary', d);
        toast('Paper added to drafts'); renderAdmin();
      }}, icon('plus'), 'Add to drafts'),
      h('button', { class: 'btn btn--ghost', onclick: () => { titleI.value=''; fileI.value=''; yearI.value=''; uniI.value=''; } }, 'Clear'),
    ),
  );
}

function syllabusForm(subjSel) {
  const fileI = h('input', { class: 'input', placeholder: 'library/U21BM301/syllabus.jpg  OR  https://...' });
  const preview = h('div', { style: { marginTop: 10 } });

  function showPreview() {
    preview.innerHTML = '';
    if (!fileI.value.trim()) return;
    preview.appendChild(h('img', { src: fileI.value.trim(), alt: 'preview',
      style: { maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' },
      onerror: function(){ this.style.display = 'none'; preview.appendChild(h('div', { style: { color: 'var(--rose)', fontSize: 12 } }, 'Could not load — check the URL.')); },
    }));
  }
  fileI.addEventListener('blur', showPreview);

  return h('div', {},
    h('p', { style: { color: 'var(--muted)', fontSize: 13, marginTop: 0 } },
      'Upload a JPG / PNG of the printed syllabus page (showing units & topics). It will be displayed below the subject title — students see it before the notes.'),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'Syllabus image path or URL'), fileI),
    preview,
    h('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
      h('button', { class: 'btn btn--primary', onclick: () => {
        if (!fileI.value.trim()) { toast('Path required', 'err'); return; }
        const d = store.draftLibrary();
        const sid = subjSel.value;
        d.subjects[sid] = d.subjects[sid] || { notes: [], papers: [] };
        d.subjects[sid].syllabus = fileI.value.trim().replace(/^\/+(?!\/)/, '');  // keep https:// intact
        store.set('draftLibrary', d);
        toast('Syllabus draft set'); renderAdmin();
      }}, icon('check'), 'Set as draft'),
      h('button', { class: 'btn btn--ghost', onclick: showPreview }, 'Preview'),
    ),
  );
}

function bulkForm(subjSel) {
  const txt = h('textarea', { class: 'textarea', style: { minHeight: 220, fontFamily: 'JetBrains Mono', fontSize: 13 },
    placeholder:
`# One unit per line. Format:
#   <unit#> | <title> | <file-path-or-URL>
#
1 | Cells, Tissues & Homeostasis  | library/U21BM301/unit1.pdf
2 | Cardiovascular System         | library/U21BM301/unit2.pdf
3 | Nervous System                | library/U21BM301/unit3.pdf
4 | Respiratory & Renal           | library/U21BM301/unit4.pdf
5 | Musculoskeletal & Endocrine   | library/U21BM301/unit5.pdf`,
  });

  return h('div', {},
    h('p', { style: { color: 'var(--muted)', fontSize: 13, marginTop: 0 } },
      'Paste one line per unit. The fastest way to add all 5 (or however many) unit-wise PDFs of a subject at once. Subject is the one selected above.'),
    txt,
    h('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
      h('button', { class: 'btn btn--primary', onclick: () => {
        const lines = txt.value.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        if (!lines.length) { toast('Nothing to add', 'err'); return; }
        const d = store.draftLibrary();
        const sid = subjSel.value;
        d.subjects[sid] = d.subjects[sid] || { notes: [], papers: [] };
        d.subjects[sid].notes = d.subjects[sid].notes || [];
        let added = 0, skipped = 0;
        lines.forEach(line => {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length < 3) { skipped++; return; }
          const [u, title, file] = parts;
          d.subjects[sid].notes.push({
            id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
            unit: u ? +u : undefined,
            title,
            file: file.replace(/^\/+(?!\/)/, ''),
            addedAt: todayISO(),
          });
          added++;
        });
        store.set('draftLibrary', d);
        toast(`Added ${added}${skipped ? ` · skipped ${skipped}` : ''}`);
        renderAdmin();
      }}, icon('plus'), 'Add all to drafts'),
      h('button', { class: 'btn btn--ghost', onclick: () => { txt.value = ''; } }, 'Clear'),
    ),
  );
}

// ---------- Helpers ----------
function makeSubjectSelect(defaultId) {
  const sel = document.createElement('select');
  sel.className = 'select';
  SEM_LABEL.forEach((sl, i) => {
    const g = document.createElement('optgroup');
    g.label = `Semester ${sl}`;
    SUBJECTS.filter(s => s.sem === i + 1).forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = `${s.id} · ${s.name}`;
      g.appendChild(o);
    });
    sel.appendChild(g);
  });
  sel.value = defaultId || SUBJECTS[0].id;
  return sel;
}

function countItems(cloud, draft) {
  let cloudNotes = 0, cloudPapers = 0, cloudSyll = 0, draftItems = 0;
  Object.values(cloud.subjects || {}).forEach(b => {
    cloudNotes += (b.notes || []).length;
    cloudPapers += (b.papers || []).length;
    if (b.syllabus) cloudSyll++;
  });
  Object.values(draft.subjects || {}).forEach(b => {
    draftItems += (b.notes || []).length + (b.papers || []).length + (b.syllabus ? 1 : 0);
  });
  return { cloudNotes, cloudPapers, cloudSyll, draftItems };
}
function miniStat(em, val, lbl) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__icon', style: { fontSize: 22, background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.25)', color: '#a78bfa' } }, em),
    h('div', {}, h('div', { class: 'stat__val' }, String(val)), h('div', { class: 'stat__lbl' }, lbl)),
  );
}
