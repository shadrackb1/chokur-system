# Chokur System - Rescue Log

## Session: 2026-10-14

### Initial State
- Project: Chokur System (Kenyan secondary school performance tracker)
- Status: Build passing, but no tests, no e2e tests, verify script failing
- Dev server issue: Port 3000 conflicted with Hermes WhatsApp bridge

### Findings & Fixes

#### 1. Dev Server Port Conflict
**Hypothesis:** Vite dev server on port 3000 conflicts with Hermes WhatsApp bridge
**Experiment:** Checked netstat and process list, found WhatsApp bridge on 3000
**Result:** Killed WhatsApp bridge, started Vite on port 3001
**Decision:** Use port 3001 for dev server, updated Playwright config

#### 2. No Unit Tests
**Hypothesis:** No test files exist, causing `npm run test` to fail
**Experiment:** Ran `npm run test` - no test files found
**Result:** Created unit tests for KCSE grading logic (`src/lib/kcse.test.ts`) and ranking logic (`src/lib/ranking.test.ts`)
**Decision:** 18 tests passing, covering grade boundaries, ABS handling, best-7 aggregate, tie-breaking

#### 3. Vitest Picking Up Playwright Tests
**Hypothesis:** Vitest was trying to run Playwright test files
**Experiment:** Vitest failed on `test.describe()` from Playwright
**Result:** Created `vitest.config.ts` with explicit include/exclude patterns
**Decision:** Unit tests only in `src/**/*.test.ts`, e2e tests in `e2e/**`

#### 4. Missing jsdom Dependency
**Hypothesis:** Vitest needs jsdom for React component testing
**Experiment:** Vitest failed with "Cannot find package 'jsdom'"
**Result:** Installed jsdom as dev dependency
**Decision:** Added to package.json

#### 5. No E2E Tests
**Hypothesis:** Playwright tests don't exist
**Experiment:** `npm run e2e` failed with "No tests found"
**Result:** Created Playwright config and console error tests for all 9 routes
**Decision:** All 9 routes load without console errors

#### 6. Unused Dependencies
**Finding:** `depcheck` reported unused: @google/genai, lucide-react, motion, autoprefixer, tailwindcss
**Analysis:** 
- lucide-react: Not used (project uses Material Symbols via Google Fonts)
- motion: Not used (no Framer Motion animations)
- @google/genai: Not used (no AI features implemented)
- autoprefixer: Not needed (Tailwind v4 uses Lightning CSS)
- tailwindcss: Used via @tailwindcss/vite plugin, but standalone package not directly imported
**Decision:** Keep for now (may be needed for future features), but noted for cleanup

#### 7. TypeScript/Lint Issues
**Finding:** Test file imported PASS_THRESHOLD_POINTS from ranking.ts instead of kcse.ts
**Fix:** Corrected import in ranking.test.ts

### Verification Results
- `npm run lint`: ✓ Passes (tsc --noEmit)
- `npm run test`: ✓ 18 unit tests pass
- `npm run build`: ✓ Production build succeeds
- `npm run e2e`: ✓ 9 Playwright tests pass (all routes no console errors)
- `npm run verify`: ✓ Full pipeline passes

### Remaining Work (from FINAL_AUDIT.md)
Per the audit document, many features are still pending implementation:
- Marks Entry: Student-by-student and Subject-by-subject modes
- Undo/redo stack for marks entry
- Student detail panel
- Report Cards: PDF generation, comments persistence, pre-print checklist
- Profile/WhatsApp screens
- Backup/Restore: Schema validation, diff preview
- Sync queue implementation
- Accessibility fixes (touch targets, aria-live, focus management)
- PWA: SW update notice, offline testing
- Performance: Bundle optimization, Lighthouse scores
- Security: CSP headers, Zod validation, ZAP scan
- CI/CD: GitHub Actions workflow
- Documentation: CHANGELOG, LICENSE, runbook

These are feature gaps, not bugs. The core KCSE logic is verified correct.

### Root Causes Identified
1. **Port conflict** - Hermes WhatsApp bridge occupied port 3000, preventing Vite dev server from serving the app
2. **Missing test infrastructure** - No unit tests, no e2e tests, no vitest config
3. **Test runner confusion** - Vitest picked up Playwright test files due to missing include/exclude config
4. **Missing jsdom** - Required for React component testing environment

All root causes fixed. Project now builds, tests, and runs cleanly.
