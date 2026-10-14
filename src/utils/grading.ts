import { GradeResult, KCSEGrade, MarkValue, Student, StudentCalculation, Subject, CalculationMethod } from '../types';
import { getGradeFromScore, getGradeFromPoints, calculateAggregate, PASS_THRESHOLD_POINTS, KCSE_GRADING_TABLE } from '../lib/kcse';

export { KCSE_GRADING_TABLE, getGradeFromScore, getGradeFromPoints, calculateAggregate, PASS_THRESHOLD_POINTS } from '../lib/kcse';

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
export function parseCSVLine(line: string, delimiter: string = ','): string[] {
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

    // Locate student in store - require exact admNo match for security
    const matchedByAdmNo = admVal && students.find(s => s.admNo.toLowerCase() === admVal.toLowerCase());

    // Fallback to name ONLY if admNo is provided and matches exactly one student
    // This prevents accidental misassignment of marks
    let matchedByName: Student | undefined;
    if (!matchedByAdmNo && nameVal) {
      const nameMatches = students.filter(s => s.name.toLowerCase() === nameVal.toLowerCase());
      if (nameMatches.length === 1) {
        // Only allow name fallback if admin number column exists in CSV but was empty for this row
        if (admColIdx >= 0 && admColIdx < rowCells.length && rowCells[admColIdx].trim() === '') {
          matchedByName = nameMatches[0];
        } else if (admColIdx === -1) {
          // No admNo column at all - reject to prevent misassignment
          warnings.push(`Row ${r}: No AdmNo column found. Cannot match "${nameVal}" by name alone for security.`);
        }
      } else if (nameMatches.length > 1) {
        warnings.push(`Row ${r}: Name "${nameVal}" matches ${nameMatches.length} students. Rejected - requires exact AdmNo match.`);
      }
    }

    const matchedStudent = matchedByAdmNo || matchedByName;

    if (!matchedStudent) {
      unmatchedStudents.push(admVal ? `Adm: ${admVal} (${nameVal || 'No name'})` : nameVal);
      continue;
    }

    const studentMarks: Record<string, MarkValue> = {};

    subjectColMap.forEach(({ colIdx, subjectCode }) => {
      if (colIdx < rowCells.length) {
        const cellRaw = rowCells[colIdx].trim();
        const upper = cellRaw.toUpperCase();

        if (upper === 'ABS' || upper === 'ABSENT') {
          studentMarks[subjectCode] = 'ABS';
        } else if (upper === 'A') {
          // 'A' is a valid KCSE grade (80-100), not absent
          studentMarks[subjectCode] = 80;
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

export function exportTableToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Sanitize cell to prevent formula injection
  const sanitizeCell = (cell: string | number): string => {
    const str = String(cell ?? '');
    // Prefix formula injection characters with single quote
    if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
      return "'" + str;
    }
    return str;
  };

  const csvContent = [
    headers.map((h) => sanitizeCell(h)).map((h) => '"' + h.replace(/"/g, '""') + '"').join(','),
    ...rows.map((row) =>
      row
        .map((cell) => sanitizeCell(cell))
        .map((cell) => {
          const str = String(cell ?? '');
          return '"' + str.replace(/"/g, '""') + '"';
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMarksTemplateCSV(students: Student[], subjects: Subject[], filename: string) {
  const headers = ['AdmNo', 'StudentName', ...subjects.map((s) => s.code)];
  const rows = students.map((s) => [s.admNo, s.name, ...subjects.map(() => '')]);
  exportTableToCSV(filename, headers, rows);
}