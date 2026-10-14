import { describe, expect, it } from 'vitest';
import {
  calculateStudentStanding,
  exportMarksTemplateCSV,
  getGradeFromPoints,
  getGradeFromScore,
  parseMarksCSV,
  rankAllStudents,
  sanitizeCSVCell,
  sanitizeMarkInput,
} from './grading';
import { Student, Subject } from '../types';

describe('KCSE 12-Point Grading Scale & Boundary Tests', () => {
  it('correctly maps all grade boundaries according to KNEC rules', () => {
    // A (80-100, 12 pts)
    expect(getGradeFromScore(100)).toMatchObject({ grade: 'A', points: 12 });
    expect(getGradeFromScore(80)).toMatchObject({ grade: 'A', points: 12 });

    // Boundary 79 vs 80
    expect(getGradeFromScore(79)).toMatchObject({ grade: 'A-', points: 11 });
    expect(getGradeFromScore(75)).toMatchObject({ grade: 'A-', points: 11 });

    // Boundary 74 vs 75
    expect(getGradeFromScore(74)).toMatchObject({ grade: 'B+', points: 10 });
    expect(getGradeFromScore(70)).toMatchObject({ grade: 'B+', points: 10 });

    // Boundary 69 vs 70
    expect(getGradeFromScore(69)).toMatchObject({ grade: 'B', points: 9 });
    expect(getGradeFromScore(65)).toMatchObject({ grade: 'B', points: 9 });

    // Boundary 64 vs 65
    expect(getGradeFromScore(64)).toMatchObject({ grade: 'B-', points: 8 });
    expect(getGradeFromScore(60)).toMatchObject({ grade: 'B-', points: 8 });

    // Boundary 54 vs 55 (University Cutoff Threshold)
    expect(getGradeFromScore(59)).toMatchObject({ grade: 'C+', points: 7 });
    expect(getGradeFromScore(55)).toMatchObject({ grade: 'C+', points: 7 });
    expect(getGradeFromScore(54)).toMatchObject({ grade: 'C', points: 6 });
    expect(getGradeFromScore(50)).toMatchObject({ grade: 'C', points: 6 });

    // Boundary 49 vs 50
    expect(getGradeFromScore(49)).toMatchObject({ grade: 'C-', points: 5 });
    expect(getGradeFromScore(45)).toMatchObject({ grade: 'C-', points: 5 });

    // Boundary 44 vs 45
    expect(getGradeFromScore(44)).toMatchObject({ grade: 'D+', points: 4 });
    expect(getGradeFromScore(40)).toMatchObject({ grade: 'D+', points: 4 });

    // Boundary 39 vs 40
    expect(getGradeFromScore(39)).toMatchObject({ grade: 'D', points: 3 });
    expect(getGradeFromScore(35)).toMatchObject({ grade: 'D', points: 3 });

    // Boundary 34 vs 35
    expect(getGradeFromScore(34)).toMatchObject({ grade: 'D-', points: 2 });
    expect(getGradeFromScore(30)).toMatchObject({ grade: 'D-', points: 2 });

    // Boundary 29 vs 30
    expect(getGradeFromScore(29)).toMatchObject({ grade: 'E', points: 1 });
    expect(getGradeFromScore(0)).toMatchObject({ grade: 'E', points: 1 });
  });

  it('clamps numbers > 100 and < 0 appropriately', () => {
    expect(getGradeFromScore(120)).toMatchObject({ grade: 'A', points: 12 });
    expect(getGradeFromScore(-10)).toMatchObject({ grade: 'E', points: 1 });
  });

  it('handles ABS (Absent) and blank/null values correctly', () => {
    expect(getGradeFromScore('ABS')).toMatchObject({ grade: 'E', points: 0, description: 'Absent' });
    expect(getGradeFromScore(null)).toMatchObject({ grade: 'E', points: 0, description: 'Not Entered' });
  });

  it('sanitizes mark inputs rejecting invalid strings and letters', () => {
    expect(sanitizeMarkInput('85')).toBe(85);
    expect(sanitizeMarkInput('abs')).toBe('ABS');
    expect(sanitizeMarkInput('Absent')).toBe('ABS');
    expect(sanitizeMarkInput('A')).toBe('ABS');
    expect(sanitizeMarkInput('xyz')).toBe(null);
    expect(sanitizeMarkInput('')).toBe(null);
    expect(sanitizeMarkInput('-')).toBe(null);
  });
});

describe('Points to KCSE Grade Mapping', () => {
  it('converts point ranges accurately to letters', () => {
    expect(getGradeFromPoints(12.0)).toBe('A');
    expect(getGradeFromPoints(11.5)).toBe('A');
    expect(getGradeFromPoints(11.4)).toBe('A-');
    expect(getGradeFromPoints(10.5)).toBe('A-');
    expect(getGradeFromPoints(9.5)).toBe('B+');
    expect(getGradeFromPoints(8.5)).toBe('B');
    expect(getGradeFromPoints(7.5)).toBe('B-');
    expect(getGradeFromPoints(6.5)).toBe('C+'); // University Cutoff
    expect(getGradeFromPoints(6.4)).toBe('C');
    expect(getGradeFromPoints(5.5)).toBe('C');
    expect(getGradeFromPoints(4.5)).toBe('C-');
    expect(getGradeFromPoints(3.5)).toBe('D+');
    expect(getGradeFromPoints(2.5)).toBe('D');
    expect(getGradeFromPoints(1.5)).toBe('D-');
    expect(getGradeFromPoints(1.0)).toBe('E');
    expect(getGradeFromPoints(0)).toBe('E');
  });
});

