export const KCSE_BOUNDARIES: Array<{ min: number; max: number; grade: string; points: number }> = [
  { min: 80, max: 100, grade: 'A', points: 12 },
  { min: 75, max: 79, grade: 'A-', points: 11 },
  { min: 70, max: 74, grade: 'B+', points: 10 },
  { min: 65, max: 69, grade: 'B', points: 9 },
  { min: 60, max: 64, grade: 'B-', points: 8 },
  { min: 55, max: 59, grade: 'C+', points: 7 },
  { min: 50, max: 54, grade: 'C', points: 6 },
  { min: 45, max: 49, grade: 'C-', points: 5 },
  { min: 40, max: 44, grade: 'D+', points: 4 },
  { min: 35, max: 39, grade: 'D', points: 3 },
  { min: 30, max: 34, grade: 'D-', points: 2 },
  { min: 0, max: 29, grade: 'E', points: 1 },
];

export const PASS_POINTS = 7;
export const PASS_MARK = 55;
export const MAX_AGGREGATE = 84;
export const MAX_SUBJECTS_FOR_AGGREGATE = 7;

export function marksToGrade(marks: number): string {
  if (marks < 0 || marks > 100) return 'E';
  const boundary = KCSE_BOUNDARIES.find(b => marks >= b.min && marks <= b.max);
  return boundary?.grade ?? 'E';
}

export function marksToPoints(marks: number): number {
  if (marks < 0 || marks > 100) return 1;
  const boundary = KCSE_BOUNDARIES.find(b => marks >= b.min && marks <= b.max);
  return boundary?.points ?? 1;
}

export function gradeToPoints(grade: string): number {
  const boundary = KCSE_BOUNDARIES.find(b => b.grade === grade);
  return boundary?.points ?? 1;
}

export function calculateAggregate(points: number[]): number {
  const validPoints = points.filter(p => p > 0);
  if (validPoints.length === 0) return 0;
  const sorted = validPoints.sort((a, b) => b - a);
  const top7 = sorted.slice(0, MAX_SUBJECTS_FOR_AGGREGATE);
  return top7.reduce((sum, p) => sum + p, 0);
}

export function calculateMeanGrade(aggregate: number): string {
  if (aggregate >= 80) return 'A';
  if (aggregate >= 74) return 'A-';
  if (aggregate >= 68) return 'B+';
  if (aggregate >= 62) return 'B';
  if (aggregate >= 56) return 'B-';
  if (aggregate >= 50) return 'C+';
  if (aggregate >= 44) return 'C';
  if (aggregate >= 38) return 'C-';
  if (aggregate >= 32) return 'D+';
  if (aggregate >= 26) return 'D';
  if (aggregate >= 20) return 'D-';
  return 'E';
}

export function calculateMeanPoints(aggregate: number, subjectCount: number): number {
  if (subjectCount === 0) return 0;
  return aggregate / subjectCount;
}

export function isPass(meanPoints: number): boolean {
  return meanPoints >= PASS_POINTS;
}

export function parseMarkValue(value: string | number | null | undefined): number | 'ABS' | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const trimmed = value.trim().toUpperCase();
    if (trimmed === 'ABS') return 'ABS';
    const num = parseFloat(trimmed);
    if (isNaN(num)) return null;
    return Math.max(0, Math.min(100, num));
  }
  if (typeof value === 'number') {
    if (isNaN(value)) return null;
    return Math.max(0, Math.min(100, value));
  }
  return null;
}

export function isValidMark(value: number | 'ABS' | null): boolean {
  if (value === 'ABS') return true;
  if (value === null) return false;
  return value >= 0 && value <= 100;
}