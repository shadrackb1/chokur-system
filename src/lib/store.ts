import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Student,
  Subject,
  SchoolConfig,
  Exam,
  Class,
  MarkValue,
  StudentCalculation,
  ViewType,
  CalculationMethod,
} from '../types';
import { rankAllStudents, RankingInput } from '../lib/ranking';
import { parseMarksCSV } from '../utils/grading';
import {
  schoolConfigRepo,
  studentsRepo,
  subjectsRepo,
  examsRepo,
  marksRepo,
  classesRepo,
  settingsRepo,
  schemaVersionRepo,
  clearAllData,
  getDB,
} from '../lib/db';
import { INITIAL_SCHOOL_CONFIG, INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_MARKS } from '../data/initialData';

// App State
interface AppState {
  // UI State
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Active context
  activeClassId: string | null;
  setActiveClassId: (id: string | null) => void;

  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;

  // Data
  schoolConfig: SchoolConfig;
  setSchoolConfig: (config: Partial<SchoolConfig>) => Promise<void>;

  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  classes: Class[];
  marks: Record<string, Record<string, Record<string, MarkValue>>>; // [examId][studentId][subjectCode]

  // Computed (derived from active context)
  filteredStudents: Student[];
  rankings: StudentCalculation[];
  classStats: {
    classAverage: number;
    passRate: number;
    meanGrade: string;
    highestAggregate: number;
    lowestAggregate: number;
  };
  subjectStats: Array<{
    subject: Subject;
    average: number;
    highest: number;
    lowest: number;
    passRate: number;
    entered: number;
    diffFromLastExam: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    pointsEquivalent: number;
    studentCount: number;
    cohortShare: number;
    cumulativePercentage: number;
  }>;
  nearTheLineStudents: StudentCalculation[];
  strongestSubject?: { name: string; average: number };
  weakestSubject?: { name: string; average: number };

  // Actions
  initializeApp: () => Promise<void>;
  refreshComputed: () => void;

  // Student mutations
  addStudent: (student: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (student: Student) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  importStudentsFromCSV: (csvContent: string) => Promise<{ success: number; errors: string[] }>;

  // Subject mutations
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<string>;
  updateSubject: (subject: Subject) => Promise<void>;
  removeSubject: (subjectId: string) => Promise<void>;

  // Exam mutations
  addExam: (exam: Omit<Exam, 'id'>) => Promise<string>;
  updateExam: (exam: Exam) => Promise<void>;
  removeExam: (examId: string) => Promise<void>;

  // Class mutations
  addClass: (classData: Omit<Class, 'id'>) => Promise<string>;
  updateClass: (classData: Class) => Promise<void>;
  removeClass: (classId: string) => Promise<void>;

  // Marks mutations
  updateMark: (examId: string, studentId: string, subjectCode: string, value: MarkValue) => Promise<void>;
  batchUpdateMarks: (examId: string, updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => Promise<void>;
  importMarksFromCSV: (examId: string, csvContent: string) => Promise<{ success: number; errors: string[] }>;

  // Backup/Restore
  exportBackup: () => Promise<void>;
  restoreBackup: (jsonString: string) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;

  // Sync
  syncStatus: 'idle' | 'syncing' | 'synced' | 'offline' | 'failed';
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'offline' | 'failed') => void;
  pendingSyncCount: number;
  refreshSyncCount: () => Promise<void>;
}

// Initial state
const initialSchoolConfig: SchoolConfig = INITIAL_SCHOOL_CONFIG;
const initialStudents: Student[] = INITIAL_STUDENTS;
const initialSubjects: Subject[] = INITIAL_SUBJECTS;
const initialMarks: Record<string, Record<string, MarkValue>> = INITIAL_MARKS;

// Helper to convert DB records to app types
function convertStudentRecord(record: any): Student {
  return {
    id: record.id,
    admNo: record.admNo,
    name: record.name,
    stream: record.stream,
    gender: record.gender,
    kcpeMarks: record.kcpeMarks,
    status: record.status,
  };
}

function convertSubjectRecord(record: any): Subject {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    department: record.department,
    entered: record.entered,
    lastExamMean: record.lastExamMean,
  };
}

