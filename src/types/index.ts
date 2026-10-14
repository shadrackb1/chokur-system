export type ViewType = 
  | 'overview' 
  | 'marks-entry' 
  | 'rankings' 
  | 'subject-analysis' 
  | 'grade-distribution' 
  | 'report-cards' 
  | 'students' 
  | 'settings';

export interface Student {
  id: string;
  admNo: string;
  name: string;
  stream: string;
  gender: 'Male' | 'Female';
  kcpeMarks: number;
  status: 'Active' | 'Inactive';
}

export interface Subject {
  id: string;
  code: string;       // e.g. MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST
  name: string;
  department: string;
  entered: number;
  lastExamMean: number;
}

export type MarkValue = number | 'ABS' | null;

export type KCSEGrade = 
  | 'A' 
  | 'A-' 
  | 'B+' 
  | 'B' 
  | 'B-' 
  | 'C+' 
  | 'C' 
  | 'C-' 
  | 'D+' 
  | 'D' 
  | 'D-' 
  | 'E';

export interface GradeResult {
  grade: KCSEGrade;
  points: number; // 12 down to 1
  tier: 'honors' | 'competent' | 'marginal' | 'critical';
  description: string;
}

export interface StudentCalculation {
  student: Student;
  marks: Record<string, MarkValue>;
  average: number;
  aggregate: number;       // Best 7 aggregate points (/84) or straight points
  meanGrade: KCSEGrade;
  meanPoints: number;
  rank: number;
  subjectsPassed: number;  // Marks >= 50 or Grade >= C
  strongestSubject?: { code: string; score: number };
  weakestSubject?: { code: string; score: number };
  qualifies: boolean;      // Mean Points >= 7.0 (Grade C+ and above)
  subjectsEntered: number; // Number of subjects with numeric marks
  subjectsUsed: number;    // Number of subjects used in aggregate (7 for best7, all for simpleMean)
}

export interface SchoolConfig {
  schoolName: string;
  motto: string;
  postalAddress: string;
  contactPhoneEmail: string;
  academicYear: string;
  term: string;
  termOpeningDate: string;
  termClosingDate: string;
  calculationMethod: 'best7' | 'simpleMean';
  classTeacher: string;
}

export interface SubjectDepartmentalStat {
  subject: Subject;
  average: number;
  highest: number;
  lowest: number;
  passRate: number; // percentage of students >= 55 (C+)
  entered: number;
  diffFromLastExam: number; // e.g. +3.2 or -1.8
}

export interface GradeDistributionTier {
  grade: KCSEGrade;
  pointsEquivalent: number;
  studentCount: number;
  cohortShare: number; // percentage e.g. 16.7
  cumulativePercentage: number;
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
}

export interface Class {
  id: string;
  name: string;
  stream: string;
  teacherId: string;
  studentIds: string[];
}
