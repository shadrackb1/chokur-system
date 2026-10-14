import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNavBar } from './components/TopNavBar';
import { GradingProvider, useGrading } from './context/GradingContext';
import { useAppStore } from './lib/store';
import { Logo } from './components/brand/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Lazy-load app views so landing page stays light
const OverviewView = lazy(() => import('./views/OverviewView').then(m => ({ default: m.OverviewView })));
const MarksEntryView = lazy(() => import('./views/MarksEntryView').then(m => ({ default: m.MarksEntryView })));
const RankingsView = lazy(() => import('./views/RankingsView').then(m => ({ default: m.RankingsView })));
const SubjectAnalysisView = lazy(() => import('./views/SubjectAnalysisView').then(m => ({ default: m.SubjectAnalysisView })));
const GradeDistributionView = lazy(() => import('./views/GradeDistributionView').then(m => ({ default: m.GradeDistributionView })));
const ReportCardsView = lazy(() => import('./views/ReportCardsView').then(m => ({ default: m.ReportCardsView })));
const StudentsClassesView = lazy(() => import('./views/StudentsClassesView').then(m => ({ default: m.StudentsClassesView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));

// Landing page (not lazy - should load fast)
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import BrandPage from './pages/BrandPage';

const Skeleton = () => (
  <div className="min-h-screen bg-surface text-primary flex flex-col font-body">
    <aside className="fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-surface-panel border-r border-hairline z-40" />
    <header className="fixed top-0 left-[var(--sidebar-width)] right-0 h-[var(--header-height)] bg-surface-panel border-b border-hairline z-30" />
    <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)] min-h-screen flex-1 flex flex-col bg-surface p-8">
      <div className="space-y-4 max-w-[var(--content-max-width)] mx-auto">
        <div className="h-8 bg-surface-container rounded-sm w-1/3 animate-pulse" />
        <div className="h-4 bg-surface-container rounded-sm w-1/2 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-panel border border-hairline p-4 rounded-sm animate-pulse h-24" />
          <div className="bg-surface-panel border border-hairline p-4 rounded-sm animate-pulse h-24" />
          <div className="bg-surface-panel border border-hairline p-4 rounded-sm animate-pulse h-24" />
          <div className="bg-surface-panel border border-hairline p-4 rounded-sm animate-pulse h-24" />
        </div>
        <div className="bg-surface-panel border border-hairline p-4 rounded-sm animate-pulse h-64 mt-6" />
      </div>
    </main>
  </div>
);

const AppShell: React.FC = () => {
  const { activeView } = useGrading();
  const location = useLocation();

  // Inject noindex meta tag for app routes
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => {
      meta.content = 'index, follow';
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col font-body">
      {/* Fixed Left Navigation */}
      <Sidebar />

      {/* Fixed Top Context App Bar */}
      <TopNavBar />

      {/* Main Workspace Canvas */}
      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)] min-h-screen flex-1 flex flex-col bg-surface">
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route path="/overview" element={<OverviewView />} />
            <Route path="/marks-entry" element={<MarksEntryView />} />
            <Route path="/rankings" element={<RankingsView />} />
            <Route path="/subject-analysis" element={<SubjectAnalysisView />} />
            <Route path="/grade-distribution" element={<GradeDistributionView />} />
            <Route path="/report-cards" element={<ReportCardsView />} />
            <Route path="/students" element={<StudentsClassesView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/app/*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const AppWrapper: React.FC = () => {
  const initializeApp = useAppStore(state => state.initializeApp);
  const activeView = useAppStore(state => state.activeView);
  const setActiveView = useAppStore(state => state.setActiveView);

  React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <GradingProvider>
      <AppShell />
    </GradingProvider>
  );
};

// Public routes (landing, demo, privacy, terms, brand)
const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/brand" element={<BrandPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Root router - decides whether to show app or landing page
// This component MUST be inside BrowserRouter to use useLocation()
const RootRouter: React.FC = () => {
  const location = useLocation();
  const [showApp, setShowApp] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if we're on a public route (landing, demo, privacy, terms, brand, 404)
    // Root "/" goes to app shell, not landing
    const isPublicRoute = location.pathname.startsWith('/welcome') ||
                          location.pathname.startsWith('/demo') ||
                          location.pathname.startsWith('/privacy') ||
                          location.pathname.startsWith('/terms') ||
                          location.pathname.startsWith('/brand') ||
                          location.pathname.startsWith('/404');

    setShowApp(!isPublicRoute);
    setChecked(true);
  }, [location.pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Logo variant="horizontal" size={48} />
          <div className="mt-4 text-body-sm text-secondary">Loading…</div>
        </div>
      </div>
    );
  }

  return showApp ? <AppWrapper /> : <PublicRoutes />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <RootRouter />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}