export type ViewType = 
  | 'overview' 
  | 'marks-entry' 
  | 'rankings' 
  | 'subject-analysis' 
  | 'grade-distribution' 
  | 'report-cards' 
  | 'students' 
  | 'profile'
  | 'settings';

export interface WhatsAppMessage {
  id: string;
  studentId: string;
  studentAdm: string;
  studentName: string;
  parentPhone: string;
  parentName: string;
  sender: 'teacher' | 'parent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface TeacherProfile {
  name: string;
  tscNumber: string;
  email: string;
  phone: string;
  department: string;
  assignedStream: string;
  subjectsTaught: string[];
}


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
  teacher?: string;
}

export interface ClassStream {
  id: string;
  name: string;      // e.g. 'Form 4 East'
  form: string;      // e.g. 'Form 4'
  stream: string;    // e.g. 'East'
  classTeacher?: string;
}

export interface ExamPeriod {
  id: string;
  name: string;      // e.g. 'End-term Exam, Term 2 2026'
  term: string;      // e.g. 'Term 2'
  year: number;      // e.g. 2026
  type: 'Mid-term' | 'End-term' | 'Mock';
}

export interface TermConfig {
  id: string;
  name: string;      // e.g. 'Term 2 2026'
  year: number;
  startDate: string;
  endDate: string;
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
  enteredSubjectsCount: number;
  isIncomplete: boolean;   // Fewer than 7 subjects
  strongestSubject?: { code: string; score: number };
  weakestSubject?: { code: string; score: number };
  qualifies: boolean;      // Mean Points >= 6.5 (Grade C+ and above)
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
  principalName?: string;
}

export interface SubjectDepartmentalStat {
  subject: Subject;
  average: number;
  highest: number;
  lowest: number;
  passRate: number; // percentage of students >= 50
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