function convertExamRecord(record: any): Exam {
  return {
    id: record.id,
    name: record.name,
    classId: record.classId,
    term: record.term,
    academicYear: record.academicYear,
    date: record.date,
    subjectIds: record.subjectIds,
    isActive: record.isActive,
  };
}

function convertClassRecord(record: any): Class {
  return {
    id: record.id,
    name: record.name,
    stream: record.stream,
    teacherId: record.teacherId,
    studentIds: record.studentIds,
  };
}

// Create the store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      activeView: 'overview',
      setActiveView: (view) => set({ activeView: view }),

      selectedStudentId: null,
      setSelectedStudentId: (id) => set({ selectedStudentId: id }),

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

      // Data
      schoolConfig: initialSchoolConfig,
      students: initialStudents,
      subjects: initialSubjects,
      exams: [],
      classes: [],
      marks: {} as Record<string, Record<string, Record<string, MarkValue>>>,

      // Computed (initialized empty)
      filteredStudents: [],
      rankings: [],
      classStats: { classAverage: 0, passRate: 0, meanGrade: 'E', highestAggregate: 0, lowestAggregate: 0 },
      subjectStats: [],
      gradeDistribution: [],
      nearTheLineStudents: [],
      strongestSubject: undefined,
      weakestSubject: undefined,

      // Initialize app
      initializeApp: async () => {
        const db = await getDB();
        const version = await schemaVersionRepo.get();

        if (version === 0) {
          // First run - seed data
          await seedInitialData();
          await schemaVersionRepo.set(1);
        } else {
          // Load from IndexedDB
          await loadFromDB();
        }

        // Set default active class/exam if not set
        const state = get();
        if (!state.activeClassId && state.classes.length > 0) {
          set({ activeClassId: state.classes[0].id });
        }
        if (!state.activeExamId && state.activeClassId && state.exams.length > 0) {
          const classExams = state.exams.filter(e => e.classId === state.activeClassId && e.isActive);
          if (classExams.length > 0) {
            set({ activeExamId: classExams[0].id });
          }
        }

        get().refreshComputed();
        get().refreshSyncCount();
      },

      refreshComputed: () => {
        const state = get();
        const { activeClassId, activeExamId, students, subjects, marks, schoolConfig } = state;

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

        // Filter students by active class stream
        const classRecord = state.classes.find(c => c.id === activeClassId);
        const stream = classRecord?.stream || 'Form 4 East';

        const filteredStudents = students.filter(s => s.stream === stream && s.status === 'Active');

        // Get marks for active exam
        const examMarks: Record<string, Record<string, MarkValue>> = {};
        for (const student of filteredStudents) {
          const studentMarks = marks[activeExamId]?.[student.id] || {};
          examMarks[student.id] = studentMarks;
        }

        // Build ranking inputs
        const rankingInputs: RankingInput[] = filteredStudents.map(student => ({
          student,
          marks: examMarks[student.id] || {},
          subjects,
          calculationMethod: schoolConfig.calculationMethod,
        }));

        // Compute rankings
        const rankings = rankAllStudents(rankingInputs);

        // Class stats
        const classStats = {
          classAverage: rankings.length > 0
            ? Math.round((rankings.reduce((sum, r) => sum + r.average, 0) / rankings.length) * 10) / 10
            : 0,
          passRate: rankings.length > 0
            ? Math.round((rankings.filter(r => r.qualifies).length / rankings.length) * 100)
            : 0,
          meanGrade: rankings.length > 0
            ? (() => {
                const totalMeanPoints = rankings.reduce((sum, r) => sum + r.meanPoints, 0);
                const avgMeanPoints = totalMeanPoints / rankings.length;
                // Simple grade from points
                if (avgMeanPoints >= 11.5) return 'A';
                if (avgMeanPoints >= 10.5) return 'A-';
                if (avgMeanPoints >= 9.5) return 'B+';
                if (avgMeanPoints >= 8.5) return 'B';
                if (avgMeanPoints >= 7.5) return 'B-';
                if (avgMeanPoints >= 6.5) return 'C+';
                if (avgMeanPoints >= 5.5) return 'C';
                if (avgMeanPoints >= 4.5) return 'C-';
                if (avgMeanPoints >= 3.5) return 'D+';
                if (avgMeanPoints >= 2.5) return 'D';
                if (avgMeanPoints >= 1.5) return 'D-';
                return 'E';
              })()
            : 'E',
          highestAggregate: rankings.length > 0 ? Math.max(...rankings.map(r => r.aggregate)) : 0,
          lowestAggregate: rankings.length > 0 ? Math.min(...rankings.map(r => r.aggregate)) : 0,
        };

        // Subject stats
        const subjectStats = subjects.map(subj => {
          const subjectScores: number[] = [];
          filteredStudents.forEach(student => {
            const val = examMarks[student.id]?.[subj.code];
            if (typeof val === 'number') {
              subjectScores.push(val);
            }
          });

          const entered = subjectScores.length;
          const total = subjectScores.reduce((acc, curr) => acc + curr, 0);
          const avg = entered > 0 ? Math.round((total / entered) * 10) / 10 : 0;
          const highest = entered > 0 ? Math.max(...subjectScores) : 0;
          const lowest = entered > 0 ? Math.min(...subjectScores) : 0;
          const passed = subjectScores.filter(s => s >= 55).length; // C+ threshold
          const rate = entered > 0 ? Math.round((passed / entered) * 100) : 0;
          const diffFromLastExam = Math.round((avg - subj.lastExamMean) * 10) / 10;

          return {
            subject: subj,
            average: avg,
            highest,
            lowest,
            passRate: rate,
            entered,
            diffFromLastExam,
          };
        }).sort((a, b) => b.average - a.average);

        // Grade distribution (12 tiers)
        const gradeDistribution = [
          { grade: 'A', pointsEquivalent: 12 },
          { grade: 'A-', pointsEquivalent: 11 },
          { grade: 'B+', pointsEquivalent: 10 },
          { grade: 'B', pointsEquivalent: 9 },
          { grade: 'B-', pointsEquivalent: 8 },
          { grade: 'C+', pointsEquivalent: 7 },
          { grade: 'C', pointsEquivalent: 6 },
          { grade: 'C-', pointsEquivalent: 5 },
          { grade: 'D+', pointsEquivalent: 4 },
          { grade: 'D', pointsEquivalent: 3 },
          { grade: 'D-', pointsEquivalent: 2 },
          { grade: 'E', pointsEquivalent: 1 },
        ].map((tier, idx, arr) => {
          const count = rankings.filter(r => r.meanGrade === tier.grade).length;
          const totalCount = rankings.length || 1;
          const share = Math.round((count / totalCount) * 1000) / 10;
          let cumulative = 0;
          for (let i = 0; i <= idx; i++) {
            const c = rankings.filter(r => r.meanGrade === arr[i].grade).length;
            cumulative += Math.round((c / totalCount) * 1000) / 10;
          }
          return {
            grade: tier.grade,
            pointsEquivalent: tier.pointsEquivalent,
            studentCount: count,
            cohortShare: share,
            cumulativePercentage: Math.min(100, Math.round(cumulative * 10) / 10),
          };
        });

        // Near the line (within 1.0 below 7.0)
        const nearTheLineStudents = rankings
          .filter(r => r.meanPoints < 7.0 && r.meanPoints >= 6.0)
          .sort((a, b) => b.meanPoints - a.meanPoints);

        // Strongest/weakest subject
        const strongestSubject = subjectStats.length > 0
          ? { name: subjectStats[0].subject.name, average: subjectStats[0].average }
          : undefined;
        const weakestSubject = subjectStats.length > 0
          ? { name: subjectStats[subjectStats.length - 1].subject.name, average: subjectStats[subjectStats.length - 1].average }
          : undefined;

        set({
          filteredStudents,
          rankings,
          classStats,
          subjectStats,
          gradeDistribution,
          nearTheLineStudents,
          strongestSubject,
          weakestSubject,
        });
      },

      // School config
      setSchoolConfig: async (config) => {
        const newConfig = { ...get().schoolConfig, ...config };
        await schoolConfigRepo.set({ ...newConfig, id: 'main', updatedAt: Date.now() });
        set({ schoolConfig: newConfig });
        get().refreshComputed();
      },

      // Student mutations
      addStudent: async (studentData) => {
        const newId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const student: Student = { ...studentData, id: newId };
        const now = Date.now();
        await studentsRepo.add({ ...student, createdAt: now, updatedAt: now });
        set(state => ({ students: [...state.students, student] }));
        get().refreshComputed();
        return newId;
      },

      updateStudent: async (student) => {
        await studentsRepo.update({ ...student, createdAt: Date.now(), updatedAt: Date.now() });
        set(state => ({
          students: state.students.map(s => s.id === student.id ? student : s),
        }));
        get().refreshComputed();
      },

      removeStudent: async (studentId) => {
        await studentsRepo.delete(studentId);
        await marksRepo.deleteByStudent(studentId);
        set(state => ({
          students: state.students.filter(s => s.id !== studentId),
        }));
        get().refreshComputed();
      },

      importStudentsFromCSV: async (csvContent) => {
        // Parse CSV and add students
        const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return { success: 0, errors: ['Empty CSV'] };

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const admIdx = headers.findIndex(h => h.includes('adm'));
        const nameIdx = headers.findIndex(h => h.includes('name'));

        if (admIdx === -1 || nameIdx === -1) {
          return { success: 0, errors: ['Missing AdmNo or Name column'] };
        }

        let success = 0;
        const errors: string[] = [];
        const existingAdmNos = new Set(get().students.map(s => s.admNo.toLowerCase()));

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length <= Math.max(admIdx, nameIdx)) continue;

          const admNo = cols[admIdx];
          const name = cols[nameIdx];

          if (!admNo || !name) {
            errors.push(`Row ${i + 1}: Missing admNo or name`);
            continue;
          }

          if (existingAdmNos.has(admNo.toLowerCase())) {
            errors.push(`Row ${i + 1}: Duplicate AdmNo ${admNo}`);
            continue;
          }

          try {
            await get().addStudent({
              admNo,
              name,
              stream: get().classes.find(c => c.id === get().activeClassId)?.stream || 'Form 4 East',
              gender: 'Female',
              kcpeMarks: 300,
              status: 'Active',
            });
            existingAdmNos.add(admNo.toLowerCase());
            success++;
          } catch (e) {
            errors.push(`Row ${i + 1}: ${e}`);
          }
        }

        return { success, errors };
      },

      // Subject mutations
      addSubject: async (subjectData) => {
        const newId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const subject: Subject = { ...subjectData, id: newId };
        const now = Date.now();
        await subjectsRepo.add({ ...subject, createdAt: now, updatedAt: now });
        set(state => ({ subjects: [...state.subjects, subject] }));
        get().refreshComputed();
        return newId;
      },

      updateSubject: async (subject) => {
        await subjectsRepo.update({ ...subject, createdAt: Date.now(), updatedAt: Date.now() });
        set(state => ({
          subjects: state.subjects.map(s => s.id === subject.id ? subject : s),
        }));
        get().refreshComputed();
      },

      removeSubject: async (subjectId) => {
        await subjectsRepo.delete(subjectId);
        set(state => ({
          subjects: state.subjects.filter(s => s.id !== subjectId),
        }));
        get().refreshComputed();
      },

      // Exam mutations
      addExam: async (examData) => {
        const newId = `exam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const exam: Exam = { ...examData, id: newId };
        const now = Date.now();
        await examsRepo.add({ ...exam, createdAt: now, updatedAt: now });
        set(state => ({ exams: [...state.exams, exam] }));
        return newId;
      },

      updateExam: async (exam) => {
        await examsRepo.update({ ...exam, createdAt: Date.now(), updatedAt: Date.now() });
        set(state => ({
          exams: state.exams.map(e => e.id === exam.id ? exam : e),
        }));
        get().refreshComputed();
      },

      removeExam: async (examId) => {
        await examsRepo.delete(examId);
        await marksRepo.deleteByExam(examId);
        set(state => ({
          exams: state.exams.filter(e => e.id !== examId),
        }));
        if (get().activeExamId === examId) {
          set({ activeExamId: null });
        }
        get().refreshComputed();
      },

      // Class mutations
      addClass: async (classData) => {
        const newId = `class-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const classRecord: Class = { ...classData, id: newId };
        const now = Date.now();
        await classesRepo.add({ ...classRecord, createdAt: now, updatedAt: now });
        set(state => ({ classes: [...state.classes, classRecord] }));
        return newId;
      },

      updateClass: async (classData) => {
        await classesRepo.update({ ...classData, createdAt: Date.now(), updatedAt: Date.now() });
        set(state => ({
          classes: state.classes.map(c => c.id === classData.id ? classData : c),
        }));
        get().refreshComputed();
      },

      removeClass: async (classId) => {
        await classesRepo.delete(classId);
        const deletedStudents = await studentsRepo.deleteByStream(
          get().classes.find(c => c.id === classId)?.stream || ''
        );
        set(state => ({
          classes: state.classes.filter(c => c.id !== classId),
          students: state.students.filter(s => s.stream !== get().classes.find(c => c.id === classId)?.stream),
        }));
        if (get().activeClassId === classId) {
          set({ activeClassId: null, activeExamId: null });
        }
        get().refreshComputed();
      },

      // Marks mutations
        updateMark: async (examId, studentId, subjectCode, value) => {
          const currentMarks = get().marks[examId]?.[studentId] || {};
          const newMarks = { ...currentMarks, [subjectCode]: value };

          await marksRepo.set(examId, studentId, newMarks);

          set(state => {
            const newMarksState = { ...state.marks };
            if (!newMarksState[examId]) newMarksState[examId] = {};
            newMarksState[examId] = {
              ...newMarksState[examId],
              [studentId]: newMarks,
            };
            return { marks: newMarksState };
          });
          get().refreshComputed();
        },

      batchUpdateMarks: async (examId, updates) => {
        const entries = updates.map(u => ({
          examId,
          studentId: u.studentId,
          marks: {
            ...(get().marks[examId]?.[u.studentId] || {}),
            [u.subjectCode]: u.value,
          },
        }));

        await marksRepo.setBatch(entries);

        set(state => {
          const newMarks = { ...state.marks };
          for (const entry of entries) {
            if (!newMarks[entry.examId]) newMarks[entry.examId] = {};
            newMarks[entry.examId][entry.studentId] = entry.marks;
          }
          return { marks: newMarks };
        });
        get().refreshComputed();
      },

      importMarksFromCSV: async (examId, csvContent) => {
        const store = get();
        const result = parseMarksCSV(csvContent, store.students, store.subjects);
        
        if (!result.success || result.updates.length === 0) {
          return { success: 0, errors: result.errors };
        }

        // Convert parsed results to marks updates
        const updates = result.updates.map(u => ({
          examId,
          studentId: u.studentId,
          marks: u.marks,
        }));

        await marksRepo.setBatch(updates);

        set(state => {
          const newMarks = { ...state.marks };
          for (const entry of updates) {
            if (!newMarks[entry.examId]) newMarks[entry.examId] = {};
            newMarks[entry.examId][entry.studentId] = entry.marks;
          }
          return { marks: newMarks };
        });
        get().refreshComputed();
        
        return { success: result.updates.length, errors: result.errors };
      },

      // Backup/Restore
      exportBackup: async () => {
        const state = get();
        const backupData = {
          version: 2,
          date: new Date().toISOString(),
          schoolConfig: state.schoolConfig,
          students: state.students,
          subjects: state.subjects,
          exams: state.exams,
          classes: state.classes,
          marks: state.marks,
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chokur_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      restoreBackup: async (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (!data.students || !data.subjects || !data.marks) {
            return false;
          }

          await clearAllData();

          // Restore to IndexedDB
          const db = await getDB();
          const tx = db.transaction(['schoolConfig', 'students', 'subjects', 'exams', 'marks', 'classes'], 'readwrite');

          if (data.schoolConfig) {
            await tx.objectStore('schoolConfig').put({ ...data.schoolConfig, id: 'main', updatedAt: Date.now() });
          }
          for (const s of data.students) {
            await tx.objectStore('students').put({ ...s, createdAt: Date.now(), updatedAt: Date.now() });
          }
          for (const s of data.subjects) {
            await tx.objectStore('subjects').put({ ...s, createdAt: Date.now(), updatedAt: Date.now() });
          }
          for (const e of data.exams || []) {
            await tx.objectStore('exams').put({ ...e, createdAt: Date.now(), updatedAt: Date.now() });
          }
          for (const c of data.classes || []) {
            await tx.objectStore('classes').put({ ...c, createdAt: Date.now(), updatedAt: Date.now() });
          }
          for (const [examId, studentMarks] of Object.entries(data.marks || {})) {
            for (const [studentId, marks] of Object.entries(studentMarks as Record<string, Record<string, MarkValue>>)) {
              await tx.objectStore('marks').put({ examId, studentId, marks, updatedAt: Date.now() });
            }
          }
          await tx.done;

          // Reload state
          await loadFromDB();
          get().refreshComputed();
          return true;
        } catch {
          return false;
        }
      },

      resetToDemoData: async () => {
        await clearAllData();
        await seedInitialData();
        await schemaVersionRepo.set(1);
        await loadFromDB();
        get().refreshComputed();
      },

      // Sync
      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),

      pendingSyncCount: 0,
      refreshSyncCount: async () => {
        // Would query syncQueueRepo
        set({ pendingSyncCount: 0 });
      },
    }),
    {
      name: 'chokur-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeView: state.activeView,
        selectedStudentId: state.selectedStudentId,
        activeClassId: state.activeClassId,
        activeExamId: state.activeExamId,
        schoolConfig: state.schoolConfig,
      }),
    }
  )
);

