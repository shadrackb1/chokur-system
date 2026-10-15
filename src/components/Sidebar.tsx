import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/GradingContext';
import { ViewType } from '../types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  shortLabel?: string;
  roles?: ('admin' | 'teacher' | 'parent' | 'student')[];
}

const PRIMARY_MOBILE_TABS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', shortLabel: 'Overview' },
  { id: 'marks-entry', label: 'Marks', icon: 'edit_note', shortLabel: 'Marks', roles: ['admin', 'teacher'] },
  { id: 'rankings', label: 'Rankings', icon: 'format_list_numbered', shortLabel: 'Rankings' },
  { id: 'report-cards', label: 'Cards', icon: 'badge', shortLabel: 'Reports', roles: ['admin', 'teacher'] },
];

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'marks-entry', label: 'Marks Entry', icon: 'edit_note', roles: ['admin', 'teacher'] },
  { id: 'rankings', label: 'Rankings', icon: 'format_list_numbered' },
  { id: 'subject-analysis', label: 'Subject Analysis', icon: 'analytics' },
  { id: 'grade-distribution', label: 'Grade Distribution', icon: 'bar_chart' },
  { id: 'report-cards', label: 'Report Cards', icon: 'badge', roles: ['admin', 'teacher'] },
  { id: 'students', label: 'Students & Classes', icon: 'group', roles: ['admin', 'teacher'] },
  { id: 'profile', label: 'Profile & WhatsApp', icon: 'forum', roles: ['admin', 'teacher'] },
  { id: 'settings', label: 'Settings', icon: 'settings', roles: ['admin', 'teacher'] },
  { id: 'student-portal', label: 'My Progress', icon: 'school', roles: ['student'], shortLabel: 'Progress' },
  { id: 'parent-portal', label: "My Children", icon: 'family_restroom', roles: ['parent'], shortLabel: 'Children' },
  { id: 'learning', label: 'Learning', icon: 'quiz', roles: ['student'], shortLabel: 'Learn' },
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: 'admin_panel_settings', roles: ['admin'], shortLabel: 'Admin' },
  { id: 'teacher-dashboard', label: 'Teacher Dashboard', icon: 'person', roles: ['teacher'], shortLabel: 'Teach' },
  { id: 'analytics-pro', label: 'Advanced Analytics', icon: 'insights', roles: ['admin', 'teacher'], shortLabel: 'Analytics' },
  { id: 'announcements', label: 'Announcements', icon: 'campaign', roles: ['admin', 'teacher', 'parent', 'student'], shortLabel: 'News' },
  { id: 'fees', label: 'Fee Management', icon: 'payments', roles: ['admin', 'teacher'], shortLabel: 'Fees' },
  { id: 'timetable', label: 'Timetable', icon: 'schedule', roles: ['admin', 'teacher', 'student'], shortLabel: 'Timetable' },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useGrading();
  const { user, isOnline } = useAuth();
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const filteredNavItems = ALL_NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    if (!isOnline || !user) return false;
    return item.roles.includes(user.role);
  });

  const filteredMobileTabs = PRIMARY_MOBILE_TABS.filter(item => {
    if (!item.roles) return true;
    if (!isOnline || !user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* 1. TABLET & DESKTOP SIDEBAR / RAIL (md: 72px rail, lg: 200px, xl: 220px) */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full md:w-[72px] lg:w-[200px] xl:w-[220px] flex-col justify-between py-3 z-40 bg-[#FEF9EF] border-r border-[#DDD6C7] select-none transition-all duration-200">
        <div>
          {/* Brand Header */}
          <div className="px-3 lg:px-4 pb-3 mb-2 border-b border-[#DDD6C7] flex items-center justify-center lg:justify-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[#111111] flex items-center justify-center text-[#FBF8F1] font-tabular-sm text-xs font-bold shrink-0">
              CK
            </div>
            <div className="leading-none hidden lg:block">
              <span className="font-headline-md text-headline-md text-[#111111] font-semibold tracking-tight">
                Chokur
              </span>
              <span className="font-caption text-caption text-[#5F5E5E] block mt-0.5 uppercase tracking-wider text-[10px]">
                System
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-0.5 px-1 lg:px-0">
            {filteredNavItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  type="button"
                  title={item.label}
                  className={`w-full text-left transition-colors duration-150 flex items-center justify-center lg:justify-start gap-3 cursor-pointer min-h-[44px] rounded lg:rounded-none ${
                    isActive
                      ? 'border-l-0 lg:border-l-2 border-[#C2410C] text-[#111111] font-headline-sm text-headline-sm bg-[#FBF8F1] lg:pl-3.5 py-2.5'
                      : 'text-[#5F5E5E] hover:text-[#111111] hover:bg-[#F2EDE3] lg:pl-4 py-2.5 font-body-md text-body-md'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-[#C2410C]' : 'text-[#5F5E5E]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden lg:inline text-[13px]">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#DDD6C7] flex flex-col px-2 lg:px-4">
          <div className="hidden lg:flex items-center justify-between text-[#9A958A] font-caption text-[11px] pb-1">
            <span>KCSE Module v2.4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="flex lg:hidden justify-center py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" title="KCSE v2.4 Active"></span>
          </div>
        </div>
      </aside>

      {/* 2. PHONE BOTTOM TAB BAR (< 768px) with 48px touch targets & safe area padding */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FEF9EF] border-t border-[#DDD6C7] z-40 items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] select-none shadow-md">
        {filteredMobileTabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              type="button"
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
                isActive ? 'text-[#C2410C]' : 'text-[#5F5E5E] hover:text-[#111111]'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#C2410C]' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.shortLabel}</span>
              {isActive && <span className="w-4 h-0.5 bg-[#C2410C] rounded-full mt-0.5"></span>}
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setIsMobileMoreOpen(true)}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
            !filteredMobileTabs.some((t) => t.id === activeView)
              ? 'text-[#C2410C]'
              : 'text-[#5F5E5E] hover:text-[#111111]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">more_horiz</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
          {!filteredMobileTabs.some((t) => t.id === activeView) && (
            <span className="w-4 h-0.5 bg-[#C2410C] rounded-full mt-0.5"></span>
          )}
        </button>
      </nav>

      {/* 3. MOBILE MORE DRAWER / BOTTOM SHEET */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 animate-fadeIn">
          {/* Backdrop click */}
          <div className="flex-1" onClick={() => setIsMobileMoreOpen(false)} />

          {/* Bottom Sheet Modal */}
          <div className="bg-[#FEF9EF] border-t border-[#DDD6C7] rounded-t-xl p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl animate-slideUp max-h-[80vh] overflow-y-auto">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-[#DDD6C7] rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DDD6C7]">
              <span className="font-headline-md text-headline-md text-[#111111] font-semibold">
                All Modules &amp; Tools
              </span>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-[#F2EDE3] flex items-center justify-center text-[#5F5E5E] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-2">
              {filteredNavItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMoreOpen(false);
                    }}
                    type="button"
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left min-h-[48px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#FBF8F1] border-[#C2410C] text-[#C2410C] font-semibold'
                        : 'bg-[#FBF8F1] border-[#DDD6C7] text-[#111111] hover:bg-[#F2EDE3]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'text-[#C2410C]' : 'text-[#5F5E5E]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
