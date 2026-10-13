import React, { useState } from 'react';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV } from '../utils/grading';

export const SubjectAnalysisView: React.FC = () => {
  const { subjectDepartmentalStats, classAverage, activeStream, activeExam } = useGrading();
  const [comparePrevious, setComparePrevious] = useState(true);
  const [showItemAnalysisModal, setShowItemAnalysisModal] = useState(false);

  const qualifyingSubjectsCount = subjectDepartmentalStats.filter((s) => s.average >= 55.0).length;
  const highestLift = subjectDepartmentalStats[0];
  const lowestDrag = subjectDepartmentalStats[subjectDepartmentalStats.length - 1];

  const handleExportCSV = () => {
    const headers = [
      'Subject',
      'Average',
      'Highest',
      'Lowest',
      'Pass Rate (%)',
      'Entered',
      'Vs Last Exam',
    ];

    const rows = subjectDepartmentalStats.map((s, idx) => [
      `${idx + 1}. ${s.subject.name}`,
      s.average.toFixed(1),
      s.highest,
      s.lowest,
      `${s.passRate}%`,
      s.entered,
      `${s.diffFromLastExam >= 0 ? '↑' : '↓'} ${Math.abs(s.diffFromLastExam).toFixed(1)}`,
    ]);

    exportTableToCSV(
      `Subject_Analysis_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      headers,
      rows
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Section Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD6C7]">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Subject Analysis</h1>
          <p className="font-body-md text-body-md text-[#5F5E5E] mt-1">
            Which subjects are lifting or dragging the class
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap no-print">
          {/* Toggle: Compare with previous exam */}
          <button
            onClick={() => setComparePrevious(!comparePrevious)}
            type="button"
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#FBF8F1] border border-[#DDD6C7] rounded text-[#111111] hover:bg-[#F2EDE3] transition-colors cursor-pointer select-none"
          >
            <span className="font-body-sm text-body-sm text-[#111111]">Compare with previous exam</span>
            <span
              className={`w-8 h-4 inline-flex items-center p-0.5 rounded-full transition-colors relative ${
                comparePrevious ? 'bg-[#C2410C]' : 'bg-[#DDD6C7]'
              }`}
            >
              <span
                className={`w-3 h-3 bg-[#FBF8F1] rounded-full transition-transform block ${
                  comparePrevious ? 'translate-x-4' : 'translate-x-0'
                }`}
              ></span>
            </span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-1.5 bg-transparent border border-[#111111] rounded text-[#111111] font-body-sm text-body-sm hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            type="button"
            className="px-3.5 py-1.5 bg-transparent border border-[#111111] rounded text-[#111111] font-body-sm text-body-sm hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Top Section: Horizontal Bar Chart */}
      <section className="py-6 border-b border-[#DDD6C7]">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase">
              SUBJECT MEAN SCORE BENCHMARK
            </span>
            <span className="text-[#9A958A] text-caption font-caption">(0 – 100 Scale)</span>
          </div>
          <div className="flex items-center gap-4 text-caption font-caption text-[#5F5E5E]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#111111] block"></span>
              <span>Leading Subject</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#5F5E5E] block"></span>
              <span>Class Subjects</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 border-t border-dashed border-[#111111] block"></span>
              <span>C+ Target (55.0)</span>
            </span>
          </div>
        </div>

        {/* Monochrome Ledger Chart Canvas */}
        <div className="bg-[#FBF8F1] border border-[#DDD6C7] p-5 relative">
          {/* C+ Cutoff Vertical Line (at 55%) */}
          <div
            className="absolute top-4 bottom-7 w-[1px] border-l border-dashed border-[#111111] z-10 pointer-events-none"
            style={{ left: 'calc(140px + ((100% - 200px) * 0.55))' }}
          >
            <span className="absolute -top-3.5 -translate-x-1/2 font-tabular-sm text-tabular-sm text-[#111111] whitespace-nowrap bg-[#FBF8F1] px-1 font-medium">
              55.0 C+ cutoff line
            </span>
          </div>

          <div className="space-y-2.5">
            {subjectDepartmentalStats.map((item, index) => {
              const isLeading = index === 0;
              const barWidth = Math.min(100, Math.max(0, item.average));

              return (
                <div key={item.subject.code} className="flex items-center gap-4 text-body-sm">
                  <div className="w-[140px] text-right font-body-sm text-[#111111] flex justify-end items-center gap-1.5">
                    <span className="font-tabular-sm text-tabular-sm text-[#9A958A]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={isLeading ? 'font-headline-sm text-headline-sm font-semibold' : ''}>
                      {item.subject.name}
                    </span>
                  </div>

                  <div className="flex-1 bg-[#F2EDE3] h-6 relative overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isLeading ? 'bg-[#111111]' : 'bg-[#5F5E5E]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>

                  <div className="w-12 text-right font-tabular-md text-tabular-md text-[#111111] font-medium">
                    {item.average.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Axis Baseline Ticks */}
          <div className="flex items-center gap-4 text-tabular-sm text-[#9A958A] mt-3 pt-2 border-t border-[#DDD6C7]">
            <div className="w-[140px]"></div>
            <div className="flex-1 flex justify-between px-0.5">
              <span>0</span>
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <span>100</span>
            </div>
            <div className="w-12 text-right font-medium">Mean</div>
          </div>
        </div>
      </section>

      {/* Below Section: Detailed Ledger Table */}
      <section className="py-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">Departmental Breakdown</h2>
            <p className="font-caption text-caption text-[#5F5E5E]">
              Complete marks distribution and comparison vs previous evaluation
            </p>
          </div>
          <div className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
            Total Enrollments: {subjectDepartmentalStats.length * 42} subject candidatures
          </div>
        </div>

        <div className="border border-[#DDD6C7] bg-[#FBF8F1] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 border-b border-[#DDD6C7] bg-[#FEF9EF]">
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase font-semibold">
                  SUBJECT
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  AVERAGE
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  HIGHEST
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  LOWEST
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  PASS RATE
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  ENTERED
                </th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] uppercase text-right font-semibold">
                  VS LAST EXAM
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {subjectDepartmentalStats.map((item, idx) => {
                const showDivider =
                  idx > 0 &&
                  subjectDepartmentalStats[idx - 1].average >= 55.0 &&
                  item.average < 55.0;

                return (
                  <React.Fragment key={item.subject.code}>
                    {/* Cutoff Threshold Divider Line */}
                    {showDivider && (
                      <tr className="bg-[#F2EDE3] border-y border-[#111111]">
                        <td
                          colSpan={7}
                          className="py-1 px-4 font-tabular-sm text-tabular-sm text-[#5F5E5E] tracking-wider uppercase font-semibold text-center"
                        >
                          ─── C+ Cutoff Line (55.0 Mean Target) ─── Above: {idx} Subjects · Below:{' '}
                          {subjectDepartmentalStats.length - idx} Subjects ───
                        </td>
                      </tr>
                    )}

                    <tr className="h-[44px] hover:bg-[#F2EDE3] transition-colors">
                      <td className="px-4 font-body-md text-body-md text-[#111111] font-medium flex items-center gap-2">
                        <span className="w-4 text-tabular-sm text-[#9A958A]">{idx + 1}.</span>
                        <span>{item.subject.name}</span>
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#111111] font-semibold">
                        {item.average.toFixed(1)}
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#111111]">
                        {item.highest}
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#5F5E5E]">
                        {item.lowest}
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#111111]">
                        {item.passRate}%
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#5F5E5E]">
                        {item.entered}
                      </td>
                      <td className="px-4 font-tabular-md text-tabular-md text-right text-[#111111]">
                        {comparePrevious ? (
                          item.diffFromLastExam >= 0 ? (
                            <span className="text-[#111111]">↑ {item.diffFromLastExam.toFixed(1)}</span>
                          ) : (
                            <span className="text-[#5F5E5E]">↓ {Math.abs(item.diffFromLastExam).toFixed(1)}</span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Critical Drag Warning Callout */}
        <div className="mt-4 p-4 border border-[#DDD6C7] bg-[#FBF8F1] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#111111] text-[20px] mt-0.5">
              priority_high
            </span>
            <div>
              <div className="font-headline-sm text-headline-sm text-[#111111]">
                Critical Drag Warning: {lowestDrag?.subject.name || 'Chemistry'}
              </div>
              <p className="font-body-sm text-body-sm text-[#5F5E5E] mt-0.5">
                {lowestDrag?.subject.name} registers the lowest mean at{' '}
                <span className="font-tabular-sm text-tabular-sm font-semibold text-[#111111]">
                  {lowestDrag?.average.toFixed(1)}
                </span>{' '}
                with a {lowestDrag?.passRate}% pass rate, depressing {activeStream}'s aggregate mean
                score by approximately 2.38 grade points. 29 out of 42 candidates scored below the
                C+ benchmark.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowItemAnalysisModal(true)}
              type="button"
              className="font-body-sm text-body-sm font-semibold text-[#C2410C] hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              <span>View Chemistry item analysis</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Summary Statistics Ledger Ribbon */}
        <div className="mt-6 pt-4 border-t border-[#DDD6C7] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase">
              FORM AGGREGATE MEAN
            </span>
            <span className="font-display-stat text-display-stat text-[#111111] tracking-tight mt-1">
              {classAverage.toFixed(1)}
            </span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E] mt-0.5">
              ↑ 0.4 from Term 1
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase">
              HIGHEST SUBJECT LIFT
            </span>
            <span className="font-display-stat text-display-stat text-[#111111] tracking-tight mt-1">
              {highestLift?.subject.name || 'Kiswahili'}
            </span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E] mt-0.5">
              +{(highestLift?.average - classAverage).toFixed(1)} above form mean
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase">
              GREATEST PROGRESS
            </span>
            <span className="font-display-stat text-display-stat text-[#111111] tracking-tight mt-1">
              Mathematics
            </span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E] mt-0.5">
              ↑ 4.1 net gain
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase">
              QUALIFYING SUBJECTS
            </span>
            <span className="font-display-stat text-display-stat text-[#111111] tracking-tight mt-1">
              {qualifyingSubjectsCount} / {subjectDepartmentalStats.length}
            </span>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E] mt-0.5">
              ≥ 55.0 cutoff threshold
            </span>
          </div>
        </div>
      </section>

      {/* Item Analysis Modal */}
      {showItemAnalysisModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-2xl w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7]">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-[#111111]">
                  Chemistry Department Item & Diagnostic Analysis
                </h3>
                <p className="font-caption text-caption text-[#5F5E5E]">
                  Form 4 East · End-term 2 · Paper 1, Paper 2 &amp; Practical Paper 3
                </p>
              </div>
              <button
                onClick={() => setShowItemAnalysisModal(false)}
                className="text-[#5F5E5E] hover:text-[#111111] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-body-sm text-body-sm">
              <div className="p-3 bg-[#FBF8F1] border border-[#DDD6C7]">
                <span className="font-label-caps text-label-caps text-[#C2410C] block mb-1">
                  1. Qualitative Analysis & Salt Preparation (Paper 3 Practical)
                </span>
                <p className="text-[#5F5E5E]">
                  Candidates scored an average of only 38% in cation and anion confirmation tests
                  (precipitate dissolution in excess ammonia). Practical reagents mastery was flagged.
                </p>
              </div>

              <div className="p-3 bg-[#FBF8F1] border border-[#DDD6C7]">
                <span className="font-label-caps text-label-caps text-[#C2410C] block mb-1">
                  2. Mole Concept & Gas Volumes (Paper 1 Theory)
                </span>
                <p className="text-[#5F5E5E]">
                  Stoichiometric ratio conversions resulted in 68% incorrect submissions. Recommended
                  targeted remedial problem-solving sets before national mock examinations.
                </p>
              </div>

              <div className="p-3 bg-[#FBF8F1] border border-[#DDD6C7]">
                <span className="font-label-caps text-label-caps text-[#C2410C] block mb-1">
                  3. Organic Chemistry Nomenclature (Paper 2)
                </span>
                <p className="text-[#5F5E5E]">
                  Esterification mechanisms and fractional distillation of petroleum yielded marginal
                  scores across 32 candidates.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowItemAnalysisModal(false)}
                className="px-4 py-1.5 bg-[#111111] text-[#FEF9EF] rounded text-sm font-medium hover:bg-black cursor-pointer"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
