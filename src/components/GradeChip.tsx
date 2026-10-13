import React from 'react';
import { KCSEGrade } from '../types';

interface GradeChipProps {
  grade: KCSEGrade | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const GradeChip: React.FC<GradeChipProps> = ({ grade, className = '', size = 'sm' }) => {
  const g = grade.trim().toUpperCase();

  // Tier 1: Honors (A, A-, B+) -> Solid carbon black fill, cream text
  if (g === 'A' || g === 'A-' || g === 'B+') {
    return (
      <span
        className={`inline-flex items-center justify-center font-tabular-sm font-semibold rounded-[2px] bg-[#111111] text-[#FBF8F1] select-none ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px] min-w-[20px] leading-tight' : 'px-2 py-0.5 text-xs min-w-[26px]'
        } ${className}`}
      >
        {grade}
      </span>
    );
  }

  // Tier 2: Competent (B, B-, C+) -> 1px solid carbon outline, transparent fill, black text
  if (g === 'B' || g === 'B-' || g === 'C+') {
    return (
      <span
        className={`inline-flex items-center justify-center font-tabular-sm font-semibold rounded-[2px] border border-[#111111] text-[#111111] bg-transparent select-none ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px] min-w-[20px] leading-tight' : 'px-2 py-0.5 text-xs min-w-[26px]'
        } ${className}`}
      >
        {grade}
      </span>
    );
  }

  // Tier 3: Marginal (C, C-, D+) -> 1px solid slate grey outline, transparent fill, slate grey text
  if (g === 'C' || g === 'C-' || g === 'D+') {
    return (
      <span
        className={`inline-flex items-center justify-center font-tabular-sm font-medium rounded-[2px] border border-[#5C5850] text-[#5C5850] bg-transparent select-none ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px] min-w-[20px] leading-tight' : 'px-2 py-0.5 text-xs min-w-[26px]'
        } ${className}`}
      >
        {grade}
      </span>
    );
  }

  // Tier 4: Critical (D, D-, E) -> 1px dashed muted grey outline, transparent fill, muted text
  return (
    <span
      className={`inline-flex items-center justify-center font-tabular-sm font-medium rounded-[2px] border border-dashed border-[#9A958A] text-[#9A958A] bg-transparent select-none ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px] min-w-[20px] leading-tight' : 'px-2 py-0.5 text-xs min-w-[26px]'
      } ${className}`}
    >
      {grade}
    </span>
  );
};
