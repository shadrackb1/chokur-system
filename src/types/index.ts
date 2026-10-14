export interface Student {
  id: string;
  admNo: string;
  name: string;
  stream: string;
  gender: 'Male' | 'Female';
  kcpeMarks: number;
  status: 'Active' | 'Inactive';
  createdAt: number;
  updatedAt: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: 'Sciences' | 'Languages' | 'Humanities' | 'Technicals' | 'Mathematics';
  entered: boolean;
  lastExamMean: number;
  createdAt: number;
  updatedAt: number;
}

export interface Class {
  id: string;
  name: string;
  stream: string;
  teacherId: string;
  studentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Exam {
  id: string;
  name: string;
  classId: string;
  term: string;
  academicYear: string;
  date: string;
  subjectIds: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export type MarkValue = number | 'ABS' | null;

export interface MarksRecord {
  examId: string;
  studentId: string;
  marks: Record<string, MarkValue>;
  updatedAt: number;
}

export interface SchoolConfig {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
  logo: string;
  gradingSystem: 'KCSE-12' | 'KCSE-7';
  calculationMethod: 'best7' | 'all';
  passMark: number;
  updatedAt: number;
}

export interface StudentCalculation {
  student: Student;
  marks: Record<string, MarkValue>;
  subjectPoints: Record<string, number>;
  subjectGrades: Record<string, string>;
  aggregate: number;
  meanGrade: string;
  meanPoints: number;
  rank: number;
  qualifies: boolean;
  enteredCount: number;
  absentCount: number;
}

export interface SubjectDepartmentalStat {
  subject: Subject;
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
  entered: number;
  diffFromLastExam: number;
}

export interface ClassStats {
  classAverage: number;
  passRate: number;
  meanGrade: string;
  highestAggregate: number;
  lowestAggregate: number;
}

export interface GradeDistributionTier {
  grade: string;
  pointsEquivalent: number;
  studentCount: number;
  cohortShare: number;
  cumulativePercentage: number;
}

export interface BackupData {
  version: number;
  date: string;
  schoolConfig: SchoolConfig;
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  classes: Class[];
  marks: Record<string, Record<string, Record<string, MarkValue>>>;
}

export interface SyncRecord {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: number;
  synced: boolean;
}

export interface CSVImportResult {
  success: number;
  errors: string[];
}