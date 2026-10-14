import React from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';

export const OverviewView: React.FC = () => {
  const {
    classAverage,
    passRate,
    meanGrade,
    studentsRanked,
    strongestSubject,
    weakestSubject,
    nearTheLineStudents,
    rankings,
    setActiveView,
    setSelectedStudentId,
    activeStream,
    activeExam,
  } = useGrading();

  const top5 = rankings.slice(0, 5);

  // Distribution tiers for mini-ledger
  const honorsCount = rankings.filter(
    (r) => r.meanGrade === 'A' || r.meanGrade === 'A-' || r.meanGrade === 'B+'
  ).length;
  const honorsPct = studentsRanked > 0 ? Math.round((honorsCount / studentsRanked) * 1000) / 10 : 0;

  const passTierCount = rankings.filter(
    (r) => r.meanGrade === 'B' || r.meanGrade === 'B-' || r.meanGrade === 'C+'
  ).length;
  const passTierPct = studentsRanked > 0 ? Math.round((passTierCount / studentsRanked) * 1000) / 10 : 0;

  const handleViewCard = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('report-cards');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Page Header Area */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Overview</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {activeStream} · {activeExam} · academic performance ledger
          </p>
        </div>

        {/* Quick action buttons: Enter marks, View rankings, Print report cards */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveView('marks-entry')}
            type="button"
            className="flex-1 sm:flex-none bg-[#C2410C] text-[#FEF9EF] hover:opacity-95 rounded px-4 py-2 font-headline-sm text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-none min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[17px]">edit_note</span>
            <span>Enter marks</span>
          </button>

          <button
            onClick={() => setActiveView('rankings')}
            type="button"
            className="flex-1 sm:flex-none bg-transparent border border-[#111111] text-[#111111] hover:bg-[#F2EDE3] rounded px-3.5 py-2 font-body-sm text-xs sm:text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[17px]">format_list_numbered</span>
            <span>View rankings</span>
          </button>

          <button
            onClick={() => setActiveView('report-cards')}
            type="button"
            className="w-full sm:w-auto bg-transparent border border-[#111111] text-[#111111] hover:bg-[#F2EDE3] rounded px-3.5 py-2 font-body-sm text-xs sm:text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            <span>Print report cards</span>
          </button>
        </div>
      </section>

      {/* Metric Strip (Row of 4 ledger metrics separated by thin hairlines) */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-[#DDD6C7] py-6">
        {/* Metric 1 */}
        <div className="pr-6 pb-4 md:pb-0">
          <span className="block font-label-caps text-label-caps text-[#5F5E5E] mb-1">CLASS AVERAGE</span>
          <div className="font-display-stat text-display-stat text-[#111111] leading-none">
            {classAverage.toFixed(1)}%
          </div>
        </div>

        {/* Metric 2 */}
        <div className="px-0 md:px-6 pb-4 md:pb-0 border-l-0 md:border-l border-[#DDD6C7]">
          <span className="block font-label-caps text-label-caps text-[#5F5E5E] mb-1">UNIVERSITY PASS RATE</span>
          <div className="font-display-stat text-display-stat text-[#111111] leading-none">
            {passRate}%
          </div>
        </div>

        {/* Metric 3 */}
        <div className="pr-6 md:px-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#DDD6C7]">
          <span className="block font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN GRADE</span>
          <div className="font-display-stat text-display-stat text-[#111111] leading-none">
            {meanGrade}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="px-0 md:px-6 pt-4 md:pt-0 border-t md:border-t-0 border-l-0 md:border-l border-[#DDD6C7]">
          <span className="block font-label-caps text-label-caps text-[#5F5E5E] mb-1">STUDENTS RANKED</span>
          <div className="font-display-stat text-display-stat text-[#111111] leading-none">
            {studentsRanked}
          </div>
        </div>
      </section>

      {/* Two-Column Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 pt-8 gap-10">
        {/* LEFT COLUMN (Span 7) */}
        <div className="lg:col-span-7 space-y-8 lg:pr-8 lg:border-r lg:border-[#DDD6C7]">
          {/* Subjects at a glance */}
          <section>
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7]">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">
                Subjects at a glance
              </h2>
              <button
                onClick={() => setActiveView('subject-analysis')}
                className="text-[#C2410C] text-xs font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
              >
                <span>Full Subject Analysis</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
            <div className="py-3.5 space-y-2 border-b border-[#DDD6C7]">
              <div className="flex items-baseline justify-between font-body-md text-body-md">
                <span className="text-[#5F5E5E]">Strongest Subject:</span>
                <span className="text-[#111111] font-medium">
                  {strongestSubject?.name || 'Kiswahili'}, average{' '}
                  <span className="font-tabular-md text-tabular-md font-semibold">
                    {strongestSubject?.average?.toFixed(1) || '0.0'}%
                  </span>
                </span>
              </div>
              <div className="flex items-baseline justify-between font-body-md text-body-md">
                <span className="text-[#5F5E5E]">Weakest Subject:</span>
                <span className="text-[#111111] font-medium">
                  {weakestSubject?.name || 'Chemistry'}, average{' '}
                  <span className="font-tabular-md text-tabular-md font-semibold text-[#C2410C]">
                    {weakestSubject?.average?.toFixed(1) || '0.0'}%
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Near the line */}
          <section>
            <div className="pb-3 border-b border-[#DDD6C7]">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Near the line</h2>
              <p className="font-caption text-caption text-[#5F5E5E] mt-0.5">
                Students within 1–2 points of the C+ university threshold (targeted academic intervention)
              </p>
            </div>

            {/* Ledger Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD6C7] text-[11px]">
                    <th className="py-2.5 font-label-caps text-label-caps text-[#5F5E5E]">STUDENT</th>
                    <th className="py-2.5 font-label-caps text-label-caps text-[#5F5E5E] text-right">MEAN POINTS</th>
                    <th className="py-2.5 font-label-caps text-label-caps text-[#5F5E5E] text-right">AGGREGATE</th>
                    <th className="py-2.5 font-label-caps text-label-caps text-[#5F5E5E] pl-6">WEAKEST SUBJECT</th>
                    <th className="py-2.5 font-label-caps text-label-caps text-[#5F5E5E] text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD6C7]">
                  {nearTheLineStudents.slice(0, 6).map((record) => (
                    <tr key={record.student.id} className="h-[44px] hover:bg-[#FBF8F1] transition-colors">
                      <td className="font-body-md text-body-md text-[#111111] font-medium">
                        {record.student.name}
                      </td>
                      <td className="font-tabular-md text-tabular-md text-[#111111] text-right font-medium">
                        {record.meanPoints.toFixed(2)}
                      </td>
                      <td className="font-tabular-md text-tabular-md text-[#111111] text-right">
                        {record.aggregate}/84
                      </td>
                      <td className="font-body-sm text-body-sm text-[#5F5E5E] pl-6">
                        {record.weakestSubject ? (
                          <span className="bg-[#F8F3E9] px-2 py-0.5 rounded border border-[#DDD6C7] text-xs">
                            {record.weakestSubject.code}{' '}
                            <span className="font-tabular-sm text-tabular-sm font-bold text-[#C2410C]">
                              {record.weakestSubject.score}
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleViewCard(record.student.id)}
                          type="button"
                          className="text-[#C2410C] font-headline-sm text-caption hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View card
                        </button>
                      </td>
                    </tr>
                  ))}
                  {nearTheLineStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[#5F5E5E] font-body-sm">
                        No students currently within 1 point of the C+ cutoff line.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Benchmark rule note */}
            <div className="mt-4 pt-2 border-t border-[#DDD6C7] flex items-center justify-between text-[#5F5E5E] font-caption text-caption">
              <span>C+ university threshold benchmark: 6.50+ Mean Points</span>
              <span className="font-tabular-sm text-tabular-sm font-medium">
                {nearTheLineStudents.length} candidates in threshold window
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Top 5 Section */}
          <section>
            <div className="pb-3 border-b border-[#DDD6C7] flex items-baseline justify-between">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Top 5 Cohort Leaderboard</h2>
              <span className="font-label-caps text-label-caps text-[#5F5E5E]">TERM STANDING</span>
            </div>

            {/* Rankings Ledger */}
            <div className="divide-y divide-[#DDD6C7]">
              {top5.map((student) => (
                <div
                  key={student.student.id}
                  className="h-[44px] flex items-center justify-between px-1 hover:bg-[#FBF8F1] transition-colors cursor-pointer"
                  onClick={() => handleViewCard(student.student.id)}
                  title="Click to view report card"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-tabular-md text-tabular-md text-[#5F5E5E] w-4 text-center font-bold">
                      {student.rank}
                    </span>
                    <span className="font-body-md text-body-md text-[#111111] font-medium hover:text-[#C2410C]">
                      {student.student.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-tabular-md text-tabular-md text-[#5F5E5E]">
                      {student.aggregate}/84 pts
                    </span>
                    <GradeChip grade={student.meanGrade} />
                  </div>
                </div>
              ))}
            </div>

            {/* View full roster link */}
            <div className="mt-4 pt-2 border-t border-[#DDD6C7] flex justify-between items-center">
              <span className="font-caption text-caption text-[#5F5E5E]">
                Showing {Math.min(5, studentsRanked)} of {studentsRanked} ranked
              </span>
              <button
                onClick={() => setActiveView('rankings')}
                type="button"
                className="text-[#C2410C] font-headline-sm text-caption hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                <span>View full rankings</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Aggregate Spread Mini-Ledger */}
          <section className="border-t border-[#DDD6C7] pt-6">
            <span className="block font-label-caps text-label-caps text-[#5F5E5E] mb-3">
              AGGREGATE PERFORMANCE TIERS
            </span>
            <div className="space-y-3">
              <div>
                <div className="flex items-center text-caption justify-between mb-1.5">
                  <span className="text-[#5F5E5E] font-tabular-sm">Honors Tier (B+ to A)</span>
                  <span className="font-tabular-md text-[#111111] font-semibold">
                    {honorsCount} students ({honorsPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#F2EDE3] h-1.5 rounded-none overflow-hidden">
                  <div className="bg-[#111111] h-full" style={{ width: `${Math.min(100, honorsPct)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center text-caption justify-between mb-1.5 pt-1">
                  <span className="text-[#5F5E5E] font-tabular-sm">Competent Pass Tier (C+ to B)</span>
                  <span className="font-tabular-md text-[#111111] font-semibold">
                    {passTierCount} students ({passTierPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#F2EDE3] h-1.5 rounded-none overflow-hidden">
                  <div className="bg-[#5F5E5E] h-full" style={{ width: `${Math.min(100, passTierPct)}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
