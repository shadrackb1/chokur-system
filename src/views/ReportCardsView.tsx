import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { getGradeFromScore } from '../utils/grading';

const DEFAULT_SUBJECT_REMARKS: Record<string, string> = {
  MAT: 'Excellent analytical problem solving and numerical skills.',
  ENG: 'Very good comprehension, composition and grammar mastery.',
  KIS: 'Lugha sanifu na uelewa thabiti wa fasihi.',
  BIO: 'Strong understanding of physiological principles and experiments.',
  CHE: 'Consistent performance, maintain focus on stoichiometry.',
  PHY: 'Commendable application of mathematical models to mechanics.',
  HIS: 'Clear grasp of international relations and constitutional history.',
  GEO: 'Commendable topographical map reading and field survey analysis.',
  CRE: 'Exemplary moral and scriptural grounding throughout.',
  BST: 'Solid comprehension of commercial law and accounting ledgers.',
};

export const ReportCardsView: React.FC = () => {
  const {
    filteredStudents: students,
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // On mobile screens, toggle between roster list and card view
  const [mobileView, setMobileView] = useState<'roster' | 'card'>('roster');
  const reportCardRef = useRef<HTMLDivElement>(null);

  // Selected student calculation
  const selectedCalculation = useMemo(() => {
    return rankings.find((r) => r.student.id === selectedStudentId) || rankings[0];
  }, [rankings, selectedStudentId]);

  // Filtered roster for left pane
  const filteredRoster = useMemo(() => {
    if (!searchRoster.trim()) return rankings;
    const q = searchRoster.toLowerCase();
    return rankings.filter(
      (r) =>
        r.student.name.toLowerCase().includes(q) ||
        r.student.admNo.toLowerCase().includes(q)
    );
  }, [rankings, searchRoster]);

  // Current student index in filtered roster
  const currentIndex = useMemo(() => {
    if (!selectedCalculation) return -1;
    return filteredRoster.findIndex((r) => r.student.id === selectedCalculation.student.id);
  }, [filteredRoster, selectedCalculation]);

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(filteredRoster[currentIndex - 1].student.id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex >= 0 && currentIndex < filteredRoster.length - 1) {
      setSelectedStudentId(filteredRoster[currentIndex + 1].student.id);
    }
  };

  // Keyboard navigation: [ and ] or arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '[' || (e.altKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        handlePrevStudent();
      } else if (e.key === ']' || (e.altKey && e.key === 'ArrowDown')) {
        e.preventDefault();
        handleNextStudent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredRoster]);

  const handlePrintSingle = () => {
    setPrintAllMode(false);
    window.print();
  };

  const handlePrintAll = () => {
    setPrintAllMode(true);
    setTimeout(() => {
      window.print();
      setPrintAllMode(false);
    }, 200);
  };

  // Direct client-side PDF download using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportCardRef.current || !selectedCalculation) return;

    try {
      setIsGeneratingPDF(true);
      const cardElement = reportCardRef.current;
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(
        `ReportCard_${selectedCalculation.student.admNo}_${selectedCalculation.student.name.replace(/\s+/g, '_')}.pdf`
      );
    } catch (err) {
      console.error('Error generating PDF report card:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleNativeShare = async () => {
    if (!selectedCalculation) return;
    const shareText = `KCSE Academic Progress Report for ${selectedCalculation.student.name} (ADM: ${selectedCalculation.student.admNo}) - ${schoolConfig.schoolName}: Grade ${selectedCalculation.meanGrade} (${selectedCalculation.meanPoints.toFixed(1)} pts), Best 7 Aggregate: ${selectedCalculation.aggregate}/84 pts, Rank #${selectedCalculation.rank} in ${activeStream}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Report Card - ${selectedCalculation.student.name}`,
          text: shareText,
        });
      } catch {
        // User cancelled or dismissed
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Report summary copied to clipboard for WhatsApp sharing.');
    }
  };

  if (!selectedCalculation) {
    return (
      <div className="p-8 text-center text-[#5F5E5E]">
        No active student records found in {activeStream}.
      </div>
    );
  }

  // Render a single official A4 Report Card
  const renderReportCard = (calc: typeof selectedCalculation, isMultiPage: boolean = false) => {
    const studentMarks = marks[calc.student.id] || {};

    return (
      <article
        key={calc.student.id}
        ref={isMultiPage ? undefined : reportCardRef}
        className={`w-full max-w-[820px] bg-[#FFFFFF] border border-[#DDD6C7] p-5 sm:p-8 md:p-10 shadow-sm text-[#111111] print-sheet ${
          isMultiPage ? 'mb-12 page-break-always' : 'mb-8'
        }`}
      >
        {/* School Archival Header */}
        <div className="text-center pb-4 sm:pb-5 border-b-2 border-[#111111]">
          <div className="w-12 h-12 border-2 border-[#111111] rounded-full flex items-center justify-center mx-auto mb-2 text-[#111111] font-bold text-lg font-headline-lg">
            CK
          </div>
          <h1 className="text-lg sm:text-[22px] font-bold tracking-tight uppercase font-headline-lg text-[#111111]">
            {schoolConfig.schoolName}
          </h1>
          <p className="font-caption text-caption text-[#5F5E5E] tracking-wider mt-0.5 uppercase text-[10px] sm:text-xs">
            {schoolConfig.postalAddress} · {schoolConfig.contactPhoneEmail}
          </p>
          <p className="italic text-xs text-[#5F5E5E] mt-0.5">"{schoolConfig.motto}"</p>
          <div className="mt-2.5 inline-block border-y border-[#DDD6C7] py-1 px-4 sm:px-6 bg-[#FBF8F1]">
            <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider font-semibold text-[#111111] text-xs sm:text-sm">
              Student Academic Report Card
            </h2>
          </div>
          <p className="font-caption text-caption text-[#5F5E5E] uppercase tracking-widest mt-1 text-[10px] sm:text-xs">
            {schoolConfig.term}, {schoolConfig.academicYear} · {activeExam}
          </p>
        </div>

        {/* Student Metadata Grid */}
        <div className="my-3 sm:my-4 py-2 sm:py-3 border-b border-[#DDD6C7] grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-1.5 sm:gap-y-2 font-body-sm text-body-sm text-xs sm:text-[13px]">
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">STUDENT NAME:</span>
            <span className="font-semibold text-[#111111]">{calc.student.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">ADMISSION NO:</span>
            <span className="font-tabular-sm text-tabular-sm font-semibold text-[#111111]">
              {calc.student.admNo}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">CLASS &amp; STREAM:</span>
            <span className="font-semibold text-[#111111]">{calc.student.stream}</span>
          </div>
          <div className="flex justify-between border-b border-[#DDD6C7]/50 pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">CLASS TEACHER:</span>
            <span className="text-[#111111]">{schoolConfig.classTeacher}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">KCPE MARKS:</span>
            <span className="font-tabular-sm text-tabular-sm text-[#111111] font-semibold">
              {calc.student.kcpeMarks} / 500
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[#5F5E5E] font-caption text-caption uppercase text-[10px] sm:text-[11px]">STREAM POPULATION:</span>
            <span className="font-tabular-sm text-tabular-sm text-[#111111]">
              {students.length} Candidates
            </span>
          </div>
        </div>

        {/* Subject Marks Table */}
        <div className="my-3 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] sm:text-[11px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-1.5 px-2">SUBJECT</th>
                <th className="py-1.5 px-2 text-center w-14">SCORE</th>
                <th className="py-1.5 px-2 text-center w-14">GRADE</th>
                <th className="py-1.5 px-2 text-center w-12">POINTS</th>
                <th className="py-1.5 px-2 hidden sm:table-cell">TEACHER'S EVALUATION REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-[12px] sm:text-body-sm">
              {subjects.map((subj) => {
                const val = studentMarks[subj.code];
                const isAbs = val === 'ABS';
                const gradeInfo = getGradeFromScore(val);
                const remark = DEFAULT_SUBJECT_REMARKS[subj.code] || 'Satisfactory academic effort.';

                return (
                  <tr key={subj.code} className="hover:bg-[#FBF8F1]">
                    <td className="py-2 px-2 font-medium">
                      <span className="font-semibold">{subj.code}</span> · {subj.name}
                    </td>
                    <td className="py-2 px-2 text-center font-tabular-sm">
                      {isAbs ? (
                        <span className="text-[#9A958A] font-bold">ABS</span>
                      ) : val !== null && val !== undefined ? (
                        val
                      ) : (
                        <span className="text-[#DDD6C7]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {isAbs ? (
                        <span className="text-[#9A958A] font-medium text-xs">X</span>
                      ) : val !== null && val !== undefined ? (
                        <GradeChip grade={gradeInfo.grade} size="sm" />
                      ) : (
                        <span className="text-[#DDD6C7]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center font-tabular-sm font-semibold">
                      {isAbs || val === null || val === undefined ? '0' : gradeInfo.points}
                    </td>
                    <td className="py-2 px-2 text-[11px] text-[#5F5E5E] italic hidden sm:table-cell">
                      {remark}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* KCSE KNEC Aggregate Summary Matrix */}
        <div className="my-4 border-2 border-[#111111] p-3 sm:p-4 bg-[#FBF8F1] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="border-r border-[#DDD6C7] pr-2">
            <span className="text-[10px] font-label-caps uppercase text-[#5F5E5E] block">STREAM RANK</span>
            <span className="font-display-stat text-xl sm:text-2xl font-bold text-[#111111] block mt-0.5">
              #{calc.rank} <span className="text-xs text-[#5F5E5E] font-normal">of {students.length}</span>
            </span>
          </div>
          <div className="sm:border-r border-[#DDD6C7] sm:pr-2">
            <span className="text-[10px] font-label-caps uppercase text-[#5F5E5E] block">BEST 7 AGGREGATE</span>
            <span className="font-display-stat text-xl sm:text-2xl font-bold text-[#111111] block mt-0.5">
              {calc.aggregate} <span className="text-xs text-[#5F5E5E] font-normal">/ 84 pts</span>
            </span>
          </div>
          <div className="border-r border-[#DDD6C7] pr-2 pt-2 sm:pt-0 border-t sm:border-t-0">
            <span className="text-[10px] font-label-caps uppercase text-[#5F5E5E] block">MEAN SCORE</span>
            <span className="font-display-stat text-xl sm:text-2xl font-bold text-[#111111] block mt-0.5">
              {calc.average.toFixed(1)}%
            </span>
          </div>
          <div className="pt-2 sm:pt-0 border-t sm:border-t-0">
            <span className="text-[10px] font-label-caps uppercase text-[#5F5E5E] block">KCSE MEAN GRADE</span>
            <div className="mt-1 flex justify-center">
              <GradeChip grade={calc.meanGrade} size="md" />
            </div>
          </div>
        </div>

        {/* Teacher & Principal Signatures */}
        <div className="mt-5 pt-4 border-t border-[#DDD6C7] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#FEF9EF] border border-[#DDD6C7] rounded">
            <span className="font-semibold text-[#111111] block mb-1">Class Teacher's Remarks:</span>
            <p className="italic text-[#5F5E5E] text-[11px] leading-relaxed">
              {calc.qualifies
                ? 'Commendable performance throughout this evaluation period. Qualifies for university degree admission. Maintain consistency in revision.'
                : 'Steady effort observed. Needs intensive revision in weak subject areas to attain the university qualification cutoff threshold.'}
            </p>
            <div className="mt-3 pt-2 border-t border-dashed border-[#DDD6C7] flex justify-between text-[10px] text-[#5F5E5E]">
              <span>Sign: {schoolConfig.classTeacher}</span>
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FEF9EF] border border-[#DDD6C7] rounded">
            <span className="font-semibold text-[#111111] block mb-1">Principal's Seal &amp; Remarks:</span>
            <p className="italic text-[#5F5E5E] text-[11px] leading-relaxed">
              Approved and certified by school administration. Official KNEC candidate academic standing.
            </p>
            <div className="mt-3 pt-2 border-t border-dashed border-[#DDD6C7] flex justify-between text-[10px] text-[#5F5E5E]">
              <span>Principal: {schoolConfig.principalName || 'Mrs. J. K. Cheruiyot'}</span>
              <span>Official Stamp</span>
            </div>
          </div>
        </div>

        {/* Archival Footnote */}
        <div className="mt-4 pt-2 border-t border-[#DDD6C7] flex flex-wrap justify-between items-center text-[10px] text-[#9A958A] font-caption">
          <span>Official KCSE Grading Ledger · Chokur Academic System v2.4</span>
          <span>Next Term Opens: {schoolConfig.termOpeningDate || 'TBA'}</span>
        </div>
      </article>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FEF9EF] font-body-md text-[#111111]">
      {/* Top Header Bar with Actions */}
      <section className="px-3 sm:px-6 py-3 sm:py-4 border-b border-[#DDD6C7] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FEF9EF] no-print">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-lg sm:text-headline-lg text-[#111111]">Report Cards</h2>
            <p className="font-body-sm text-xs sm:text-body-sm text-[#5F5E5E]">
              {activeStream} · {activeExam} · printable A4 certificates
            </p>
          </div>

          {/* Mobile Back to Roster button when viewing card */}
          {mobileView === 'card' && (
            <button
              onClick={() => setMobileView('roster')}
              type="button"
              className="md:hidden px-3 py-1.5 bg-[#FBF8F1] border border-[#DDD6C7] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Roster</span>
            </button>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stepper Navigation Controls */}
          <div className="flex items-center border border-[#DDD6C7] rounded bg-[#FBF8F1] min-h-[40px]">
            <button
              onClick={handlePrevStudent}
              disabled={currentIndex <= 0}
              className="p-2 text-[#5F5E5E] hover:text-[#111111] disabled:opacity-30 cursor-pointer min-h-[40px] min-w-[36px] flex items-center justify-center"
              title="Previous Student (Press [)"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-xs font-tabular-sm px-2 text-[#5F5E5E]">
              {currentIndex + 1} / {filteredRoster.length}
            </span>
            <button
              onClick={handleNextStudent}
              disabled={currentIndex >= filteredRoster.length - 1}
              className="p-2 text-[#5F5E5E] hover:text-[#111111] disabled:opacity-30 cursor-pointer min-h-[40px] min-w-[36px] flex items-center justify-center"
              title="Next Student (Press ])"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Share via WhatsApp / Native Share */}
          <button
            onClick={handleNativeShare}
            type="button"
            className="px-2.5 sm:px-3 py-2 bg-transparent border border-[#DDD6C7] text-[#111111] rounded text-xs font-medium hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
            title="Share report summary"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Print Single Card */}
          <button
            onClick={handlePrintSingle}
            type="button"
            className="px-2.5 sm:px-3 py-2 bg-transparent border border-[#111111] text-[#111111] rounded text-xs font-medium hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>

          {/* Download PDF via jsPDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            type="button"
            className="px-3 py-2 bg-transparent border border-[#111111] text-[#111111] rounded text-xs font-medium hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isGeneratingPDF ? 'hourglass_empty' : 'download'}
            </span>
            <span>{isGeneratingPDF ? 'PDF...' : 'PDF'}</span>
          </button>

          {/* Print All Cards */}
          <button
            onClick={handlePrintAll}
            type="button"
            className="px-3.5 py-2 bg-[#C2410C] text-[#FEF9EF] rounded text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">Print All ({students.length})</span>
            <span className="sm:hidden">All</span>
          </button>
        </div>
      </section>

      {/* Main Responsive Two-Panel Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Searchable Class Roster Index (Hidden on mobile when card is open) */}
        <aside
          className={`w-full md:w-80 shrink-0 border-r border-[#DDD6C7] flex flex-col bg-[#FEF9EF] overflow-hidden no-print ${
            mobileView === 'card' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-[#DDD6C7] space-y-2 bg-[#FEF9EF]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[17px] text-[#9A958A]">
                search
              </span>
              <input
                type="text"
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                placeholder="Search candidate name or adm..."
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded pl-8 pr-3 py-2 text-xs font-body-sm text-[#111111] placeholder:text-[#9A958A] focus:outline-none focus:border-[#C2410C] min-h-[44px]"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1 text-[#5F5E5E]">
              <span className="font-caption text-caption text-[#5F5E5E]">Class Candidates</span>
              <span className="text-[#111111] font-semibold font-tabular-sm">
                {filteredRoster.length} Candidates
              </span>
            </div>
          </div>

          {/* Student list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#DDD6C7] max-h-[calc(100vh-210px)]">
            {filteredRoster.map((item) => {
              const isSelected = item.student.id === selectedCalculation?.student.id;

              return (
                <div
                  key={item.student.id}
                  onClick={() => {
                    setSelectedStudentId(item.student.id);
                    setMobileView('card');
                  }}
                  className={`p-3 cursor-pointer transition-colors min-h-[56px] flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FBF8F1] border-l-3 border-[#C2410C]'
                      : 'hover:bg-[#F2EDE3]'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-tabular-sm text-[11px] text-[#9A958A] block">
                      ADM {item.student.admNo}
                    </span>
                    <h4
                      className={`leading-snug truncate ${
                        isSelected
                          ? 'font-semibold text-xs text-[#111111]'
                          : 'font-medium text-xs text-[#111111]'
                      }`}
                    >
                      {item.student.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#5F5E5E] font-tabular-sm">
                      <span className="text-[#111111] font-semibold">Rank #{item.rank}</span>
                      <span>•</span>
                      <span>{item.aggregate}/84 pts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <GradeChip grade={item.meanGrade} size="sm" />
                    <span className="material-symbols-outlined text-[16px] text-[#9A958A] md:hidden">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Panel: Official Printable A4 Sheet Preview (Shown on desktop or when mobileView === 'card') */}
        <section
          className={`flex-1 bg-[#F2EDE3] overflow-y-auto p-3 sm:p-6 md:p-8 flex flex-col items-center justify-start ${
            mobileView === 'roster' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {printAllMode ? (
            <div className="w-full flex flex-col items-center">
              {rankings.map((calc) => renderReportCard(calc, true))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center overflow-x-auto hide-scrollbar">
              {renderReportCard(selectedCalculation, false)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
