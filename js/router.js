// Tiny hash router.
// Routes look like #/notes, #/subjects/instr, #/notes/abc123/edit, etc.

const routes = [];

export function route(pattern, handler) {
  // pattern: '#/subjects/:id'
  const keys = [];
  // Escape regex specials EXCEPT ':' (we use it for params), then expand :name -> capture group.
  const re = new RegExp('^' + pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([a-zA-Z]+)/g, (_, name) => { keys.push(name); return '([^/]+)'; }) + '$');
  routes.push({ re, keys, handler });
}

export function navigate(hash) {
  if (window.location.hash === hash) { resolve(); }
  else { window.location.hash = hash; }
}

function resolve() {
  const full = window.location.hash || '#/';
  const hash = full.split('?')[0];  // strip query string for matching
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
      r.handler(params);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }
  // Fallback
  document.getElementById('view').innerHTML = '<div class="empty"><h4>404</h4><p>This page does not exist.</p></div>';
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  if (!window.location.hash) window.location.hash = '#/';
  else resolve();
}
