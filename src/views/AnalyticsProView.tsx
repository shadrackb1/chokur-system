import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import type { StudentCalculation, SubjectDepartmentalStat, Subject, Student } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';

export const AnalyticsProView: React.FC = () => {
  const { user, isOnline, isAdmin, isTeacher } = useAuth();
  const { rankings, subjects, students, marks, activeExam, activeStream, subjectDepartmentalStats, gradeDistributionTiers, schoolConfig } = useGrading();

  const [historicalData, setHistoricalData] = useState<Array<{ exam: string; average: number; passRate: number; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'average' | 'passRate' | 'gradeDist'>('average');

  useEffect(() => {
    if (!isOnline || !user || !supabase) {
      setLoading(false);
      return;
    }
    loadHistoricalData();
  }, [isOnline, user, activeExam]);

  const loadHistoricalData = async () => {
    if (!supabase || !user) return;

    try {
      const { data: exams } = await supabase
        .from('exam_periods')
        .select('id, name, year, term, end_date')
        .eq('school_id', user.school_id)
        .order('year', { ascending: true })
        .order('term');

      if (!exams) return;

      const history = await Promise.all(exams.map(async (exam) => {
        const { data: examMarks } = await supabase
          .from('marks')
          .select('student_id, subject_code, value')
          .eq('school_id', user.school_id)
          .eq('exam_id', exam.id);

        if (!examMarks || examMarks.length === 0) return null;

        const studentMarksMap: Record<string, Record<string, number>> = {};
        examMarks.forEach(m => {
          if (typeof m.value === 'number') {
            if (!studentMarksMap[m.student_id]) studentMarksMap[m.student_id] = {};
            studentMarksMap[m.student_id][m.subject_code] = m.value;
          }
        });

        const activeStudents = students.filter(s => s.status === 'Active');
        let totalAvg = 0;
        let count = 0;
        let passed = 0;

        for (const student of activeStudents) {
          const marks = studentMarksMap[student.id];
          if (!marks) continue;
          const scores = Object.values(marks);
          if (scores.length === 0) continue;
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          totalAvg += avg;
          count++;
          if (avg >= 50) passed++;
        }

        return count > 0 ? {
          exam: exam.name,
          average: Math.round((totalAvg / count) * 10) / 10,
          passRate: Math.round((passed / count) * 100),
          date: exam.end_date || `${exam.year}-${exam.term}`,
        } : null;
      }));

      setHistoricalData(history.filter((h): h is NonNullable<typeof h> => h !== null));
    } catch (err) {
      console.error('[Analytics] Failed to load historical:', err);
    } finally {
      setLoading(false);
    }
  };

  const atRiskStudents = useMemo(() => {
    return rankings
      .filter(r => r.meanPoints < 6.5 && r.meanPoints >= 4.0)
      .slice(0, 20)
      .map(r => ({
        ...r,
        riskLevel: r.meanPoints < 5.5 ? 'critical' : r.meanPoints < 6.0 ? 'high' : 'medium',
        pointsToCPlus: Math.round((6.5 - r.meanPoints) * 100) / 100,
        subjectsBelow50: Object.entries(marks[r.student.id] || {})
          .filter(([, v]) => typeof v === 'number' && v < 50).length,
      }));
  }, [rankings, marks]);

  const subjectTrends = useMemo(() => {
    return subjectDepartmentalStats.map(s => ({
      subject: s.subject,
      currentAvg: s.average,
      lastExamAvg: s.subject.lastExamMean,
      trend: s.diffFromLastExam,
      passRate: s.passRate,
      trajectory: s.diffFromLastExam > 1 ? 'improving' : s.diffFromLastExam < -1 ? 'declining' : 'stable',
    })).sort((a, b) => b.trend - a.trend);
  }, [subjectDepartmentalStats]);

  const gradeDistribution = useMemo(() => {
    return gradeDistributionTiers.map(t => ({
      grade: t.grade,
      count: t.studentCount,
      percentage: t.cohortShare,
      cumulative: t.cumulativePercentage,
    }));
  }, [gradeDistributionTiers]);

  const predictions = useMemo(() => {
    const currentAvg = rankings.length > 0
      ? Math.round((rankings.reduce((a, b) => a + b.average, 0) / rankings.length) * 10) / 10
      : 0;
    const currentPass = rankings.length > 0
      ? Math.round((rankings.filter(r => r.qualifies).length / rankings.length) * 100)
      : 0;

    const lastExam = historicalData[historicalData.length - 2];
    const trend = lastExam
      ? currentAvg - lastExam.average
      : 0;

    const projectedAvg = currentAvg + trend;
    const projectedPass = currentPass + (lastExam ? currentPass - lastExam.passRate : 0);

    return {
      currentAverage: currentAvg,
      currentPassRate: currentPass,
      trendDirection: trend > 0.5 ? 'improving' : trend < -0.5 ? 'declining' : 'stable',
      trendMagnitude: Math.abs(trend),
      projectedNextExamAverage: Math.round(projectedAvg * 10) / 10,
      projectedNextExamPassRate: Math.max(0, Math.min(100, Math.round(projectedPass))),
      atRiskCount: atRiskStudents.length,
      criticalRiskCount: atRiskStudents.filter(s => s.riskLevel === 'critical').length,
    };
  }, [rankings, historicalData, atRiskStudents]);

  if (!isOnline || (!isAdmin && !isTeacher)) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Advanced Analytics - Access Required</h2>
          <p className="text-[#5F5E5E]">Admin or Teacher access required.</p>
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
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Advanced Analytics</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {schoolConfig.schoolName} · {activeStream} · Predictive insights & trends
          </p>
        </div>
      </section>

      {/* Predictive Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">CURRENT AVERAGE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{predictions.currentAverage}%</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">PASS RATE</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{predictions.currentPassRate}%</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">PROJECTED AVG</div>
          <div className="font-display-stat text-display-stat text-[#C2410C]">{predictions.projectedNextExamAverage}%</div>
          <div className="text-xs text-[#5F5E5E]">{predictions.trendDirection} ({predictions.trendMagnitude > 0 ? (predictions.trendDirection === 'improving' ? '+' : '-') + predictions.trendMagnitude.toFixed(1) : '0'}%)</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">AT-RISK STUDENTS</div>
          <div className="font-display-stat text-display-stat text-[#C2410C]">{predictions.atRiskCount}</div>
          <div className="text-xs text-[#991B1B]">{predictions.criticalRiskCount} critical</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">EXAMS TRACKED</div>
          <div className="font-display-stat text-display-stat text-[#111111]">{historicalData.length}</div>
        </div>
      </section>

      {/* At-Risk Students */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-[#111111] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C2410C]">warning</span>
            Students at Risk (Below C+ Cutoff)
          </h2>
          <span className="text-sm text-[#5F5E5E]">{atRiskStudents.length} students flagged</span>
        </div>
        {atRiskStudents.length === 0 ? (
          <div className="bg-white border border-[#DDD6C7] rounded p-8 text-center text-[#166534]">
            <span className="material-symbols-outlined text-4xl mb-2 block">check_circle</span>
            All students are above the intervention threshold!
          </div>
        ) : (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                  <th className="py-2 px-3">RANK</th>
                  <th className="py-2 px-3">STUDENT</th>
                  <th className="py-2 px-3">ADM NO</th>
                  <th className="py-2 px-3 text-right">MEAN POINTS</th>
                  <th className="py-2 px-3 text-right">TO C+</th>
                  <th className="py-2 px-3">GRADE</th>
                  <th className="py-2 px-3">RISK</th>
                  <th className="py-2 px-3">SUBJ < 50%</th>
                  <th className="py-2 px-3">WEAKEST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                {atRiskStudents.map(student => (
                  <tr key={student.student.id} className={`hover:bg-[#FBF8F1] ${student.riskLevel === 'critical' ? 'bg-[#FEF2F2]' : student.riskLevel === 'high' ? 'bg-[#FEF3E2]' : ''}`}>
                    <td className="py-2 px-3 font-tabular-sm font-bold text-[#C2410C]">#{student.rank}</td>
                    <td className="py-2 px-3 font-medium">{student.student.name}</td>
                    <td className="py-2 px-3 font-tabular-sm text-[#5F5E5E]">{student.student.admNo}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm">{student.meanPoints.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm font-semibold text-[#C2410C]">{student.pointsToCPlus}</td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${student.meanGrade >= 'C+' ? 'bg-[#F0FDF4] text-[#166534]' : student.meanGrade >= 'C' ? 'bg-[#FEF3E2] text-[#C2410C]' : 'bg-[#FEF2F2] text-[#991B1B]'}`}>{student.meanGrade}</span></td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${student.riskLevel === 'critical' ? 'bg-[#FEF2F2] text-[#991B1B]' : student.riskLevel === 'high' ? 'bg-[#FEF3E2] text-[#C2410C]' : 'bg-[#FEF3E2] text-[#C2410C]'}`}>
                        {student.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-tabular-sm">{student.subjectsBelow50}</td>
                    <td className="py-2 px-3 text-[#5F5E5E]">
                      {student.weakestSubject ? (
                        <span className="bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA] text-xs text-[#991B1B]">
                          {student.weakestSubject.code} {student.weakestSubject.score}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Historical Trends */}
      {historicalData.length > 0 && (
        <section className="mb-6">
          <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Historical Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#DDD6C7] rounded p-4">
              <h3 className="font-semibold text-[#111111] mb-3">Class Average Over Time</h3>
              <div className="h-64 flex items-end justify-around gap-2 px-2">
                {historicalData.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-[#C2410C] rounded-t transition-all"
                      style={{ height: `${Math.max(20, (point.average / 100) * 200)}px` }}
                    ></div>
                    <span className="text-xs text-[#5F5E5E] mt-1">{point.average}%</span>
                    <span className="text-xs text-[#9A958A]">{point.exam}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#DDD6C7] rounded p-4">
              <h3 className="font-semibold text-[#111111] mb-3">University Pass Rate Trend</h3>
              <div className="h-64 flex items-end justify-around gap-2 px-2">
                {historicalData.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-[#1D4ED8] rounded-t transition-all"
                      style={{ height: `${Math.max(20, (point.passRate / 100) * 200)}px` }}
                    ></div>
                    <span className="text-xs text-[#5F5E5E] mt-1">{point.passRate}%</span>
                    <span className="text-xs text-[#9A958A]">{point.exam}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subject Trajectories */}
      <section className="mb-6">
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Subject Performance Trajectories</h2>
        <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-3">SUBJECT</th>
                <th className="py-2 px-3 text-right">CURRENT AVG</th>
                <th className="py-2 px-3 text-right">LAST EXAM</th>
                <th className="py-2 px-3 text-right">CHANGE</th>
                <th className="py-2 px-3 text-right">PASS %</th>
                <th className="py-2 px-3">TRAJECTORY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {subjectTrends.map(({ subject, currentAvg, lastExamAvg, trend, passRate, trajectory }) => (
                <tr key={subject.code} className="hover:bg-[#FBF8F1]">
                  <td className="py-2 px-3 font-medium"><span className="font-semibold">{subject.code}</span> {subject.name}</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{currentAvg.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{lastExamAvg.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-tabular-sm font-semibold">
                    <span className={trend >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}>
                      {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-tabular-sm">{passRate}%</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trajectory === 'improving' ? 'bg-[#F0FDF4] text-[#166534]' :
                      trajectory === 'declining' ? 'bg-[#FEF2F2] text-[#991B1B]' :
                      'bg-[#F3F4F6] text-[#374151]'
                    }`}>
                      {trajectory.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grade Distribution Visualization */}
      <section className="mb-6">
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Grade Distribution</h2>
        <div className="bg-white border border-[#DDD6C7] rounded p-4">
          <div className="space-y-3">
            {gradeDistribution.map(({ grade, count, percentage, cumulative }) => (
              <div key={grade} className="flex items-center gap-4">
                <span className="w-10 text-right font-tabular-sm text-[#5F5E5E]">{grade}</span>
                <div className="flex-1 bg-[#F2EDE3] h-4 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-[#C2410C] transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-20 text-right font-tabular-sm text-[#111111]">{percentage}%</span>
                <span className="w-24 text-right text-xs text-[#9A958A]">Cum: {cumulative}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intervention Recommendations */}
      <section>
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">AI Intervention Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#DDD6C7] rounded p-4">
            <h3 className="font-semibold text-[#111111] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1D4ED8]">lightbulb</span>
              Priority Actions
            </h3>
            <ul className="space-y-2 text-sm text-[#5F5E5E]">
              {atRiskStudents.filter(s => s.riskLevel === 'critical').length > 0 && (
                <li className="flex items-start gap-2 p-2 bg-[#FEF2F2] border border-[#FECACA] rounded">
                  <span className="material-symbols-outlined text-[#991B1B] text-sm">priority_high</span>
                  <span>{atRiskStudents.filter(s => s.riskLevel === 'critical').length} students in critical zone — immediate parent meetings & remedial classes needed</span>
                </li>
              )}
              {subjectTrends.filter(s => s.trajectory === 'declining').length > 0 && (
                <li className="flex items-start gap-2 p-2 bg-[#FEF3E2] border border-[#FDE68A] rounded">
                  <span className="material-symbols-outlined text-[#C2410C] text-sm">trending_down</span>
                  <span>{subjectTrends.filter(s => s.trajectory === 'declining').length} subjects declining — review teaching methods & increase practice sessions</span>
                </li>
              )}
              {predictions.trendDirection === 'declining' && (
                <li className="flex items-start gap-2 p-2 bg-[#FEF3E2] border border-[#FDE68A] rounded">
                  <span className="material-symbols-outlined text-[#C2410C] text-sm">warning</span>
                  <span>Overall trend declining by {predictions.trendMagnitude.toFixed(1)}% — consider school-wide intervention program</span>
                </li>
              )}
              {predictions.projectedNextExamPassRate < 50 && (
                <li className="flex items-start gap-2 p-2 bg-[#FEF2F2] border border-[#FECACA] rounded">
                  <span className="material-symbols-outlined text-[#991B1B] text-sm">school</span>
                  <span>Projected pass rate below 50% — urgent curriculum review & extra tuition recommended</span>
                </li>
              )}
              {atRiskStudents.length === 0 && subjectTrends.filter(s => s.trajectory === 'declining').length === 0 && predictions.trendDirection !== 'declining' && (
                <li className="flex items-start gap-2 p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded">
                  <span className="material-symbols-outlined text-[#166534] text-sm">celebration</span>
                  <span>All indicators positive! Maintain current teaching strategies.</span>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white border border-[#DDD6C7] rounded p-4">
            <h3 className="font-semibold text-[#111111] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534]">check_circle</span>
              Quick Wins
            </h3>
            <ul className="space-y-2 text-sm text-[#5F5E5E]">
              {subjectTrends.filter(s => s.trajectory === 'improving').map(s => (
                <li key={s.subject.code} className="flex items-center gap-2 p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded">
                  <span className="material-symbols-outlined text-[#166534] text-sm">trending_up</span>
                  <span>{s.subject.code} improved by {s.trend.toFixed(1)}% — replicate methods</span>
                </li>
              ))}
              {atRiskStudents.filter(s => s.meanPoints >= 6.0).length > 0 && (
                <li className="flex items-center gap-2 p-2 bg-[#FEF3E2] border border-[#FDE68A] rounded">
                  <span className="material-symbols-outlined text-[#C2410C] text-sm">flag</span>
                  <span>{atRiskStudents.filter(s => s.meanPoints >= 6.0).length} students within 0.5 pts of C+ — targeted revision could push them over</span>
                </li>
              )}
              {subjectTrends.length > 0 && (
                <li className="flex items-center gap-2 p-2 bg-[#F3F4F6] border border-[#DDD6C7] rounded">
                  <span className="material-symbols-outlined text-[#5F5E5E] text-sm">assignment</span>
                  <span>Focus on {subjectTrends[subjectTrends.length - 1].subject.code} (lowest avg: {subjectTrends[subjectTrends.length - 1].currentAvg.toFixed(1)}%)</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};