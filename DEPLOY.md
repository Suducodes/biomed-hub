# Hosting BioMed Hub (free, at scale)

This guide answers the real question: **where do I keep the website AND the gigabytes of PDFs, for free, forever?**

TL;DR — pick one of the two stacks below and you're done.

| Stack | Site code | PDFs / images | Storage cap (free) | Best for |
|---|---|---|---|---|
| **A. GitHub Pages + Cloudflare R2** ⭐ | GitHub Pages | Cloudflare R2 bucket | **10 GB free, no egress fees** | The whole library, long-term |
| **B. GitHub Pages only** | GitHub Pages | Same GitHub repo | **~1 GB soft, 5 GB hard** | Small library / getting started |
| **C. GitHub Pages + Google Drive** | GitHub Pages | Drive public links | **15 GB free** (shared with email) | Zero-setup option |

If you're not sure: **start with B (everything in one repo)**, and migrate the bulkiest PDFs to R2 (Stack A) when the repo crosses 500 MB.

---

## Sizing reality check

Rough budget for the full R2021 syllabus library:

- **Unit-wise notes** — 64 subjects × 5 units × 1.5 MB each ≈ **480 MB**
- **Past papers** — 64 subjects × 4 years × 2 papers × 400 KB ≈ **205 MB**
- **Syllabus images** — 64 subjects × 200 KB ≈ **13 MB**
- **Total: ~700 MB**

GitHub repo limits:
- Single file: **100 MB** (anything bigger needs Git LFS — avoid)
- Repo soft limit: 1 GB recommended
- Repo hard limit: 5 GB

GitHub Pages bandwidth: **100 GB / month soft limit**. If 200 students each download 500 MB of PDFs in a month, you're at 100 GB. Manageable, but R2 has *no* bandwidth limit at all.

**Verdict:** GitHub alone works fine until ~500 MB. Past that, switch to **Stack A**.

---

## Stack A — GitHub Pages + Cloudflare R2 (recommended)

The site code stays on GitHub. The PDFs sit in Cloudflare R2 (S3-compatible object storage with **no egress fees**). 10 GB of free storage, zero cost to serve them.

### One-time R2 setup (10 minutes)

1. Go to <https://dash.cloudflare.com> → sign up (free).
2. Sidebar → **R2 Object Storage** → **Create bucket** → name it `biomed-hub` → **Create**.
3. Bucket → **Settings** tab → **Public access** → **Allow Access** → **Connect Custom Domain**, or use R2.dev's auto domain.
   - The quickest path: enable the **r2.dev subdomain** (toggle in Settings). You'll get a public URL like
     `https://pub-xxxxxxxx.r2.dev` — every file you upload is reachable at
     `https://pub-xxxxxxxx.r2.dev/<filename>`.
