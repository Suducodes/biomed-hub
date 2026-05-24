# BioMed Hub

A free, student-built digital library for B.E. Biomedical Engineering (Regulation 2021, KPR Institute).

- **Curriculum browser** — all 4 years / 8 semesters, every subject from the R2021 syllabus
- **Notes per subject** — admin-curated PDFs ("Admin Notes") + each student's own private markdown notes ("My Notes")
- **Past papers** — semester / year / subject filters, in-browser preview, one-click download
- **Toolbox** — ECG simulator, biomed calculators (BMI · MAP · eGFR · CMRR · Nyquist · …), spaced-repetition flashcards, Pomodoro timer, concept map, syllabus chatbot
- **Personal extras** — gamified streaks / XP / badges, calendar, bookmarks
- **Zero backend** — plain HTML / CSS / ES modules. Notes & threads live in each browser's localStorage. PDFs are served as static files from your repo.

## Quick start (local)

```bash
cd biomed-hub
python -m http.server 8765
```

Open <http://127.0.0.1:8765>.

## Hosting on the cloud

See [DEPLOY.md](./DEPLOY.md) — recommended path is **GitHub Pages** (free forever, no server to manage). The deploy guide also covers how to upload PDFs over time without breaking a sweat.

## Project layout

```
biomed-hub/
├── index.html
├── css/styles.css
├── js/
│   ├── app.js          – entry, routes
│   ├── data.js         – R2021 curriculum (SUBJECTS, SEMESTERS, KB)
│   ├── storage.js      – localStorage + manifest fetcher
│   ├── router.js       – tiny hash router
│   ├── md.js           – markdown renderer
│   ├── ui.js           – shared components, sidebar, palette, DNA bg
│   └── pages/          – one file per route
├── library/
│   ├── manifest.json   – cloud library index (edit this to add PDFs)
│   └── <COURSE_CODE>/  – drop the PDFs in subject-coded folders
└── assets/
```

## Adding PDFs (zero JSON, zero git)

**Easiest:** open the live site → `#/admin` → paste a GitHub Personal Access Token once → drag PDFs into the dropzone. They commit straight to the repo; the auto-manifest Action picks them up within ~30 seconds. Full instructions in [DEPLOY.md](./DEPLOY.md).

**Or:** drag PDFs into folders directly on the GitHub web UI — the same Action handles them.

```
library/
  U21BM301/
    syllabus.jpg
    notes/
      unit1-Cells-and-Tissues.pdf
      unit2-Cardiovascular-System.pdf
      unit3-Nervous-System.pdf
    papers/
      2024-Regular.pdf
      2024-Supplementary.pdf
      2023-Regular.pdf
```

Filename conventions the Action recognises:
- `syllabus.jpg|png|webp` → the unit-wise syllabus image shown below the subject title
- `notes/unit<N>-<title>.pdf` → admin note, Unit N, titled from filename
- `papers/<YEAR>-<Type>.pdf` → past paper

Workflow:
1. On GitHub web UI → repo → `library/<COURSE_CODE>/notes/` → **Add file → Upload files** → drag PDFs → **Commit**
2. Wait ~1 minute. The Action runs, rebuilds `manifest.json`, and commits it back.
3. Done — every student sees the new content.

(For surgical edits, the in-app admin panel at `#/admin` is still there.)

## Where to host

You can run the whole library off **GitHub Pages alone for free** — recommended until you cross ~500 MB. For more, pair GitHub with **Cloudflare R2** (10 GB free, no bandwidth fees ever). See [DEPLOY.md](./DEPLOY.md) for both stacks.

## License

Open for personal and academic use. Course content and PDFs belong to their respective copyright holders — do not host material you don't have the right to share.
