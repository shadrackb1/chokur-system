# Chokur Academic Grading & Ledger System

A rigorous, paper-like editorial academic management system for Kenyan secondary schools (KCSE). Provides instant spreadsheet marks entry, automated ranking with the C+ university qualification threshold, subject lift/drag analytics, letter-grade distribution charts, authentic A4 student report cards, and student roster management.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the requirement clarification interview:
> - **Initial Dataset**: Pre-populated with realistic Form 4 East cohort records (42 students, 10 subjects: MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST) matching the design mockups.
> - **Export Capabilities**: Both authentic print-ready views (`@media print` formatted for physical A4 paper cards and ranking sheets) and direct CSV tabular export for spreadsheets.
> - **KCSE Calculation Standard**: Defaults to the standard KNEC Best-7 subject aggregate calculation (12-point scale: A=12 down to E=1), with an interactive toggle in Settings to switch between Best-7 and straight mean score calculation.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces manual paper ledger books and complex Excel sheets with a high-speed, distraction-free web ledger. Teachers can enter marks via keyboard, evaluate class standing against the national C+ university entry boundary, identify bottleneck subjects (like Chemistry drag), and generate printable official student report cards in seconds.
- **Target Audience / Persona**: High school teachers, directors of studies, class teachers, and principals in Kenya administering KCSE examinations (Form 1 through Form 4).
- **Key Value**: Eliminates grading calculation errors, provides immediate diagnostic feedback on subject performance, and formats official Ministry of Education / KNEC-style report cards without visual clutter or external software.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Metric Overview (`/overview`)**:
   - 4-metric ledger strip: Class Average (`58.4`), Pass Rate (`62%`), Mean Grade (`C+`), Students Ranked (`32` / `42`).
   - "Subjects at a Glance" comparing highest lift (Kiswahili 67.2) and lowest drag (Chemistry 43.5).
   - "Near the Line" ledger table highlighting students within 1 point of the C+ university threshold (Faith Wanjiru, Brian Otieno, Amina Hassan, Kevin Mutua) with instant "View card" links.
   - Top 5 leaderboard with monochrome KCSE honors chips and aggregate distribution progress bars.

2. **Marks Entry Spreadsheet Matrix (`/marks-entry`)**:
   - High-density spreadsheet with sticky student identifier column (Adm No. + Name) and 10 subject columns (`MAT`, `ENG`, `KIS`, `BIO`, `CHE`, `PHY`, `HIS`, `GEO`, `CRE`, `BST`).
   - Real-time computation of individual student Mean, Aggregate (/84), and Grade as keystrokes occur.
   - Live cell navigation: `Tab` (next cell), `Enter` (down column), arrow keys, and `'A'` key for Absent (`ABS`).
   - "Paste from Excel" modal allowing bulk TSV/CSV tab-delimited paste.
   - Bottom summary row displaying live subject averages and class mean.

3. **Merit Rankings (`/rankings`)**:
   - Full student rankings sorted by aggregate points / average.
   - Physical **C+ Qualification Cutoff Line** dividing qualifying university candidates from candidates below cutoff.
   - Real-time search filter by student name or admission number.
   - Action buttons: "Export CSV" and "Print ranking sheet".

4. **Subject Analysis & Diagnostics (`/subject-analysis`)**:
   - Horizontal benchmark bar chart (0–100 scale) with a dashed 55.0 C+ cutoff benchmark. Leading subjects rendered in solid carbon black, others in warm graphite grey.
   - Toggle: "Compare with previous exam" showing net progression (`↑ 3.2`, `↓ 1.8`).
   - Detailed departmental breakdown table (Average, Highest, Lowest, Pass Rate, Entered, vs Last Exam).
   - "Critical Drag Warning" editorial callout banner diagnosing underperforming subjects (e.g. Chemistry).

5. **Grade Distribution (`/grade-distribution`)**:
   - Aggregated 5-column letter frequency bar chart (A, B, C, D, E) with percentage shares.
   - Filter dropdown by subject or composite mean grade.
   - Detailed 12-Grade KNEC ledger table (`A`, `A-`, `B+`, `B`, `B-`, `C+`, `C`, `C-`, `D+`, `D`, `D-`, `E`) with student counts, cohort shares, and cumulative percentages.

6. **Student Report Cards (`/report-cards`)**:
   - Split-screen workspace: searchable student roster on the left; centered official A4 printable report card on the right.
   - Realistic archival school branding ("Kabarak Demo Secondary School"), student bio, KCPE entry marks, 10-subject table with marks, letter grades, points (/12), and custom teacher remarks.
   - Summary statistics grid (Best 7 aggregate, Mean Grade, Class average, Class position).
   - Official signature blocks for Class Teacher, Principal stamp, and Parent/Guardian.
   - Single-click "Print this card", "Download PDF" (browser print dialog), and "Print all cards for class".

7. **Students & Classes Management (`/students`)**:
   - Tabbed view: Students list (42 active), Classes & Streams, Subjects (10), Examination Periods.
   - Add/edit student modal with admission number, name, stream, gender, and status.
   - Quick CSV import modal for enrolling full classes at once.

8. **Settings & Archival Configuration (`/settings`)**:
   - School metadata (Name, Motto, Postal Address, Contact Phone/Email).
   - Term calendar (Academic Year 2026, Term 2, Opening/Closing dates).
   - Interactive KCSE 12-point grading scale table and calculation method switcher (KNEC Best-7 vs Simple Average).
   - Data management: Export JSON backup, restore from JSON, and reset to demo records.

### Visual Identity & "Editorial Ledger" Theme

