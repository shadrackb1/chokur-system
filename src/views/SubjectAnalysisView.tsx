import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV, getGradeFromScore } from '../utils/grading';

export const SubjectAnalysisView: React.FC = () => {
  const { subjectDepartmentalStats, classAverage, activeStream, activeExam } = useGrading();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [comparePrevious, setComparePrevious] = useState(true);

  // Departmental filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    subjectDepartmentalStats.forEach((s) => {
      if (s.subject.department) set.add(s.subject.department);
    });
    return Array.from(set);
  }, [subjectDepartmentalStats]);

  const filteredStats = useMemo(() => {
    if (selectedDepartment === 'ALL') return subjectDepartmentalStats;
    return subjectDepartmentalStats.filter((s) => s.subject.department === selectedDepartment);
  }, [subjectDepartmentalStats, selectedDepartment]);

  // Identify drag subjects
  const dragSubjects = useMemo(() => {
    return subjectDepartmentalStats.filter((s) => s.average < classAverage - 4.0);
  }, [subjectDepartmentalStats, classAverage]);

  const handleExportCSV = () => {
    const headers = [
      'Subject Code',
      'Subject Name',
      'Department',
      'Subject Teacher',
      'Entries',
      'Average Score (%)',
      'Mean Grade',
      'Highest Mark',
      'Lowest Mark',
      'Pass Rate (%)',
      'Vs Previous Exam',
    ];

    const rows = filteredStats.map((s) => {
      const grade = getGradeFromScore(s.average);
      return [
        s.subject.code,
        s.subject.name,
        s.subject.department,
        s.subject.teacher || '—',
        s.entered,
        s.average.toFixed(1),
        grade.grade,
        s.highest,
        s.lowest,
        `${s.passRate}%`,
        `${s.diffFromLastExam >= 0 ? '+' : ''}${s.diffFromLastExam.toFixed(1)}`,
      ];
    });

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
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-[#DDD6C7]">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Subject Analysis</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {activeStream} · {activeExam} · performance diagnostics &amp; curriculum benchmark
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap no-print">
          {/* Department Filter */}
          <div className="flex items-center border border-[#DDD6C7] rounded bg-[#FBF8F1] text-xs font-medium overflow-hidden">
            <button
              onClick={() => setSelectedDepartment('ALL')}
              className={`px-3 py-2 min-h-[40px] cursor-pointer ${
                selectedDepartment === 'ALL' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
              }`}
            >
              All Depts
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-2.5 sm:px-3 py-2 min-h-[40px] cursor-pointer truncate max-w-[90px] sm:max-w-none ${
                  selectedDepartment === dept ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-2 bg-transparent border border-[#111111] rounded text-[#111111] font-body-sm text-xs sm:text-[13px] hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            type="button"
            className="px-3.5 py-2 bg-[#C2410C] text-[#FEF9EF] rounded font-body-sm text-xs sm:text-[13px] font-medium hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Critical Drag Warning Callouts */}
      {dragSubjects.length > 0 && (
        <div className="my-4 sm:my-6 p-4 bg-[#FBF8F1] border-l-4 border-[#C2410C] border-y border-r border-[#DDD6C7]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#C2410C] text-[20px] mt-0.5">priority_high</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">
                Curriculum Drag Diagnostic
              </h3>
              <p className="font-body-sm text-xs sm:text-body-sm text-[#5F5E5E] mt-0.5">
                The following subject{dragSubjects.length > 1 ? 's are' : ' is'} performing significantly below the class average of {classAverage.toFixed(1)}%:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {dragSubjects.map((d) => (
                  <span
                    key={d.subject.code}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#DDD6C7] text-xs font-medium text-[#111111]"
                  >
                    <strong>{d.subject.code} ({d.subject.name}):</strong> {d.average.toFixed(1)}% mean
                    <span className="text-[#C2410C] font-semibold">
                      ({(d.average - classAverage).toFixed(1)}% vs class avg)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL BENCHMARK BAR CHART */}
      <section className="my-4 sm:my-6 p-3 sm:p-6 border border-[#DDD6C7] bg-[#FBF8F1] rounded shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-[11px]">
            SUBJECT MEAN SCORE BENCHMARK CHART
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-caption text-[#5F5E5E]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#111111] inline-block"></span>
              <span>Above C+ (55%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#C2410C] inline-block"></span>
              <span>Below C+ (55%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#111111] inline-block"></span>
              <span>55% Cutoff line</span>
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="relative pt-2 pb-6 space-y-3">
          {/* Vertical 55% C+ Benchmark Line */}
          <div
            className="absolute top-0 bottom-6 border-r-2 border-dashed border-[#111111] z-10 pointer-events-none"
            style={{ left: '55%' }}
          >
            <span className="absolute -top-3 -translate-x-1/2 bg-[#111111] text-[#FEF9EF] text-[10px] font-bold px-1.5 py-0.2 rounded-[2px]">
              55% C+
            </span>
          </div>

          {filteredStats.map((stat) => {
            const grade = getGradeFromScore(stat.average);
            const isPassing = stat.average >= 55;

            return (
              <div key={stat.subject.code} className="flex items-center gap-2 sm:gap-3">
                <div className="w-14 sm:w-24 text-right shrink-0">
                  <span className="font-semibold text-xs text-[#111111] block">{stat.subject.code}</span>
                  <span className="text-[10px] text-[#5F5E5E] truncate hidden sm:block">{stat.subject.department}</span>
                </div>

                <div className="flex-1 bg-[#F2EDE3] h-6 rounded-none relative overflow-hidden flex items-center">
                  <div
                    className={`h-full transition-all duration-300 flex items-center justify-end pr-2 text-xs font-bold text-[#FEF9EF] ${
                      isPassing ? 'bg-[#111111]' : 'bg-[#C2410C]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, stat.average))}%` }}
                  >
                    <span className="font-tabular-sm text-[11px]">{stat.average.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="w-16 sm:w-20 shrink-0 flex items-center justify-end gap-1.5">
                  <GradeChip grade={grade.grade} size="sm" />
                  {comparePrevious && (
                    <span
                      className={`text-[10px] sm:text-[11px] font-tabular-sm font-semibold hidden sm:inline ${
                        stat.diffFromLastExam >= 0 ? 'text-emerald-800' : 'text-red-700'
                      }`}
                    >
                      {stat.diffFromLastExam >= 0 ? `+${stat.diffFromLastExam.toFixed(1)}` : stat.diffFromLastExam.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          VIEW A: MOBILE TOUCH SUBJECT CARDS (< 768px)
          ========================================================================= */}
      <div className="md:hidden space-y-3 mb-6 no-print">
        {filteredStats.map((stat) => {
          const grade = getGradeFromScore(stat.average);
          return (
            <div key={stat.subject.code} className="bg-[#FBF8F1] border border-[#DDD6C7] rounded p-3.5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#111111]">{stat.subject.code}</span>
                    <span className="text-xs text-[#5F5E5E] font-medium">{stat.subject.name}</span>
                  </div>
                  <div className="text-[10px] text-[#9A958A] mt-0.5">
                    {stat.subject.department} · Teacher: {stat.subject.teacher || 'Unassigned'}
                  </div>
                </div>
                <GradeChip grade={grade.grade} size="md" />
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-[#DDD6C7]/60 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">Average</span>
                  <span className="font-tabular-md font-bold text-[#111111]">{stat.average.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">Pass Rate</span>
                  <span
                    className={`font-tabular-md font-bold ${
                      stat.passRate >= 70 ? 'text-emerald-800' : stat.passRate < 50 ? 'text-red-700' : 'text-[#111111]'
                    }`}
                  >
                    {stat.passRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">High / Low</span>
                  <span className="font-tabular-md font-medium text-[#111111]">
                    {stat.highest} / {stat.lowest}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[#5F5E5E] text-[11px] font-tabular-sm">{stat.entered} Candidates Entered</span>
                <span
                  className={`font-tabular-sm text-xs font-semibold ${
                    stat.diffFromLastExam >= 0 ? 'text-emerald-800' : 'text-red-700'
                  }`}
                >
                  Trend: {stat.diffFromLastExam >= 0 ? `+${stat.diffFromLastExam.toFixed(1)}` : stat.diffFromLastExam.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW B: DESKTOP & PRINT TABLE (≥ 768px)
          ========================================================================= */}
      <section className="hidden md:block border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider">
                <th className="w-20 px-4">CODE</th>
                <th className="px-4">SUBJECT NAME</th>
                <th className="px-4">DEPARTMENT</th>
                <th className="px-4">TEACHER</th>
                <th className="w-24 px-3 text-right">ENTRIES</th>
                <th className="w-28 px-3 text-right">AVERAGE</th>
                <th className="w-20 px-2 text-center">GRADE</th>
                <th className="w-24 px-3 text-right">HIGH / LOW</th>
                <th className="w-28 px-3 text-right">PASS RATE</th>
                <th className="w-28 px-4 text-right">DEVIATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm text-[#111111]">
              {filteredStats.map((stat) => {
                const grade = getGradeFromScore(stat.average);

                return (
                  <tr key={stat.subject.code} className="h-11 hover:bg-[#F2EDE3] transition-colors">
                    <td className="px-4 font-tabular-sm font-bold text-[#111111]">{stat.subject.code}</td>
                    <td className="px-4 font-medium text-[#111111]">{stat.subject.name}</td>
                    <td className="px-4 text-[#5F5E5E]">{stat.subject.department}</td>
                    <td className="px-4 text-[#111111]">{stat.subject.teacher || '—'}</td>
                    <td className="px-3 text-right font-tabular-sm text-[#5F5E5E]">{stat.entered}</td>
                    <td className="px-3 text-right font-tabular-md font-semibold text-[#111111]">
                      {stat.average.toFixed(1)}%
                    </td>
                    <td className="px-2 text-center">
                      <GradeChip grade={grade.grade} size="sm" />
                    </td>
                    <td className="px-3 text-right font-tabular-sm text-[#5F5E5E]">
                      {stat.highest} / {stat.lowest}
                    </td>
                    <td className="px-3 text-right font-tabular-sm font-medium">
                      <span className={stat.passRate >= 70 ? 'text-emerald-800' : stat.passRate < 50 ? 'text-red-700' : 'text-[#111111]'}>
                        {stat.passRate}%
                      </span>
                    </td>
                    <td className="px-4 text-right font-tabular-sm font-semibold">
                      <span className={stat.diffFromLastExam >= 0 ? 'text-emerald-800' : 'text-red-700'}>
                        {stat.diffFromLastExam >= 0 ? `↑ +${stat.diffFromLastExam.toFixed(1)}` : `↓ ${stat.diffFromLastExam.toFixed(1)}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
