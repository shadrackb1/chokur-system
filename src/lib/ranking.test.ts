import { describe, it, expect } from 'vitest';
import { rankStudents, computeGradeDistribution, getNearTheLineStudents } from './ranking';
import type { StudentCalculation, Student, Subject } from '../types';

function createMockStudentCalculation(overrides: Partial<StudentCalculation> = {}): StudentCalculation {
  return {
    student: { id: 's1', admNo: '001', name: 'Test Student', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 300, status: 'Active', createdAt: 0, updatedAt: 0 },
    marks: {},
    subjectPoints: {},
    subjectGrades: {},
    aggregate: 50,
    meanGrade: 'C+',
    meanPoints: 7.0,
    rank: 0,
    qualifies: true,
    enteredCount: 7,
    absentCount: 0,
    ...overrides,
  };
}

describe('Ranking', () => {
  describe('rankStudents', () => {
    it('ranks by aggregate descending', () => {
      const calcs = [
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.1, student: { ...createMockStudentCalculation().student, id: 's1', name: 'Alice' } }),
        createMockStudentCalculation({ aggregate: 60, meanPoints: 8.5, student: { ...createMockStudentCalculation().student, id: 's2', name: 'Bob' } }),
        createMockStudentCalculation({ aggregate: 55, meanPoints: 7.8, student: { ...createMockStudentCalculation().student, id: 's3', name: 'Charlie' } }),
      ];
      const ranked = rankStudents(calcs);
      expect(ranked[0].student.name).toBe('Bob');
      expect(ranked[1].student.name).toBe('Charlie');
      expect(ranked[2].student.name).toBe('Alice');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(3);
    });

    it('breaks ties by meanPoints descending', () => {
      const calcs = [
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's1', name: 'Alice' } }),
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.5, student: { ...createMockStudentCalculation().student, id: 's2', name: 'Bob' } }),
      ];
      const ranked = rankStudents(calcs);
      expect(ranked[0].student.name).toBe('Bob');
      expect(ranked[1].student.name).toBe('Alice');
    });

    it('breaks remaining ties by name ascending', () => {
      const calcs = [
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's1', name: 'Charlie' } }),
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's2', name: 'Alice' } }),
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's3', name: 'Bob' } }),
      ];
      const ranked = rankStudents(calcs);
      expect(ranked[0].student.name).toBe('Alice');
      expect(ranked[1].student.name).toBe('Bob');
      expect(ranked[2].student.name).toBe('Charlie');
    });

    it('assigns shared ranks (1,2,2,4)', () => {
      const calcs = [
        createMockStudentCalculation({ aggregate: 60, meanPoints: 8.5, student: { ...createMockStudentCalculation().student, id: 's1', name: 'Alice' } }),
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's2', name: 'Bob' } }),
        createMockStudentCalculation({ aggregate: 50, meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's3', name: 'Charlie' } }),
        createMockStudentCalculation({ aggregate: 40, meanPoints: 6.0, student: { ...createMockStudentCalculation().student, id: 's4', name: 'David' } }),
      ];
      const ranked = rankStudents(calcs);
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(2);
      expect(ranked[3].rank).toBe(4);
    });
  });

  describe('computeGradeDistribution', () => {
    it('computes distribution tiers correctly', () => {
      const calcs = [
        createMockStudentCalculation({ meanGrade: 'A', student: { ...createMockStudentCalculation().student, id: 's1' } }),
        createMockStudentCalculation({ meanGrade: 'B+', student: { ...createMockStudentCalculation().student, id: 's2' } }),
        createMockStudentCalculation({ meanGrade: 'B+', student: { ...createMockStudentCalculation().student, id: 's3' } }),
        createMockStudentCalculation({ meanGrade: 'C+', student: { ...createMockStudentCalculation().student, id: 's4' } }),
      ];
      const dist = computeGradeDistribution(calcs);
      const aTier = dist.find(t => t.grade === 'A');
      const bPlusTier = dist.find(t => t.grade === 'B+');
      const cPlusTier = dist.find(t => t.grade === 'C+');
      
      expect(aTier?.studentCount).toBe(1);
      expect(bPlusTier?.studentCount).toBe(2);
      expect(cPlusTier?.studentCount).toBe(1);
      expect(aTier?.pointsEquivalent).toBe(12);
      expect(bPlusTier?.pointsEquivalent).toBe(10);
    });

    it('handles empty array', () => {
      const dist = computeGradeDistribution([]);
      expect(dist.length).toBe(0);
    });
  });

  describe('getNearTheLineStudents', () => {
    it('returns students near C+ pass line', () => {
      const calcs = [
        createMockStudentCalculation({ meanGrade: 'C+', meanPoints: 7.0, student: { ...createMockStudentCalculation().student, id: 's1', name: 'Alice' } }),
        createMockStudentCalculation({ meanGrade: 'C', meanPoints: 6.5, student: { ...createMockStudentCalculation().student, id: 's2', name: 'Bob' } }),
        createMockStudentCalculation({ meanGrade: 'B-', meanPoints: 7.8, student: { ...createMockStudentCalculation().student, id: 's3', name: 'Charlie' } }),
        createMockStudentCalculation({ meanGrade: 'D+', meanPoints: 5.0, student: { ...createMockStudentCalculation().student, id: 's4', name: 'David' } }),
      ];
      const nearLine = getNearTheLineStudents(calcs);
      expect(nearLine.length).toBe(3); // C+, C, and B- with meanPoints < 8
      expect(nearLine.map(c => c.student.name)).toContain('Alice');
      expect(nearLine.map(c => c.student.name)).toContain('Bob');
      expect(nearLine.map(c => c.student.name)).toContain('Charlie');
    });
  });
});