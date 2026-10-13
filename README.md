# Chokur System — Academic Grading Ledger

A KCSE-aligned academic grading and analysis ledger for Kenyan secondary schools, built with React 19 + TypeScript + Vite + Tailwind CSS 4.

## Features

- **Overview** — at-a-glance dashboard of the whole school: streams, enrolment, mean scores.
- **Marks Entry** — per-subject mark entry with support for `ABS` (absent) and blank marks; live grade calculation as you type.
- **Rankings** — student rankings by stream and overall, sorted by total points.
- **Subject Analysis** — per-subject mean, grade breakdown, and entry counts.
- **Grade Distribution** — school-wide grade histogram across the 12-band KCSE scale (A → E).
- **Report Cards** — printable per-student report cards with subject grades and points.
- **Students & Classes** — manage student records (admission number, stream, gender, KCPE marks, status).
- **Settings** — grading configuration and data management.

## KCSE Grading Scale

| Marks  | Grade | Points | Tier      | Description                |
| ------ | ----- | ------ | --------- | -------------------------- |
| 80–100 | A     | 12     | Honors    | Excellent                  |
| 75–79  | A-    | 11     | Honors    | Very Good                  |
| 70–74  | B+    | 10     | Honors    | Good                       |
| 65–69  | B     | 9      | Competent | Above Average              |
| 60–64  | B-    | 8      | Competent | Average                    |
| 55–59  | C+    | 7      | Competent | Competent (University Cutoff) |
| 50–54  | C     | 6      | Marginal  | Satisfactory               |
| 45–49  | C-    | 5      | Marginal  | Below Average              |
| 40–44  | D+    | 4      | Marginal  | Weak                       |
| 35–39  | D     | 3      | Critical  | Poor                       |
| 30–34  | D-    | 2      | Critical  | Very Poor                  |
| 0–29   | E     | 1      | Critical  | Critical / Fail            |

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables — copy `.env.example` to `.env.local` and set your Gemini API key:

   ```bash
   cp .env.example .env.local
   ```

   ```
   GEMINI_API_KEY="your-key-here"
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

## Available Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start dev server on port 3000     |
| `npm run build`  | Production build (outputs `dist/`) |
| `npm run preview`| Preview the production build      |
| `npm run lint`   | Type-check with `tsc --noEmit`    |
| `npm run clean`  | Remove `dist/` and `server.js`    |

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool and dev server
- **Tailwind CSS 4** — styling (via `@tailwindcss/vite`)
- **lucide-react** — icons
- **motion** — animations
- **@google/genai** — Gemini AI integration

## Project Structure

```
src/
├── App.tsx                  # Root component with view routing
├── main.tsx                 # Entry point
├── index.css                # Tailwind styles
├── components/              # Shared UI (Sidebar, TopNavBar, GradeChip)
├── context/
│   └── GradingContext.tsx   # Global grading state
├── data/
│   └── initialData.ts       # Seed data (students, subjects, streams)
├── types/
│   └── index.ts             # TypeScript types (Student, Subject, GradeResult…)
├── utils/
│   └── grading.ts           # KCSE grading engine (bands, points, tiers)
└── views/                   # One component per app view (8 views)
```

## Grading Engine

Marks are entered as numbers (0–100), `ABS` for absent students, or left blank.

- Grades map to the 12-band KCSE table above; each grade carries **points (12 → 1)**.
- Each grade belongs to a **tier** — `honors`, `competent`, `marginal`, `critical` — used for commentary and report-card remarks.
- `C+` (7 points) is the university minimum entry cutoff.
- Blank marks return "Not Entered"; `ABS` returns "Absent" — both score 0 points.

## License

MIT
