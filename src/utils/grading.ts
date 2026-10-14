/**
 * KCSE 12-Point Grading & Ranking Pure Algorithms
 * Official Kenya National Examinations Council (KNEC) Rules
 */

import {
  GradeResult,
  KCSEGrade,
  MarkValue,
  Student,
  StudentCalculation,
  Subject,
} from '../types';

export const KCSE_GRADING_TABLE: Array<{
  min: number;
  max: number;
  grade: KCSEGrade;
  points: number;
  tier: 'honors' | 'competent' | 'marginal' | 'critical';
  description: string;
}> = [
  { min: 80, max: 100, grade: 'A', points: 12, tier: 'honors', description: 'Excellent' },
  { min: 75, max: 79, grade: 'A-', points: 11, tier: 'honors', description: 'Very Good' },
  { min: 70, max: 74, grade: 'B+', points: 10, tier: 'honors', description: 'Good' },
  { min: 65, max: 69, grade: 'B', points: 9, tier: 'competent', description: 'Above Average' },
  { min: 60, max: 64, grade: 'B-', points: 8, tier: 'competent', description: 'Average' },
  { min: 55, max: 59, grade: 'C+', points: 7, tier: 'competent', description: 'Competent (University Cutoff)' },
  { min: 50, max: 54, grade: 'C', points: 6, tier: 'marginal', description: 'Satisfactory' },
  { min: 45, max: 49, grade: 'C-', points: 5, tier: 'marginal', description: 'Below Average' },
  { min: 40, max: 44, grade: 'D+', points: 4, tier: 'marginal', description: 'Weak' },
  { min: 35, max: 39, grade: 'D', points: 3, tier: 'critical', description: 'Poor' },
  { min: 30, max: 34, grade: 'D-', points: 2, tier: 'critical', description: 'Very Poor' },
  { min: 0, max: 29, grade: 'E', points: 1, tier: 'critical', description: 'Critical / Fail' },
];

/**
 * Validate and clean a mark input value.
 * Accepts: numbers 0-100, 'ABS', or null/undefined.
 * Rejects: letters other than ABS, negative numbers, >100.
 */
export function sanitizeMarkInput(input: any): MarkValue {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim().toUpperCase();
    if (trimmed === 'ABS' || trimmed === 'ABSENT' || trimmed === 'A') {
      return 'ABS';
    }
    if (trimmed === '' || trimmed === '-' || trimmed === '—') {
      return null;
    }
    const num = Number(trimmed);
    if (isNaN(num)) {
      return null;
    }
    return Math.max(0, Math.min(100, Math.round(num)));
  }
  if (typeof input === 'number') {
    if (isNaN(input)) return null;
    return Math.max(0, Math.min(100, Math.round(input)));
  }
  return null;
}

/**
 * Converts a subject score to KCSE Grade and Points.
 * Null means not entered; 'ABS' means absent.
 */
export function getGradeFromScore(score: MarkValue): GradeResult {
  if (score === null || score === undefined) {
    return {
      grade: 'E',
      points: 0,
      tier: 'critical',
      description: 'Not Entered',
    };
  }

  if (score === 'ABS') {
    return {
      grade: 'E',
      points: 0,
      tier: 'critical',
      description: 'Absent',
    };
  }

  const num = Math.round(Number(score));
  const clamped = Math.max(0, Math.min(100, num));

  for (const item of KCSE_GRADING_TABLE) {
    if (clamped >= item.min && clamped <= item.max) {
      return {
        grade: item.grade,
        points: item.points,
        tier: item.tier,
        description: item.description,
      };
    }
  }

  return { grade: 'E', points: 1, tier: 'critical', description: 'Critical / Fail' };
}

/**
 * Maps average points to KCSE letter grade according to KNEC rounded mean thresholds.
 */
export function getGradeFromPoints(points: number): KCSEGrade {
  if (points >= 11.5) return 'A';
  if (points >= 10.5) return 'A-';
  if (points >= 9.5) return 'B+';
  if (points >= 8.5) return 'B';
  if (points >= 7.5) return 'B-';
  if (points >= 6.5) return 'C+';
  if (points >= 5.5) return 'C';
  if (points >= 4.5) return 'C-';
  if (points >= 3.5) return 'D+';
  if (points >= 2.5) return 'D';
  if (points >= 1.5) return 'D-';
  return 'E';
}

/**
 * Calculates academic standing for a single candidate.
 * - Best 7 subjects points sum (max 84).
 * - Fewer than 7 subjects marked as incomplete.
 * - ABS excluded from average and point sum.
 */
