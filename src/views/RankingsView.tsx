import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV } from '../utils/grading';

export const RankingsView: React.FC = () => {
  const { rankings, classAverage, meanGrade, activeStream, activeExam } = useGrading();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rankings by search term
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    const q = searchQuery.toLowerCase();
    return rankings.filter(
      (r) =>
        r.student.name.toLowerCase().includes(q) ||
        r.student.admNo.toLowerCase().includes(q)
    );
  }, [rankings, searchQuery]);

  const totalEnrollment = rankings.length;
  const qualifiedCount = rankings.filter((r) => r.qualifies).length;
  const highestAggregate = rankings.length > 0 ? rankings[0].aggregate : 0;

  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Admission No',
      'Student Name',
      'Average (%)',
      'Mean Grade',
      'Aggregate (/84)',
      'Subjects Passed',
      'Qualification Status',
    ];

    const rows = rankings.map((r) => [
      r.rank,
      r.student.admNo,
      r.student.name,
      r.average,
      r.meanGrade,
      r.aggregate,
      `${r.subjectsPassed}/10`,
      r.qualifies ? 'Qualifies' : 'Below C+',
    ]);

    exportTableToCSV(
      `Rankings_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      headers,
      rows
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Find index of first student below C+
  const firstBelowCPlusIdx = filteredRankings.findIndex((r) => !r.qualifies);

  return (
    <div className="max-w-[var(--content-max-width)] mx-auto px-6 py-8">
      {/* Header Area */}
      <section className="mb-6 flex flex-col gap-1">
        <h1 className="text-h1 text-primary tracking-tight">Rankings</h1>
        <p className="text-body-sm text-secondary">
          {activeStream} · {activeExam}
        </p>
      </section>

      {/* Editorial Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-hairline py-4 mb-6 bg-surface-panel/60">
        <div className="pr-4 border-r border-hairline">
          <span className="text-label text-secondary block uppercase">
            CLASS ENROLLMENT
          </span>
          <span className="text-display text-primary block mt-1">
            {totalEnrollment}{' '}
            <span className="text-caption text-secondary font-normal">Students</span>
          </span>
        </div>

        <div className="px-4 border-r border-hairline">
          <span className="text-label text-secondary block uppercase">
            QUALIFIED (C+ & ABOVE)
          </span>
          <span className="text-display text-primary block mt-1">
            {qualifiedCount}{' '}
            <span className="text-caption text-secondary font-normal">
              of {totalEnrollment} reported
            </span>
          </span>
        </div>

        <div className="px-4 border-r border-hairline">
          <span className="text-label text-secondary block uppercase">
            CLASS MEAN SCORE
          </span>
          <span className="text-display text-primary block mt-1">
            {classAverage.toFixed(1)}{' '}
            <span className="text-caption text-secondary font-normal">{meanGrade}</span>
          </span>
        </div>

        <div className="pl-4">
          <span className="text-label text-secondary block uppercase">
            HIGHEST AGGREGATE
          </span>
          <span className="text-display text-primary block mt-1">
            {highestAggregate}{' '}
            <span className="text-caption text-secondary font-normal">/ 84 pts</span>
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 no-print">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or admission number"
            className="w-full bg-surface-panel border border-hairline rounded-sm pl-9 pr-3 py-1.5 text-body-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-1.5 bg-transparent border border-primary text-primary text-body-sm rounded-sm hover:bg-surface-container-high transition-base inline-flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-1.5 bg-brand text-inverse text-body-sm font-medium rounded-sm hover:bg-brand-hover transition-base inline-flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print ranking sheet</span>
          </button>
        </div>
      </div>

      {/* Rankings Table Container */}
      <div className="border border-hairline rounded-sm bg-surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="h-10 border-b border-hairline bg-surface-dim">
                <th className="w-16 px-4 text-label text-secondary uppercase text-left tracking-wider">
                  RANK
                </th>
                <th className="px-4 text-label text-secondary uppercase text-left tracking-wider">
                  STUDENT
                </th>
                <th className="w-28 px-4 text-label text-secondary uppercase text-right tracking-wider">
                  AVERAGE
                </th>
                <th className="w-32 px-4 text-label text-secondary uppercase text-center tracking-wider">
                  MEAN GRADE
                </th>
                <th className="w-28 px-4 text-label text-secondary uppercase text-right tracking-wider">
                  AGGREGATE
                </th>
                <th className="w-36 px-4 text-label text-secondary uppercase text-right tracking-wider">
                  SUBJECTS PASSED
                </th>
                <th className="w-32 px-4 text-label text-secondary uppercase text-left tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-hairline">
              {filteredRankings.map((record, idx) => {
                const showCutoffLineBeforeThis =
                  !searchQuery && firstBelowCPlusIdx !== -1 && idx === firstBelowCPlusIdx;

                return (
                  <React.Fragment key={record.student.id}>
                    {/* The C+ Qualification Cutoff Line */}
                    {showCutoffLineBeforeThis && (
                      <tr className="bg-surface-container/40">
                        <td colSpan={7} className="p-0">
                          <div className="relative py-2 flex items-center">
                            <div className="w-full border-t border-primary"></div>
                            <div className="absolute right-8 bg-surface-panel px-3 py-0.5 border border-hairline text-secondary text-label uppercase tracking-wider">
                              C+ qualification line
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr
                      className={`h-11 transition-base ${
                        record.qualifies
                          ? 'hover:bg-surface-container-high'
                          : 'hover:bg-surface-container-high text-secondary-dark'
                      }`}
                    >
                      <td className="px-4 text-tabular-md text-left">
                        {record.rank}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-tabular-sm text-tertiary">
                            {record.student.admNo}
                          </span>
                          <span className="text-body text-primary font-medium">
                            {record.student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-tabular-md text-right">
                        {record.average.toFixed(1)}%
                      </td>
                      <td className="px-4 text-center">
                        <GradeChip grade={record.meanGrade} />
                      </td>
                      <td className="px-4 text-tabular-md text-right">
                        {record.aggregate}/84
                      </td>
                      <td className="px-4 text-tabular-md text-right">
                        {record.subjectsPassed}/10
                      </td>
                      <td className="px-4 text-body-sm">
                        {record.qualifies ? (
                          <span className="text-primary font-medium">Qualifies</span>
                        ) : (
                          <span className="text-secondary-dark border-b border-dashed border-secondary-dark pb-[1px]">
                            Below C+
                          </span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {filteredRankings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-body-sm text-secondary">
                    No students match the search criteria "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-secondary text-caption no-print">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-label text-primary uppercase">
            Grade chip styling:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-xs bg-tier-honors-bg text-tier-honors-text font-mono font-semibold text-tabular-xs">
              A
            </span>
            <span>Solid fill: A, A-, B+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-xs border border-tier-competent text-tier-competent font-mono font-semibold text-tabular-xs">
              B
            </span>
            <span>Black outline: B, B-, C+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-xs border border-tier-marginal text-tier-marginal font-mono font-medium text-tabular-xs">
              C
            </span>
            <span>Grey outline: C, C-, D+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-xs border border-dashed border-tier-critical text-tier-critical font-mono font-medium text-tabular-xs">
              D
            </span>
            <span>Dashed outline: D, D-, E</span>
          </div>
        </div>
        <div className="text-tabular-sm text-secondary">
          Displaying {filteredRankings.length} of {totalEnrollment} records
        </div>
      </div>
    </div>
  );
};