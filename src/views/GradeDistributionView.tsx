import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV, getGradeFromScore, KCSE_GRADING_TABLE } from '../utils/grading';
import { GradeDistributionTier, KCSEGrade } from '../types';

export const GradeDistributionView: React.FC = () => {
  const {
    rankings,
    subjects,
    marks,
    filteredStudents: students,
    classAverage,
    meanGrade,
    passRate,
    activeStream,
    activeExam,
  } = useGrading();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Compute 12-tier distribution based on selected filter (ALL or specific subject)
  const activeDistributionTiers = useMemo<GradeDistributionTier[]>(() => {
    let gradeList: KCSEGrade[] = [];

    if (selectedSubjectFilter === 'ALL') {
      gradeList = rankings.map((r) => r.meanGrade);
    } else {
      students.forEach((s) => {
        const val = marks[s.id]?.[selectedSubjectFilter];
        if (typeof val === 'number') {
          gradeList.push(getGradeFromScore(val).grade);
        }
      });
    }

    const totalCount = gradeList.length || 1;
    let cumulative = 0;

    return KCSE_GRADING_TABLE.map((row) => {
      const count = gradeList.filter((g) => g === row.grade).length;
      const share = Math.round((count / totalCount) * 1000) / 10;
      cumulative += share;

      return {
        grade: row.grade,
        pointsEquivalent: row.points,
        studentCount: count,
        cohortShare: share,
        cumulativePercentage: Math.min(100, Math.round(cumulative * 10) / 10),
      };
    });
  }, [rankings, selectedSubjectFilter, students, marks]);

  // Compute 5 letter grade categories (A, B, C, D, E) for the column chart
  const letterCategoryStats = useMemo(() => {
    let gradesList: string[] = [];

    if (selectedSubjectFilter === 'ALL') {
      gradesList = rankings.map((r) => r.meanGrade);
    } else {
      students.forEach((s) => {
        const val = marks[s.id]?.[selectedSubjectFilter];
        if (typeof val === 'number') {
          gradesList.push(getGradeFromScore(val).grade);
        }
      });
    }

    const total = gradesList.length || 1;

    const countA = gradesList.filter((g) => g.startsWith('A')).length;
    const countB = gradesList.filter((g) => g.startsWith('B')).length;
    const countC = gradesList.filter((g) => g.startsWith('C')).length;
    const countD = gradesList.filter((g) => g.startsWith('D')).length;
    const countE = gradesList.filter((g) => g.startsWith('E')).length;

    const pctA = Math.round((countA / total) * 100);
    const pctB = Math.round((countB / total) * 100);
    const pctC = Math.round((countC / total) * 100);
    const pctD = Math.round((countD / total) * 100);
    const pctE = Math.round((countE / total) * 100);

    return [
      { letter: 'A', count: countA, pct: pctA },
      { letter: 'B', count: countB, pct: pctB },
      { letter: 'C', count: countC, pct: pctC },
      { letter: 'D', count: countD, pct: pctD },
      { letter: 'E', count: countE, pct: pctE },
    ];
  }, [rankings, selectedSubjectFilter, students, marks]);

  const maxBarCount = Math.max(...letterCategoryStats.map((c) => c.count), 1);

  const evaluatedCount =
    selectedSubjectFilter === 'ALL'
      ? rankings.length
      : students.filter((s) => typeof marks[s.id]?.[selectedSubjectFilter] === 'number').length;

  const selectedSubjectName =
    selectedSubjectFilter === 'ALL'
      ? 'Class Aggregate Standing'
      : subjects.find((s) => s.code === selectedSubjectFilter)?.name || selectedSubjectFilter;

  // University pass metrics
  const qualifiedCount = useMemo(() => {
    return activeDistributionTiers
      .filter((t) => t.pointsEquivalent >= 7)
      .reduce((sum, curr) => sum + curr.studentCount, 0);
  }, [activeDistributionTiers]);

  const belowCutoffCount = evaluatedCount - qualifiedCount;

  const handleExportDistribution = () => {
    const headers = [
      'KCSE Grade',
      'Points Equivalent',
      'Candidate Count',
      'Cohort Share (%)',
      'Cumulative (%)',
      'University Eligible',
    ];

    const rows = activeDistributionTiers.map((t) => [
      t.grade,
      String(t.pointsEquivalent),
      String(t.studentCount),
      `${t.cohortShare.toFixed(1)}%`,
      `${t.cumulativePercentage.toFixed(1)}%`,
      t.pointsEquivalent >= 7 ? 'YES' : 'NO',
    ]);

    exportTableToCSV(
      `KCSE_Grade_Distribution_${selectedSubjectFilter}_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      headers,
      rows
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Grade Distribution</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {activeStream} · {activeExam} · 12-tier KNEC cohort frequency distribution
          </p>
        </div>

        {/* Filter Controls Ribbon */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 no-print">
          {/* Subject / Aggregate Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              type="button"
              className="bg-[#FBF8F1] border border-[#DDD6C7] hover:border-[#111111] rounded px-3 py-2 text-xs sm:text-[13px] font-medium flex items-center gap-2 cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C2410C]">filter_list</span>
              <span>Filter: {selectedSubjectFilter === 'ALL' ? 'Cohort Mean' : selectedSubjectFilter}</span>
              <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
            </button>

            {showSubjectDropdown && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#FBF8F1] border border-[#DDD6C7] shadow-lg py-1 z-50 rounded">
                <button
                  onClick={() => {
                    setSelectedSubjectFilter('ALL');
                    setShowSubjectDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                    selectedSubjectFilter === 'ALL' ? 'font-medium text-[#C2410C] bg-[#F8F3E9]' : 'text-[#111111]'
                  }`}
                >
                  <span>Cohort KCSE Mean Grade</span>
                  {selectedSubjectFilter === 'ALL' && <span>✓</span>}
                </button>
                <div className="border-t border-[#DDD6C7]/50 my-1"></div>
                {subjects.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => {
                      setSelectedSubjectFilter(s.code);
                      setShowSubjectDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                      selectedSubjectFilter === s.code
                        ? 'font-medium text-[#C2410C] bg-[#F8F3E9]'
                        : 'text-[#111111]'
                    }`}
                  >
                    <span>
                      {s.code} — {s.name}
                    </span>
                    {selectedSubjectFilter === s.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportDistribution}
            type="button"
            className="inline-flex items-center gap-1.5 bg-transparent border border-[#111111] rounded px-3.5 py-2 text-[#111111] font-body-sm text-xs sm:text-[13px] hover:bg-[#F2EDE3] transition-colors cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Monochrome Column Chart Section */}
      <section className="bg-[#FBF8F1] border border-[#DDD6C7] p-3 sm:p-6 my-4 sm:my-6 rounded shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-1">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] tracking-wider uppercase text-[11px]">
            {selectedSubjectFilter === 'ALL' ? 'COHORT MEAN GRADE FREQUENCY' : `${selectedSubjectFilter} GRADE FREQUENCY`}
          </div>
          <div className="font-tabular-sm text-xs sm:text-tabular-sm text-[#5F5E5E]">
            Evaluated cohort: {evaluatedCount} candidates
          </div>
        </div>

        {/* The Chart Area */}
        <div className="relative w-full h-[240px] sm:h-[280px] flex flex-col justify-end pt-6 pb-6 sm:pb-8 px-2 sm:px-4">
          <div className="absolute inset-x-0 bottom-6 sm:bottom-8 border-b-2 border-[#111111]"></div>

          {/* 5 Columns Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-8 lg:gap-12 h-full items-end pb-0.5">
            {letterCategoryStats.map((cat) => {
              const isTallest = cat.count === maxBarCount && cat.count > 0;
              const barHeightPct = maxBarCount > 0 ? (cat.count / maxBarCount) * 85 : 0;

              return (
                <div key={cat.letter} className="flex flex-col items-center h-full justify-end group">
                  <div className="font-tabular-sm text-xs sm:text-tabular-sm text-[#111111] mb-1.5 text-center whitespace-nowrap">
                    <span className={isTallest ? 'font-bold' : 'font-medium'}>{cat.count}</span>{' '}
                    <span className="text-[#5F5E5E] hidden sm:inline">· {cat.pct}%</span>
                  </div>

                  <div
                    className={`w-full max-w-[48px] sm:max-w-[68px] transition-all duration-300 ${
                      isTallest ? 'bg-[#111111]' : 'bg-[#5F5E5E]'
                    }`}
                    style={{ height: `${Math.max(4, barHeightPct)}%` }}
                  ></div>

                  <div
                    className={`mt-2 sm:mt-3 font-tabular-md text-sm sm:text-tabular-md ${
                      isTallest ? 'font-bold text-[#111111]' : 'font-semibold text-[#111111]'
                    }`}
                  >
                    {cat.letter}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Under-chart Text Note */}
        <div className="mt-3 pt-2.5 border-t border-[#DDD6C7] flex flex-wrap items-center justify-between text-xs gap-1">
          <div className="text-[#C2410C] font-body-sm font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span>KNEC: A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E</span>
          </div>
          <span className="font-caption text-caption text-[#5F5E5E] text-[10px] sm:text-xs">
            C+ Pass vs C Marginal
          </span>
        </div>
      </section>

      {/* Summary Statistics Ledger */}
      <section className="border-y border-[#DDD6C7] divide-y divide-[#DDD6C7] mb-6 bg-[#FBF8F1]">
        <div className="flex items-center justify-between py-3 px-3 sm:px-4">
          <span className="font-body-md text-xs sm:text-body-md text-[#5F5E5E]">Class Mean Grade</span>
          <div className="flex items-baseline gap-2">
            <span className="font-tabular-lg text-lg sm:text-tabular-lg font-bold text-[#111111]">{meanGrade}</span>
            <span className="font-tabular-sm text-xs sm:text-tabular-sm text-[#5F5E5E]">
              ({classAverage.toFixed(1)}% mean score)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-3 sm:px-4">
          <span className="font-body-md text-xs sm:text-body-md text-[#5F5E5E]">
            University Qualified (C+ &amp; Above)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-tabular-lg text-lg sm:text-tabular-lg font-bold text-[#111111]">
              {evaluatedCount > 0 ? Math.round((qualifiedCount / evaluatedCount) * 100) : 0}%
            </span>
            <span className="font-tabular-sm text-xs sm:text-tabular-sm text-[#5F5E5E]">
              ({qualifiedCount} of {evaluatedCount})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-3 sm:px-4">
          <span className="font-body-md text-xs sm:text-body-md text-[#5F5E5E]">Candidates Below C+ Threshold</span>
          <div className="font-tabular-lg text-lg sm:text-tabular-lg font-bold text-[#111111]">
            {belowCutoffCount}{' '}
            <span className="font-body-sm text-xs sm:text-body-sm font-normal text-[#5F5E5E]">candidates</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VIEW A: MOBILE TOUCH 12-TIER LEDGER (< 768px)
          ========================================================================= */}
      <div className="md:hidden space-y-2 mb-6">
        <h2 className="font-headline-sm text-sm text-[#111111] font-semibold mb-2">
          KCSE 12-Grade Breakdown — {selectedSubjectName}
        </h2>
        {activeDistributionTiers.map((tier) => {
          const isCPlus = tier.grade === 'C+';
          return (
            <React.Fragment key={tier.grade}>
              <div className="bg-[#FBF8F1] border border-[#DDD6C7] rounded p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GradeChip grade={tier.grade} size="sm" />
                  <span className="text-xs text-[#5F5E5E] font-tabular-sm">{tier.pointsEquivalent} pts</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-tabular-sm">
                  <span className="font-bold text-[#111111]">{tier.studentCount} students</span>
                  <span className="text-[#5F5E5E]">({tier.cohortShare.toFixed(1)}%)</span>
                  <span className="text-[10px] text-[#9A958A]">Cum: {tier.cumulativePercentage.toFixed(1)}%</span>
                </div>
              </div>

              {isCPlus && (
                <div className="py-2 my-1 border-y-2 border-[#111111] bg-[#F8F3E9] px-3 flex items-center justify-between">
                  <span className="text-[10px] font-label-caps font-bold uppercase text-[#111111]">
                    C+ CUTOFF (DIRECT DEGREE ENTRY PASS LINE)
                  </span>
                  <span className="w-1.5 h-1.5 bg-[#111111] rounded-full"></span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW B: DESKTOP DETAILED 12-GRADE BREAKDOWN TABLE (≥ 768px)
          ========================================================================= */}
      <section className="hidden md:block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-[#111111]">
            KCSE Full 12-Grade Ledger Breakdown — {selectedSubjectName}
          </h2>
          <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider">
            Normative Distribution
          </span>
        </div>

        <div className="border border-[#DDD6C7] overflow-hidden bg-[#FBF8F1] rounded shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDD6C7] bg-[#FEF9EF] text-[11px]">
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider w-28">
                  KCSE Grade
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider w-36">
                  Points Equivalent
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-right">
                  Candidate Count
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-right">
                  Cohort Share
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-right">
                  Cumulative %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
              {activeDistributionTiers.map((tier) => {
                const isCPlus = tier.grade === 'C+';

                return (
                  <React.Fragment key={tier.grade}>
                    <tr className="h-[44px] hover:bg-[#F2EDE3] transition-colors">
                      <td className="px-4">
                        <GradeChip grade={tier.grade} />
                      </td>
                      <td className="px-4 font-tabular-sm text-tabular-sm text-[#5F5E5E]">
                        {tier.pointsEquivalent} Points
                      </td>
                      <td className="px-4 text-right font-tabular-md text-tabular-md font-semibold text-[#111111]">
                        {tier.studentCount}
                      </td>
                      <td className="px-4 text-right font-tabular-sm text-tabular-sm text-[#5F5E5E]">
                        {tier.cohortShare.toFixed(1)}%
                      </td>
                      <td className="px-4 text-right font-tabular-sm text-tabular-sm text-[#111111]">
                        {tier.cumulativePercentage.toFixed(1)}%
                      </td>
                    </tr>

                    {/* The Cutoff Boundary Line after C+ */}
                    {isCPlus && (
                      <tr className="bg-[#FEF9EF]">
                        <td colSpan={5} className="py-1 px-4 border-y-2 border-[#111111]">
                          <div className="flex items-center justify-between">
                            <span className="font-label-caps text-label-caps text-[#111111] uppercase tracking-widest font-bold flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-[#111111] inline-block"></span>
                              C+ Cutoff Boundary — Minimum Direct University Entry Requirement
                            </span>
                            <span className="font-tabular-sm text-tabular-sm text-[#111111] font-semibold text-xs">
                              KUCCPS Pass Line
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-[#111111] bg-[#FEF9EF] font-semibold">
                <td className="py-3 px-4 font-body-sm text-body-sm text-[#111111]">Total Cohort Evaluated</td>
                <td className="py-3 px-4 font-tabular-sm text-tabular-sm text-[#5F5E5E]">—</td>
                <td className="py-3 px-4 text-right font-tabular-md text-tabular-md text-[#111111]">
                  {evaluatedCount} Candidates
                </td>
                <td className="py-3 px-4 text-right font-tabular-sm text-tabular-sm text-[#111111]">
                  100.0%
                </td>
                <td className="py-3 px-4 text-right font-tabular-sm text-tabular-sm text-[#111111]">
                  100.0%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
