<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Chokur System — KCSE Academic Grading Ledger

High-fidelity Kenyan secondary school (KCSE) academic grading ledger with spreadsheet marks entry, rankings, subject analysis, and official printable report cards.

## Features

- **9 Views**: Overview, Marks Entry, Rankings, Subject Analysis, Grade Distribution, Report Cards, Students & Classes, Settings, Profile & WhatsApp
- **KNEC-Compliant Grading**: Best-7 aggregate (max 84 pts), 12-grade KCSE scale, C+ (6.5 pts) university cutoff
- **Offline-First**: IndexedDB + localStorage dual-write, PWA with Service Worker
- **Responsive**: Mobile-first with bottom tab bar, tablet rail, desktop sidebar
- **Export/Print**: CSV (RFC 4180 + BOM), PDF report cards (jsPDF + html2canvas), broadsheet printing

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your GEMINI_API_KEY

# Run development server
npm run dev
```

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shadrackb1/chokur-system)

### Manual Setup

1. **Push to GitHub** (already done)
2. **Import in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import `shadrackb1/chokur-system`
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add Environment Variables** in Vercel Settings:
   - `GEMINI_API_KEY` — Get from [Google AI Studio](https://aistudio.google.com/apikey)
   - `APP_URL` — Your Vercel deployment URL (e.g., `https://chokur-system.vercel.app`)
4. **Deploy**

### Configuration Files

- `vercel.json` — Build output, SPA rewrites, security headers, PWA headers
- `.env.production.example` — Production environment variables reference

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # GradingContext (global state + persistence)
├── data/            # Initial seed data
├── lib/             # IndexedDB repository layer
├── types/           # TypeScript interfaces
├── utils/           # KCSE grading algorithms (pure functions)
└── views/           # 9 route views
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Motion
- IndexedDB (idb) + localStorage fallback
- PWA: Workbox (vite-plugin-pwa)
- PDF: jsPDF + html2canvas
- Testing: Vitest + Playwright

## License

Apache-2.0