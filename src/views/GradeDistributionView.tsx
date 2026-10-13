import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV, getGradeFromScore } from '../utils/grading';

export const GradeDistributionView: React.FC = () => {
  const {
    rankings,
    subjects,
    marks,
    students,
    classAverage,
    meanGrade,
    passRate,
    gradeDistributionTiers,
    activeStream,
    activeExam,
  } = useGrading();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Compute 5 letter grade categories (A, B, C, D, E) for the column chart
  const letterCategoryStats = useMemo(() => {
    let gradesList: string[] = [];

    if (selectedSubjectFilter === 'ALL') {
      gradesList = rankings.map((r) => r.meanGrade);
    } else {
      // Gather grades for the selected subject
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

  // Max count for chart scaling
  const maxBarCount = Math.max(...letterCategoryStats.map((c) => c.count), 1);

  const belowCutoffCount = rankings.filter((r) => !r.qualifies).length;
  const qualifiedCount = rankings.filter((r) => r.qualifies).length;

  const handleExportDistribution = () => {
    const headers = [
      'KCSE Grade',
      'Points Equivalent',
      'Student Count',
      'Cohort Share (%)',
      'Cumulative (%)',
    ];

    const rows = gradeDistributionTiers.map((t) => [
      t.grade,
      `${t.pointsEquivalent} Points`,
      t.studentCount,
      `${t.cohortShare}%`,
      `${t.cumulativePercentage}%`,
    ]);

    exportTableToCSV(
      `Grade_Distribution_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      headers,
      rows
    );
  };

  const selectedSubjectName =
    selectedSubjectFilter === 'ALL'
      ? 'All subjects (mean grade)'
      : subjects.find((s) => s.code === selectedSubjectFilter)?.name || selectedSubjectFilter;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header & Top Context Toolbar */}
      <section className="mb-6 pb-6 border-b border-[#DDD6C7]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">
              Grade Distribution
            </h1>
            <p className="font-body-md text-body-md text-[#5F5E5E] mt-0.5">
              How the class spreads from A to E
            </p>
          </div>

          {/* Top Toolbar */}
          <div className="flex items-center gap-3 no-print">
            {/* Subject dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                type="button"
                className="inline-flex items-center gap-2 bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3.5 py-1.5 text-[#111111] font-body-sm text-body-sm hover:bg-[#F2EDE3] transition-colors cursor-pointer"
              >
                <span>{selectedSubjectName}</span>
                <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
              </button>

              {showSubjectDropdown && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-[#FBF8F1] border border-[#DDD6C7] shadow-sm py-1 z-50">
                  <button
                    onClick={() => {
                      setSelectedSubjectFilter('ALL');
                      setShowSubjectDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                      selectedSubjectFilter === 'ALL' ? 'font-medium text-[#C2410C]' : 'text-[#111111]'
                    }`}
                  >
                    <span>All subjects (mean grade)</span>
                    {selectedSubjectFilter === 'ALL' && <span>✓</span>}
                  </button>
                  {subjects.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => {
                        setSelectedSubjectFilter(s.code);
                        setShowSubjectDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                        selectedSubjectFilter === s.code
                          ? 'font-medium text-[#C2410C]'
                          : 'text-[#111111]'
                      }`}
                    >
                      <span>
                        {s.code} - {s.name}
                      </span>
                      {selectedSubjectFilter === s.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary Export Action */}
            <button
              onClick={handleExportDistribution}
              type="button"
              className="inline-flex items-center gap-1.5 bg-transparent border border-[#111111] rounded px-3.5 py-1.5 text-[#111111] font-body-sm text-body-sm hover:bg-[#111111] hover:text-[#FBF8F1] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export distribution</span>
            </button>
          </div>
        </div>
      </section>

      {/* Monochrome Column Chart Section */}
      <section className="bg-[#FBF8F1] border border-[#DDD6C7] p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] tracking-wider uppercase">
            AGGREGATED LETTER GRADE FREQUENCY
          </div>
          <div className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
            Total cohort: {rankings.length} candidates evaluated
          </div>
        </div>

        {/* The Chart Area */}
        <div className="relative w-full h-[280px] flex flex-col justify-end pt-8 pb-8 px-4">
          {/* Horizontal Hairline Reference Gridlines */}
          <div className="absolute inset-x-0 top-8 border-b border-[#DDD6C7] flex justify-end pr-2">
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] -mt-2">12 (38%)</span>
          </div>
          <div className="absolute inset-x-0 top-[110px] border-b border-[#DDD6C7] flex justify-end pr-2">
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] -mt-2">8 (25%)</span>
          </div>
          <div className="absolute inset-x-0 top-[180px] border-b border-[#DDD6C7] flex justify-end pr-2">
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] -mt-2">4 (13%)</span>
          </div>
          <div className="absolute inset-x-0 bottom-8 border-b border-[#111111]"></div>

          {/* 5 Columns Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-6 sm:gap-12 h-full items-end pb-0.5">
            {letterCategoryStats.map((cat) => {
              // Tallest bar gets solid black fill, others secondary grey fill
              const isTallest = cat.count === maxBarCount && cat.count > 0;
              const barHeightPct = maxBarCount > 0 ? (cat.count / maxBarCount) * 85 : 0;

              return (
                <div key={cat.letter} className="flex flex-col items-center h-full justify-end group">
                  <div className="font-tabular-sm text-tabular-sm text-[#111111] mb-2 text-center whitespace-nowrap">
                    <span className={isTallest ? 'font-semibold' : ''}>{cat.count}</span>{' '}
                    <span className="text-[#5F5E5E]">· {cat.pct}%</span>
                  </div>

                  <div
                    className={`w-full max-w-[68px] transition-all duration-300 ${
                      isTallest ? 'bg-[#111111]' : 'bg-[#5F5E5E]'
                    }`}
                    style={{ height: `${Math.max(4, barHeightPct)}%` }}
                  ></div>

                  <div
                    className={`mt-3 font-tabular-md text-tabular-md ${
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
        <div className="mt-4 pt-3 border-t border-[#DDD6C7] flex items-center justify-between">
          <div className="text-[#C2410C] font-body-sm text-body-sm font-medium flex items-center gap-1.5">
            <span>Show all 12 grades (A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          </div>
          <span className="font-caption text-caption text-[#5F5E5E]">
            Scale: Kenya Certificate of Secondary Education (KCSE)
          </span>
        </div>
      </section>

      {/* Key Finding Callout Sentence */}
      <section className="py-4 border-b border-[#DDD6C7] mb-6">
        <blockquote className="font-headline-md text-headline-md font-semibold text-[#111111] tracking-tight">
          “Most of the class sits at C to B-, with a small tail of four students at E.”
        </blockquote>
      </section>

      {/* Compact Three-Line Summary Statistics */}
      <section className="border-y border-[#DDD6C7] divide-y divide-[#DDD6C7] mb-8 bg-[#FBF8F1]">
        {/* Row 1: Mean Grade */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="font-body-md text-body-md text-[#5F5E5E]">Class mean grade</span>
          <div className="flex items-baseline gap-2">
            <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">{meanGrade}</span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
              ({classAverage.toFixed(1)} pts)
            </span>
          </div>
        </div>

        {/* Row 2: University Pass Rate */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="font-body-md text-body-md text-[#5F5E5E]">
            University pass rate (C+ &amp; above)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">{passRate}%</span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
              ({qualifiedCount} of {rankings.length} candidates)
            </span>
          </div>
        </div>

        {/* Row 3: Below Cutoff */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="font-body-md text-body-md text-[#5F5E5E]">Students below C+ threshold</span>
          <div className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">
            {belowCutoffCount}{' '}
            <span className="font-body-sm text-body-sm font-normal text-[#5F5E5E]">students</span>
          </div>
        </div>
      </section>

      {/* Detailed 12-Grade Breakdown Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-[#111111]">
            KCSE Full 12-Grade Ledger Breakdown
          </h2>
          <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider">
            Normative distribution
          </span>
        </div>

        <div className="border border-[#DDD6C7] overflow-hidden bg-[#FBF8F1]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDD6C7] bg-[#FEF9EF]">
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider w-28">
                  KCSE Grade
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider w-36">
                  Points Equivalent
                </th>
                <th className="py-2.5 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-right">
                  Student Count
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
              {gradeDistributionTiers.map((tier) => {
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
                            <span className="font-label-caps text-label-caps text-[#111111] uppercase tracking-widest font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#111111] inline-block"></span>
                              C+ Cutoff Boundary — Minimum Direct University Entry Requirement
                            </span>
                            <span className="font-tabular-sm text-tabular-sm text-[#111111] font-semibold">
                              KUCCPS Threshold
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
                <td className="py-3 px-4 font-body-sm text-body-sm text-[#111111]">Total / Cohort</td>
                <td className="py-3 px-4 font-tabular-sm text-tabular-sm text-[#5F5E5E]">—</td>
                <td className="py-3 px-4 text-right font-tabular-md text-tabular-md text-[#111111]">
                  {rankings.length} Candidates
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

      {/* Archival Ledger Footer Note */}
      <footer className="mt-8 pt-4 border-t border-[#DDD6C7] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[#5F5E5E] font-caption text-caption gap-2 no-print">
        <div>Official Ministry of Education Grading Standard (KNEC) — Form 4 Academic Cycle</div>
        <div className="font-tabular-sm text-tabular-sm">Chokur Archival Records • Ref: CK-2026-T2-F4E</div>
      </footer>
    </div>
  );
};