// Seed initial data
async function seedInitialData(): Promise<void> {
  // Seed school config
  await schoolConfigRepo.set({ ...INITIAL_SCHOOL_CONFIG, id: 'main', updatedAt: Date.now() });

  // Seed students
  for (const s of INITIAL_STUDENTS) {
    await studentsRepo.add({ ...s, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // Seed subjects
  for (const s of INITIAL_SUBJECTS) {
    await subjectsRepo.add({ ...s, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // Seed classes
  const streams = ['Form 4 East', 'Form 4 West', 'Form 4 North', 'Form 3 East'];
  for (const stream of streams) {
    await classesRepo.add({
      id: `class-${stream.toLowerCase().replace(/\s+/g, '-')}`,
      name: stream,
      stream,
      teacherId: 'teacher-1',
      studentIds: INITIAL_STUDENTS.filter(s => s.stream === stream).map(s => s.id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // Seed exams
  const exams = [
    {
      id: 'exam-1',
      name: 'End-term Exam, Term 2 2026',
      classId: 'class-form-4-east',
      term: 'Term 2',
      academicYear: '2026',
      date: '2026-07-15',
      subjectIds: INITIAL_SUBJECTS.map(s => s.id),
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'exam-2',
      name: 'Mid-term Exam, Term 2 2026',
      classId: 'class-form-4-east',
      term: 'Term 2',
      academicYear: '2026',
      date: '2026-06-01',
      subjectIds: INITIAL_SUBJECTS.map(s => s.id),
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'exam-3',
      name: 'End-term Exam, Term 1 2026',
      classId: 'class-form-4-east',
      term: 'Term 1',
      academicYear: '2026',
      date: '2026-04-01',
      subjectIds: INITIAL_SUBJECTS.map(s => s.id),
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
  for (const e of exams) {
    await examsRepo.add(e);
  }

  // Seed marks
  for (const [studentId, subjectMarks] of Object.entries(INITIAL_MARKS)) {
    await marksRepo.set('exam-1', studentId, subjectMarks);
  }
}

// Load from IndexedDB
async function loadFromDB(): Promise<void> {
  const [config, students, subjects, exams, classes, marksData] = await Promise.all([
    schoolConfigRepo.get(),
    studentsRepo.getAll(),
    subjectsRepo.getAll(),
    examsRepo.getAll(),
    classesRepo.getAll(),
    marksRepo.getByExam('exam-1'), // Load marks for default exam
  ]);

  const store = useAppStore.getState();

  if (config) store.schoolConfig = config;
  store.students = students.map(convertStudentRecord);
  store.subjects = subjects.map(convertSubjectRecord);
  store.exams = exams.map(convertExamRecord);
  store.classes = classes.map(convertClassRecord);

  // Convert marks to nested structure
  const marks: Record<string, Record<string, Record<string, MarkValue>>> = {};
  for (const m of marksData) {
    if (!marks[m.examId]) marks[m.examId] = {};
    marks[m.examId][m.studentId] = m.marks;
  }
  store.marks = marks;
}