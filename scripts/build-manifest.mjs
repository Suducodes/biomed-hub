// Walks library/ and generates library/manifest.json from the folder structure.
// Designed so the admin only ever has to drag PDFs into folders — no JSON edits.
//
// CONVENTIONS
// -----------
// library/<COURSE_CODE>/syllabus.(jpg|jpeg|png|webp|gif)   → subject syllabus image
// library/<COURSE_CODE>/notes/<file>.pdf                   → admin note
// library/<COURSE_CODE>/papers/<file>.pdf                  → past paper
// (PDFs placed directly under library/<COURSE_CODE>/ are also treated as notes.)
//
// FILENAME PATTERNS (case-insensitive, underscores or hyphens or spaces work)
//   unit1.pdf                          → Unit 1, title "Unit 1"
//   unit1-Cells-and-Tissues.pdf        → Unit 1, title "Cells And Tissues"
//   unit1_Cells_and_Tissues.pdf        → same
//   1-Cells-and-Tissues.pdf            → same (leading "unit" optional)
//   Cells-and-Tissues.pdf              → no unit number, title "Cells And Tissues"
//
//   2024-Regular.pdf                   → year 2024, type Regular
//   2024-Supplementary-Anna.pdf        → year 2024, type Supplementary, university "Anna"
//   2024.pdf                           → year 2024, type Regular (default)
//
// SUBJECT METADATA (optional)
// You can drop a `_subject.json` file inside any course folder to override:
//   {
//     "syllabus": "https://r2.../custom.jpg",
//     "noteOverrides": { "<filename.pdf>": { "title": "...", "unit": 3 } }
//   }

import { readdirSync, statSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';

const LIB = 'library';
const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const PAPER_TYPES = ['Regular', 'Supplementary', 'Supp', 'Internal', 'Model', 'Practice'];

function lsDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map(name => {
    const p = join(dir, name);
    return { name, path: p, isDir: statSync(p).isDirectory() };
  });
}
function asUrl(p) {
  // Normalise Windows backslashes; site uses POSIX-style URLs.
  return p.split(/[\\/]+/).join(posix.sep);
}
function prettify(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
          .split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

function parseNote(filename) {
  // strip extension
  const base = filename.replace(/\.pdf$/i, '');
  // Capture optional "unit" prefix + a number, then optional separator, then title.
  const m = base.match(/^(?:unit[\s_-]*)?(\d{1,2})(?:[\s_-]+(.*))?$/i);
  if (m) {
    const unit = +m[1];
    const title = m[2] ? prettify(m[2]) : `Unit ${unit}`;
    return { unit, title };
  }
  return { unit: undefined, title: prettify(base) };
}

function parsePaper(filename) {
  const base = filename.replace(/\.pdf$/i, '');
  // Try "YYYY[-Type][-University]" or "YYYY"
  const m = base.match(/^(\d{4})(?:[\s_-]+([A-Za-z]+))?(?:[\s_-]+(.+))?$/);
  if (!m) return { title: prettify(base) };
  const year = +m[1];
  let type = m[2] ? capitalize(m[2]) : 'Regular';
  // Normalise common variants
  if (/^supp$/i.test(type)) type = 'Supplementary';
  if (!PAPER_TYPES.some(t => t.toLowerCase() === type.toLowerCase())) {
    // unknown 2nd token → treat as university
    return { year, type: 'Regular', university: prettify([m[2], m[3]].filter(Boolean).join(' ')), title: `${year} Regular` };
  }
  const university = m[3] ? prettify(m[3]) : undefined;
  return { year, type, university, title: `${year} ${type}${university ? ' · ' + university : ''}` };
}
function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s; }

function pdfsIn(dir) {
  return lsDir(dir).filter(e => !e.isDir && /\.pdf$/i.test(e.name));
}

function findSyllabus(subjDir) {
  for (const ext of IMG_EXT) {
    const p = join(subjDir, `syllabus.${ext}`);
    if (existsSync(p)) return asUrl(p);
  }
  return null;
}

function build() {
  const out = { version: 1, generatedAt: new Date().toISOString(), subjects: {} };
  if (!existsSync(LIB)) {
    console.log('library/ not found — writing empty manifest.');
    writeFileSync(join(LIB || '.', 'manifest.json'), JSON.stringify(out, null, 2));
    return;
  }

  const subjects = lsDir(LIB).filter(e => e.isDir).sort((a, b) => a.name.localeCompare(b.name));
  for (const sub of subjects) {
    const block = { notes: [], papers: [] };

    const syll = findSyllabus(sub.path);
    if (syll) block.syllabus = syll;

    // Optional manual override file.
    let overrides = {};
    const ovPath = join(sub.path, '_subject.json');
    if (existsSync(ovPath)) {
      try {
        overrides = JSON.parse(readFileSync(ovPath, 'utf8'));
        if (overrides.syllabus) block.syllabus = overrides.syllabus;
      } catch (e) { console.warn(`Could not parse ${ovPath}:`, e.message); }
    }
    const noteOv = overrides.noteOverrides || {};
    const paperOv = overrides.paperOverrides || {};

    // Notes: in /notes/ + any top-level PDFs that look like unit files
    const noteFiles = [
      ...pdfsIn(join(sub.path, 'notes')),
      ...pdfsIn(sub.path).filter(f => /^(unit[\s_-]*)?\d{1,2}/i.test(f.name)),
    ];
    for (const f of noteFiles) {
      const parsed = parseNote(f.name);
      const ov = noteOv[f.name] || {};
      block.notes.push({
        id: `${sub.name}-${f.name}`,
        unit:  ov.unit  ?? parsed.unit,
        title: ov.title || parsed.title,
        file:  asUrl(f.path),
      });
    }

    // Papers
    for (const f of pdfsIn(join(sub.path, 'papers'))) {
      const parsed = parsePaper(f.name);
      const ov = paperOv[f.name] || {};
      block.papers.push({
        id: `${sub.name}-papers-${f.name}`,
        year:       ov.year       ?? parsed.year,
        type:       ov.type       || parsed.type,
        university: ov.university || parsed.university,
        title:      ov.title      || parsed.title,
        file:       asUrl(f.path),
      });
    }

    block.notes.sort((a, b) => (a.unit ?? 99) - (b.unit ?? 99) || a.title.localeCompare(b.title));
    block.papers.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));

    // Only include subjects that have at least one item
    if (block.notes.length || block.papers.length || block.syllabus) {
      out.subjects[sub.name] = block;
    }
  }

  writeFileSync(join(LIB, 'manifest.json'), JSON.stringify(out, null, 2) + '\n');
  const n = Object.keys(out.subjects).length;
  const nn = Object.values(out.subjects).reduce((s, b) => s + b.notes.length, 0);
  const np = Object.values(out.subjects).reduce((s, b) => s + b.papers.length, 0);
  const ns = Object.values(out.subjects).filter(b => b.syllabus).length;
  console.log(`✔ Manifest built: ${n} subjects · ${nn} notes · ${np} papers · ${ns} syllabi`);
}

build();
