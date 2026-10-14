import { useAppStore } from '../lib/store';

export function Overview() {
  const { classStats, subjectStats, strongestSubject, weakestSubject, nearTheLineStudents, rankings, filteredStudents, activeClassId, activeExamId } = useAppStore();

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">school</span>
          <h2 className="text-h2 text-primary mb-2">Welcome to Chokur System</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to view the overview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width)] mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Class Average" value={`${classStats.classAverage}%`} icon="analytics" />
          <StatCard label="Pass Rate" value={`${classStats.passRate}%`} icon="check_circle" />
          <StatCard label="Mean Grade" value={classStats.meanGrade} icon="grade" />
          <StatCard label="Students" value={String(filteredStudents.length)} icon="group" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Class Statistics" icon="bar_chart">
            <div className="space-y-3">
              <StatRow label="Highest Aggregate" value={classStats.highestAggregate} />
              <StatRow label="Lowest Aggregate" value={classStats.lowestAggregate} />
              <StatRow label="Students Ranked" value={rankings.length} />
              <StatRow label="Qualified (C+ and above)" value={rankings.filter(r => r.qualifies).length} />
            </div>
          </Card>

          <Card title="Subject Extremes" icon="trending_up">
            <div className="space-y-3">
              {strongestSubject && (
                <StatRow label="Strongest Subject" value={`${strongestSubject.name} (${strongestSubject.average}%)`} />
              )}
              {weakestSubject && (
                <StatRow label="Weakest Subject" value={`${weakestSubject.name} (${weakestSubject.average}%)`} />
              )}
              <StatRow label="Total Subjects" value={subjectStats.length} />
              <StatRow label="Subjects Entered" value={subjectStats.filter(s => s.entered > 0).length} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Near the Pass Line (C+)" icon="flag" className="max-h-96 overflow-y-auto">
            {nearTheLineStudents.length === 0 ? (
              <p className="text-body text-secondary text-center py-8">No students near the pass line</p>
            ) : (
              <div className="space-y-2">
                {nearTheLineStudents.slice(0, 10).map(calc => (
                  <div key={calc.student.id} className="flex items-center justify-between p-3 bg-surface-container rounded-sm border border-hairline">
                    <div>
                      <p className="text-body font-medium text-primary">{calc.student.name}</p>
                      <p className="text-caption text-tertiary">{calc.student.admNo} • Rank {calc.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-h3 text-warning font-semibold">{calc.meanPoints.toFixed(2)}</p>
                      <p className="text-caption text-tertiary">Mean Points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Top 5 Students" icon="emoji_events" className="max-h-96 overflow-y-auto">
            {rankings.length === 0 ? (
              <p className="text-body text-secondary text-center py-8">No rankings available</p>
            ) : (
              <div className="space-y-2">
                {rankings.slice(0, 5).map((calc, idx) => (
                  <div key={calc.student.id} className="flex items-center justify-between p-3 bg-surface-container rounded-sm border border-hairline">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center text-h3 font-bold text-brand">{calc.rank}</span>
                      <div>
                        <p className="text-body font-medium text-primary">{calc.student.name}</p>
                        <p className="text-caption text-tertiary">{calc.student.admNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-h3 text-primary font-semibold">{calc.aggregate}</p>
                      <p className="text-caption text-tertiary">Aggregate</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface-panel border border-hairline rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-tertiary uppercase tracking-wider mb-1">{label}</p>
          <p className="text-display font-mono text-primary">{value}</p>
        </div>
        <span className="material-symbols-outlined text-3xl text-brand">{icon}</span>
      </div>
    </div>
  );
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

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-body text-secondary">{label}</span>
      <span className="text-h3 text-primary font-semibold tabular-nums">{value}</span>
    </div>
  );
}