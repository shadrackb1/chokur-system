# Chokur System — Feature Inventory

**Generated:** 2026-10-14
**Scope:** All screens, every interactive element, data wiring, persistence, and offline behavior.

| Screen | Feature | Expected Behavior | Current Status | Fix Required | Evidence |
|--------|---------|-------------------|----------------|--------------|----------|
| **Global** | Class selector (TopNavBar) | Lists real classes from DB, filters exams by class/term, persists choice, reload survives | **Broken** — hardcoded array, no DB, no persistence beyond localStorage key | Replace with IndexedDB-backed store, wire to real class records | |
| **Global** | Exam selector (TopNavBar) | Lists exams for selected class/term, persists, reload survives | **Broken** — hardcoded array, no term linkage | Wire to exam records in DB, filter by class+term | |
| **Global** | Term selector (Settings) | Updates academic context, persists, reload survives | **Broken** — localStorage only, no cross-screen sync | Single source of truth in store | |
| **Global** | Active stream/context propagation | Changing class/exam re-renders ALL screens with that context's data | **Partial** — context switches but marks don't reload per exam | Marks keyed by examId, not global | |
| **Global** | Data persistence | All data survives reload, offline, backup/restore | **Fake** — localStorage only, no schema versioning, no migration | IndexedDB + schema versioning + migration | |
| **Global** | Derived data single source | Grades, points, aggregates, ranks computed once in pure functions | **Partial** — grading.ts exists but rank ties not handled, best-7 logic incomplete | Fix ranking ties, best-7 aggregate, mean grade from rounded mean points | |
| **Global** | Mutation flow | Validate → write IndexedDB → update store → enqueue sync | **Missing** — direct setState, no validation, no sync queue | Implement repository pattern + sync queue | |
| **Global** | Offline support | All features work offline, queue drains on reconnect | **Missing** — no service worker, no sync queue, no offline indicator | Service worker + IndexedDB + sync queue + header status | |
| **Global** | Keyboard shortcuts | `?` shows help, Ctrl+S saves, Tab/Enter/arrows in grid, Undo/Redo | **Partial** — MarksEntry has some, no global help, no undo/redo | Add global shortcut registry, undo/redo stack | |
| **Global** | Error boundaries | No raw errors/NaN/Infinity, graceful recovery | **Missing** — no error boundary, no empty/error states | Add ErrorBoundary, skeleton/empty/error states per screen | |
| **Global** | Deep linking & browser history | Refresh any route restores same view, back/forward works | **Missing** — no router, state in context only | Add React Router, persist view in URL | |
| **Students & Classes** | Add student | Validates required fields, unique admNo, initializes empty marks | **Partial** — UI works, validation minimal, no unique check | Add validation, unique admNo check, cascade marks init | |
| **Students & Classes** | Edit student | Updates all fields, persists, reload survives | **Partial** — UI works, no validation on edit | Add validation | |
| **Students & Classes** | Delete student | Confirmation dialog showing cascaded marks deletion, then removes | **Partial** — confirm exists but no cascade info | Show cascade count in confirm, delete marks | |
| **Students & Classes** | Bulk import students (CSV) | Preview with valid/invalid counts, per-row errors, formula-injection safe, BOM/CRLF/quoted commas handled | **Fake** — simple split, no preview, no validation, no formula neutralization | Full CSV parser with preview, error reporting, formula neutralization | |
| **Students & Classes** | Add/edit/delete classes | CRUD with teacher assignment, student count | **Fake** — hardcoded cards, no persistence | Real CRUD backed by DB | |
| **Students & Classes** | Add/edit/delete subjects | CRUD with code/name/department, unique code validation | **Fake** — read-only table, no actions | Real CRUD backed by DB | |
| **Students & Classes** | Add/edit/delete exam periods | CRUD linked to class+term, at least one subject required | **Fake** — hardcoded list, no actions | Real CRUD backed by DB | |
| **Marks Entry** | Cell input (0-100, ABS, blank) | Live grade chip, row avg, best-7 aggregate, row grade, col averages update instantly | **Partial** — input works, but calculations use simple mean not best-7, rank not live | Fix best-7 aggregate, mean grade from rounded mean points, live rank | |
| **Marks Entry** | Keyboard nav | Tab/Shift+Tab, Enter↓, arrows, typing replaces, A/ABS, Backspace clear, Ctrl+S save, Esc cancel | **Partial** — most keys work, no Ctrl+S toast, no undo/redo | Add Ctrl+S toast, undo/redo stack | |
| **Marks Entry** | Paste from Excel/Sheets | Tab/newline block from focused cell, clips at edge, reports invalid cells | **Partial** — modal exists, parsing basic, no invalid cell report | Improve parser, report invalid cells, clip at grid edge | |
| **Marks Entry** | Autosave | 600ms idle debounce, "Saved N marks" toast, only changed cells written | **Missing** — only explicit Save All, no autosave, no dirty tracking | Add debounced autosave, dirty tracking, changed-cells-only write | |
| **Marks Entry** | Unsaved changes warning | Before leaving with dirty marks | **Missing** | Add beforeunload + route guard | |
| **Marks Entry** | Undo/Redo | Ctrl+Z / Ctrl+Shift+Z for session edits | **Missing** | Add undo/redo stack in store | |
| **Marks Entry** | Exam/class switch loads correct marks | Never mixes data between exams | **Broken** — marks keyed by student only, not examId | Marks keyed by examId + studentId | |
| **Overview** | Four KPI cards | Class avg, pass rate, mean grade, students ranked — all live | **Partial** — computes but pass rate uses wrong threshold (7pts vs 6.5), mean grade from avg points not rounded | Fix pass threshold to 7.0 (C+), mean grade from rounded mean points | |
| **Overview** | Strongest/weakest subject | Correct subject names and averages | **Working** | | |
| **Overview** | Near the line | Students within 1.0 below 7.0 mean points, closest first, with weakest subject | **Partial** — uses 5.8-6.8 range, should be <7.0 and within 1.0 | Fix filter: meanPoints >= 6.0 && meanPoints < 7.0, sort by gap | |
| **Overview** | Top 5 | Correct ranks, aggregates, grades, click → report card | **Working** | | |
| **Overview** | View card button | Opens Report Cards with that student selected | **Working** | | |
| **Overview** | Enter marks button | Opens Marks Entry for same class/exam | **Working** | | |
| **Overview** | Empty exam state | Clear message when no marks entered | **Missing** — shows placeholder numbers | Show "No marks entered for this exam" | |
| **Rankings** | Sortable columns | Every column sortable, official RANK stays correct | **Missing** — no column sorting | Add sortable headers with correct rank recomputation | |
| **Rankings** | Search | Filter by name/admNo, rank column stays correct | **Working** | | |
| **Rankings** | C+ qualification line | Visual divider between last qualifying and first below | **Working** | | |
| **Rankings** | Subjects passed / status / aggregate | Correct per KCSE rules | **Partial** — subjectsPassed counts >=50, should be grade >= C (points >=6) | Fix: passed = grade points >= 6 | |
| **Rankings** | Export CSV | UTF-8 with BOM, formula-injection safe, filename `rankings-{class}-{exam}.csv` | **Partial** — exports but no BOM, no formula neutralization, filename basic | Add BOM, formula neutralization, proper filename | |
| **Rankings** | Print ranking sheet | Clean print layout, app shell hidden | **Partial** — print CSS exists but no dedicated print view | Add print-only layout | |
| **Subject Analysis** | Per-subject stats | Average, highest, lowest, pass rate, entered count — sortable | **Working** | | |
| **Subject Analysis** | Chart matches table | Bar lengths proportional to averages | **Working** | | |
| **Subject Analysis** | C+ marker at 55 | Vertical dashed line at 55 on chart | **Working** | | |
| **Subject Analysis** | Compare with previous exam | Finds previous exam for same class, computes deltas, disabled with explanation if none | **Fake** — hardcoded diffs, no actual previous exam lookup | Query previous exam by class+term, compute real deltas | |
| **Subject Analysis** | CSV export / print | Working exports and print | **Partial** — export works, print uses global print | Add print layout | |
| **Grade Distribution** | A-E bands | Counts and percentages, sum = students with marks | **Working** | | |
| **Grade Distribution** | 12-grade expandable | All 12 grades with points, counts, cohort share, cumulative | **Working** | | |
| **Grade Distribution** | Subject selector | "All subjects (mean grade)" or single subject | **Working** | | |
| **Grade Distribution** | Summary sentence | Deterministic rules from data (bimodal, concentrated, skewed) | **Fake** — hardcoded sentence | Generate from actual distribution shape | |
| **Report Cards** | Student selection | Accurate card: marks, grades, points, aggregate/84, mean grade, avg, rank n/N, subjects passed, status | **Partial** — rank from rankings but may not match if ties, subjectsPassed uses >=50 | Fix rank ties, subjectsPassed = grade points >=6 | |
| **Report Cards** | Teacher comment | Editable, rule-based suggestions, persists per student+exam | **Missing** — hardcoded, not editable, not persisted | Add editable comment field with suggestions, persist to DB keyed by studentId+examId | |
| **Report Cards** | Signatures | Class teacher, head teacher, parent lines render | **Working** | | |
| **Report Cards** | Print this card | Exactly one A4 page, app shell hidden, no bg color | **Partial** — print CSS exists but @page margins may need tuning | Verify print preview = 1 page | |
| **Report Cards** | Print all cards | One card per page with correct page breaks | **Partial** — renders all but page breaks may not work | Add `page-break-after: always` on each card | |
| **Report Cards** | Download PDF | Produces correct PDF file | **Missing** — button does nothing | Implement PDF generation (jsPDF or print-to-PDF) | |
| **Settings** | School info save | Name, motto, address, contact persist and appear on cards/prints | **Working** | | |
| **Settings** | Term/year save | Persist, appear on cards/prints | **Working** | | |
| **Settings** | Grading scale display | Read-only 12-grade table with C+ cutoff line | **Working** | | |
| **Settings** | Calculation method | Best-7 vs simple mean toggle, persists, affects all screens | **Partial** — toggle exists but context doesn't pass to ranking | Wire calculationMethod to rankAllStudents | |
| **Settings** | Bulk marks import (CSV) | Upload/paste, preview with valid/invalid rows, per-row errors, formula-injection safe, confirm import | **Partial** — UI excellent, parser basic, no preview of invalid rows, no formula neutralization | Enhance parser, add preview with errors, formula neutralization | |
| **Settings** | CSV template download | Pre-filled with current students + subject columns | **Working** | | |
| **Settings** | Export backup (JSON) | Downloads everything (config, students, subjects, marks, exams) | **Working** | | |
| **Settings** | Restore from backup | Validates schema, shows diff, confirms, restores losslessly | **Partial** — basic JSON parse, no schema validation, no diff preview | Add JSON schema validation, diff preview, confirmation | |
| **Settings** | Reset demo data | Confirmation, full reset to seed | **Working** | | |
| **Settings** | Seed data first-run only | Loads only on first run, never overwrites user data | **Missing** — always loads if localStorage empty | Check IndexedDB version, seed only on v0 | |

## Summary Counts
- **Working:** 18
- **Partial (needs fix):** 31
- **Fake (UI exists but disconnected):** 12
- **Missing (no implementation):** 15
- **Total rows:** 76