import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Student, Subject, Class, Exam, MarksRecord, SchoolConfig,
  StudentCalculation, SubjectDepartmentalStat, ClassStats,
  GradeDistributionTier, BackupData, CSVImportResult,
  MarkValue
} from '../types';
import { getDB } from './db';
import {
  computeStudentCalculations,
  computeSubjectStats,
  computeGradeDistribution,
  getNearTheLineStudents,
  getStrongestSubject,
  getWeakestSubject,
  rankStudents,
} from './ranking';
import { parseMarkValue } from './kcse';

type MarksMap = Record<string, Record<string, Record<string, MarkValue>>>;

interface AppState {
  // UI State
  activeView: string;
  setActiveView: (view: string) => void;
  activeClassId: string | null;
  setActiveClassId: (id: string | null) => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Data
  schoolConfig: SchoolConfig;
  students: Student[];
  subjects: Subject[];
  classes: Class[];
  exams: Exam[];
  marks: MarksMap;

  // Computed
  filteredStudents: Student[];
  rankings: StudentCalculation[];
  classStats: ClassStats;
  subjectStats: SubjectDepartmentalStat[];
  gradeDistribution: GradeDistributionTier[];
  nearTheLineStudents: StudentCalculation[];
  strongestSubject: { name: string; average: number } | undefined;
  weakestSubject: { name: string; average: number } | undefined;

  // Sync
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingSyncCount: number;

  // Actions
  initializeApp: () => Promise<void>;
  refreshComputed: () => void;

  // School Config
  setSchoolConfig: (config: Partial<SchoolConfig>) => Promise<void>;

  // Students
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStudent: (student: Student) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  importStudentsFromCSV: (csv: string) => Promise<CSVImportResult>;

  // Subjects
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSubject: (subject: Subject) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;

  // Classes
  addClass: (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateClass: (classData: Class) => Promise<void>;
  removeClass: (id: string) => Promise<void>;

  // Exams
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExam: (exam: Exam) => Promise<void>;
  removeExam: (id: string) => Promise<void>;

  // Marks
  updateMark: (examId: string, studentId: string, subjectCode: string, value: MarkValue) => Promise<void>;
  batchUpdateMarks: (examId: string, updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => Promise<void>;
  importMarksFromCSV: (examId: string, csv: string) => Promise<CSVImportResult>;

  // Backup/Restore
  exportBackup: () => Promise<void>;
  restoreBackup: (json: string) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;

  // Sync
  refreshSyncCount: () => Promise<void>;
}

const DEFAULT_CONFIG: SchoolConfig = {
  id: 'main',
  name: 'Chokur System',
  code: 'CHK001',
  address: 'P.O. Box 123, Nakuru, Kenya',
  phone: '+254 700 000 000',
  email: 'info@chokur.system',
  principal: 'Principal Name',
  logo: '',
  gradingSystem: 'KCSE-12',
  calculationMethod: 'best7',
  passMark: 55,
  updatedAt: Date.now(),
};

const DEMO_SUBJECTS: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { code: 'MAT', name: 'Mathematics', department: 'Mathematics', entered: true, lastExamMean: 62.5 },
  { code: 'ENG', name: 'English', department: 'Languages', entered: true, lastExamMean: 65.2 },
  { code: 'KIS', name: 'Kiswahili', department: 'Languages', entered: true, lastExamMean: 63.8 },
  { code: 'BIO', name: 'Biology', department: 'Sciences', entered: true, lastExamMean: 58.4 },
  { code: 'CHE', name: 'Chemistry', department: 'Sciences', entered: true, lastExamMean: 56.1 },
  { code: 'PHY', name: 'Physics', department: 'Sciences', entered: true, lastExamMean: 54.7 },
  { code: 'HIS', name: 'History', department: 'Humanities', entered: true, lastExamMean: 67.3 },
  { code: 'GEO', name: 'Geography', department: 'Humanities', entered: true, lastExamMean: 64.9 },
  { code: 'CRE', name: 'CRE', department: 'Humanities', entered: true, lastExamMean: 71.2 },
  { code: 'BST', name: 'Business Studies', department: 'Technicals', entered: true, lastExamMean: 59.8 },
];

const DEMO_STUDENTS: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { admNo: '3801', name: 'Alice Wanjiku', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 385, status: 'Active' },
  { admNo: '3802', name: 'Brian Otieno', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 372, status: 'Active' },
  { admNo: '3803', name: 'Cynthia Cherono', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 368, status: 'Active' },
  { admNo: '3804', name: 'David Kiprop', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 355, status: 'Active' },
  { admNo: '3805', name: 'Esther Muthoni', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 348, status: 'Active' },
  { admNo: '3806', name: 'Francis Kibet', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 342, status: 'Active' },
  { admNo: '3807', name: 'Grace Njeri', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 335, status: 'Active' },
  { admNo: '3808', name: 'Henry Mutua', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 328, status: 'Active' },
  { admNo: '3809', name: 'Irene Chepkemoi', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 322, status: 'Active' },
  { admNo: '3810', name: 'James Omondi', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 315, status: 'Active' },
];

