
import { describe, it, expect } from 'vitest';
import { calculateStudentStanding, rankAllStudents } from '../lib/ranking';
import { PASS_THRESHOLD_POINTS } from '../lib/kcse';
import { Student, Subject, MarkValue, CalculationMethod } from '../types';
import { getGradeFromScore } from '../lib/kcse';

const mockSubjects: Subject[] = [
  { id: 'sub-mat', code: 'MAT', name: 'Mathematics', department: 'Mathematics', entered: 40, lastExamMean: 55 },
  { id: 'sub-eng', code: 'ENG', name: 'English', department: 'Languages', entered: 40, lastExamMean: 56 },
  { id: 'sub-kis', code: 'KIS', name: 'Kiswahili', department: 'Languages', entered: 40, lastExamMean: 64 },
  { id: 'sub-bio', code: 'BIO', name: 'Biology', department: 'Sciences', entered: 40, lastExamMean: 58 },
  { id: 'sub-che', code: 'CHE', name: 'Chemistry', department: 'Sciences', entered: 40, lastExamMean: 45 },
  { id: 'sub-phy', code: 'PHY', name: 'Physics', department: 'Sciences', entered: 40, lastExamMean: 50 },
  { id: 'sub-his', code: 'HIS', name: 'History & Govt', department: 'Humanities', entered: 40, lastExamMean: 63 },
  { id: 'sub-geo', code: 'GEO', name: 'Geography', department: 'Humanities', entered: 40, lastExamMean: 52 },
  { id: 'sub-cre', code: 'CRE', name: 'CRE', department: 'Humanities', entered: 40, lastExamMean: 64 },
  { id: 'sub-bst', code: 'BST', name: 'Business Studies', department: 'Applied Sciences', entered: 40, lastExamMean: 57 },
];

const mockStudent: Student = {
  id: 's-1',
  admNo: '1234',
  name: 'Test Student',
  stream: 'Form 4 East',
  gender: 'Male',
  kcpeMarks: 350,
  status: 'Active',
};

