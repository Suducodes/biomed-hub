import { h, mount, icon, modal } from '../ui.js?v=94729f9';
import { SUBJECTS, SEM_LABEL, CATEGORY_META } from '../data.js?v=94729f9';
import { store, getManifest, loadManifest, toast, todayISO } from '../storage.js?v=94729f9';
import {
  getSettings, setSettings, clearSettings, autoDetectRepo,
  validateToken, putFile, noteFilename, paperFilename, syllabusFilename, slugify,
} from '../github.js?v=94729f9';

// Admin panel — drag-and-drop direct upload to the repo.
//
// One-time setup: the admin pastes a GitHub Personal Access Token (PAT) with
// "Contents: read & write" on this repo. The token is stored in localStorage
// and only sent to api.github.com. After that, uploads are one-click.

export async function renderAdmin() {
  await loadManifest();
  const settings = { ...(autoDetectRepo() || {}), ...getSettings() };
  const configured = !!(settings.token && settings.owner && settings.repo);

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Admin</span> · upload' }),
      h('p', {}, 'Drag and drop PDFs. They are committed to the GitHub repo directly; the auto-manifest Action picks them up within ~30 seconds. Zero JSON editing.'),
    ),
  );

  // -------- Settings panel --------
  const settingsCard = renderSettingsCard(settings, () => renderAdmin());

  // -------- Upload panel --------
  const uploadCard = configured
    ? renderUploadCard(settings)
    : h('div', { class: 'card', style: { opacity: 0.6 } },
        h('h3', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'Upload disabled'),
        h('p', { style: { color: 'var(--muted)', margin: 0 } }, 'Configure your GitHub token above to enable direct uploads.'),
      );

  // -------- Scaling explainer --------
  const explainer = h('div', { class: 'card', style: { marginTop: 16, background: 'rgba(34,211,238,0.05)' } },
    h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'How this scales'),
    h('ul', { style: { color: 'var(--muted)', fontSize: 13.5, margin: 0, paddingLeft: 18 } },
      h('li', {}, h('b', {}, 'Concurrent visitors:'), ' GitHub Pages serves from a global CDN. Thousands of simultaneous students = no problem.'),
      h('li', {}, h('b', {}, 'Bandwidth:'), ' Soft cap is ~100 GB / month. A class of 200 students downloading 100 MB each = 20 GB. Well within limits.'),
      h('li', {}, h('b', {}, 'When you upload here,'), ' it triggers one site rebuild (cap: 10/hour). For bulk uploads we batch — all files in one commit.'),
      h('li', {}, h('b', {}, 'Student notes:'), ' Each student writes their own private notes in the “My Notes” tab on any subject. They live in that student\'s browser only. Nothing to crash, nothing to moderate.'),
    ),
  );

  mount('#view', head, settingsCard, uploadCard, explainer);
}

