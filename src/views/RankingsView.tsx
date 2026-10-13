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
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header Area */}
      <section className="mb-6 flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Rankings</h1>
        <p className="font-body-sm text-body-sm text-[#5F5E5E]">
          {activeStream} · {activeExam}
        </p>
      </section>

      {/* Editorial Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#DDD6C7] py-4 mb-6 bg-[#FBF8F1]/60">
        <div className="pr-4 border-r border-[#DDD6C7]">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase">
            CLASS ENROLLMENT
          </span>
          <span className="font-display-stat text-[26px] leading-8 text-[#111111] block mt-1">
            {totalEnrollment}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal">Students</span>
          </span>
        </div>

        <div className="px-4 border-r border-[#DDD6C7]">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase">
            QUALIFIED (C+ &amp; ABOVE)
          </span>
          <span className="font-display-stat text-[26px] leading-8 text-[#111111] block mt-1">
            {qualifiedCount}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal">
              of {totalEnrollment} reported
            </span>
          </span>
        </div>

        <div className="px-4 border-r border-[#DDD6C7]">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase">
            CLASS MEAN SCORE
          </span>
          <span className="font-display-stat text-[26px] leading-8 text-[#111111] block mt-1">
            {classAverage.toFixed(1)}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal">{meanGrade}</span>
          </span>
        </div>

        <div className="pl-4">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase">
            HIGHEST AGGREGATE
          </span>
          <span className="font-display-stat text-[26px] leading-8 text-[#111111] block mt-1">
            {highestAggregate}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal">/ 84 pts</span>
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 no-print">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9A958A] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or admission number"
            className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded pl-9 pr-3 py-1.5 font-body-sm text-body-sm text-[#111111] placeholder:text-[#9A958A] focus:outline-none focus:border-[#C2410C]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-1.5 bg-transparent border border-[#111111] text-[#111111] font-body-sm text-body-sm rounded hover:bg-[#F2EDE3] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] font-body-sm text-body-sm font-medium rounded hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print ranking sheet</span>
          </button>
        </div>
      </div>

      {/* Rankings Table Container */}
      <div className="border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9]">
                <th className="w-16 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-left tracking-wider">
                  RANK
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-left tracking-wider">
                  STUDENT
                </th>
                <th className="w-28 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right tracking-wider">
                  AVERAGE
                </th>
                <th className="w-32 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-center tracking-wider">
                  MEAN GRADE
                </th>
                <th className="w-28 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right tracking-wider">
                  AGGREGATE
                </th>
                <th className="w-36 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right tracking-wider">
                  SUBJECTS PASSED
                </th>
                <th className="w-32 px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-left tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DDD6C7]">
              {filteredRankings.map((record, idx) => {
                const showCutoffLineBeforeThis =
                  !searchQuery && firstBelowCPlusIdx !== -1 && idx === firstBelowCPlusIdx;

                return (
                  <React.Fragment key={record.student.id}>
                    {/* The C+ Qualification Cutoff Line */}
                    {showCutoffLineBeforeThis && (
                      <tr className="bg-[#EDE8DE]/40">
                        <td colSpan={7} className="p-0">
                          <div className="relative py-2 flex items-center">
                            <div className="w-full border-t border-[#111111]"></div>
                            <div className="absolute right-8 bg-[#FBF8F1] px-3 py-0.5 border border-[#DDD6C7] text-[#5F5E5E] font-label-caps text-[10px] uppercase tracking-wider">
                              C+ qualification line
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr
                      className={`h-11 transition-colors ${
                        record.qualifies
                          ? 'hover:bg-[#F2EDE3]'
                          : 'hover:bg-[#F2EDE3] text-[#5C5850]'
                      }`}
                    >
                      <td className="px-4 font-tabular-md text-tabular-md text-left">
                        {record.rank}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-tabular-sm text-tabular-sm text-[#9A958A]">
                            {record.student.admNo}
                          </span>
                          <span className="font-body-md text-body-md text-[#111111] font-medium">
                            {record.student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right">
                        {record.average.toFixed(1)}%
                      </td>
                      <td className="px-4 text-center">
                        <GradeChip grade={record.meanGrade} />
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right">
                        {record.aggregate}/84
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right">
                        {record.subjectsPassed}/10
                      </td>
                      <td className="px-4 font-body-sm text-body-sm">
                        {record.qualifies ? (
                          <span className="text-[#111111] font-medium">Qualifies</span>
                        ) : (
                          <span className="text-[#5C5850] border-b border-dashed border-[#5C5850] pb-[1px]">
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
                  <td colSpan={7} className="text-center py-6 text-sm text-[#5F5E5E]">
                    No students match the search criteria "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-[#DDD6C7] flex flex-wrap items-center justify-between gap-4 text-[#5F5E5E] font-caption text-caption no-print">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-label-caps text-label-caps uppercase text-[#111111]">
            Grade chip styling:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-[2px] bg-[#111111] text-[#FBF8F1] font-tabular-sm text-[10px]">
              A
            </span>
            <span>Solid fill: A, A-, B+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-[2px] border border-[#111111] text-[#111111] font-tabular-sm text-[10px]">
              B
            </span>
            <span>Black outline: B, B-, C+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-[2px] border border-[#5C5850] text-[#5C5850] font-tabular-sm text-[10px]">
              C
            </span>
            <span>Grey outline: C, C-, D+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-[2px] border border-dashed border-[#9A958A] text-[#9A958A] font-tabular-sm text-[10px]">
              D
            </span>
            <span>Dashed outline: D, D-, E</span>
          </div>
        </div>
        <div className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
          Displaying {filteredRankings.length} of {totalEnrollment} records
        </div>
      </div>
    </div>
  );
};
