import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { MarkValue } from '../types';
import { getGradeFromScore } from '../utils/grading';
import { useToast } from '../components/Toast';
import { toastHelpers } from '../components/Toast';
import { TableSkeleton } from '../components/Skeletons';
import { EmptyStates } from '../components/EmptyState';

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
    activeExamId,
    setActiveView,
  } = useGrading();

  const { addToast } = useToast();

  const [focusedCell, setFocusedCell] = useState<{ studentId: string; subjectCode: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isPastingModalOpen, setIsPastingModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editing value when focused cell changes
  useEffect(() => {
    if (focusedCell && activeExamId) {
      const current = marks[focusedCell.studentId]?.[focusedCell.subjectCode];
      setEditingValue(current === null || current === undefined ? '' : String(current));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [focusedCell, activeExamId, marks]);

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
    if (!focusedCell || !activeExamId) return;
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
    setIsDirty(true);
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
    setIsDirty(false);
    addToast(toastHelpers.saved(rankings.length, 'marks'));
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Process Excel paste
  const handleProcessExcelPaste = () => {
    if (!activeExamId || !pastedText.trim()) {
      setIsPastingModalOpen(false);
      return;
    }

    const lines = pastedText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }> = [];
    let invalidCells = 0;

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
          } else if (trimmed !== '') {
            invalidCells++;
          }
        }
      });
    });

    if (updates.length > 0) {
      batchUpdateMarks(updates);
      addToast(toastHelpers.saved(updates.length, 'marks'));
    }
    if (invalidCells > 0) {
      addToast(toastHelpers.warning('Some cells skipped', `${invalidCells} invalid cells were ignored`));
    }
    setIsPastingModalOpen(false);
    setPastedText('');
    setIsDirty(true);
  };

  // Fast map from student ID to StudentCalculation for summary columns
  const rankingMap = useMemo(() => {
    const map = new Map<string, (typeof rankings)[0]>();
    rankings.forEach((r) => map.set(r.student.id, r));
    return map;
  }, [rankings]);

  // Calculate subject averages for footer row
  const subjectAverages = useMemo(() => {
    if (!activeExamId) return subjects.map(() => '—');
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
  }, [subjects, students, marks, activeExamId]);

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

  // Loading state
  if (!activeExamId) {
    return (
      <div className="p-6 max-w-[var(--content-max-width-wide)] w-full mx-auto flex-1 flex flex-col">
        {EmptyStates.noMarks(() => {})}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[var(--content-max-width-wide)] w-full mx-auto flex-1 flex flex-col">
      {/* Header Section */}
      <section className="mb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-1">
        <div>
          <h1 className="text-h1 text-primary tracking-tight">Marks Entry</h1>
          <p className="text-body-sm text-secondary">
            {activeStream} · {activeExam} · type marks, grades update live
          </p>
        </div>
        {saveToast && (
          <div className="bg-primary text-inverse px-3 py-1 rounded-sm text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>All records synchronized and saved locally</span>
          </div>
        )}
      </section>

      {/* Above-Grid Control Ribbon (Monochrome Legend & Actions) */}
      <div className="py-2.5 mb-3 border-y border-hairline flex flex-wrap items-center justify-between gap-3 bg-surface-panel px-3 rounded-sm">
        {/* Grade-style Monochrome Legend */}
        <div className="flex flex-wrap items-center gap-3 text-caption text-secondary">
          <span className="text-label text-primary uppercase tracking-wider text-tabular-xs">
            KCSE SCALES:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 bg-tier-honors-bg text-tier-honors-text font-mono font-semibold text-tabular-xs rounded-xs leading-4">
              A
            </span>
            <span className="text-primary">Solid: Honors (A–B+)</span>
          </div>
          <span className="text-hairline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-tier-competent text-tier-competent font-mono font-semibold text-tabular-xs rounded-xs leading-4 bg-transparent">
              B
            </span>
            <span className="text-primary">Outline: Competent (B–C+)</span>
          </div>
          <span className="text-hairline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-tier-marginal text-tier-marginal font-mono font-medium text-tabular-xs rounded-xs leading-4 bg-transparent">
              C
            </span>
            <span>Grey outline: Marginal (C–D+)</span>
          </div>
          <span className="text-hairline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 border border-dashed border-tier-critical text-tier-critical font-mono font-medium text-tabular-xs rounded-xs leading-4 bg-transparent">
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
            className="px-3 py-1.5 text-body-sm font-medium text-primary border border-primary rounded-sm bg-transparent hover:bg-surface-container-high transition-base flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[16px]">content_paste</span>
            <span>Paste from Excel</span>
          </button>
          <button
            onClick={handleSaveAll}
            type="button"
            className="px-4 py-1.5 text-body-sm font-medium text-inverse bg-brand rounded-sm hover:bg-brand-hover transition-base flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save all</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET-STYLE GRID */}
      <div className="flex-1 border border-hairline bg-surface-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto hide-scrollbar flex-1 relative max-h-[620px]">
          <table className="w-full border-collapse text-left border-spacing-0">
            {/* Table Header */}
            <thead>
              <tr className="h-12 bg-surface-panel border-b border-hairline sticky top-0 z-30">
                {/* Sticky Left Student Column Header */}
                <th
                  className="sticky left-0 z-30 bg-surface-panel border-r border-hairline px-3 py-2 w-64 min-w-[240px]"
                  scope="col"
                >
                  <div className="flex items-center justify-between text-label text-secondary uppercase tracking-wider">
                    <span>ADM / STUDENT NAME</span>
                    <span className="material-symbols-outlined text-[14px] text-tertiary">unfold_more</span>
                  </div>
                </th>

                {/* Sticky Subject Columns */}
                {subjects.map((subj) => (
                  <th
                    key={subj.code}
                    className="border-r border-hairline px-2 py-2 text-center w-20 min-w-[76px] text-label text-secondary"
                    scope="col"
                  >
                    {subj.code}
                  </th>
                ))}

                {/* Right Summary Columns */}
                <th
                  className="border-l-2 border-hairline border-r border-hairline px-2 py-2 text-center w-16 min-w-[64px] text-label text-secondary bg-surface-dim"
                  scope="col"
                >
                  AVG
                </th>
                <th
                  className="border-r border-hairline px-2 py-2 text-center w-20 min-w-[72px] text-label text-secondary bg-surface-dim"
                  scope="col"
                >
                  AGG <span className="text-tabular-xs font-normal tracking-normal lowercase">(/84)</span>
                </th>
                <th
                  className="px-2 py-2 text-center w-16 min-w-[60px] text-label text-secondary bg-surface-dim"
                  scope="col"
                >
                  GRADE
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-hairline text-tabular-sm text-primary">
              {students.map((student) => {
                const calc = rankingMap.get(student.id);

                return (
                  <tr key={student.id} className="h-11 hover:bg-surface-container-high transition-base">
                    {/* Sticky Left Column: Student */}
                    <td className="sticky left-0 z-10 bg-surface-panel border-r border-hairline px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="text-tertiary text-tabular-sm w-12 tracking-tight">
                          {student.admNo}
                        </span>
                        <span className="text-body text-primary font-medium">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    // Subject Score Cells
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
                            className="border-r border-hairline p-0 text-right bg-surface-bright relative z-20"
                          >
                            <div className="w-full h-[43px] border-b-2 border-brand px-1 flex items-center justify-end gap-1">
                              <input
                                ref={inputRef}
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => handleCommitValue(editingValue)}
                                className="w-12 text-right font-medium text-primary text-body-sm bg-transparent outline-none border-none p-0 focus:ring-0"
                                maxLength={3}
                              />
                              <span className="w-[1.5px] h-3.5 bg-brand inline-block caret-blink"></span>
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
                          className={`
                            border-r border-hairline px-2 text-right cursor-pointer select-none transition-base
                            ${
                              isAbsent
                                ? 'bg-surface-container-high'
                                : numVal !== null && numVal < 30
                                ? 'bg-surface-panel'
                                : 'hover:bg-surface-container-high'
                            }
                          `}
                        >
                          {isAbsent ? (
                            <span className="text-secondary font-mono font-semibold tracking-wider text-tabular-xs block text-center">
                              ABS
                            </span>
                          ) : numVal !== null ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span
                                className={`
                                  font-mono ${
                                    numVal >= 80 ? 'font-medium' : numVal < 35 ? 'text-tertiary' : ''
                                  }
                                `}
                              >
                                {numVal}
                              </span>
                              {gradeRes && <GradeChip grade={gradeRes.grade} />}
                            </div>
                          ) : (
                            <span className="text-tertiary">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Right Summaries */}
                    <td className="border-l-2 border-hairline border-r border-hairline px-2 text-right font-medium bg-surface-dim">
                      {calc ? calc.average.toFixed(1) : '—'}
                    </td>
                    <td className="border-r border-hairline px-2 text-right font-medium bg-surface-dim">
                      {calc ? calc.aggregate : '—'}
                    </td>
                    <td className="px-2 text-center bg-surface-dim">
                      {calc ? <GradeChip grade={calc.meanGrade} /> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Subject Averages */}
            <tfoot>
              <tr className="h-11 bg-surface-container-high border-t-2 border-hairline text-tabular-sm font-semibold text-primary sticky bottom-0 z-20">
                <td className="sticky left-0 z-20 bg-surface-container-high border-r border-hairline px-3 py-2 text-left uppercase text-tabular-xs text-label tracking-wider text-secondary">
                  Subject average
                </td>
                {subjectAverages.map((avg, idx) => (
                  <td key={subjects[idx].code} className="border-r border-hairline px-2 text-right font-semibold">
                    {avg}
                  </td>
                ))}
                {/* Class Grand Summary */}
                <td className="border-l-2 border-hairline border-r border-hairline px-2 text-right font-semibold text-brand">
                  {classAvg}
                </td>
                <td className="border-r border-hairline px-2 text-right font-semibold">
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
      <footer className="mt-3 pt-2 border-t border-hairline flex flex-wrap items-center justify-between text-caption text-secondary gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
          <span className="text-secondary-dark">
            Ledger synchronized · {students.length}/{students.length} student records active
          </span>
        </div>
        <div className="text-tertiary tracking-tight text-tabular-xs">
          Tab next cell · Enter down · A for absent · Ctrl+S save
        </div>
      </footer>

      {/* Paste from Excel Modal */}
      {isPastingModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-panel border border-hairline rounded-sm max-w-xl w-full p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-hairline pb-3">
              <h3 className="text-h3 text-primary">Paste Marks from Spreadsheet</h3>
              <button
                onClick={() => setIsPastingModalOpen(false)}
                className="text-secondary hover:text-primary text-lg font-bold cursor-pointer focus-ring"
              >
                ✕
              </button>
            </div>
            <p className="text-body-sm text-secondary mb-3">
              Copy a grid of numbers from Excel or Google Sheets (columns corresponding to{' '}
              <span className="font-medium text-primary">
                MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST
              </span>
              ) and paste below.
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste tab-separated values here..."
              className="w-full h-40 bg-surface-bright border border-hairline rounded-sm px-3 py-2 text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 mb-4 font-mono text-tabular-sm resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPastingModalOpen(false)}
                type="button"
                className="px-4 py-1.5 text-body-sm font-medium text-primary border border-hairline rounded-sm bg-transparent hover:bg-surface-container transition-base cursor-pointer focus-ring"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessExcelPaste}
                type="button"
                className="px-4 py-1.5 text-body-sm font-medium text-inverse bg-brand rounded-sm hover:bg-brand-hover transition-base cursor-pointer focus-ring"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};