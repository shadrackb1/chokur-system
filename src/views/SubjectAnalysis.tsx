import { useAppStore } from '../lib/store';

export function SubjectAnalysis() {
  const { subjectStats, strongestSubject, weakestSubject, activeClassId, activeExamId, classStats } = useAppStore();

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">analytics</span>
          <h2 className="text-h2 text-primary mb-2">Subject Analysis</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to view subject analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-primary">Subject Analysis</h2>
            <p className="text-body text-secondary">Performance breakdown by subject</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Strongest Subject" icon="trending_up" className="bg-emerald-50 border-emerald-200">
            {strongestSubject ? (
              <div className="text-center py-4">
                <p className="text-display font-mono text-emerald-700">{strongestSubject.average}%</p>
                <p className="text-h3 text-emerald-800 mt-2">{strongestSubject.name}</p>
                <p className="text-caption text-emerald-600 mt-1">Highest average</p>
              </div>
            ) : (
              <p className="text-center text-body text-secondary py-8">No data</p>
            )}
          </Card>

          <Card title="Class Average" icon="analytics" className="bg-brand-light border-brand">
            <div className="text-center py-4">
              <p className="text-display font-mono text-brand">{classStats.classAverage}%</p>
              <p className="text-caption text-tertiary mt-1">Overall mean</p>
            </div>
          </Card>

          <Card title="Weakest Subject" icon="trending_down" className="bg-red-50 border-red-200">
            {weakestSubject ? (
              <div className="text-center py-4">
                <p className="text-display font-mono text-red-700">{weakestSubject.average}%</p>
                <p className="text-h3 text-red-800 mt-2">{weakestSubject.name}</p>
                <p className="text-caption text-red-600 mt-1">Lowest average</p>
              </div>
            ) : (
              <p className="text-center text-body text-secondary py-8">No data</p>
            )}
          </Card>
        </div>

        <Card title="All Subjects" icon="list" className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container sticky top-0">
              <tr>
                <th className="p-3 text-left text-label text-tertiary">Subject</th>
                <th className="p-3 text-center text-label text-tertiary">Dept</th>
                <th className="p-3 text-center text-label text-tertiary">Average</th>
                <th className="p-3 text-center text-label text-tertiary">Highest</th>
                <th className="p-3 text-center text-label text-tertiary">Lowest</th>
                <th className="p-3 text-center text-label text-tertiary">Pass Rate</th>
                <th className="p-3 text-center text-label text-tertiary">Entered</th>
                <th className="p-3 text-center text-label text-tertiary">vs Last Exam</th>
              </tr>
            </thead>
            <tbody>
              {subjectStats.map((stat, idx) => (
                <tr key={stat.subject.id} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                  <td className="p-3">
                    <p className="text-body font-medium text-primary">{stat.subject.name}</p>
                    <p className="text-caption text-tertiary">{stat.subject.code}</p>
                  </td>
                  <td className="p-3 text-center text-caption text-tertiary">{stat.subject.department}</td>
                  <td className="p-3 text-center text-h3 text-primary tabular-nums">{stat.average}%</td>
                  <td className="p-3 text-center text-body tabular-nums">{stat.highest}%</td>
                  <td className="p-3 text-center text-body tabular-nums">{stat.lowest}%</td>
                  <td className="p-3 text-center">
                    <div className="w-24 h-2 bg-surface-container rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${stat.passRate}%` }}></div>
                    </div>
                    <p className="text-caption text-tertiary mt-1">{stat.passRate}%</p>
                  </td>
                  <td className="p-3 text-center text-body tabular-nums">{stat.entered}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-sm text-label font-medium ${
                      stat.diffFromLastExam > 0 ? 'bg-emerald-100 text-emerald-800' :
                      stat.diffFromLastExam < 0 ? 'bg-red-100 text-red-800' :
                      'bg-surface-container text-tertiary'
                    }`}>
                      {stat.diffFromLastExam > 0 ? '+' : ''}{stat.diffFromLastExam.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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