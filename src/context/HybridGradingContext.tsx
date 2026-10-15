import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useGrading as useLocalGrading } from './GradingContext';
import { SupabaseService, createSupabaseService } from '../lib/supabaseService';
import { isOnlineMode } from '../lib/supabase';
import type { StudentCalculation, SubjectDepartmentalStat, GradeDistributionTier, KCSEGrade, SchoolConfig, ExamPeriod, TermConfig, ClassStream, Subject, Student, TeacherProfile, WhatsAppMessage, MarkValue, ViewType } from '../types';

interface HybridGradingContextType {
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'conflict';
  lastSyncedAt: string | null;
  forceSync: () => Promise<void>;
  switchToOnline: () => Promise<void>;
  switchToOffline: () => void;
}

const HybridGradingContext = createContext<HybridGradingContextType | undefined>(undefined);

export const HybridGradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, school, isOnline, loading: authLoading } = useAuth();
  const local = useLocalGrading();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'conflict'>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [supabaseService, setSupabaseService] = useState<SupabaseService | null>(null);

  useEffect(() => {
    if (isOnline && school && !supabaseService) {
      setSupabaseService(createSupabaseService(school.id));
    } else if (!isOnline) {
      setSupabaseService(null);
    }
  }, [isOnline, school, supabaseService]);

  const forceSync = useCallback(async () => {
    if (!isOnline || !supabaseService || !school) return;

    setSyncStatus('syncing');

    try {
      const onlineConfig = await supabaseService.getSchoolConfig();
      if (onlineConfig) {
        local.updateSchoolConfig(onlineConfig);
      }

      const onlineStudents = await supabaseService.getStudents();
      for (const student of onlineStudents) {
        const exists = local.students.find(s => s.id === student.id);
        if (!exists) {
          local.addStudent(student);
        } else {
          local.updateStudent(student);
        }
      }

      const onlineSubjects = await supabaseService.getSubjects();
      for (const subject of onlineSubjects) {
        const exists = local.subjects.find(s => s.id === subject.id);
        if (!exists) {
          local.addSubject(subject);
        } else {
          local.updateSubject(subject);
        }
      }

      const onlineStreams = await supabaseService.getStreams();
      for (const stream of onlineStreams) {
        const exists = local.streams.find(s => s.id === stream.id);
        if (!exists) {
          local.addClassStream(stream);
        } else {
          local.updateClassStream(stream);
        }
      }

      const onlineExams = await supabaseService.getExams();
      for (const exam of onlineExams) {
        const exists = local.exams.find(e => e.id === exam.id);
        if (!exists) {
          local.addExamPeriod(exam);
        } else {
          local.updateExamPeriod(exam);
        }
      }

      const onlineTerms = await supabaseService.getTerms();
      for (const term of onlineTerms) {
        const exists = local.terms.find(t => t.id === term.id);
        if (!exists) {
          // Terms don't have add method, would need to be added
        }
      }

      const onlineMarks = await supabaseService.getMarks(local.activeExam);
      for (const [studentId, marks] of Object.entries(onlineMarks)) {
        for (const [subjectCode, value] of Object.entries(marks)) {
          local.updateMark(studentId, subjectCode, value);
        }
      }

      const onlineMessages = await supabaseService.getWhatsAppMessages();
      for (const msg of onlineMessages) {
        const exists = local.whatsAppMessages.find(m => m.id === msg.id);
        if (!exists) {
          local.sendWhatsAppMessage({
            studentId: msg.studentId,
            studentAdm: msg.studentAdm,
            studentName: msg.studentName,
            parentPhone: msg.parentPhone,
            parentName: msg.parentName,
            sender: msg.sender,
            text: msg.text,
          });
        }
      }

      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[Hybrid] Sync failed:', err);
      setSyncStatus('conflict');
    }
  }, [isOnline, supabaseService, school, local]);

  useEffect(() => {
    if (isOnline && supabaseService) {
      forceSync();

      const unsubscribeMarks = supabaseService.subscribeToMarks(() => {
        if (isOnline) forceSync();
      });

      const unsubscribeStudents = supabaseService.subscribeToStudents(() => {
        if (isOnline) forceSync();
      });

      const unsubscribeMessages = supabaseService.subscribeToMessages(() => {
        if (isOnline) forceSync();
      });

      return () => {
        unsubscribeMarks();
        unsubscribeStudents();
        unsubscribeMessages();
      };
    }
  }, [isOnline, supabaseService, forceSync]);

  const switchToOnline = useCallback(async () => {
    if (!isOnlineMode) return;
    if (school && !supabaseService) {
      setSupabaseService(createSupabaseService(school.id));
      await forceSync();
    }
  }, [school, supabaseService, forceSync]);

  const switchToOffline = useCallback(() => {
    setSupabaseService(null);
    setSyncStatus('offline');
  }, []);

  const value: HybridGradingContextType = {
    isOnline: isOnline && !!supabaseService,
    syncStatus,
    lastSyncedAt,
    forceSync,
    switchToOnline,
    switchToOffline,
  };

  return (
    <HybridGradingContext.Provider value={value}>
      {children}
    </HybridGradingContext.Provider>
  );
};

export const useHybridGrading = () => {
  const context = useContext(HybridGradingContext);
  if (!context) {
    throw new Error('useHybridGrading must be used within a HybridGradingProvider');
  }
  return context;
};

export const useGrading = () => {
  const local = useLocalGrading();
  const hybrid = useHybridGrading();

  const merged = useMemo(() => ({
    ...local,
    isOnline: hybrid.isOnline,
    syncStatus: hybrid.syncStatus,
    lastSyncedAt: hybrid.lastSyncedAt,
    forceSync: hybrid.forceSync,
    switchToOnline: hybrid.switchToOnline,
    switchToOffline: hybrid.switchToOffline,
  }), [local, hybrid]);

  return merged;
};