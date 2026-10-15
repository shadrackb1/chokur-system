<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Chokur System — KCSE Academic Management Platform

**Full-stack SaaS platform for Kenyan secondary schools** — Academic grading, student/parent portals, learning module, fee management, timetables, announcements, and official KNEC-compliant report cards.

## Features

### Core Academic (Teacher/Admin)
- **KCSE-Compliant Grading**: Best-7 aggregate (max 84 pts), 12-grade KCSE scale, C+ (6.5 pts) university cutoff
- **Spreadsheet Marks Entry**: Keyboard-driven, tabular, with CSV import/export
- **Official Report Cards**: A4 printable, KNEC-styled, principal seal, teacher remarks
- **Rankings & Analysis**: Live rankings, subject analysis, grade distribution, near-the-line tracking
- **Multi-stream, Multi-exam, Multi-term**: Full academic year management

### SaaS Platform (New)
- **Role-Based Access**: Admin, Teacher, Parent, Student — each with tailored dashboards
- **Student Portal**: View grades, track progress, see strengths/weaknesses, university qualification status
- **Parent Portal**: Monitor children's performance, fee balances, communication with teachers
- **Learning Module**: Question bank, practice quizzes, KCSE past papers, progress tracking
- **Fee Management**: Fee structures, M-Pesa/cash payments, student balances, collection reports
- **Timetables**: Visual weekly grid, drag-and-drop (admin), student/teacher views
- **Announcements**: School-wide communications with role/stream targeting, priority levels
- **Admin Dashboard**: School overview, subscription management, usage analytics

### Technical Excellence
- **Offline-First**: IndexedDB + localStorage dual-write, PWA with Service Worker
- **Hybrid Sync**: Seamless online/offline with Supabase real-time subscriptions
- **Responsive**: Mobile-first with bottom tab bar, tablet rail, desktop sidebar
- **Export/Print**: CSV (RFC 4180 + BOM), PDF report cards (jsPDF + html2canvas), broadsheet printing
- **Security**: Row-level security, JWT auth, audit logs, formula-injection-safe CSV

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

### Supabase Setup (for SaaS features)

1. Create a Supabase project at https://app.supabase.com
2. Run the SQL in `supabase_schema.sql` in the SQL Editor
3. Enable Realtime for: `marks`, `students`, `whatsapp_messages`, `fee_payments`, `announcements`
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`

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
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
4. **Deploy**

### Configuration Files

- `vercel.json` — Build output, SPA rewrites, security headers, PWA headers
- `.env.production.example` — Production environment variables reference
- `supabase_schema.sql` — Complete database schema with RLS policies

## Project Structure

```
src/
├── components/         # Reusable UI components
├── context/            # AuthContext, GradingContext, HybridGradingContext
├── data/               # Initial seed data
├── lib/                # IndexedDB, Supabase client, Supabase service layer
├── types/              # TypeScript interfaces (extended for SaaS)
├── utils/              # KCSE grading algorithms (pure functions)
└── views/              # 16 route views (core + SaaS)
    ├── OverviewView.tsx
    ├── MarksEntryView.tsx
    ├── RankingsView.tsx
    ├── SubjectAnalysisView.tsx
    ├── GradeDistributionView.tsx
    ├── ReportCardsView.tsx
    ├── StudentsClassesView.tsx
    ├── SettingsView.tsx
    ├── ProfileInboxView.tsx
    ├── StudentPortalView.tsx      # Student dashboard
    ├── ParentPortalView.tsx       # Parent dashboard
    ├── LearningModuleView.tsx     # Quizzes & practice
    ├── AdminDashboardView.tsx     # Admin overview
    ├── TeacherDashboardView.tsx   # Teacher overview
    ├── AnnouncementsView.tsx      # School communications
    ├── FeeManagementView.tsx      # Fees & payments
    └── TimetableView.tsx          # Weekly timetable grid
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Motion
- **State**: React Context + Hybrid (IndexedDB + Supabase)
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Auth**: Supabase Auth (email/password, roles)
- **Realtime**: Supabase Realtime subscriptions
- **Storage**: IndexedDB (idb) + localStorage fallback
- **PWA**: Workbox (vite-plugin-pwa)
- **PDF**: jsPDF + html2canvas
- **Testing**: Vitest + Playwright

## Role-Based Views

| Role | Views Accessible |
|------|-----------------|
| **Admin** | All views + Admin Dashboard, Fee Management, Timetable, Announcements, Settings |
| **Teacher** | Core academic + Teacher Dashboard, Marks Entry, Timetable, Announcements |
| **Parent** | Parent Portal, Announcements, Fee Balances |
| **Student** | Student Portal, Learning Module, Timetable, Announcements |

## License

Apache-2.0