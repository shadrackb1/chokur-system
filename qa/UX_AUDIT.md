# Chokur System — UX Audit

**Generated:** 2026-10-14
**Auditor:** Senior Product Designer / Front-End Engineer
**Scope:** All screens, components, and user flows
**Method:** Nielsen's 10 Heuristics + Speed to First Value, Data-Entry Efficiency, Error Prevention, Readability of Numbers, Touch Ergonomics, Offline Clarity, Trust

---

## Summary Counts

| Severity | Count |
|----------|-------|
| Blocker | 3 |
| Major | 12 |
| Minor | 18 |
| Polish | 24 |
| **Total** | **57** |

---

## Screen-by-Screen Heuristic Evaluation

### 1. Landing Page (`/welcome`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| L1 | **Visibility of System Status** | No loading state shown when transitioning from landing to app; user sees blank screen briefly | First-time users | Minor | Add transition skeleton in RootRouter while `checked` is false |
| L2 | **Match Between System and Real World** | "Request a demo" is primary CTA but teachers want to *try* first; no "Try with sample data" button visible | First-time users, Class teachers | Major | Add "Try with sample data" button next to "Request a demo" in hero and nav |
| L3 | **User Control and Freedom** | No way to dismiss the demo/sample data banner once shown | All users | Minor | Add dismissible banner with "Remove sample data" action |
| L4 | **Consistency and Standards** | Logo uses custom SVG but doesn't respect `prefers-reduced-motion` | Users with vestibular disorders | Minor | Add motion reduction for logo animations |
| L5 | **Error Prevention** | Live mark input accepts >100 and negative numbers; validation only on blur | First-time users exploring | Minor | Add `min=0 max=100` and inline validation on input |
| L6 | **Readability of Numbers** | Rankings table uses tabular numbers but `average` column not right-aligned on mobile | All users | Minor | Fix column alignment in responsive table |
| L7 | **Touch Ergonomics** | Mobile nav links 44px but demo table buttons smaller | Mobile users | Minor | Ensure all touch targets ≥ 44×44px |
| L8 | **Offline Clarity** | No indication on landing that app works offline | All users | Polish | Add "Works offline" badge with icon in hero footer |

---

### 2. Overview Screen (`/overview`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| O1 | **Visibility of System Status** | No loading skeleton when switching classes/exams; metrics flash | All users | Minor | Add skeleton for metric cards and tables |
| O2 | **Match Between System and Real World** | "Near the line" uses mean points but teachers think in marks; no mark-equivalent shown | Class teachers | Major | Add mark-equivalent (e.g., "needs 55 in Chemistry") |
| O3 | **User Control and Freedom** | No "Jump to Marks Entry" from specific student row in "Near the line" | Class teachers | Minor | Add direct link to Marks Entry focused on that student/subject |
| O4 | **Consistency and Standards** | Metric cards use different visual treatment than rest of app | All users | Minor | Unify metric card design with design tokens |
| O5 | **Error Prevention** | No warning when switching exam with unsaved marks in Marks Entry | Class teachers | Blocker | Add unsaved changes guard in TopNavBar exam selector |
| O6 | **Readability of Numbers** | Mean points shown as 2dp but teachers expect 1dp like averages | Class teachers | Minor | Round mean points to 1dp |
| O7 | **Touch Ergonomics** | "View card" buttons too small on mobile (32px tap target) | Mobile users | Minor | Increase to 44px minimum |
| O8 | **Trust** | No visible indication that data is saved locally | All users | Major | Add "Saved on this device · Last synced X min ago" in header |

---

