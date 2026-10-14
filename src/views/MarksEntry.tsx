import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ClipboardEvent, type FocusEvent } from 'react';
import { useAppStore } from '../lib/store';
import { parseMarkValue } from '../lib/kcse';

export function MarksEntry() {
  const { activeClassId, activeExamId, subjects, students, marks, filteredStudents, updateMark, batchUpdateMarks, importMarksFromCSV } = useAppStore();
  const [cellFocus, setCellFocus] = useState<{ studentId: string; subjectCode: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ studentId: string; subjectCode: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">edit_note</span>
          <h2 className="text-h2 text-primary mb-2">Marks Entry</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to enter marks.</p>
        </div>
      </div>
    );
  }

  const examMarks = marks[activeExamId] || {};
  const subjectCodes = subjects.map(s => s.code);

  const handleKeyDown = useCallback((e: KeyboardEvent, studentId: string, subjectCode: string, idx: number) => {
    const studentIdx = filteredStudents.findIndex(s => s.id === studentId);
    if (studentIdx === -1) return;

    let newStudentIdx = studentIdx;
    let newSubjectIdx = subjectCodes.indexOf(subjectCode);

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          setEditingCell(null);
          if (newSubjectIdx < subjectCodes.length - 1) {
            newSubjectIdx++;
          } else if (newStudentIdx < filteredStudents.length - 1) {
            newStudentIdx++;
            newSubjectIdx = 0;
          }
        } else {
          setEditingCell({ studentId, subjectCode });
          setEditValue(String(examMarks[studentId]?.[subjectCode] || ''));
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (newSubjectIdx > 0) newSubjectIdx--;
          else if (newStudentIdx > 0) { newStudentIdx--; newSubjectIdx = subjectCodes.length - 1; }
        } else {
          if (newSubjectIdx < subjectCodes.length - 1) newSubjectIdx++;
          else if (newStudentIdx < filteredStudents.length - 1) { newStudentIdx++; newSubjectIdx = 0; }
        }
        setEditingCell(null);
        setCellFocus({ studentId: filteredStudents[newStudentIdx].id, subjectCode: subjectCodes[newSubjectIdx] });
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (newStudentIdx < filteredStudents.length - 1) newStudentIdx++;
        setEditingCell(null);
        setCellFocus({ studentId: filteredStudents[newStudentIdx].id, subjectCode: subjectCodes[newSubjectIdx] });
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (newStudentIdx > 0) newStudentIdx--;
        setEditingCell(null);
        setCellFocus({ studentId: filteredStudents[newStudentIdx].id, subjectCode: subjectCodes[newSubjectIdx] });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (newSubjectIdx > 0) newSubjectIdx--;
        setEditingCell(null);
        setCellFocus({ studentId: filteredStudents[newStudentIdx].id, subjectCode: subjectCodes[newSubjectIdx] });
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (newSubjectIdx < subjectCodes.length - 1) newSubjectIdx++;
        setEditingCell(null);
        setCellFocus({ studentId: filteredStudents[newStudentIdx].id, subjectCode: subjectCodes[newSubjectIdx] });
        break;
      case 'Escape':
        setEditingCell(null);
        break;
    }

    if (cellFocus) {
      const target = gridRef.current?.querySelector(`[data-student-id="${filteredStudents[newStudentIdx].id}"][data-subject="${subjectCodes[newSubjectIdx]}"]`) as HTMLElement;
      target?.focus();
    }
  }, [activeExamId, filteredStudents, subjectCodes, editingCell, examMarks, cellFocus]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const rows = text.trim().split('\n').map(r => r.split('\t'));
    if (rows.length === 0) return;

    const updates: Array<{ studentId: string; subjectCode: string; value: number | 'ABS' | null }> = [];
    const startStudentIdx = filteredStudents.findIndex(s => s.id === cellFocus?.studentId);
    const startSubjectIdx = subjectCodes.indexOf(cellFocus?.subjectCode || '');

    for (let r = 0; r < rows.length; r++) {
      const studentIdx = startStudentIdx + r;
      if (studentIdx >= filteredStudents.length) break;
      const studentId = filteredStudents[studentIdx].id;
      for (let c = 0; c < rows[r].length; c++) {
        const subjectIdx = startSubjectIdx + c;
        if (subjectIdx >= subjectCodes.length) break;
        const subjectCode = subjectCodes[subjectIdx];
        const val = rows[r][c]?.trim();
        if (val === '') continue;
        const parsed = parseMark(val);
        if (parsed !== null) {
          updates.push({ studentId, subjectCode, value: parsed });
        }
      }
    }

    if (updates.length > 0) {
      await batchUpdateMarks(activeExamId, updates);
    }
  }, [activeExamId, filteredStudents, subjectCodes, cellFocus, batchUpdateMarks]);

  const parseMark = (val: string): number | 'ABS' | null => {
    const trimmed = val.trim().toUpperCase();
    if (trimmed === 'ABS') return 'ABS';
    const num = parseFloat(trimmed);
    if (isNaN(num)) return null;
    return Math.max(0, Math.min(100, num));
  };

  const handleImport = async () => {
    if (!importFile) return;
    const text = await importFile.text();
    const result = await importMarksFromCSV(activeExamId, text);
    setImportResult(result);
    setShowImportModal(false);
    setImportFile(null);
  };

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-primary">Marks Entry</h2>
            <p className="text-body text-secondary">Enter and edit marks for {filteredStudents.length} students</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring flex items-center gap-2"
          >
            <span className="material-symbols-outlined">upload_file</span>
            Import CSV
          </button>
        </div>

        <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div ref={gridRef} className="min-w-max" role="grid" onPaste={handlePaste}>
              <table className="w-full border-collapse">
                <thead className="bg-surface-container sticky top-0 z-10">
                  <tr>
                    <th className="w-12 text-center text-label text-tertiary sticky left-0 bg-surface-container border-r border-hairline z-20">#</th>
                    <th className="w-48 sticky left-12 bg-surface-container border-r border-hairline z-20">
                      <div className="p-2 text-left text-label text-tertiary">Student</div>
                    </th>
                    {subjects.map((subject, idx) => (
                      <th key={subject.code} className="w-20 text-center sticky" style={{ left: `${48 + 12 + idx * 80}px` }}>
                        <div className="p-2 text-label text-tertiary writing-mode-vertical-lr text-center h-24 flex items-end justify-center">
                          <span className="writing-mode-horizontal-tb">{subject.code}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, rowIdx) => (
                    <tr key={student.id} className={rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                      <td className="w-12 text-center text-tabular-sm text-tertiary sticky left-0 bg-surface-panel border-r border-hairline z-10">{rowIdx + 1}</td>
                      <td className="w-48 sticky left-12 bg-surface-panel border-r border-hairline z-10 p-2">
                        <p className="text-body font-medium text-primary truncate">{student.name}</p>
                        <p className="text-caption text-tertiary truncate">{student.admNo}</p>
                      </td>
                      {subjectCodes.map((code, colIdx) => (
                        <td key={code} className="w-20 p-1" style={{ minWidth: '80px' }}>
                          <MarkCell
                            student={student}
                            subjectCode={code}
                            value={examMarks[student.id]?.[code]}
                            isEditing={editingCell?.studentId === student.id && editingCell?.subjectCode === code}
                            editValue={editValue}
                            setEditValue={setEditValue}
                            onFocus={() => setCellFocus({ studentId: student.id, subjectCode: code })}
                            onDoubleClick={() => {
                              setEditingCell({ studentId: student.id, subjectCode: code });
                              setEditValue(String(examMarks[student.id]?.[code] || ''));
                            }}
                            onKeyDown={e => handleKeyDown(e, student.id, code, colIdx)}
                            onSave={val => updateMark(activeExamId, student.id, code, val)}
                            onCancel={() => setEditingCell(null)}
                            onBlur={e => {
                              const related = e.relatedTarget as HTMLElement | null;
                              const current = e.currentTarget as HTMLElement;
                              if (current && related && !current.contains(related)) {
                                setEditingCell(null);
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {importResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <p className="font-medium">Import complete: {importResult.success} records updated</p>
            {importResult.errors.length > 0 && (
              <ul className="mt-2 text-sm space-y-1">
                {importResult.errors.slice(0, 5).map((err, i) => <li key={i}>• {err}</li>)}
                {importResult.errors.length > 5 && <li>... and {importResult.errors.length - 5} more</li>}
              </ul>
            )}
          </div>
        )}

      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-panel border border-hairline rounded-lg p-6 max-w-md w-full">
            <h3 className="text-h3 text-primary mb-4">Import Marks CSV</h3>
            <input
              type="file"
              accept=".csv"
              onChange={e => setImportFile(e.target.files?.[0] || null)}
              className="w-full mb-4 px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring"
            />
            <p className="text-caption text-tertiary mb-4">CSV must have AdmNo column and subject code columns (MAT, ENG, KIS, etc.)</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base">Cancel</button>
              <button onClick={handleImport} disabled={!importFile} className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base disabled:opacity-50">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkCell({
  student,
  subjectCode,
  value,
  isEditing,
  editValue,
  setEditValue,
  onFocus,
  onDoubleClick,
  onKeyDown,
  onSave,
  onCancel,
  onBlur,
}: {
  student: { id: string; name: string; admNo: string };
  subjectCode: string;
  value: number | 'ABS' | null | undefined;
  isEditing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  onFocus: () => void;
  onDoubleClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onSave: (val: number | 'ABS' | null) => void;
  onCancel: () => void;
  onBlur: (e: FocusEvent) => void;
}) {
  const displayValue = value === 'ABS' ? 'ABS' : value !== null && value !== undefined ? String(value) : '';
  const inputRef = useRef<HTMLInputElement>(null);

  if (isEditing) {
    useEffect(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, []);

    const handleSave = () => {
      if (inputRef.current) {
        const val = parseInput(inputRef.current.value);
        onSave(val);
        onCancel();
      }
    };

    return (
      <div className="relative" onFocusCapture={onFocus} tabIndex={0} onBlur={onBlur} onKeyDown={onKeyDown}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => handleSave()}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave();
            else if (e.key === 'Escape') onCancel();
          }}
          className="w-full px-2 py-1 text-body text-center bg-white border-2 border-brand rounded-sm focus-ring outline-none"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      data-student-id={student.id}
      data-subject={subjectCode}
      onFocus={onFocus}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className={`w-full h-full p-1 ${value === 'ABS' ? 'bg-amber-50' : ''}`}
      onBlur={onBlur}
    >
      <div className={`w-full h-full flex items-center justify-center text-body tabular-nums font-medium ${
        value === 'ABS' ? 'text-amber-700' :
        value !== null && value !== undefined ? (value >= 55 ? 'text-emerald-700' : 'text-red-700') :
        'text-tertiary'
      }`}>
        {displayValue}
      </div>
    </div>
  );
}

function parseInput(val: string): number | 'ABS' | null {
  const trimmed = val.trim().toUpperCase();
  if (trimmed === 'ABS') return 'ABS';
  if (trimmed === '') return null;
  const num = parseFloat(trimmed);
  if (isNaN(num)) return null;
  return Math.max(0, Math.min(100, num));
}