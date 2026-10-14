import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ChokurDBSchema extends DBSchema {
  schoolConfig: {
    key: string;
    value: SchoolConfigRecord;
    indexes: { 'by-id': string };
  };
  students: {
    key: string;
    value: StudentRecord;
    indexes: { 'by-stream': string; 'by-admNo': string; 'by-status': string };
  };
  subjects: {
    key: string;
    value: SubjectRecord;
    indexes: { 'by-code': string; 'by-department': string };
  };
  exams: {
    key: string;
    value: ExamRecord;
    indexes: { 'by-class': string; 'by-term': string; 'by-date': string };
  };
  marks: {
    key: [string, string]; // [examId, studentId]
    value: MarksRecord;
    indexes: { 'by-exam': string; 'by-student': string };
  };
  classes: {
    key: string;
    value: ClassRecord;
    indexes: { 'by-stream': string };
  };
  settings: {
    key: string;
    value: SettingsRecord;
  };
  syncQueue: {
    key: number;
    value: SyncRecord;
    indexes: { 'by-status': string; 'by-timestamp': number };
    autoIncrement: true;
  };
  schemaVersion: {
    key: string;
    value: SchemaVersionRecord;
  };
}

export interface SchoolConfigRecord {
  id: string;
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
  updatedAt: number;
}

export interface StudentRecord {
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

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  entered: number;
  lastExamMean: number;
  createdAt: number;
  updatedAt: number;
}

export interface ExamRecord {
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

export interface ClassRecord {
  id: string;
  name: string;
  stream: string;
  teacherId: string;
  studentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MarksRecord {
  examId: string;
  studentId: string;
  marks: Record<string, number | 'ABS' | null>;
  updatedAt: number;
}

export interface SettingsRecord {
  id: string;
  key: string;
  value: string;
}

export interface SyncRecord {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'students' | 'subjects' | 'exams' | 'marks' | 'classes' | 'schoolConfig';
  entityId: string;
  payload: unknown;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
  lastAttempt?: number;
  createdAt: number;
}

export interface SchemaVersionRecord {
  id: string;
  version: number;
  migratedAt: number;
}

const DB_NAME = 'chokur-system';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<ChokurDBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<ChokurDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ChokurDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Version 1: Initial schema
      if (oldVersion < 1) {
        const schoolConfigStore = db.createObjectStore('schoolConfig', { keyPath: 'id' });
        schoolConfigStore.createIndex('by-id', 'id');

        const studentsStore = db.createObjectStore('students', { keyPath: 'id' });
        studentsStore.createIndex('by-stream', 'stream');
        studentsStore.createIndex('by-admNo', 'admNo', { unique: true });
        studentsStore.createIndex('by-status', 'status');

        const subjectsStore = db.createObjectStore('subjects', { keyPath: 'id' });
        subjectsStore.createIndex('by-code', 'code', { unique: true });
        subjectsStore.createIndex('by-department', 'department');

        const examsStore = db.createObjectStore('exams', { keyPath: 'id' });
        examsStore.createIndex('by-class', 'classId');
        examsStore.createIndex('by-term', 'term');
        examsStore.createIndex('by-date', 'date');

        const marksStore = db.createObjectStore('marks', { keyPath: ['examId', 'studentId'] });
        marksStore.createIndex('by-exam', 'examId');
        marksStore.createIndex('by-student', 'studentId');

        const classesStore = db.createObjectStore('classes', { keyPath: 'id' });
        classesStore.createIndex('by-stream', 'stream');

        const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });

        const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncQueueStore.createIndex('by-status', 'status');
        syncQueueStore.createIndex('by-timestamp', 'createdAt');

        const schemaVersionStore = db.createObjectStore('schemaVersion', { keyPath: 'id' });
      }

      // Version 2: Add missing indexes and fix syncQueue indexes
      if (oldVersion < 2) {
        // Fix syncQueue indexes - ensure by-timestamp index uses correct keyPath 'createdAt'
        if (db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = transaction.objectStore('syncQueue');
          // Drop and recreate index with correct keyPath
          if (syncQueueStore.indexNames.contains('by-timestamp')) {
            syncQueueStore.deleteIndex('by-timestamp');
          }
          syncQueueStore.createIndex('by-timestamp', 'createdAt');
        }
      }
    },
  });

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Repository functions
export const schoolConfigRepo = {
  async get(): Promise<SchoolConfigRecord | undefined> {
    const db = await getDB();
    return db.get('schoolConfig', 'main');
  },
  async set(config: SchoolConfigRecord): Promise<void> {
    const db = await getDB();
    await db.put('schoolConfig', { ...config, updatedAt: Date.now() });
  },
};

