/**
 * Ranking System - Pure Functions
 * Handles ranking with proper tie-breaking: aggregate desc, then average desc, then name asc
 * Ties share rank (1, 2, 2, 4)
 */

import { Student, Subject, MarkValue, StudentCalculation, CalculationMethod } from '../types';
import { getGradeFromScore, getGradeFromPoints, calculateAggregate, PASS_THRESHOLD_POINTS } from './kcse';

export interface RankingInput {
  student: Student;
  marks: Record<string, MarkValue>;
  subjects: Subject[];
  calculationMethod: CalculationMethod;
}

export interface RankingResult extends StudentCalculation {
  // All fields from StudentCalculation plus any computed here
}

function getSubjectPoints(marks: Record<string, MarkValue>, subjects: Subject[]): number[] {
  const points: number[] = [];
  for (const subj of subjects) {
    const mark = marks[subj.code];
    if (typeof mark === 'number') {
      const gradeResult = getGradeFromScore(mark);
      points.push(gradeResult.points);
    }
  }
  return points;
}

function getNumericScores(marks: Record<string, MarkValue>, subjects: Subject[]): Array<{ code: string; score: number; points: number }> {
  const scores: Array<{ code: string; score: number; points: number }> = [];
  for (const subj of subjects) {
    const mark = marks[subj.code];
    if (typeof mark === 'number') {
      const gradeResult = getGradeFromScore(mark);
      scores.push({ code: subj.code, score: mark, points: gradeResult.points });
    }
  }
  return scores;
}

export function calculateStudentStanding(input: RankingInput): StudentCalculation {
  const { student, marks, subjects, calculationMethod } = input;

  const numericScores = getNumericScores(marks, subjects);
  const subjectPoints = numericScores.map(s => s.points);

  // Subjects passed = grade points >= 6 (C and above)
  const subjectsPassed = numericScores.filter(s => s.points >= 6).length;

  // Raw average of all entered marks
  const totalScore = numericScores.reduce((sum, s) => sum + s.score, 0);
  const average = numericScores.length > 0 ? Math.round((totalScore / numericScores.length) * 10) / 10 : 0;

  // Find strongest and weakest subject by score
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

  // Calculate aggregate and mean points
  const { aggregate, meanPoints, subjectsUsed } = calculateAggregate(subjectPoints, calculationMethod);

  const meanGrade = getGradeFromPoints(meanPoints);
  const qualifies = meanPoints >= PASS_THRESHOLD_POINTS;

  return {
    student,
    marks,
    average,
    aggregate,
    meanGrade,
    meanPoints: Math.round(meanPoints * 100) / 100,
    rank: 0, // Assigned later
    subjectsPassed,
    strongestSubject,
    weakestSubject,
    qualifies,
    subjectsEntered: numericScores.length,
    subjectsUsed,
  };
}

export function rankAllStudents(inputs: RankingInput[]): StudentCalculation[] {
  // Calculate standing for each student
  const calculations = inputs.map(input => calculateStudentStanding(input));

  // Sort by aggregate (descending), then average (descending), then name (ascending)
  calculations.sort((a, b) => {
    if (b.aggregate !== a.aggregate) {
      return b.aggregate - a.aggregate;
    }
    if (b.average !== a.average) {
      return b.average - a.average;
    }
    return a.student.name.localeCompare(b.student.name);
  });

  // Assign ranks with ties sharing rank (1, 2, 2, 4)
  let currentRank = 1;
  for (let i = 0; i < calculations.length; i++) {
    if (i > 0) {
      const prev = calculations[i - 1];
      const curr = calculations[i];
      // Check if tied on aggregate AND average
      if (curr.aggregate !== prev.aggregate || curr.average !== prev.average) {
        currentRank = i + 1;
      }
    }
    calculations[i].rank = currentRank;
  }

  return calculations;
}

export function getRankDistribution(rankings: StudentCalculation[]): Array<{ rank: number; count: number }> {
  const distribution: Map<number, number> = new Map();
  for (const r of rankings) {
    distribution.set(r.rank, (distribution.get(r.rank) || 0) + 1);
  }
  return Array.from(distribution.entries())
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => a.rank - b.rank);
}

export function getQualificationStats(rankings: StudentCalculation[]): {
  total: number;
  qualified: number;
  notQualified: number;
  qualificationRate: number;
} {
  const total = rankings.length;
  const qualified = rankings.filter(r => r.qualifies).length;
  const notQualified = total - qualified;
  const qualificationRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

  return { total, qualified, notQualified, qualificationRate };
}

export function getNearTheLineStudents(
  rankings: StudentCalculation[],
  thresholdPoints: number = PASS_THRESHOLD_POINTS,
  windowPoints: number = 1.0
): StudentCalculation[] {
  return rankings
    .filter(r => r.meanPoints < thresholdPoints && r.meanPoints >= thresholdPoints - windowPoints)
    .sort((a, b) => b.meanPoints - a.meanPoints); // Closest to threshold first
}

export function getClassStats(rankings: StudentCalculation[]): {
  classAverage: number;
  passRate: number;
  meanGrade: string;
  highestAggregate: number;
  lowestAggregate: number;
} {
  if (rankings.length === 0) {
    return { classAverage: 0, passRate: 0, meanGrade: 'E', highestAggregate: 0, lowestAggregate: 0 };
  }

  const totalAverage = rankings.reduce((sum, r) => sum + r.average, 0);
  const classAverage = Math.round((totalAverage / rankings.length) * 10) / 10;

  const passRate = Math.round((rankings.filter(r => r.qualifies).length / rankings.length) * 100);

  const totalMeanPoints = rankings.reduce((sum, r) => sum + r.meanPoints, 0);
  const avgMeanPoints = totalMeanPoints / rankings.length;
  const meanGrade = getGradeFromPoints(avgMeanPoints);

  const aggregates = rankings.map(r => r.aggregate);
  const highestAggregate = Math.max(...aggregates);
  const lowestAggregate = Math.min(...aggregates);

  return { classAverage, passRate, meanGrade, highestAggregate, lowestAggregate };
}