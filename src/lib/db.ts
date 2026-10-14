import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface SchoolConfig { id: string; name: string; code: string; address: string; phone: string; email: string; principal: string; logo: string; gradingSystem: 'KCSE-12' | 'KCSE-7'; calculationMethod: 'best7' | 'all'; passMark: number; updatedAt: number; }
interface Student { id: string; admNo: string; name: string; stream: string; gender: 'Male' | 'Female'; kcpeMarks: number; status: 'Active' | 'Inactive'; createdAt: number; updatedAt: number; }
interface Subject { id: string; code: string; name: string; department: 'Sciences' | 'Languages' | 'Humanities' | 'Technicals' | 'Mathematics'; entered: boolean; lastExamMean: number; createdAt: number; updatedAt: number; }
interface Class { id: string; name: string; stream: string; teacherId: string; studentIds: string[]; createdAt: number; updatedAt: number; }
interface Exam { id: string; name: string; classId: string; term: string; academicYear: string; date: string; subjectIds: string[]; isActive: boolean; createdAt: number; updatedAt: number; }
interface MarksRecord { examId: string; studentId: string; marks: Record<string, number | 'ABS' | null>; updatedAt: number; }
interface SyncRecord { id: string; type: 'create' | 'update' | 'delete'; entity: string; entityId: string; data: unknown; timestamp: number; synced: boolean; }
interface SchemaVersion { version: number; }

interface ChokurDB extends DBSchema {
  schoolConfig: { key: string; value: SchoolConfig };
  students: { key: string; value: Student; indexes: { 'by-stream': string; 'by-status': string } };
  subjects: { key: string; value: Subject; indexes: { 'by-code': string; 'by-department': string } };
  classes: { key: string; value: Class; indexes: { 'by-stream': string } };
  exams: { key: string; value: Exam; indexes: { 'by-class': string; 'by-term': string } };
  marks: { key: [string, string]; value: MarksRecord; indexes: { 'by-exam': string; 'by-student': string } };
  syncQueue: { key: string; value: SyncRecord; indexes: { 'by-synced': string } };
  schemaVersion: { key: string; value: SchemaVersion };
}

let dbInstance: IDBPDatabase<ChokurDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ChokurDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ChokurDB>('chokur-system', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const schoolConfig = db.createObjectStore('schoolConfig', { keyPath: 'id' });
        const students = db.createObjectStore('students', { keyPath: 'id' });
        students.createIndex('by-stream', 'stream');
        students.createIndex('by-status', 'status');
        const subjects = db.createObjectStore('subjects', { keyPath: 'id' });
        subjects.createIndex('by-code', 'code');
        subjects.createIndex('by-department', 'department');
        const classes = db.createObjectStore('classes', { keyPath: 'id' });
        classes.createIndex('by-stream', 'stream');
        const exams = db.createObjectStore('exams', { keyPath: 'id' });
        exams.createIndex('by-class', 'classId');
        exams.createIndex('by-term', 'term');
        const marks = db.createObjectStore('marks', { keyPath: ['examId', 'studentId'] });
        marks.createIndex('by-exam', 'examId');
        marks.createIndex('by-student', 'studentId');
        const syncQueue = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncQueue.createIndex('by-synced', 'synced');
        db.createObjectStore('schemaVersion', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export async function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}