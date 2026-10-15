import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import { GradeChip } from '../components/GradeChip';
import type { StudentCalculation, Subject, Student, SubjectDepartmentalStat } from '../types';

export const TeacherDashboardView: React.FC = () => {
  const { user, isOnline } = useAuth();
  const { rankings, subjects, filteredStudents, marks, activeExam, activeStream, classAverage, passRate, meanGrade, subjectDepartmentalStats } = useGrading();

  const mySubjects = useMemo(() => {
    if (!user) return subjects;
    const teacherSubjects = user.subjectsTaught || [];
    if (teacherSubjects.length === 0) return subjects;
    return subjects.filter(s => teacherSubjects.includes(s.code));
  }, [subjects, user]);

  const mySubjectStats = useMemo(() => {
    return subjectDepartmentalStats.filter(stat => mySubjects.some(s => s.code === stat.subject.code));
  }, [subjectDepartmentalStats, mySubjects]);

  const weakStudents = useMemo(() => {
    return rankings
      .filter(r => r.meanPoints < 6.5)
      .slice(0, 10);
  }, [rankings]);

  if (!isOnline || (user?.role !== 'teacher' && user?.role !== 'admin')) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Teacher Dashboard - Access Required</h2>
          <p className="text-[#5F5E5E]">Sign in as a teacher to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Teacher Dashboard</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {activeStream} · {activeExam} · {mySubjects.length} subject(s) assigned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#EFF6FF] text-[#1D4ED8] text-xs font-medium rounded">TEACHER</span>
          <span className="text-xs text-[#5F5E5E]">{user?.full_name}</span>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MY STUDENTS</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{filteredStudents.length}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">CLASS AVERAGE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{classAverage.toFixed(1)}%</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">PASS RATE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{passRate}%</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN GRADE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{meanGrade}</div>
        </div>
      </section>

      {/* My Subjects Performance */}
      <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden mb-6">
        <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-[#111111]">My Subjects Performance</h2>
          <a href="#marks-entry" className="text-[#C2410C] text-sm font-medium hover:underline">Enter Marks →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-3">SUBJECT</th>
                <th className="py-2 px-3 text-right">ENTERED</th>
                <th className="py-2 px-3 text-right">AVERAGE</th>
                <th className="py-2 px-3 text-right">HIGHEST</th>
                <th className="py-2 px-3 text-right">LOWEST</th>
                <th className="py-2 px-3 text-right">PASS %</th>
                <th className="py-2 px-3 text-right">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {mySubjectStats.map(({ subject, average, highest, lowest, passRate, entered, diffFromLastExam }) => (
                <tr key={subject.code} className="hover:bg-[#FBF8F1]">
                  <td className="py-2 px-3 font-medium">
                    <span className="font-semibold">{subject.code}</span> {subject.name}
                  </td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{entered}/{filteredStudents.length}</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{average.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{highest}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{lowest}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{passRate}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">
                    <span className={diffFromLastExam >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}>{diffFromLastExam >= 0 ? '+' : ''}{diffFromLastExam.toFixed(1)}</span>
                  </td>
                </tr>
              ))}
              {mySubjectStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5F5E5E]">No subjects assigned or no marks entered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Students Needing Attention */}
      <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden mb-6">
        <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-[#111111] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C2410C]">warning</span>
            Students Needing Attention (Below C+)
          </h2>
          <a href="#rankings" className="text-[#C2410C] text-sm font-medium hover:underline">View All Rankings →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-3">RANK</th>
                <th className="py-2 px-3">STUDENT</th>
                <th className="py-2 px-3">ADM NO</th>
                <th className="py-2 px-3 text-right">MEAN POINTS</th>
                <th className="py-2 px-3 text-right">AGGREGATE</th>
                <th className="py-2 px-3">GRADE</th>
                <th className="py-2 px-3">WEAKEST SUBJECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {weakStudents.map(student => (
                <tr key={student.student.id} className="hover:bg-[#FBF8F1]">
                  <td className="py-2 px-3 font-tabular-sm font-bold text-[#C2410C]">#{student.rank}</td>
                  <td className="py-2 px-3 font-medium">{student.student.name}</td>
                  <td className="py-2 px-3 font-tabular-sm text-[#5F5E5E]">{student.student.admNo}</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{student.meanPoints.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{student.aggregate}/84</td>
                  <td className="py-2 px-3"><GradeChip grade={student.meanGrade} size="sm" /></td>
                  <td className="py-2 px-3 text-[#5F5E5E]">
                    {student.weakestSubject ? (
                      <span className="bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA] text-xs text-[#991B1B]">
                        {student.weakestSubject.code} {student.weakestSubject.score}%
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {weakStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#166534] font-medium">
                    All students are above the C+ cutoff! 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="#marks-entry" className="bg-white border border-[#DDD6C7] p-4 rounded hover:border-[#C2410C] hover:bg-[#FEF3E2] transition-colors">
          <span className="material-symbols-outlined text-[#C2410C] text-2xl mb-2 block">edit_note</span>
          <h3 className="font-semibold text-[#111111] mb-1">Enter Marks</h3>
          <p className="text-sm text-[#5F5E5E]">Input scores for your subjects</p>
        </a>
        <a href="#rankings" className="bg-white border border-[#DDD6C7] p-4 rounded hover:border-[#C2410C] hover:bg-[#FEF3E2] transition-colors">
          <span className="material-symbols-outlined text-[#C2410C] text-2xl mb-2 block">leaderboard</span>
          <h3 className="font-semibold text-[#111111] mb-1">View Rankings</h3>
          <p className="text-sm text-[#5F5E5E]">Check student positions</p>
        </a>
        <a href="#report-cards" className="bg-white border border-[#DDD6C7] p-4 rounded hover:border-[#C2410C] hover:bg-[#FEF3E2] transition-colors">
          <span className="material-symbols-outlined text-[#C2410C] text-2xl mb-2 block">badge</span>
          <h3 className="font-semibold text-[#111111] mb-1">Report Cards</h3>
          <p className="text-sm text-[#5F5E5E]">Generate & print report cards</p>
        </a>
        <a href="#subject-analysis" className="bg-white border border-[#DDD6C7] p-4 rounded hover:border-[#C2410C] hover:bg-[#FEF3E2] transition-colors">
          <span className="material-symbols-outlined text-[#C2410C] text-2xl mb-2 block">analytics</span>
          <h3 className="font-semibold text-[#111111] mb-1">Subject Analysis</h3>
          <p className="text-sm text-[#5F5E5E]">Deep-dive into performance</p>
        </a>
      </section>
    </div>
  );
};