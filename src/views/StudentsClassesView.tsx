import React, { useMemo, useState } from 'react';
import { useGrading } from '../context/GradingContext';
import { Student } from '../types';

export const StudentsClassesView: React.FC = () => {
  const {
    students,
    subjects,
    activeStream,
    setActiveStream,
    addStudent,
    updateStudent,
    removeStudent,
  } = useGrading();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'classes' | 'subjects' | 'periods'>('students');
  const [searchStudent, setSearchStudent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add/Edit student modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    admNo: '',
    name: '',
    stream: activeStream,
    gender: 'Female' as 'Male' | 'Female',
    kcpeMarks: 350,
  });

  // CSV Import modal
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

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

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      admNo: String(3900 + students.length + 1),
      name: '',
      stream: activeStream,
      gender: 'Female',
      kcpeMarks: 340,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
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
    if (!formData.name.trim() || !formData.admNo.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        admNo: formData.admNo.trim(),
        name: formData.name.trim(),
        stream: formData.stream,
        gender: formData.gender,
        kcpeMarks: Number(formData.kcpeMarks) || 300,
      });
    } else {
      addStudent({
        admNo: formData.admNo.trim(),
        name: formData.name.trim(),
        stream: formData.stream,
        gender: formData.gender,
        kcpeMarks: Number(formData.kcpeMarks) || 300,
        status: 'Active',
      });
    }
    setIsAddModalOpen(false);
  };

  const handleProcessCSVImport = () => {
    if (!csvText.trim()) {
      setIsCSVModalOpen(false);
      return;
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    lines.forEach((line) => {
      // Split by comma or tab
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const adm = parts[0].trim();
        const name = parts[1].trim();
        const gender = parts[2]?.trim().toLowerCase().startsWith('m') ? 'Male' : 'Female';
        const kcpe = parseInt(parts[3]?.trim(), 10) || 320;

        if (adm && name && !students.some((s) => s.admNo === adm)) {
          addStudent({
            admNo: adm,
            name,
            stream: activeStream,
            gender,
            kcpeMarks: kcpe,
            status: 'Active',
          });
        }
      }
    });

    setIsCSVModalOpen(false);
    setCsvText('');
  };

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">
          Students &amp; Classes
        </h1>
        <p className="font-body-md text-body-md text-[#5F5E5E] mt-1">
          Manage enrolled students, streams, subjects, and examination periods
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-[#DDD6C7] flex items-center gap-6 mb-6 select-none">
        <button
          onClick={() => setActiveSubTab('students')}
          className={`relative py-2.5 font-headline-sm text-headline-sm flex items-center gap-1.5 focus:outline-none cursor-pointer ${
            activeSubTab === 'students' ? 'text-[#111111]' : 'text-[#5F5E5E] hover:text-[#111111]'
          }`}
        >
          <span>Students ({filteredStudents.length})</span>
          {activeSubTab === 'students' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C2410C]"></div>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('classes')}
          className={`relative py-2.5 font-headline-sm text-headline-sm flex items-center gap-1.5 focus:outline-none cursor-pointer ${
            activeSubTab === 'classes' ? 'text-[#111111]' : 'text-[#5F5E5E] hover:text-[#111111]'
          }`}
        >
          <span>Classes &amp; Streams</span>
          {activeSubTab === 'classes' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C2410C]"></div>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`relative py-2.5 font-headline-sm text-headline-sm flex items-center gap-1.5 focus:outline-none cursor-pointer ${
            activeSubTab === 'subjects' ? 'text-[#111111]' : 'text-[#5F5E5E] hover:text-[#111111]'
          }`}
        >
          <span>Subjects ({subjects.length})</span>
          {activeSubTab === 'subjects' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C2410C]"></div>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('periods')}
          className={`relative py-2.5 font-headline-sm text-headline-sm flex items-center gap-1.5 focus:outline-none cursor-pointer ${
            activeSubTab === 'periods' ? 'text-[#111111]' : 'text-[#5F5E5E] hover:text-[#111111]'
          }`}
        >
          <span>Examination Periods</span>
          {activeSubTab === 'periods' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C2410C]"></div>
          )}
        </button>
      </div>

      {/* Sub-tab 1: Students */}
      {activeSubTab === 'students' && (
        <section className="flex flex-col gap-4">
          {/* Toolbar Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              {/* Stream Selector */}
              <div className="relative min-w-[210px]">
                <select
                  value={activeStream}
                  onChange={(e) => {
                    setActiveStream(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] text-[#111111] font-body-sm text-body-sm rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#C2410C] appearance-none cursor-pointer"
                >
                  <option value="Form 4 East">Form 4 East ({students.filter(s => s.stream === 'Form 4 East').length} students)</option>
                  <option value="Form 4 West">Form 4 West (40 students)</option>
                  <option value="Form 4 North">Form 4 North (38 students)</option>
                  <option value="Form 3 East">Form 3 East (45 students)</option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-[#5F5E5E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 max-w-[360px]">
                <span className="material-symbols-outlined text-[17px] text-[#9A958A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => {
                    setSearchStudent(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search student by name or admission number..."
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] text-[#111111] placeholder:text-[#9A958A] font-body-sm text-body-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setIsCSVModalOpen(true)}
                type="button"
                className="bg-transparent border border-[#111111] text-[#111111] font-body-sm text-body-sm rounded px-3 py-2 flex items-center gap-1.5 hover:bg-[#F2EDE3] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">file_upload</span>
                <span>Import from CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                type="button"
                className="bg-[#C2410C] text-[#FEF9EF] font-headline-sm text-headline-sm rounded px-3.5 py-2 flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add student</span>
              </button>
            </div>
          </div>

          {/* Quiet Helper Callout Line */}
          <p className="font-body-sm text-body-sm text-[#5F5E5E]">
            Paste a list of admission numbers and names to add many students at once, or drag and drop a CSV file.
          </p>

          {/* Ledger Data Table */}
          <div className="w-full border border-[#DDD6C7] bg-[#FBF8F1] rounded overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 border-b border-[#DDD6C7] bg-[#FEF9EF] select-none">
                  <th className="pl-4 pr-3 text-right font-label-caps text-label-caps text-[#5F5E5E] w-[100px]">
                    ADM NO.
                  </th>
                  <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">FULL NAME</th>
                  <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">CLASS / STREAM</th>
                  <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">GENDER</th>
                  <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">SUBJECTS TAKEN</th>
                  <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">STATUS</th>
                  <th className="pr-4 pl-3 text-right font-label-caps text-label-caps text-[#5F5E5E]">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7]">
                {paginatedStudents.map((s) => (
                  <tr key={s.id} className="h-[44px] hover:bg-[#F2EDE3] transition-colors group">
                    <td className="pl-4 pr-3 text-right font-tabular-md text-tabular-md text-[#111111]">
                      {s.admNo}
                    </td>
                    <td className="px-4 font-body-sm text-body-sm text-[#111111] font-medium">
                      {s.name}
                    </td>
                    <td className="px-4 font-body-sm text-body-sm text-[#5F5E5E]">{s.stream}</td>
                    <td className="px-4 font-body-sm text-body-sm text-[#5F5E5E]">{s.gender}</td>
                    <td className="px-4 font-body-sm text-body-sm text-[#5F5E5E]">10 subjects</td>
                    <td className="px-4">
                      <span className="font-tabular-sm text-tabular-sm border border-[#111111] text-[#111111] px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="pr-4 pl-3 text-right font-body-sm text-body-sm space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="text-[#C2410C] hover:underline font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <span className="text-[#DDD6C7]">·</span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${s.name} (Adm: ${s.admNo}) from the roster?`)) {
                            removeStudent(s.id);
                          }
                        }}
                        className="text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[#5F5E5E] font-body-sm">
                      No student records found in {activeStream}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ledger Footer & Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-body-sm font-body-sm">
            <span className="text-[#5F5E5E]">
              Displaying {paginatedStudents.length} of {filteredStudents.length} students in{' '}
              {activeStream}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-[#DDD6C7] text-[#5F5E5E] hover:text-[#111111] hover:bg-[#FBF8F1] rounded transition-colors disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-[#111111] font-tabular-sm text-tabular-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-[#DDD6C7] text-[#111111] hover:bg-[#FBF8F1] rounded transition-colors disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sub-tab 2: Classes & Streams */}
      {activeSubTab === 'classes' && (
        <div className="border border-[#DDD6C7] bg-[#FBF8F1] p-6 space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-[#111111]">Registered Academic Streams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-[#111111]">Form 4 East (Active)</h4>
                <p className="text-xs text-[#5F5E5E] mt-0.5">Class Teacher: Mr. J. Kiprotich · 42 Students</p>
              </div>
              <span className="font-tabular-sm text-xs bg-[#111111] text-[#FEF9EF] px-2 py-0.5 rounded">Current</span>
            </div>
            <div className="p-4 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-[#111111]">Form 4 West</h4>
                <p className="text-xs text-[#5F5E5E] mt-0.5">Class Teacher: Mrs. M. Wambui · 40 Students</p>
              </div>
              <button onClick={() => setActiveStream('Form 4 West')} className="text-xs text-[#C2410C] hover:underline cursor-pointer">
                Switch Stream
              </button>
            </div>
            <div className="p-4 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-[#111111]">Form 4 North</h4>
                <p className="text-xs text-[#5F5E5E] mt-0.5">Class Teacher: Mr. D. Otieno · 38 Students</p>
              </div>
              <button onClick={() => setActiveStream('Form 4 North')} className="text-xs text-[#C2410C] hover:underline cursor-pointer">
                Switch Stream
              </button>
            </div>
            <div className="p-4 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-[#111111]">Form 3 East</h4>
                <p className="text-xs text-[#5F5E5E] mt-0.5">Class Teacher: Mrs. C. Chebet · 45 Students</p>
              </div>
              <button onClick={() => setActiveStream('Form 3 East')} className="text-xs text-[#C2410C] hover:underline cursor-pointer">
                Switch Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Subjects */}
      {activeSubTab === 'subjects' && (
        <div className="border border-[#DDD6C7] bg-[#FBF8F1] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 border-b border-[#DDD6C7] bg-[#FEF9EF]">
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">CODE</th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">SUBJECT NAME</th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E]">DEPARTMENT</th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] text-right">ENROLLED</th>
                <th className="px-4 font-label-caps text-label-caps text-[#5F5E5E] text-right">LAST EXAM MEAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {subjects.map((s) => (
                <tr key={s.code} className="h-11 hover:bg-[#F2EDE3]">
                  <td className="px-4 font-tabular-md font-semibold text-[#111111]">{s.code}</td>
                  <td className="px-4 font-medium text-[#111111]">{s.name}</td>
                  <td className="px-4 text-[#5F5E5E]">{s.department}</td>
                  <td className="px-4 text-right font-tabular-sm text-[#111111]">{s.entered} students</td>
                  <td className="px-4 text-right font-tabular-sm text-[#111111]">{s.lastExamMean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-tab 4: Examination Periods */}
      {activeSubTab === 'periods' && (
        <div className="border border-[#DDD6C7] bg-[#FBF8F1] p-6 space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-[#111111]">Academic Evaluation Periods</h3>
          <div className="space-y-3 font-body-sm">
            <div className="p-3 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <span className="font-semibold text-[#111111]">End-term Exam, Term 2 2026 (Active)</span>
                <p className="text-xs text-[#5F5E5E]">Closing evaluation window · Form 4 KCSE preparation cycle</p>
              </div>
              <span className="font-tabular-sm text-xs bg-[#C2410C] text-[#FEF9EF] px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="p-3 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <span className="font-semibold text-[#111111]">Mid-term Exam, Term 2 2026</span>
                <p className="text-xs text-[#5F5E5E]">Midway continuous assessment test (CAT)</p>
              </div>
              <span className="text-xs text-[#5F5E5E]">Archived</span>
            </div>
            <div className="p-3 bg-[#FEF9EF] border border-[#DDD6C7] flex justify-between items-center">
              <div>
                <span className="font-semibold text-[#111111]">End-term Exam, Term 1 2026</span>
                <p className="text-xs text-[#5F5E5E]">First term final examination schedule</p>
              </div>
              <span className="text-xs text-[#5F5E5E]">Archived</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-md w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7] mb-4">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#5F5E5E] hover:text-[#111111] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 font-body-sm">
              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.admNo}
                  onChange={(e) => setFormData({ ...formData, admNo: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none font-tabular-sm"
                />
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Joy Chelangat"
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                    KCPE Entry Marks
                  </label>
                  <input
                    type="number"
                    value={formData.kcpeMarks}
                    onChange={(e) => setFormData({ ...formData, kcpeMarks: Number(e.target.value) })}
                    className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#111111] focus:border-[#C2410C] focus:outline-none font-tabular-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                  Class &amp; Stream
                </label>
                <input
                  type="text"
                  value={formData.stream}
                  disabled
                  className="w-full bg-[#F2EDE3] border border-[#DDD6C7] rounded px-3 py-1.5 text-[#5F5E5E]"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD6C7] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-lg w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7] mb-3">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Import Students from CSV</h3>
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="text-[#5F5E5E] hover:text-[#111111] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-[#5F5E5E] mb-3">
              Paste rows formatted as: <br />
              <code className="text-xs bg-[#FBF8F1] px-1.5 py-0.5 rounded font-tabular-sm text-[#111111]">
                AdmissionNo, FullName, Gender, KCPE
              </code>
            </p>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`3950, Mary Wanjiru, Female, 345\n3951, Joseph Cheruiyot, Male, 362`}
              className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded p-3 text-xs font-tabular-sm text-[#111111] focus:border-[#C2410C] focus:outline-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="px-3 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessCSVImport}
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                Import Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
