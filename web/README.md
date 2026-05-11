# Career-Ops Dashboard

A personal web dashboard for tracking job applications. Built on top of the [career-ops](https://github.com/santifer/career-ops) CLI system — the dashboard gives you a visual interface to the same `applications.md` file you already use locally.

**Live at:** `https://career-ops-private.vercel.app`

---

## What it is

Instead of editing a markdown file by hand every time you want to check your pipeline or update a status, the dashboard gives you:

- A sortable, filterable table of all your applications
- Status dropdowns that write back to `applications.md` via a real git commit
- Per-company notes that save automatically
- Search by company or role name

It's a read/write interface on top of the file you already have. No database — just GitHub.

---

## How it works (the short version)

Your `data/applications.md` lives in this private GitHub repo. The dashboard reads it through the GitHub API and shows it as a table. When you change a status, the dashboard writes the updated file back to GitHub as a commit. You then `git pull` locally to get the change.

```
Your machine              GitHub repo               Vercel dashboard
────────────              ──────────────            ─────────────────
/career-ops {JD}          data/applications.md      reads file on load
  → updates local file                              writes file on status change
  → git push         ──►  synced                ◄──
                          git pull ◄──────────────  after status edits
```

---

## Tech stack

| What | Choice | Cost |
|------|--------|------|
| Framework | Next.js 15 (App Router, TypeScript) | free |
| Hosting | Vercel hobby tier | free |
| Data sync | GitHub Contents API | free |
| Notes storage | Vercel KV (Redis) | free |
| Styling | Tailwind CSS | free |

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

`data/applications.md` is gitignored by default (it's personal data). Force-add it to your private repo:

```bash
git add -f data/applications.md
git commit -m "data: add applications tracker"
git push origin main
```

### Step 2 — Create a GitHub PAT

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
2. Click **Generate new token**
3. Set Repository access → **Only select repositories** → pick your repo
4. Under Permissions → Contents → **Read and write**
5. Generate and copy the token (you won't see it again)

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import Git Repository
2. Select your private repo (click "Configure GitHub App" if it doesn't appear)
3. Set **Root Directory** to `web`
4. Set **Framework Preset** to **Next.js** ← this is critical, if wrong everything 404s
5. Click Deploy

### Step 4 — Add environment variables

In your Vercel project → Settings → Environment Variables, add these four:

| Variable | Value |
|----------|-------|
| `GITHUB_TOKEN` | Your PAT from Step 2 |
| `GITHUB_OWNER` | Your GitHub username |
| `GITHUB_REPO` | Your repo name (e.g. `career-ops-private`) |
| `GITHUB_BRANCH` | `main` |

Tip: use the **Import .env** button and paste the contents of `.env.local` directly.

### Step 5 — Redeploy

After adding env vars, go to Deployments → Redeploy. The dashboard will load with your applications.

---

## Daily workflow

**After a career-ops session (local → dashboard):**
```bash
git push origin main
```
The dashboard picks up new applications on next page load.

**After updating a status in the dashboard (dashboard → local):**
```bash
git pull
```
The dashboard commits the status change to GitHub, `git pull` brings it back to your machine.

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
| `KV_REST_API_URL` | For notes | Auto-set by Vercel when you link a KV store |
| `KV_REST_API_TOKEN` | For notes | Auto-set by Vercel when you link a KV store |

---

## Project structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                         # Sidebar + shell
│   │   ├── page.tsx                           # Redirects to /dashboard
│   │   ├── dashboard/page.tsx                 # Main tracker table
│   │   └── api/
│   │       ├── applications/route.ts          # GET — reads applications.md from GitHub
│   │       ├── applications/[id]/status/      # PATCH — writes status back to GitHub
│   │       ├── insights/[id]/route.ts         # GET/PUT — per-company notes (Vercel KV)
│   │       └── liveness/route.ts              # GET — checks if a job URL is still live
│   ├── components/
│   │   ├── ApplicationTable.tsx               # Table with filters, search, sort, status edit
│   │   └── StatusBadge.tsx                    # Color-coded status pill
│   └── lib/
│       ├── github.ts                          # GitHub Contents API client
│       ├── parser.ts                          # Parses applications.md into typed objects
│       ├── kv.ts                              # Vercel KV wrapper for notes
│       └── types.ts                           # TypeScript types
├── .env.local.example                         # Copy this to .env.local for local dev
├── next.config.ts
└── package.json
```

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

**Notes don't save**
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` are not set
- In Vercel: Storage → Create Database → KV → link to project → redeploy

---

## What's coming (V2)

Once you have API keys, the plan is to add a per-company AI panel:

- Task selector: Evaluate JD / Generate tailored CV / Write cover letter
- Provider selector: Claude, Gemini, GPT-4o-mini — your choice per task
- Custom instruction box: set your angle before generating
- Output streamed directly into the UI

Add your API keys to Vercel env vars and it'll be plug-and-play.
