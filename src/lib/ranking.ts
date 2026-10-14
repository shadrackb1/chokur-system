import type { StudentCalculation, Student, Subject, GradeDistributionTier, MarkValue } from '../types';

import { marksToGrade, marksToPoints, calculateAggregate, calculateMeanGrade, calculateMeanPoints, isPass } from './kcse';

export function computeStudentCalculations(
  students: Student[],
  subjects: Subject[],
  marks: Record<string, Record<string, MarkValue>>,
  examId: string
): StudentCalculation[] {
  return students.map(student => {
    const studentMarks = marks[student.id] || {};
    const subjectPoints: Record<string, number> = {};
    const subjectGrades: Record<string, string> = {};
    let enteredCount = 0;
    let absentCount = 0;

    for (const subject of subjects) {
      const mark = studentMarks[subject.code];
      if (mark === 'ABS') {
        subjectPoints[subject.code] = 0;
        subjectGrades[subject.code] = 'ABS';
        absentCount++;
      } else if (mark !== null && mark !== undefined) {
        subjectPoints[subject.code] = marksToPoints(mark as number);
        subjectGrades[subject.code] = marksToGrade(mark as number);
        enteredCount++;
      } else {
        subjectPoints[subject.code] = 0;
        subjectGrades[subject.code] = '';
      }
    }

    const pointsArray = subjects.map(s => subjectPoints[s.code]).filter(p => p > 0);
    const aggregate = calculateAggregate(pointsArray);
    const meanGrade = calculateMeanGrade(aggregate);
    const meanPoints = calculateMeanPoints(aggregate, enteredCount);
    const qualifies = isPass(meanPoints);

    return {
      student,
      marks: studentMarks,
      subjectPoints,
      subjectGrades,
      aggregate,
      meanGrade,
      meanPoints,
      rank: 0,
      qualifies,
      enteredCount,
      absentCount,
    };
  });
}

export function rankStudents(calculations: StudentCalculation[]): StudentCalculation[] {
  const sorted = [...calculations].sort((a, b) => {
    if (b.aggregate !== a.aggregate) return b.aggregate - a.aggregate;
    if (b.meanPoints !== a.meanPoints) return b.meanPoints - a.meanPoints;
    return a.student.name.localeCompare(b.student.name);
  });

  let currentRank = 0;
  let prevAggregate = -1;
  let prevMeanPoints = -1;
  let prevName = '';

  return sorted.map((calc, index) => {
    const isTie = calc.aggregate === prevAggregate && calc.meanPoints === prevMeanPoints;
    if (!isTie) {
      currentRank = index + 1;
    }
    prevAggregate = calc.aggregate;
    prevMeanPoints = calc.meanPoints;
    prevName = calc.student.name;
    return { ...calc, rank: currentRank };
  });
}

export function computeSubjectStats(
  students: Student[],
  subjects: Subject[],
  marks: Record<string, Record<string, MarkValue>>,
  examId: string
) {
  return subjects.map(subject => {
    const validMarks = students
      .map(s => marks[s.id]?.[subject.code])
      .filter((m): m is number => typeof m === 'number');

    const entered = validMarks.length;
    const passCount = validMarks.filter(m => m >= 55).length;
    const passRate = entered > 0 ? Math.round((passCount / entered) * 100) : 0;
    const average = entered > 0 ? Math.round((validMarks.reduce((a, b) => a + b, 0) / entered) * 10) / 10 : 0;
    const highest = entered > 0 ? Math.max(...validMarks) : 0;
    const lowest = entered > 0 ? Math.min(...validMarks) : 0;

    const lastExamMean = subject.lastExamMean;
    const diffFromLastExam = entered > 0 ? Math.round((average - lastExamMean) * 10) / 10 : 0;

    return {
      subject,
      average,
      highest,
      lowest,
      passRate,
      entered,
      diffFromLastExam,
    };
  });
}

export function computeGradeDistribution(ranked: StudentCalculation[]): GradeDistributionTier[] {
  const total = ranked.length;
  if (total === 0) return [];

  const gradeOrder = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const pointsMap: Record<string, number> = { A: 12, 'A-': 11, 'B+': 10, B: 9, 'B-': 8, 'C+': 7, C: 6, 'C-': 5, 'D+': 4, D: 3, 'D-': 2, E: 1 };

  let cumulative = 0;
  return gradeOrder.map(grade => {
    const count = ranked.filter(r => r.meanGrade === grade).length;
    cumulative += count;
    return {
      grade,
      pointsEquivalent: pointsMap[grade] || 1,
      studentCount: count,
      cohortShare: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      cumulativePercentage: total > 0 ? Math.round((cumulative / total) * 1000) / 10 : 0,
    };
  }).filter(t => t.studentCount > 0);
}

export function getNearTheLineStudents(ranked: StudentCalculation[]): StudentCalculation[] {
  return ranked.filter(r => {
    if (r.meanGrade === 'C+' || r.meanGrade === 'C') return true;
    if (r.meanGrade === 'B-' && r.meanPoints < 8) return true;
    return false;
  }).slice(0, 10);
}

export function getStrongestSubject(stats: ReturnType<typeof computeSubjectStats>) {
  const withData = stats.filter(s => s.entered > 0);
  if (withData.length === 0) return undefined;
  const best = withData.reduce((a, b) => a.average > b.average ? a : b);
  return { name: best.subject.name, average: best.average };
}

export function getWeakestSubject(stats: ReturnType<typeof computeSubjectStats>) {
  const withData = stats.filter(s => s.entered > 0);
  if (withData.length === 0) return undefined;
  const worst = withData.reduce((a, b) => a.average < b.average ? a : b);
  return { name: worst.subject.name, average: worst.average };
}