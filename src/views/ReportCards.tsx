import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useToast } from '../components/Toast';

export function ReportCards() {
  const { rankings, filteredStudents, activeClassId, activeExamId, classStats, schoolConfig, exportBackup } = useAppStore();
  const { showToast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">badge</span>
          <h2 className="text-h2 text-primary mb-2">Report Cards</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to generate report cards.</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handlePrintAll = () => {
    showToast('Printing all report cards...', 'info');
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  if (printMode) {
    return (
      <div className="p-8">
        {rankings.map(calc => (
          <ReportCard key={calc.student.id} calc={calc} classStats={classStats} schoolConfig={schoolConfig} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-h2 text-primary">Report Cards</h2>
            <p className="text-body text-secondary">{filteredStudents.length} students</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAll}
              className="px-4 py-2 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring flex items-center gap-2"
            >
              <span className="material-symbols-outlined">print</span>
              Print All
            </button>
            <button
              onClick={exportBackup}
              className="px-4 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankings.map(calc => (
            <div key={calc.student.id} className="bg-surface-panel border border-hairline rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-h3 text-primary">{calc.student.name}</p>
                  <p className="text-caption text-tertiary">{calc.student.admNo}</p>
                </div>
                <GradeChip grade={calc.meanGrade} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2 bg-surface-container rounded-sm">
                  <p className="text-h3 text-primary tabular-nums">{calc.aggregate}</p>
                  <p className="text-caption text-tertiary">Aggregate</p>
                </div>
                <div className="p-2 bg-surface-container rounded-sm">
                  <p className="text-h3 text-primary tabular-nums">{calc.meanPoints.toFixed(2)}</p>
                  <p className="text-caption text-tertiary">Mean Pts</p>
                </div>
                <div className="p-2 bg-surface-container rounded-sm">
                  <p className="text-h3 text-primary tabular-nums">{calc.rank}</p>
                  <p className="text-caption text-tertiary">Rank</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudent(calc.student.id)}
                  className="flex-1 px-3 py-2 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring"
                >
                  View Card
                </button>
                <button
                  onClick={() => { setSelectedStudent(calc.student.id); setTimeout(handlePrint, 100); }}
                  className="px-3 py-2 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <ReportCard
            calc={rankings.find(r => r.student.id === selectedStudent)!}
            classStats={classStats}
            schoolConfig={schoolConfig}
            onClose={() => setSelectedStudent(null)}
            showClose
          />
        )}
      </div>
    </div>
  );
}

function ReportCard({ calc, classStats, schoolConfig, onClose, showClose = false }: {
  calc: { student: any; subjectPoints: Record<string, number>; subjectGrades: Record<string, string>; marks: Record<string, any>; aggregate: number; meanGrade: string; meanPoints: number; rank: number; qualifies: boolean };
  classStats: any;
  schoolConfig: any;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const subjectEntries = Object.entries(calc.subjectPoints);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white max-w-2xl w-full min-h-[800px] p-8 print:fixed print:inset-0 print:p-0 print:bg-white">
        {showClose && (
          <div className="flex justify-end mb-4 print:hidden">
            <button
              onClick={onClose}
              className="px-3 py-1 border border-hairline text-secondary rounded-sm hover:bg-surface-container transition-base"
            >
              Close
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 border-b-2 border-brand pb-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-brand">school</span>
              <div>
                <h1 className="text-h1 text-primary font-bold">{schoolConfig.name}</h1>
                <p className="text-body text-secondary">{schoolConfig.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-caption text-tertiary">School Code: {schoolConfig.code}</p>
              <p className="text-caption text-tertiary">Tel: {schoolConfig.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-label text-tertiary">Student Name</p>
              <p className="text-body font-semibold text-primary">{calc.student.name}</p>
            </div>
            <div className="text-right">
              <p className="text-label text-tertiary">Admission No</p>
              <p className="text-body font-semibold text-primary">{calc.student.admNo}</p>
            </div>
            <div>
              <p className="text-label text-tertiary">Stream</p>
              <p className="text-body text-primary">{calc.student.stream}</p>
            </div>
            <div className="text-right">
              <p className="text-label text-tertiary">Gender</p>
              <p className="text-body text-primary">{calc.student.gender}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-h3 text-primary mb-4 border-b border-hairline pb-2">Subject Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container">
                  <th className="p-2 text-left text-label text-tertiary border border-hairline">Subject</th>
                  <th className="p-2 text-center text-label text-tertiary border border-hairline">Code</th>
                  <th className="p-2 text-center text-label text-tertiary border border-hairline">Marks</th>
                  <th className="p-2 text-center text-label text-tertiary border border-hairline">Grade</th>
                  <th className="p-2 text-center text-label text-tertiary border border-hairline">Points</th>
                </tr>
              </thead>
              <tbody>
                {subjectEntries.map(([code, points]) => {
                  const grade = calc.subjectGrades[code];
                  const marks = calc.marks[code];
                  return (
                    <tr key={code} className="border-b border-hairline">
                      <td className="p-2 border border-hairline">{code}</td>
                      <td className="p-2 text-center border border-hairline">{code}</td>
                      <td className="p-2 text-center border border-hairline tabular-nums font-medium">
                        {marks === 'ABS' ? 'ABS' : marks}
                      </td>
                      <td className="p-2 text-center border border-hairline">
                        <GradeChip grade={grade} />
                      </td>
                      <td className="p-2 text-center border border-hairline tabular-nums font-medium">{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-surface-container rounded-lg text-center">
            <p className="text-label text-tertiary">Aggregate</p>
            <p className="text-display font-mono text-primary">{calc.aggregate}</p>
            <p className="text-caption text-tertiary">Max: 84</p>
          </div>
          <div className="p-4 bg-surface-container rounded-lg text-center">
            <p className="text-label text-tertiary">Mean Grade</p>
            <p className="text-display font-mono text-primary">{calc.meanGrade}</p>
            <p className="text-caption text-tertiary">Points: {calc.meanPoints.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-surface-container rounded-lg text-center">
            <p className="text-label text-tertiary">Rank</p>
            <p className="text-display font-mono text-primary">{calc.rank} / {classStats.highestAggregate || filteredStudents.length}</p>
            <p className="text-caption text-tertiary">{calc.qualifies ? 'Qualified (C+)' : 'Not Qualified'}</p>
          </div>
        </div>

        <div className="border-t border-hairline pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-label text-tertiary">Class Teacher</p>
              <p className="text-body text-primary">________________________</p>
              <p className="text-caption text-tertiary">Signature & Date</p>
            </div>
            <div className="text-right">
              <p className="text-label text-tertiary">Principal</p>
              <p className="text-body text-primary">________________________</p>
              <p className="text-caption text-tertiary">Signature & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradeChip({ grade }: { grade: string }) {
  const isHonors = ['A', 'A-', 'B+'].includes(grade);
  const isCompetent = ['B', 'B-', 'C+'].includes(grade);
  const isMarginal = ['C', 'C-', 'D+'].includes(grade);

  if (isHonors) {
    return <span className="inline-flex items-center justify-center font-mono font-semibold rounded-xs bg-[var(--color-tier-honors-bg)] text-[var(--color-tier-honors-text)] px-2.5 py-0.5 text-tabular-sm min-w-[28px]">{grade}</span>;
  }
  if (isCompetent) {
    return <span className="inline-flex items-center justify-center font-mono font-semibold rounded-xs border border-[var(--color-tier-competent-border)] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[var(--color-tier-competent-text)]">{grade}</span>;
  }
  if (isMarginal) {
    return <span className="inline-flex items-center justify-center font-mono font-medium rounded-xs border border-[var(--color-tier-marginal-border)] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[var(--color-tier-marginal-text)]">{grade}</span>;
  }
  return <span className="inline-flex items-center justify-center font-mono font-medium rounded-xs border-dashed border-[var(--color-tier-critical-border)] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[var(--color-tier-critical-text)]">{grade}</span>;
}

function Card({ title, icon, children, className = '' }: { title: string; icon: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-panel border border-hairline rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-brand">{icon}</span>
        <h3 className="text-h3 text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const filteredStudents: any[] = [];