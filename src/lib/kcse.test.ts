
import { describe, it, expect } from 'vitest';
import { 
  getGradeFromScore, 
  getGradeFromPoints, 
  calculateBest7Aggregate,
  PASS_THRESHOLD_POINTS,
  KCSE_GRADING_TABLE
} from '../lib/kcse';

describe('KCSE Grading Logic', () => {
  describe('getGradeFromScore', () => {
    it('returns correct grade for boundary values', () => {
      expect(getGradeFromScore(80).grade).toBe('A');
      expect(getGradeFromScore(79).grade).toBe('A-');
      expect(getGradeFromScore(75).grade).toBe('A-');
      expect(getGradeFromScore(74).grade).toBe('B+');
      expect(getGradeFromScore(70).grade).toBe('B+');
      expect(getGradeFromScore(69).grade).toBe('B');
      expect(getGradeFromScore(65).grade).toBe('B');
      expect(getGradeFromScore(64).grade).toBe('B-');
      expect(getGradeFromScore(60).grade).toBe('B-');
      expect(getGradeFromScore(59).grade).toBe('C+');
      expect(getGradeFromScore(55).grade).toBe('C+');
      expect(getGradeFromScore(54).grade).toBe('C');
      expect(getGradeFromScore(50).grade).toBe('C');
      expect(getGradeFromScore(49).grade).toBe('C-');
      expect(getGradeFromScore(45).grade).toBe('C-');
      expect(getGradeFromScore(44).grade).toBe('D+');
      expect(getGradeFromScore(40).grade).toBe('D+');
      expect(getGradeFromScore(39).grade).toBe('D');
      expect(getGradeFromScore(35).grade).toBe('D');
      expect(getGradeFromScore(34).grade).toBe('D-');
      expect(getGradeFromScore(30).grade).toBe('D-');
      expect(getGradeFromScore(29).grade).toBe('E');
      expect(getGradeFromScore(0).grade).toBe('E');
    });

    it('handles ABS correctly', () => {
      const result = getGradeFromScore('ABS');
      expect(result.isAbsent).toBe(true);
      expect(result.points).toBe(0);
      expect(result.grade).toBe('E');
    });

    it('handles null/undefined as not entered', () => {
      const nullResult = getGradeFromScore(null);
      expect(nullResult.isNotEntered).toBe(true);
      expect(nullResult.points).toBe(0);

      const undefResult = getGradeFromScore(undefined);
      expect(undefResult.isNotEntered).toBe(true);
    });

    it('clamps values to 0-100', () => {
      expect(getGradeFromScore(-10).grade).toBe('E');
      expect(getGradeFromScore(150).grade).toBe('A');
    });
  });

  describe('getGradeFromPoints', () => {
    it('returns correct mean grade from points', () => {
      expect(getGradeFromPoints(11.5)).toBe('A');
      expect(getGradeFromPoints(11.0)).toBe('A-');
      expect(getGradeFromPoints(10.5)).toBe('A-');
      expect(getGradeFromPoints(10.0)).toBe('B+');
      expect(getGradeFromPoints(9.5)).toBe('B+');
      expect(getGradeFromPoints(9.0)).toBe('B');
      expect(getGradeFromPoints(8.5)).toBe('B');
      expect(getGradeFromPoints(8.0)).toBe('B-');
      expect(getGradeFromPoints(7.5)).toBe('B-');
      expect(getGradeFromPoints(7.0)).toBe('C+');
      expect(getGradeFromPoints(6.5)).toBe('C+');
      expect(getGradeFromPoints(6.0)).toBe('C');
      expect(getGradeFromPoints(5.5)).toBe('C');
      expect(getGradeFromPoints(5.0)).toBe('C-');
      expect(getGradeFromPoints(4.5)).toBe('C-');
      expect(getGradeFromPoints(4.0)).toBe('D+');
      expect(getGradeFromPoints(3.5)).toBe('D+');
      expect(getGradeFromPoints(3.0)).toBe('D');
      expect(getGradeFromPoints(2.5)).toBe('D');
      expect(getGradeFromPoints(2.0)).toBe('D-');
      expect(getGradeFromPoints(1.5)).toBe('D-');
      expect(getGradeFromPoints(1.0)).toBe('E');
    });
  });

  describe('calculateBest7Aggregate', () => {
    it('calculates best 7 correctly', () => {
      const points = [12, 11, 10, 9, 8, 7, 6, 5, 4]; // 9 subjects
      const result = calculateBest7Aggregate(points, points.length);
      expect(result.aggregate).toBe(63); // 12+11+10+9+8+7+6
      expect(result.subjectsUsed).toBe(7);
      expect(result.meanPoints).toBe(9); // 63/7
    });

    it('handles fewer than 7 subjects', () => {
      const points = [12, 11, 10];
      const result = calculateBest7Aggregate(points, points.length);
      expect(result.aggregate).toBe(33);
      expect(result.subjectsUsed).toBe(3);
      expect(result.meanPoints).toBe(11);
    });

    it('handles empty array', () => {
      const result = calculateBest7Aggregate([], 0);
      expect(result.aggregate).toBe(0);
      expect(result.subjectsUsed).toBe(0);
      expect(result.meanPoints).toBe(0);
    });
  });

  describe('PASS_THRESHOLD_POINTS', () => {
    it('is 7.0 (C+)', () => {
      expect(PASS_THRESHOLD_POINTS).toBe(7.0);
    });
  });

  describe('KCSE_GRADING_TABLE', () => {
    it('has all 12 grades', () => {
      expect(KCSE_GRADING_TABLE.length).toBe(12);
    });

    it('has correct points for each grade', () => {
      const expectedPoints = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      KCSE_GRADING_TABLE.forEach((band, i) => {
        expect(band.points).toBe(expectedPoints[i]);
      });
    });
  });
});
