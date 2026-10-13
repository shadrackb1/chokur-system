import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_MARKS,
  INITIAL_SCHOOL_CONFIG,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
} from '../data/initialData';
import {
  GradeDistributionTier,
  KCSEGrade,
  MarkValue,
  SchoolConfig,
  Student,
  StudentCalculation,
  Subject,
  SubjectDepartmentalStat,
  ViewType,
} from '../types';
import {
  exportMarksTemplateCSV,
  getGradeFromPoints,
  getGradeFromScore,
  KCSE_GRADING_TABLE,
  parseMarksCSV,
  ParsedCSVResult,
  rankAllStudents,
} from '../utils/grading';

interface GradingContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  activeStream: string;
  setActiveStream: (stream: string) => void;
  activeExam: string;
  setActiveExam: (exam: string) => void;
  schoolConfig: SchoolConfig;
  updateSchoolConfig: (config: Partial<SchoolConfig>) => void;
  students: Student[];
  subjects: Subject[];
  marks: Record<string, Record<string, MarkValue>>;
  updateMark: (studentId: string, subjectCode: string, value: MarkValue) => void;
  batchUpdateMarks: (updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => void;
  importMarksFromCSV: (csvContent: string) => ParsedCSVResult;
  downloadMarksTemplateCSV: () => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  resetToDemoData: () => void;
  exportJSONBackup: () => void;
  restoreJSONBackup: (jsonString: string) => boolean;

  // Computed data
  rankings: StudentCalculation[];
  classAverage: number;
  passRate: number;
  meanGrade: KCSEGrade;
  studentsRanked: number;
  subjectDepartmentalStats: SubjectDepartmentalStat[];
  gradeDistributionTiers: GradeDistributionTier[];
  nearTheLineStudents: StudentCalculation[];
  strongestSubject?: { name: string; average: number };
  weakestSubject?: { name: string; average: number };
}

const GradingContext = createContext<GradingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'chokur_system_ledger_v2';

