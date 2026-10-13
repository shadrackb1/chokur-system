import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { getGradeFromScore } from '../utils/grading';

const DEFAULT_SUBJECT_REMARKS: Record<string, string> = {
  MAT: 'Excellent logical and numerical performance',
  ENG: 'Very good analytical and essay writing skills',
  KIS: 'Kazi nzuri sana, lugha na insha thabiti',
  BIO: 'Good grasp of biological concepts and diagrams',
  CHE: 'Consistent effort, practice more organic mechanisms',
  PHY: 'Solid comprehension of mechanics and electronics',
  HIS: 'High comprehension of governance and world wars',
  GEO: 'Commendable map work and field study analysis',
  CRE: 'Exemplary attitude and scriptural application',
  BST: 'Solid understanding of accounting and commerce',
};

export const ReportCardsView: React.FC = () => {
  const {
    students,
    subjects,
    marks,
    rankings,
    selectedStudentId,
    setSelectedStudentId,
    schoolConfig,
    activeStream,
    activeExam,
    classAverage,
  } = useGrading();

  const [searchRoster, setSearchRoster] = useState('');
  const [printAllMode, setPrintAllMode] = useState(false);

  // Selected student calculation
  const selectedCalculation = useMemo(() => {
    return rankings.find((r) => r.student.id === selectedStudentId) || rankings[0];
  }, [rankings, selectedStudentId]);

  // Filtered student list for left panel
  const filteredRoster = useMemo(() => {
    if (!searchRoster.trim()) return rankings;
    const q = searchRoster.toLowerCase();
    return rankings.filter(
      (r) =>
        r.student.name.toLowerCase().includes(q) ||
        r.student.admNo.toLowerCase().includes(q)
    );
  }, [rankings, searchRoster]);

  const handlePrintSingle = () => {
    setPrintAllMode(false);
    window.print();
  };

  const handlePrintAll = () => {
    setPrintAllMode(true);
    setTimeout(() => {
      window.print();
      setPrintAllMode(false);
    }, 150);
  };

  if (!selectedCalculation) {
    return (
      <div className="p-8 text-center text-[#5F5E5E]">
        No student records found in {activeStream}.
      </div>
    );
  }

  // Render a single A4 report card
  const renderReportCard = (calc: typeof selectedCalculation) => {
    const studentMarks = marks[calc.student.id] || {};

    return (
      <article
        key={calc.student.id}
        className="w-full max-w-[820px] bg-[#FFFFFF] border border-[#DDD6C7] p-8 md:p-10 shadow-sm text-[#111111] print-sheet mb-8"
      >
        {/* School Official Archival Header */}
        <div className="text-center pb-5 border-b-2 border-[#111111]">
          <div className="w-10 h-10 border border-[#111111] rounded-full flex items-center justify-center mx-auto mb-2 text-[#111111]">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight uppercase font-headline-lg text-[#111111]">
            {schoolConfig.schoolName}
          </h1>
          <p className="font-caption text-caption text-[#5F5E5E] tracking-wider mt-0.5 uppercase">
            {schoolConfig.postalAddress} · TEL: {schoolConfig.contactPhoneEmail}
          </p>
          <div className="mt-3 inline-block border-y border-[#DDD6C7] py-1 px-4">
            <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider font-semibold text-[#111111]">
              Student Academic Report Card
            </h2>
          </div>
          <p className="font-caption text-caption text-[#5F5E5E] uppercase tracking-widest mt-1">
            {schoolConfig.term}, {schoolConfig.academicYear} · {activeExam}
          </p>
        </div>

        {/* Student Metadata Grid */}
        <div className="my-4 py-3 border-b border-[#DDD6C7] grid grid-cols-2 gap-x-8 gap-y-2 font-body-sm text-body-sm">
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">STUDENT NAME:</span>
            <span className="font-semibold text-[#111111]">{calc.student.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">ADMISSION NO:</span>
            <span className="font-tabular-sm text-tabular-sm font-semibold text-[#111111]">
              {calc.student.admNo}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">CLASS &amp; STREAM:</span>
            <span className="font-semibold text-[#111111]">{calc.student.stream}</span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">CLASS TEACHER:</span>
            <span className="text-[#111111]">{schoolConfig.classTeacher}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">KCPE MARKS:</span>
            <span className="font-tabular-sm text-tabular-sm text-[#111111] font-semibold">
              {calc.student.kcpeMarks}
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase">STUDENT POPULATION:</span>
            <span className="font-tabular-sm text-tabular-sm text-[#111111]">
              {students.length} in class
            </span>
          </div>
        </div>

        {/* Subject Marks Table */}
        <div className="mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y border-[#111111] font-label-caps text-label-caps text-[#5F5E5E] text-left">
                <th className="py-2 pl-2">Subject</th>
                <th className="py-2 text-right">Marks (/100)</th>
                <th className="py-2 text-center">Grade</th>
                <th className="py-2 text-right">Points (/12)</th>
                <th className="py-2 pr-2 text-left pl-6">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
              {subjects.map((subj) => {
                const mark = studentMarks[subj.code];
                const isAbsent = mark === 'ABS';
                const gradeInfo = getGradeFromScore(mark);

                return (
                  <tr key={subj.code} className="h-[40px] hover:bg-[#FBF8F1]">
                    <td className="pl-2 font-medium text-[#111111]">{subj.name}</td>
                    <td className="text-right font-tabular-md text-tabular-md font-semibold text-[#111111]">
                      {isAbsent ? 'ABS' : mark !== null && mark !== undefined ? mark : '—'}
                    </td>
                    <td className="text-center">
                      {isAbsent ? (
                        <span className="text-[#5F5E5E] text-xs font-semibold">ABS</span>
                      ) : mark !== null && mark !== undefined ? (
                        <GradeChip grade={gradeInfo.grade} />
                      ) : (
                        <span className="text-[#DDD6C7]">—</span>
                      )}
                    </td>
                    <td className="text-right font-tabular-md text-tabular-md text-[#111111]">
                      {isAbsent ? 0 : mark !== null && mark !== undefined ? gradeInfo.points : '—'}
                    </td>
                    <td className="pl-6 text-[#5F5E5E] font-caption text-caption">
                      {isAbsent
                        ? 'Candidate was absent for this examination'
                        : DEFAULT_SUBJECT_REMARKS[subj.code] || gradeInfo.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Academic Aggregate Summary Ledger */}
        <div className="mt-4 pt-4 border-t-2 border-[#111111]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBF8F1] p-3 border border-[#DDD6C7]">
            <div>
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block">
                Best 7 Aggregate
              </span>
              <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">
                {calc.aggregate} / 84
              </span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block">Mean Grade</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">
                  {calc.meanGrade}
                </span>
                <span className="font-caption text-caption text-[#5F5E5E]">
                  ({calc.meanPoints.toFixed(2)} pts)
                </span>
              </div>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block">Class Average</span>
              <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">
                {classAverage.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block">Class Position</span>
              <span className="font-tabular-lg text-tabular-lg font-bold text-[#111111]">
                {calc.rank}{' '}
                <span className="font-caption text-caption text-[#5F5E5E] font-normal">
                  of {students.length}
                </span>
              </span>
            </div>
          </div>

          {/* Qualification Status */}
          <div className="mt-2.5 px-3 py-1.5 border border-[#DDD6C7] flex items-center justify-between font-caption text-caption">
            <span className="font-medium text-[#5F5E5E] uppercase tracking-wider">
              KCSE Benchmark Status:
            </span>
            <span className="font-semibold text-[#111111] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
              {calc.qualifies
                ? 'Qualifies for Direct University Entry (C+ and above)'
                : 'Below Direct University Entry Cutoff (Under 7.00 mean points)'}
            </span>
          </div>
        </div>

        {/* Teacher's Remarks Section */}
        <div className="mt-4 pt-3 border-t border-[#DDD6C7]">
          <h3 className="font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
            Class Teacher's Remarks
          </h3>
          <p className="font-body-sm text-body-sm italic text-[#111111] bg-[#FBF8F1] p-2.5 border border-[#DDD6C7] rounded-none">
            "{calc.student.name} is a{' '}
            {calc.qualifies
              ? 'focused, diligent student who demonstrates strong academic leadership across all disciplines. Keep up the high standard.'
              : 'promising candidate with strong potential. Recommended to focus on weaker science subjects for improvement before KCSE.'}
            "
          </p>
        </div>

        {/* Formal Signatures Ledger */}
        <div className="mt-6 pt-4 border-t border-[#DDD6C7] grid grid-cols-3 gap-6 font-caption text-caption">
          <div>
            <span className="text-[#5F5E5E] block mb-6">Class Teacher:</span>
            <div className="border-b border-[#111111]"></div>
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] mt-1 block">
              Signature &amp; Date
            </span>
          </div>
          <div>
            <span className="text-[#5F5E5E] block mb-6">Principal:</span>
            <div className="border-b border-[#111111]"></div>
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] mt-1 block">
              Official School Stamp
            </span>
          </div>
          <div>
            <span className="text-[#5F5E5E] block mb-6">Parent / Guardian:</span>
            <div className="border-b border-[#111111]"></div>
            <span className="font-tabular-sm text-tabular-sm text-[#9A958A] mt-1 block">Signature</span>
          </div>
        </div>

        {/* Term Dates Footnote */}
        <div className="mt-6 pt-3 border-t border-[#DDD6C7] flex items-center justify-between font-caption text-caption text-[#5F5E5E]">
          <span>
            Closing date:{' '}
            <strong className="text-[#111111] font-medium">{schoolConfig.termClosingDate}</strong>
          </span>
          <span>
            Opening date:{' '}
            <strong className="text-[#111111] font-medium">{schoolConfig.termOpeningDate}</strong>
          </span>
        </div>
      </article>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FEF9EF]">
      {/* Top Header Area with Print & Export Actions */}
      <section className="px-6 py-4 border-b border-[#DDD6C7] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FEF9EF] no-print">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-[#111111]">Report Cards</h2>
          <p className="font-body-sm text-body-sm text-[#5F5E5E] mt-0.5">
            {activeStream} · {activeExam}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintSingle}
            type="button"
            className="bg-transparent border border-[#111111] text-[#111111] rounded px-3.5 py-2 font-body-sm text-body-sm hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print this card</span>
          </button>
          <button
            onClick={handlePrintSingle}
            type="button"
            className="bg-transparent border border-[#111111] text-[#111111] rounded px-3.5 py-2 font-body-sm text-body-sm hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrintAll}
            type="button"
            className="bg-[#C2410C] text-[#FEF9EF] rounded px-4 py-2 font-body-sm text-body-sm font-medium hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print all cards for class</span>
          </button>
        </div>
      </section>

      {/* Two-Panel Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Searchable Roster Index */}
        <aside className="w-80 shrink-0 border-r border-[#DDD6C7] flex flex-col bg-[#FEF9EF] overflow-hidden no-print">
          <div className="p-3 border-b border-[#DDD6C7] space-y-2 bg-[#FEF9EF]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[17px] text-[#9A958A]">
                search
              </span>
              <input
                type="text"
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                placeholder="Search student or adm no..."
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded pl-8 pr-3 py-1.5 text-body-sm font-body-sm text-[#111111] placeholder:text-[#9A958A] focus:outline-none focus:border-[#C2410C]"
              />
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm px-1 text-[#5F5E5E]">
              <span className="font-caption text-caption text-[#5F5E5E]">Class Roster</span>
              <div className="flex items-center gap-1 text-[#111111] font-medium text-xs">
                <span>All students ({filteredRoster.length})</span>
              </div>
            </div>
          </div>

          {/* Student list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#DDD6C7] max-h-[calc(100vh-180px)]">
            {filteredRoster.map((item) => {
              const isSelected = item.student.id === selectedStudentId;

              return (
                <div
                  key={item.student.id}
                  onClick={() => setSelectedStudentId(item.student.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#FBF8F1] border-l-2 border-[#C2410C]'
                      : 'hover:bg-[#F2EDE3]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-tabular-sm text-tabular-sm text-[#9A958A]">
                        {item.student.admNo}
                      </span>
                      <h4
                        className={`leading-snug ${
                          isSelected
                            ? 'font-headline-sm text-headline-sm text-[#111111]'
                            : 'font-body-md text-body-md text-[#111111] font-medium'
                        }`}
                      >
                        {item.student.name}
                      </h4>
                    </div>
                    <GradeChip grade={item.meanGrade} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-caption font-caption text-[#5F5E5E]">
                    <span className="text-[#111111] font-medium">Rank {item.rank} of {students.length}</span>
                    <span className="font-tabular-sm text-tabular-sm">{item.aggregate} / 84 pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Panel: Official Printable A4 Sheet Preview */}
        <section className="flex-1 bg-[#F2EDE3] overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start">
          {printAllMode ? (
            // In print all mode, render all students sequentially for the printer
            <div className="w-full flex flex-col items-center">
              {rankings.map((calc) => renderReportCard(calc))}
            </div>
          ) : (
            // In single card mode, render selected student
            renderReportCard(selectedCalculation)
          )}
        </section>
      </div>
    </div>
  );
};
