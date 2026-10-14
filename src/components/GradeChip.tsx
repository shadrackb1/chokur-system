import React from 'react';
import { KCSEGrade } from '../types';

interface GradeChipProps {
  grade: KCSEGrade | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const GradeChip: React.FC<GradeChipProps> = ({ grade, className = '', size = 'sm' }) => {
  const g = grade.trim().toUpperCase();

  // Tier 1: Honors (A, A-, B+) -> Solid brand fill, surface text
  if (g === 'A' || g === 'A-' || g === 'B+') {
    return (
      <span
        className={`
          inline-flex items-center justify-center font-mono font-semibold rounded-xs
          bg-tier-honors-bg text-tier-honors-text select-none
          ${size === 'sm' ? 'px-2 py-0.5 text-tabular-xs min-w-[22px] leading-tight' : 'px-2.5 py-0.5 text-tabular-sm min-w-[28px]'}
          ${className}
        `}
      >
        {grade}
      </span>
    );
  }

  // Tier 2: Competent (B, B-, C+) -> brand border, transparent fill, primary text
  if (g === 'B' || g === 'B-' || g === 'C+') {
    return (
      <span
        className={`
          inline-flex items-center justify-center font-mono font-semibold rounded-xs border
          border-tier-competent text-tier-competent bg-transparent select-none
          ${size === 'sm' ? 'px-2 py-0.5 text-tabular-xs min-w-[22px] leading-tight' : 'px-2.5 py-0.5 text-tabular-sm min-w-[28px]'}
          ${className}
        `}
      >
        {grade}
      </span>
    );
  }

  // Tier 3: Marginal (C, C-, D+) -> marginal border, transparent fill, marginal text
  if (g === 'C' || g === 'C-' || g === 'D+') {
    return (
      <span
        className={`
          inline-flex items-center justify-center font-mono font-medium rounded-xs border
          border-tier-marginal text-tier-marginal bg-transparent select-none
          ${size === 'sm' ? 'px-2 py-0.5 text-tabular-xs min-w-[22px] leading-tight' : 'px-2.5 py-0.5 text-tabular-sm min-w-[28px]'}
          ${className}
        `}
      >
        {grade}
      </span>
    );
  }

  // Tier 4: Critical (D, D-, E) -> dashed critical border, transparent fill, critical text
  return (
    <span
      className={`
        inline-flex items-center justify-center font-mono font-medium rounded-xs border border-dashed
        border-tier-critical text-tier-critical bg-transparent select-none
        ${size === 'sm' ? 'px-2 py-0.5 text-tabular-xs min-w-[22px] leading-tight' : 'px-2.5 py-0.5 text-tabular-sm min-w-[28px]'}
        ${className}
      `}
    >
      {grade}
    </span>
  );
};