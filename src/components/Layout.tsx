import { type ReactNode, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Outlet, type Link, useLocation, NavLink } from 'react-router-dom';

interface LayoutProps {
  navRoutes: Array<{ path: string; label: string; icon: string }>;
  children?: ReactNode;
}

export function Layout({ navRoutes }: LayoutProps) {
  const { activeView, setActiveView, activeClassId, setActiveClassId, activeExamId, setActiveExamId, classes, exams, initializeApp } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const activeClass = classes.find((c) => c.id === activeClassId);
  const activeExam = exams.find((e) => e.id === activeExamId);
  const classExams = activeClassId ? exams.filter((e) => e.classId === activeClassId && e.isActive) : [];

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col font-sans">
      <aside className="fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-surface-panel border-r border-hairline z-40 flex flex-col">
        <div className="p-4 border-b border-hairline flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-brand">school</span>
          <div className="leading-tight min-w-0">
            <span className="text-h3 text-primary font-semibold tracking-tight truncate block">Chokur</span>
            <span className="text-caption text-tertiary block mt-0.5 uppercase tracking-wider truncate block">System</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navRoutes.map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={() => setActiveView(route.path.slice(1))}
                className={`w-full text-left transition-base flex items-center gap-3 cursor-pointer rounded-sm ${
                  isActive
                    ? 'border-l-2 border-brand text-primary font-h3 bg-surface-container pl-3 py-2.5'
                    : 'text-secondary hover:text-primary hover:bg-surface-container pl-3.5 py-2.5 text-body'
                }`}
                end
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-brand' : 'text-tertiary'}`}>
                  {route.icon}
                </span>
                <span>{route.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-hairline">
          <div className="space-y-2 text-caption text-tertiary">
            <div className="flex items-center justify-between">
              <span>Class</span>
              <select
                value={activeClassId || ''}
                onChange={(e) => setActiveClassId(e.target.value || null)}
                className="flex-1 ml-2 px-2 py-1 text-xs bg-surface border border-hairline rounded-sm text-primary focus-ring"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {activeClassId && (
              <div className="flex items-center justify-between">
                <span>Exam</span>
                <select
                  value={activeExamId || ''}
                  onChange={(e) => setActiveExamId(e.target.value || null)}
                  className="flex-1 ml-2 px-2 py-1 text-xs bg-surface border border-hairline rounded-sm text-primary focus-ring"
                >
                  <option value="">Select exam</option>
                  {classExams.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </aside>

      <header className="fixed top-0 left-[var(--sidebar-width)] right-0 h-[var(--header-height)] bg-surface-panel border-b border-hairline z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-h2 text-primary font-semibold">{navRoutes.find((r) => r.path === location.pathname)?.label || 'Chokur System'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption text-tertiary hidden sm:block">{activeClass?.name || 'No class selected'}</span>
          <span className="text-caption text-tertiary hidden md:block">{activeExam?.name || 'No exam selected'}</span>
        </div>
      </header>

      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)] min-h-screen flex-1 flex flex-col bg-surface">
        <Outlet />
      </main>
    </div>
  );
}