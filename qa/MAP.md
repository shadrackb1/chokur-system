# Chokur System - Project Map

## Stack and Entry Points

**Framework:** React 19 + TypeScript + Vite 8
**Bundler:** Vite with @vitejs/plugin-react
**Styling:** Tailwind CSS v4 (via @tailwindcss/vite plugin)
**State Management:** Zustand 5 with persist middleware (localStorage)
**Data Layer:** IndexedDB via idb 8 (offline-first)
**Routing:** React Router DOM v7
**Testing:** Vitest (unit), Playwright (e2e)
**Icons:** Material Symbols Outlined (Google Fonts)

### Entry Point Chain
1. `index.html` → loads `/src/main.tsx` as module
2. `main.tsx` → creates React root, wraps with ErrorBoundary + ToastProvider + App
3. `App.tsx` → BrowserRouter + GradingProvider + routes

### Route Structure
**Public Routes (no shell):**
- `/welcome` - LandingPage
- `/demo` - DemoPage
- `/privacy` - PrivacyPage
- `/terms` - TermsPage
- `/brand` - BrandPage
- `/404` - NotFoundPage

**App Routes (with Sidebar + TopNavBar):**
- `/overview` - OverviewView (lazy)
- `/marks-entry` - MarksEntryView (lazy)
- `/rankings` - RankingsView (lazy)
- `/subject-analysis` - SubjectAnalysisView (lazy)
- `/grade-distribution` - GradeDistributionView (lazy)
- `/report-cards` - ReportCardsView (lazy)
- `/students` - StudentsClassesView (lazy)
- `/settings` - SettingsView (lazy)
- `/app/*` → redirects to `/overview`
- `/` → redirects to `/overview`
- `*` → NotFoundPage

### State Management
**Zustand Store (`src/lib/store.ts`):**
- UI state: activeView, selectedStudentId, activeClassId, activeExamId
- Data: schoolConfig, students, subjects, exams, classes, marks
- Computed: filteredStudents, rankings, classStats, subjectStats, gradeDistribution, nearTheLineStudents
- Actions: CRUD for all entities, import/export, backup/restore, sync queue
- Persisted to localStorage (partial: UI state + schoolConfig)

### Data Layer (IndexedDB)
**Schema (`src/lib/db/index.ts`):**
- schoolConfig, students, subjects, exams, marks, classes, settings, syncQueue, schemaVersion
- Version 2: Fixed syncQueue by-timestamp index

### Service Worker
- `public/sw.js` (built to `dist/sw.js`)
- Registered in index.html

### Environment Variables
- No `.env` file found
- `.env.example` exists with dummy values
- Vite config reads `DISABLE_HMR` for AI Studio compatibility

---

## Dependency Graph Problems

### Unused Dependencies (per depcheck)
| Package | Status | Notes |
|---------|--------|-------|
| @google/genai | Unused | No AI features implemented |
| lucide-react | Unused | Project uses Material Symbols |
| motion | Unused | No Framer Motion animations |
| autoprefixer | Unused | Tailwind v4 uses Lightning CSS |
| tailwindcss | Unused (dev) | Used via @tailwindcss/vite plugin only |

### Duplicate/Conflicting Versions
- No duplicate lockfiles (only package-lock.json)
- Single package.json
- No multiple React versions detected
- @types/react and @types/react-dom match React 19

---

## Mixed-Up Code Detection

### Single Source of Truth (Verified)
| Concern | Canonical File | Status |
|---------|----------------|--------|
| KCSE Grading Logic | `src/lib/kcse.ts` | ✓ Verified |
| Ranking Logic | `src/lib/ranking.ts` | ✓ Verified |
| State Store | `src/lib/store.ts` | ✓ Single |
| Database | `src/lib/db/index.ts` | ✓ Single |
| Types | `src/types/index.ts` | ✓ Single |
| CSV Parsing | `src/utils/grading.ts` | ✓ Single |
| Initial Data | `src/data/initialData.ts` | ✓ Single |

### No Duplicates Found
- No `kcse.jsx` / `kcse.ts` conflicts
- No `Rankings.tsx` / `Rankings.jsx` conflicts
- No `utils/` vs `lib/` grading duplicates
- No mixed JS/TS for same module
- No mixed module systems (all ESM with "type": "module")
- No mixed React versions
- No mixed JSX transforms

### Styling
- Single approach: Tailwind v4 via @tailwindcss/vite
- Design tokens in `src/styles/design-tokens.css`
- No CSS-in-JS, no competing stylesheets
- PostCSS not needed (Lightning CSS handles vendor prefixes)

### Routing
- Single router in App.tsx
- No duplicate route definitions
- Single App component
- Single entry point (main.tsx)

### Service Worker
- Single sw.js in public/
- No duplicate manifests

### AI Tool Artifacts
- `.aistudio/` directory exists (from Google AI Studio)
- No Lovable, Bolt, v0, Replit, Cursor artifacts detected
- No importmap scripts in index.html
- No CDN script tags duplicating bundled libs

### Half-Applied Refactors
- None detected - all imports resolve, types match

---

## Root Causes Fixed

1. **Port 3000 Conflict**: Hermes WhatsApp bridge occupied port 3000, preventing Vite from serving the app. Fixed by using port 3001.

2. **Missing Test Infrastructure**: No unit tests, no e2e tests, no vitest config. Fixed by creating tests and config.

3. **Vitest/Playwright Confusion**: Vitest picked up Playwright test files. Fixed with vitest.config.ts include/exclude.

4. **Missing jsdom**: Required for React testing. Installed as dev dependency.

---

## KCSE Logic Verification

All grade boundaries match KNEC specification:
- 80-100: A (12 pts)
- 75-79: A- (11 pts)
- 70-74: B+ (10 pts)
- 65-69: B (9 pts)
- 60-64: B- (8 pts)
- 55-59: C+ (7 pts) ← Pass threshold
- 50-54: C (6 pts)
- 45-49: C- (5 pts)
- 40-44: D+ (4 pts)
- 35-39: D (3 pts)
- 30-34: D- (2 pts)
- 0-29: E (1 pt)

Aggregate: Best 7 subjects, max 84 points
Ranking: Aggregate desc → Average desc → Name asc (competition ranking: 1,2,2,4)
ABS: Excluded from calculations
Null/undefined: Treated as "not entered" (0 points, not counted)

---

## Commands to Run

```bash
# Development
npm run dev          # Starts on port 3001 (configured)

# Production preview
npm run build        # Builds to dist/
npm run preview      # Serves dist on port 4173

# Quality checks
npm run lint         # tsc --noEmit
npm run test         # Vitest unit tests
npm run e2e          # Playwright e2e tests
npm run verify       # Full pipeline: lint + test + build + e2e
```

---

## Visual Identity (Do Not Change)

- Background: `--color-surface` (#FEF9EF, cream)
- Text: `--color-text-primary` (#111111, near-black)
- Accent: `--color-brand` (#C2410C, burnt orange) - interactive elements only
- Grade chips: Monochrome (tiers map to grayscale)
- Hairlines: `--color-hairline` (#DDD6C7)
- Fonts: Inter (UI), JetBrains Mono (tabular numbers), Material Symbols Outlined (icons)
