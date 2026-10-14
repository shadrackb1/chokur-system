import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_EXAMS,
  INITIAL_MARKS,
  INITIAL_SCHOOL_CONFIG,
  INITIAL_STREAMS,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHER_PROFILE,
  INITIAL_TERMS,
  INITIAL_WHATSAPP_MESSAGES,
} from '../data/initialData';
import {
  AppStateData,
  loadSynchronousStorageState,
  openDatabase,
  persistAppState,
  resetDatabaseToDefaults,
  retrieveAppState,
} from '../lib/db';
import {
  ClassStream,
  ExamPeriod,
  GradeDistributionTier,
  KCSEGrade,
  MarkValue,
  SchoolConfig,
  Student,
  StudentCalculation,
  Subject,
  SubjectDepartmentalStat,
  TeacherProfile,
  TermConfig,
  ViewType,
  WhatsAppMessage,
} from '../types';
import {
  exportMarksTemplateCSV,
  getGradeFromPoints,
  getGradeFromScore,
  KCSE_GRADING_TABLE,
  parseMarksCSV,
  ParsedCSVResult,
  rankAllStudents,
  sanitizeMarkInput,
} from '../utils/grading';

export interface SaveStatus {
  state: 'saved' | 'saving' | 'offline';
  lastSavedAt: string;
}

interface GradingContextType {
  // Navigation & Hash Routing
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  activeStream: string;
  setActiveStream: (stream: string) => void;
  activeExam: string;
  setActiveExam: (exam: string) => void;
  activeSubTab?: string;
  setActiveSubTab: (tab: string) => void;

  // Save / Sync Status
  saveStatus: SaveStatus;
  forceSave: () => void;

  // Core Data
  schoolConfig: SchoolConfig;
  updateSchoolConfig: (config: Partial<SchoolConfig>) => void;
  students: Student[];
  subjects: Subject[];
  streams: ClassStream[];
  exams: ExamPeriod[];
  terms: TermConfig[];
  marks: Record<string, Record<string, MarkValue>>;

  // Mark Operations
  updateMark: (studentId: string, subjectCode: string, value: any) => void;
  batchUpdateMarks: (updates: Array<{ studentId: string; subjectCode: string; value: any }>) => void;
  importMarksFromCSV: (csvContent: string) => ParsedCSVResult;
  downloadMarksTemplateCSV: () => void;

  // Student Operations
  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  bulkAddStudents: (newStudents: Array<Omit<Student, 'id'>>) => { added: number; skipped: number };

  // Subject Operations
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (subject: Subject) => void;
  removeSubject: (subjectCode: string) => void;

  // Stream & Exam Operations
  addClassStream: (stream: Omit<ClassStream, 'id'>) => ClassStream;
  updateClassStream: (stream: ClassStream) => void;
  removeClassStream: (streamId: string) => void;

  addExamPeriod: (exam: Omit<ExamPeriod, 'id'>) => ExamPeriod;
  updateExamPeriod: (exam: ExamPeriod) => void;
  removeExamPeriod: (examId: string) => void;

  // Backup & Restore
  resetToDemoData: () => Promise<void>;
  exportJSONBackup: () => void;
  restoreJSONBackup: (jsonString: string) => boolean;

  // Teacher Profile & WhatsApp Communication
  teacherProfile: TeacherProfile;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;
  whatsAppMessages: WhatsAppMessage[];
  sendWhatsAppMessage: (msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>) => void;

  // Progressive Web App (PWA) Install
  canInstallPwa: boolean;
  installPwa: () => Promise<void>;

  // Computed Derived Selectors
  filteredStudents: Student[];
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

// Hash route parser
const parseHashRoute = (): { view: ViewType; studentId?: string; subTab?: string } => {
  if (typeof window === 'undefined') return { view: 'overview' };
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { view: 'overview' };

  const [routePart, queryPart] = hash.split('?');
  const validViews: ViewType[] = [
    'overview',
    'marks-entry',
    'rankings',
    'subject-analysis',
    'grade-distribution',
    'report-cards',
    'students',
    'profile',
    'settings',
  ];

  const view = validViews.includes(routePart as ViewType) ? (routePart as ViewType) : 'overview';
  let studentId: string | undefined;
  let subTab: string | undefined;

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    if (params.get('student')) studentId = params.get('student')!;
    if (params.get('tab')) subTab = params.get('tab')!;
  }

