import { describe, it, expect } from 'vitest';
import {
  marksToGrade,
  marksToPoints,
  gradeToPoints,
  calculateAggregate,
  calculateMeanGrade,
  calculateMeanPoints,
  isPass,
  parseMarkValue,
  isValidMark,
  KCSE_BOUNDARIES,
  PASS_POINTS,
  PASS_MARK,
  MAX_AGGREGATE,
  MAX_SUBJECTS_FOR_AGGREGATE,
} from './kcse';

describe('KCSE Grading', () => {
  describe('marksToGrade', () => {
    it('returns A for 80-100', () => {
      expect(marksToGrade(100)).toBe('A');
      expect(marksToGrade(85)).toBe('A');
      expect(marksToGrade(80)).toBe('A');
    });

    it('returns A- for 75-79', () => {
      expect(marksToGrade(79)).toBe('A-');
      expect(marksToGrade(75)).toBe('A-');
    });

    it('returns B+ for 70-74', () => {
      expect(marksToGrade(74)).toBe('B+');
      expect(marksToGrade(70)).toBe('B+');
    });

    it('returns B for 65-69', () => {
      expect(marksToGrade(69)).toBe('B');
      expect(marksToGrade(65)).toBe('B');
    });

    it('returns B- for 60-64', () => {
      expect(marksToGrade(64)).toBe('B-');
      expect(marksToGrade(60)).toBe('B-');
    });

    it('returns C+ for 55-59', () => {
      expect(marksToGrade(59)).toBe('C+');
      expect(marksToGrade(55)).toBe('C+');
    });

    it('returns C for 50-54', () => {
      expect(marksToGrade(54)).toBe('C');
      expect(marksToGrade(50)).toBe('C');
    });

    it('returns C- for 45-49', () => {
      expect(marksToGrade(49)).toBe('C-');
      expect(marksToGrade(45)).toBe('C-');
    });

    it('returns D+ for 40-44', () => {
      expect(marksToGrade(44)).toBe('D+');
      expect(marksToGrade(40)).toBe('D+');
    });

    it('returns D for 35-39', () => {
      expect(marksToGrade(39)).toBe('D');
      expect(marksToGrade(35)).toBe('D');
    });

    it('returns D- for 30-34', () => {
      expect(marksToGrade(34)).toBe('D-');
      expect(marksToGrade(30)).toBe('D-');
    });

    it('returns E for 0-29', () => {
      expect(marksToGrade(29)).toBe('E');
      expect(marksToGrade(0)).toBe('E');
    });

    it('returns E for out of bounds', () => {
      expect(marksToGrade(-1)).toBe('E');
      expect(marksToGrade(101)).toBe('E');
    });
  });

  describe('marksToPoints', () => {
    it('returns correct points for each grade', () => {
      expect(marksToPoints(85)).toBe(12);
      expect(marksToPoints(77)).toBe(11);
      expect(marksToPoints(72)).toBe(10);
      expect(marksToPoints(67)).toBe(9);
      expect(marksToPoints(62)).toBe(8);
      expect(marksToPoints(57)).toBe(7);
      expect(marksToPoints(52)).toBe(6);
      expect(marksToPoints(47)).toBe(5);
      expect(marksToPoints(42)).toBe(4);
      expect(marksToPoints(37)).toBe(3);
      expect(marksToPoints(32)).toBe(2);
      expect(marksToPoints(25)).toBe(1);
    });

    it('returns 1 for out of bounds', () => {
      expect(marksToPoints(-1)).toBe(1);
      expect(marksToPoints(101)).toBe(1);
    });
  });

  describe('gradeToPoints', () => {
    it('returns correct points for each grade', () => {
      expect(gradeToPoints('A')).toBe(12);
      expect(gradeToPoints('A-')).toBe(11);
      expect(gradeToPoints('B+')).toBe(10);
      expect(gradeToPoints('B')).toBe(9);
      expect(gradeToPoints('B-')).toBe(8);
      expect(gradeToPoints('C+')).toBe(7);
      expect(gradeToPoints('C')).toBe(6);
      expect(gradeToPoints('C-')).toBe(5);
      expect(gradeToPoints('D+')).toBe(4);
      expect(gradeToPoints('D')).toBe(3);
      expect(gradeToPoints('D-')).toBe(2);
      expect(gradeToPoints('E')).toBe(1);
    });

    it('returns 1 for unknown grade', () => {
      expect(gradeToPoints('X')).toBe(1);
    });
  });

  describe('calculateAggregate', () => {
    it('sums top 7 subjects', () => {
      const points = [12, 11, 10, 9, 8, 7, 6, 5, 4];
      expect(calculateAggregate(points)).toBe(63); // 12+11+10+9+8+7+6 = 63
    });

    it('uses all subjects if less than 7', () => {
      const points = [12, 11, 10];
      expect(calculateAggregate(points)).toBe(33);
    });

    it('ignores zero/negative points', () => {
      const points = [12, 11, 10, 0, -1, 9, 8, 7, 6];
      expect(calculateAggregate(points)).toBe(63); // 12+11+10+9+8+7+6 = 63 (top 7 positive values)
    });

    it('returns 0 for empty array', () => {
      expect(calculateAggregate([])).toBe(0);
    });
  });

  describe('calculateMeanGrade', () => {
    it('returns correct mean grade for aggregate', () => {
      expect(calculateMeanGrade(84)).toBe('A');
      expect(calculateMeanGrade(80)).toBe('A');
      expect(calculateMeanGrade(77)).toBe('A-');
      expect(calculateMeanGrade(70)).toBe('B+');
      expect(calculateMeanGrade(65)).toBe('B');
      expect(calculateMeanGrade(60)).toBe('B-');
      expect(calculateMeanGrade(55)).toBe('C+');
      expect(calculateMeanGrade(50)).toBe('C+');
      expect(calculateMeanGrade(45)).toBe('C');
      expect(calculateMeanGrade(40)).toBe('C-');
      expect(calculateMeanGrade(35)).toBe('D+');
      expect(calculateMeanGrade(30)).toBe('D');
      expect(calculateMeanGrade(20)).toBe('D-');
    });
  });

  describe('calculateMeanPoints', () => {
    it('calculates mean points', () => {
      expect(calculateMeanPoints(70, 7)).toBe(10);
      expect(calculateMeanPoints(42, 7)).toBe(6);
      expect(calculateMeanPoints(0, 7)).toBe(0);
    });

    it('handles zero subjects', () => {
      expect(calculateMeanPoints(0, 0)).toBe(0);
    });
  });

  describe('isPass', () => {
    it('returns true for C+ and above', () => {
      expect(isPass(7)).toBe(true); // C+
      expect(isPass(8)).toBe(true); // B-
      expect(isPass(12)).toBe(true); // A
    });

    it('returns false for below C+', () => {
      expect(isPass(6)).toBe(false); // C
      expect(isPass(1)).toBe(false); // E
    });
  });

  describe('parseMarkValue', () => {
    it('parses valid numbers', () => {
      expect(parseMarkValue(85)).toBe(85);
      expect(parseMarkValue('85')).toBe(85);
      expect(parseMarkValue(' 85 ')).toBe(85);
    });

    it('clamps to 0-100', () => {
      expect(parseMarkValue(150)).toBe(100);
      expect(parseMarkValue(-10)).toBe(0);
    });

    it('handles ABS', () => {
      expect(parseMarkValue('ABS')).toBe('ABS');
      expect(parseMarkValue('abs')).toBe('ABS');
      expect(parseMarkValue(' Abs ')).toBe('ABS');
    });

    it('returns null for invalid', () => {
      expect(parseMarkValue('')).toBeNull();
      expect(parseMarkValue('abc')).toBeNull();
      expect(parseMarkValue(null)).toBeNull();
      expect(parseMarkValue(undefined)).toBeNull();
    });
  });

  describe('isValidMark', () => {
    it('returns true for valid marks', () => {
      expect(isValidMark(0)).toBe(true);
      expect(isValidMark(100)).toBe(true);
      expect(isValidMark('ABS')).toBe(true);
    });

    it('returns false for invalid', () => {
      expect(isValidMark(null)).toBe(false);
      expect(isValidMark(-1)).toBe(false);
      expect(isValidMark(101)).toBe(false);
    });
  });

  describe('Constants', () => {
    it('has correct boundary values', () => {
      expect(KCSE_BOUNDARIES.length).toBe(12);
      expect(PASS_POINTS).toBe(7);
      expect(PASS_MARK).toBe(55);
      expect(MAX_AGGREGATE).toBe(84);
      expect(MAX_SUBJECTS_FOR_AGGREGATE).toBe(7);
    });
  });
});