import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { MarkValue } from '../types';
import { exportTableToCSV, getGradeFromScore, sanitizeMarkInput } from '../utils/grading';

type EntryMode = 'grid' | 'student' | 'subject';

export const MarksEntryView: React.FC = () => {
  const {
    filteredStudents: students,
    subjects,
    marks,
    updateMark,
    batchUpdateMarks,
    rankings,
    activeStream,
    activeExam,
    saveStatus,
    forceSave,
  } = useGrading();

  // Responsive default mode: on phone screen (<768px), default to 'student' card mode
  const [entryMode, setEntryMode] = useState<EntryMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'student';
    }
    return 'grid';
  });

  // Active student in student-by-student mode
  const [activeStudentIdx, setActiveStudentIdx] = useState(0);

  // Active subject in subject-by-subject mode
  const [activeSubjectCode, setActiveSubjectCode] = useState<string>(
    subjects[0]?.code || 'MAT'
  );

  // Active cell in grid matrix mode
  const [focusedCell, setFocusedCell] = useState<{ studentId: string; subjectCode: string } | null>(() => {
    if (students.length > 0 && subjects.length > 0) {
      return { studentId: students[0].id, subjectCode: subjects[0].code };
    }
    return null;
  });

  const [editingValue, setEditingValue] = useState<string>('');
  const [isPastingModalOpen, setIsPastingModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const gridInputRef = useRef<HTMLInputElement>(null);

  // Sync editing value when focused cell changes in grid mode
  useEffect(() => {
    if (focusedCell) {
      const current = marks[focusedCell.studentId]?.[focusedCell.subjectCode];
      setEditingValue(current === null || current === undefined ? '' : String(current));
      setValidationWarning(null);
      setTimeout(() => {
        gridInputRef.current?.focus();
        gridInputRef.current?.select();
      }, 10);
    }
  }, [focusedCell, marks]);

  // Handle cell navigation in grid mode
  const navigateCell = (deltaRow: number, deltaCol: number) => {
    if (!focusedCell || students.length === 0 || subjects.length === 0) return;
    const currentStudentIdx = students.findIndex((s) => s.id === focusedCell.studentId);
    const currentSubjectIdx = subjects.findIndex((s) => s.code === focusedCell.subjectCode);

    if (currentStudentIdx === -1 || currentSubjectIdx === -1) return;

    let nextStudentIdx = currentStudentIdx + deltaRow;
    let nextSubjectIdx = currentSubjectIdx + deltaCol;

    if (deltaCol !== 0 && nextSubjectIdx >= subjects.length) {
      nextSubjectIdx = 0;
      nextStudentIdx = Math.min(students.length - 1, nextStudentIdx + 1);
    } else if (deltaCol !== 0 && nextSubjectIdx < 0) {
      nextSubjectIdx = subjects.length - 1;
      nextStudentIdx = Math.max(0, nextStudentIdx - 1);
    }

    nextStudentIdx = Math.max(0, Math.min(students.length - 1, nextStudentIdx));
    nextSubjectIdx = Math.max(0, Math.min(subjects.length - 1, nextSubjectIdx));

    commitCellEdit();

    setFocusedCell({
      studentId: students[nextStudentIdx].id,
      subjectCode: subjects[nextSubjectIdx].code,
    });
  };

  const commitCellEdit = () => {
    if (!focusedCell) return;
    const { studentId, subjectCode } = focusedCell;
    const sanitized = sanitizeMarkInput(editingValue);
    const num = Number(editingValue.trim());

    if (editingValue.trim() && !isNaN(num) && (num < 0 || num > 100)) {
      setValidationWarning('Mark clamped within valid range (0–100)');
      setTimeout(() => setValidationWarning(null), 3000);
    } else if (editingValue.trim() && sanitized === null && editingValue.trim().toUpperCase() !== 'ABS') {
      setValidationWarning('Invalid entry: enter a mark (0–100) or ABS');
      setTimeout(() => setValidationWarning(null), 3000);
    }

    updateMark(studentId, subjectCode, sanitized);
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigateCell(-1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateCell(1, 0);
        break;
      case 'ArrowLeft':
        if (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
          e.preventDefault();
          navigateCell(0, -1);
        }
        break;
      case 'ArrowRight':
        if (
          e.currentTarget.selectionStart === editingValue.length &&
          e.currentTarget.selectionEnd === editingValue.length
        ) {
          e.preventDefault();
          navigateCell(0, 1);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          navigateCell(0, -1);
        } else {
          navigateCell(0, 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        navigateCell(1, 0);
        break;
      case 'Escape':
        e.preventDefault();
        if (focusedCell) {
          const original = marks[focusedCell.studentId]?.[focusedCell.subjectCode];
          setEditingValue(original === null || original === undefined ? '' : String(original));
        }
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditingValue(val);
    const sanitized = sanitizeMarkInput(val);
    const num = Number(val.trim());

    if (val.trim() && !isNaN(num) && (num < 0 || num > 100)) {
      setValidationWarning('Number will be clamped to 0–100');
    } else if (val.trim() && sanitized === null && val.trim().toUpperCase() !== 'ABS') {
      setValidationWarning('Enter numbers (0–100) or ABS');
    } else {
      setValidationWarning(null);
    }
  };

  const handleCellBlur = () => {
    commitCellEdit();
  };

  const handleSaveAll = () => {
    commitCellEdit();
    forceSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Student mode navigation
  const currentStudent = students[activeStudentIdx] || students[0];
  const currentStudentCalc = rankings.find((r) => r.student.id === currentStudent?.id);

  const handlePrevStudent = () => {
    if (activeStudentIdx > 0) setActiveStudentIdx(activeStudentIdx - 1);
  };

  const handleNextStudent = () => {
    if (activeStudentIdx < students.length - 1) setActiveStudentIdx(activeStudentIdx + 1);
  };

  const handleSingleMarkChange = (studentId: string, subjectCode: string, rawVal: string) => {
    const sanitized = sanitizeMarkInput(rawVal);
    updateMark(studentId, subjectCode, sanitized);
  };

  // Matrix paste preview & execution
  const parsedPasteGrid = useMemo(() => {
    if (!pastedText.trim() || !focusedCell || students.length === 0 || subjects.length === 0) {
      return null;
    }

    const startStudentIdx = students.findIndex((s) => s.id === focusedCell.studentId);
    const startSubjectIdx = subjects.findIndex((s) => s.code === focusedCell.subjectCode);

    if (startStudentIdx === -1 || startSubjectIdx === -1) return null;

    const rawRows = pastedText
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const updates: Array<{
      studentId: string;
      studentName: string;
      subjectCode: string;
      raw: string;
      parsed: MarkValue;
      isValid: boolean;
      error?: string;
    }> = [];

    rawRows.forEach((rowStr, rIdx) => {
      const targetStudentIdx = startStudentIdx + rIdx;
      if (targetStudentIdx >= students.length) return;
      const targetStudent = students[targetStudentIdx];

      const cells = rowStr.split(/\t|,/);
      cells.forEach((cellVal, cIdx) => {
        const targetSubjIdx = startSubjectIdx + cIdx;
        if (targetSubjIdx >= subjects.length) return;
        const targetSubj = subjects[targetSubjIdx];

        const trimmed = cellVal.trim();
        if (trimmed === '') {
          updates.push({
            studentId: targetStudent.id,
            studentName: targetStudent.name,
            subjectCode: targetSubj.code,
            raw: trimmed,
            parsed: null,
            isValid: true,
          });
        } else {
          const upper = trimmed.toUpperCase();
          if (upper === 'ABS' || upper === 'A' || upper === 'ABSENT') {
            updates.push({
              studentId: targetStudent.id,
              studentName: targetStudent.name,
              subjectCode: targetSubj.code,
              raw: trimmed,
              parsed: 'ABS',
              isValid: true,
            });
          } else {
            const num = Number(trimmed);
            if (isNaN(num)) {
              updates.push({
                studentId: targetStudent.id,
                studentName: targetStudent.name,
                subjectCode: targetSubj.code,
                raw: trimmed,
                parsed: null,
                isValid: false,
                error: 'Not a number',
              });
            } else if (num < 0 || num > 100) {
              updates.push({
                studentId: targetStudent.id,
                studentName: targetStudent.name,
                subjectCode: targetSubj.code,
                raw: trimmed,
                parsed: Math.max(0, Math.min(100, Math.round(num))),
                isValid: false,
                error: 'Clamped to 0-100',
              });
            } else {
              updates.push({
                studentId: targetStudent.id,
                studentName: targetStudent.name,
                subjectCode: targetSubj.code,
                raw: trimmed,
                parsed: Math.round(num),
                isValid: true,
              });
            }
          }
        }
      });
    });

    const validUpdates = updates.filter((u) => u.isValid || u.error?.includes('Clamped'));
    const invalidCount = updates.length - validUpdates.length;

    return {
      totalCells: updates.length,
      validUpdates,
      invalidCount,
      sampleRows: updates.slice(0, 8),
    };
  }, [pastedText, focusedCell, students, subjects]);

  const handleApplyPaste = () => {
    if (!parsedPasteGrid || parsedPasteGrid.validUpdates.length === 0) {
      setIsPastingModalOpen(false);
      return;
    }

    const batch = parsedPasteGrid.validUpdates.map((u) => ({
      studentId: u.studentId,
      subjectCode: u.subjectCode,
      value: u.parsed,
    }));

    batchUpdateMarks(batch);
    setIsPastingModalOpen(false);
    setPastedText('');
    handleSaveAll();
  };

  const handleExportEnteredMarksCSV = () => {
    const headers = ['AdmNo', 'StudentName', ...subjects.map((s) => s.code), 'Average', 'Aggregate', 'Grade'];
    const rows = students.map((s) => {
      const calc = rankingMap.get(s.id);
      const studentMarks = marks[s.id] || {};
      const subjectCols = subjects.map((subj) => {
        const val = studentMarks[subj.code];
        return val === null || val === undefined ? '' : String(val);
      });
      return [
        s.admNo,
        s.name,
        ...subjectCols,
        calc ? calc.average.toFixed(1) : '',
        calc ? String(calc.aggregate) : '',
        calc ? calc.meanGrade : '',
      ];
    });

    exportTableToCSV(
      `Marks_Entry_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      headers,
      rows
    );
  };

  // Map student calculation for summary columns
  const rankingMap = useMemo(() => {
    const map = new Map<string, (typeof rankings)[0]>();
    rankings.forEach((r) => map.set(r.student.id, r));
    return map;
  }, [rankings]);

  // Subject averages for footer row
  const subjectAverages = useMemo(() => {
    return subjects.map((subj) => {
      let sum = 0;
      let count = 0;
      students.forEach((s) => {
        const val = marks[s.id]?.[subj.code];
        if (typeof val === 'number') {
          sum += val;
          count++;
        }
      });
      return count > 0 ? (sum / count).toFixed(1) : '—';
    });
  }, [subjects, students, marks]);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1440px] w-full mx-auto flex-1 flex flex-col font-body-md text-[#111111]">
      {/* Header Section */}
      <section className="mb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Marks Entry</h1>
          <p className="font-body-sm text-body-sm text-[#5F5E5E]">
            {activeStream} · {activeExam} · spreadsheet ledger with instant KNEC recalculation
          </p>
        </div>

        {/* Save and Validation Toast */}
        <div className="flex items-center gap-2">
          {validationWarning && (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded text-xs flex items-center gap-1.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[15px] text-amber-700">warning</span>
              <span>{validationWarning}</span>
            </div>
          )}
          {saveToast && (
            <div className="bg-[#111111] text-[#FEF9EF] px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              <span>All records synchronized and saved</span>
            </div>
          )}
        </div>
      </section>

      {/* Control Ribbon with Responsive Mode Switcher */}
      <div className="py-2.5 mb-3 border-y border-[#DDD6C7] flex flex-wrap items-center justify-between gap-3 bg-[#FBF8F1] px-3 rounded">
        {/* Mode Segmented Controls */}
        <div className="flex items-center p-0.5 bg-[#EDE8DE] border border-[#DDD6C7] rounded">
          <button
            onClick={() => setEntryMode('student')}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 min-h-[36px] cursor-pointer transition-colors ${
              entryMode === 'student'
                ? 'bg-[#FEF9EF] text-[#111111] font-semibold shadow-xs'
                : 'text-[#5F5E5E] hover:text-[#111111]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Student Mode</span>
          </button>
          <button
            onClick={() => setEntryMode('subject')}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 min-h-[36px] cursor-pointer transition-colors ${
              entryMode === 'subject'
                ? 'bg-[#FEF9EF] text-[#111111] font-semibold shadow-xs'
                : 'text-[#5F5E5E] hover:text-[#111111]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Subject Mode</span>
          </button>
          <button
            onClick={() => setEntryMode('grid')}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 min-h-[36px] cursor-pointer transition-colors ${
              entryMode === 'grid'
                ? 'bg-[#FEF9EF] text-[#111111] font-semibold shadow-xs'
                : 'text-[#5F5E5E] hover:text-[#111111]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_on</span>
            <span>Full Grid</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {entryMode === 'grid' && (
            <button
              onClick={() => setIsPastingModalOpen(true)}
              type="button"
              className="px-2.5 py-1.5 text-body-sm text-xs sm:text-[13px] font-medium text-[#111111] border border-[#111111] rounded bg-transparent hover:bg-[#F2EDE3] transition-colors flex items-center gap-1 cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-[16px]">content_paste</span>
              <span className="hidden sm:inline">Paste from Excel</span>
            </button>
          )}

          <button
            onClick={handleExportEnteredMarksCSV}
            type="button"
            className="px-2.5 py-1.5 text-body-sm text-xs sm:text-[13px] font-medium text-[#111111] border border-[#DDD6C7] rounded bg-transparent hover:bg-[#F2EDE3] transition-colors flex items-center gap-1 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSaveAll}
            type="button"
            className="px-3.5 py-1.5 text-body-sm text-xs sm:text-[13px] font-medium text-[#FEF9EF] bg-[#C2410C] rounded hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save All</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: STUDENT-BY-STUDENT TOUCH MODE (Optimized for Phones & Tablets)
          ========================================================================= */}
      {entryMode === 'student' && currentStudent && (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          {/* Candidate Card & Stepper Header */}
          <div className="bg-[#FBF8F1] border border-[#DDD6C7] p-4 rounded mb-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDD6C7]">
              <div>
                <span className="text-[10px] font-label-caps text-[#5F5E5E] uppercase tracking-wider block">
                  Candidate {activeStudentIdx + 1} of {students.length}
                </span>
                <h2 className="font-headline-md text-headline-md text-[#111111] font-semibold">
                  {currentStudent.name}
                </h2>
                <div className="text-xs text-[#5F5E5E] font-tabular-sm mt-0.5">
                  ADM: <strong>{currentStudent.admNo}</strong> · KCPE: {currentStudent.kcpeMarks} · {currentStudent.gender}
                </div>
              </div>

              {/* Instant Performance Badge */}
              {currentStudentCalc && (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs text-[#5F5E5E]">Rank: #{currentStudentCalc.rank}</span>
                    <GradeChip grade={currentStudentCalc.meanGrade} size="md" />
                  </div>
                  <div className="text-[11px] text-[#5F5E5E] font-tabular-sm mt-1">
                    Mean: {currentStudentCalc.meanPoints.toFixed(1)} pts · Best 7: {currentStudentCalc.aggregate}/84
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons (min-h 48px touch targets) */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevStudent}
                disabled={activeStudentIdx === 0}
                type="button"
                className="flex-1 py-2.5 px-3 min-h-[48px] bg-[#FEF9EF] border border-[#DDD6C7] hover:bg-[#F2EDE3] disabled:opacity-30 rounded font-medium text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Previous Student</span>
              </button>

              {/* Quick Jump Selector */}
              <select
                value={activeStudentIdx}
                onChange={(e) => setActiveStudentIdx(Number(e.target.value))}
                className="py-2.5 px-2 min-h-[48px] bg-[#FEF9EF] border border-[#DDD6C7] rounded text-xs font-medium cursor-pointer"
              >
                {students.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    #{idx + 1} {s.admNo} - {s.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextStudent}
                disabled={activeStudentIdx === students.length - 1}
                type="button"
                className="flex-1 py-2.5 px-3 min-h-[48px] bg-[#FEF9EF] border border-[#DDD6C7] hover:bg-[#F2EDE3] disabled:opacity-30 rounded font-medium text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Next Student</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Subjects Mark Entry Form */}
          <div className="bg-[#FBF8F1] border border-[#DDD6C7] rounded overflow-hidden divide-y divide-[#DDD6C7]/70 shadow-xs mb-6">
            <div className="px-4 py-2.5 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-[#5F5E5E] text-[11px] uppercase">
                Curriculum Subjects ({subjects.length})
              </span>
              <span className="text-[11px] text-[#5F5E5E]">Enter 0–100 or ABS</span>
            </div>

            {subjects.map((subj) => {
              const currentVal = marks[currentStudent.id]?.[subj.code];
              const scoreNum = typeof currentVal === 'number' ? currentVal : null;
              const grade = scoreNum !== null ? getGradeFromScore(scoreNum).grade : null;

              return (
                <div
                  key={subj.code}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#F8F3E9] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[#111111]">{subj.code}</span>
                      <span className="text-xs text-[#5F5E5E] truncate">{subj.name}</span>
                    </div>
                    <span className="text-[10px] text-[#9A958A] uppercase font-label-caps">
                      {subj.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Big Touch Numeric Input with inputmode="numeric" & text-base to prevent auto-zoom */}
                    <input
                      type="text"
                      inputMode="numeric"
                      enterKeyHint="next"
                      value={currentVal === null || currentVal === undefined ? '' : String(currentVal)}
                      onChange={(e) => handleSingleMarkChange(currentStudent.id, subj.code, e.target.value)}
                      placeholder="—"
                      className="w-20 sm:w-24 h-12 text-center text-base sm:text-base font-tabular-md font-semibold bg-white border border-[#DDD6C7] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] rounded focus:outline-none"
                    />

                    {/* Live KCSE Grade Chip */}
                    <div className="w-10 flex justify-center">
                      {grade ? <GradeChip grade={grade} size="sm" /> : <span className="text-[#9A958A] text-xs">—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 2: SUBJECT-BY-SUBJECT MODE (Rapid batch marking for a teacher)
          ========================================================================= */}
      {entryMode === 'subject' && (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Subject Horizontal Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-3">
            {subjects.map((subj) => (
              <button
                key={subj.code}
                onClick={() => setActiveSubjectCode(subj.code)}
                type="button"
                className={`px-3 py-2 min-h-[44px] rounded text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  activeSubjectCode === subj.code
                    ? 'bg-[#111111] text-[#FEF9EF] border-[#111111]'
                    : 'bg-[#FBF8F1] text-[#5F5E5E] border-[#DDD6C7] hover:border-[#111111]'
                }`}
              >
                <span>{subj.code}</span>
                <span className="text-[10px] font-normal opacity-80 block truncate max-w-[120px]">
                  {subj.name}
                </span>
              </button>
            ))}
          </div>

          {/* Student Roster for active subject */}
          <div className="bg-[#FBF8F1] border border-[#DDD6C7] rounded overflow-hidden shadow-xs divide-y divide-[#DDD6C7]/70 mb-6">
            <div className="px-4 py-2.5 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-[#5F5E5E] text-[11px] uppercase">
                Marking {activeSubjectCode} for {activeStream} ({students.length} Candidates)
              </span>
              <span className="text-[11px] text-[#5F5E5E]">Tab / Enter steps to next candidate</span>
            </div>

            {students.map((student, idx) => {
              const currentVal = marks[student.id]?.[activeSubjectCode];
              const scoreNum = typeof currentVal === 'number' ? currentVal : null;
              const grade = scoreNum !== null ? getGradeFromScore(scoreNum).grade : null;

              return (
                <div
                  key={student.id}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#F8F3E9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-xs font-tabular-sm text-[#9A958A]">{idx + 1}.</span>
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-[#111111]">{student.name}</div>
                      <div className="text-[10px] text-[#5F5E5E] font-tabular-sm">
                        ADM {student.admNo} · KCPE {student.kcpeMarks}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      enterKeyHint="next"
                      value={currentVal === null || currentVal === undefined ? '' : String(currentVal)}
                      onChange={(e) => handleSingleMarkChange(student.id, activeSubjectCode, e.target.value)}
                      placeholder="—"
                      className="w-20 sm:w-24 h-11 text-center text-base font-tabular-md font-semibold bg-white border border-[#DDD6C7] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] rounded focus:outline-none"
                    />
                    <div className="w-10 flex justify-center">
                      {grade ? <GradeChip grade={grade} size="sm" /> : <span className="text-[#9A958A] text-xs">—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: FULL SPREADSHEET MATRIX (Grid Mode with Arrow Navigation & Paste)
          ========================================================================= */}
      {entryMode === 'grid' && (
        <div className="flex-1 border border-[#DDD6C7] bg-[#FBF8F1] overflow-hidden flex flex-col shadow-xs">
          <div className="overflow-x-auto hide-scrollbar flex-1 relative max-h-[640px]">
            <table className="w-full border-collapse text-left border-spacing-0">
              {/* Table Header */}
              <thead>
                <tr className="h-10 bg-[#FEF9EF] border-b border-[#DDD6C7] sticky top-0 z-30">
                  <th
                    className="sticky left-0 z-30 bg-[#FEF9EF] border-r border-[#DDD6C7] px-3 py-2 w-64 min-w-[240px]"
                    scope="col"
                  >
                    <div className="flex items-center justify-between font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-[11px]">
                      <span>ADM / STUDENT NAME ({students.length})</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>

                  {/* Subject Headers */}
                  {subjects.map((subj) => (
                    <th
                      key={subj.code}
                      className="border-r border-[#DDD6C7] px-2 py-2 text-center w-20 min-w-[76px] font-label-caps text-label-caps text-[#5F5E5E]"
                      scope="col"
                      title={subj.name}
                    >
                      {subj.code}
                    </th>
                  ))}

                  {/* Summary Headers */}
                  <th className="border-r border-[#DDD6C7] px-2 py-2 text-center w-16 font-label-caps text-label-caps text-[#5F5E5E]">
                    AVG
                  </th>
                  <th className="border-r border-[#DDD6C7] px-2 py-2 text-center w-16 font-label-caps text-label-caps text-[#5F5E5E]">
                    AGG
                  </th>
                  <th className="px-2 py-2 text-center w-16 font-label-caps text-label-caps text-[#5F5E5E]">
                    GRADE
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[#DDD6C7]">
                {students.map((student, rowIdx) => {
                  const studentMarks = marks[student.id] || {};
                  const calc = rankingMap.get(student.id);

                  return (
                    <tr key={student.id} className="h-10 hover:bg-[#F8F3E9] transition-colors group">
                      {/* Sticky Student Identifier Column */}
                      <td className="sticky left-0 z-20 bg-[#FBF8F1] group-hover:bg-[#F8F3E9] border-r border-[#DDD6C7] px-3 py-1.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-tabular-sm text-xs font-semibold text-[#111111] shrink-0">
                              {student.admNo}
                            </span>
                            <span className="text-body-sm text-xs truncate text-[#111111]" title={student.name}>
                              {student.name}
                            </span>
                          </div>
                          <span className="font-tabular-sm text-[10px] text-[#5F5E5E] ml-1 shrink-0">
                            {student.kcpeMarks}
                          </span>
                        </div>
                      </td>

                      {/* Marks Cells */}
                      {subjects.map((subj) => {
                        const isFocused =
                          focusedCell?.studentId === student.id && focusedCell?.subjectCode === subj.code;
                        const cellVal = studentMarks[subj.code];
                        const isAbsent = cellVal === 'ABS';
                        const scoreNum = typeof cellVal === 'number' ? cellVal : null;
                        const grade = scoreNum !== null ? getGradeFromScore(scoreNum).grade : null;

                        return (
                          <td
                            key={subj.code}
                            onClick={() => {
                              commitCellEdit();
                              setFocusedCell({ studentId: student.id, subjectCode: subj.code });
                            }}
                            className={`border-r border-[#DDD6C7] p-0 text-center relative select-none cursor-pointer ${
                              isFocused ? 'ring-2 ring-[#C2410C] z-10 bg-[#FFFDF8]' : ''
                            }`}
                          >
                            {isFocused ? (
                              <input
                                ref={gridInputRef}
                                type="text"
                                inputMode="numeric"
                                value={editingValue}
                                onChange={handleInputChange}
                                onKeyDown={handleGridKeyDown}
                                onBlur={handleCellBlur}
                                className="w-full h-full text-center font-tabular-sm text-xs font-semibold bg-transparent border-none outline-none p-0 text-[#111111]"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center gap-1 px-1 py-1">
                                <span
                                  className={`font-tabular-sm text-xs ${
                                    isAbsent
                                      ? 'text-red-700 font-bold'
                                      : cellVal === null || cellVal === undefined
                                      ? 'text-[#9A958A]'
                                      : 'text-[#111111] font-medium'
                                  }`}
                                >
                                  {isAbsent ? 'ABS' : cellVal === null || cellVal === undefined ? '—' : cellVal}
                                </span>
                                {grade && <GradeChip grade={grade} size="sm" />}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="border-r border-[#DDD6C7] px-2 py-1 text-center font-tabular-sm text-xs font-medium text-[#111111] bg-[#FEF9EF]/50">
                        {calc ? calc.average.toFixed(1) : '—'}
                      </td>
                      <td className="border-r border-[#DDD6C7] px-2 py-1 text-center font-tabular-sm text-xs font-semibold text-[#111111] bg-[#FEF9EF]/50">
                        {calc ? calc.aggregate : '—'}
                      </td>
                      <td className="px-2 py-1 text-center bg-[#FEF9EF]/50">
                        {calc ? <GradeChip grade={calc.meanGrade} size="sm" /> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer: Subject Averages */}
              <tfoot>
                <tr className="h-10 bg-[#FEF9EF] border-t-2 border-[#111111] sticky bottom-0 z-30 font-semibold text-xs">
                  <td className="sticky left-0 z-30 bg-[#FEF9EF] border-r border-[#DDD6C7] px-3 py-2 font-label-caps text-[#111111] uppercase tracking-wider">
                    SUBJECT MEANS ({students.length})
                  </td>
                  {subjectAverages.map((avg, idx) => (
                    <td
                      key={subjects[idx].code}
                      className="border-r border-[#DDD6C7] px-2 py-2 text-center font-tabular-sm text-[#111111]"
                    >
                      {avg}
                    </td>
                  ))}
                  <td className="border-r border-[#DDD6C7] px-2 py-2 text-center font-tabular-sm text-[#C2410C]">
                    {rankings.length > 0
                      ? (rankings.reduce((a, b) => a + b.average, 0) / rankings.length).toFixed(1)
                      : '—'}
                  </td>
                  <td className="border-r border-[#DDD6C7] px-2 py-2 text-center font-tabular-sm text-[#111111]">
                    {rankings.length > 0
                      ? (rankings.reduce((a, b) => a + b.aggregate, 0) / rankings.length).toFixed(1)
                      : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-label-caps text-[#111111]">KCSE</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Paste from Excel / Sheets Modal */}
      {isPastingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded p-5 max-w-2xl w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDD6C7]">
              <div>
                <h3 className="font-headline-md text-headline-md text-[#111111]">
                  Paste Rectangular Marks Matrix
                </h3>
                <p className="text-xs text-[#5F5E5E]">
                  Starting at focused cell:{' '}
                  <strong>
                    {focusedCell
                      ? `${students.find((s) => s.id === focusedCell.studentId)?.name} (${focusedCell.subjectCode})`
                      : 'First cell'}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setIsPastingModalOpen(false)}
                type="button"
                className="text-[#5F5E5E] hover:text-[#111111] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste tab-delimited or comma-delimited columns copied from Excel / Google Sheets here..."
              rows={6}
              className="w-full p-3 font-tabular-sm text-xs bg-white border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
            />

            {/* Paste Preview & Cell Verification */}
            {parsedPasteGrid && (
              <div className="mt-3 p-3 bg-[#FBF8F1] border border-[#DDD6C7] rounded text-xs space-y-2">
                <div className="flex items-center justify-between font-medium">
                  <span>
                    Detected {parsedPasteGrid.totalCells} cells (
                    <strong className="text-emerald-700">{parsedPasteGrid.validUpdates.length} valid</strong>,{' '}
                    <strong className="text-amber-700">{parsedPasteGrid.invalidCount} invalid</strong>)
                  </span>
                </div>
                <div className="text-[11px] text-[#5F5E5E] font-tabular-sm">
                  {parsedPasteGrid.sampleRows.map((sample, idx) => (
                    <span key={idx} className="mr-3 inline-block">
                      {sample.studentName.split(' ')[0]} ({sample.subjectCode}):{' '}
                      <strong>{String(sample.parsed)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DDD6C7] mt-4">
              <button
                onClick={() => setIsPastingModalOpen(false)}
                type="button"
                className="px-4 py-2 border border-[#DDD6C7] rounded bg-transparent hover:bg-[#F2EDE3] font-medium text-xs min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPaste}
                disabled={!parsedPasteGrid || parsedPasteGrid.validUpdates.length === 0}
                type="button"
                className="px-4 py-2 bg-[#C2410C] text-[#FEF9EF] rounded font-medium text-xs hover:opacity-90 disabled:opacity-40 min-h-[44px] cursor-pointer"
              >
                Apply {parsedPasteGrid?.validUpdates.length || 0} Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
