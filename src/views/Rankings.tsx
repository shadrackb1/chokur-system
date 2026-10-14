import { useState } from 'react';
import { useAppStore } from '../lib/store';

export function Rankings() {
  const { rankings, filteredStudents, classStats, activeClassId, activeExamId } = useAppStore();
  const [search, setSearch] = useState('');

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">format_list_numbered</span>
          <h2 className="text-h2 text-primary mb-2">Rankings</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to view rankings.</p>
        </div>
      </div>
    );
  }

  const filtered = rankings.filter(r =>
    r.student.name.toLowerCase().includes(search.toLowerCase()) ||
    r.student.admNo.includes(search)
  );

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-primary">Rankings</h2>
            <p className="text-body text-secondary">{filteredStudents.length} students • {classStats.passRate}% pass rate</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or AdmNo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring w-64"
            />
          </div>
        </div>

        <div className="bg-surface-panel border border-hairline rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container sticky top-0">
                <tr>
                  <th className="p-3 text-left text-label text-tertiary w-12">Rank</th>
                  <th className="p-3 text-left text-label text-tertiary">Student</th>
                  <th className="p-3 text-center text-label text-tertiary w-20">Aggregate</th>
                  <th className="p-3 text-center text-label text-tertiary w-20">Mean Grade</th>
                  <th className="p-3 text-center text-label text-tertiary w-20">Mean Points</th>
                  <th className="p-3 text-center text-label text-tertiary w-20">Status</th>
                  <th className="p-3 text-center text-label text-tertiary w-20">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((calc, idx) => (
                  <tr key={calc.student.id} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                    <td className="p-3 text-center text-h3 font-bold text-brand">{calc.rank}</td>
                    <td className="p-3">
                      <p className="text-body font-medium text-primary">{calc.student.name}</p>
                      <p className="text-caption text-tertiary">{calc.student.admNo}</p>
                    </td>
                    <td className="p-3 text-center text-h3 text-primary tabular-nums">{calc.aggregate}</td>
                    <td className="p-3 text-center">
                      <GradeChip grade={calc.meanGrade} />
                    </td>
                    <td className="p-3 text-center text-h3 text-primary tabular-nums">{calc.meanPoints.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-sm text-label font-medium ${
                        calc.qualifies ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {calc.qualifies ? 'Qualified' : 'Not Qualified'}
                      </span>
                    </td>
                    <td className="p-3 text-center text-body tabular-nums">{calc.enteredCount}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {search && filtered.length === 0 && (
          <p className="text-center text-body text-secondary py-8">No students found matching "{search}"</p>
        )}
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