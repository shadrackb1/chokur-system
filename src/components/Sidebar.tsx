import React from 'react';
import { useGrading } from '../context/GradingContext';
import { ViewType } from '../types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'marks-entry', label: 'Marks Entry', icon: 'edit_note' },
  { id: 'rankings', label: 'Rankings', icon: 'format_list_numbered' },
  { id: 'subject-analysis', label: 'Subject Analysis', icon: 'analytics' },
  { id: 'grade-distribution', label: 'Grade Distribution', icon: 'bar_chart' },
  { id: 'report-cards', label: 'Report Cards', icon: 'badge' },
  { id: 'students', label: 'Students & Classes', icon: 'group' },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useGrading();

  return (
    <aside className="fixed top-0 left-0 h-full w-[var(--sidebar-width)] flex flex-col justify-between py-4 z-40 bg-surface-panel border-r border-hairline select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="px-4 pb-4 mb-4 border-b border-hairline flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-inverse font-mono text-tabular-xs font-bold">
            CK
          </div>
          <div className="leading-tight">
            <span className="text-h3 text-primary font-semibold tracking-tight">Chokur</span>
            <span className="text-caption text-tertiary block mt-0.5 uppercase tracking-wider">System</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
                className={`
                  w-full text-left transition-base flex items-center gap-3 cursor-pointer rounded-sm
                  ${isActive
                    ? 'border-l-2 border-brand text-primary font-h3 bg-surface-container pl-3 py-2.5'
                    : 'text-secondary hover:text-primary hover:bg-surface-container pl-3.5 py-2.5 text-body'}
                `}
              >
                <span
                  className={`
                    material-symbols-outlined text-[18px] ${isActive ? 'text-brand' : 'text-tertiary'}
                  `}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-hairline flex flex-col">
        <button
          onClick={() => setActiveView('settings')}
          type="button"
          className={`
            w-full text-left transition-base flex items-center gap-3 cursor-pointer rounded-sm
            ${activeView === 'settings'
              ? 'border-l-2 border-brand text-primary font-h3 bg-surface-container pl-3 py-2.5'
              : 'text-secondary hover:text-primary hover:bg-surface-container pl-3.5 py-2.5 text-body'}
          `}
        >
          <span
            className={`
              material-symbols-outlined text-[18px] ${
                activeView === 'settings' ? 'text-brand' : 'text-tertiary'
              }
            `}
          >
            settings
          </span>
          <span>Settings</span>
        </button>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between text-tertiary text-caption">
          <span>KCSE Module v2.4</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
        </div>
      </div>
    </aside>
  );
};