import { useState, type ReactNode, type ChangeEvent } from 'react';
import { useAppStore } from '../lib/store';
import { useToast } from '../components/Toast';
import type { Student, Subject, Class, Exam } from '../types';

export function StudentsClasses() {
  const {
    students, subjects, classes, exams,
    addStudent, updateStudent, removeStudent, importStudentsFromCSV,
    addSubject, updateSubject, removeSubject,
    addClass, updateClass, removeClass,
    addExam, updateExam, removeExam,
    activeClassId, setActiveClassId,
    activeExamId, setActiveExamId,
  } = useAppStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'students' | 'subjects' | 'classes' | 'exams'>('students');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: string; item?: Student | Subject | Class | Exam } | null>(null);

  const handleImportStudents = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = await importStudentsFromCSV(text);
    showToast(`Imported ${result.success} students`, 'success');
    if (result.errors.length > 0) {
      showToast(`${result.errors.length} errors occurred`, 'warning');
    }
    e.target.value = '';
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-primary">Students & Classes</h2>
            <p className="text-body text-secondary">Manage students, subjects, classes, and exams</p>
          </div>
          <label className="px-4 py-2 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined">upload_file</span>
            Import Students
            <input type="file" accept=".csv" onChange={handleImportStudents} className="hidden" />
          </label>
        </div>

        <div className="border-b border-hairline">
          <nav className="flex gap-1 pb-1" role="tablist">
            {['students', 'subjects', 'classes', 'exams'].map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab as 'students' | 'subjects' | 'classes' | 'exams')}
                className={`px-4 py-2 text-body font-medium rounded-t-sm transition-base ${
                  activeTab === tab
                    ? 'border-b-2 border-brand text-primary bg-surface-container'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            classes={classes}
            onAdd={() => { setEditingItem({ type: 'student' }); setShowModal(true); }}
            onEdit={(item) => { setEditingItem({ type: 'student', item }); setShowModal(true); }}
            onDelete={async (id) => { await removeStudent(id); showToast('Student removed', 'success'); }}
            onImport={handleImportStudents}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            onAdd={() => { setEditingItem({ type: 'subject' }); setShowModal(true); }}
            onEdit={(item) => { setEditingItem({ type: 'subject', item }); setShowModal(true); }}
            onDelete={async (id) => { await removeSubject(id); showToast('Subject removed', 'success'); }}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManager
            classes={classes}
            students={students}
            onAdd={() => { setEditingItem({ type: 'class' }); setShowModal(true); }}
            onEdit={(item) => { setEditingItem({ type: 'class', item }); setShowModal(true); }}
            onDelete={async (id) => { await removeClass(id); showToast('Class removed', 'success'); }}
            activeClassId={activeClassId}
            setActiveClassId={setActiveClassId}
          />
        )}

        {activeTab === 'exams' && (
          <ExamManager
            exams={exams}
            classes={classes}
            subjects={subjects}
            activeExamId={activeExamId}
            setActiveExamId={setActiveExamId}
            onAdd={() => { setEditingItem({ type: 'exam' }); setShowModal(true); }}
            onEdit={(item) => { setEditingItem({ type: 'exam', item }); setShowModal(true); }}
            onDelete={async (id) => { await removeExam(id); showToast('Exam removed', 'success'); }}
          />
        )}

        {showModal && editingItem && (
          <Modal onClose={closeModal}>
            {editingItem.type === 'student' && (
              <StudentForm
                item={editingItem.item as Student | undefined}
                classes={classes}
                onSave={async (data) => {
                  if (editingItem.item) await updateStudent({ ...editingItem.item, ...data } as Student);
                  else await addStudent(data as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>);
                  showToast(editingItem.item ? 'Student updated' : 'Student added', 'success');
                  closeModal();
                }}
                onClose={closeModal}
              />
            )}
            {editingItem.type === 'subject' && (
              <SubjectForm
                item={editingItem.item as Subject | undefined}
                onSave={async (data) => {
                  if (editingItem.item) await updateSubject({ ...editingItem.item, ...data } as Subject);
                  else await addSubject(data as Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>);
                  showToast(editingItem.item ? 'Subject updated' : 'Subject added', 'success');
                  closeModal();
                }}
                onClose={closeModal}
              />
            )}
            {editingItem.type === 'class' && (
              <ClassForm
                item={editingItem.item as Class | undefined}
                students={students}
                onSave={async (data) => {
                  if (editingItem.item) await updateClass({ ...editingItem.item, ...data } as Class);
                  else await addClass(data as Omit<Class, 'id' | 'createdAt' | 'updatedAt'>);
                  showToast(editingItem.item ? 'Class updated' : 'Class added', 'success');
                  closeModal();
                }}
                onClose={closeModal}
              />
            )}
            {editingItem.type === 'exam' && (
              <ExamForm
                item={editingItem.item as Exam | undefined}
                classes={classes}
                subjects={subjects}
                onSave={async (data) => {
                  if (editingItem.item) await updateExam({ ...editingItem.item, ...data } as Exam);
                  else await addExam(data as Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>);
                  showToast(editingItem.item ? 'Exam updated' : 'Exam added', 'success');
                  closeModal();
                }}
                onClose={closeModal}
              />
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}

interface StudentManagerProps {
  students: Student[];
  classes: Class[];
  onAdd: () => void;
  onEdit: (item: Student) => void;
  onDelete: (id: string) => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
}

function StudentManager({ students, classes, onAdd, onEdit, onDelete, onImport }: StudentManagerProps) {
  const classMap = new Map(classes.map(c => [c.id, c.name]));
  return (
    <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container sticky top-0">
            <tr>
              <th className="p-3 text-left text-label text-tertiary">Adm No</th>
              <th className="p-3 text-left text-label text-tertiary">Name</th>
              <th className="p-3 text-center text-label text-tertiary">Stream</th>
              <th className="p-3 text-center text-label text-tertiary">Gender</th>
              <th className="p-3 text-center text-label text-tertiary">KCPE</th>
              <th className="p-3 text-center text-label text-tertiary">Status</th>
              <th className="p-3 text-center text-label text-tertiary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-hairline hover:bg-surface-container">
                <td className="p-3 text-body font-medium text-primary">{s.admNo}</td>
                <td className="p-3 text-body text-primary">{s.name}</td>
                <td className="p-3 text-center text-body text-secondary">{s.stream}</td>
                <td className="p-3 text-center text-body text-secondary">{s.gender}</td>
                <td className="p-3 text-center text-body tabular-nums text-secondary">{s.kcpeMarks}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-sm text-label font-medium ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => onEdit(s)} className="px-2 py-1 text-secondary hover:text-primary transition-base">Edit</button>
                  <button onClick={() => onDelete(s.id)} className="px-2 py-1 text-error hover:text-red-700 transition-base ml-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SubjectManagerProps {
  subjects: Subject[];
  onAdd: () => void;
  onEdit: (item: Subject) => void;
  onDelete: (id: string) => void;
}

function SubjectManager({ subjects, onAdd, onEdit, onDelete }: SubjectManagerProps) {
  return (
    <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container sticky top-0">
            <tr>
              <th className="p-3 text-left text-label text-tertiary">Code</th>
              <th className="p-3 text-left text-label text-tertiary">Name</th>
              <th className="p-3 text-center text-label text-tertiary">Department</th>
              <th className="p-3 text-center text-label text-tertiary">Entered</th>
              <th className="p-3 text-center text-label text-tertiary">Last Mean</th>
              <th className="p-3 text-center text-label text-tertiary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id} className="border-b border-hairline hover:bg-surface-container">
                <td className="p-3 text-body font-mono font-medium text-primary">{s.code}</td>
                <td className="p-3 text-body text-primary">{s.name}</td>
                <td className="p-3 text-center text-body text-secondary">{s.department}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-sm text-label font-medium ${s.entered ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-tertiary'}`}>
                    {s.entered ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-3 text-center text-body tabular-nums text-secondary">{s.lastExamMean}%</td>
                <td className="p-3 text-center">
                  <button onClick={() => onEdit(s)} className="px-2 py-1 text-secondary hover:text-primary transition-base">Edit</button>
                  <button onClick={() => onDelete(s.id)} className="px-2 py-1 text-error hover:text-red-700 transition-base ml-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ClassManagerProps {
  classes: Class[];
  students: Student[];
  onAdd: () => void;
  onEdit: (item: Class) => void;
  onDelete: (id: string) => void;
  activeClassId: string | null;
  setActiveClassId: (id: string | null) => void;
}

