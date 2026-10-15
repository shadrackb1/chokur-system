import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import type { Announcement } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';

export const AnnouncementsView: React.FC = () => {
  const { user, isOnline, isAdmin, isTeacher } = useAuth();
  const { schoolConfig, activeStream } = useGrading();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_roles: ['student', 'parent'] as ('admin' | 'teacher' | 'parent' | 'student')[],
    target_streams: [] as string[],
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    expires_at: '',
  });

  useEffect(() => {
    if (!isOnline || !user || !supabase) {
      setLoading(false);
      return;
    }
    loadAnnouncements();
  }, [isOnline, user]);

  const loadAnnouncements = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('school_id', user.school_id)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('[Announcements] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    try {
      const { error } = await supabase.from('announcements').insert({
        school_id: user.school_id,
        author_id: user.id,
        title: formData.title,
        content: formData.content,
        target_roles: formData.target_roles,
        target_streams: formData.target_streams.length > 0 ? formData.target_streams : null,
        priority: formData.priority,
        published_at: new Date().toISOString(),
        expires_at: formData.expires_at || null,
      });

      if (error) throw error;
      setShowCreate(false);
      setFormData({ title: '', content: '', target_roles: ['student', 'parent'], target_streams: [], priority: 'normal', expires_at: '' });
      loadAnnouncements();
    } catch (err) {
      console.error('[Announcements] Failed to create:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-[#991B1B] text-white';
      case 'high': return 'bg-[#C2410C] text-white';
      case 'normal': return 'bg-[#1D4ED8] text-white';
      case 'low': return 'bg-[#5F5E5E] text-white';
      default: return 'bg-[#5F5E5E] text-white';
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-[#7B1A2B]',
      teacher: 'bg-[#1D4ED8]',
      parent: 'bg-[#166534]',
      student: 'bg-[#C2410C]',
    };
    return colors[role] || 'bg-[#5F5E5E]';
  };

  if (!isOnline) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Announcements - Offline Mode</h2>
          <p className="text-[#5F5E5E]">Sign in online to view and create announcements.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2410C] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const canCreate = isAdmin || isTeacher;

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Announcements</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {schoolConfig.schoolName} · School-wide communications
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Announcement
          </button>
        )}
      </section>

      {/* Create Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#DDD6C7] flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">New Announcement</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#5F5E5E] hover:text-[#111111] text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                  placeholder="Important: Term 2 Exams Schedule"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                  placeholder="Dear parents and students..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Target Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {['student', 'parent', 'teacher', 'admin'].map(role => (
                      <label key={role} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.target_roles.includes(role as any)}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            target_roles: e.target.checked
                              ? [...prev.target_roles, role as any]
                              : prev.target_roles.filter(r => r !== role)
                          }))}
                          className="rounded border-[#DDD6C7] text-[#C2410C] focus:ring-[#C2410C]"
                        />
                        <span className="text-sm capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={e => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD6C7]">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-[#DDD6C7] text-[#111111] rounded hover:bg-[#F2EDE3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#C2410C] text-white rounded hover:opacity-95">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <section>
        {announcements.length === 0 ? (
          <div className="bg-white border border-[#DDD6C7] rounded p-12 text-center text-[#5F5E5E]">
            <span className="material-symbols-outlined text-4xl text-[#DDD6C7] mb-2 block">campaign</span>
            <h3 className="text-lg font-medium text-[#111111] mb-1">No Announcements</h3>
            <p>{canCreate ? 'Create the first announcement to get started.' : 'No announcements published yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <article
                key={announcement.id}
                className={`bg-white border border-[#DDD6C7] rounded overflow-hidden ${announcement.priority === 'urgent' ? 'border-l-4 border-[#991B1B]' : announcement.priority === 'high' ? 'border-l-4 border-[#C2410C]' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#111111]">{announcement.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {announcement.target_roles.map(role => (
                          <span key={role} className={`px-2 py-0.5 rounded text-xs ${getRoleBadge(role)} text-white`}>
                            {role}
                          </span>
                        ))}
                        {announcement.target_streams && announcement.target_streams.length > 0 && (
                          <>
                            {announcement.target_streams.map(stream => (
                              <span key={stream} className="px-2 py-0.5 rounded text-xs bg-[#F2EDE3] text-[#5F5E5E]">{stream}</span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-[#9A958A] shrink-0">
                      <div>Published: {new Date(announcement.published_at).toLocaleDateString()}</div>
                      {announcement.expires_at && (
                        <div>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-[#111111] whitespace-pre-wrap">{announcement.content}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};