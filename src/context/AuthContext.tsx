import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isOnlineMode, type UserProfile, type UserRole, type School } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  school: School | null;
  session: unknown;
  loading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, schoolData?: Partial<School>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!isOnlineMode || !supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setUser(profile);

        if (profile.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('*')
            .eq('id', profile.school_id)
            .single();
          if (schoolData) setSchool(schoolData);
        }

        return profile;
      }
    } catch (err) {
      console.error('[Auth] Failed to fetch user profile:', err);
    }
    return null;
  }, []);

  const fetchSchool = useCallback(async (schoolId: string) => {
    if (!isOnlineMode || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (error) throw error;
      if (data) setSchool(data);
      return data;
    } catch (err) {
      console.error('[Auth] Failed to fetch school:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isOnlineMode || !supabase) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setUser(null);
        setSchool(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    if (!isOnlineMode || !supabase) {
      return { error: new Error('Online mode not configured') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ?? null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    schoolData?: Partial<School>
  ) => {
    if (!isOnlineMode || !supabase) {
      return { error: new Error('Online mode not configured') };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      if (authError) throw authError;

      if (authData.user && schoolData && role === 'admin') {
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: schoolData.name || 'New School',
            motto: schoolData.motto || 'Excellence in Education',
            postal_address: schoolData.postal_address || '',
            contact_phone_email: schoolData.contact_phone_email || email,
            academic_year: schoolData.academic_year || new Date().getFullYear().toString(),
            term: schoolData.term || 'Term 1',
            term_opening_date: schoolData.term_opening_date || new Date().toISOString().split('T')[0],
            term_closing_date: schoolData.term_closing_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
            calculation_method: schoolData.calculation_method || 'best7',
            class_teacher: schoolData.class_teacher || fullName,
            principal_name: schoolData.principal_name || fullName,
            subscription_tier: 'trial',
            subscription_status: 'trialing',
            max_students: 500,
            max_teachers: 20,
          })
          .select()
          .single();

        if (schoolError) throw schoolError;

        await supabase.from('user_profiles').update({ school_id: school.id }).eq('id', authData.user.id);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (!isOnlineMode || !supabase) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSchool(null);
      setSession(null);
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isOnlineMode || !supabase) {
      return { error: new Error('Online mode not configured') };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ?? null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isOnlineMode || !supabase || !user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshSession = async () => {
    if (!isOnlineMode || !supabase) return;

    try {
      const { data: { session: newSession } } = await supabase.auth.refreshSession();
      setSession(newSession);
      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      }
    } catch (err) {
      console.error('[Auth] Refresh session error:', err);
    }
  };

  const hasRole = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    school,
    session,
    loading,
    isOnline: isOnlineMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    hasRole,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isParent: user?.role === 'parent',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};