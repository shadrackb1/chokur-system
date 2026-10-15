import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import { GradeChip } from '../components/GradeChip';
import type { StudentCalculation, Subject, Student, SchoolConfig, ClassStream, ExamPeriod } from '../types';

export const AdminDashboardView: React.FC = () => {
  const { user, isOnline } = useAuth();
  const { rankings, subjects, students, streams, exams, schoolConfig, marks, classAverage, passRate, meanGrade, studentsRanked } = useGrading();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers' | 'streams' | 'exams' | 'settings' | 'subscription'>('overview');

  if (!isOnline || user?.role !== 'admin') {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Admin Dashboard - Access Required</h2>
          <p className="text-[#5F5E5E]">Sign in as an administrator to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const totalStudents = students.filter(s => s.status === 'Active').length;
  const totalStreams = streams.length;
  const totalSubjects = subjects.length;
  const totalExams = exams.length;

  const streamStats = useMemo(() => {
    return streams.map(stream => {
      const streamStudents = students.filter(s => s.stream === stream.name && s.status === 'Active');
      const streamRankings = rankings.filter(r => r.student.stream === stream.name);
      const avg = streamRankings.length > 0
        ? Math.round((streamRankings.reduce((a, b) => a + b.average, 0) / streamRankings.length) * 10) / 10
        : 0;
      const pass = streamRankings.length > 0
        ? Math.round((streamRankings.filter(r => r.qualifies).length / streamRankings.length) * 100)
        : 0;
      return {
        stream,
        studentCount: streamStudents.length,
        average: avg,
        passRate: pass,
        topStudent: streamRankings[0]?.student.name || '—',
      };
    });
  }, [streams, students, rankings]);

  const recentActivity = useMemo(() => {
    const activities: Array<{ type: string; description: string; time: string; user: string }> = [];
    return activities;
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">TOTAL STUDENTS</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{totalStudents}</div>
              </div>
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">STREAMS</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{totalStreams}</div>
              </div>
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">SUBJECTS</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{totalSubjects}</div>
              </div>
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">EXAMS THIS YEAR</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{totalExams}</div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">CLASS AVERAGE</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{classAverage.toFixed(1)}%</div>
              </div>
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">UNIVERSITY PASS RATE</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{passRate}%</div>
              </div>
              <div className="bg-white border border-[#DDD6C7] p-4 rounded">
                <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">MEAN GRADE</div>
                <div className="font-display-stat text-display-stat text-[#111111]">{meanGrade}</div>
              </div>
            </section>

            <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
              <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
                <h3 className="font-headline-sm text-headline-sm text-[#111111]">Stream Performance Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                      <th className="py-2 px-3">STREAM</th>
                      <th className="py-2 px-3 text-right">STUDENTS</th>
                      <th className="py-2 px-3 text-right">AVERAGE</th>
                      <th className="py-2 px-3 text-right">PASS RATE</th>
                      <th className="py-2 px-3">TOP STUDENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                    {streamStats.map(({ stream, studentCount, average, passRate, topStudent }) => (
                      <tr key={stream.id} className="hover:bg-[#FBF8F1]">
                        <td className="py-2 px-3 font-medium">{stream.name}</td>
                        <td className="py-2 px-3 text-right font-tabular-sm">{studentCount}</td>
                        <td className="py-2 px-3 text-right font-tabular-sm">{average.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-tabular-sm">{passRate}%</td>
                        <td className="py-2 px-3 text-[#5F5E5E]">{topStudent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );

      case 'students':
        return (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Student Management</h3>
              <button className="px-3 py-1.5 bg-[#C2410C] text-white text-sm rounded hover:opacity-95">Add Student</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                    <th className="py-2 px-3">ADM NO</th>
                    <th className="py-2 px-3">NAME</th>
                    <th className="py-2 px-3">STREAM</th>
                    <th className="py-2 px-3">GENDER</th>
                    <th className="py-2 px-3">KCPE</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-[#FBF8F1]">
                      <td className="py-2 px-3 font-tabular-sm">{student.admNo}</td>
                      <td className="py-2 px-3 font-medium">{student.name}</td>
                      <td className="py-2 px-3">{student.stream}</td>
                      <td className="py-2 px-3">{student.gender}</td>
                      <td className="py-2 px-3 font-tabular-sm">{student.kcpeMarks}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          student.status === 'Active' ? 'bg-[#F0FDF4] text-[#166534]' :
                          student.status === 'Graduated' ? 'bg-[#F3F4F6] text-[#374151]' :
                          'bg-[#FEF2F2] text-[#991B1B]'
                        }`}>{student.status}</span>
                      </td>
                      <td className="py-2 px-3">
                        <button className="text-[#C2410C] text-sm hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'streams':
        return (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Class Streams</h3>
              <button className="px-3 py-1.5 bg-[#C2410C] text-white text-sm rounded hover:opacity-95">Add Stream</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                    <th className="py-2 px-3">NAME</th>
                    <th className="py-2 px-3">FORM</th>
                    <th className="py-2 px-3">STREAM</th>
                    <th className="py-2 px-3">CLASS TEACHER</th>
                    <th className="py-2 px-3 text-right">CAPACITY</th>
                    <th className="py-2 px-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                  {streams.map(stream => (
                    <tr key={stream.id} className="hover:bg-[#FBF8F1]">
                      <td className="py-2 px-3 font-medium">{stream.name}</td>
                      <td className="py-2 px-3">{stream.form}</td>
                      <td className="py-2 px-3">{stream.stream}</td>
                      <td className="py-2 px-3 text-[#5F5E5E]">{stream.classTeacher || '—'}</td>
                      <td className="py-2 px-3 text-right font-tabular-sm">{stream.capacity || '—'}</td>
                      <td className="py-2 px-3">
                        <button className="text-[#C2410C] text-sm hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'exams':
        return (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Exam Periods</h3>
              <button className="px-3 py-1.5 bg-[#C2410C] text-white text-sm rounded hover:opacity-95">Add Exam</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                    <th className="py-2 px-3">NAME</th>
                    <th className="py-2 px-3">TERM</th>
                    <th className="py-2 px-3">YEAR</th>
                    <th className="py-2 px-3">TYPE</th>
                    <th className="py-2 px-3">DATES</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                  {exams.map(exam => (
                    <tr key={exam.id} className="hover:bg-[#FBF8F1]">
                      <td className="py-2 px-3 font-medium">{exam.name}</td>
                      <td className="py-2 px-3">{exam.term}</td>
                      <td className="py-2 px-3 font-tabular-sm">{exam.year}</td>
                      <td className="py-2 px-3">{exam.type}</td>
                      <td className="py-2 px-3 text-[#5F5E5E]">{exam.start_date} - {exam.end_date}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${exam.is_active ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#F3F4F6] text-[#374151]'}`}>
                          {exam.is_active ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <button className="text-[#C2410C] text-sm hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'teachers':
        return (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Teachers & Staff</h3>
              <button className="px-3 py-1.5 bg-[#C2410C] text-white text-sm rounded hover:opacity-95">Add Teacher</button>
            </div>
            <div className="p-4 text-center text-[#5F5E5E]">
              Teacher management coming soon. Requires teacher_profiles table population.
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl">
            <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
              <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
                <h3 className="font-headline-sm text-headline-sm text-[#111111]">School Configuration</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">School Name</label>
                    <input defaultValue={schoolConfig.schoolName} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Motto</label>
                    <input defaultValue={schoolConfig.motto} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Postal Address</label>
                    <input defaultValue={schoolConfig.postalAddress} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Contact Phone/Email</label>
                    <input defaultValue={schoolConfig.contactPhoneEmail} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Academic Year</label>
                    <input defaultValue={schoolConfig.academicYear} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Current Term</label>
                    <input defaultValue={schoolConfig.term} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Term Opening Date</label>
                    <input type="date" defaultValue={schoolConfig.termOpeningDate} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Term Closing Date</label>
                    <input type="date" defaultValue={schoolConfig.termClosingDate} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Class Teacher</label>
                    <input defaultValue={schoolConfig.classTeacher} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Principal Name</label>
                    <input defaultValue={schoolConfig.principalName} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Calculation Method</label>
                    <select defaultValue={schoolConfig.calculationMethod} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                      <option value="best7">Best 7 (KNEC Standard)</option>
                      <option value="simpleMean">Simple Mean</option>
                    </select>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#C2410C] text-white rounded hover:opacity-95">Save Changes</button>
              </div>
            </section>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6 max-w-2xl">
            <section className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
              <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
                <h3 className="font-headline-sm text-headline-sm text-[#111111]">Subscription & Billing</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded p-4">
                    <h4 className="font-semibold text-[#166534]">Current Plan</h4>
                    <p className="text-2xl font-bold text-[#166534] mt-1">FREE</p>
                    <p className="text-sm text-[#166534] mt-1">Up to 50 students</p>
                  </div>
                  <div className="border border-[#DDD6C7] rounded p-4 relative">
                    <h4 className="font-semibold text-[#111111]">PRO</h4>
                    <p className="text-2xl font-bold text-[#111111] mt-1">KES 4,999/mo</p>
                    <p className="text-sm text-[#5F5E5E] mt-1">Up to 500 students, analytics, parent portal</p>
                    <button className="mt-3 w-full px-3 py-2 border border-[#C2410C] text-[#C2410C] rounded hover:bg-[#FEF3E2]">Upgrade</button>
                  </div>
                  <div className="border border-[#DDD6C7] rounded p-4">
                    <h4 className="font-semibold text-[#111111]">ENTERPRISE</h4>
                    <p className="text-2xl font-bold text-[#111111] mt-1">Custom</p>
                    <p className="text-sm text-[#5F5E5E] mt-1">Unlimited, API access, dedicated support</p>
                    <button className="mt-3 w-full px-3 py-2 border border-[#C2410C] text-[#C2410C] rounded hover:bg-[#FEF3E2]">Contact Sales</button>
                  </div>
                </div>
                <div className="border-t border-[#DDD6C7] pt-4">
                  <h4 className="font-semibold text-[#111111] mb-2">Usage</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-[#5F5E5E]">Students:</span> <span className="font-medium ml-2">{totalStudents} / 50</span></div>
                    <div><span className="text-[#5F5E5E]">Teachers:</span> <span className="font-medium ml-2">0 / 5</span></div>
                    <div><span className="text-[#5F5E5E]">Storage:</span> <span className="font-medium ml-2">~2 MB / 100 MB</span></div>
                    <div><span className="text-[#5F5E5E]">API Calls:</span> <span className="font-medium ml-2">0 / 10,000</span></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Admin Dashboard</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {schoolConfig.schoolName} · {schoolConfig.academicYear} · {schoolConfig.term}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#F0FDF4] text-[#166534] text-xs font-medium rounded">ADMIN</span>
          <span className="text-xs text-[#5F5E5E]">{user?.full_name}</span>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="mb-6 border-b border-[#DDD6C7]" aria-label="Admin tabs">
        <ul className="flex flex-wrap gap-1" role="tablist">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'students', label: 'Students', icon: 'people' },
            { id: 'streams', label: 'Streams', icon: 'class' },
            { id: 'exams', label: 'Exams', icon: 'assignment' },
            { id: 'teachers', label: 'Teachers', icon: 'person' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
            { id: 'subscription', label: 'Subscription', icon: 'credit_card' },
          ].map(tab => (
            <li key={tab.id} role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 text-sm font-medium rounded-t transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#C2410C] text-[#FEF9EF] border-b-2 border-[#C2410C] -mb-px'
                    : 'text-[#5F5E5E] hover:text-[#111111] hover:bg-[#F2EDE3]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] inline-block align-middle mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {renderTab()}
    </div>
  );
};