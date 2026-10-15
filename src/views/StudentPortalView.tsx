import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import { GradeChip } from '../components/GradeChip';
import { getGradeFromScore } from '../utils/grading';
import type { StudentCalculation, Subject } from '../types';

export const StudentPortalView: React.FC = () => {
  const { user, isOnline } = useAuth();
  const { rankings, subjects, marks, schoolConfig, activeExam, activeStream } = useGrading();

  const studentCalculation = useMemo(() => {
    if (!user) return null;
    return rankings.find(r => r.student.id === user.id) || null;
  }, [rankings, user]);

  const studentMarks = useMemo(() => {
    if (!studentCalculation) return {};
    return marks[studentCalculation.student.id] || {};
  }, [marks, studentCalculation]);

  if (!isOnline) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Student Portal - Offline Mode</h2>
          <p className="text-[#5F5E5E]">Please sign in online to access your student portal.</p>
        </div>
      </div>
    );
  }

  if (!studentCalculation) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-[#111111] mb-2">Student Profile Not Linked</h2>
          <p className="text-[#5F5E5E]">Your account is not linked to a student record. Please contact your school administrator.</p>
        </div>
      </div>
    );
  }

  const subjectRows = subjects.map(subj => {
    const val = studentMarks[subj.code];
    const isAbs = val === 'ABS';
    const gradeInfo = getGradeFromScore(val);

    return (
      <tr key={subj.code} className="hover:bg-[#FBF8F1]">
        <td className="py-2 px-2 font-medium">
          <span className="font-semibold">{subj.code}</span> · {subj.name}
        </td>
        <td className="py-2 px-2 text-center font-tabular-sm">
          {isAbs ? (
            <span className="text-[#9A958A] font-bold">ABS</span>
          ) : val !== null && val !== undefined ? (
            val
          ) : (
            <span className="text-[#DDD6C7]">—</span>
          )}
        </td>
        <td className="py-2 px-2 text-center">
          {isAbs ? (
            <span className="text-[#9A958A] font-medium text-xs">X</span>
          ) : val !== null && val !== undefined ? (
            <GradeChip grade={gradeInfo.grade} size="sm" />
          ) : (
            <span className="text-[#DDD6C7]">—</span>
          )}
        </td>
        <td className="py-2 px-2 text-center font-tabular-sm font-semibold">
          {isAbs || val === null || val === undefined ? '0' : gradeInfo.points}
        </td>
      </tr>
    );
  });

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">My Academic Progress</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {studentCalculation.student.name} · {studentCalculation.student.admNo} · {activeStream} · {activeExam}
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN GRADE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{studentCalculation.meanGrade}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN POINTS</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{studentCalculation.meanPoints.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">BEST 7 AGGREGATE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{studentCalculation.aggregate}/84</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">STREAM RANK</div>
          <div className="font-display-stat text-display-stat text-[#111111]">#{studentCalculation.rank}</div>
        </div>
      </section>

      {/* Subject Marks Table */}
      <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden mb-6">
        <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
          <h2 className="font-headline-sm text-headline-sm text-[#111111]">Subject Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-1.5 px-2">SUBJECT</th>
                <th className="py-1.5 px-2 text-center w-14">SCORE</th>
                <th className="py-1.5 px-2 text-center w-14">GRADE</th>
                <th className="py-1.5 px-2 text-center w-12">POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-[12px]">
              {subjectRows}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strengths & Weaknesses */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C2410C]">trending_up</span>
            Strongest Subject
          </h3>
          {studentCalculation.strongestSubject ? (
            <div className="flex items-baseline justify-between">
              <span className="text-[#5F5E5E]">{studentCalculation.strongestSubject.code}</span>
              <span className="font-display-stat text-display-stat text-[#C2410C]">{studentCalculation.strongestSubject.score}%</span>
            </div>
          ) : (
            <p className="text-[#5F5E5E]">No data available</p>
          )}
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C2410C]">trending_down</span>
            Needs Improvement
          </h3>
          {studentCalculation.weakestSubject ? (
            <div className="flex items-baseline justify-between">
              <span className="text-[#5F5E5E]">{studentCalculation.weakestSubject.code}</span>
              <span className="font-display-stat text-display-stat text-[#C2410C]">{studentCalculation.weakestSubject.score}%</span>
            </div>
          ) : (
            <p className="text-[#5F5E5E]">No data available</p>
          )}
        </div>
      </section>

      {/* University Qualification Status */}
      <section className="mt-6 bg-white border border-[#DDD6C7] p-4 rounded">
        <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-3">University Qualification Status</h3>
        <div className="flex items-center justify-between p-4 bg-[#FBF8F1] border border-[#DDD6C7] rounded">
          <div>
            <p className="font-medium text-[#111111]">
              {studentCalculation.qualifies ? 'QUALIFIES FOR UNIVERSITY ADMISSION' : 'BELOW UNIVERSITY CUTOFF'}
            </p>
            <p className="text-sm text-[#5F5E5E] mt-1">
              C+ (6.50 mean points) required for degree programmes
            </p>
          </div>
          <GradeChip grade={studentCalculation.meanGrade} size="lg" />
        </div>
      </section>
    </div>
  );
};