import { supabase, isOnlineMode, type Student, type Subject, type ClassStream, type ExamPeriod, type Mark, type TeacherProfile, type SchoolConfig, type WhatsAppMessage, type TermConfig, type FeeStructure, type FeePayment, type TimetableEntry, type Question, type Quiz, type QuizAttempt, type Announcement, type StudentProfile, type ParentProfile, type UserProfile, type UserRole } from './supabase';
import type { MarkValue, StudentCalculation, SubjectDepartmentalStat, GradeDistributionTier, KCSEGrade, SchoolConfig as LocalSchoolConfig, ExamPeriod as LocalExamPeriod, TermConfig as LocalTermConfig, ClassStream as LocalClassStream, Subject as LocalSubject, Student as LocalStudent, TeacherProfile as LocalTeacherProfile, WhatsAppMessage as LocalWhatsAppMessage } from '../types';
import { rankAllStudents, getGradeFromScore, KCSE_GRADING_TABLE } from '../utils/grading';

const TABLES = {
  USER_PROFILES: 'user_profiles',
  SCHOOLS: 'schools',
  STUDENTS: 'students',
  SUBJECTS: 'subjects',
  CLASS_STREAMS: 'class_streams',
  EXAM_PERIODS: 'exam_periods',
  MARKS: 'marks',
  TEACHER_PROFILES: 'teacher_profiles',
  PARENT_PROFILES: 'parent_profiles',
  STUDENT_PROFILES: 'student_profiles',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  TERMS: 'terms',
  FEE_STRUCTURES: 'fee_structures',
  FEE_PAYMENTS: 'fee_payments',
  TIMETABLE_ENTRIES: 'timetable_entries',
  QUESTIONS: 'questions',
  QUIZZES: 'quizzes',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  ANNOUNCEMENTS: 'announcements',
  SUBSCRIPTIONS: 'subscriptions',
} as const;

function mapStudentFromDB(db: any): LocalStudent {
  return {
    id: db.id,
    admNo: db.adm_no,
    name: db.name,
    stream: db.stream,
    gender: db.gender,
    kcpeMarks: db.kcpe_marks,
    status: db.status,
  };
}

function mapSubjectFromDB(db: any): LocalSubject {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    department: db.department,
    entered: db.entered,
    lastExamMean: db.last_exam_mean,
    teacher: db.teacher_id,
  };
}

function mapStreamFromDB(db: any): LocalClassStream {
  return {
    id: db.id,
    name: db.name,
    form: db.form,
    stream: db.stream,
    classTeacher: db.class_teacher_id,
  };
}

function mapExamFromDB(db: any): LocalExamPeriod {
  return {
    id: db.id,
    name: db.name,
    term: db.term,
    year: db.year,
    type: db.type,
  };
}

function mapTermFromDB(db: any): LocalTermConfig {
  return {
    id: db.id,
    name: db.name,
    year: db.year,
    startDate: db.start_date,
    endDate: db.end_date,
  };
}

function mapSchoolConfigFromDB(db: any): LocalSchoolConfig {
  return {
    schoolName: db.name,
    motto: db.motto,
    postalAddress: db.postal_address,
    contactPhoneEmail: db.contact_phone_email,
    academicYear: db.academic_year,
    term: db.term,
    termOpeningDate: db.term_opening_date,
    termClosingDate: db.term_closing_date,
    calculationMethod: db.calculation_method,
    classTeacher: db.class_teacher,
    principalName: db.principal_name,
  };
}

function mapTeacherProfileFromDB(db: any): LocalTeacherProfile {
  return {
    name: db.full_name,
    tscNumber: db.tsc_number,
    email: db.email,
    phone: db.phone,
    department: db.department,
    assignedStream: db.assigned_streams[0] || '',
    subjectsTaught: db.subjects_taught,
  };
}

function mapWhatsAppMessageFromDB(db: any): LocalWhatsAppMessage {
  return {
    id: db.id,
    studentId: db.student_id,
    studentAdm: '',
    studentName: '',
    parentPhone: '',
    parentName: '',
    sender: db.sender_role,
    text: db.text,
    timestamp: db.sent_at,
    status: db.status,
  };
}

