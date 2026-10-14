/**
 * IndexedDB Repository Layer with Schema Versioning & LocalStorage Dual-Write
 * Chokur Academic Ledger System
 */

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
  ClassStream,
  ExamPeriod,
  MarkValue,
  SchoolConfig,
  Student,
  Subject,
  TeacherProfile,
  TermConfig,
  ViewType,
  WhatsAppMessage,
} from '../types';

export const DB_NAME = 'ChokurSystemDB';
export const DB_VERSION = 2;

export interface AppStateData {
  version: number;
  updatedAt: string;
  schoolConfig: SchoolConfig;
  teacherProfile: TeacherProfile;
  whatsAppMessages: WhatsAppMessage[];
  students: Student[];
  subjects: Subject[];
  streams: ClassStream[];
  exams: ExamPeriod[];
  terms: TermConfig[];
  marks: Record<string, Record<string, MarkValue>>;
  uiState: {
    activeStream: string;
    activeExam: string;
    activeView: ViewType;
    selectedStudentId: string;
  };
}

const LOCAL_STORAGE_PREFIX = 'chokur_system_v2';

export const getInitialAppState = (): AppStateData => {
  return {
    version: DB_VERSION,
    updatedAt: new Date().toISOString(),
    schoolConfig: INITIAL_SCHOOL_CONFIG,
    teacherProfile: INITIAL_TEACHER_PROFILE,
    whatsAppMessages: INITIAL_WHATSAPP_MESSAGES,
    students: INITIAL_STUDENTS,
    subjects: INITIAL_SUBJECTS,
    streams: INITIAL_STREAMS,
    exams: INITIAL_EXAMS,
    terms: INITIAL_TERMS,
    marks: INITIAL_MARKS,
    uiState: {
      activeStream: 'Form 4 East',
      activeExam: 'End-term Exam, Term 2 2026',
      activeView: 'overview',
      selectedStudentId: 's-1',
    },
  };
};

/**
 * Synchronous local storage read for instantaneous zero-flicker startup
 */
export const loadSynchronousStorageState = (): AppStateData => {
  const defaults = getInitialAppState();
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}_snapshot`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        schoolConfig: parsed.schoolConfig || defaults.schoolConfig,
        students: Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : defaults.students,
        subjects: Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : defaults.subjects,
        streams: Array.isArray(parsed.streams) && parsed.streams.length > 0 ? parsed.streams : defaults.streams,
        exams: Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaults.exams,
        terms: Array.isArray(parsed.terms) && parsed.terms.length > 0 ? parsed.terms : defaults.terms,
        marks: parsed.marks || defaults.marks,
        uiState: {
          ...defaults.uiState,
          ...(parsed.uiState || {}),
        },
      };
    }

    // Check older localStorage format for seamless migration
    const oldConfig = localStorage.getItem('chokur_system_ledger_v2_config');
    const oldStudents = localStorage.getItem('chokur_system_ledger_v2_students');
    const oldSubjects = localStorage.getItem('chokur_system_ledger_v2_subjects');
    const oldMarks = localStorage.getItem('chokur_system_ledger_v2_marks');

    if (oldStudents || oldMarks) {
      const migrated: AppStateData = {
        ...defaults,
        schoolConfig: oldConfig ? JSON.parse(oldConfig) : defaults.schoolConfig,
        students: oldStudents ? JSON.parse(oldStudents) : defaults.students,
        subjects: oldSubjects ? JSON.parse(oldSubjects) : defaults.subjects,
        marks: oldMarks ? JSON.parse(oldMarks) : defaults.marks,
      };
      saveSynchronousStorageState(migrated);
      return migrated;
    }
  } catch (err) {
    console.warn('[Chokur DB] Error reading synchronous localStorage cache:', err);
  }

  return defaults;
};

/**
 * Synchronous local storage write for instant safety
 */
export const saveSynchronousStorageState = (state: AppStateData): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}_snapshot`, JSON.stringify(state));
  } catch (err) {
    console.warn('[Chokur DB] Error writing synchronous localStorage cache:', err);
  }
};

/**
 * Open or upgrade IndexedDB connection
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const storeNames = ['appState', 'students', 'subjects', 'marks', 'streams', 'exams', 'config'];
      storeNames.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name);
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Persist entire app state to IndexedDB with localStorage mirror
 */
export const persistAppState = async (state: AppStateData): Promise<void> => {
  // Always mirror to localStorage synchronously first
  saveSynchronousStorageState(state);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['appState'], 'readwrite');
      const store = transaction.objectStore('appState');
      const putRequest = store.put(state, 'current');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    // If IndexedDB fails (e.g. strict sandbox iframe), localStorage mirror keeps state alive
    console.warn('[Chokur DB] IndexedDB write fallback to localStorage:', err);
  }
};

/**
 * Read state from IndexedDB
 */
export const retrieveAppState = async (): Promise<AppStateData | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['appState'], 'readonly');
      const store = transaction.objectStore('appState');
      const getRequest = store.get('current');

      getRequest.onsuccess = () => {
        const result = getRequest.result as AppStateData | undefined;
        resolve(result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.warn('[Chokur DB] IndexedDB read fallback to synchronous cache:', err);
    return null;
  }
};

/**
 * Completely reset database to clean default seed data
 */
export const resetDatabaseToDefaults = async (): Promise<AppStateData> => {
  const fresh = getInitialAppState();
  saveSynchronousStorageState(fresh);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['appState'], 'readwrite');
      const store = transaction.objectStore('appState');
      const putRequest = store.put(fresh, 'current');
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.warn('[Chokur DB] Reset IndexedDB fallback:', err);
  }
  return fresh;
};