export function calculateStudentStanding(
  student: Student,
  marks: Record<string, MarkValue>,
  subjects: Subject[],
  calculationMethod: 'best7' | 'simpleMean' = 'best7'
): StudentCalculation {
  const numericScores: Array<{ code: string; score: number; points: number }> = [];

  subjects.forEach((subj) => {
    const val = marks[subj.code];
    if (typeof val === 'number') {
      const g = getGradeFromScore(val);
      numericScores.push({ code: subj.code, score: val, points: g.points });
    }
  });

  const enteredSubjectsCount = numericScores.length;
  const isIncomplete = enteredSubjectsCount < 7;
  const subjectsPassed = numericScores.filter((s) => s.score >= 50).length;

  let totalScore = 0;
  numericScores.forEach((s) => (totalScore += s.score));
  const rawAverage = enteredSubjectsCount > 0 ? totalScore / enteredSubjectsCount : 0;

  // Identify strongest and weakest subject
  let strongestSubject: { code: string; score: number } | undefined;
  let weakestSubject: { code: string; score: number } | undefined;

  if (enteredSubjectsCount > 0) {
    const sortedByScore = [...numericScores].sort((a, b) => b.score - a.score);
    strongestSubject = { code: sortedByScore[0].code, score: sortedByScore[0].score };
    weakestSubject = {
      code: sortedByScore[sortedByScore.length - 1].code,
      score: sortedByScore[sortedByScore.length - 1].score,
    };
  }

  let aggregate = 0;
  let meanPoints = 0;

  if (calculationMethod === 'best7') {
    // Sort descending by points, take top 7
    const sortedByPoints = [...numericScores].sort((a, b) => b.points - a.points);
    const best7 = sortedByPoints.slice(0, 7);
    aggregate = best7.reduce((acc, curr) => acc + curr.points, 0);
    // KNEC standard: divide by 7 (or entered count if fewer than 7)
    meanPoints = aggregate / 7;
  } else {
    // Straight arithmetic mean of all entered subjects
    const totalPoints = numericScores.reduce((acc, curr) => acc + curr.points, 0);
    aggregate = totalPoints;
    meanPoints = enteredSubjectsCount > 0 ? totalPoints / enteredSubjectsCount : 0;
  }

  const roundedMeanPoints = Math.round(meanPoints * 100) / 100;
  const meanGrade = getGradeFromPoints(roundedMeanPoints);
  // University qualification requires Grade C+ and above (benchmark 6.5+ mean points, max 12)
  const qualifies = !isIncomplete && roundedMeanPoints >= 6.5;

  return {
    student,
    marks,
    average: Math.round(rawAverage * 10) / 10,
    aggregate,
    meanGrade,
    meanPoints: roundedMeanPoints,
    rank: 0, // Assigned during cohort ranking
    subjectsPassed,
    enteredSubjectsCount,
    isIncomplete,
    strongestSubject,
    weakestSubject,
    qualifies,
  };
}

/**
 * Standard competition ranking (1, 2, 2, 4)
 * Sorts by aggregate DESC, then average DESC, then name ASC.
 * Ties share the exact same rank; subsequent rank skips accordingly.
 */
export function rankAllStudents(
  students: Student[],
  allMarks: Record<string, Record<string, MarkValue>>,
  subjects: Subject[],
  calculationMethod: 'best7' | 'simpleMean' = 'best7'
): StudentCalculation[] {
  const calculations = students.map((student) => {
    const studentMarks = allMarks[student.id] || {};
    return calculateStudentStanding(student, studentMarks, subjects, calculationMethod);
  });

  // Sort by aggregate (desc), then average (desc), then name (asc)
  calculations.sort((a, b) => {
    if (b.aggregate !== a.aggregate) {
      return b.aggregate - a.aggregate;
    }
    if (b.average !== a.average) {
      return b.average - a.average;
    }
    return a.student.name.localeCompare(b.student.name);
  });

  // Assign standard competition ranks (1, 2, 2, 4)
  let currentRank = 1;
  calculations.forEach((calc, idx) => {
    if (idx > 0) {
      const prev = calculations[idx - 1];
      if (prev.aggregate === calc.aggregate && prev.average === calc.average) {
        calc.rank = prev.rank;
      } else {
        calc.rank = idx + 1;
      }
    } else {
      calc.rank = 1;
    }
    currentRank = calc.rank;
  });

  return calculations;
}

/**
 * Neutralize formula injection characters (=, +, -, @) to prevent CSV injection vulnerability
 */
