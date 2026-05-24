// Tiny, safe-ish markdown renderer (subset). Not a full CommonMark impl, but
// enough for student notes: headings, lists, code, tables, blockquotes,
// inline code, bold/italic, links, hr.

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderMD(src) {
  if (!src) return '';
  // Code fences first — protect their contents
  const fences = [];
  src = src.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    fences.push({ lang: lang.trim(), code });
    return `§§FENCE${fences.length - 1}§§`;
  });

  const lines = src.split('\n');
  let html = '';
  let i = 0;

  const inline = (t) => {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) { html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; i++; continue; }

    // HR
    if (/^[-*_]{3,}\s*$/.test(line)) { html += '<hr/>'; i++; continue; }

    // Blockquote (multi-line)
    if (/^>\s?/.test(line)) {
      let buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html += `<blockquote>${inline(buf.join(' '))}</blockquote>`;
      continue;
    }

    // Tables — header | --- | row | row…
    if (i + 1 < lines.length && /\|/.test(line) && /^[\s|:-]+$/.test(lines[i + 1])) {
      const head = line.split('|').map(c => c.trim()).filter(Boolean);
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i])) {
        rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
        i++;
      }
      html += '<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
      html += '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
      continue;
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      html += '<ul>' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ul>';
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      html += '<ol>' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ol>';
      continue;
    }

    // Blank line — paragraph break
    if (line.trim() === '') { i++; continue; }

    // Paragraph (gather consecutive non-empty, non-special lines)
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^[-*_]{3,}\s*$/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i]); i++;
    }
    html += `<p>${inline(buf.join(' '))}</p>`;
  }

  // Restore fences
  html = html.replace(/§§FENCE(\d+)§§/g, (_, n) => {
    const f = fences[+n];
    return `<pre><code data-lang="${esc(f.lang)}">${esc(f.code.replace(/\n$/, ''))}</code></pre>`;
  });

  return html;
}