export const studentsRepo = {
  async getAll(): Promise<StudentRecord[]> {
    const db = await getDB();
    return db.getAll('students');
  },
  async getByStream(stream: string): Promise<StudentRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('students', 'by-stream', stream);
  },
  async getById(id: string): Promise<StudentRecord | undefined> {
    const db = await getDB();
    return db.get('students', id);
  },
  async getByAdmNo(admNo: string): Promise<StudentRecord | undefined> {
    const db = await getDB();
    return db.getFromIndex('students', 'by-admNo', admNo);
  },
  async add(student: StudentRecord): Promise<void> {
    const db = await getDB();
    await db.add('students', { ...student, createdAt: Date.now(), updatedAt: Date.now() });
  },
  async update(student: StudentRecord): Promise<void> {
    const db = await getDB();
    await db.put('students', { ...student, updatedAt: Date.now() });
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('students', id);
  },
  async deleteByStream(stream: string): Promise<number> {
    const db = await getDB();
    const students = await db.getAllFromIndex('students', 'by-stream', stream);
    const tx = db.transaction('students', 'readwrite');
    for (const s of students) {
      await tx.store.delete(s.id);
    }
    await tx.done;
    return students.length;
  },
};

export const subjectsRepo = {
  async getAll(): Promise<SubjectRecord[]> {
    const db = await getDB();
    return db.getAll('subjects');
  },
  async getById(id: string): Promise<SubjectRecord | undefined> {
    const db = await getDB();
    return db.get('subjects', id);
  },
  async getByCode(code: string): Promise<SubjectRecord | undefined> {
    const db = await getDB();
    return db.getFromIndex('subjects', 'by-code', code);
  },
  async add(subject: SubjectRecord): Promise<void> {
    const db = await getDB();
    await db.add('subjects', { ...subject, createdAt: Date.now(), updatedAt: Date.now() });
  },
  async update(subject: SubjectRecord): Promise<void> {
    const db = await getDB();
    await db.put('subjects', { ...subject, updatedAt: Date.now() });
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('subjects', id);
  },
};

export const examsRepo = {
  async getAll(): Promise<ExamRecord[]> {
    const db = await getDB();
    return db.getAll('exams');
  },
  async getByClass(classId: string): Promise<ExamRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('exams', 'by-class', classId);
  },
  async getByClassAndTerm(classId: string, term: string): Promise<ExamRecord[]> {
    const db = await getDB();
    const exams = await db.getAllFromIndex('exams', 'by-class', classId);
    return exams.filter(e => e.term === term);
  },
  async getById(id: string): Promise<ExamRecord | undefined> {
    const db = await getDB();
    return db.get('exams', id);
  },
  async getActiveExam(classId: string, term: string): Promise<ExamRecord | undefined> {
    const db = await getDB();
    const exams = await db.getAllFromIndex('exams', 'by-class', classId);
    return exams.find(e => e.term === term && e.isActive);
  },
  async add(exam: ExamRecord): Promise<void> {
    const db = await getDB();
    await db.add('exams', { ...exam, createdAt: Date.now(), updatedAt: Date.now() });
  },
  async update(exam: ExamRecord): Promise<void> {
    const db = await getDB();
    await db.put('exams', { ...exam, updatedAt: Date.now() });
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('exams', id);
  },
};