export function sanitizeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // If first character is formula trigger, prefix with a single apostrophe
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Export tabular data to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportTableToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.map(sanitizeCSVCell).join(','),
      ...rows.map((row) => row.map(sanitizeCSVCell).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ParsedCSVResult {
  success: boolean;
  updates: Array<{ studentId: string; studentName: string; admNo: string; marks: Record<string, MarkValue> }>;
  mappedSubjects: string[];
  unmatchedStudents: string[];
  totalRows: number;
  warnings: string[];
  errors: string[];
}

function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Robust CSV parser for marks upload
 * Handles BOM, CRLF, quoted commas, tab delimiters, and formula injection neutralisation
 */
export function parseMarksCSV(
  csvContent: string,
  students: Student[],
  subjects: Subject[]
): ParsedCSVResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Strip BOM if present
  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  const rawLines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (rawLines.length < 2) {
    return {
      success: false,
      updates: [],
      mappedSubjects: [],
      unmatchedStudents: [],
      totalRows: 0,
      warnings,
      errors: ['The CSV file is empty or missing headers and data rows.'],
    };
  }

  // Detect delimiter
  const firstLine = rawLines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  const headerCells = parseCSVLine(firstLine, delimiter).map((h) => h.trim());

  let admColIdx = -1;
  let nameColIdx = -1;
  const subjectColMap: Array<{ colIdx: number; subjectCode: string }> = [];

  headerCells.forEach((header, idx) => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (
      normalized === 'adm' ||
      normalized === 'admno' ||
      normalized === 'admission' ||
      normalized === 'admissionno' ||
      normalized === 'admnumber' ||
      normalized === 'regno' ||
      normalized === 'studentid'
    ) {
      admColIdx = idx;
      return;
    }

    if (
      normalized === 'name' ||
      normalized === 'studentname' ||
      normalized === 'fullname' ||
      normalized === 'student'
    ) {
      nameColIdx = idx;
      return;
    }

    const matchedSubject = subjects.find(
      (s) =>
        s.code.toLowerCase() === header.toLowerCase().trim() ||
        s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
    );

    if (matchedSubject) {
      subjectColMap.push({ colIdx: idx, subjectCode: matchedSubject.code });
    }
  });

  if (admColIdx === -1) {
    if (headerCells.length > 0 && !subjectColMap.some((m) => m.colIdx === 0)) {
      admColIdx = 0;
      warnings.push(`Assuming first column ("${headerCells[0]}") contains Admission Numbers.`);
    } else {
      errors.push('Could not detect an Admission Number column ("AdmNo", "Admission", etc.).');
    }
  }

  if (subjectColMap.length === 0) {
    errors.push('No recognized KCSE subjects detected in headers (e.g. MAT, ENG, KIS, BIO, CHE).');
  }

  if (errors.length > 0) {
    return {
      success: false,
      updates: [],
      mappedSubjects: [],
      unmatchedStudents: [],
      totalRows: rawLines.length - 1,
      warnings,
      errors,
    };
  }

  const updates: Array<{ studentId: string; studentName: string; admNo: string; marks: Record<string, MarkValue> }> = [];
  const unmatchedStudents: string[] = [];

  for (let r = 1; r < rawLines.length; r++) {
    const rowCells = parseCSVLine(rawLines[r], delimiter);
    if (rowCells.length === 0 || rowCells.every((c) => c === '')) continue;

    const admVal = admColIdx >= 0 && admColIdx < rowCells.length ? rowCells[admColIdx].trim() : '';
    const nameVal = nameColIdx >= 0 && nameColIdx < rowCells.length ? rowCells[nameColIdx].trim() : '';

    if (!admVal && !nameVal) continue;

    const matchedStudent = students.find((s) => {
      if (admVal && s.admNo.toLowerCase() === admVal.toLowerCase()) return true;
      if (nameVal && s.name.toLowerCase() === nameVal.toLowerCase()) return true;
      return false;
    });

    if (!matchedStudent) {
      unmatchedStudents.push(admVal ? `Adm: ${admVal} (${nameVal || 'No name'})` : nameVal);
      continue;
    }

    const studentMarks: Record<string, MarkValue> = {};

    subjectColMap.forEach(({ colIdx, subjectCode }) => {
      if (colIdx < rowCells.length) {
        const rawCell = rowCells[colIdx].trim();
        const upper = rawCell.toUpperCase();

        if (upper === 'ABS' || upper === 'ABSENT' || upper === 'A') {
          studentMarks[subjectCode] = 'ABS';
        } else if (rawCell === '' || rawCell === '-' || rawCell === '—') {
          // Leave null or blank
        } else {
          const num = Number(rawCell);
          if (!isNaN(num)) {
            studentMarks[subjectCode] = Math.max(0, Math.min(100, Math.round(num)));
          }
        }
      }
    });

    updates.push({
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      admNo: matchedStudent.admNo,
      marks: studentMarks,
    });
  }

  return {
    success: updates.length > 0,
    updates,
    mappedSubjects: subjectColMap.map((m) => m.subjectCode),
    unmatchedStudents,
    totalRows: rawLines.length - 1,
    warnings,
    errors,
  };
}

export function exportMarksTemplateCSV(students: Student[], subjects: Subject[], filename: string) {
  const headers = ['AdmNo', 'StudentName', ...subjects.map((s) => s.code)];
  const rows = students.map((s) => [s.admNo, s.name, ...subjects.map(() => '')]);
  exportTableToCSV(filename, headers, rows);
}
