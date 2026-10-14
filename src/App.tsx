import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNavBar } from './components/TopNavBar';
import { GradingProvider, useGrading } from './context/GradingContext';
import { GradeDistributionView } from './views/GradeDistributionView';
import { MarksEntryView } from './views/MarksEntryView';
import { OverviewView } from './views/OverviewView';
import { RankingsView } from './views/RankingsView';
import { ReportCardsView } from './views/ReportCardsView';
import { SettingsView } from './views/SettingsView';
import { StudentsClassesView } from './views/StudentsClassesView';
import { SubjectAnalysisView } from './views/SubjectAnalysisView';
import { useAppStore } from './lib/store';

const MainContent: React.FC = () => {
  const { activeView } = useGrading();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col font-body">
      {/* Fixed Left Navigation */}
      <Sidebar />

      {/* Fixed Top Context App Bar */}
      <TopNavBar />

      {/* Main Workspace Canvas */}
      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)] min-h-screen flex-1 flex flex-col bg-surface">
        <Routes>
          <Route path="/overview" element={<OverviewView />} />
          <Route path="/marks-entry" element={<MarksEntryView />} />
          <Route path="/rankings" element={<RankingsView />} />
          <Route path="/subject-analysis" element={<SubjectAnalysisView />} />
          <Route path="/grade-distribution" element={<GradeDistributionView />} />
          <Route path="/report-cards" element={<ReportCardsView />} />
          <Route path="/students" element={<StudentsClassesView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/" element={<OverviewView />} />
        </Routes>
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

  // Sync activeView with URL
  React.useEffect(() => {
    const pathMap: Record<string, string> = {
      overview: '/overview',
      'marks-entry': '/marks-entry',
      rankings: '/rankings',
      'subject-analysis': '/subject-analysis',
      'grade-distribution': '/grade-distribution',
      'report-cards': '/report-cards',
      students: '/students',
      settings: '/settings',
    };
    if (pathMap[activeView]) {
      // Navigation handled by router
    }
  }, [activeView]);

  return (
    <BrowserRouter>
      <GradingProvider>
        <MainContent />
      </GradingProvider>
    </BrowserRouter>
  );
};

export default function App() {
  return <AppWrapper />;
}