function mapMarkValue(value: number | 'ABS' | null): MarkValue {
  if (value === 'ABS') return 'ABS';
  if (value === null) return null;
  return value;
}

export class SupabaseService {
  private schoolId: string;

  constructor(schoolId: string) {
    this.schoolId = schoolId;
  }

  async getSchoolConfig(): Promise<LocalSchoolConfig | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.SCHOOLS)
      .select('*')
      .eq('id', this.schoolId)
      .single();

    if (error || !data) return null;
    return mapSchoolConfigFromDB(data);
  }

  async updateSchoolConfig(config: Partial<LocalSchoolConfig>): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const updates: Record<string, any> = {};
    if (config.schoolName) updates.name = config.schoolName;
    if (config.motto) updates.motto = config.motto;
    if (config.postalAddress) updates.postal_address = config.postalAddress;
    if (config.contactPhoneEmail) updates.contact_phone_email = config.contactPhoneEmail;
    if (config.academicYear) updates.academic_year = config.academicYear;
    if (config.term) updates.term = config.term;
    if (config.termOpeningDate) updates.term_opening_date = config.termOpeningDate;
    if (config.termClosingDate) updates.term_closing_date = config.termClosingDate;
    if (config.calculationMethod) updates.calculation_method = config.calculationMethod;
    if (config.classTeacher) updates.class_teacher = config.classTeacher;
    if (config.principalName) updates.principal_name = config.principalName;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(TABLES.SCHOOLS)
      .update(updates)
      .eq('id', this.schoolId);

    return !error;
  }

  async getStudents(): Promise<LocalStudent[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('adm_no');

    if (error || !data) return [];
    return data.map(mapStudentFromDB);
  }

  async getStudentsByStream(stream: string): Promise<LocalStudent[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .select('*')
      .eq('school_id', this.schoolId)
      .eq('stream', stream)
      .eq('status', 'Active')
      .order('adm_no');

    if (error || !data) return [];
    return data.map(mapStudentFromDB);
  }

  async addStudent(student: Omit<LocalStudent, 'id'>): Promise<LocalStudent | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .insert({
        school_id: this.schoolId,
        adm_no: student.admNo,
        name: student.name,
        stream: student.stream,
        form: student.stream.split(' ')[0] || 'Form 1',
        gender: student.gender,
        kcpe_marks: student.kcpeMarks,
        status: student.status,
        admission_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapStudentFromDB(data);
  }

  async updateStudent(student: LocalStudent): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.STUDENTS)
      .update({
        adm_no: student.admNo,
        name: student.name,
        stream: student.stream,
        gender: student.gender,
        kcpe_marks: student.kcpeMarks,
        status: student.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.id)
      .eq('school_id', this.schoolId);

    return !error;
  }

  async removeStudent(studentId: string): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.STUDENTS)
      .delete()
      .eq('id', studentId)
      .eq('school_id', this.schoolId);

    return !error;
  }

  async getSubjects(): Promise<LocalSubject[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.SUBJECTS)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('code');

    if (error || !data) return [];
    return data.map(mapSubjectFromDB);
  }

  async addSubject(subject: Omit<LocalSubject, 'id'>): Promise<LocalSubject | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.SUBJECTS)
      .insert({
        school_id: this.schoolId,
        code: subject.code.toUpperCase(),
        name: subject.name,
        department: subject.department,
        entered: subject.entered,
        last_exam_mean: subject.lastExamMean,
        teacher_id: subject.teacher,
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapSubjectFromDB(data);
  }

  async updateSubject(subject: LocalSubject): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.SUBJECTS)
      .update({
        code: subject.code.toUpperCase(),
        name: subject.name,
        department: subject.department,
        entered: subject.entered,
        last_exam_mean: subject.lastExamMean,
        teacher_id: subject.teacher,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subject.id)
      .eq('school_id', this.schoolId);

    return !error;
  }

  async removeSubject(subjectCode: string): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.SUBJECTS)
      .delete()
      .eq('code', subjectCode.toUpperCase())
      .eq('school_id', this.schoolId);

    return !error;
  }

  async getStreams(): Promise<LocalClassStream[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.CLASS_STREAMS)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('form, stream');

    if (error || !data) return [];
    return data.map(mapStreamFromDB);
  }

  async getExams(): Promise<LocalExamPeriod[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.EXAM_PERIODS)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('year', { ascending: false })
      .order('term');

    if (error || !data) return [];
    return data.map(mapExamFromDB);
  }

  async getTerms(): Promise<LocalTermConfig[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.TERMS)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('year', { ascending: false });

    if (error || !data) return [];
    return data.map(mapTermFromDB);
  }

  async getMarks(examId?: string): Promise<Record<string, Record<string, MarkValue>>> {
    if (!isOnlineMode || !supabase) return {};

    let query = supabase
      .from(TABLES.MARKS)
      .select('*')
      .eq('school_id', this.schoolId);

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    const { data, error } = await query;

    if (error || !data) return {};

    const marksMap: Record<string, Record<string, MarkValue>> = {};
    for (const mark of data) {
      if (!marksMap[mark.student_id]) {
        marksMap[mark.student_id] = {};
      }
      marksMap[mark.student_id][mark.subject_code] = mapMarkValue(mark.value);
    }

    return marksMap;
  }

  async updateMark(studentId: string, subjectCode: string, value: MarkValue, examId: string, enteredBy: string): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const dbValue = value === 'ABS' ? 'ABS' : (value === null ? null : value);

    const { error } = await supabase
      .from(TABLES.MARKS)
      .upsert({
        school_id: this.schoolId,
        student_id: studentId,
        subject_code: subjectCode.toUpperCase(),
        exam_id: examId,
        value: dbValue,
        entered_by: enteredBy,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,subject_code,exam_id',
      });

    return !error;
  }

  async batchUpdateMarks(updates: Array<{ studentId: string; subjectCode: string; value: MarkValue }>, examId: string, enteredBy: string): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const records = updates.map(u => ({
      school_id: this.schoolId,
      student_id: u.studentId,
      subject_code: u.subjectCode.toUpperCase(),
      exam_id: examId,
      value: u.value === 'ABS' ? 'ABS' : (u.value === null ? null : u.value),
      entered_by: enteredBy,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from(TABLES.MARKS)
      .upsert(records, {
        onConflict: 'student_id,subject_code,exam_id',
      });

    return !error;
  }

  async getTeacherProfile(userId: string): Promise<LocalTeacherProfile | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.TEACHER_PROFILES)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return mapTeacherProfileFromDB(data);
  }

  async getWhatsAppMessages(studentId?: string): Promise<LocalWhatsAppMessage[]> {
    if (!isOnlineMode || !supabase) return [];

    let query = supabase
      .from(TABLES.WHATSAPP_MESSAGES)
      .select('*')
      .eq('school_id', this.schoolId)
      .order('sent_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query.limit(100);

    if (error || !data) return [];
    return data.map(mapWhatsAppMessageFromDB);
  }

  async sendWhatsAppMessage(message: Omit<LocalWhatsAppMessage, 'id' | 'timestamp' | 'status'>): Promise<LocalWhatsAppMessage | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.WHATSAPP_MESSAGES)
      .insert({
        school_id: this.schoolId,
        student_id: message.studentId,
        sender_id: message.sender === 'teacher' ? 'teacher' : 'parent',
        sender_role: message.sender,
        text: message.text,
        status: 'sent',
        message_type: 'text',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapWhatsAppMessageFromDB(data);
  }

  async computeRankings(stream: string, examId: string, calculationMethod: 'best7' | 'simpleMean' = 'best7'): Promise<StudentCalculation[]> {
    const students = await this.getStudentsByStream(stream);
    const subjects = await this.getSubjects();
    const marks = await this.getMarks(examId);

    const studentMarksMap: Record<string, Record<string, MarkValue>> = {};
    for (const student of students) {
      studentMarksMap[student.id] = marks[student.id] || {};
    }

    return rankAllStudents(students, studentMarksMap, subjects, calculationMethod);
  }

  async getSubjectStats(stream: string, examId: string): Promise<SubjectDepartmentalStat[]> {
    const students = await this.getStudentsByStream(stream);
    const subjects = await this.getSubjects();
    const marks = await this.getMarks(examId);

    return subjects.map(subj => {
      const subjectScores: number[] = [];
      students.forEach(student => {
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
      const passed = subjectScores.filter(s => s >= 50).length;
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
  }

  async getGradeDistribution(rankings: StudentCalculation[]): Promise<GradeDistributionTier[]> {
    const totalCount = rankings.length || 1;
    let cumulative = 0;

    return KCSE_GRADING_TABLE.map(row => {
      const count = rankings.filter(r => r.meanGrade === row.grade).length;
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
  }

  subscribeToMarks(callback: (payload: any) => void) {
    if (!isOnlineMode || !supabase) return () => {};

    const channel = supabase
      .channel(`marks:${this.schoolId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.MARKS,
          filter: `school_id=eq.${this.schoolId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToStudents(callback: (payload: any) => void) {
    if (!isOnlineMode || !supabase) return () => {};

    const channel = supabase
      .channel(`students:${this.schoolId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.STUDENTS,
          filter: `school_id=eq.${this.schoolId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToMessages(callback: (payload: any) => void) {
    if (!isOnlineMode || !supabase) return () => {};

    const channel = supabase
      .channel(`messages:${this.schoolId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.WHATSAPP_MESSAGES,
          filter: `school_id=eq.${this.schoolId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async getFeeStructures(form?: string, term?: string, year?: number): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    let query = supabase
      .from(TABLES.FEE_STRUCTURES)
      .select('*')
      .eq('school_id', this.schoolId)
      .eq('is_active', true);

    if (form) query = query.eq('form', form);
    if (term) query = query.eq('term', term);
    if (year) query = query.eq('year', year);

    const { data, error } = await query.order('due_date');
    if (error || !data) return [];
    return data;
  }

  async getFeePayments(studentId?: string): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    let query = supabase
      .from(TABLES.FEE_PAYMENTS)
      .select('*')
      .eq('school_id', this.schoolId);

    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query.order('paid_at', { ascending: false });
    if (error || !data) return [];
    return data;
  }

  async recordFeePayment(payment: Omit<FeePayment, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.FEE_PAYMENTS)
      .insert({
        ...payment,
        school_id: this.schoolId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return !error;
  }

  async getTimetable(stream: string): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.TIMETABLE_ENTRIES)
      .select('*')
      .eq('school_id', this.schoolId)
      .eq('stream', stream)
      .eq('is_active', true)
      .order('day_of_week')
      .order('period');

    if (error || !data) return [];
    return data;
  }

  async getQuestions(subjectCode?: string, topic?: string): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    let query = supabase
      .from(TABLES.QUESTIONS)
      .select('*')
      .eq('is_active', true);

    if (subjectCode) query = query.eq('subject_code', subjectCode.toUpperCase());
    if (topic) query = query.ilike('topic', `%${topic}%`);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(500);
    if (error || !data) return [];
    return data;
  }

  async getQuizzes(subjectCode?: string): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    let query = supabase
      .from(TABLES.QUIZZES)
      .select('*')
      .eq('school_id', this.schoolId)
      .eq('is_published', true);

    if (subjectCode) query = query.eq('subject_code', subjectCode.toUpperCase());

    const { data, error } = await query.order('start_at', { ascending: false });
    if (error || !data) return [];
    return data;
  }

  async submitQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<boolean> {
    if (!isOnlineMode || !supabase) return false;

    const { error } = await supabase
      .from(TABLES.QUIZ_ATTEMPTS)
      .insert({
        ...attempt,
        school_id: this.schoolId,
      });

    return !error;
  }

  async getAnnouncements(userRole: UserRole, studentStream?: string): Promise<any[]> {
    if (!isOnlineMode || !supabase) return [];

    const { data, error } = await supabase
      .from(TABLES.ANNOUNCEMENTS)
      .select('*')
      .eq('school_id', this.schoolId)
      .eq('is_published', true)
      .or(`target_roles.cs.{${userRole}},target_roles.cs.{all}`)
      .order('published_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    if (studentStream) {
      return data.filter(a => !a.target_streams || a.target_streams.length === 0 || a.target_streams.includes(studentStream));
    }

    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isOnlineMode || !supabase) return null;

    const { data, error } = await supabase
      .from(TABLES.USER_PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  }
}

export function createSupabaseService(schoolId: string): SupabaseService {
  return new SupabaseService(schoolId);
}