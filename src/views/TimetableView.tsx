import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import type { TimetableEntry, Subject, Student } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

export const TimetableView: React.FC = () => {
  const { user, isOnline, isAdmin, isTeacher } = useAuth();
  const { streams, subjects, activeStream } = useGrading();

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    stream: activeStream,
    subject_code: '',
    teacher_id: '',
    day_of_week: 0,
    period: 1,
    start_time: '08:00',
    end_time: '08:40',
    room: '',
  });

  useEffect(() => {
    if (!isOnline || !user || !supabase) {
      setLoading(false);
      return;
    }
    loadTimetable();
  }, [isOnline, user, activeStream]);

  const loadTimetable = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('stream', activeStream)
        .eq('is_active', true)
        .order('day_of_week')
        .order('period');

      if (error) throw error;
      setTimetable(data || []);
    } catch (err) {
      console.error('[Timetable] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    try {
      const { error } = await supabase.from('timetable_entries').insert({
        school_id: user.school_id,
        ...formData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setShowCreate(false);
      loadTimetable();
    } catch (err) {
      console.error('[Timetable] Failed to create:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from('timetable_entries').delete().eq('id', id);
    loadTimetable();
  };

  const grid = useMemo(() => {
    const grid: Record<number, Record<number, TimetableEntry | null>> = {};
    DAYS.forEach((_, d) => {
      PERIODS.forEach(p => { grid[d] = grid[d] || {}; grid[d][p] = null; });
    });
    timetable.forEach(entry => {
      if (grid[entry.day_of_week] && grid[entry.day_of_week][entry.period]) {
        grid[entry.day_of_week][entry.period] = entry;
      }
    });
    return grid;
  }, [timetable]);

  const mySubjects = useMemo(() => {
    if (!user || user.role !== 'teacher') return subjects.map(s => s.code);
    return user.subjectsTaught || [];
  }, [subjects, user]);

  if (!isOnline) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Timetable - Offline Mode</h2>
          <p className="text-[#5F5E5E]">Sign in online to view and manage timetables.</p>
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

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Class Timetable</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {activeStream} · {DAYS.length} days · {PERIODS.length} periods
          </p>
        </div>
        {(isAdmin || isTeacher) && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95">
            <span className="material-symbols-outlined mr-1">add</span> Add Entry
          </button>
        )}
      </section>

      {/* Stream Selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-label-caps text-label-caps text-[#5F5E5E]">Stream:</label>
        <select
          value={formData.stream}
          onChange={e => setFormData(prev => ({ ...prev, stream: e.target.value }))}
          className="px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
        >
          {streams.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Timetable Grid */}
      <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-2 w-20 sticky left-0 z-10 bg-[#F8F3E9]">PERIOD / DAY</th>
                {DAYS.map((day, d) => (
                  <th key={day} className="py-2 px-2 text-center min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="divide-y divide-[#DDD6C7]">
                  <td className="py-2 px-2 font-tabular-sm font-medium text-[#111111] bg-[#F8F3E9] sticky left-0 z-10 border-r border-[#DDD6C7]">
                    Period {period}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const entry = grid[dayIndex]?.[period];
                    const subject = entry ? subjects.find(s => s.code === entry.subject_code) : null;
                    const isMySubject = subject && mySubjects.includes(subject.code);

                    return (
                      <td key={dayIndex} className="py-2 px-2 min-w-[140px] max-h-32 overflow-hidden relative">
                        {entry ? (
                          <div className={`p-2 rounded text-xs h-full ${isMySubject ? 'bg-[#FEF3E2] border border-[#C2410C]' : 'bg-[#FBF8F1]'} border border-[#DDD6C7]`}>
                            <div className="font-semibold text-[#111111]">{subject?.code || entry.subject_code}</div>
                            <div className="text-[#5F5E5E] truncate">{subject?.name || 'Unknown'}</div>
                            <div className="text-[#9A958A]">{entry.room || '—'}</div>
                            <div className="text-[#9A958A]">{entry.start_time} - {entry.end_time}</div>
                            {(isAdmin || isTeacher) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                className="absolute top-1 right-1 text-[#9A958A] hover:text-[#C2410C] text-xs p-1"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="h-full border-2 border-dashed border-[#DDD6C7] rounded"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {timetable.length === 0 && (
          <div className="p-12 text-center text-[#5F5E5E]">
            <span className="material-symbols-outlined text-4xl text-[#DDD6C7] mb-2 block">schedule</span>
            <h3 className="text-lg font-medium text-[#111111] mb-1">No Timetable Entries</h3>
            <p>Add periods to build the class schedule.</p>
          </div>
        )}
      </section>

      {/* Create Entry Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#DDD6C7] flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Add Timetable Entry</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#5F5E5E] hover:text-[#111111] text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Stream</label>
                <select value={formData.stream} onChange={e => setFormData(prev => ({ ...prev, stream: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                  {streams.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Subject</label>
                <select value={formData.subject_code} onChange={e => setFormData(prev => ({ ...prev, subject_code: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                  {subjects.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Day</label>
                  <select value={formData.day_of_week} onChange={e => setFormData(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Period</label>
                  <select value={formData.period} onChange={e => setFormData(prev => ({ ...prev, period: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                    {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Start Time</label>
                  <input type="time" value={formData.start_time} onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">End Time</label>
                  <input type="time" value={formData.end_time} onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Room</label>
                <input value={formData.room} onChange={e => setFormData(prev => ({ ...prev, room: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" placeholder="Lab 1, Room 10" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD6C7]">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-[#DDD6C7] text-[#111111] rounded hover:bg-[#F2EDE3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#C2410C] text-white rounded hover:opacity-95">Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};