4. Upload PDFs:
   - **Web UI:** bucket → **Objects** tab → **Upload** → drag-and-drop files. Use folder names like `U21BM301/unit1.pdf`.
   - **Bulk:** use [rclone](https://rclone.org/s3/) or [Cyberduck](https://cyberduck.io) (free) with your R2 access keys.

### Wiring it into BioMed Hub

Whenever you fill out the **File path** in `#/admin`, use the **full R2 URL** instead of a relative path:

```
https://pub-xxxxxxxx.r2.dev/U21BM301/unit1.pdf
```

That's it. The site reads the URL straight from the manifest, the student's browser downloads from R2 — GitHub Pages bandwidth untouched.

### Costs
- Storage: free up to 10 GB. After that, $0.015/GB-month (so 50 GB = ~$0.60/month).
- Egress (downloads): **always free**, no matter how many students download.

---

## Stack B — GitHub Pages only

Simplest option. Same repo holds the code and the PDFs.

### One-time setup

1. Create a free GitHub account at <https://github.com>.
2. New repo → name it `biomed-hub` → **Public**.
3. Upload the whole `biomed-hub/` folder contents:
   - Web UI: repo → **Add file → Upload files** → drag-drop the contents (not the folder itself).
   - CLI:
     ```bash
     cd biomed-hub
     git init
     git remote add origin https://github.com/<username>/biomed-hub.git
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git push -u origin main
     ```
4. Repo → **Settings → Pages** → Source = **Deploy from a branch**, branch `main`, folder `/ (root)` → **Save**.
5. Live in ~1 minute at `https://<username>.github.io/biomed-hub/`.

### Adding PDFs

1. On GitHub, navigate to `library/` → click the subject's folder (or **Add file → Create new file**, type `U21BM301/.gitkeep` to create the folder).
2. **Add file → Upload files** → drag in the PDFs → **Commit changes**.
3. Open the live site → press `Ctrl+K` → "Open admin panel" → fill the form (or paste many units at once in **Bulk add units**).
4. Click **Export merged manifest.json** → drop the downloaded file into `library/` on GitHub → **Commit**.
5. Done. **Clear drafts** in the admin panel.

---

## Stack C — Google Drive (zero infra)

Useful if you don't want a new account and already use Drive.

1. Upload your PDFs to a Drive folder.
2. Right-click any file → **Share** → **Anyone with the link** → **Copy link**. You'll get
   `https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing`.
3. For *direct* download/preview (the in-app Open button works better with this form):
   `https://drive.google.com/uc?export=download&id=<FILE_ID>`
4. Paste that URL into the **File path** field in `#/admin`.

Trade-off: Drive's preview UI is less polished than R2's direct PDF rendering, and link-share is per-file (no folder share).

---

## How the syllabus image works

In the admin panel → **Set syllabus image** tab → paste a URL or path to a JPG/PNG of the printed unit-wise syllabus page (one image per subject). Saved as `syllabus` field in the manifest:

```json
{
  "subjects": {
    "U21BM301": {
      "syllabus": "library/U21BM301/syllabus.jpg",
      "notes":   [ ... ],
      "papers":  [ ... ]
    }
  }
}
```

Renders right below the subject title — students see what they're getting before they download.

---

## What the `library/manifest.json` schema looks like

```json
{
  "version": 1,
  "subjects": {
    "U21BM301": {
      "syllabus": "library/U21BM301/syllabus.jpg",
      "notes": [
        { "id": "n1", "unit": 1, "title": "Cells & Tissues",          "file": "library/U21BM301/unit1.pdf", "addedAt": "2025-08-12" },
        { "id": "n2", "unit": 2, "title": "Cardiovascular System",    "file": "library/U21BM301/unit2.pdf", "addedAt": "2025-08-12" },
        { "id": "n3", "unit": 3, "title": "Nervous System",           "file": "https://pub-xxx.r2.dev/U21BM301/unit3.pdf" }
      ],
      "papers": [
        { "id": "p1", "year": 2024, "type": "Regular",       "title": "Reg-2024", "file": "library/U21BM301/papers/2024-reg.pdf", "university": "KPR Institute" },
        { "id": "p2", "year": 2024, "type": "Supplementary", "title": "Supp-2024","file": "library/U21BM301/papers/2024-supp.pdf","university": "KPR Institute" }
      ]
    }
  }
}
```

Every `file` field accepts either a relative path (GitHub-served) or a full URL (R2 / Drive / anywhere). Mix and match freely.

---

## Optional later: real backend for shared notes / forum

The current build keeps each student's notes and forum posts in their browser only (privacy by default, zero infra). If you want everyone to see the same threads and notes, the cheapest add-ons:

- **Supabase** — Postgres + Auth + Storage. Free tier ≈ 500 MB DB + 1 GB storage. JS SDK is a 30-line drop-in.
- **Firebase Firestore** — same shape, Google's version. Free tier is generous.
- **Cloudflare D1 + Workers** — SQLite at the edge. Tiny free tier, same provider as your R2.

Tell me when you're ready and I'll wire one in. None of them are needed for the library-style usage you described.

---

## Recap of the upload workflow (Stack A or B)

1. Drop PDFs into storage (R2 bucket OR `library/<code>/` folder on GitHub).
2. Open the site → `#/admin`.
3. Pick subject → "Bulk add units" → paste all unit lines → **Add all to drafts**.
4. (Optional) "Set syllabus image" → paste image URL → **Set as draft**.
5. (Optional) "Add paper" for each past paper.
6. Preview by clicking the subject — drafts show with an amber "draft (local)" chip.
7. **Export merged manifest.json** → commit it to `library/manifest.json` on GitHub.
8. **Clear drafts**. Done.

Net time per subject after the first one: ~2 minutes for a full 5-unit upload.