const DEMO_MARKS: Record<string, Record<string, MarkValue>> = {
  '3801': { MAT: 85, ENG: 78, KIS: 82, BIO: 75, CHE: 72, PHY: 70, HIS: 80, GEO: 77, CRE: 88, BST: 74 },
  '3802': { MAT: 78, ENG: 72, KIS: 75, BIO: 68, CHE: 65, PHY: 62, HIS: 75, GEO: 70, CRE: 82, BST: 68 },
  '3803': { MAT: 82, ENG: 85, KIS: 79, BIO: 78, CHE: 74, PHY: 71, HIS: 82, GEO: 79, CRE: 85, BST: 76 },
  '3804': { MAT: 70, ENG: 68, KIS: 72, BIO: 62, CHE: 58, PHY: 55, HIS: 70, GEO: 65, CRE: 75, BST: 62 },
  '3805': { MAT: 88, ENG: 80, KIS: 84, BIO: 80, CHE: 78, PHY: 75, HIS: 84, GEO: 81, CRE: 88, BST: 79 },
  '3806': { MAT: 65, ENG: 62, KIS: 68, BIO: 58, CHE: 52, PHY: 48, HIS: 65, GEO: 60, CRE: 70, BST: 58 },
  '3807': { MAT: 75, ENG: 78, KIS: 74, BIO: 70, CHE: 68, PHY: 65, HIS: 78, GEO: 74, CRE: 80, BST: 72 },
  '3808': { MAT: 68, ENG: 65, KIS: 70, BIO: 60, CHE: 55, PHY: 50, HIS: 68, GEO: 62, CRE: 72, BST: 60 },
  '3809': { MAT: 72, ENG: 75, KIS: 71, BIO: 65, CHE: 62, PHY: 58, HIS: 74, GEO: 68, CRE: 78, BST: 66 },
  '3810': { MAT: 60, ENG: 58, KIS: 62, BIO: 52, CHE: 48, PHY: 45, HIS: 60, GEO: 55, CRE: 65, BST: 52 },
};

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseCSV(csv: string): string[][] {
  const lines = csv.trim().split(/\r?\n/);
  return lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      activeView: 'overview',
      setActiveView: (view) => set({ activeView: view }),
      activeClassId: null,
      setActiveClassId: (id) => {
        set({ activeClassId: id, activeExamId: null });
        get().refreshComputed();
      },
      activeExamId: null,
      setActiveExamId: (id) => {
        set({ activeExamId: id });
        get().refreshComputed();
      },
      selectedStudentId: null,
      setSelectedStudentId: (id) => set({ selectedStudentId: id }),

      // Data
      schoolConfig: DEFAULT_CONFIG,
      students: [],
      subjects: [],
      classes: [],
      exams: [],
      marks: {},

      // Computed
      filteredStudents: [],
      rankings: [],
      classStats: { classAverage: 0, passRate: 0, meanGrade: 'E', highestAggregate: 0, lowestAggregate: 0 },
      subjectStats: [],
      gradeDistribution: [],
      nearTheLineStudents: [],
      strongestSubject: undefined,
      weakestSubject: undefined,

      // Sync
      syncStatus: 'idle',
      pendingSyncCount: 0,

      // Actions
      initializeApp: async () => {
        const db = await getDB();
        const version = await db.get('schemaVersion', 'version');
        if (!version) {
          await get().resetToDemoData();
          await db.put('schemaVersion', { version: 2 });
        } else {
          const [config, students, subjects, classes, exams, allMarks] = await Promise.all([
            db.get('schoolConfig', 'main'),
            db.getAll('students'),
            db.getAll('subjects'),
            db.getAll('classes'),
            db.getAll('exams'),
            db.getAll('marks'),
          ]);
          const marksMap: MarksMap = {};
          for (const m of allMarks) {
            if (!marksMap[m.examId]) marksMap[m.examId] = {};
            marksMap[m.examId][m.studentId] = m.marks;
          }
          set({
            schoolConfig: config || DEFAULT_CONFIG,
            students,
            subjects,
            classes,
            exams,
            marks: marksMap,
          });
          get().refreshComputed();
        }
      },

      refreshComputed: () => {
        const { activeClassId, activeExamId, students, subjects, classes, exams, marks, schoolConfig } = get();
        if (!activeClassId || !activeExamId) {
          set({
            filteredStudents: [],
            rankings: [],
            classStats: { classAverage: 0, passRate: 0, meanGrade: 'E', highestAggregate: 0, lowestAggregate: 0 },
            subjectStats: [],
            gradeDistribution: [],
            nearTheLineStudents: [],
            strongestSubject: undefined,
            weakestSubject: undefined,
          });
          return;
        }

        const classData = classes.find((c) => c.id === activeClassId);
        const stream = classData?.stream || 'Form 4 East';
        const classStudents = students.filter(s => s.stream === stream && s.status === 'Active');
        const examMarks = marks[activeExamId] || {};

        const calculations = computeStudentCalculations(classStudents, subjects, examMarks, activeExamId);
        const ranked = rankStudents(calculations);

        const classAverage = ranked.length > 0
          ? Math.round(ranked.reduce((a, b) => a + b.meanPoints, 0) / ranked.length * 10) / 10
          : 0;
        const passRate = ranked.length > 0
          ? Math.round(ranked.filter(r => r.qualifies).length / ranked.length * 100)
          : 0;
        const meanGrade = ranked.length > 0
          ? (() => {
              const avgPoints = ranked.reduce((a, b) => a + b.meanPoints, 0) / ranked.length;
              if (avgPoints >= 11.5) return 'A';
              if (avgPoints >= 10.5) return 'A-';
              if (avgPoints >= 9.5) return 'B+';
              if (avgPoints >= 8.5) return 'B';
              if (avgPoints >= 7.5) return 'B-';
              if (avgPoints >= 6.5) return 'C+';
              if (avgPoints >= 5.5) return 'C';
              if (avgPoints >= 4.5) return 'C-';
              if (avgPoints >= 3.5) return 'D+';
              if (avgPoints >= 2.5) return 'D';
              if (avgPoints >= 1.5) return 'D-';
              return 'E';
            })()
          : 'E';

        const subjectStats = computeSubjectStats(classStudents, subjects, examMarks, activeExamId);
        const gradeDistribution = computeGradeDistribution(ranked);
        const nearTheLineStudents = getNearTheLineStudents(ranked);
        const strongestSubject = getStrongestSubject(subjectStats);
        const weakestSubject = getWeakestSubject(subjectStats);

        set({
          filteredStudents: classStudents,
          rankings: ranked,
          classStats: {
            classAverage,
            passRate,
            meanGrade,
            highestAggregate: ranked.length > 0 ? Math.max(...ranked.map(r => r.aggregate)) : 0,
            lowestAggregate: ranked.length > 0 ? Math.min(...ranked.map(r => r.aggregate)) : 0,
          },
          subjectStats,
          gradeDistribution,
          nearTheLineStudents,
          strongestSubject,
          weakestSubject,
        });
      },

      setSchoolConfig: async (config) => {
        const db = await getDB();
        const newConfig = { ...get().schoolConfig, ...config, updatedAt: Date.now() };
        await db.put('schoolConfig', newConfig);
        set({ schoolConfig: newConfig });
        get().refreshComputed();
      },

      addStudent: async (student) => {
        const db = await getDB();
        const id = generateId('s');
        const newStudent: Student = { ...student, id, createdAt: Date.now(), updatedAt: Date.now() };
        await db.add('students', newStudent);
        set(state => ({ students: [...state.students, newStudent] }));
        get().refreshComputed();
        return id;
      },

      updateStudent: async (student) => {
        const db = await getDB();
        const updated = { ...student, updatedAt: Date.now() };
        await db.put('students', updated);
        set(state => ({ students: state.students.map(s => s.id === student.id ? updated : s) }));
        get().refreshComputed();
      },

      removeStudent: async (id) => {
        const db = await getDB();
        await db.delete('students', id);
        await db.delete('marks', [get().activeExamId || '', id]);
        set(state => ({ students: state.students.filter(s => s.id !== id) }));
        get().refreshComputed();
      },

      importStudentsFromCSV: async (csv) => {
        const rows = parseCSV(csv);
        if (rows.length < 2) return { success: 0, errors: ['Empty CSV'] };
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const admIdx = headers.findIndex(h => h.includes('adm'));
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const streamIdx = headers.findIndex(h => h.includes('stream'));
        const genderIdx = headers.findIndex(h => h.includes('gender'));
        const kcpeIdx = headers.findIndex(h => h.includes('kcpe'));

        if (admIdx === -1 || nameIdx === -1) {
          return { success: 0, errors: ['Missing AdmNo or Name column'] };
        }

        const existingAdm = new Set(get().students.map(s => s.admNo.toLowerCase()));
        let success = 0;
        const errors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const admNo = row[admIdx]?.trim();
          const name = row[nameIdx]?.trim();
          if (!admNo || !name) {
            errors.push(`Row ${i + 1}: Missing admNo or name`);
            continue;
          }
          if (existingAdm.has(admNo.toLowerCase())) {
            errors.push(`Row ${i + 1}: Duplicate AdmNo ${admNo}`);
            continue;
          }
          try {
            await get().addStudent({
              admNo,
              name,
              stream: row[streamIdx]?.trim() || get().classes.find(c => c.id === get().activeClassId)?.stream || 'Form 4 East',
              gender: (row[genderIdx]?.trim() as 'Male' | 'Female') || 'Female',
              kcpeMarks: parseInt(row[kcpeIdx] || '300', 10),
              status: 'Active',
            });
            existingAdm.add(admNo.toLowerCase());
            success++;
          } catch (e) {
            errors.push(`Row ${i + 1}: ${e}`);
          }
        }
        return { success, errors };
      },

      addSubject: async (subject) => {
        const db = await getDB();
        const id = generateId('sub');
        const newSubject: Subject = { ...subject, id, createdAt: Date.now(), updatedAt: Date.now() };
        await db.add('subjects', newSubject);
        set(state => ({ subjects: [...state.subjects, newSubject] }));
        get().refreshComputed();
        return id;
      },

      updateSubject: async (subject) => {
        const db = await getDB();
        const updated = { ...subject, updatedAt: Date.now() };
        await db.put('subjects', updated);
        set(state => ({ subjects: state.subjects.map(s => s.id === subject.id ? updated : s) }));
        get().refreshComputed();
      },

      removeSubject: async (id) => {
        const db = await getDB();
        await db.delete('subjects', id);
        set(state => ({ subjects: state.subjects.filter(s => s.id !== id) }));
        get().refreshComputed();
      },

      addClass: async (classData) => {
        const db = await getDB();
        const id = generateId('class');
        const newClass: Class = { ...classData, id, createdAt: Date.now(), updatedAt: Date.now() };
        await db.add('classes', newClass);
        set(state => ({ classes: [...state.classes, newClass] }));
        return id;
      },

      updateClass: async (classData) => {
        const db = await getDB();
        const updated = { ...classData, updatedAt: Date.now() };
        await db.put('classes', updated);
        set(state => ({ classes: state.classes.map(c => c.id === classData.id ? updated : c) }));
        get().refreshComputed();
      },

      removeClass: async (id) => {
        const db = await getDB();
        const classData = get().classes.find(c => c.id === id);
        if (classData) {
          await db.delete('classes', id);
          for (const studentId of classData.studentIds) {
            await db.delete('students', studentId);
          }
          set(state => ({
            classes: state.classes.filter(c => c.id !== id),
            students: state.students.filter(s => !classData.studentIds.includes(s.id)),
          }));
          get().refreshComputed();
        }
      },

      addExam: async (exam) => {
        const db = await getDB();
        const id = generateId('exam');
        const newExam: Exam = { ...exam, id, createdAt: Date.now(), updatedAt: Date.now() };
        await db.add('exams', newExam);
        set(state => ({ exams: [...state.exams, newExam] }));
        return id;
      },

      updateExam: async (exam) => {
        const db = await getDB();
        const updated = { ...exam, updatedAt: Date.now() };
        await db.put('exams', updated);
        set(state => ({ exams: state.exams.map(e => e.id === exam.id ? updated : e) }));
        get().refreshComputed();
      },

      removeExam: async (id) => {
        const db = await getDB();
        await db.delete('exams', id);
        const marks = get().marks;
        if (marks[id]) delete marks[id];
        set({ marks });
        if (get().activeExamId === id) set({ activeExamId: null });
        get().refreshComputed();
      },

      updateMark: async (examId, studentId, subjectCode, value) => {
        const db = await getDB();
        const marks = get().marks;
        if (!marks[examId]) marks[examId] = {};
        if (!marks[examId][studentId]) marks[examId][studentId] = {};
        marks[examId][studentId][subjectCode] = value;
        await db.put('marks', { examId, studentId, marks: marks[examId][studentId], updatedAt: Date.now() });
        set({ marks });
        get().refreshComputed();
      },

      batchUpdateMarks: async (examId, updates) => {
        const db = await getDB();
        const marks = get().marks;
        if (!marks[examId]) marks[examId] = {};
        for (const { studentId, subjectCode, value } of updates) {
          if (!marks[examId][studentId]) marks[examId][studentId] = {};
          marks[examId][studentId][subjectCode] = value;
          await db.put('marks', { examId, studentId, marks: marks[examId][studentId], updatedAt: Date.now() });
        }
        set({ marks });
        get().refreshComputed();
      },

      importMarksFromCSV: async (examId, csv) => {
        const rows = parseCSV(csv);
        if (rows.length < 2) return { success: 0, errors: ['Empty CSV'] };
        const headers = rows[0].map(h => h.trim());
        const admIdx = headers.findIndex(h => h.toLowerCase().includes('adm'));
        if (admIdx === -1) return { success: 0, errors: ['Missing AdmNo column'] };

        const subjectIndices: Record<string, number> = {};
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i].toUpperCase();
          if (h !== 'ADMNO' && h !== 'ADM NO' && h !== 'NAME') {
            subjectIndices[h] = i;
          }
        }

        const students = get().students;
        const admToStudent = new Map(students.map(s => [s.admNo.toLowerCase(), s.id]));
        let success = 0;
        const errors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const admNo = row[admIdx]?.trim();
          if (!admNo) {
            errors.push(`Row ${i + 1}: Missing AdmNo`);
            continue;
          }
          const studentId = admToStudent.get(admNo.toLowerCase());
          if (!studentId) {
            errors.push(`Row ${i + 1}: Student with AdmNo ${admNo} not found`);
            continue;
          }

          const updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }> = [];
          for (const [code, idx] of Object.entries(subjectIndices)) {
            const val = row[idx]?.trim();
            if (val === '') continue;
            const parsed = parseMarkValue(val);
            if (parsed !== null) {
              updates.push({ studentId, subjectCode: code, value: parsed });
            }
          }

          if (updates.length > 0) {
            await get().batchUpdateMarks(examId, updates);
            success++;
          }
        }
        return { success, errors };
      },

      exportBackup: async () => {
        const { schoolConfig, students, subjects, classes, exams, marks } = get();
        const backup: BackupData = {
          version: 1,
          date: new Date().toISOString(),
          schoolConfig,
          students,
          subjects,
          exams,
          classes,
          marks,
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chokur-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      restoreBackup: async (json) => {
        try {
          const backup: BackupData = JSON.parse(json);
          const db = await getDB();
          const tx = db.transaction(['schoolConfig', 'students', 'subjects', 'classes', 'exams', 'marks', 'schemaVersion'], 'readwrite');
          await tx.objectStore('schoolConfig').put(backup.schoolConfig);
          for (const s of backup.students) await tx.objectStore('students').put(s);
          for (const s of backup.subjects) await tx.objectStore('subjects').put(s);
          for (const c of backup.classes) await tx.objectStore('classes').put(c);
          for (const e of backup.exams) await tx.objectStore('exams').put(e);
          for (const [examId, studentMarks] of Object.entries(backup.marks)) {
            for (const [studentId, marks] of Object.entries(studentMarks)) {
              await tx.objectStore('marks').put({ examId, studentId, marks, updatedAt: Date.now() });
            }
          }
          await tx.done;

          await get().initializeApp();
          return true;
        } catch {
          return false;
        }
      },

      resetToDemoData: async () => {
        const db = await getDB();
        await Promise.all([
          db.clear('schoolConfig'),
          db.clear('students'),
          db.clear('subjects'),
          db.clear('classes'),
          db.clear('exams'),
          db.clear('marks'),
        ]);

        const now = Date.now();
        const config = { ...DEFAULT_CONFIG, updatedAt: now };
        await db.put('schoolConfig', config);

        const subjects = DEMO_SUBJECTS.map(s => ({ ...s, id: generateId('sub'), createdAt: now, updatedAt: now }));
        for (const s of subjects) await db.put('subjects', s);

        const students = DEMO_STUDENTS.map(s => ({ ...s, id: generateId('s'), createdAt: now, updatedAt: now }));
        for (const s of students) await db.put('students', s);

        const classData: Class = {
          id: generateId('class'),
          name: 'Form 4',
          stream: 'Form 4 East',
          teacherId: 'teacher-1',
          studentIds: students.map(s => s.id),
          createdAt: now,
          updatedAt: now,
        };
        await db.put('classes', classData);

        const examData: Exam = {
          id: generateId('exam'),
          name: 'Term 1 Midterm',
          classId: classData.id,
          term: 'Term 1',
          academicYear: new Date().getFullYear().toString(),
          date: new Date().toISOString().slice(0, 10),
          subjectIds: subjects.map(s => s.id),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        await db.put('exams', examData);

        const marksMap: MarksMap = {};
        for (const [admNo, marks] of Object.entries(DEMO_MARKS)) {
          const student = students.find(s => s.admNo === admNo);
          if (student) {
            if (!marksMap[examData.id]) marksMap[examData.id] = {};
            marksMap[examData.id][student.id] = marks;
            await db.put('marks', { examId: examData.id, studentId: student.id, marks, updatedAt: now });
          }
        }

        set({
          schoolConfig: config,
          students,
          subjects,
          classes: [classData],
          exams: [examData],
          marks: marksMap,
        });
        get().refreshComputed();
      },

      refreshSyncCount: async () => {
        const db = await getDB();
        const count = await db.countFromIndex('syncQueue', 'by-synced', 'false');
        set({ pendingSyncCount: count });
      },
    }),
    {
      name: 'chokur-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeView: state.activeView,
        activeClassId: state.activeClassId,
        activeExamId: state.activeExamId,
        selectedStudentId: state.selectedStudentId,
      }),
    }
  )
);