describe('Best 7 KNEC Calculation & Competition Rankings with Ties', () => {
  const dummySubjects: Subject[] = [
    { id: '1', code: 'MAT', name: 'Mathematics', department: 'Mathematics', entered: 1, lastExamMean: 50 },
    { id: '2', code: 'ENG', name: 'English', department: 'Languages', entered: 1, lastExamMean: 50 },
    { id: '3', code: 'KIS', name: 'Kiswahili', department: 'Languages', entered: 1, lastExamMean: 50 },
    { id: '4', code: 'BIO', name: 'Biology', department: 'Sciences', entered: 1, lastExamMean: 50 },
    { id: '5', code: 'CHE', name: 'Chemistry', department: 'Sciences', entered: 1, lastExamMean: 50 },
    { id: '6', code: 'PHY', name: 'Physics', department: 'Sciences', entered: 1, lastExamMean: 50 },
    { id: '7', code: 'HIS', name: 'History', department: 'Humanities', entered: 1, lastExamMean: 50 },
    { id: '8', code: 'GEO', name: 'Geography', department: 'Humanities', entered: 1, lastExamMean: 50 },
    { id: '9', code: 'CRE', name: 'CRE', department: 'Humanities', entered: 1, lastExamMean: 50 },
    { id: '10', code: 'BST', name: 'Business Studies', department: 'Applied', entered: 1, lastExamMean: 50 },
  ];

  const dummyStudents: Student[] = [
    { id: 's-1', admNo: '101', name: 'Candidate A', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 350, status: 'Active' },
    { id: 's-2', admNo: '102', name: 'Candidate B (Tied with A)', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 340, status: 'Active' },
    { id: 's-3', admNo: '103', name: 'Candidate C', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 320, status: 'Active' },
    { id: 's-4', admNo: '104', name: 'Candidate D (Incomplete subjects)', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 300, status: 'Active' },
  ];

  it('aggregates best 7 subjects correctly and labels fewer than 7 as incomplete', () => {
    // 10 subjects scored at 80 (A, 12 pts each). Best 7 = 7 * 12 = 84 max points.
    const fullMarks = {
      MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80,
      PHY: 80, HIS: 80, GEO: 80, CRE: 80, BST: 80,
    };
    const res = calculateStudentStanding(dummyStudents[0], fullMarks, dummySubjects);
    expect(res.aggregate).toBe(84);
    expect(res.meanPoints).toBe(12);
    expect(res.meanGrade).toBe('A');
    expect(res.isIncomplete).toBe(false);
    expect(res.qualifies).toBe(true);

    // Incomplete candidate with only 4 subjects entered
    const partialMarks = { MAT: 70, ENG: 70, KIS: 70, BIO: 70 };
    const incompleteRes = calculateStudentStanding(dummyStudents[3], partialMarks, dummySubjects);
    expect(incompleteRes.isIncomplete).toBe(true);
    expect(incompleteRes.enteredSubjectsCount).toBe(4);
  });

  it('assigns standard competition ranks (1, 2, 2, 4) when students tie', () => {
    // Candidate A and B have identical marks, Candidate C has lower marks
    const tiedMarksA = { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80, GEO: 50, CRE: 50, BST: 50 };
    const tiedMarksB = { MAT: 80, ENG: 80, KIS: 80, BIO: 80, CHE: 80, PHY: 80, HIS: 80, GEO: 50, CRE: 50, BST: 50 };
    const lowerMarksC = { MAT: 50, ENG: 50, KIS: 50, BIO: 50, CHE: 50, PHY: 50, HIS: 50, GEO: 50, CRE: 50, BST: 50 };

    const cohortMarks = {
      's-1': tiedMarksA,
      's-2': tiedMarksB,
      's-3': lowerMarksC,
    };

    const ranked = rankAllStudents(dummyStudents.slice(0, 3), cohortMarks, dummySubjects);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1); // Tied for rank 1
    expect(ranked[2].rank).toBe(3); // Next rank skips to 3! (1, 1, 3 competition ranking)
  });
});

describe('CSV Sanitization & Security', () => {
  it('neutralizes formula injection characters (=, +, -, @)', () => {
    expect(sanitizeCSVCell('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
    expect(sanitizeCSVCell('+12345')).toBe('"\' +12345"'.replace(' ', ''));
    expect(sanitizeCSVCell('@ALERT')).toBe('"\'@ALERT"');
    expect(sanitizeCSVCell('Regular Name')).toBe('"Regular Name"');
  });
});