- **Palette**:
  - Neutral Canvas: Unbleached stationery cream (`#FEF9EF` / `#F6F1E7`).
  - Panel Surfaces: Light parchment cream (`#FBF8F1`).
  - Primary Accent: Terracotta burnt orange (`#C2410C`), reserved strictly for active navigation pills, primary action buttons, active tab lines, and input focus rings.
  - Ink Typography: Deep carbon black (`#111111`) for titles, body text, and top honors.
  - Secondary Typography: Warm slate grey (`#5C5850`) for metadata and labels.
  - Dividers: Delicate 1px hairline rules (`#DDD6C7`) throughout; no heavy borders or card elevations.
- **Typography Pairing**:
  - `Inter` for interfaces, table headers, and editorial prose.
  - `JetBrains Mono` for all tabular numerals, marks, scores, aggregates, and admission numbers (`font-variant-numeric: tabular-nums`).
- **KCSE Grade Chip Hierarchy (Strict Monochrome)**:
  - **Honors (A, A-, B+)**: Solid carbon black fill (`#111111`), cream text (`#FBF8F1`), 2px radius.
  - **Competent (B, B-, C+)**: 1px solid black outline (`#111111`), transparent fill, black text.
  - **Marginal (C, C-, D+)**: 1px solid grey outline (`#5C5850`), transparent fill, slate text.
  - **Critical (D, D-, E)**: 1px dashed muted outline (`#9A958A`), transparent fill, muted text.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Authoritative Reactive Store with Local Persistence**:
  - *Approach*: Complete in-memory state store (React Context / custom reactive store) backed by `localStorage` and `IndexedDB`.
  - *Why*: Teachers often work in low-connectivity rural school compounds. The app operates 100% offline-first with immediate feedback and no cloud roundtrips for grading calculation.
- **Decision 2: High-Performance Editable Grid vs Form Fields**:
  - *Approach*: Custom keyboard-navigable spreadsheet table with single-key editing, direct arrow/tab movement, and instant formula updates.
  - *Why*: Inputting 420 subject marks into standard HTML form fields with validation lag creates severe teacher fatigue; an Excel-like grid feels natural and instantaneous.
- **Decision 3: Authentic Native `@media print` CSS for Report Cards**:
  - *Approach*: Clean CSS print stylesheets that format the report card onto standard A4 paper dimensions with proper margins, page breaks, and high-contrast typography, hiding navigation and chrome.
  - *Why*: Allows teachers to click "Print this card" or "Print all cards" and directly generate pixel-perfect physical transcripts or save to PDF via standard browser print.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CHOKUR SYSTEM APP                                │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  PERSISTENT SIDEBAR NAVIGATION       │  TOP CONTEXT APP BAR                 │
│  - Brand Logo & Version              │  - Active Class Selector             │
│  - 7 Views (Overview, Marks Entry,   │  - Term & Exam Context               │
│    Rankings, Subjects, Grade Dist,   │  - Offline / Saved Status Indicator  │
│    Report Cards, Students, Settings) │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│  CENTRAL DATA STORE & CALCULATION ENGINE (state/gradingContext.tsx)          │
│  - Students Roster (42 students, admNo, gender, stream)                     │
│  - Subjects Registry (10 subjects, codes, passMark, department)             │
│  - Marks Ledger (studentId x subjectId -> score | 'ABS' | null)             │
│  - KNEC Grading Rules (12-point boundaries, Best-7 calculation algorithm)   │
│  - School & Term Config (Kabarak Demo Secondary School, dates)              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ACTIVE VIEW COMPONENT                                                      │
│  ├── OverviewView (Stat strip, subjects glance, near-the-line, top 5)       │
│  ├── MarksEntryView (Editable matrix, paste modal, subject averages)        │
│  ├── RankingsView (Merit list, C+ qualification line, CSV & Print)          │
│  ├── SubjectAnalysisView (Bar chart, departmental breakdown, drag alert)    │
│  ├── GradeDistributionView (5-tier column chart, 12-tier KNEC table)        │
│  ├── ReportCardsView (Student list + Printable A4 report card preview)      │
│  ├── StudentsClassesView (Roster management, Add/Import CSV modals)         │
│  └── SettingsView (School info, grading scale config, JSON backup/restore)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
export interface Student {
  id: string;
  admNo: string;
  name: string;
  stream: string;
  gender: 'Male' | 'Female';
  kcpeMarks: number;
  status: 'Active' | 'Inactive';
}

export interface Subject {
  id: string;
  code: string;       // MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST
  name: string;
  department: string;
  entered: number;
  lastExamMean?: number;
}

export type MarkValue = number | 'ABS' | null;

export interface GradeResult {
  grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'E';
  points: number; // 12 down to 1
  tier: 'honors' | 'competent' | 'marginal' | 'critical';
  description: string;
}

export interface StudentCalculation {
  student: Student;
  marks: Record<string, MarkValue>;
  average: number;
  aggregate: number;    // best 7 points (out of 84)
  meanGrade: string;
  meanPoints: number;
  rank: number;
  subjectsPassed: number;
  weakestSubject?: { code: string; score: number };
  qualifies: boolean;   // mean grade >= C+ (7.00 pts)
}
```

### Component & State Interaction Mapping

- `MarksEntryView`: Editing a mark in cell `[studentId, subjectId]` immediately triggers recalculation of student aggregate, subject averages, and class rank; visual chip updates live in the cell.
- `NearTheLine` (in Overview) and `ReportCardView`: Clicking "View card" in Overview or selecting a student in Report Cards smoothly switches to the printable report card for that student.
- `SettingsView`: Changing grading parameters or school metadata immediately updates all report cards and rankings without page refresh.
- `CSV Exporter`: Generates standardized UTF-8 CSVs for Rankings, Subject Breakdown, and Grade Distribution tables.
