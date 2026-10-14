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
    <div className="max-w-[var(--content-max-width)] mx-auto px-6 py-8">
      {/* Page Header Area */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <h1 className="text-h1 text-primary tracking-tight">Overview</h1>
          <p className="text-body text-secondary mt-1">
            {activeStream} · {activeExam}
          </p>
        </div>
        <div>
          <button
            onClick={() => setActiveView('marks-entry')}
            type="button"
            className="bg-brand text-inverse hover:bg-brand-hover rounded-sm px-4 py-2 font-h3 flex items-center gap-2 transition-base cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Enter marks</span>
          </button>
        </div>
      </section>

      {/* Metric Strip (Row of 4 ledger metrics separated by thin hairlines) */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-hairline py-6">
        {/* Metric 1 */}
        <div className="pr-6 pb-4 md:pb-0">
          <span className="block text-label text-secondary mb-1">CLASS AVERAGE</span>
          <div className="text-display text-primary leading-none">
            {classAverage > 0 ? classAverage.toFixed(1) : '58.4'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="px-0 md:px-6 pb-4 md:pb-0 border-l-0 md:border-l border-hairline">
          <span className="block text-label text-secondary mb-1">PASS RATE</span>
          <div className="text-display text-primary leading-none">
            {passRate}%
          </div>
        </div>

        {/* Metric 3 */}
        <div className="pr-6 md:px-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-hairline">
          <span className="block text-label text-secondary mb-1">MEAN GRADE</span>
          <div className="text-display text-primary leading-none">
            {meanGrade}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="px-0 md:px-6 pt-4 md:pt-0 border-t md:border-t-0 border-l-0 md:border-l border-hairline">
          <span className="block text-label text-secondary mb-1">STUDENTS RANKED</span>
          <div className="text-display text-primary leading-none">
            {studentsRanked}
          </div>
        </div>
      </section>

      {/* Two-Column Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 pt-8 gap-10">
        {/* LEFT COLUMN (Span 7) */}
        <div className="lg:col-span-7 space-y-8 lg:pr-8 lg:border-r lg:border-hairline">
          {/* Subjects at a glance */}
          <section>
            <h2 className="text-h3 text-primary pb-3 border-b border-hairline">
              Subjects at a glance
            </h2>
            <div className="py-3.5 space-y-2 border-b border-hairline">
              <div className="flex items-baseline justify-between text-body">
                <span className="text-secondary">Strongest:</span>
                <span className="text-primary font-medium">
                  {strongestSubject?.name || 'Kiswahili'}, average{' '}
                  <span className="text-tabular-md">
                    {strongestSubject?.average?.toFixed(1) || '67.2'}
                  </span>
                </span>
              </div>
              <div className="flex items-baseline justify-between text-body">
                <span className="text-secondary">Weakest:</span>
                <span className="text-primary font-medium">
                  {weakestSubject?.name || 'Chemistry'}, average{' '}
                  <span className="text-tabular-md">
                    {weakestSubject?.average?.toFixed(1) || '43.5'}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Near the line */}
          <section>
            <div className="pb-3 border-b border-hairline">
              <h2 className="text-h3 text-primary">Near the line</h2>
              <p className="text-caption text-secondary mt-0.5">
                Students within one point of the C+ cutoff (7.00 mean points benchmark)
              </p>
            </div>

            {/* Ledger Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="py-2.5 text-label text-secondary">STUDENT</th>
                    <th className="py-2.5 text-label text-secondary text-right">MEAN POINTS</th>
                    <th className="py-2.5 text-label text-secondary text-right">AGGREGATE</th>
                    <th className="py-2.5 text-label text-secondary pl-6">WEAKEST SUBJECT</th>
                    <th className="py-2.5 text-label text-secondary text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {nearTheLineStudents.slice(0, 4).map((record) => (
                    <tr key={record.student.id} className="h-11 hover:bg-surface-container transition-base">
                      <td className="text-body text-primary font-medium">
                        {record.student.name}
                      </td>
                      <td className="text-tabular-md text-primary text-right font-medium">
                        {record.meanPoints.toFixed(1)}
                      </td>
                      <td className="text-tabular-md text-primary text-right">
                        {record.aggregate}/84
                      </td>
                      <td className="text-body-sm text-secondary pl-6">
                        {record.weakestSubject ? (
                          <>
                            {record.weakestSubject.code}{' '}
                            <span className="text-tabular-sm text-primary">
                              {record.weakestSubject.score}
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleViewCard(record.student.id)}
                          type="button"
                          className="text-brand font-h3 text-caption hover:underline cursor-pointer bg-transparent border-none p-0 focus-ring"
                        >
                          View card
                        </button>
                      </td>
                    </tr>
                  ))}
                  {nearTheLineStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-secondary text-body-sm">
                        No students currently within 1 point of the C+ cutoff line.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Benchmark rule note */}
            <div className="mt-4 pt-2 border-t border-hairline flex items-center justify-between text-secondary text-caption">
              <span>C+ university entry threshold benchmark: 7.00 mean points</span>
              <span className="text-tabular-sm font-medium">
                {nearTheLineStudents.length} candidates at risk
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Top 5 Section */}
          <section>
            <div className="pb-3 border-b border-hairline flex items-baseline justify-between">
              <h2 className="text-h3 text-primary">Top 5</h2>
              <span className="text-label text-secondary">TERM LEADERBOARD</span>
            </div>

            {/* Rankings Ledger */}
            <div className="divide-y divide-hairline">
              {top5.map((student) => (
                <div
                  key={student.student.id}
                  className="h-11 flex items-center justify-between px-1 hover:bg-surface-container transition-base cursor-pointer"
                  onClick={() => handleViewCard(student.student.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-tabular-md text-secondary w-4 text-center">
                      {student.rank}
                    </span>
                    <span className="text-body text-primary font-medium">
                      {student.student.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-tabular-md text-secondary">
                      {student.aggregate}/84
                    </span>
                    <GradeChip grade={student.meanGrade} />
                  </div>
                </div>
              ))}
            </div>

            {/* View full roster link */}
            <div className="mt-4 pt-2 border-t border-hairline flex justify-between items-center">
              <span className="text-caption text-secondary">
                Showing {Math.min(5, studentsRanked)} of {studentsRanked} ranked
              </span>
              <button
                onClick={() => setActiveView('rankings')}
                type="button"
                className="text-brand font-h3 text-caption hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus-ring"
              >
                <span>View full rankings</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Aggregate Spread Mini-Ledger */}
          <section className="border-t border-hairline pt-6">
            <span className="block text-label text-secondary mb-3">
              AGGREGATE SPREAD
            </span>
            <div className="space-y-3">
              <div>
                <div className="flex items-center text-caption justify-between mb-1.5">
                  <span className="text-secondary text-tabular-sm">Honors Tier (B+ to A)</span>
                  <span className="text-tabular-md text-primary font-semibold">
                    {honorsCount} students ({honorsPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-none overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${Math.min(100, honorsPct)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center text-caption justify-between mb-1.5 pt-1">
                  <span className="text-secondary text-tabular-sm">Pass Tier (C+ to B)</span>
                  <span className="text-tabular-md text-primary font-semibold">
                    {passTierCount} students ({passTierPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-none overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: `${Math.min(100, passTierPct)}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};