function ClassManager({ classes, students, onAdd, onEdit, onDelete, activeClassId, setActiveClassId }: ClassManagerProps) {
  return (
    <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container sticky top-0">
            <tr>
              <th className="p-3 text-left text-label text-tertiary">Name</th>
              <th className="p-3 text-center text-label text-tertiary">Stream</th>
              <th className="p-3 text-center text-label text-tertiary">Teacher</th>
              <th className="p-3 text-center text-label text-tertiary">Students</th>
              <th className="p-3 text-center text-label text-tertiary">Active</th>
              <th className="p-3 text-center text-label text-tertiary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id} className={`border-b border-hairline hover:bg-surface-container ${activeClassId === c.id ? 'bg-brand-light' : ''}`}>
                <td className="p-3 text-body font-medium text-primary">{c.name}</td>
                <td className="p-3 text-center text-body text-secondary">{c.stream}</td>
                <td className="p-3 text-center text-body text-secondary">{c.teacherId}</td>
                <td className="p-3 text-center text-body tabular-nums text-secondary">{c.studentIds.length}</td>
                <td className="p-3 text-center">
                  <input
                    type="radio"
                    name="active-class"
                    checked={activeClassId === c.id}
                    onChange={() => setActiveClassId(c.id)}
                    className="accent-brand"
                  />
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => onEdit(c)} className="px-2 py-1 text-secondary hover:text-primary transition-base">Edit</button>
                  <button onClick={() => onDelete(c.id)} className="px-2 py-1 text-error hover:text-red-700 transition-base ml-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExamManagerProps {
  exams: Exam[];
  classes: Class[];
  subjects: Subject[];
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
  onAdd: () => void;
  onEdit: (item: Exam) => void;
  onDelete: (id: string) => void;
}

