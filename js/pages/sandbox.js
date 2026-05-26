import { h, mount, icon } from '../ui.js?v=960a27c';
import { toast } from '../storage.js?v=960a27c';

// Code Sandbox — in-browser editor + Run + console output.
// JS runs in a sandboxed iframe so it can't trash the host page.
// Python runs via Pyodide (lazy-loaded from CDN — first run ≈ 5 s, cached after).

const STORE_KEY = 'biomedhub:v2:sandbox';

const STARTERS = {
  js: `// Welcome to the BioMed Hub code sandbox.
// Quick demo: compute the gain of an op-amp.

const Rf = 100;   // kΩ
const Rin = 10;   // kΩ
const gainInv = -Rf / Rin;
const gainNon = 1 + Rf / Rin;

console.log("Inverting gain:", gainInv);
console.log("Non-inverting gain:", gainNon);

// Try editing the values, then press Run.`,

  python: `# Python in your browser. First run takes ~5s to load Pyodide.
import numpy as np

# Simulate a noisy ECG fragment
fs = 500                      # sample rate, Hz
t  = np.linspace(0, 2, fs * 2)
qrs = np.exp(-((t - 0.5) ** 2) / 0.0005) - 0.4 * np.exp(-((t - 0.51) ** 2) / 0.0008)
ecg = qrs + 0.03 * np.random.randn(len(t))

print("Samples:", len(ecg))
print("Peak amplitude:", round(float(ecg.max()), 3))
print("Mean:", round(float(ecg.mean()), 4))`,
};

export function renderSandbox() {
  let lang = 'js';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch {}

  const editor = h('textarea', { class: 'code-editor', spellcheck: 'false' });
  const out    = h('pre', { class: 'code-out' });

  function setLang(l) {
    lang = l;
    [...langBtns.children].forEach(b => b.classList.toggle('is-active', b.dataset.l === l));
    editor.value = saved[l] ?? STARTERS[l];
    out.textContent = '';
    runBtn.querySelector('span.label').textContent = l === 'js' ? 'Run JS' : 'Run Python';
  }
  function persist() {
    saved[lang] = editor.value;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch {}
  }
  editor.addEventListener('input', persist);

  const langBtns = h('div', { class: 'kind-pills' },
    pill('js',     'JavaScript'),
    pill('python', 'Python (Pyodide)'),
  );
  function pill(v, label) {
    const b = h('button', { class: 'kind-pill', onclick: () => setLang(v) }, h('span', {}, label));
    b.dataset.l = v;
    return b;
  }

  const runBtn   = h('button', { class: 'btn btn--primary', onclick: () => run() }, icon('arrow'), h('span', { class: 'label' }, 'Run JS'));
  const clearBtn = h('button', { class: 'btn btn--ghost',   onclick: () => { out.textContent = ''; } }, 'Clear output');
  const resetBtn = h('button', { class: 'btn btn--ghost',   onclick: () => { editor.value = STARTERS[lang]; persist(); } }, 'Reset starter');

  async function run() {
    out.textContent = '';
    runBtn.disabled = true;
    try {
      const t0 = performance.now();
      if (lang === 'js') {
        await runJS(editor.value, out);
      } else {
        await runPython(editor.value, out);
      }
      out.appendChild(h('div', { class: 'code-out__meta' }, `✓ Done in ${(performance.now() - t0).toFixed(0)} ms`));
    } catch (e) {
      out.appendChild(h('div', { class: 'code-out__err' }, '✗ ' + (e.message || String(e))));
    }
    runBtn.disabled = false;
  }

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'Code <span class="accent">Sandbox</span>' }),
      h('p', {}, 'A real editor in your browser. JavaScript runs instantly; Python uses Pyodide (NumPy / SciPy / Pandas included). Both run sandboxed — they can\'t touch the rest of the site.'),
    ),
  );

  mount('#view',
    head,
    langBtns,
    h('div', { class: 'sandbox' },
      h('div', { class: 'sandbox__pane' },
        h('div', { class: 'sandbox__hdr' }, h('span', {}, '📝 Editor'), h('span', { class: 'sandbox__hint' }, 'Auto-saved locally')),
        editor,
        h('div', { class: 'sandbox__actions' }, runBtn, clearBtn, resetBtn),
      ),
      h('div', { class: 'sandbox__pane' },
        h('div', { class: 'sandbox__hdr' }, h('span', {}, '🖥 Console output')),
        out,
      ),
    ),
    h('div', { class: 'card', style: { marginTop: 14 } },
      h('h4', { style: { margin: '0 0 6px', fontFamily: 'Space Grotesk' } }, 'What you can do here'),
      h('ul', { style: { color: 'var(--muted)', fontSize: 13, margin: 0, paddingLeft: 18 } },
        h('li', {}, 'Verify a formula from class (op-amp gain, Nyquist rate, dilution).'),
        h('li', {}, 'Generate / process simulated ECG / EMG data with NumPy.'),
        h('li', {}, 'Practice for Python lab and the AI/ML elective without setting up an IDE.'),
        h('li', {}, 'Drop in code from your project work, iterate quickly.'),
      ),
    ),
  );

  setLang('js');
}

