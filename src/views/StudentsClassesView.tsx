import React, { useMemo, useState } from 'react';
import { useGrading } from '../context/GradingContext';
import { ClassStream, ExamPeriod, Student, Subject } from '../types';

export const StudentsClassesView: React.FC = () => {
  const {
    students,
    subjects,
    streams,
    exams,
    activeStream,
    setActiveStream,
    addStudent,
    updateStudent,
    removeStudent,
    bulkAddStudents,
    addSubject,
    updateSubject,
    removeSubject,
    addClassStream,
    updateClassStream,
    removeClassStream,
    addExamPeriod,
    updateExamPeriod,
    removeExamPeriod,
    activeSubTab,
    setActiveSubTab,
  } = useGrading();

  const currentTab = (activeSubTab as 'students' | 'classes' | 'subjects' | 'periods') || 'students';

  const [searchStudent, setSearchStudent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Student Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    admNo: '',
    name: '',
    stream: activeStream,
    gender: 'Female' as 'Male' | 'Female',
    kcpeMarks: 350,
  });
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // Student Delete Confirmation Modal
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Bulk CSV Import Modal
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvImportResult, setCsvImportResult] = useState<{
    parsed: Array<{ admNo: string; name: string; gender: 'Male' | 'Female'; kcpeMarks: number; isValid: boolean; error?: string }>;
    validCount: number;
    invalidCount: number;
  } | null>(null);

  // Class Stream Modals
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<ClassStream | null>(null);
  const [streamFormData, setStreamFormData] = useState({
    name: '',
    form: 'Form 4',
    stream: '',
    classTeacher: '',
  });
  const [deletingStream, setDeletingStream] = useState<ClassStream | null>(null);

  // Subject Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    code: '',
    name: '',
    department: 'Languages',
    teacher: '',
    lastExamMean: 50.0,
  });
  const [subjectFormError, setSubjectFormError] = useState<string | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Exam Period Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamPeriod | null>(null);
  const [examFormData, setExamFormData] = useState({
    name: '',
    term: 'Term 2',
    year: 2026,
    type: 'End-term' as 'Mid-term' | 'End-term' | 'Mock',
  });
  const [deletingExam, setDeletingExam] = useState<ExamPeriod | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesStream = s.stream === activeStream;
      if (!matchesStream) return false;
      if (!searchStudent.trim()) return true;
      const q = searchStudent.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q);
    });
  }, [students, activeStream, searchStudent]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  // STUDENT ACTIONS
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormError(null);
    setStudentFormData({
      admNo: String(4000 + students.length + 1),
      name: '',
      stream: activeStream,
      gender: 'Female',
      kcpeMarks: 340,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormError(null);
    setStudentFormData({
      admNo: student.admNo,
      name: student.name,
      stream: student.stream,
      gender: student.gender,
      kcpeMarks: student.kcpeMarks,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError(null);
    const adm = studentFormData.admNo.trim();
    const name = studentFormData.name.trim();

    if (!adm || !name) {
      setStudentFormError('Admission Number and Student Full Name are required.');
      return;
    }

    // Check duplicate admission numbers
    const duplicate = students.find(
      (s) => s.admNo.toLowerCase() === adm.toLowerCase() && (!editingStudent || s.id !== editingStudent.id)
    );
    if (duplicate) {
      setStudentFormError(`Admission number "${adm}" is already assigned to ${duplicate.name}.`);
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        admNo: adm,
        name,
        stream: studentFormData.stream,
        gender: studentFormData.gender,
        kcpeMarks: Number(studentFormData.kcpeMarks) || 300,
      });
    } else {
      addStudent({
        admNo: adm,
        name,
        stream: studentFormData.stream,
        gender: studentFormData.gender,
        kcpeMarks: Number(studentFormData.kcpeMarks) || 300,
        status: 'Active',
      });
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDeleteStudent = () => {
    if (deletingStudent) {
      removeStudent(deletingStudent.id);
      setDeletingStudent(null);
    }
  };

  // BULK IMPORT CSV PARSER
  const handleProcessStudentCSV = (rawText: string) => {
    setCsvText(rawText);
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const existingAdms = new Set(students.map((s) => s.admNo.trim().toLowerCase()));

    const parsed: Array<{
      admNo: string;
      name: string;
      gender: 'Male' | 'Female';
      kcpeMarks: number;
      isValid: boolean;
      error?: string;
    }> = [];

    lines.forEach((line, idx) => {
      // Skip header if line has "adm" or "name"
      if (idx === 0 && (line.toLowerCase().includes('adm') || line.toLowerCase().includes('name'))) {
        return;
      }
      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 0 || !parts[0]) return;

      const admNo = parts[0];
      const name = parts[1] || '';
      const genderRaw = parts[2] ? parts[2].toUpperCase() : 'FEMALE';
      const gender: 'Male' | 'Female' = genderRaw.startsWith('M') ? 'Male' : 'Female';
      const kcpe = Number(parts[3]) || 320;

      if (!admNo) {
        parsed.push({ admNo, name, gender, kcpeMarks: kcpe, isValid: false, error: 'Missing admission number' });
      } else if (!name) {
        parsed.push({ admNo, name, gender, kcpeMarks: kcpe, isValid: false, error: 'Missing student name' });
      } else if (existingAdms.has(admNo.toLowerCase())) {
        parsed.push({ admNo, name, gender, kcpeMarks: kcpe, isValid: false, error: 'Admission number already exists' });
      } else {
        existingAdms.add(admNo.toLowerCase());
        parsed.push({ admNo, name, gender, kcpeMarks: kcpe, isValid: true });
      }
    });

    const validCount = parsed.filter((p) => p.isValid).length;
    const invalidCount = parsed.length - validCount;

    setCsvImportResult({ parsed, validCount, invalidCount });
  };

  const handleApplyBulkStudents = () => {
    if (!csvImportResult || csvImportResult.validCount === 0) return;
    const toAdd = csvImportResult.parsed
      .filter((p) => p.isValid)
      .map((p) => ({
        admNo: p.admNo,
        name: p.name,
        stream: activeStream,
        gender: p.gender,
        kcpeMarks: p.kcpeMarks,
        status: 'Active' as const,
      }));

    bulkAddStudents(toAdd);
    setIsCSVModalOpen(false);
    setCsvText('');
    setCsvImportResult(null);
  };

  // CLASS STREAM ACTIONS
  const handleOpenAddStream = () => {
    setEditingStream(null);
    setStreamFormData({
      name: 'Form 4 ',
      form: 'Form 4',
      stream: 'Central',
      classTeacher: '',
    });
    setIsStreamModalOpen(true);
  };

  const handleOpenEditStream = (str: ClassStream) => {
    setEditingStream(str);
    setStreamFormData({
      name: str.name,
      form: str.form,
      stream: str.stream,
      classTeacher: str.classTeacher || '',
    });
    setIsStreamModalOpen(true);
  };

  const handleSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${streamFormData.form} ${streamFormData.stream}`.trim();
    if (!fullName) return;

    if (editingStream) {
      updateClassStream({
        ...editingStream,
        name: fullName,
        form: streamFormData.form,
        stream: streamFormData.stream,
        classTeacher: streamFormData.classTeacher.trim(),
      });
    } else {
      addClassStream({
        name: fullName,
        form: streamFormData.form,
        stream: streamFormData.stream,
        classTeacher: streamFormData.classTeacher.trim(),
      });
    }
    setIsStreamModalOpen(false);
  };

  // SUBJECT ACTIONS
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectFormError(null);
    setSubjectFormData({
      code: '',
      name: '',
      department: 'Sciences',
      teacher: '',
      lastExamMean: 50.0,
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjectFormError(null);
    setSubjectFormData({
      code: subj.code,
      name: subj.name,
      department: subj.department,
      teacher: subj.teacher || '',
      lastExamMean: subj.lastExamMean,
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setSubjectFormError(null);
    const code = subjectFormData.code.toUpperCase().trim();
    const name = subjectFormData.name.trim();

    if (!code || !name) {
      setSubjectFormError('Subject code and Subject name are required.');
      return;
    }

    const dup = subjects.find(
      (s) => s.code === code && (!editingSubject || s.id !== editingSubject.id)
    );
    if (dup) {
      setSubjectFormError(`Subject code "${code}" is already in use by ${dup.name}.`);
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        code,
        name,
        department: subjectFormData.department,
        teacher: subjectFormData.teacher.trim(),
        lastExamMean: Number(subjectFormData.lastExamMean) || 50.0,
      });
    } else {
      addSubject({
        code,
        name,
        department: subjectFormData.department,
        teacher: subjectFormData.teacher.trim(),
        lastExamMean: Number(subjectFormData.lastExamMean) || 50.0,
        entered: students.length,
      });
    }
    setIsSubjectModalOpen(false);
  };

  // EXAM PERIOD ACTIONS
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamFormData({
      name: 'Mid-term Exam, Term 3 2026',
      term: 'Term 3',
      year: 2026,
      type: 'Mid-term',
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.name.trim()) return;

    if (editingExam) {
      updateExamPeriod({
        ...editingExam,
        name: examFormData.name.trim(),
        term: examFormData.term,
        year: Number(examFormData.year),
        type: examFormData.type,
      });
    } else {
      addExamPeriod({
        name: examFormData.name.trim(),
        term: examFormData.term,
        year: Number(examFormData.year),
        type: examFormData.type,
      });
    }
    setIsExamModalOpen(false);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DDD6C7] pb-4 sm:pb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">
            Students &amp; Administration
          </h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            Manage cohort registers, streams, curriculum subjects, and exam terms
          </p>
        </div>

        {/* Top Tab Bar with Mobile Scroll */}
        <div className="flex border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-x-auto hide-scrollbar text-xs font-medium max-w-full">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3.5 sm:px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'students' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
            }`}
          >
            Students Register
          </button>
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-3.5 sm:px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'classes' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
            }`}
          >
            Classes &amp; Streams ({streams.length})
          </button>
          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-3.5 sm:px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'subjects' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
            }`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('periods')}
            className={`px-3.5 sm:px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'periods' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'
            }`}
          >
            Exam Periods ({exams.length})
          </button>
        </div>
      </section>

      {/* TAB 1: STUDENTS */}
      {currentTab === 'students' && (
        <section>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9A958A] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search in ${activeStream}...`}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded pl-9 pr-3 py-1.5 font-body-sm text-body-sm text-[#111111] placeholder:text-[#9A958A] focus:outline-none focus:border-[#C2410C]"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setCsvText('');
                  setCsvImportResult(null);
                  setIsCSVModalOpen(true);
                }}
                type="button"
                className="px-3.5 py-1.5 bg-[#FBF8F1] border border-[#DDD6C7] text-[#111111] font-body-sm text-body-sm rounded hover:bg-[#F2EDE3] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Bulk Import Students</span>
              </button>
              <button
                onClick={handleOpenAddStudent}
                type="button"
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] font-body-sm text-body-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider">
                  <th className="w-24 px-4">ADM NO</th>
                  <th className="px-4">FULL NAME</th>
                  <th className="w-24 px-3">GENDER</th>
                  <th className="w-32 px-3 text-right">KCPE MARKS</th>
                  <th className="w-32 px-3">STREAM</th>
                  <th className="w-24 px-3 text-center">STATUS</th>
                  <th className="w-32 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="h-11 hover:bg-[#F2EDE3] transition-colors">
                    <td className="px-4 font-tabular-sm text-tabular-sm font-semibold text-[#111111]">
                      {student.admNo}
                    </td>
                    <td className="px-4 font-medium text-[#111111]">{student.name}</td>
                    <td className="px-3 text-[#5F5E5E]">{student.gender}</td>
                    <td className="px-3 text-right font-tabular-sm text-[#111111]">{student.kcpeMarks} / 500</td>
                    <td className="px-3 text-[#5F5E5E]">{student.stream}</td>
                    <td className="px-3 text-center">
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold bg-[#111111] text-[#FEF9EF] rounded-[2px]">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="text-[#111111] hover:text-[#C2410C] text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-[#DDD6C7]">|</span>
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="text-red-700 hover:text-red-900 text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#5F5E5E]">
                      No student records found in {activeStream}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#5F5E5E] font-tabular-sm">
            <span>
              Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} candidates
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-[#DDD6C7] rounded bg-[#FBF8F1] disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 border border-[#DDD6C7] rounded bg-[#FBF8F1] disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CLASSES & STREAMS */}
      {currentTab === 'classes' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-body-sm text-[#5F5E5E]">
              Registered classes and class teachers. Switching streams updates student filters across all views.
            </p>
            <button
              onClick={handleOpenAddStream}
              type="button"
              className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] text-body-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Class Stream</span>
            </button>
          </div>

          <div className="border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider">
                  <th className="px-4">CLASS / STREAM</th>
                  <th className="px-4">FORM LEVEL</th>
                  <th className="px-4">STREAM NAME</th>
                  <th className="px-4">CLASS TEACHER</th>
                  <th className="px-4 text-right">ENROLLED STUDENTS</th>
                  <th className="px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
                {streams.map((str) => {
                  const count = students.filter((s) => s.stream === str.name).length;
                  const isCurrentActive = activeStream === str.name;

                  return (
                    <tr key={str.id} className="h-11 hover:bg-[#F2EDE3] transition-colors">
                      <td className="px-4 font-semibold text-[#111111] flex items-center gap-2">
                        <span>{str.name}</span>
                        {isCurrentActive && (
                          <span className="text-[10px] bg-[#C2410C] text-[#FEF9EF] px-1.5 py-0.2 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-[#5F5E5E]">{str.form}</td>
                      <td className="px-4 text-[#5F5E5E]">{str.stream}</td>
                      <td className="px-4 text-[#111111]">{str.classTeacher || '—'}</td>
                      <td className="px-4 text-right font-tabular-sm text-tabular-sm font-medium">
                        {count} Students
                      </td>
                      <td className="px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isCurrentActive && (
                            <button
                              onClick={() => setActiveStream(str.name)}
                              className="text-[#C2410C] hover:underline text-xs font-medium cursor-pointer"
                            >
                              Switch to
                            </button>
                          )}
                          <span className="text-[#DDD6C7]">|</span>
                          <button
                            onClick={() => handleOpenEditStream(str)}
                            className="text-[#111111] hover:text-[#C2410C] text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-[#DDD6C7]">|</span>
                          <button
                            onClick={() => setDeletingStream(str)}
                            className="text-red-700 hover:text-red-900 text-xs font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: SUBJECTS */}
      {currentTab === 'subjects' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-body-sm text-[#5F5E5E]">
              KCSE subjects configured in the curriculum ledger.
            </p>
            <button
              onClick={handleOpenAddSubject}
              type="button"
              className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] text-body-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Subject</span>
            </button>
          </div>

          <div className="border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider">
                  <th className="w-24 px-4">CODE</th>
                  <th className="px-4">SUBJECT NAME</th>
                  <th className="px-4">DEPARTMENT</th>
                  <th className="px-4">SUBJECT TEACHER</th>
                  <th className="px-4 text-right">BENCHMARK MEAN</th>
                  <th className="px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
                {subjects.map((subj) => (
                  <tr key={subj.id} className="h-11 hover:bg-[#F2EDE3] transition-colors">
                    <td className="px-4 font-tabular-sm text-tabular-sm font-bold text-[#111111]">
                      {subj.code}
                    </td>
                    <td className="px-4 font-medium text-[#111111]">{subj.name}</td>
                    <td className="px-4 text-[#5F5E5E]">{subj.department}</td>
                    <td className="px-4 text-[#111111]">{subj.teacher || '—'}</td>
                    <td className="px-4 text-right font-tabular-sm text-[#111111]">
                      {subj.lastExamMean.toFixed(1)}%
                    </td>
                    <td className="px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditSubject(subj)}
                          className="text-[#111111] hover:text-[#C2410C] text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-[#DDD6C7]">|</span>
                        <button
                          onClick={() => setDeletingSubject(subj)}
                          className="text-red-700 hover:text-red-900 text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: PERIODS */}
      {currentTab === 'periods' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-body-sm text-[#5F5E5E]">
              Examination periods and term schedules.
            </p>
            <button
              onClick={handleOpenAddExam}
              type="button"
              className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] text-body-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Exam Period</span>
            </button>
          </div>

          <div className="border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider">
                  <th className="px-4">EXAM NAME</th>
                  <th className="px-4">TERM</th>
                  <th className="px-4">ACADEMIC YEAR</th>
                  <th className="px-4">TYPE</th>
                  <th className="px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
                {exams.map((exam) => (
                  <tr key={exam.id} className="h-11 hover:bg-[#F2EDE3] transition-colors">
                    <td className="px-4 font-semibold text-[#111111]">{exam.name}</td>
                    <td className="px-4 text-[#5F5E5E]">{exam.term}</td>
                    <td className="px-4 font-tabular-sm text-[#111111]">{exam.year}</td>
                    <td className="px-4 text-[#5F5E5E]">{exam.type}</td>
                    <td className="px-4 text-right">
                      <button
                        onClick={() => setDeletingExam(exam)}
                        className="text-red-700 hover:text-red-900 text-xs font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStudent}
            className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-4 pb-2 border-b border-[#DDD6C7]">
              {editingStudent ? 'Edit Student Record' : 'Add New Candidate'}
            </h3>

            {studentFormError && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-800 text-xs rounded">
                {studentFormError}
              </div>
            )}

            <div className="space-y-3 font-body-sm text-body-sm">
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Admission Number:
                </label>
                <input
                  type="text"
                  required
                  value={studentFormData.admNo}
                  onChange={(e) => setStudentFormData({ ...studentFormData, admNo: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Student Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    Gender:
                  </label>
                  <select
                    value={studentFormData.gender}
                    onChange={(e) =>
                      setStudentFormData({ ...studentFormData, gender: e.target.value as 'Male' | 'Female' })
                    }
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    KCPE Marks:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={studentFormData.kcpeMarks}
                    onChange={(e) =>
                      setStudentFormData({ ...studentFormData, kcpeMarks: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Class &amp; Stream:
                </label>
                <select
                  value={studentFormData.stream}
                  onChange={(e) => setStudentFormData({ ...studentFormData, stream: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                >
                  {streams.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#DDD6C7]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                Save Candidate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE STUDENT MODAL (CASCADING WARNING) */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border-2 border-red-700 rounded max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-headline-sm text-headline-sm">Confirm Student Deletion</h3>
            </div>
            <p className="font-body-sm text-body-sm text-[#111111] mb-3">
              Are you sure you want to delete{' '}
              <strong className="font-semibold">{deletingStudent.name} (Adm: {deletingStudent.admNo})</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs mb-4">
              <strong>Cascading effect:</strong> All examination scores and marks entered for this student across all subjects will be permanently removed from the ledger and rankings.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-1.5 bg-red-700 text-white rounded text-sm font-medium hover:bg-red-800 cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#DDD6C7] pb-3">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">
                Bulk Import Students to {activeStream}
              </h3>
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="text-[#5F5E5E] hover:text-[#111111] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-[#5F5E5E] mb-3">
              Paste CSV or Tab-delimited rows with columns:{' '}
              <span className="font-medium text-[#111111]">AdmissionNo, FullName, Gender, KCPE</span>
            </p>

            <textarea
              value={csvText}
              onChange={(e) => handleProcessStudentCSV(e.target.value)}
              placeholder="3950, John Doe, Male, 340&#10;3951, Jane Wanjiku, Female, 360"
              rows={6}
              className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded p-3 font-tabular-sm text-xs text-[#111111] focus:border-[#C2410C] focus:outline-none"
            />

            {csvImportResult && (
              <div className="mt-3 p-3 bg-[#FBF8F1] border border-[#DDD6C7] text-xs">
                <div className="flex items-center justify-between font-medium mb-1.5">
                  <span className="text-emerald-800 font-bold">
                    ✓ {csvImportResult.validCount} valid candidates ready to import
                  </span>
                  {csvImportResult.invalidCount > 0 && (
                    <span className="text-red-700">
                      ✗ {csvImportResult.invalidCount} invalid rows (skipped)
                    </span>
                  )}
                </div>
                <div className="max-h-28 overflow-y-auto divide-y divide-[#DDD6C7]/50 text-[11px] text-[#5F5E5E]">
                  {csvImportResult.parsed.slice(0, 10).map((row, idx) => (
                    <div key={idx} className="py-0.5 flex justify-between">
                      <span>{row.admNo} — {row.name} ({row.gender})</span>
                      <span className={row.isValid ? 'text-emerald-700' : 'text-red-700 font-semibold'}>
                        {row.isValid ? 'Valid' : row.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#DDD6C7]">
              <button
                type="button"
                onClick={() => setIsCSVModalOpen(false)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkStudents}
                disabled={!csvImportResult || csvImportResult.validCount === 0}
                className="px-5 py-2 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                Import {csvImportResult ? csvImportResult.validCount : 0} Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STREAM MODAL */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStream}
            className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-4 pb-2 border-b border-[#DDD6C7]">
              {editingStream ? 'Edit Class Stream' : 'Add Class Stream'}
            </h3>
            <div className="space-y-3 font-body-sm text-body-sm">
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Form Level:
                </label>
                <select
                  value={streamFormData.form}
                  onChange={(e) => setStreamFormData({ ...streamFormData, form: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                >
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                </select>
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Stream Name (e.g. East, West, North, Central):
                </label>
                <input
                  type="text"
                  required
                  value={streamFormData.stream}
                  onChange={(e) => setStreamFormData({ ...streamFormData, stream: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Class Teacher:
                </label>
                <input
                  type="text"
                  value={streamFormData.classTeacher}
                  onChange={(e) => setStreamFormData({ ...streamFormData, classTeacher: e.target.value })}
                  placeholder="e.g. Mrs. S. Chelangat"
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#DDD6C7]">
              <button
                type="button"
                onClick={() => setIsStreamModalOpen(false)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium"
              >
                Save Stream
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE STREAM CONFIRMATION */}
      {deletingStream && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border-2 border-red-700 rounded max-w-md w-full p-6 shadow-xl">
            <h3 className="font-headline-sm text-headline-sm text-red-700 mb-2">Delete Stream</h3>
            <p className="font-body-sm text-body-sm text-[#111111] mb-3">
              Are you sure you want to delete <strong>{deletingStream.name}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs mb-4">
              <strong>Cascading warning:</strong> All {students.filter((s) => s.stream === deletingStream.name).length} students currently enrolled in {deletingStream.name} and their marks will be removed.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingStream(null)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeClassStream(deletingStream.id);
                  setDeletingStream(null);
                }}
                className="px-4 py-1.5 bg-red-700 text-white rounded text-sm font-medium"
              >
                Delete Stream &amp; Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSubject}
            className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-4 pb-2 border-b border-[#DDD6C7]">
              {editingSubject ? 'Edit Subject' : 'Add Curriculum Subject'}
            </h3>
            {subjectFormError && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-800 text-xs rounded">
                {subjectFormError}
              </div>
            )}
            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    Subject Code:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={subjectFormData.code}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FRE"
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    Department:
                  </label>
                  <select
                    value={subjectFormData.department}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, department: e.target.value })}
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Applied Sciences">Applied Sciences</option>
                    <option value="Technicals">Technicals</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Subject Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                  placeholder="e.g. French"
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Subject Teacher:
                </label>
                <input
                  type="text"
                  value={subjectFormData.teacher}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, teacher: e.target.value })}
                  placeholder="e.g. Madame Dubois"
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Previous Exam Benchmark Mean:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={subjectFormData.lastExamMean}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, lastExamMean: Number(e.target.value) })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#DDD6C7]">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium"
              >
                Save Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE SUBJECT CONFIRMATION */}
      {deletingSubject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border-2 border-red-700 rounded max-w-md w-full p-6 shadow-xl">
            <h3 className="font-headline-sm text-headline-sm text-red-700 mb-2">Delete Subject</h3>
            <p className="font-body-sm text-body-sm text-[#111111] mb-3">
              Are you sure you want to remove <strong>{deletingSubject.code} — {deletingSubject.name}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs mb-4">
              <strong>Cascading warning:</strong> All student marks recorded under {deletingSubject.code} across all cohort exams will be permanently deleted.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSubject(deletingSubject.code);
                  setDeletingSubject(null);
                }}
                className="px-4 py-1.5 bg-red-700 text-white rounded text-sm font-medium"
              >
                Delete Subject &amp; Marks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXAM PERIOD MODAL */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveExam}
            className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-4 pb-2 border-b border-[#DDD6C7]">
              {editingExam ? 'Edit Exam Period' : 'Add Examination Period'}
            </h3>
            <div className="space-y-3 font-body-sm text-body-sm">
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Examination Name:
                </label>
                <input
                  type="text"
                  required
                  value={examFormData.name}
                  onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                  placeholder="e.g. End-term Exam, Term 3 2026"
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    Term:
                  </label>
                  <select
                    value={examFormData.term}
                    onChange={(e) => setExamFormData({ ...examFormData, term: e.target.value })}
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                    Year:
                  </label>
                  <input
                    type="number"
                    value={examFormData.year}
                    onChange={(e) => setExamFormData({ ...examFormData, year: Number(e.target.value) })}
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#5F5E5E] text-xs font-medium uppercase mb-1">
                  Exam Type:
                </label>
                <select
                  value={examFormData.type}
                  onChange={(e) => setExamFormData({ ...examFormData, type: e.target.value as any })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111]"
                >
                  <option value="Mid-term">Mid-term</option>
                  <option value="End-term">End-term</option>
                  <option value="Mock">Mock Exam</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#DDD6C7]">
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium"
              >
                Save Exam Period
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE EXAM PERIOD MODAL */}
      {deletingExam && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border-2 border-red-700 rounded max-w-md w-full p-6 shadow-xl">
            <h3 className="font-headline-sm text-headline-sm text-red-700 mb-2">Delete Exam Period</h3>
            <p className="font-body-sm text-body-sm text-[#111111] mb-3">
              Are you sure you want to delete <strong>{deletingExam.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="px-4 py-1.5 text-sm text-[#5F5E5E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeExamPeriod(deletingExam.id);
                  setDeletingExam(null);
                }}
                className="px-4 py-1.5 bg-red-700 text-white rounded text-sm font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
