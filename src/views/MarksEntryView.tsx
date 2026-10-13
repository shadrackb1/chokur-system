import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { MarkValue } from '../types';
import { getGradeFromScore } from '../utils/grading';

export const MarksEntryView: React.FC = () => {
  const {
    students,
    subjects,
    marks,
    updateMark,
    batchUpdateMarks,
    rankings,
    activeStream,
    activeExam,
  } = useGrading();

  const [focusedCell, setFocusedCell] = useState<{ studentId: string; subjectCode: string } | null>({
    studentId: 's-3',
    subjectCode: 'CHE',
  });
  const [editingValue, setEditingValue] = useState<string>('');
  const [isPastingModalOpen, setIsPastingModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editing value when focused cell changes
  useEffect(() => {
    if (focusedCell) {
      const current = marks[focusedCell.studentId]?.[focusedCell.subjectCode];
      setEditingValue(current === null || current === undefined ? '' : String(current));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [focusedCell]);

  // Handle cell navigation
  const navigateCell = (deltaRow: number, deltaCol: number) => {
    if (!focusedCell) return;
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

    setFocusedCell({
      studentId: students[nextStudentIdx].id,
      subjectCode: subjects[nextSubjectIdx].code,
    });
  };

  const handleCommitValue = (valStr: string) => {
    if (!focusedCell) return;
    const trimmed = valStr.trim().toUpperCase();
    if (trimmed === 'ABS' || trimmed === 'A') {
      updateMark(focusedCell.studentId, focusedCell.subjectCode, 'ABS');
    } else if (trimmed === '') {
      updateMark(focusedCell.studentId, focusedCell.subjectCode, null);
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        const clamped = Math.max(0, Math.min(100, num));
        updateMark(focusedCell.studentId, focusedCell.subjectCode, clamped);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitValue(editingValue);
      navigateCell(0, e.shiftKey ? -1 : 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitValue(editingValue);
      navigateCell(1, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleCommitValue(editingValue);
      navigateCell(-1, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleCommitValue(editingValue);
      navigateCell(1, 0);
    } else if (e.key === 'ArrowLeft' && inputRef.current?.selectionStart === 0) {
      handleCommitValue(editingValue);
      navigateCell(0, -1);
    } else if (
      e.key === 'ArrowRight' &&
      inputRef.current?.selectionEnd === editingValue.length
    ) {
      handleCommitValue(editingValue);
      navigateCell(0, 1);
    } else if (e.key === 'Escape') {
      setFocusedCell(null);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSaveAll();
    }
  };

  const handleSaveAll = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Process Excel paste
  const handleProcessExcelPaste = () => {
    if (!pastedText.trim()) {
      setIsPastingModalOpen(false);
      return;
    }

    const lines = pastedText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }> = [];

    lines.forEach((line, rowIdx) => {
      if (rowIdx >= students.length) return;
      const targetStudent = students[rowIdx];
      const cells = line.split('\t');

      cells.forEach((cellVal, colIdx) => {
        if (colIdx >= subjects.length) return;
        const targetSubject = subjects[colIdx];
        const trimmed = cellVal.trim().toUpperCase();

        if (trimmed === 'ABS' || trimmed === 'A') {
          updates.push({ studentId: targetStudent.id, subjectCode: targetSubject.code, value: 'ABS' });
        } else {
          const num = parseInt(trimmed, 10);
          if (!isNaN(num)) {
            updates.push({
              studentId: targetStudent.id,
              subjectCode: targetSubject.code,
              value: Math.max(0, Math.min(100, num)),
            });
          }
        }
      });
    });

    if (updates.length > 0) {
      batchUpdateMarks(updates);
    }
    setIsPastingModalOpen(false);
    setPastedText('');
    handleSaveAll();
  };

  // Fast map from student ID to StudentCalculation for summary columns
  const rankingMap = useMemo(() => {
    const map = new Map<string, (typeof rankings)[0]>();
    rankings.forEach((r) => map.set(r.student.id, r));
    return map;
  }, [rankings]);

  // Calculate subject averages for footer row
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

  // Overall class averages for footer
  const classAvg = useMemo(() => {
    if (rankings.length === 0) return '0.0';
    const sum = rankings.reduce((acc, curr) => acc + curr.average, 0);
    return (sum / rankings.length).toFixed(1);
  }, [rankings]);

  const classAgg = useMemo(() => {
    if (rankings.length === 0) return '0.0';
    const sum = rankings.reduce((acc, curr) => acc + curr.aggregate, 0);
    return (sum / rankings.length).toFixed(1);
  }, [rankings]);

  return (
    <div className="p-6 max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
      {/* Header Section */}
      <section className="mb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-1">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Marks Entry</h1>
          <p className="font-body-sm text-body-sm text-[#5F5E5E]">
            {activeStream} · {activeExam} · type marks, grades update live
          </p>
        </div>
        {saveToast && (
          <div className="bg-[#111111] text-[#FEF9EF] px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>All records synchronized and saved locally</span>
          </div>
        )}
      </section>

      {/* Above-Grid Control Ribbon (Monochrome Legend & Actions) */}
      <div className="py-2.5 mb-3 border-y border-[#DDD6C7] flex flex-wrap items-center justify-between gap-3 bg-[#FBF8F1] px-3 rounded">
        {/* Grade-style Monochrome Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-caption text-[#5F5E5E]">
          <span className="font-label-caps text-label-caps text-[#111111] uppercase tracking-wider text-[10px]">
            KCSE SCALES:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 bg-[#111111] text-[#FBF8F1] font-tabular-sm text-[10px] rounded-[2px] leading-4">
              A
            </span>
            <span className="text-[#111111]">Solid: Honors (A–B+)</span>
          </div>
          <span className="text-[#DDD6C7]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-[#111111] text-[#111111] font-tabular-sm text-[10px] rounded-[2px] leading-4 bg-transparent">
              B
            </span>
            <span className="text-[#111111]">Outline: Competent (B–C+)</span>
          </div>
          <span className="text-[#DDD6C7]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-[#5C5850] text-[#5C5850] font-tabular-sm text-[10px] rounded-[2px] leading-4 bg-transparent">
              C
            </span>
            <span>Grey outline: Marginal (C–D+)</span>
          </div>
          <span className="text-[#DDD6C7]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-dashed border-[#9A958A] text-[#9A958A] font-tabular-sm text-[10px] rounded-[2px] leading-4 bg-transparent">
              E
            </span>
            <span>Dashed: Critical (D–E)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPastingModalOpen(true)}
            type="button"
            className="px-3 py-1.5 text-body-sm text-[13px] font-medium text-[#111111] border border-[#111111] rounded bg-transparent hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">content_paste</span>
            <span>Paste from Excel</span>
          </button>
          <button
            onClick={handleSaveAll}
            type="button"
            className="px-4 py-1.5 text-body-sm text-[13px] font-medium text-[#FEF9EF] bg-[#C2410C] rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save all</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET-STYLE GRID */}
      <div className="flex-1 border border-[#DDD6C7] bg-[#FBF8F1] overflow-hidden flex flex-col">
        <div className="overflow-x-auto hide-scrollbar flex-1 relative max-h-[620px]">
          <table className="w-full border-collapse text-left border-spacing-0">
            {/* Table Header */}
            <thead>
              <tr className="h-10 bg-[#FEF9EF] border-b border-[#DDD6C7] sticky top-0 z-30">
                {/* Sticky Left Student Column Header */}
                <th
                  className="sticky left-0 z-30 bg-[#FEF9EF] border-r border-[#DDD6C7] px-3 py-2 w-64 min-w-[240px]"
                  scope="col"
                >
                  <div className="flex items-center justify-between font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-[11px]">
                    <span>ADM / STUDENT NAME</span>
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>

                {/* Sticky Subject Columns */}
                {subjects.map((subj) => (
                  <th
                    key={subj.code}
                    className="border-r border-[#DDD6C7] px-2 py-2 text-center w-20 min-w-[76px] font-label-caps text-label-caps text-[#5F5E5E]"
                    scope="col"
                  >
                    {subj.code}
                  </th>
                ))}

                {/* Right Summary Columns */}
                <th
                  className="border-l-2 border-[#DDD6C7] border-r border-[#DDD6C7] px-2 py-2 text-center w-16 min-w-[64px] font-label-caps text-label-caps text-[#5F5E5E] bg-[#F8F3E9]"
                  scope="col"
                >
                  AVG
                </th>
                <th
                  className="border-r border-[#DDD6C7] px-2 py-2 text-center w-20 min-w-[72px] font-label-caps text-label-caps text-[#5F5E5E] bg-[#F8F3E9]"
                  scope="col"
                >
                  AGG <span className="text-[9px] font-normal tracking-normal lowercase">(/84)</span>
                </th>
                <th
                  className="px-2 py-2 text-center w-16 min-w-[60px] font-label-caps text-label-caps text-[#5F5E5E] bg-[#F8F3E9]"
                  scope="col"
                >
                  GRADE
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DDD6C7] font-tabular-sm text-tabular-sm text-[#111111]">
              {students.map((student) => {
                const calc = rankingMap.get(student.id);

                return (
                  <tr key={student.id} className="h-[44px] hover:bg-[#F2EDE3] transition-colors">
                    {/* Sticky Left Column: Student */}
                    <td className="sticky left-0 z-10 bg-[#FBF8F1] border-r border-[#DDD6C7] px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[#9A958A] font-tabular-sm text-[12px] w-12 tracking-tight">
                          {student.admNo}
                        </span>
                        <span className="font-body-md text-body-md text-[#111111] font-medium">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* Subject Score Cells */}
                    {subjects.map((subj) => {
                      const isFocused =
                        focusedCell?.studentId === student.id &&
                        focusedCell?.subjectCode === subj.code;
                      const rawVal = marks[student.id]?.[subj.code];
                      const isAbsent = rawVal === 'ABS';
                      const numVal = typeof rawVal === 'number' ? rawVal : null;
                      const gradeRes = isAbsent ? null : getGradeFromScore(rawVal);

                      if (isFocused) {
                        return (
                          <td
                            key={subj.code}
                            className="border-r border-[#DDD6C7] p-0 text-right bg-white relative z-20"
                          >
                            <div className="w-full h-[43px] border-b-2 border-[#C2410C] px-1 flex items-center justify-end gap-1">
                              <input
                                ref={inputRef}
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => handleCommitValue(editingValue)}
                                className="w-12 text-right font-medium text-[#111111] text-[13px] bg-transparent outline-none border-none p-0 focus:ring-0"
                                maxLength={3}
                              />
                              <span className="w-[1.5px] h-3.5 bg-[#C2410C] inline-block caret-blink"></span>
                              {editingValue && !isNaN(parseInt(editingValue, 10)) && (
                                <GradeChip
                                  grade={getGradeFromScore(parseInt(editingValue, 10)).grade}
                                  className="ml-0.5"
                                />
                              )}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={subj.code}
                          onClick={() =>
                            setFocusedCell({ studentId: student.id, subjectCode: subj.code })
                          }
                          className={`border-r border-[#DDD6C7] px-2 text-right cursor-pointer select-none transition-colors ${
                            isAbsent
                              ? 'bg-[#F2EDE3]'
                              : numVal !== null && numVal < 30
                              ? 'bg-[#FBF8F1]'
                              : 'hover:bg-[#EDE8DE]'
                          }`}
                        >
                          {isAbsent ? (
                            <span className="text-[#5F5E5E] font-tabular-sm font-semibold tracking-wider text-[11px] block text-center">
                              ABS
                            </span>
                          ) : numVal !== null ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span
                                className={`font-tabular-sm ${
                                  numVal >= 80 ? 'font-medium' : numVal < 35 ? 'text-[#9A958A]' : ''
                                }`}
                              >
                                {numVal}
                              </span>
                              {gradeRes && <GradeChip grade={gradeRes.grade} />}
                            </div>
                          ) : (
                            <span className="text-[#DDD6C7]">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Right Summaries */}
                    <td className="border-l-2 border-[#DDD6C7] border-r border-[#DDD6C7] px-2 text-right font-medium bg-[#F8F3E9]">
                      {calc ? calc.average.toFixed(1) : '—'}
                    </td>
                    <td className="border-r border-[#DDD6C7] px-2 text-right font-medium bg-[#F8F3E9]">
                      {calc ? calc.aggregate : '—'}
                    </td>
                    <td className="px-2 text-center bg-[#F8F3E9]">
                      {calc ? <GradeChip grade={calc.meanGrade} /> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Subject Averages */}
            <tfoot>
              <tr className="h-11 bg-[#F2EDE3] border-t-2 border-[#DDD6C7] font-tabular-sm text-tabular-sm font-semibold text-[#111111] sticky bottom-0 z-20">
                <td className="sticky left-0 z-20 bg-[#F2EDE3] border-r border-[#DDD6C7] px-3 py-2 text-left uppercase text-[11px] font-label-caps tracking-wider text-[#5C5850]">
                  Subject average
                </td>
                {subjectAverages.map((avg, idx) => (
                  <td key={subjects[idx].code} className="border-r border-[#DDD6C7] px-2 text-right font-semibold">
                    {avg}
                  </td>
                ))}
                {/* Class Grand Summary */}
                <td className="border-l-2 border-[#DDD6C7] border-r border-[#DDD6C7] px-2 text-right font-semibold text-[#C2410C]">
                  {classAvg}
                </td>
                <td className="border-r border-[#DDD6C7] px-2 text-right font-semibold">
                  {classAgg}
                </td>
                <td className="px-2 text-center">
                  <GradeChip grade={rankings[0]?.meanGrade || 'B-'} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* BELOW THE GRID: KEYBOARD SHORTCUTS HINTS */}
      <footer className="mt-3 pt-2 border-t border-[#DDD6C7] flex flex-wrap items-center justify-between text-caption font-caption text-[#5F5E5E]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
          <span className="text-[#5C5850]">
            Ledger synchronized · {students.length}/{students.length} student records active
          </span>
        </div>
        <div className="text-[#9A958A] tracking-tight text-[12px] font-caption">
          Tab next cell · Enter down · A for absent · Ctrl+S save
        </div>
      </footer>

      {/* Paste from Excel Modal */}
      {isPastingModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-xl w-full p-6 shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-[#DDD6C7] pb-3">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Paste Marks from Spreadsheet</h3>
              <button
                onClick={() => setIsPastingModalOpen(false)}
                className="text-[#5F5E5E] hover:text-[#111111] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-[#5F5E5E] mb-3">
              Copy a grid of numbers from Excel or Google Sheets (columns corresponding to{' '}
              <span className="font-medium text-[#111111]">
                MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST
              </span>
              ) and paste below.
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste tab-delimited cells here..."
              rows={8}
              className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded p-3 font-tabular-sm text-xs text-[#111111] focus:border-[#C2410C] focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setIsPastingModalOpen(false)}
                type="button"
                className="px-4 py-2 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessExcelPaste}
                type="button"
                className="px-4 py-2 text-sm font-medium bg-[#C2410C] text-[#FEF9EF] rounded hover:opacity-90 transition-opacity cursor-pointer"
              >
                Apply Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