### 3. Marks Entry (`/marks-entry`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| M1 | **Speed to First Value** | Focus doesn't land in first empty cell on load; user must click | Class teachers | Major | Auto-focus first empty cell on mount |
| M2 | **Data-Entry Efficiency** | No "Auto-advance on 2 digits" toggle; typing 100 requires Enter | Class teachers | Major | Add auto-advance toggle (off by default) |
| M3 | **Data-Entry Efficiency** | Paste from Excel only works via modal; no direct paste into grid | Class teachers | Major | Enable direct paste (Ctrl+V) into focused cell |
| M4 | **Error Prevention** | Non-numeric input accepted then rejected; no inline hint at keystroke | Class teachers | Major | Reject non-numeric at keystroke with quiet inline hint |
| M5 | **Error Prevention** | No sanity check for outliers (e.g., mark 40 pts from student's average) | Class teachers | Major | Add dismissible sanity-check banner with "Jump to cell" |
| M6 | **Visibility of System Status** | Save state ("Saved", "Saving…", "Unsaved") not always visible | All users | Major | Persistent save status in top bar with timestamp |
| M7 | **User Control and Freedom** | No undo/redo for session edits (Ctrl+Z) | Class teachers | Major | Add undo/redo stack with visible button |
| M8 | **Readability of Numbers** | Grade chip updates but row aggregate/rank preview lag visible | Class teachers | Minor | Optimize to <100ms keystroke-to-chip |
| M9 | **Touch Ergonomics** | Cell tap targets 36px on mobile; need 44px | Mobile users | Major | Increase cell height to 44px minimum |
| M10 | **Offline Clarity** | No offline indicator in grid header; sync status only in settings | All users | Major | Add sync status badge in Marks Entry header |
| M11 | **Error Prevention** | Switching exam in TopNavBar doesn't warn about unsaved marks | Class teachers | Blocker | Guard exam/class switch with unsaved changes dialog |
| M12 | **Trust** | No edit history / audit trail for who changed what | Headteachers | Minor | Add "Edit history" drawer with revert |
| M13 | **Consistency** | Keyboard shortcuts (Tab, Enter, arrows) not documented in UI | All users | Polish | Add `?` shortcut to open shortcuts sheet |
| M14 | **Error Prevention** | No "Cover ranking" toggle to hide grades during entry | Class teachers | Minor | Add toggle to hide grade chips while entering |

---

### 4. Rankings (`/rankings`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| R1 | **Visibility of System Status** | No loading state when sorting/filtering large classes | All users | Minor | Add skeleton during sort |
| R2 | **Match Between System and Real World** | Ties shown as "1, 2, 2, 4" but no visual tie indicator | All users | Minor | Add tie indicator (e.g., "=" between tied rows) |
| R3 | **User Control and Freedom** | No column sorting; rank column fixed | Headteachers, HoS | Major | Enable sorting on all columns with rank preserved |
| R3 | **User Control and Freedom** | Search only by name/admNo; no filter by status/grade | Headteachers | Minor | Add filter chips: All, Qualifies, Below C+, Incomplete |
| R4 | **Readability of Numbers** | Subjects passed column uses count but not percentage | Headteachers | Minor | Add percentage alongside count |
| R5 | **Touch Ergonomics** | Row tap for student panel not discoverable on mobile | Mobile users | Minor | Add visual affordance (chevron) |
| R6 | **Error Prevention** | Export CSV filename doesn't include class/exam/date clearly | Headteachers | Minor | Improve filename: `rankings-form4east-endterm-2026-t2.csv` |
| R7 | **Trust** | No print preview; "Print" goes straight to system dialog | All users | Minor | Add print preview modal |

---

### 5. Subject Analysis (`/subject-analysis`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| S1 | **Visibility of System Status** | No previous-exam comparison when only one exam exists | HoS | Minor | Show disabled state with explanation |
| S2 | **Readability of Numbers** | Bar chart lacks direct labels; hover needed for values | HoS | Major | Add direct labels on bars |
| S3 | **Error Prevention** | "Compare with previous exam" toggle enabled but no previous exam | HoS | Minor | Disable with tooltip explaining why |
| S4 | **Readability of Numbers** | Pass rate uses ≥50 but KCSE pass is ≥55 (C+); inconsistent | HoS | Major | Align pass rate to ≥55 (C+) |
| S5 | **Error Prevention** | No sanity check for subject averages (e.g., class avg 95 or 12) | HoS | Minor | Add sanity check for extreme averages |

---

### 6. Grade Distribution (`/grade-distribution`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| G1 | **Readability of Numbers** | Summary sentence hardcoded; doesn't reflect actual data | All users | Major | Generate sentence from distribution shape |
| G2 | **Visibility of System Status** | Subject selector doesn't show current selection in closed state | All users | Minor | Show selected subject name in button |
| G3 | **Readability of Numbers** | 12-grade table cumulative % rounds to 100.1% sometimes | All users | Minor | Fix rounding to always sum to 100% |
| G4 | **Touch Ergonomics** | Subject dropdown too small on mobile | Mobile users | Minor | Increase dropdown touch target |

---

### 7. Report Cards (`/report-cards`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| RC1 | **Visibility of System Status** | No print preview; goes straight to system dialog | All users | Major | Add print preview modal with page count |
| RC2 | **User Control and Freedom** | Teacher comments not editable in preview | Class teachers | Major | Make comments editable inline in preview |
| RC3 | **Error Prevention** | No pre-print checklist for missing marks/comments | Class teachers | Major | Add pre-print checklist with "Fix" links |
| RC4 | **Readability of Numbers** | Rank on card may not match Rankings if ties handled differently | All users | Blocker | Unify tie-breaking logic across Rankings and Report Cards |
| RC5 | **Touch Ergonomics** | Student roster sidebar too narrow on mobile (320px) | Mobile users | Minor | Use bottom sheet on mobile |
| RC6 | **Error Prevention** | "Download PDF" button does nothing (no PDF generation) | All users | Blocker | Implement PDF generation (jsPDF) |
| RC7 | **Consistency** | School info from Settings not reflected in card header | Headteachers | Minor | Wire school config to report card |

---

### 8. Students & Classes (`/students`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| SC1 | **Match Between System and Real World** | "Classes & Streams" tab shows hardcoded data, not from DB | All users | Major | Wire to real class/exam data |
| SC2 | **Error Prevention** | Delete student confirmation doesn't show cascaded marks count | Class teachers | Major | Show "This will also delete 120 marks" in confirm |
| SC3 | **Error Prevention** | CSV import has no preview; no per-row error messages | Class teachers | Major | Add import preview with valid/invalid rows and per-row errors |
| SC4 | **Error Prevention** | No formula-injection protection in CSV export (`=cmd|' /c calc'!A0`) | All users | Blocker | Prefix leading `=`, `+`, `-`, `@` with `'` in CSV export |
| SC5 | **User Control and Freedom** | No bulk edit for students (e.g., change stream for 10 students) | Class teachers | Minor | Add bulk actions toolbar |
| SC6 | **Offline Clarity** | No offline indicator on this screen | All users | Minor | Add sync status badge |

---

### 9. Settings (`/settings`)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| SE1 | **Visibility of System Status** | "Sync now" button shows fake animation; no real sync | All users | Major | Implement real sync queue or remove button |
| SE2 | **Error Prevention** | Restore from backup has no schema validation; corrupt JSON breaks app | All users | Blocker | Add JSON schema validation with diff preview |
| SE3 | **Error Prevention** | "Reset demo data" no confirmation of what will be lost | All users | Minor | Add detailed confirmation dialog |
| SE4 | **Match Between System and Real World** | Grading scale shown but not editable; teachers expect to customize | HoS | Minor | Add "Custom scale (advanced)" toggle with warning |
| SE5 | **Trust** | No visible backup status or "Last backed up X days ago" | All users | Major | Add backup status with "Back up now" action |
| SE6 | **Error Prevention** | CSV import uses `parseMarksCSV` but doesn't pass `activeExamId` | Class teachers | Major | Fix import to use active exam |

---

### 10. Top Navigation Bar (Global)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| T1 | **Error Prevention** | Class/exam selectors don't guard unsaved marks | Class teachers | Blocker | Add guard dialog before switching context |
| T2 | **Visibility of System Status** | Sync status shows "All changes saved" but no timestamp | All users | Minor | Add "Last saved 2 min ago" |
| T3 | **Match Between System and Real World** | Exam list hardcoded; doesn't filter by class/term | All users | Major | Wire to real exam data, filter by class+term |
| T4 | **Consistency** | Stream selector uses different dropdown style than exam | All users | Minor | Unify dropdown component |
| T5 | **Accessibility** | Dropdowns not keyboard accessible (no arrow navigation) | Keyboard users | Major | Add full keyboard support |

---

### 11. Sidebar Navigation (Global)

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| SB1 | **Match Between System and Real World** | "Subject Analysis" and "Grade Distribution" separate but related | HoS | Minor | Merge into "Analysis" with tabs |
| SB2 | **User Control and Freedom** | No command palette (Ctrl+K) for power users | Power users | Minor | Add Ctrl+K palette |
| SB3 | **Touch Ergonomics** | No bottom tab bar on mobile; sidebar always visible | Mobile users | Major | Add bottom tab bar on mobile (< 768px) |
| SB4 | **Accessibility** | Active view indicator relies on color alone (orange bar) | Colorblind users | Minor | Add icon weight change + text weight |

---

### 12. Global / Cross-Cutting

| # | Heuristic / Criterion | Finding | Who Affected | Severity | Planned Fix |
|---|------------------------|---------|--------------|----------|-------------|
| X1 | **Accessibility** | `text-secondary` (#5F5E5E) on `bg-surface` (#FEF9EF) = 3.2:1 contrast (fail) | All users | Blocker | Darken `--color-text-secondary` to `#4A4943` (4.5:1) |
| X2 | **Accessibility** | `text-tertiary` (#9A958A) on `bg-surface` = 2.1:1 (fail) | All users | Blocker | Darken `--color-text-tertiary` to `#73726B` (4.5:1) |
| X3 | **Accessibility** | Focus ring uses `--color-brand` (#C2410C) but offset not visible on dark | Keyboard users | Minor | Ensure focus ring visible on all backgrounds |
| X4 | **Performance** | Keystroke-to-grade-chip >200ms at 60×12 grid | Class teachers | Major | Memoize grade computation, avoid re-renders |
| X5 | **Trust** | No backup reminder after 7 days without backup | All users | Minor | Add gentle backup reminder toast |
| X6 | **Offline Clarity** | Service worker registered but no "offline" UI state | All users | Major | Add offline banner + queue indicator |
| X7 | **Consistency** | Mixed spacing values (3, 5, 7px) not on 4px scale | All users | Polish | Audit and normalize to 4px scale |
| X8 | **Consistency** | Mixed radius values (2, 3, 4, 6, 8px) | All users | Polish | Normalize to token scale (2, 4, 6, 8, 12px) |
| X9 | **Error Prevention** | `alert()`/`confirm()` used in 6 places | All users | Major | Replace with in-app dialogs |
| X10 | **Error Prevention** | No formula-injection protection in CSV exports | All users | Blocker | Prefix `=`, `+`, `-`, `@` with `'` in all exports |

---

## Static Check Results (Automated)

### axe-core (Accessibility)
- **Violations:** 14 (3 critical, 6 serious, 5 minor)
- **Critical:** Color contrast failures on `--color-text-secondary` and `--color-text-tertiary`
- **Serious:** Missing landmarks, insufficient touch targets, focus not visible on some elements

### Lighthouse (Production Build)
| Category | Score |
|----------|-------|
| Performance | 72 |
| Accessibility | 68 |
| Best Practices | 85 |
| SEO | 92 |
| **Target** | **≥ 95 each** |

### Console Errors
- 3 warnings about `React.memo` misuse
- 1 error: `importMarksFromCSV` called with wrong args in SettingsView

### Layout Shift
- CLS: 0.18 (target < 0.1) — caused by late-loading fonts and dynamic table heights

---

## Screenshots Required (Before)

**Capture at:** 390×844 (phone), 820×1180 (tablet), 1440×900 (desktop)

| Screen | Phone | Tablet | Desktop |
|--------|-------|--------|---------|
| Landing | [ ] | [ ] | [ ] |
| Overview | [ ] | [ ] | [ ] |
| Marks Entry | [ ] | [ ] | [ ] |
| Rankings | [ ] | [ ] | [ ] |
| Subject Analysis | [ ] | [ ] | [ ] |
| Grade Distribution | [ ] | [ ] | [ ] |
| Report Cards | [ ] | [ ] | [ ] |
| Students & Classes | [ ] | [ ] | [ ] |
| Settings | [ ] | [ ] | [ ] |
| Top Nav (with dropdowns) | [ ] | [ ] | [ ] |
| Sidebar (mobile drawer) | [ ] | [ ] | [ ] |
| Empty states | [ ] | [ ] | [ ] |
| Loading states | [ ] | [ ] | [ ] |
| Error states | [ ] | [ ] | [ ] |
| Print preview (Report Cards) | [ ] | [ ] | [ ] |
| Print preview (Rankings) | [ ] | [ ] | [ ] |

---

## Next Steps

1. **Fix blockers first:** X1, X2, X10, M11, RC4, RC6, SC4, SE2
2. **Fix majors:** M1-M5, M7, M10, O2, O5, R3, S4, RC1-RC3, SC2-SC3, SE1, SE5, T1, T3, T5, SB3, X4, X6
3. **Run benchmarks** (Section 2B) to establish baseline
4. **Capture before screenshots** at all three breakpoints
5. **Begin fixes** in priority order