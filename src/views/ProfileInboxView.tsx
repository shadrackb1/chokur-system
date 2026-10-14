import React, { useMemo, useState } from 'react';
import { useGrading } from '../context/GradingContext';
import { WhatsAppMessage } from '../types';

export const ProfileInboxView: React.FC = () => {
  const {
    filteredStudents,
    rankings,
    schoolConfig,
    activeStream,
    activeExam,
    teacherProfile,
    updateTeacherProfile,
    whatsAppMessages,
    sendWhatsAppMessage,
  } = useGrading();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    filteredStudents[0]?.id || 's-1'
  );
  const [composerText, setComposerText] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(teacherProfile);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Selected student & their academic standing
  const currentStudent = useMemo(() => {
    return filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0];
  }, [filteredStudents, selectedStudentId]);

  const currentStanding = useMemo(() => {
    return rankings.find((r) => r.student.id === selectedStudentId);
  }, [rankings, selectedStudentId]);

  // Thread messages for selected student
  const threadMessages = useMemo(() => {
    return whatsAppMessages.filter((m) => m.studentId === selectedStudentId);
  }, [whatsAppMessages, selectedStudentId]);

  // Generate official KCSE progress text
  const generateOfficialReportMessage = () => {
    if (!currentStudent || !currentStanding) return '';
    return `Good day, this is ${teacherProfile.name} (Class Teacher, ${activeStream}) from ${schoolConfig.schoolName}.

*OFFICIAL KCSE PROGRESS UPDATE*
Student: ${currentStudent.name} (Adm: ${currentStudent.admNo})
Exam: ${activeExam}
Rank: #${currentStanding.rank} of ${filteredStudents.length} candidates
Mean Grade: ${currentStanding.meanGrade} (${currentStanding.meanPoints.toFixed(1)} pts)
Best 7 Aggregate: ${currentStanding.aggregate} / 84
Subjects Passed: ${currentStanding.subjectsPassed} / ${currentStanding.enteredSubjectsCount}
University Qualification: ${currentStanding.qualifies ? 'YES (Qualified for Degree entry)' : 'Needs improvement'}

Term Next Opening: ${schoolConfig.termOpeningDate || 'TBA'}.
Principal: ${schoolConfig.principalName || 'Mrs. J. K. Cheruiyot'}.`;
  };

  const handleSendOfficialBroadcast = () => {
    const text = generateOfficialReportMessage();
    if (!text || !currentStudent) return;

    sendWhatsAppMessage({
      studentId: currentStudent.id,
      studentAdm: currentStudent.admNo,
      studentName: currentStudent.name,
      parentName: `Parent of ${currentStudent.name}`,
      parentPhone: '+254 712 000 111',
      sender: 'teacher',
      text,
    });
  };

  const handleSendCustomMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composerText.trim() || !currentStudent) return;

    sendWhatsAppMessage({
      studentId: currentStudent.id,
      studentAdm: currentStudent.admNo,
      studentName: currentStudent.name,
      parentName: `Parent of ${currentStudent.name}`,
      parentPhone: '+254 712 000 111',
      sender: 'teacher',
      text: composerText.trim(),
    });

    setComposerText('');
  };

  const handleOpenWhatsAppWeb = () => {
    const text = composerText.trim() || generateOfficialReportMessage();
    const encoded = encodeURIComponent(text);
    // WhatsApp deep link without phone prompts user to pick contact
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = composerText.trim() || generateOfficialReportMessage();
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile(profileForm);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full font-body-md text-[#111111]">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#DDD6C7] gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-caption text-[#5F5E5E] mb-1">
            <span>Staff Portal</span>
            <span>/</span>
            <span className="text-[#C2410C] font-medium">Profile &amp; WhatsApp Communication Hub</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">
            Teacher Profile &amp; Parent Broadcast
          </h1>
          <p className="font-body-sm text-body-sm text-[#5F5E5E]">
            Verified TSC teacher identity and official KCSE WhatsApp communication ledger.
          </p>
        </div>

        {/* Quick Edit Profile Button */}
        <button
          onClick={() => {
            setProfileForm(teacherProfile);
            setIsEditingProfile(true);
          }}
          type="button"
          className="self-start sm:self-auto px-3.5 py-2 min-h-[44px] bg-[#FBF8F1] border border-[#DDD6C7] hover:bg-[#F2EDE3] text-body-sm font-medium rounded text-[#111111] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-[#C2410C]">edit</span>
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Top Teacher Profile Card */}
      <div className="bg-[#FBF8F1] border border-[#DDD6C7] p-4 sm:p-5 rounded mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#111111] text-[#FEF9EF] flex items-center justify-center font-tabular-md font-bold text-lg shrink-0">
              {teacherProfile.name
                .split(' ')
                .map((n) => n[0])
                .slice(-2)
                .join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-headline-md text-headline-md text-[#111111] font-semibold">
                  {teacherProfile.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-tabular-sm bg-emerald-100 text-emerald-800 border border-emerald-300">
                  TSC VERIFIED
                </span>
              </div>
              <div className="text-xs text-[#5F5E5E] mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{teacherProfile.tscNumber}</span>
                <span>•</span>
                <span>{teacherProfile.department}</span>
                <span>•</span>
                <span>Stream: {teacherProfile.assignedStream}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5F5E5E] pt-2 md:pt-0 border-t md:border-t-0 border-[#DDD6C7]">
            <div className="px-2.5 py-1.5 rounded bg-[#FEF9EF] border border-[#DDD6C7]">
              <span className="text-[#9A958A] block text-[10px] uppercase font-label-caps">Phone</span>
              <span className="font-tabular-sm text-[#111111]">{teacherProfile.phone}</span>
            </div>
            <div className="px-2.5 py-1.5 rounded bg-[#FEF9EF] border border-[#DDD6C7]">
              <span className="text-[#9A958A] block text-[10px] uppercase font-label-caps">Subjects</span>
              <span className="text-[#111111]">{teacherProfile.subjectsTaught.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main WhatsApp Hub: 2-Column Responsive Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
        {/* Left Column: Student Roster Picker */}
        <div className="lg:col-span-4 flex flex-col bg-[#FBF8F1] border border-[#DDD6C7] rounded overflow-hidden">
          <div className="p-3 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-[#5F5E5E] uppercase tracking-wider text-[11px]">
              Class Roster ({filteredStudents.length})
            </span>
            <span className="text-xs font-tabular-sm text-[#C2410C] font-semibold">{activeStream}</span>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto max-h-[320px] lg:max-h-[560px] divide-y divide-[#DDD6C7]/60">
            {filteredStudents.map((student) => {
              const standing = rankings.find((r) => r.student.id === student.id);
              const isSelected = student.id === selectedStudentId;
              const studentMsgCount = whatsAppMessages.filter((m) => m.studentId === student.id).length;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  type="button"
                  className={`w-full text-left p-3 flex items-center justify-between min-h-[54px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2EDE3] border-l-3 border-[#C2410C]'
                      : 'hover:bg-[#F8F3E9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EDE8DE] border border-[#DDD6C7] flex items-center justify-center font-tabular-sm text-xs font-medium text-[#111111]">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[#111111] line-clamp-1">{student.name}</div>
                      <div className="text-[10px] text-[#5F5E5E] font-tabular-sm">
                        ADM {student.admNo} · {standing ? `#${standing.rank} (${standing.meanGrade})` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {studentMsgCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-[#FEF9EF] text-[10px] font-tabular-sm flex items-center justify-center font-bold">
                        {studentMsgCount}
                      </span>
                    )}
                    <span className="material-symbols-outlined text-[16px] text-[#9A958A]">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: WhatsApp Interactive Thread & Broadcast Composer */}
        <div className="lg:col-span-8 flex flex-col bg-[#FBF8F1] border border-[#DDD6C7] rounded overflow-hidden">
          {/* Thread Header */}
          <div className="p-3 bg-[#FEF9EF] border-b border-[#DDD6C7] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-[#FEF9EF] flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div>
                <div className="font-semibold text-xs text-[#111111] flex items-center gap-2">
                  <span>Parent of {currentStudent?.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-normal text-emerald-700">WhatsApp Active</span>
                </div>
                <div className="text-[11px] text-[#5F5E5E] font-tabular-sm">
                  Candidate ADM: {currentStudent?.admNo} · Mean: {currentStanding?.meanGrade} ({currentStanding?.meanPoints.toFixed(1)} pts) · Rank: #{currentStanding?.rank}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendOfficialBroadcast}
                type="button"
                className="px-2.5 py-1.5 bg-[#C2410C] text-[#FEF9EF] text-xs font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer min-h-[40px]"
                title="Post official formatted report into thread"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span className="hidden sm:inline">Post Official Report</span>
              </button>
              <button
                onClick={handleOpenWhatsAppWeb}
                type="button"
                className="px-2.5 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors flex items-center gap-1 cursor-pointer min-h-[40px]"
                title="Open directly in WhatsApp Web / App"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Quick Template Chips */}
          <div className="px-3 py-2 bg-[#F8F3E9] border-b border-[#DDD6C7] flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[11px]">
            <span className="text-[#5F5E5E] font-medium shrink-0">Templates:</span>
            <button
              onClick={() =>
                setComposerText(
                  `Dear Parent, ${currentStudent?.name} scored ${currentStanding?.meanGrade} in ${activeExam}. Please review weak subjects with extra homework.`
                )
              }
              type="button"
              className="px-2 py-1 rounded bg-[#FEF9EF] border border-[#DDD6C7] hover:border-[#111111] shrink-0 text-[#111111] cursor-pointer"
            >
              Academic Notice
            </button>
            <button
              onClick={() =>
                setComposerText(
                  `Congratulations! ${currentStudent?.name} ranked #${currentStanding?.rank} in ${activeStream} with Grade ${currentStanding?.meanGrade}. Keep up the great spirit!`
                )
              }
              type="button"
              className="px-2 py-1 rounded bg-[#FEF9EF] border border-[#DDD6C7] hover:border-[#111111] shrink-0 text-[#111111] cursor-pointer"
            >
              Top Honor Praise
            </button>
            <button
              onClick={() =>
                setComposerText(
                  `Reminder: Term 3 commences on ${schoolConfig.termOpeningDate || '1st Sept'}. Ensure all clearance forms are signed.`
                )
              }
              type="button"
              className="px-2 py-1 rounded bg-[#FEF9EF] border border-[#DDD6C7] hover:border-[#111111] shrink-0 text-[#111111] cursor-pointer"
            >
              Term Opening
            </button>
          </div>

          {/* Message Thread History */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[380px] bg-[#E5DDD5]/30 space-y-3">
            {threadMessages.length === 0 ? (
              <div className="text-center py-10 text-[#5F5E5E] text-xs">
                <span className="material-symbols-outlined text-3xl text-[#9A958A] mb-2 block">
                  chat_bubble_outline
                </span>
                No WhatsApp messages logged yet for {currentStudent?.name}.
                <br />
                Click <strong>"Post Official Report"</strong> above or type below to send.
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isTeacher = msg.sender === 'teacher';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                        isTeacher
                          ? 'bg-[#DCF8C6] text-[#111111] rounded-tr-none'
                          : 'bg-white text-[#111111] rounded-tl-none border border-[#DDD6C7]'
                      }`}
                    >
                      <div className="font-semibold text-[10px] text-[#5F5E5E] mb-1">
                        {isTeacher ? 'You (Class Teacher)' : msg.parentName}
                      </div>
                      <div>{msg.text}</div>
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-[#5F5E5E] font-tabular-sm">
                        <span>{msg.timestamp}</span>
                        {isTeacher && (
                          <span
                            className={`text-[12px] font-bold ${
                              msg.status === 'read' ? 'text-blue-500' : 'text-[#9A958A]'
                            }`}
                          >
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Fixed Composer Bar */}
          <form
            onSubmit={handleSendCustomMessage}
            className="p-2 sm:p-3 bg-[#FEF9EF] border-t border-[#DDD6C7] flex items-center gap-2"
          >
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={`Message parent of ${currentStudent?.name || 'student'}...`}
              rows={1}
              className="flex-1 p-2.5 text-xs sm:text-sm bg-white border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C] resize-none min-h-[44px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCustomMessage();
                }
              }}
            />

            <button
              onClick={handleCopyText}
              type="button"
              className="p-2.5 min-h-[44px] min-w-[44px] bg-[#FBF8F1] border border-[#DDD6C7] hover:bg-[#F2EDE3] rounded flex items-center justify-center text-[#5F5E5E] cursor-pointer"
              title="Copy message text"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedNotification ? 'check' : 'content_copy'}
              </span>
            </button>

            <button
              type="submit"
              disabled={!composerText.trim()}
              className="px-4 py-2 min-h-[44px] bg-[#111111] text-[#FEF9EF] text-xs font-semibold rounded hover:bg-neutral-800 disabled:opacity-40 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded p-5 max-w-lg w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DDD6C7]">
              <h3 className="font-headline-md text-headline-md text-[#111111]">
                Edit Teacher Profile
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                type="button"
                className="text-[#5F5E5E] hover:text-[#111111] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5F5E5E] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5F5E5E] font-medium mb-1">TSC Number</label>
                  <input
                    type="text"
                    value={profileForm.tscNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, tscNumber: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm font-tabular-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#5F5E5E] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm font-tabular-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5F5E5E] font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5F5E5E] font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#5F5E5E] font-medium mb-1">Assigned Stream</label>
                  <input
                    type="text"
                    value={profileForm.assignedStream}
                    onChange={(e) => setProfileForm({ ...profileForm, assignedStream: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#DDD6C7] rounded text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DDD6C7] mt-4">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  type="button"
                  className="px-4 py-2 border border-[#DDD6C7] rounded bg-transparent hover:bg-[#F2EDE3] font-medium text-xs min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C2410C] text-[#FEF9EF] rounded font-medium text-xs hover:opacity-90 min-h-[44px] cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
