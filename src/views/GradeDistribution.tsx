import { useAppStore } from '../lib/store';

export function GradeDistribution() {
  const { gradeDistribution, activeClassId, activeExamId } = useAppStore();

  if (!activeClassId || !activeExamId) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="text-center bg-surface-panel border border-hairline rounded-lg p-8 max-w-md">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block">bar_chart</span>
          <h2 className="text-h2 text-primary mb-2">Grade Distribution</h2>
          <p className="text-body text-secondary mb-6">Select a class and exam from the sidebar to view grade distribution.</p>
        </div>
      </div>
    );
  }

  const total = gradeDistribution.reduce((sum, t) => sum + t.studentCount, 0) || 1;
  const maxCount = Math.max(...gradeDistribution.map(t => t.studentCount), 1);

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-[var(--content-max-width-wide)] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-primary">Grade Distribution</h2>
            <p className="text-body text-secondary">{total} students</p>
          </div>
        </div>

        <Card title="Grade Distribution Chart" icon="bar_chart" className="overflow-x-auto">
          <div className="space-y-3 max-w-2xl">
            {gradeDistribution.map(tier => {
              const percentage = (tier.studentCount / total) * 100;
              const barWidth = (tier.studentCount / maxCount) * 100;
              const isHonors = ['A', 'A-', 'B+'].includes(tier.grade);
              const isCompetent = ['B', 'B-', 'C+'].includes(tier.grade);
              const isMarginal = ['C', 'C-', 'D+'].includes(tier.grade);
              const isCritical = ['D', 'D-', 'E'].includes(tier.grade);

              let barColor = 'bg-brand';
              if (isHonors) barColor = 'bg-emerald-600';
              else if (isCompetent) barColor = 'bg-brand';
              else if (isMarginal) barColor = 'bg-amber-600';
              else barColor = 'bg-red-600';

              let gradeClass = '';
              if (isHonors) gradeClass = 'text-emerald-700 bg-emerald-100';
              else if (isCompetent) gradeClass = 'text-brand bg-brand-light';
              else if (isMarginal) gradeClass = 'text-amber-700 bg-amber-100';
              else gradeClass = 'text-red-700 bg-red-100';

              return (
                <div key={tier.grade} className="flex items-center gap-4">
                  <span className={`inline-flex items-center justify-center font-mono font-semibold rounded-xs px-2.5 py-0.5 text-tabular-sm min-w-[36px] ${gradeClass}`}>
                    {tier.grade}
                  </span>
                  <div className="flex-1 h-6 bg-surface-container rounded-full overflow-hidden relative">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                    {tier.grade === 'C+' && (
                      <div className="absolute top-0 bottom-0 left-[calc(55% - 1px)] w-0.5 bg-red-600" />
                    )}
                  </div>
                  <span className="w-20 text-right text-body tabular-nums text-secondary">{tier.studentCount}</span>
                  <span className="w-16 text-right text-caption text-tertiary">{percentage.toFixed(1)}%</span>
                  <span className="w-20 text-right text-caption text-tertiary">{tier.cumulativePercentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4 text-center">
            <div className="col-span-1 text-caption text-tertiary">Grade</div>
            <div className="col-span-1 text-caption text-tertiary">Count</div>
            <div className="col-span-1 text-caption text-tertiary">%</div>
            <div className="col-span-1 text-caption text-tertiary">Cum%</div>
          </div>
        </Card>

        <Card title="Grade Tiers Detail" icon="table_chart">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container sticky top-0">
                <tr>
                  <th className="p-3 text-left text-label text-tertiary">Grade</th>
                  <th className="p-3 text-center text-label text-tertiary">Points</th>
                  <th className="p-3 text-center text-label text-tertiary">Students</th>
                  <th className="p-3 text-center text-label text-tertiary">Share %</th>
                  <th className="p-3 text-center text-label text-tertiary">Cumulative %</th>
                  <th className="p-3 text-left text-label text-tertiary">Tier</th>
                </tr>
              </thead>
              <tbody>
                {gradeDistribution.map((tier, idx) => {
                  const isHonors = ['A', 'A-', 'B+'].includes(tier.grade);
                  const isCompetent = ['B', 'B-', 'C+'].includes(tier.grade);
                  const isMarginal = ['C', 'C-', 'D+'].includes(tier.grade);
                  const isCritical = ['D', 'D-', 'E'].includes(tier.grade);

                  let tierLabel = 'Critical';
                  let tierColor = 'text-red-700 bg-red-100';
                  if (isHonors) { tierLabel = 'Honors'; tierColor = 'text-emerald-700 bg-emerald-100'; }
                  else if (isCompetent) { tierLabel = 'Competent'; tierColor = 'text-brand bg-brand-light'; }
                  else if (isMarginal) { tierLabel = 'Marginal'; tierColor = 'text-amber-700 bg-amber-100'; }

                  return (
                    <tr key={tier.grade} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center font-mono font-semibold rounded-xs px-2.5 py-0.5 text-tabular-sm min-w-[36px] ${tierColor}`}>
                          {tier.grade}
                        </span>
                      </td>
                      <td className="p-3 text-center text-body tabular-nums">{tier.pointsEquivalent}</td>
                      <td className="p-3 text-center text-h3 text-primary tabular-nums">{tier.studentCount}</td>
                      <td className="p-3 text-center text-body tabular-nums">{tier.cohortShare.toFixed(1)}%</td>
                      <td className="p-3 text-center text-body tabular-nums">{tier.cumulativePercentage.toFixed(1)}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-sm text-label font-medium ${tierColor}`}>{tierLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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