function ExamManager({ exams, classes, subjects, activeExamId, setActiveExamId, onAdd, onEdit, onDelete }: ExamManagerProps) {
  const classMap = new Map(classes.map(c => [c.id, c.name]));
  return (
    <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container sticky top-0">
            <tr>
              <th className="p-3 text-left text-label text-tertiary">Name</th>
              <th className="p-3 text-center text-label text-tertiary">Class</th>
              <th className="p-3 text-center text-label text-tertiary">Term</th>
              <th className="p-3 text-center text-label text-tertiary">Year</th>
              <th className="p-3 text-center text-label text-tertiary">Date</th>
              <th className="p-3 text-center text-label text-tertiary">Subjects</th>
              <th className="p-3 text-center text-label text-tertiary">Active</th>
              <th className="p-3 text-center text-label text-tertiary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(e => (
              <tr key={e.id} className={`border-b border-hairline hover:bg-surface-container ${activeExamId === e.id ? 'bg-brand-light' : ''}`}>
                <td className="p-3 text-body font-medium text-primary">{e.name}</td>
                <td className="p-3 text-center text-body text-secondary">{classMap.get(e.classId) || e.classId}</td>
                <td className="p-3 text-center text-body text-secondary">{e.term}</td>
                <td className="p-3 text-center text-body text-secondary">{e.academicYear}</td>
                <td className="p-3 text-center text-body text-secondary">{e.date}</td>
                <td className="p-3 text-center text-body tabular-nums text-secondary">{e.subjectIds.length}</td>
                <td className="p-3 text-center">
                  <input
                    type="radio"
                    name="active-exam"
                    checked={activeExamId === e.id}
                    onChange={() => setActiveExamId(e.id)}
                    className="accent-brand"
                  />
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => onEdit(e)} className="px-2 py-1 text-secondary hover:text-primary transition-base">Edit</button>
                  <button onClick={() => onDelete(e.id)} className="px-2 py-1 text-error hover:text-red-700 transition-base ml-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-panel border border-hairline rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

interface StudentFormProps {
  item: Student | undefined;
  classes: Class[];
  onSave: (data: Partial<Student>) => void;
  onClose: () => void;
}

function StudentForm({ item, classes, onSave, onClose }: StudentFormProps) {
  const [form, setForm] = useState<{
    admNo: string;
    name: string;
    stream: string;
    gender: 'Male' | 'Female';
    kcpeMarks: number;
    status: 'Active' | 'Inactive';
  }>({
    admNo: item?.admNo || '',
    name: item?.name || '',
    stream: item?.stream || classes[0]?.stream || 'Form 4 East',
    gender: item?.gender || 'Male',
    kcpeMarks: item?.kcpeMarks || 300,
    status: item?.status || 'Active',
  });

  return (
    <div>
      <h3 className="text-h3 text-primary mb-4">{item ? 'Edit Student' : 'Add Student'}</h3>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Admission No" value={form.admNo} onChange={v => setForm({...form, admNo: String(v)})} required />
          <Field label="Name" value={form.name} onChange={v => setForm({...form, name: String(v)})} required />
          <Field label="Stream" type="select" value={form.stream} onChange={v => setForm({...form, stream: String(v)})} options={classes.map(c => c.stream)} required />
          <Field label="Gender" type="select" value={form.gender} onChange={v => setForm({...form, gender: String(v) as 'Male' | 'Female'})} options={['Male', 'Female']} required />
          <Field label="KCPE Marks" type="number" value={form.kcpeMarks} onChange={v => setForm({...form, kcpeMarks: parseInt(String(v)) || 0})} required />
          <Field label="Status" type="select" value={form.status} onChange={v => setForm({...form, status: String(v) as 'Active' | 'Inactive'})} options={['Active', 'Inactive']} required />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base">Save</button>
        </div>
      </form>
    </div>
  );
}

interface SubjectFormProps {
  item: Subject | undefined;
  onSave: (data: Partial<Subject>) => void;
  onClose: () => void;
}

function SubjectForm({ item, onSave, onClose }: SubjectFormProps) {
  const [form, setForm] = useState<{
    code: string;
    name: string;
    department: 'Sciences' | 'Languages' | 'Humanities' | 'Technicals' | 'Mathematics';
    entered: boolean;
    lastExamMean: number;
  }>({
    code: item?.code || '',
    name: item?.name || '',
    department: item?.department || 'Sciences',
    entered: item?.entered || false,
    lastExamMean: item?.lastExamMean || 0,
  });

  return (
    <div>
      <h3 className="text-h3 text-primary mb-4">{item ? 'Edit Subject' : 'Add Subject'}</h3>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Code" value={form.code} onChange={v => setForm({...form, code: String(v).toUpperCase()})} required />
          <Field label="Name" value={form.name} onChange={v => setForm({...form, name: String(v)})} required />
          <Field label="Department" type="select" value={form.department} onChange={v => setForm({...form, department: String(v) as 'Sciences' | 'Languages' | 'Humanities' | 'Technicals' | 'Mathematics'})} options={['Sciences', 'Languages', 'Humanities', 'Technicals', 'Mathematics']} required />
          <Field label="Last Exam Mean" type="number" value={form.lastExamMean} onChange={v => setForm({...form, lastExamMean: parseFloat(String(v)) || 0})} step="0.1" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="entered" checked={form.entered} onChange={e => setForm({...form, entered: e.target.checked})} className="accent-brand" />
          <label htmlFor="entered" className="text-body text-secondary">Subject Entered</label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base">Save</button>
        </div>
      </form>
    </div>
  );
}

interface ClassFormProps {
  item: Class | undefined;
  students: Student[];
  onSave: (data: Partial<Class>) => void;
  onClose: () => void;
}

function ClassForm({ item, students, onSave, onClose }: ClassFormProps) {
  const [form, setForm] = useState<{
    name: string;
    stream: string;
    teacherId: string;
    studentIds: string[];
  }>({
    name: item?.name || '',
    stream: item?.stream || 'Form 4 East',
    teacherId: item?.teacherId || 'teacher-1',
    studentIds: item?.studentIds || [],
  });

  return (
    <div>
      <h3 className="text-h3 text-primary mb-4">{item ? 'Edit Class' : 'Add Class'}</h3>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={v => setForm({...form, name: String(v)})} required />
          <Field label="Stream" value={form.stream} onChange={v => setForm({...form, stream: String(v)})} required />
          <Field label="Teacher ID" value={form.teacherId} onChange={v => setForm({...form, teacherId: String(v)})} required />
        </div>
        <Field label="Students" type="multiselect" value={form.studentIds} onChange={v => setForm({...form, studentIds: v as string[]})} options={students.map(s => ({ value: s.id, label: `${s.admNo} - ${s.name}` }))} />
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base">Save</button>
        </div>
      </form>
    </div>
  );
}

interface ExamFormProps {
  item: Exam | undefined;
  classes: Class[];
  subjects: Subject[];
  onSave: (data: Partial<Exam>) => void;
  onClose: () => void;
}

function ExamForm({ item, classes, subjects, onSave, onClose }: ExamFormProps) {
  const [form, setForm] = useState<{
    name: string;
    classId: string;
    term: string;
    academicYear: string;
    date: string;
    subjectIds: string[];
    isActive: boolean;
  }>({
    name: item?.name || '',
    classId: item?.classId || classes[0]?.id || '',
    term: item?.term || 'Term 1',
    academicYear: item?.academicYear || new Date().getFullYear().toString(),
    date: item?.date || new Date().toISOString().slice(0, 10),
    subjectIds: item?.subjectIds || subjects.map(s => s.id),
    isActive: item?.isActive ?? true,
  });

  return (
    <div>
      <h3 className="text-h3 text-primary mb-4">{item ? 'Edit Exam' : 'Add Exam'}</h3>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={v => setForm({...form, name: String(v)})} required />
          <Field label="Class" type="select" value={form.classId} onChange={v => setForm({...form, classId: String(v)})} options={classes.map(c => ({ value: c.id, label: c.name }))} required />
          <Field label="Term" value={form.term} onChange={v => setForm({...form, term: String(v)})} required />
          <Field label="Academic Year" value={form.academicYear} onChange={v => setForm({...form, academicYear: String(v)})} required />
          <Field label="Date" type="date" value={form.date} onChange={v => setForm({...form, date: String(v)})} required />
        </div>
        <Field label="Subjects" type="multiselect" value={form.subjectIds} onChange={v => setForm({...form, subjectIds: v as string[]})} options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="accent-brand" />
          <label htmlFor="isActive" className="text-body text-secondary">Active Exam</label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base">Save</button>
        </div>
      </form>
    </div>
  );
}

type SelectOption = { value: string; label: string } | string;

interface FieldProps {
  label: string;
  value: string | number | string[] | boolean;
  onChange: (v: string | number | string[] | boolean) => void;
  type?: 'text' | 'select' | 'number' | 'date' | 'multiselect';
  required?: boolean;
  options?: SelectOption[];
  step?: string;
}

function Field({ label, value, onChange, type = 'text', required, options, step, ...props }: FieldProps) {
  const stringValue = typeof value === 'number' ? String(value) : typeof value === 'boolean' ? String(value) : Array.isArray(value) ? '' : value;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-label text-tertiary uppercase tracking-wider">{label}{required && <span className="text-error ml-1">*</span>}</label>
      {type === 'select' ? (
        <select value={String(value)} onChange={e => onChange(e.target.value)} className="px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring" {...props}>
          {options?.map(opt => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : type === 'multiselect' ? (
        <div className="bg-surface border border-hairline rounded-sm max-h-40 overflow-y-auto p-2">
          {options?.map(opt => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const checked = Array.isArray(value) && value.includes(optValue);
            return (
              <label key={optValue} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" value={optValue} checked={checked} onChange={e => onChange(e.target.checked ? [...(Array.isArray(value) ? value : []), optValue] : (Array.isArray(value) ? value : []).filter((v: string) => v !== optValue))} className="accent-brand" />
                <span className="text-body text-primary">{optLabel}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <input
          type={type}
          value={stringValue}
          onChange={e => onChange(e.target.value)}
          step={step}
          className="px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring"
          {...props}
        />
      )}
    </div>
  );
}