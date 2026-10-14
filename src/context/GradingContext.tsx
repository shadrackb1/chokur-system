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
  classStats: {
    classAverage: number;
    passRate: number;
    meanGrade: string;
    highestAggregate: number;
    lowestAggregate: number;
  };
  students: Student[];
  subjects: Subject[];
  marks: Record<string, Record<string, MarkValue>>; // [studentId][subjectCode] for active exam
  updateMark: (examId: string, studentId: string, subjectCode: string, value: MarkValue) => Promise<void>;
  batchUpdateMarks: (examId: string, updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => Promise<void>;
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

  // Derive activeStream/activeExam from store directly - no local state needed
  const activeStream = store.activeClassId
    ? store.classes.find(c => c.id === store.activeClassId)?.stream || ''
    : '';
  const activeExam = store.activeExamId
    ? store.exams.find(e => e.id === store.activeExamId)?.name || ''
    : '';

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

  const updateMark = async (examId: string, studentId: string, subjectCode: string, value: MarkValue) => {
    await store.updateMark(examId, studentId, subjectCode, value);
  };

  const batchUpdateMarks = async (examId: string, updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => {
    await store.batchUpdateMarks(examId, updates);
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
        selectedStudentId: store.selectedStudentId,
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
        classStats: store.classStats,
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