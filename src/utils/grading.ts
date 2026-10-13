import { GradeResult, KCSEGrade, MarkValue, Student, StudentCalculation, Subject } from '../types';

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

  const num = Math.round(score);
  for (const item of KCSE_GRADING_TABLE) {
    if (num >= item.min && num <= item.max) {
      return {
        grade: item.grade,
        points: item.points,
        tier: item.tier,
        description: item.description,
      };
    }
  }

  if (num > 100) return { grade: 'A', points: 12, tier: 'honors', description: 'Excellent' };
  return { grade: 'E', points: 1, tier: 'critical', description: 'Critical / Fail' };
}

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

  const subjectsPassed = numericScores.filter((s) => s.score >= 50).length;

  let totalScore = 0;
  numericScores.forEach((s) => (totalScore += s.score));
  const rawAverage = numericScores.length > 0 ? totalScore / numericScores.length : 0;

  // Find strongest and weakest subject
  let strongestSubject: { code: string; score: number } | undefined;
  let weakestSubject: { code: string; score: number } | undefined;

  if (numericScores.length > 0) {
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
    // Sort descending by points
    const sortedByPoints = [...numericScores].sort((a, b) => b.points - a.points);
    const best7 = sortedByPoints.slice(0, 7);
    aggregate = best7.reduce((acc, curr) => acc + curr.points, 0);
    meanPoints = best7.length > 0 ? aggregate / best7.length : 0;
  } else {
    // Simple straight points average
    const totalPoints = numericScores.reduce((acc, curr) => acc + curr.points, 0);
    aggregate = totalPoints;
    meanPoints = numericScores.length > 0 ? totalPoints / numericScores.length : 0;
  }

  const meanGrade = getGradeFromPoints(meanPoints);
  const qualifies = meanPoints >= 6.5; // C+ benchmark is at 7 points (rounded benchmark >= 6.5)

  return {
    student,
    marks,
    average: Math.round(rawAverage * 10) / 10,
    aggregate,
    meanGrade,
    meanPoints: Math.round(meanPoints * 100) / 100,
    rank: 0, // Assigned later in batch ranking
    subjectsPassed,
    strongestSubject,
    weakestSubject,
    qualifies,
  };
}

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

  // Sort by aggregate (descending), then average (descending)
  calculations.sort((a, b) => {
    if (b.aggregate !== a.aggregate) {
      return b.aggregate - a.aggregate;
    }
    return b.average - a.average;
  });

  // Assign ranks
  calculations.forEach((calc, index) => {
    calc.rank = index + 1;
  });

  return calculations;
}

export function exportTableToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
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

// Split CSV line respecting quotation marks
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

export function parseMarksCSV(
  csvContent: string,
  students: Student[],
  subjects: Subject[]
): ParsedCSVResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const rawLines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (rawLines.length < 2) {
    return {
      success: false,
      updates: [],
      mappedSubjects: [],
      unmatchedStudents: [],
      totalRows: 0,
      warnings,
      errors: ['The uploaded CSV file is empty or does not contain header and data rows.'],
    };
  }

  // Detect delimiter: comma, tab, or semicolon
  const firstLine = rawLines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  const headerCells = parseCSVLine(firstLine, delimiter).map((h) => h.trim());

  // Identify column indices
  let admColIdx = -1;
  let nameColIdx = -1;
  const subjectColMap: Array<{ colIdx: number; subjectCode: string }> = [];

  headerCells.forEach((header, idx) => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check for admission column
    if (
      normalized === 'adm' ||
      normalized === 'admno' ||
      normalized === 'admission' ||
      normalized === 'admissionno' ||
      normalized === 'admnumber' ||
      normalized === 'studentid' ||
      normalized === 'regno'
    ) {
      admColIdx = idx;
      return;
    }

    // Check for student name column
    if (
      normalized === 'name' ||
      normalized === 'studentname' ||
      normalized === 'fullname' ||
      normalized === 'student'
    ) {
      nameColIdx = idx;
      return;
    }

    // Match subject code or subject name
    const matchedSubject = subjects.find(
      (s) =>
        s.code.toLowerCase() === header.toLowerCase().trim() ||
        s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
    );

    if (matchedSubject) {
      subjectColMap.push({ colIdx: idx, subjectCode: matchedSubject.code });
    }
  });

  // Fallback if no explicit AdmNo column identified
  if (admColIdx === -1) {
    // If first column isn't mapped to a subject, assume it is AdmNo
    if (headerCells.length > 0 && !subjectColMap.some((m) => m.colIdx === 0)) {
      admColIdx = 0;
      warnings.push(`No "AdmNo" column header found. Assuming first column ("${headerCells[0]}") contains Admission Numbers.`);
    } else {
      errors.push('Could not detect an Admission Number column (e.g. "AdmNo", "Admission", "ADM").');
    }
  }

  if (subjectColMap.length === 0) {
    errors.push('No recognized KCSE subject columns found (e.g. MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST).');
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

  // Parse data rows
  for (let r = 1; r < rawLines.length; r++) {
    const rowCells = parseCSVLine(rawLines[r], delimiter);
    if (rowCells.length === 0 || rowCells.every((c) => c === '')) continue;

    const admVal = admColIdx >= 0 && admColIdx < rowCells.length ? rowCells[admColIdx].trim() : '';
    const nameVal = nameColIdx >= 0 && nameColIdx < rowCells.length ? rowCells[nameColIdx].trim() : '';

    if (!admVal && !nameVal) continue;

    // Locate student in store
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
        const cellRaw = rowCells[colIdx].trim();
        const upper = cellRaw.toUpperCase();

        if (upper === 'ABS' || upper === 'A' || upper === 'ABSENT') {
          studentMarks[subjectCode] = 'ABS';
        } else if (cellRaw === '' || cellRaw === '-' || cellRaw === '—') {
          // do not overwrite if blank, or set null
        } else {
          const num = parseFloat(cellRaw);
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

