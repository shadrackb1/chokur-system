/**
 * KCSE Grading System - Pure Functions
 * All calculations are deterministic, testable, and side-effect free.
 */

export type KCSEGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'E';

export interface GradeBand {
  min: number;
  max: number;
  grade: KCSEGrade;
  points: number;
  tier: 'honors' | 'competent' | 'marginal' | 'critical';
  description: string;
}

export const KCSE_GRADING_TABLE: readonly GradeBand[] = [
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
] as const;

export type MarkValue = number | 'ABS' | null | undefined;

export interface GradeResult {
  grade: KCSEGrade;
  points: number;
  tier: 'honors' | 'competent' | 'marginal' | 'critical';
  description: string;
  isAbsent: boolean;
  isNotEntered: boolean;
}

export function getGradeFromScore(score: MarkValue): GradeResult {
  // Not entered
  if (score === null || score === undefined) {
    return {
      grade: 'E',
      points: 0,
      tier: 'critical',
      description: 'Not Entered',
      isAbsent: false,
      isNotEntered: true,
    };
  }

  // Absent
  if (score === 'ABS') {
    return {
      grade: 'E',
      points: 0,
      tier: 'critical',
      description: 'Absent',
      isAbsent: true,
      isNotEntered: false,
    };
  }

  // Numeric score - clamp and round
  const num = Math.max(0, Math.min(100, Math.round(score)));

  for (const band of KCSE_GRADING_TABLE) {
    if (num >= band.min && num <= band.max) {
      return {
        grade: band.grade,
        points: band.points,
        tier: band.tier,
        description: band.description,
        isAbsent: false,
        isNotEntered: false,
      };
    }
  }

  // Should never reach here due to clamp, but safety
  if (num > 100) {
    return {
      grade: 'A',
      points: 12,
      tier: 'honors',
      description: 'Excellent',
      isAbsent: false,
      isNotEntered: false,
    };
  }

  return {
    grade: 'E',
    points: 1,
    tier: 'critical',
    description: 'Critical / Fail',
    isAbsent: false,
    isNotEntered: false,
  };
}

export function getGradeFromPoints(points: number): KCSEGrade {
  // Points are 1-12, mean points can be decimal
  // Use 2 decimal precision per KNEC standard
  const precise = Math.round(points * 100) / 100;

  if (precise >= 11.5) return 'A';
  if (precise >= 10.5) return 'A-';
  if (precise >= 9.5) return 'B+';
  if (precise >= 8.5) return 'B';
  if (precise >= 7.5) return 'B-';
  if (precise >= 6.5) return 'C+';
  if (precise >= 5.5) return 'C';
  if (precise >= 4.5) return 'C-';
  if (precise >= 3.5) return 'D+';
  if (precise >= 2.5) return 'D';
  if (precise >= 1.5) return 'D-';
  return 'E';
}

export function getPointsFromGrade(grade: KCSEGrade): number {
  const band = KCSE_GRADING_TABLE.find(b => b.grade === grade);
  return band?.points || 0;
}

export function getTierFromGrade(grade: KCSEGrade): 'honors' | 'competent' | 'marginal' | 'critical' {
  const band = KCSE_GRADING_TABLE.find(b => b.grade === grade);
  return band?.tier || 'critical';
}

export const PASS_THRESHOLD_POINTS = 7.0; // C+ = 7 points
export const PASS_THRESHOLD_GRADE: KCSEGrade = 'C+';

export function isPassingGrade(grade: KCSEGrade): boolean {
  return getPointsFromGrade(grade) >= PASS_THRESHOLD_POINTS;
}

export function isPassingMark(mark: number): boolean {
  return mark >= 55;
}

/**
 * Calculate best-7 aggregate (KNEC standard)
 * Returns aggregate points (max 84) and mean points
 */
export function calculateBest7Aggregate(
  subjectPoints: number[],
  subjectCount: number
): { aggregate: number; meanPoints: number; subjectsUsed: number } {
  if (subjectPoints.length === 0) {
    return { aggregate: 0, meanPoints: 0, subjectsUsed: 0 };
  }

  // Sort descending by points
  const sorted = [...subjectPoints].sort((a, b) => b - a);
  const best7 = sorted.slice(0, 7);
  const aggregate = best7.reduce((sum, p) => sum + p, 0);
  const subjectsUsed = best7.length;
  const meanPoints = subjectsUsed > 0 ? aggregate / subjectsUsed : 0;

  return { aggregate, meanPoints, subjectsUsed };
}

/**
 * Calculate simple mean aggregate (all subjects)
 */
export function calculateSimpleMeanAggregate(
  subjectPoints: number[]
): { aggregate: number; meanPoints: number; subjectsUsed: number } {
  if (subjectPoints.length === 0) {
    return { aggregate: 0, meanPoints: 0, subjectsUsed: 0 };
  }

  const aggregate = subjectPoints.reduce((sum, p) => sum + p, 0);
  const subjectsUsed = subjectPoints.length;
  const meanPoints = aggregate / subjectsUsed;

  return { aggregate, meanPoints, subjectsUsed };
}

export type CalculationMethod = 'best7' | 'simpleMean';

export function calculateAggregate(
  subjectPoints: number[],
  method: CalculationMethod
): { aggregate: number; meanPoints: number; subjectsUsed: number } {
  if (method === 'best7') {
    return calculateBest7Aggregate(subjectPoints, subjectPoints.length);
  }
  return calculateSimpleMeanAggregate(subjectPoints);
}