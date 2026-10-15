import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import { GradeChip } from '../components/GradeChip';
import { getGradeFromScore } from '../utils/grading';
import type { StudentCalculation, Subject, WhatsAppMessage } from '../types';

export const ParentPortalView: React.FC = () => {
  const { user, isOnline } = useAuth();
  const { rankings, subjects, marks, schoolConfig, activeExam, activeStream, whatsAppMessages } = useGrading();

  const myChildren = useMemo(() => {
    if (!user) return [];
    return rankings.filter(r => {
      const student = r.student;
      return student.parent_email === user.email || student.parent_phone === user.phone;
    });
  }, [rankings, user]);

  const [selectedChild, setSelectedChild] = useState<StudentCalculation | null>(myChildren[0] || null);

  const childMarks = useMemo(() => {
    if (!selectedChild) return {};
    return marks[selectedChild.student.id] || {};
  }, [marks, selectedChild]);

  const childMessages = useMemo(() => {
    if (!selectedChild) return [];
    return whatsAppMessages.filter(m => m.studentId === selectedChild.student.id);
  }, [whatsAppMessages, selectedChild]);

  if (!isOnline) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Parent Portal - Offline Mode</h2>
          <p className="text-[#5F5E5E]">Please sign in online to access your parent portal.</p>
        </div>
      </div>
    );
  }

  if (myChildren.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-[#111111] mb-2">No Children Linked</h2>
          <p className="text-[#5F5E5E]">Your account is not linked to any student records. Please contact the school administrator to link your children.</p>
        </div>
      </div>
    );
  }

  const subjectRows = subjects.map(subj => {
    const val = childMarks[subj.code];
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
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Parent Portal</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {schoolConfig.schoolName} · {activeStream} · {activeExam}
          </p>
        </div>
        {myChildren.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="font-label-caps text-label-caps text-[#5F5E5E]">Select Child:</label>
            <select
              value={selectedChild?.student.id || ''}
              onChange={e => setSelectedChild(myChildren.find(c => c.student.id === e.target.value) || null)}
              className="px-3 py-2 border border-[#DDD6C7] rounded bg-white focus:outline-none focus:border-[#C2410C]"
            >
              {myChildren.map(child => (
                <option key={child.student.id} value={child.student.id}>
                  {child.student.name} ({child.student.admNo}) - Rank #{child.rank}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {selectedChild && (
        <>
          {/* Summary Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN GRADE</div>
              <div className="font-display-stat text-display-stat text-[#111111]">{selectedChild.meanGrade}</div>
            </div>
            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN POINTS</div>
              <div className="font-display-stat text-display-stat text-[#111111]">{selectedChild.meanPoints.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">BEST 7 AGGREGATE</div>
              <div className="font-display-stat text-display-stat text-[#111111]">{selectedChild.aggregate}/84</div>
            </div>
            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">STREAM RANK</div>
              <div className="font-display-stat text-display-stat text-[#111111]">#{selectedChild.rank}</div>
            </div>
          </section>

          {/* Subject Marks Table */}
          <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden mb-6">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">
                {selectedChild.student.name} - Subject Performance
              </h2>
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

          {/* University Qualification */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-3">University Qualification</h3>
              <div className="flex items-center justify-between p-4 bg-[#FBF8F1] border border-[#DDD6C7] rounded">
                <div>
                  <p className="font-medium text-[#111111]">
                    {selectedChild.qualifies ? 'QUALIFIES FOR UNIVERSITY ADMISSION' : 'BELOW UNIVERSITY CUTOFF'}
                  </p>
                  <p className="text-sm text-[#5F5E5E] mt-1">
                    C+ (6.50 mean points) required for degree programmes
                  </p>
                </div>
                <GradeChip grade={selectedChild.meanGrade} size="lg" />
              </div>
            </div>

            <div className="bg-white border border-[#DDD6C7] p-4 rounded">
              <h3 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Strengths & Areas for Support</h3>
              <div className="space-y-2">
                {selectedChild.strongestSubject && (
                  <div className="flex items-center justify-between p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded">
                    <span className="text-[#166534] font-medium">{selectedChild.strongestSubject.code} · {selectedChild.strongestSubject.score}%</span>
                    <span className="text-xs text-[#166534]">Strongest</span>
                  </div>
                )}
                {selectedChild.weakestSubject && (
                  <div className="flex items-center justify-between p-2 bg-[#FEF2F2] border border-[#FECACA] rounded">
                    <span className="text-[#991B1B] font-medium">{selectedChild.weakestSubject.code} · {selectedChild.weakestSubject.score}%</span>
                    <span className="text-xs text-[#991B1B]">Needs Support</span>
                  </div>
                )}
                {!selectedChild.strongestSubject && !selectedChild.weakestSubject && (
                  <p className="text-[#5F5E5E] text-center py-4">No subject data available</p>
                )}
              </div>
            </div>
          </section>

          {/* Communication */}
          <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Communication with Teachers</h2>
            </div>
            <div className="divide-y divide-[#DDD6C7] max-h-96 overflow-y-auto">
              {childMessages.length === 0 ? (
                <div className="p-8 text-center text-[#5F5E5E]">
                  <span className="material-symbols-outlined text-4xl text-[#DDD6C7] mb-2 block">chat_bubble_outline</span>
                  No messages yet. Teachers will appear here when they send updates.
                </div>
              ) : (
                childMessages.slice(0, 20).map(msg => (
                  <div key={msg.id} className="p-4 hover:bg-[#FBF8F1}">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#111111]">
                            {msg.sender === 'teacher' ? 'Class Teacher' : 'You'}
                          </span>
                          <span className="text-xs text-[#5F5E5E] bg-[#F2EDE3] px-2 py-0.5 rounded">
                            {msg.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#111111]">{msg.text}</p>
                        <p className="text-xs text-[#9A958A] mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};