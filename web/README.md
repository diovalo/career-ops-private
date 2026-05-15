# Career-Ops Dashboard

A personal web dashboard for tracking job applications. Built on top of the [career-ops](https://github.com/santifer/career-ops) CLI system — gives you a visual interface to the same files you already use locally, and lets you capture new companies from your phone.

**Live at:** `https://career-ops-private.vercel.app`

---

## What it does

| Feature | Description |
|---------|-------------|
| Application tracker | Sortable, filterable table of all applications with status dropdowns |
| Company detail page | Pipeline stepper, CV info, inline context fields, mode selector |
| Pipeline view | Kanban board — 8 columns (Evaluated → Offer, plus Rejected / Discarded / SKIP) |
| Add company (mobile) | Form to capture a new company from your phone → writes to `data/pipeline.md` |
| Per-company context | Contact name, LinkedIn, company URL, follow-up date, salary range — all synced to GitHub |
| Mode selector | Pick the next career-ops mode per company and copy the command to clipboard |
| Notes | Quick note popover in the table + full textarea on the detail page |
| Follow-up alerts | Orange banner when any follow-up date has passed |
| Stats bar | Total applications, response rate, interview rate |
| Guide tab | Full reference for all career-ops CLI commands |

No database. Everything syncs through GitHub.

---

## How it works

```
Your machine                   GitHub repo                    Vercel dashboard
────────────                   ──────────────                 ─────────────────
data/applications.md ──push──► data/applications.md ◄──────► reads on load
data/app-context.json          data/app-context.json          writes context on save
data/pipeline.md               data/pipeline.md ◄─────────── Add Company form
     ▲                                                              │
     └──── git pull ─────────────────────────────────────────── all writes
```

**Two files on GitHub are read/written by the dashboard:**
- `data/applications.md` — status changes write back as git commits
- `data/app-context.json` — per-company context (contact, notes, follow-up date, etc.)

**One file the dashboard adds to:**
- `data/pipeline.md` — the Add Company form appends entries here

After any dashboard write, run `git pull` locally to get the changes. The CLI can then read `app-context.json` directly.

---

## Tech stack

| What | Choice | Cost |
|------|--------|------|
| Framework | Next.js 15 (App Router, TypeScript) | free |
| Hosting | Vercel hobby tier | free |
| Data sync | GitHub Contents API | free |
| Context storage | `data/app-context.json` on GitHub (no KV) | free |
| Styling | Tailwind CSS | free |

---

## Pages

| Route | What it is |
|-------|------------|
| `/dashboard` | Main tracker table with stats, follow-up banner, filter tabs |
| `/dashboard/pipeline` | Kanban board — 8 status columns |
| `/applications/[id]` | Company detail: stepper, context fields, mode selector, notes |
| `/add` | Add a new company to pipeline (mobile-friendly) |
| `/guide` | Career-ops CLI command reference |

---

## Prerequisites

Before setting this up you need:

1. A **private GitHub repo** with your career-ops files (including `data/applications.md`)
2. A **GitHub Personal Access Token (PAT)** with read+write access to that repo
3. A **Vercel account** (free at vercel.com)
4. Node.js 18+ installed locally

---

## Setup guide

### Step 1 — Push your data to GitHub

`data/applications.md` is gitignored by default. Force-add it:

```bash
git add -f data/applications.md
git commit -m "data: add applications tracker"
git push origin main
```

### Step 2 — Create a GitHub PAT

1. GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
2. **Generate new token** → Repository access → Only select repositories → pick your repo
3. Permissions → Contents → **Read and write**
4. Copy the token (you won't see it again)

### Step 3 — Deploy to Vercel

1. vercel.com → Add New Project → Import Git Repository → select your repo
2. Set **Root Directory** to `web`
3. Set **Framework Preset** to **Next.js** ← critical, wrong preset causes all routes to 404
4. Click Deploy

### Step 4 — Add environment variables

Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `GITHUB_TOKEN` | Your PAT from Step 2 |
| `GITHUB_OWNER` | Your GitHub username |
| `GITHUB_REPO` | Your repo name (e.g. `career-ops-private`) |
| `GITHUB_BRANCH` | `main` |

Tip: use the **Import .env** button and paste the contents of `.env.local` directly.

### Step 5 — Redeploy

Deployments → Redeploy. The dashboard will load with your applications.

---

## Daily workflow

**After a career-ops session (local → dashboard):**
```bash
git push origin main
```
Dashboard picks up new applications on next page load.

**After updating status or context in the dashboard (dashboard → local):**
```bash
git pull
```
Status changes and context edits are committed to GitHub by the dashboard; `git pull` brings them to your machine.

**Adding a company from your phone:**
1. Open `/add` in the browser
2. Fill in company name, role, and the job URL
3. Paste the JD text if you have it (saved for CLI evaluation)
4. Submit → entry added to `data/pipeline.md` on GitHub
5. On your laptop: `git pull` then `/career-ops pipeline` to evaluate

---

## Local development

```bash
cd web
npm install
cp .env.local.example .env.local
# Fill in your values in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | PAT with Contents read+write |
| `GITHUB_OWNER` | Yes | Your GitHub username |
| `GITHUB_REPO` | Yes | Repository name |
| `GITHUB_BRANCH` | Yes | Branch to sync with (usually `main`) |

No KV store needed. Context is stored in `data/app-context.json` on GitHub.

---

## Project structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                              # Sidebar + nav
│   │   ├── page.tsx                                # Redirects to /dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                            # Tracker table + stats + banner
│   │   │   └── pipeline/page.tsx                   # Kanban board (8 columns)
│   │   ├── applications/[id]/page.tsx              # Company detail page
│   │   ├── add/page.tsx                            # Add company form (mobile)
│   │   ├── guide/page.tsx                          # CLI command reference
│   │   └── api/
│   │       ├── applications/route.ts               # GET — reads applications.md
│   │       ├── applications/[id]/status/route.ts   # PATCH — writes status to GitHub
│   │       ├── context/route.ts                    # GET — full app-context.json
│   │       ├── context/[id]/route.ts               # GET/PUT — per-company context
│   │       ├── pipeline/route.ts                   # POST — adds to pipeline.md
│   │       └── liveness/route.ts                   # GET — checks if job URL is live
│   ├── components/
│   │   ├── ApplicationTable.tsx                    # Table with filters, sort, note popover
│   │   └── StatusBadge.tsx                         # Color-coded status pill
│   └── lib/
│       ├── github.ts                               # GitHub Contents API client
│       ├── parser.ts                               # Parses applications.md into typed objects
│       ├── kv.ts                                   # Vercel KV wrapper (legacy, unused)
│       └── types.ts                               # TypeScript types
├── .env.local.example
├── next.config.ts
└── package.json
```

---

## Pipeline column meanings

| Column | Meaning |
|--------|---------|
| Evaluated | Report done, deciding whether to apply |
| Applied | Application sent |
| Responded | Company replied |
| Interview | In interview process |
| Offer | Offer received |
| Rejected | Company said no |
| Discarded | Link was dead or posting wasn't genuine |
| SKIP | Role not suitable — chose not to apply |

Hover over a column header in the pipeline view to see its tooltip.

---

## Common issues

**"Error: Failed to fetch" on the dashboard**
- Check `data/applications.md` is in the repo: `git ls-files data/applications.md`
- If missing: `git add -f data/applications.md && git push`
- Verify all 4 GitHub env vars are set in Vercel

**All routes return 404**
- Vercel → Project Settings → General → Framework Preset must be **Next.js** (not Other)
- Change it and redeploy

**Status update fails silently**
- Your PAT needs **Contents: Read and write** permission, not just read

**Context fields don't save**
- Check the browser console for API errors
- Verify `GITHUB_TOKEN` has write permission

**Add Company form fails**
- Same as above — `data/pipeline.md` is written via the GitHub API and needs write permission
