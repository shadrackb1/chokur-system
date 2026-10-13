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
    <aside className="fixed top-0 left-0 h-full w-[220px] flex flex-col justify-between py-4 z-40 bg-[#FEF9EF] border-r border-[#DDD6C7] select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="px-4 pb-4 mb-2 border-b border-[#DDD6C7] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-none bg-[#111111] flex items-center justify-center text-[#FBF8F1] font-tabular-sm text-[11px] font-bold">
            CK
          </div>
          <div className="leading-none">
            <span className="font-headline-md text-headline-md text-[#111111] font-semibold tracking-tight">Chokur</span>
            <span className="font-caption text-caption text-[#5F5E5E] block mt-0.5 uppercase tracking-wider text-[10px]">
              System
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col space-y-0.5 px-0">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
                className={`w-full text-left transition-colors duration-150 flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'border-l-2 border-[#C2410C] text-[#111111] font-headline-sm text-headline-sm bg-[#FBF8F1] pl-3 py-2.5'
                    : 'text-[#5F5E5E] hover:text-[#111111] hover:bg-[#F2EDE3] pl-3.5 py-2.5 font-body-md text-body-md'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isActive ? 'text-[#C2410C]' : 'text-[#5F5E5E]'
                  }`}
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
      <div className="pt-2 border-t border-[#DDD6C7] flex flex-col">
        <button
          onClick={() => setActiveView('settings')}
          type="button"
          className={`w-full text-left transition-colors duration-150 flex items-center gap-3 cursor-pointer ${
            activeView === 'settings'
              ? 'border-l-2 border-[#C2410C] text-[#111111] font-headline-sm text-headline-sm bg-[#FBF8F1] pl-3 py-2.5'
              : 'text-[#5F5E5E] hover:text-[#111111] hover:bg-[#F2EDE3] pl-3.5 py-2.5 font-body-md text-body-md'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeView === 'settings' ? 'text-[#C2410C]' : 'text-[#5F5E5E]'
            }`}
          >
            settings
          </span>
          <span>Settings</span>
        </button>

        <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[#9A958A] font-caption text-[11px]">
          <span>KCSE Module v2.4</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
        </div>
      </div>
    </aside>
  );
};
