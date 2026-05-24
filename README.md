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

## Adding PDFs (the fast workflow)

Open the site → `Ctrl + K` → "Open admin panel". You get four tabs:

- **Add note** — single PDF, with optional Unit # and tags
- **Add paper** — past paper, with year / type / university
- **Set syllabus image** — one image per subject, shown under the title
- **Bulk add units** — paste many units at once in a single form:

  ```
  1 | Cells, Tissues & Homeostasis | library/U21BM301/unit1.pdf
  2 | Cardiovascular System        | library/U21BM301/unit2.pdf
  3 | Nervous System               | library/U21BM301/unit3.pdf
  ```

Add as many subjects' drafts as you want, preview them in the live subject pages (amber "draft (local)" chip), then click **Export merged manifest.json** and commit the file to `library/` on GitHub. Within a minute, every student sees the update.

Storage: GitHub handles ~500 MB before things slow down. For the full library (~700 MB+), pair GitHub Pages with **Cloudflare R2** (10 GB free, no egress fees) — see [DEPLOY.md](./DEPLOY.md).

## License

Open for personal and academic use. Course content and PDFs belong to their respective copyright holders — do not host material you don't have the right to share.
