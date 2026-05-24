// Thin client for the bits of the GitHub REST API we use for direct uploads.
// All calls run in the admin's browser — the PAT lives in localStorage and is
// only ever sent to api.github.com over TLS.

const SETTINGS_KEY = 'biomedhub:v2:githubSettings';

export function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}
export function setSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

// Auto-derive {owner, repo, branch} from the URL when the site is hosted on
// GitHub Pages (e.g. https://sudarshan-r.github.io/biomed-hub/ → owner=sudarshan-r,
// repo=biomed-hub). Returns null if we can't tell.
export function autoDetectRepo() {
  const host = location.hostname;
  if (host.endsWith('.github.io')) {
    const owner = host.split('.')[0];
    const seg = location.pathname.split('/').filter(Boolean);
    const repo = seg[0] || `${owner}.github.io`;
    return { owner, repo, branch: 'main' };
  }
  return null;
}

async function ghFetch(settings, method, path, body) {
  if (!settings.token) throw new Error('No GitHub token configured.');
  if (!settings.owner || !settings.repo) throw new Error('Repo not configured.');
  const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${settings.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); msg += ': ' + (j.message || ''); } catch {}
    throw new Error(msg);
  }
  // 204 has no body
  if (res.status === 204) return null;
  return res.json();
}

// Quick token check — calls GET /user to ensure the token is valid.
export async function validateToken(settings) {
  const url = 'https://api.github.com/user';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${settings.token}`,
      'Accept': 'application/vnd.github+json',
    },
  });
  if (!res.ok) throw new Error(`Invalid token (${res.status})`);
  return res.json();
}

// Read a File / Blob and return its base64 content (no data: prefix).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// Put a file at `path` in the repo. Detects existing file (so we can overwrite).
// Returns the response JSON (with html_url, commit, etc.).
export async function putFile(settings, path, file, message) {
  // GitHub Contents API caps at ~100 MB. PDFs are usually 1–5 MB; warn at 25.
  if (file.size > 25 * 1024 * 1024) {
    throw new Error(`File too large for direct upload (${(file.size / 1024 / 1024).toFixed(1)} MB). Upload via GitHub web UI instead.`);
  }
  const content = await fileToBase64(file);
  // See if a file already exists at this path so we can pass the SHA (= update).
  let sha;
  try {
    const existing = await ghFetch(settings, 'GET', `/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${settings.branch}`);
    sha = existing.sha;
  } catch (e) { /* 404 — new file */ }
  return ghFetch(settings, 'PUT', `/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    message,
    content,
    branch: settings.branch,
    ...(sha ? { sha } : {}),
  });
}

// --- Filename helpers ----------------------------------------------
// Slugify a title for use inside a filename. Keeps it ASCII, kebab-case.
export function slugify(title) {
  return title
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')   // strip accents
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

export function noteFilename(unit, title) {
  const s = slugify(title);
  return unit ? `unit${unit}-${s}.pdf` : `${s}.pdf`;
}
export function paperFilename(year, type, university) {
  const parts = [year, type, university && slugify(university)].filter(Boolean);
  return parts.join('-') + '.pdf';
}
export function syllabusFilename(originalName) {
  const m = originalName.match(/\.(jpe?g|png|webp|gif)$/i);
  const ext = (m ? m[1] : 'jpg').toLowerCase().replace('jpeg', 'jpg');
  return `syllabus.${ext}`;
}