export const GradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-1');
  const [activeStream, setActiveStream] = useState<string>('Form 4 East');
  const [activeExam, setActiveExam] = useState<string>('End-term Exam, Term 2 2026');

  // Load state from localStorage or initialize with seed data
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_CONFIG;
    } catch {
      return INITIAL_SCHOOL_CONFIG;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subjects`);
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [marks, setMarks] = useState<Record<string, Record<string, MarkValue>>>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_marks`);
      return saved ? JSON.parse(saved) : INITIAL_MARKS;
    } catch {
      return INITIAL_MARKS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_config`, JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subjects`, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_marks`, JSON.stringify(marks));
  }, [marks]);

  // Mutations
  const updateMark = (studentId: string, subjectCode: string, value: MarkValue) => {
    setMarks((prev) => {
      const studentMarks = prev[studentId] ? { ...prev[studentId] } : {};
      studentMarks[subjectCode] = value;
      return {
        ...prev,
        [studentId]: studentMarks,
      };
    });
  };

  const batchUpdateMarks = (updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>) => {
    setMarks((prev) => {
      const next = { ...prev };
      updates.forEach(({ studentId, subjectCode, value }) => {
        if (!next[studentId]) {
          next[studentId] = {};
        } else {
          next[studentId] = { ...next[studentId] };
        }
        next[studentId][subjectCode] = value;
      });
      return next;
    });
  };

  const importMarksFromCSV = (csvContent: string): ParsedCSVResult => {
    const result = parseMarksCSV(csvContent, students, subjects);
    if (result.success && result.updates.length > 0) {
      setMarks((prev) => {
        const next = { ...prev };
        result.updates.forEach((update) => {
          next[update.studentId] = {
            ...(next[update.studentId] || {}),
            ...update.marks,
          };
        });
        return next;
      });
    }
    return result;
  };

  const downloadMarksTemplateCSV = () => {
    exportMarksTemplateCSV(
      filteredStudents,
      subjects,
      `KCSE_Marks_Template_${activeStream.replace(/\s+/g, '_')}`
    );
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = `s-${Date.now()}`;
    const newStudent: Student = { ...studentData, id: newId };
    setStudents((prev) => [newStudent, ...prev]);
    // Initialize empty marks
    setMarks((prev) => ({
      ...prev,
      [newId]: {},
    }));
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const removeStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setMarks((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const updateSchoolConfig = (newConfig: Partial<SchoolConfig>) => {
    setSchoolConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const resetToDemoData = () => {
    setSchoolConfig(INITIAL_SCHOOL_CONFIG);
    setStudents(INITIAL_STUDENTS);
    setSubjects(INITIAL_SUBJECTS);
    setMarks(INITIAL_MARKS);
    setSelectedStudentId('s-1');
  };

  const exportJSONBackup = () => {
    const backupData = {
      version: '2.4.1',
      date: new Date().toISOString(),
      schoolConfig,
      students,
      subjects,
      marks,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `chokur_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const restoreJSONBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.students && data.subjects && data.marks) {
        if (data.schoolConfig) setSchoolConfig(data.schoolConfig);
        setStudents(data.students);
        setSubjects(data.subjects);
        setMarks(data.marks);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Filter students by active stream
  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.stream === activeStream && s.status === 'Active');
  }, [students, activeStream]);

  // Compute rankings
  const rankings = useMemo(() => {
    return rankAllStudents(filteredStudents, marks, subjects, schoolConfig.calculationMethod);
  }, [filteredStudents, marks, subjects, schoolConfig.calculationMethod]);

  // Class aggregates
  const studentsRanked = rankings.length;

  const classAverage = useMemo(() => {
    if (rankings.length === 0) return 0;
    const total = rankings.reduce((acc, curr) => acc + curr.average, 0);
    return Math.round((total / rankings.length) * 10) / 10;
  }, [rankings]);

  const passRate = useMemo(() => {
    if (rankings.length === 0) return 0;
    const qualified = rankings.filter((r) => r.qualifies).length;
    return Math.round((qualified / rankings.length) * 100);
  }, [rankings]);

  const meanGrade = useMemo(() => {
    if (rankings.length === 0) return 'C+' as KCSEGrade;
    const totalPoints = rankings.reduce((acc, curr) => acc + curr.meanPoints, 0);
    const avgPoints = totalPoints / rankings.length;
    return getGradeFromPoints(avgPoints);
  }, [rankings]);

  // Subject statistics
  const subjectDepartmentalStats = useMemo<SubjectDepartmentalStat[]>(() => {
    return subjects.map((subj) => {
      const subjectScores: number[] = [];
      filteredStudents.forEach((student) => {
        const val = marks[student.id]?.[subj.code];
        if (typeof val === 'number') {
          subjectScores.push(val);
        }
      });

      const entered = subjectScores.length;
      const total = subjectScores.reduce((acc, curr) => acc + curr, 0);
      const avg = entered > 0 ? Math.round((total / entered) * 10) / 10 : 0;
      const highest = entered > 0 ? Math.max(...subjectScores) : 0;
      const lowest = entered > 0 ? Math.min(...subjectScores) : 0;
      const passed = subjectScores.filter((s) => s >= 50).length;
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
  }, [subjects, filteredStudents, marks]);

  const strongestSubject = useMemo(() => {
    if (subjectDepartmentalStats.length === 0) return undefined;
    const top = subjectDepartmentalStats[0];
    return { name: top.subject.name, average: top.average };
  }, [subjectDepartmentalStats]);

  const weakestSubject = useMemo(() => {
    if (subjectDepartmentalStats.length === 0) return undefined;
    const bottom = subjectDepartmentalStats[subjectDepartmentalStats.length - 1];
    return { name: bottom.subject.name, average: bottom.average };
  }, [subjectDepartmentalStats]);

  // Students near the C+ boundary (mean points between 5.8 and 6.8 or within 1 pt of 7.0)
  const nearTheLineStudents = useMemo(() => {
    return rankings.filter((r) => r.meanPoints >= 5.8 && r.meanPoints <= 6.8);
  }, [rankings]);

  // Grade Distribution (12 tiers)
  const gradeDistributionTiers = useMemo<GradeDistributionTier[]>(() => {
    const totalCount = rankings.length || 1;
    let cumulative = 0;

    return KCSE_GRADING_TABLE.map((row) => {
      const count = rankings.filter((r) => r.meanGrade === row.grade).length;
      const share = Math.round((count / totalCount) * 1000) / 10;
      cumulative += share;

      return {
        grade: row.grade,
        pointsEquivalent: row.points,
        studentCount: count,
        cohortShare: share,
        cumulativePercentage: Math.min(100, Math.round(cumulative * 10) / 10),
      };
    });
  }, [rankings]);

  return (
    <GradingContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedStudentId,
        setSelectedStudentId,
        activeStream,
        setActiveStream,
        activeExam,
        setActiveExam,
        schoolConfig,
        updateSchoolConfig,
        students,
        subjects,
        marks,
        updateMark,
        batchUpdateMarks,
        importMarksFromCSV,
        downloadMarksTemplateCSV,
        addStudent,
        updateStudent,
        removeStudent,
        resetToDemoData,
        exportJSONBackup,
        restoreJSONBackup,
        rankings,
        classAverage,
        passRate,
        meanGrade,
        studentsRanked,
        subjectDepartmentalStats,
        gradeDistributionTiers,
        nearTheLineStudents,
        strongestSubject,
        weakestSubject,
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