export const marksRepo = {
  async getByExam(examId: string): Promise<MarksRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('marks', 'by-exam', examId);
  },
  async getByStudent(studentId: string): Promise<MarksRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('marks', 'by-student', studentId);
  },
  async get(examId: string, studentId: string): Promise<MarksRecord | undefined> {
    const db = await getDB();
    return db.get('marks', [examId, studentId]);
  },
  async getAll(): Promise<MarksRecord[]> {
    const db = await getDB();
    return db.getAll('marks');
  },
  async set(examId: string, studentId: string, marks: Record<string, number | 'ABS' | null>): Promise<void> {
    const db = await getDB();
    await db.put('marks', { examId, studentId, marks, updatedAt: Date.now() });
  },
  async setBatch(entries: Array<{ examId: string; studentId: string; marks: Record<string, number | 'ABS' | null> }>): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('marks', 'readwrite');
    for (const entry of entries) {
      await tx.store.put({ ...entry, updatedAt: Date.now() });
    }
    await tx.done;
  },
  async delete(examId: string, studentId: string): Promise<void> {
    const db = await getDB();
    await db.delete('marks', [examId, studentId]);
  },
  async deleteByExam(examId: string): Promise<number> {
    const db = await getDB();
    const marks = await db.getAllFromIndex('marks', 'by-exam', examId);
    const tx = db.transaction('marks', 'readwrite');
    for (const m of marks) {
      await tx.store.delete([m.examId, m.studentId]);
    }
    await tx.done;
    return marks.length;
  },
  async deleteByStudent(studentId: string): Promise<number> {
    const db = await getDB();
    const marks = await db.getAllFromIndex('marks', 'by-student', studentId);
    const tx = db.transaction('marks', 'readwrite');
    for (const m of marks) {
      await tx.store.delete([m.examId, m.studentId]);
    }
    await tx.done;
    return marks.length;
  },
};

export const classesRepo = {
  async getAll(): Promise<ClassRecord[]> {
    const db = await getDB();
    return db.getAll('classes');
  },
  async getByStream(stream: string): Promise<ClassRecord | undefined> {
    const db = await getDB();
    return db.getFromIndex('classes', 'by-stream', stream);
  },
  async add(classRecord: ClassRecord): Promise<void> {
    const db = await getDB();
    await db.add('classes', { ...classRecord, createdAt: Date.now(), updatedAt: Date.now() });
  },
  async update(classRecord: ClassRecord): Promise<void> {
    const db = await getDB();
    await db.put('classes', { ...classRecord, updatedAt: Date.now() });
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('classes', id);
  },
};

export const settingsRepo = {
  async get(key: string): Promise<string | undefined> {
    const db = await getDB();
    const record = await db.get('settings', key);
    return record?.value;
  },
  async set(key: string, value: string): Promise<void> {
    const db = await getDB();
    await db.put('settings', { id: key, key, value });
  },
  async getAll(): Promise<Record<string, string>> {
    const db = await getDB();
    const records = await db.getAll('settings');
    return Object.fromEntries(records.map(r => [r.key, r.value]));
  },
};

export const syncQueueRepo = {
  async add(record: Omit<SyncRecord, 'id'>): Promise<number> {
    const db = await getDB();
    return db.add('syncQueue', record as SyncRecord);
  },
  async getPending(): Promise<SyncRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('syncQueue', 'by-status', 'pending');
  },
  async update(record: SyncRecord): Promise<void> {
    const db = await getDB();
    await db.put('syncQueue', record);
  },
  async markSynced(id: number): Promise<void> {
    const db = await getDB();
    const record = await db.get('syncQueue', id);
    if (record) {
      record.status = 'synced';
      await db.put('syncQueue', record);
    }
  },
  async markFailed(id: number, attempts: number): Promise<void> {
    const db = await getDB();
    const record = await db.get('syncQueue', id);
    if (record) {
      record.status = 'failed';
      record.attempts = attempts;
      record.lastAttempt = Date.now();
      await db.put('syncQueue', record);
    }
  },
};

export const schemaVersionRepo = {
  async get(): Promise<number> {
    const db = await getDB();
    const record = await db.get('schemaVersion', 'main');
    return record?.version || 0;
  },
  async set(version: number): Promise<void> {
    const db = await getDB();
    await db.put('schemaVersion', { id: 'main', version, migratedAt: Date.now() });
  },
};

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['schoolConfig', 'students', 'subjects', 'exams', 'marks', 'classes', 'settings', 'syncQueue'], 'readwrite');
  await Promise.all([
    tx.objectStore('schoolConfig').clear(),
    tx.objectStore('students').clear(),
    tx.objectStore('subjects').clear(),
    tx.objectStore('exams').clear(),
    tx.objectStore('marks').clear(),
    tx.objectStore('classes').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('syncQueue').clear(),
  ]);
  await tx.done;
}