describe('Ranking Logic', () => {
  describe('calculateStudentStanding', () => {
    it('calculates correctly for a student with all marks', () => {
      const marks: Record<string, MarkValue> = {
        MAT: 80, ENG: 75, KIS: 85, BIO: 70, CHE: 65, PHY: 60, HIS: 80, GEO: 75, CRE: 88, BST: 70,
      };

      const result = calculateStudentStanding({
        student: mockStudent,
        marks,
        subjects: mockSubjects,
        calculationMethod: 'best7',
      });

      // All marks are >= 55 (C+), so all 10 subjects passed
      expect(result.subjectsPassed).toBe(10);
      expect(result.subjectsEntered).toBe(10);
      expect(result.subjectsUsed).toBe(7); // best7 uses 7
      expect(result.qualifies).toBe(true);
      expect(result.aggregate).toBeGreaterThan(0);
      expect(result.meanPoints).toBeGreaterThan(0);
    });

    it('handles ABS correctly', () => {
      const marks: Record<string, MarkValue> = {
        MAT: 80, ENG: 75, KIS: 'ABS', BIO: 70, CHE: 65, PHY: 60, HIS: 80, GEO: 75, CRE: 88, BST: 70,
      };

      const result = calculateStudentStanding({
        student: mockStudent,
        marks,
        subjects: mockSubjects,
        calculationMethod: 'best7',
      });

      // 9 entered, 1 ABS
      expect(result.subjectsEntered).toBe(9);
      expect(result.subjectsUsed).toBe(7); // best7 still uses top 7
      expect(result.marks.KIS).toBe('ABS');
    });

    it('handles missing marks (null/undefined) correctly', () => {
      const marks: Record<string, MarkValue> = {
        MAT: 80, ENG: 75, KIS: null as any, BIO: 70, CHE: 65, PHY: 60, HIS: 80, GEO: 75, CRE: 88, BST: 70,
      };

      const result = calculateStudentStanding({
        student: mockStudent,
        marks,
        subjects: mockSubjects,
        calculationMethod: 'best7',
      });

      // 9 entered, 1 missing
      expect(result.subjectsEntered).toBe(9);
    });
  });

  describe('rankAllStudents', () => {
    it('ranks by aggregate desc, then average desc, then name asc', () => {
      const studentA: Student = { ...mockStudent, id: 's-a', name: 'Alice' };
      const studentB: Student = { ...mockStudent, id: 's-b', name: 'Bob' };
      const studentC: Student = { ...mockStudent, id: 's-c', name: 'Charlie' };

      // All same aggregate and average, should sort by name
      const marksA: Record<string, MarkValue> = { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80 };
      const marksB: Record<string, MarkValue> = { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80 };
      const marksC: Record<string, MarkValue> = { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80 };

      const rankings = rankAllStudents([
        { student: studentA, marks: marksA, subjects: mockSubjects, calculationMethod: 'best7' },
        { student: studentB, marks: marksB, subjects: mockSubjects, calculationMethod: 'best7' },
        { student: studentC, marks: marksC, subjects: mockSubjects, calculationMethod: 'best7' },
      ]);

      // All tied, so rank 1 for all, sorted by name
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].student.name).toBe('Alice');
      expect(rankings[1].rank).toBe(1);
      expect(rankings[1].student.name).toBe('Bob');
      expect(rankings[2].rank).toBe(1);
      expect(rankings[2].student.name).toBe('Charlie');
    });

    it('handles ties correctly (1, 2, 2, 4)', () => {
      const students = [
        { id: 's-1', name: 'Top' },
        { id: 's-2', name: 'Second A' },
        { id: 's-3', name: 'Second B' },
        { id: 's-4', name: 'Fourth' },
      ].map(s => ({ ...mockStudent, ...s }));

      // Different aggregates to create ties
      const marksList = [
        { MAT: 90, ENG: 90, KIS: 90, BIO: 90, CHE: 90, PHY: 90, HIS: 90 }, // High
        { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80 }, // Mid
        { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80 }, // Mid (tied)
        { MAT: 70, ENG: 70, KIS: 70, BIO: 70, CHE: 70, PHY: 70, HIS: 70 }, // Low
      ];

      const rankings = rankAllStudents(
        marksList.map((marks, i) => ({
          student: students[i],
          marks,
          subjects: mockSubjects,
          calculationMethod: 'best7',
        }))
      );

      expect(rankings[0].rank).toBe(1); // Top
      expect(rankings[1].rank).toBe(2); // Second A
      expect(rankings[2].rank).toBe(2); // Second B (tied with Second A)
      expect(rankings[3].rank).toBe(4); // Fourth (skips 3)
    });

    it('qualifies correctly at C+ threshold', () => {
      // Student with mean points exactly 7.0
      const student = { ...mockStudent, id: 's-pass' };
      const marks: Record<string, MarkValue> = {
        MAT: 55, ENG: 55, KIS: 55, BIO: 55, CHE: 55, PHY: 55, HIS: 55, GEO: 55, CRE: 55, BST: 55,
      };

      const result = calculateStudentStanding({
        student,
        marks,
        subjects: mockSubjects,
        calculationMethod: 'best7',
      });

      expect(result.meanPoints).toBe(7.0);
      expect(result.qualifies).toBe(true);
    });

    it('does not qualify below C+ threshold', () => {
      const student = { ...mockStudent, id: 's-fail' };
      const marks: Record<string, MarkValue> = {
        MAT: 54, ENG: 54, KIS: 54, BIO: 54, CHE: 54, PHY: 54, HIS: 54, GEO: 54, CRE: 54, BST: 54,
      };

      const result = calculateStudentStanding({
        student,
        marks,
        subjects: mockSubjects,
        calculationMethod: 'best7',
      });

      expect(result.meanPoints).toBeLessThan(7.0);
      expect(result.qualifies).toBe(false);
    });
  });
});