// ===========================================================
// Settings panel
// ===========================================================
function renderSettingsCard(initial, onSaved) {
  const detected = autoDetectRepo();
  const ownerI  = h('input', { class: 'input', placeholder: 'github-username', value: initial.owner || '' });
  const repoI   = h('input', { class: 'input', placeholder: 'repo-name',       value: initial.repo  || '' });
  const branchI = h('input', { class: 'input', placeholder: 'main',            value: initial.branch || 'main' });
  const tokenI  = h('input', { class: 'input', type: 'password', placeholder: 'ghp_…  or  github_pat_…', value: initial.token || '' });
  const status  = h('div', { style: { marginTop: 10, fontSize: 13 } });

  async function save() {
    const s = {
      owner:  ownerI.value.trim(),
      repo:   repoI.value.trim(),
      branch: branchI.value.trim() || 'main',
      token:  tokenI.value.trim(),
    };
    if (!s.owner || !s.repo || !s.token) { toast('Owner, repo and token are required', 'err'); return; }
    status.textContent = 'Validating token…';
    status.style.color = 'var(--muted)';
    try {
      const user = await validateToken(s);
      setSettings(s);
      status.innerHTML = `<span style="color:var(--emerald)">✓ Saved. Authenticated as <b>${user.login}</b></span>`;
      toast('GitHub configured', 'ok');
      setTimeout(onSaved, 400);
    } catch (e) {
      status.innerHTML = `<span style="color:var(--rose)">✗ ${e.message}</span>`;
    }
  }

  return h('div', { class: 'card', style: { marginBottom: 16 } },
    h('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 10 } },
      h('h3', { style: { margin: 0, fontFamily: 'Space Grotesk', flex: 1 } }, 'GitHub connection'),
      initial.token ? h('span', { class: 'chip chip--emerald' }, '✓ configured') : h('span', { class: 'chip chip--amber' }, 'not configured'),
    ),
    detected ? h('p', { style: { color: 'var(--muted)', fontSize: 12.5, margin: '0 0 12px' } },
      `Auto-detected from URL: ${detected.owner}/${detected.repo} on branch ${detected.branch}.`) : null,
    h('div', { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Owner (username)'), ownerI),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Repo'), repoI),
    ),
    h('div', { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Branch'), branchI),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Personal access token'), tokenI),
    ),
    h('p', { style: { color: 'var(--muted)', fontSize: 12, margin: '0 0 12px' } },
      'Create at ',
      h('a', { href: 'https://github.com/settings/personal-access-tokens/new', target: '_blank', rel: 'noopener', style: { color: 'var(--cyan)' } }, 'github.com → Fine-grained tokens'),
      '. Required: ',
      h('code', { style: { background: 'rgba(148,163,184,0.12)', padding: '1px 6px', borderRadius: 4 } }, 'Repository → Contents → Read and write'),
      '. Token never leaves your browser.'),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { class: 'btn btn--primary', onclick: save }, icon('check'), 'Save & verify'),
      initial.token ? h('button', { class: 'btn btn--danger', onclick: () => { if (confirm('Clear saved token?')) { clearSettings(); toast('Cleared'); onSaved(); } } }, 'Clear token') : null,
    ),
    status,
  );
}