// ---------------- JavaScript sandbox ----------------
function runJS(code, out) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const id = 'sb_' + Math.random().toString(36).slice(2);
    const win = iframe.contentWindow;

    function cleanup() { window.removeEventListener('message', onMsg); iframe.remove(); }
    function onMsg(e) {
      if (!e.data || e.data._id !== id) return;
      if (e.data.kind === 'log') {
        out.appendChild(h('div', { class: 'code-out__line' }, e.data.text));
      } else if (e.data.kind === 'err') {
        out.appendChild(h('div', { class: 'code-out__err' }, '✗ ' + e.data.text));
        cleanup(); resolve();   // keep going (errors are already shown)
      } else if (e.data.kind === 'done') {
        cleanup(); resolve();
      }
    }
    window.addEventListener('message', onMsg);

    const html = `
<!doctype html><meta charset="utf-8">
<script>
  const _id = ${JSON.stringify(id)};
  const post = (kind, text) => parent.postMessage({ _id, kind, text }, '*');
  const fmt = (v) => {
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  };
  ['log','info','warn','error','debug'].forEach(level => {
    const orig = console[level];
    console[level] = (...args) => { post('log', args.map(fmt).join(' ')); try { orig.apply(console, args); } catch {} };
  });
  window.addEventListener('error', e => post('err', e.message));
  window.addEventListener('unhandledrejection', e => post('err', e.reason && (e.reason.message || e.reason)));
  (async () => {
    try { await (async () => { ${code} })(); post('done', ''); }
    catch (e) { post('err', e.message || String(e)); }
  })();
<\/script>`;
    win.document.open(); win.document.write(html); win.document.close();
    // safety timeout
    setTimeout(() => { try { cleanup(); resolve(); } catch {} }, 15000);
  });
}

// ---------------- Python via Pyodide ----------------
let pyodidePromise = null;
async function loadPyodide(out) {
  if (pyodidePromise) return pyodidePromise;
  out.appendChild(h('div', { class: 'code-out__meta' }, '… loading Pyodide (one-time, ~6 MB)'));
  pyodidePromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    s.onload = async () => {
      try {
        const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
        await py.loadPackage(['numpy']);
        resolve(py);
      } catch (e) { reject(e); }
    };
    s.onerror = () => reject(new Error('Could not fetch Pyodide (check internet).'));
    document.head.appendChild(s);
  });
  return pyodidePromise;
}
async function runPython(code, out) {
  const py = await loadPyodide(out);
  // capture stdout/stderr
  py.runPython(`
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
`);
  try {
    await py.runPythonAsync(code);
  } catch (e) {
    py.runPython('sys.stdout=sys.__stdout__; sys.stderr=sys.__stderr__');
    out.appendChild(h('div', { class: 'code-out__err' }, '✗ ' + (e.message || String(e))));
    return;
  }
  const text = py.runPython('_buf.getvalue()');
  py.runPython('sys.stdout=sys.__stdout__; sys.stderr=sys.__stderr__');
  if (text) text.split('\n').forEach(line => out.appendChild(h('div', { class: 'code-out__line' }, line)));
}