  return { view, studentId, subTab };
};

export const GradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initial load from local repository cache
  const initialData = useMemo(() => loadSynchronousStorageState(), []);

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(initialData.schoolConfig);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(
    initialData.teacherProfile || INITIAL_TEACHER_PROFILE
  );
  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>(
    initialData.whatsAppMessages || INITIAL_WHATSAPP_MESSAGES
  );
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [subjects, setSubjects] = useState<Subject[]>(initialData.subjects);
  const [streams, setStreams] = useState<ClassStream[]>(initialData.streams);
  const [exams, setExams] = useState<ExamPeriod[]>(initialData.exams);
  const [terms, setTerms] = useState<TermConfig[]>(initialData.terms);
  const [marks, setMarks] = useState<Record<string, Record<string, MarkValue>>>(initialData.marks);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setCanInstallPwa(false);
        setDeferredPrompt(null);
      }
    }
  };

  const initialRoute = useMemo(() => parseHashRoute(), []);
  const [activeView, setActiveViewInternal] = useState<ViewType>(
    initialRoute.view || initialData.uiState.activeView || 'overview'
  );
  const [selectedStudentId, setSelectedStudentIdInternal] = useState<string>(
    initialRoute.studentId || initialData.uiState.selectedStudentId || 's-1'
  );
  const [activeSubTab, setActiveSubTabInternal] = useState<string>(
    initialRoute.subTab || 'students'
  );
  const [activeStream, setActiveStream] = useState<string>(
    initialData.uiState.activeStream || 'Form 4 East'
  );
  const [activeExam, setActiveExam] = useState<string>(
    initialData.uiState.activeExam || 'End-term Exam, Term 2 2026'
  );

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    state: 'saved',
    lastSavedAt: new Date().toLocaleTimeString(),
  });

  const isInitialMount = useRef(true);

  // Sync IndexedDB on mount to reconcile any database changes
  useEffect(() => {
    let isMounted = true;
    retrieveAppState().then((stored) => {
      if (!isMounted || !stored) return;
      // Reconcile if stored state is valid
      if (stored.students && stored.students.length > 0) {
        setStudents(stored.students);
      }
      if (stored.subjects && stored.subjects.length > 0) {
        setSubjects(stored.subjects);
      }
      if (stored.streams && stored.streams.length > 0) {
        setStreams(stored.streams);
      }
      if (stored.exams && stored.exams.length > 0) {
        setExams(stored.exams);
      }
      if (stored.marks) {
        setMarks(stored.marks);
      }
      if (stored.schoolConfig) {
        setSchoolConfig(stored.schoolConfig);
      }
      if (stored.teacherProfile) {
        setTeacherProfile(stored.teacherProfile);
      }
      if (stored.whatsAppMessages && stored.whatsAppMessages.length > 0) {
        setWhatsAppMessages(stored.whatsAppMessages);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update URL hash when view, studentId, or subTab change
  const setActiveView = (view: ViewType) => {
    setActiveViewInternal(view);
    updateHash(view, selectedStudentId, activeSubTab);
  };

  const setSelectedStudentId = (id: string) => {
    setSelectedStudentIdInternal(id);
    updateHash(activeView, id, activeSubTab);
  };

  const setActiveSubTab = (tab: string) => {
    setActiveSubTabInternal(tab);
    updateHash(activeView, selectedStudentId, tab);
  };

  const updateHash = (view: ViewType, studentId: string, subTab?: string) => {
    let hash = `#${view}`;
    const params = new URLSearchParams();
    if (view === 'report-cards' && studentId) {
      params.set('student', studentId);
    }
    if (view === 'students' && subTab) {
      params.set('tab', subTab);
    }
    const queryString = params.toString();
    if (queryString) {
      hash += `?${queryString}`;
    }
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  };

  // Listen to browser navigation (Back / Forward / direct URL hash change)
  useEffect(() => {
    const handleHashChange = () => {
      const { view, studentId, subTab } = parseHashRoute();
      setActiveViewInternal(view);
      if (studentId) setSelectedStudentIdInternal(studentId);
      if (subTab) setActiveSubTabInternal(subTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Central persistence effect whenever state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus((prev) => ({ ...prev, state: 'saving' }));

    const payload: AppStateData = {
      version: 2,
      updatedAt: new Date().toISOString(),
      schoolConfig,
      teacherProfile,
      whatsAppMessages,
      students,
      subjects,
      streams,
      exams,
      terms,
      marks,
      uiState: {
        activeStream,
        activeExam,
        activeView,
        selectedStudentId,
      },
    };

    const timer = setTimeout(async () => {
      try {
        await persistAppState(payload);
        setSaveStatus({
          state: 'saved',
          lastSavedAt: new Date().toLocaleTimeString(),
        });
      } catch (err) {
        console.warn('[Chokur] Persistence error, saved to localStorage fallback:', err);
        setSaveStatus({
          state: 'offline',
          lastSavedAt: new Date().toLocaleTimeString(),
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [schoolConfig, students, subjects, streams, exams, terms, marks, activeStream, activeExam, activeView, selectedStudentId]);

  const forceSave = () => {
    const payload: AppStateData = {
      version: 2,
      updatedAt: new Date().toISOString(),
      schoolConfig,
      teacherProfile,
      whatsAppMessages,
      students,
      subjects,
      streams,
      exams,
      terms,
      marks,
      uiState: {
        activeStream,
        activeExam,
        activeView,
        selectedStudentId,
      },
    };
    persistAppState(payload).then(() => {
      setSaveStatus({
        state: 'saved',
        lastSavedAt: new Date().toLocaleTimeString(),
      });
    });
  };

  // Mark Mutations
  const updateMark = (studentId: string, subjectCode: string, rawVal: any) => {
    const sanitized = sanitizeMarkInput(rawVal);
    setMarks((prev) => {
      const studentMap = prev[studentId] ? { ...prev[studentId] } : {};
      studentMap[subjectCode] = sanitized;
      return {
        ...prev,
        [studentId]: studentMap,
      };
    });
  };

  const batchUpdateMarks = (updates: Array<{ studentId: string; subjectCode: string; value: any }>) => {
    setMarks((prev) => {
      const next = { ...prev };
      updates.forEach(({ studentId, subjectCode, value }) => {
        const sanitized = sanitizeMarkInput(value);
        if (!next[studentId]) {
          next[studentId] = {};
        } else {
          next[studentId] = { ...next[studentId] };
        }
        next[studentId][subjectCode] = sanitized;
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

  // Student Mutations
  const addStudent = (studentData: Omit<Student, 'id'>): Student => {
    const newId = `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newStudent: Student = { ...studentData, id: newId };
    setStudents((prev) => [newStudent, ...prev]);
    setMarks((prev) => ({
      ...prev,
      [newId]: {},
    }));
    return newStudent;
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

  const bulkAddStudents = (newStudentsData: Array<Omit<Student, 'id'>>): { added: number; skipped: number } => {
    let addedCount = 0;
    let skippedCount = 0;
    const existingAdmNos = new Set(students.map((s) => s.admNo.trim().toLowerCase()));

    const validNewStudents: Student[] = [];
    const newMarksMap: Record<string, Record<string, MarkValue>> = {};

    newStudentsData.forEach((item, idx) => {
      const normalizedAdm = item.admNo.trim().toLowerCase();
      if (!normalizedAdm || existingAdmNos.has(normalizedAdm)) {
        skippedCount++;
        return;
      }
      existingAdmNos.add(normalizedAdm);
      const newId = `s-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
      validNewStudents.push({
        ...item,
        id: newId,
        admNo: item.admNo.trim(),
        name: item.name.trim(),
      });
      newMarksMap[newId] = {};
      addedCount++;
    });

    if (validNewStudents.length > 0) {
      setStudents((prev) => [...validNewStudents, ...prev]);
      setMarks((prev) => ({ ...prev, ...newMarksMap }));
    }

    return { added: addedCount, skipped: skippedCount };
  };

  // Subject Mutations
  const addSubject = (subjData: Omit<Subject, 'id'>): Subject => {
    const newId = `sub-${subjData.code.toLowerCase().trim()}`;
    const newSubj: Subject = { ...subjData, id: newId, code: subjData.code.toUpperCase().trim() };
    setSubjects((prev) => [...prev, newSubj]);
    return newSubj;
  };

  const updateSubject = (updatedSubj: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubj.id ? updatedSubj : s)));
  };

  const removeSubject = (subjectCode: string) => {
    setSubjects((prev) => prev.filter((s) => s.code !== subjectCode));
    // Cascade remove marks for this subject
    setMarks((prev) => {
      const next: Record<string, Record<string, MarkValue>> = {};
      Object.entries(prev).forEach(([studentId, marksMap]) => {
        const copy = { ...marksMap };
        delete copy[subjectCode];
        next[studentId] = copy;
      });
      return next;
    });
  };

  // Class Stream Mutations
  const addClassStream = (streamData: Omit<ClassStream, 'id'>): ClassStream => {
    const newId = `str-${Date.now()}`;
    const newStream: ClassStream = { ...streamData, id: newId };
    setStreams((prev) => [...prev, newStream]);
    return newStream;
  };

  const updateClassStream = (updatedStream: ClassStream) => {
    const oldStream = streams.find((s) => s.id === updatedStream.id);
    setStreams((prev) => prev.map((s) => (s.id === updatedStream.id ? updatedStream : s)));

    // Cascade update student stream names if name changed
    if (oldStream && oldStream.name !== updatedStream.name) {
      setStudents((prev) =>
        prev.map((s) => (s.stream === oldStream.name ? { ...s, stream: updatedStream.name } : s))
      );
      if (activeStream === oldStream.name) {
        setActiveStream(updatedStream.name);
      }
    }
  };

  const removeClassStream = (streamId: string) => {
    const streamToRemove = streams.find((s) => s.id === streamId);
    if (!streamToRemove) return;

    setStreams((prev) => prev.filter((s) => s.id !== streamId));
    // Cascade remove all students in this stream
    const studentIdsToRemove = new Set(
      students.filter((s) => s.stream === streamToRemove.name).map((s) => s.id)
    );
    setStudents((prev) => prev.filter((s) => !studentIdsToRemove.has(s.id)));
    setMarks((prev) => {
      const next = { ...prev };
      studentIdsToRemove.forEach((id) => delete next[id]);
      return next;
    });

    if (activeStream === streamToRemove.name) {
      const remaining = streams.filter((s) => s.id !== streamId);
      if (remaining.length > 0) {
        setActiveStream(remaining[0].name);
      }
    }
  };

  // Exam Period Mutations
  const addExamPeriod = (examData: Omit<ExamPeriod, 'id'>): ExamPeriod => {
    const newId = `exam-${Date.now()}`;
    const newExam: ExamPeriod = { ...examData, id: newId };
    setExams((prev) => [newExam, ...prev]);
    return newExam;
  };

  const updateExamPeriod = (updatedExam: ExamPeriod) => {
    setExams((prev) => prev.map((e) => (e.id === updatedExam.id ? updatedExam : e)));
  };

  const removeExamPeriod = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  // School Config Mutations
  const updateSchoolConfig = (newConfig: Partial<SchoolConfig>) => {
    setSchoolConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Teacher Profile Mutations
  const updateTeacherProfile = (profile: Partial<TeacherProfile>) => {
    setTeacherProfile((prev) => ({ ...prev, ...profile }));
  };

  const sendWhatsAppMessage = (msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>) => {
    const newMsg: WhatsAppMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    setWhatsAppMessages((prev) => [...prev, newMsg]);

    if (msg.sender === 'teacher') {
      setTimeout(() => {
        setWhatsAppMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
        );
      }, 1200);

      setTimeout(() => {
        const reply: WhatsAppMessage = {
          id: `msg-${Date.now() + 1}`,
          studentId: msg.studentId,
          studentAdm: msg.studentAdm,
          studentName: msg.studentName,
          parentName: msg.parentName,
          parentPhone: msg.parentPhone,
          sender: 'parent',
          text: `Thank you Mwalimu! Received the report for ${msg.studentName}. We appreciate your dedication.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setWhatsAppMessages((prev) => [...prev, reply]);
      }, 2500);
    }
  };

  // Reset to seed demo data
  const resetToDemoData = async () => {
    const clean = await resetDatabaseToDefaults();
    setSchoolConfig(clean.schoolConfig);
    setTeacherProfile(clean.teacherProfile);
    setWhatsAppMessages(clean.whatsAppMessages);
    setStudents(clean.students);
    setSubjects(clean.subjects);
    setStreams(clean.streams);
    setExams(clean.exams);
    setTerms(clean.terms);
    setMarks(clean.marks);
    setActiveStream(clean.uiState.activeStream);
    setActiveExam(clean.uiState.activeExam);
    setActiveView('overview');
    setSelectedStudentId('s-1');
  };

  // Export & Restore JSON
  const exportJSONBackup = () => {
    const backupData: AppStateData = {
      version: 2,
      updatedAt: new Date().toISOString(),
      schoolConfig,
      teacherProfile,
      whatsAppMessages,
      students,
      subjects,
      streams,
      exams,
      terms,
      marks,
      uiState: {
        activeStream,
        activeExam,
        activeView,
        selectedStudentId,
      },
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
      if (data.students && Array.isArray(data.students) && data.subjects && data.marks) {
        if (data.schoolConfig) setSchoolConfig(data.schoolConfig);
        if (data.teacherProfile) setTeacherProfile(data.teacherProfile);
        if (Array.isArray(data.whatsAppMessages)) setWhatsAppMessages(data.whatsAppMessages);
        setStudents(data.students);
        setSubjects(data.subjects);
        if (Array.isArray(data.streams)) setStreams(data.streams);
        if (Array.isArray(data.exams)) setExams(data.exams);
        if (Array.isArray(data.terms)) setTerms(data.terms);
        setMarks(data.marks);
        if (data.uiState) {
          if (data.uiState.activeStream) setActiveStream(data.uiState.activeStream);
          if (data.uiState.activeExam) setActiveExam(data.uiState.activeExam);
        }
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

  // Compute live rankings according to pure KNEC algorithms
  const rankings = useMemo(() => {
    return rankAllStudents(filteredStudents, marks, subjects, schoolConfig.calculationMethod);
  }, [filteredStudents, marks, subjects, schoolConfig.calculationMethod]);

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

  // Students near the C+ boundary (mean points between 5.8 and 6.8)
  const nearTheLineStudents = useMemo(() => {
    return rankings.filter((r) => r.meanPoints >= 5.8 && r.meanPoints <= 6.8);
  }, [rankings]);

  // Grade Distribution across 12 KCSE tiers
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
        activeSubTab,
        setActiveSubTab,
        saveStatus,
        forceSave,
        schoolConfig,
        updateSchoolConfig,
        students,
        subjects,
        streams,
        exams,
        terms,
        marks,
        updateMark,
        batchUpdateMarks,
        importMarksFromCSV,
        downloadMarksTemplateCSV,
        addStudent,
        updateStudent,
        removeStudent,
        bulkAddStudents,
        addSubject,
        updateSubject,
        removeSubject,
        addClassStream,
        updateClassStream,
        removeClassStream,
        addExamPeriod,
        updateExamPeriod,
        removeExamPeriod,
        resetToDemoData,
        exportJSONBackup,
        restoreJSONBackup,
        filteredStudents,
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
        teacherProfile,
        updateTeacherProfile,
        whatsAppMessages,
        sendWhatsAppMessage,
        canInstallPwa,
        installPwa,
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
