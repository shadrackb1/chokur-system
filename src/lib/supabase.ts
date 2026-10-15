import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Environment variables not configured. Running in offline mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export const isOnlineMode = !!supabase;

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  motto: string;
  postal_address: string;
  contact_phone_email: string;
  academic_year: string;
  term: string;
  term_opening_date: string;
  term_closing_date: string;
  calculation_method: 'best7' | 'simpleMean';
  class_teacher: string;
  principal_name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  max_students: number;
  max_teachers: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  adm_no: string;
  name: string;
  stream: string;
  form: string;
  gender: 'Male' | 'Female';
  kcpe_marks: number;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
  parent_id?: string;
  parent_phone?: string;
  parent_email?: string;
  date_of_birth?: string;
  admission_date: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  code: string;
  name: string;
  department: string;
  entered: number;
  last_exam_mean: number;
  teacher_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassStream {
  id: string;
  school_id: string;
  name: string;
  form: string;
  stream: string;
  class_teacher_id?: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface ExamPeriod {
  id: string;
  school_id: string;
  name: string;
  term: string;
  year: number;
  type: 'Mid-term' | 'End-term' | 'Mock';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mark {
  id: string;
  student_id: string;
  subject_code: string;
  exam_id: string;
  value: number | 'ABS';
  entered_by: string;
  entered_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  school_id: string;
  user_id: string;
  tsc_number: string;
  department: string;
  subjects_taught: string[];
  assigned_streams: string[];
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface ParentProfile {
  id: string;
  school_id: string;
  user_id: string;
  phone: string;
  occupation?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  school_id: string;
  user_id: string;
  student_id: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  school_id: string;
  student_id: string;
  sender_id: string;
  sender_role: 'teacher' | 'parent' | 'admin';
  text: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  message_type: 'text' | 'report_card' | 'fee_reminder' | 'announcement';
  metadata?: Record<string, unknown>;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

export interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  form: string;
  term: string;
  year: number;
  amount: number;
  due_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  school_id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: number;
  payment_method: 'mpesa' | 'cash' | 'bank' | 'card' | 'cheque';
  mpesa_code?: string;
  paid_at: string;
  received_by: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface TimetableEntry {
  id: string;
  school_id: string;
  stream: string;
  subject_code: string;
  teacher_id: string;
  day_of_week: number;
  period: number;
  start_time: string;
  end_time: string;
  room?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  school_id?: string;
  subject_code: string;
  topic: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  source: 'kcse_past' | 'teacher_created' | 'curated';
  year?: number;
  paper?: number;
  question_number?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_code: string;
  title: string;
  description?: string;
  questions: string[];
  time_limit_minutes: number;
  max_attempts: number;
  start_at: string;
  end_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: number[];
  score: number;
  percentage: number;
  started_at: string;
  completed_at?: string;
  time_spent_seconds: number;
}

export interface Announcement {
  id: string;
  school_id: string;
  author_id: string;
  title: string;
  content: string;
  target_roles: UserRole[];
  target_streams?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  school_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}