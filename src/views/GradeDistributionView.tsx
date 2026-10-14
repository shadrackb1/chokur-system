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
    <div className="max-w-[var(--content-max-width)] mx-auto px-6 py-8">
      {/* Header & Top Context Toolbar */}
      <section className="mb-6 pb-6 border-b border-hairline">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-h1 text-primary tracking-tight">
              Grade Distribution
            </h1>
            <p className="text-body text-secondary mt-0.5">
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
                className="inline-flex items-center gap-2 bg-surface-panel border border-hairline rounded-sm px-3.5 py-1.5 text-primary text-body-sm hover:bg-surface-container-high transition-base cursor-pointer focus-ring"
              >
                <span>{selectedSubjectName}</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">expand_more</span>
              </button>

              {showSubjectDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-surface-panel border border-hairline shadow-lg py-1 rounded-sm z-50">
                  <button
                    onClick={() => {
                      setSelectedSubjectFilter('ALL');
                      setShowSubjectDropdown(false);
                    }}
                    className={`
                      w-full text-left px-3 py-1.5 text-body-sm hover:bg-surface-container-high transition-base cursor-pointer flex items-center justify-between
                      ${selectedSubjectFilter === 'ALL' ? 'font-medium text-brand' : 'text-primary'}
                    `}
                  >
                    <span>All subjects (mean grade)</span>
                    {selectedSubjectFilter === 'ALL' && <span className="text-tabular-xs font-bold text-brand">✓</span>}
                  </button>
                  {subjects.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => {
                        setSelectedSubjectFilter(s.code);
                        setShowSubjectDropdown(false);
                      }}
                      className={`
                        w-full text-left px-3 py-1.5 text-body-sm hover:bg-surface-container-high transition-base cursor-pointer flex items-center justify-between
                        ${selectedSubjectFilter === s.code ? 'font-medium text-brand' : 'text-primary'}
                      `}
                    >
                      <span>
                        {s.code} - {s.name}
                      </span>
                      {selectedSubjectFilter === s.code && <span className="text-tabular-xs font-bold text-brand">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary Export Action */}
            <button
              onClick={handleExportDistribution}
              type="button"
              className="inline-flex items-center gap-1.5 bg-transparent border border-primary rounded-sm px-3.5 py-1.5 text-primary text-body-sm hover:bg-primary hover:text-inverse transition-base cursor-pointer focus-ring"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export distribution</span>
            </button>
          </div>
        </div>
      </section>

      {/* Monochrome Column Chart Section */}
      <section className="bg-surface-panel border border-hairline p-6 mb-6 rounded-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-label text-secondary tracking-wider uppercase">
            AGGREGATED LETTER GRADE FREQUENCY
          </div>
          <div className="text-tabular-sm text-secondary">
            Total cohort: {rankings.length} candidates evaluated
          </div>
        </div>

        {/* The Chart Area */}
        <div className="relative w-full h-[280px] flex flex-col justify-end pt-8 pb-8 px-4">
          {/* Horizontal Hairline Reference Gridlines */}
          <div className="absolute inset-x-0 top-8 border-b border-hairline flex justify-end pr-2">
            <span className="text-tabular-sm text-tertiary -mt-2">12 (38%)</span>
          </div>
          <div className="absolute inset-x-0 top-[110px] border-b border-hairline flex justify-end pr-2">
            <span className="text-tabular-sm text-tertiary -mt-2">8 (25%)</span>
          </div>
          <div className="absolute inset-x-0 top-[180px] border-b border-hairline flex justify-end pr-2">
            <span className="text-tabular-sm text-tertiary -mt-2">4 (13%)</span>
          </div>
          <div className="absolute inset-x-0 bottom-8 border-b border-primary"></div>

          {/* 5 Columns Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-6 sm:gap-12 h-full items-end pb-0.5">
            {letterCategoryStats.map((cat) => {
              // Tallest bar gets primary fill, others secondary fill
              const isTallest = cat.count === maxBarCount && cat.count > 0;
              const barHeightPct = maxBarCount > 0 ? (cat.count / maxBarCount) * 85 : 0;

              return (
                <div key={cat.letter} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-tabular-sm text-primary mb-2 text-center whitespace-nowrap">
                    <span className={isTallest ? 'font-semibold' : ''}>{cat.count}</span>{' '}
                    <span className="text-secondary">· {cat.pct}%</span>
                  </div>

                  <div
                    className={`w-full max-w-[68px] transition-all duration-300 ${
                      isTallest ? 'bg-primary' : 'bg-secondary'
                    } rounded-xs`}
                    style={{ height: `${Math.max(4, barHeightPct)}%` }}
                  ></div>

                  <div
                    className={`mt-3 text-tabular-md ${
                      isTallest ? 'font-bold text-primary' : 'font-semibold text-primary'
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
        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
          <div className="text-brand text-body-sm font-medium flex items-center gap-1.5">
            <span>Show all 12 grades (A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          </div>
          <span className="text-caption text-secondary">
            Scale: Kenya Certificate of Secondary Education (KCSE)
          </span>
        </div>
      </section>

      {/* Key Finding Callout Sentence */}
      <section className="py-4 border-b border-hairline mb-6">
        <blockquote className="text-h2 text-primary font-semibold tracking-tight">
          "Most of the class sits at C to B-, with a small tail of four students at E."
        </blockquote>
      </section>

      {/* Compact Three-Line Summary Statistics */}
      <section className="border-y border-hairline divide-y divide-hairline mb-8 bg-surface-panel">
        {/* Row 1: Mean Grade */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="text-body text-secondary">Class mean grade</span>
          <div className="flex items-baseline gap-2">
            <span className="text-tabular-lg font-bold text-primary">{meanGrade}</span>
            <span className="text-tabular-sm text-secondary">
              ({classAverage.toFixed(1)} pts)
            </span>
          </div>
        </div>

        {/* Row 2: University Pass Rate */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="text-body text-secondary">
            University pass rate (C+ & above)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-tabular-lg font-bold text-primary">{passRate}%</span>
            <span className="text-tabular-sm text-secondary">
              ({qualifiedCount} of {rankings.length} candidates)
            </span>
          </div>
        </div>

        {/* Row 3: Below Cutoff */}
        <div className="flex items-center justify-between py-3.5 px-4">
          <span className="text-body text-secondary">Students below C+ threshold</span>
          <div className="text-tabular-lg font-bold text-primary">
            {belowCutoffCount}{' '}
            <span className="text-body-sm font-normal text-secondary">students</span>
          </div>
        </div>
      </section>

      {/* Detailed 12-Grade Breakdown Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h3 text-primary">
            KCSE Full 12-Grade Ledger Breakdown
          </h2>
          <span className="text-label text-secondary uppercase tracking-wider">
            Normative distribution
          </span>
        </div>

        <div className="border border-hairline rounded-sm overflow-hidden bg-surface-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-panel">
                <th className="py-2.5 px-4 text-label text-secondary uppercase tracking-wider w-28">
                  KCSE Grade
                </th>
                <th className="py-2.5 px-4 text-label text-secondary uppercase tracking-wider w-36">
                  Points Equivalent
                </th>
                <th className="py-2.5 px-4 text-label text-secondary uppercase tracking-wider text-right">
                  Student Count
                </th>
                <th className="py-2.5 px-4 text-label text-secondary uppercase tracking-wider text-right">
                  Cohort Share
                </th>
                <th className="py-2.5 px-4 text-label text-secondary uppercase tracking-wider text-right">
                  Cumulative %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-hairline text-body-sm">
              {gradeDistributionTiers.map((tier) => {
                const isCPlus = tier.grade === 'C+';

                return (
                  <React.Fragment key={tier.grade}>
                    <tr className="h-11 hover:bg-surface-container-high transition-base">
                      <td className="px-4">
                        <GradeChip grade={tier.grade} />
                      </td>
                      <td className="px-4 text-tabular-sm text-secondary">
                        {tier.pointsEquivalent} Points
                      </td>
                      <td className="px-4 text-right text-tabular-md font-semibold text-primary">
                        {tier.studentCount}
                      </td>
                      <td className="px-4 text-right text-tabular-sm text-secondary">
                        {tier.cohortShare.toFixed(1)}%
                      </td>
                      <td className="px-4 text-right text-tabular-sm text-primary">
                        {tier.cumulativePercentage.toFixed(1)}%
                      </td>
                    </tr>

                    {/* The Cutoff Boundary Line after C+ */}
                    {isCPlus && (
                      <tr className="bg-surface-panel">
                        <td colSpan={5} className="py-1 px-4 border-y-2 border-primary">
                          <div className="flex items-center justify-between">
                            <span className="text-label text-primary uppercase tracking-widest font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-primary inline-block"></span>
                              C+ Cutoff Boundary — Minimum Direct University Entry Requirement
                            </span>
                            <span className="text-tabular-sm text-primary font-semibold">
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
              <tr className="border-t-2 border-primary bg-surface-panel font-semibold">
                <td className="py-3 px-4 text-body-sm text-primary">Total / Cohort</td>
                <td className="py-3 px-4 text-tabular-sm text-secondary">—</td>
                <td className="py-3 px-4 text-right text-tabular-md text-primary">
                  {rankings.length} Candidates
                </td>
                <td className="py-3 px-4 text-right text-tabular-sm text-primary">
                  100.0%
                </td>
                <td className="py-3 px-4 text-right text-tabular-sm text-primary">
                  100.0%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Archival Ledger Footer Note */}
      <footer className="mt-8 pt-4 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between text-secondary text-caption gap-2 no-print">
        <div>Official Ministry of Education Grading Standard (KNEC) — Form 4 Academic Cycle</div>
        <div className="text-tabular-sm">Chokur Archival Records • Ref: CK-2026-T2-F4E</div>
      </footer>
    </div>
  );
};