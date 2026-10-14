import { BrowserRouter, Routes, Route, Navigate, type Outlet, useLocation } from 'react-router-dom';
import { GradingProvider } from './context/GradingContext';
import { useAppStore } from './lib/store';
import { Overview } from './views/Overview';
import { MarksEntry } from './views/MarksEntry';
import { Rankings } from './views/Rankings';
import { SubjectAnalysis } from './views/SubjectAnalysis';
import { GradeDistribution } from './views/GradeDistribution';
import { ReportCards } from './views/ReportCards';
import { StudentsClasses } from './views/StudentsClasses';
import { Settings } from './views/Settings';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const NAV_ROUTES = [
  { path: '/overview', label: 'Overview', icon: 'dashboard' },
  { path: '/marks-entry', label: 'Marks Entry', icon: 'edit_note' },
  { path: '/rankings', label: 'Rankings', icon: 'format_list_numbered' },
  { path: '/subject-analysis', label: 'Subject Analysis', icon: 'analytics' },
  { path: '/grade-distribution', label: 'Grade Distribution', icon: 'bar_chart' },
  { path: '/report-cards', label: 'Report Cards', icon: 'badge' },
  { path: '/students-classes', label: 'Students & Classes', icon: 'group' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

function ProtectedRoutes() {
  const { initializeApp, students, subjects, exams } = useAppStore();
  const location = useLocation();

  // Initialize on first render
  // initializeApp is called in Layout

  // Redirect logic for missing data
  if (location.pathname !== '/settings' && location.pathname !== '/students-classes') {
    if (students.length === 0 || subjects.length === 0) {
      return <Navigate to="/students-classes" replace />;
    }
    if (exams.length === 0) {
      return <Navigate to="/students-classes" replace />;
    }
  }

  return (
    <Routes>
      <Route path="/overview" element={<Overview />} />
      <Route path="/marks-entry" element={<MarksEntry />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route path="/subject-analysis" element={<SubjectAnalysis />} />
      <Route path="/grade-distribution" element={<GradeDistribution />} />
      <Route path="/report-cards" element={<ReportCards />} />
      <Route path="/students-classes" element={<StudentsClasses />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <GradingProvider>
        <ErrorBoundary>
          <ToastProvider>
            <Layout navRoutes={NAV_ROUTES}>
              <ProtectedRoutes />
            </Layout>
          </ToastProvider>
        </ErrorBoundary>
      </GradingProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;