// ===========================================================
// Upload panel — multi-file drag-drop, auto-naming, batch commit
// ===========================================================
function renderUploadCard(settings) {
  // State held in closure
  let kind = 'note';          // 'note' | 'paper' | 'syllabus'
  let subjectId = 'U21BM301';
  /** @type {{file:File, suggestedName:string, customName?:string, meta:object, status:string}[]} */
  let queue = [];
  let uploading = false;

  // --- subject + kind controls ---
  const subjSel = makeSubjectSelect(subjectId);
  subjSel.addEventListener('change', () => { subjectId = subjSel.value; renderQueue(); });

  const kindBtns = h('div', { class: 'kind-pills' });
  const kindOptions = [
    { v: 'note',     label: 'Notes (Units)', icon: 'notes' },
    { v: 'paper',    label: 'Past papers',   icon: 'papers' },
    { v: 'syllabus', label: 'Syllabus image',icon: 'subjects' },
  ];
  kindOptions.forEach(o => {
    const b = h('button', { class: 'kind-pill' + (o.v === kind ? ' is-active' : ''), onclick: () => { kind = o.v; setKind(); } },
      icon(o.icon), h('span', {}, o.label));
    b.dataset.k = o.v;
    kindBtns.appendChild(b);
  });
  function setKind() {
    [...kindBtns.children].forEach(b => b.classList.toggle('is-active', b.dataset.k === kind));
    queue = []; renderQueue();
    extraFieldsMount.innerHTML = '';
    extraFieldsMount.appendChild(extraFields());
    dropHint.textContent = kind === 'syllabus'
      ? 'Drop one image (JPG / PNG / WebP) here'
      : 'Drop one or more PDFs here, or click to choose';
    fileInput.accept = kind === 'syllabus' ? 'image/*' : 'application/pdf';
    fileInput.multiple = kind !== 'syllabus';
  }

  // --- per-kind extra fields ---
  const extraFieldsMount = h('div', {});
  function extraFields() {
    if (kind === 'paper') {
      const yearI = h('input', { class: 'input', type: 'number', placeholder: '2024', value: new Date().getFullYear() });
      const typeI = h('select', { class: 'select' }, ...['Regular','Supplementary','Internal','Model'].map(v => h('option', { value: v }, v)));
      const uniI  = h('input', { class: 'input', placeholder: 'KPR Institute (optional)' });
      const f = h('div', { class: 'field-row' },
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Year'), yearI),
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Type'), typeI),
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'University'), uniI),
      );
      f.dataset.kind = 'paper';
      f._read = () => ({ year: +yearI.value || null, type: typeI.value, university: uniI.value.trim() });
      return f;
    }
    // For notes we read unit & title per-file in the queue rows
    if (kind === 'note') {
      const startI = h('input', { class: 'input', type: 'number', placeholder: '1', value: 1, min: 1, max: 12 });
      const f = h('div', { class: 'field-row' },
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Starting unit # (auto-increments)'), startI),
      );
      f._read = () => ({ startUnit: +startI.value || 1 });
      return f;
    }
    return h('div', {});
  }

  // --- drop zone ---
  const fileInput = h('input', { type: 'file', accept: 'application/pdf', multiple: true, style: { display: 'none' },
    onchange: (e) => { addFiles([...e.target.files]); fileInput.value = ''; } });
  const dropHint = h('div', { class: 'drop-hint' }, 'Drop one or more PDFs here, or click to choose');
  const dropzone = h('div', { class: 'dropzone',
    onclick: () => fileInput.click(),
    ondragover: (e) => { e.preventDefault(); dropzone.classList.add('is-over'); },
    ondragleave: () => dropzone.classList.remove('is-over'),
    ondrop: (e) => {
      e.preventDefault(); dropzone.classList.remove('is-over');
      addFiles([...e.dataTransfer.files]);
    },
  },
    h('div', { class: 'dropzone__inner' },
      h('div', { class: 'dropzone__icon' }, '⬆'),
      dropHint,
      h('div', { class: 'dropzone__hint' }, 'Filenames are auto-generated to match the library convention.'),
    ),
    fileInput,
  );

  // --- queue list ---
  const queueList = h('div', { class: 'queue' });

  function addFiles(files) {
    if (kind === 'syllabus') files = files.slice(0, 1);
    const meta = extraFieldsMount.firstChild?._read?.() || {};
    let nextUnit = meta.startUnit || 1;
    files.forEach(f => {
      const item = { file: f, status: 'pending', meta: {} };
      if (kind === 'note') {
        const parsed = parseFromFilename(f.name);
        item.meta = { unit: parsed.unit ?? nextUnit++, title: parsed.title };
        item.suggestedName = noteFilename(item.meta.unit, item.meta.title);
      } else if (kind === 'paper') {
        item.meta = { ...meta };
        item.suggestedName = paperFilename(meta.year, meta.type, meta.university);
      } else {
        item.suggestedName = syllabusFilename(f.name);
      }
      queue.push(item);
    });
    renderQueue();
  }

  function renderQueue() {
    queueList.innerHTML = '';
    if (queue.length === 0) {
      queueList.appendChild(h('div', { style: { color: 'var(--muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' } }, 'No files queued.'));
      return;
    }
    queue.forEach((item, idx) => {
      const subj = SUBJECTS.find(s => s.id === subjectId);
      const targetPath = computePath(subjectId, kind, item.suggestedName);
      const row = h('div', { class: 'queue-row' },
        h('div', { class: 'queue-row__icon' }, kind === 'syllabus' ? '🖼' : (kind === 'paper' ? '📄' : '📘')),
        h('div', { class: 'queue-row__body' },
          kind === 'note'
            ? h('div', { style: { display: 'flex', gap: 8 } },
                h('input', { class: 'input', type: 'number', value: item.meta.unit, min: 1, max: 12, style: { width: 64 },
                  oninput: (e) => { item.meta.unit = +e.target.value; item.suggestedName = noteFilename(item.meta.unit, item.meta.title); renderQueue(); } }),
                h('input', { class: 'input', value: item.meta.title, placeholder: 'Title',
                  oninput: (e) => { item.meta.title = e.target.value; item.suggestedName = noteFilename(item.meta.unit, item.meta.title); renderQueue(); } }),
              )
            : h('div', { class: 'queue-row__title' }, item.suggestedName),
          h('div', { class: 'queue-row__path' }, '→ ', targetPath, '   (', (item.file.size / 1024).toFixed(0), ' KB)'),
        ),
        h('div', { class: 'queue-row__status' }, statusBadge(item.status)),
        h('button', { class: 'icon-btn', title: 'Remove from queue', onclick: () => { queue.splice(idx, 1); renderQueue(); } }, icon('trash')),
      );
      queueList.appendChild(row);
    });
  }

  // --- upload ---
  const uploadBtn = h('button', { class: 'btn btn--primary', onclick: async () => {
    if (uploading) return;
    if (queue.length === 0) { toast('Nothing to upload', 'err'); return; }
    uploading = true;
    uploadBtn.disabled = true;
    let ok = 0, fail = 0;
    for (const item of queue.filter(q => q.status !== 'done')) {
      item.status = 'uploading'; renderQueue();
      try {
        const path = computePath(subjectId, kind, item.suggestedName);
        const msg = kind === 'syllabus'
          ? `admin: upload syllabus for ${subjectId}`
          : kind === 'paper'
            ? `admin: upload ${item.meta.year} ${item.meta.type} paper for ${subjectId}`
            : `admin: upload Unit ${item.meta.unit} note for ${subjectId}`;
        await putFile(settings, path, item.file, msg);
        item.status = 'done'; ok++;
      } catch (e) {
        item.status = 'error: ' + e.message; fail++;
      }
      renderQueue();
    }
    uploading = false;
    uploadBtn.disabled = false;
    toast(`Uploaded ${ok}${fail ? ` · ${fail} failed` : ''} · GitHub Action will rebuild the manifest in ~30s`);
  } }, icon('plus'), 'Upload all to GitHub');

  // --- assemble ---
  const card = h('div', { class: 'card' },
    h('h3', { style: { margin: '0 0 12px', fontFamily: 'Space Grotesk' } }, 'Drag-and-drop upload'),
    h('div', { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Subject'), subjSel),
    ),
    h('div', { class: 'field' }, h('label', { class: 'label' }, 'What are you uploading?'), kindBtns),
    extraFieldsMount,
    dropzone,
    queueList,
    h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 } },
      h('button', { class: 'btn btn--ghost', onclick: () => { queue = []; renderQueue(); } }, 'Clear queue'),
      uploadBtn,
    ),
  );

  setKind();
  renderQueue();
  return card;
}

// ===========================================================
// Helpers
// ===========================================================
function computePath(subjectId, kind, filename) {
  if (kind === 'syllabus') return `library/${subjectId}/${filename}`;
  if (kind === 'paper')    return `library/${subjectId}/papers/${filename}`;
  return `library/${subjectId}/notes/${filename}`;
}

function parseFromFilename(filename) {
  const base = filename.replace(/\.pdf$/i, '');
  const m = base.match(/^(?:unit[\s_-]*)?(\d{1,2})(?:[\s_-]+(.*))?$/i);
  if (m) {
    return { unit: +m[1], title: m[2] ? prettify(m[2]) : `Unit ${m[1]}` };
  }
  return { unit: null, title: prettify(base) };
}
function prettify(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
          .split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

function statusBadge(s) {
  if (s === 'pending')   return h('span', { class: 'chip' }, 'pending');
  if (s === 'uploading') return h('span', { class: 'chip chip--amber' }, '… uploading');
  if (s === 'done')      return h('span', { class: 'chip chip--emerald' }, '✓ done');
  return h('span', { class: 'chip', style: { color: 'var(--rose)', borderColor: 'rgba(251,113,133,0.4)', background: 'rgba(251,113,133,0.10)' }, title: s }, 'error');
}

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
