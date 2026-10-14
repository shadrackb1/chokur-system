import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { ViewType } from '../types';
import { MarkValue, KCSEGrade, Student, Subject, StudentCalculation, SchoolConfig, SubjectDepartmentalStat, GradeDistributionTier } from '../types';

interface GradingContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  activeClassId: string | null;
  setActiveClassId: (id: string | null) => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
  activeStream: string;
  setActiveStream: (stream: string) => Promise<void>;
  activeExam: string;
  setActiveExam: (exam: string) => Promise<void>;
  schoolConfig: SchoolConfig;
  updateSchoolConfig: (config: Partial<SchoolConfig>) => Promise<void>;
  students: Student[];
  subjects: Subject[];
  marks: Record<string, Record<string, MarkValue>>; // [studentId][subjectCode] for active exam
  updateMark: (studentId: string, subjectCode: string, value: MarkValue) => Promise<void>;
  batchUpdateMarks: (updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => Promise<void>;
  importMarksFromCSV: (examId: string, csvContent: string) => Promise<any>;
  downloadMarksTemplateCSV: () => void;
  addStudent: (student: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (student: Student) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  exportJSONBackup: () => Promise<void>;
  restoreJSONBackup: (jsonString: string) => Promise<boolean>;

  // Computed data
  rankings: StudentCalculation[];
  classAverage: number;
  passRate: number;
  meanGrade: string;
  studentsRanked: number;
  subjectDepartmentalStats: SubjectDepartmentalStat[];
  gradeDistributionTiers: GradeDistributionTier[];
  nearTheLineStudents: StudentCalculation[];
  strongestSubject?: { name: string; average: number };
  weakestSubject?: { name: string; average: number };
}

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export const GradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAppStore();

  // Sync active class/exam from store to local state for backward compatibility
  const [activeStream, setActiveStream] = React.useState<string>('Form 4 East');
  const [activeExam, setActiveExam] = React.useState<string>('End-term Exam, Term 2 2026');

  // Update stream/exam when store changes
  useEffect(() => {
    if (store.activeClassId) {
      const classRecord = store.classes.find(c => c.id === store.activeClassId);
      if (classRecord && classRecord.stream !== activeStream) {
        setActiveStream(classRecord.stream);
      }
    }
  }, [store.activeClassId, store.classes]);

  useEffect(() => {
    if (store.activeExamId) {
      const exam = store.exams.find(e => e.id === store.activeExamId);
      if (exam && exam.name !== activeExam) {
        setActiveExam(exam.name);
      }
    }
  }, [store.activeExamId, store.exams]);

  // Wrapper functions for backward compatibility
  const setActiveView = (view: ViewType) => store.setActiveView(view);
  const setSelectedStudentId = (id: string | null) => store.setSelectedStudentId(id);
  
  const setActiveStreamWrapper = async (stream: string) => {
    const classRecord = store.classes.find(c => c.stream === stream);
    if (classRecord) {
      await store.setActiveClassId(classRecord.id);
    }
  };
  
  const setActiveExamWrapper = async (examName: string) => {
    const exam = store.exams.find(e => e.name === examName && e.classId === store.activeClassId);
    if (exam) {
      await store.setActiveExamId(exam.id);
    }
  };

  const updateSchoolConfig = async (config: Partial<SchoolConfig>) => {
    await store.setSchoolConfig(config);
  };

  const updateMark = async (studentId: string, subjectCode: string, value: MarkValue) => {
    if (!store.activeExamId) return;
    await store.updateMark(store.activeExamId, studentId, subjectCode, value);
  };

  const batchUpdateMarks = async (updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => {
    if (!store.activeExamId) return;
    await store.batchUpdateMarks(store.activeExamId, updates);
  };

  const importMarksFromCSV = async (examId: string, csvContent: string) => {
    return store.importMarksFromCSV(examId, csvContent);
  };

  const downloadMarksTemplateCSV = () => {
    // Use the store's filtered students and subjects
    const { filteredStudents, subjects, activeExamId } = store;
    if (!activeExamId) return;
  };

  // Get marks for active exam as studentId -> subjectCode -> MarkValue
  const activeExamMarks = store.activeExamId ? store.marks[store.activeExamId] || {} : {};

  return (
    <GradingContext.Provider
      value={{
        activeView: store.activeView,
        setActiveView,
        selectedStudentId: store.selectedStudentId || '',
        setSelectedStudentId,
        activeStream,
        setActiveStream: setActiveStreamWrapper,
        activeExam,
        setActiveExam: setActiveExamWrapper,
        activeClassId: store.activeClassId,
        setActiveClassId: store.setActiveClassId,
        activeExamId: store.activeExamId,
        setActiveExamId: store.setActiveExamId,
        schoolConfig: store.schoolConfig,
        updateSchoolConfig,
        students: store.students,
        subjects: store.subjects,
        marks: activeExamMarks,
        updateMark,
        batchUpdateMarks,
        importMarksFromCSV,
        downloadMarksTemplateCSV,
        addStudent: store.addStudent,
        updateStudent: store.updateStudent,
        removeStudent: store.removeStudent,
        resetToDemoData: store.resetToDemoData,
        exportJSONBackup: store.exportBackup,
        restoreJSONBackup: store.restoreBackup,
        rankings: store.rankings,
        classAverage: store.classStats.classAverage,
        passRate: store.classStats.passRate,
        meanGrade: store.classStats.meanGrade,
        studentsRanked: store.filteredStudents.length,
        subjectDepartmentalStats: store.subjectStats,
        gradeDistributionTiers: store.gradeDistribution,
        nearTheLineStudents: store.nearTheLineStudents,
        strongestSubject: store.strongestSubject,
        weakestSubject: store.weakestSubject,
      }}
    >
      {children}
    </GradingContext.Provider>
  );
};

export const useGrading = () => {
  const context = useContext(GradingContext);
  if (!context) {
    throw new Error('useGrading must be used within a GradingProvider');
  }
  return context;
};