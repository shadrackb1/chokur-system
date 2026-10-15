import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HybridGradingProvider, useGrading } from './context/HybridGradingContext';
import { GradingProvider } from './context/GradingContext';
import { Sidebar } from './components/Sidebar';
import { TopNavBar } from './components/TopNavBar';
import { ProtectedRoute, AdminRoute, TeacherRoute, AdminOrTeacherRoute, ParentRoute, StudentRoute } from './components/ProtectedRoute';
import { LoginPage } from './views/LoginPage';
import { SignUpPage } from './views/SignUpPage';
import { OverviewView } from './views/OverviewView';
import { MarksEntryView } from './views/MarksEntryView';
import { RankingsView } from './views/RankingsView';
import { SubjectAnalysisView } from './views/SubjectAnalysisView';
import { GradeDistributionView } from './views/GradeDistributionView';
import { ReportCardsView } from './views/ReportCardsView';
import { StudentsClassesView } from './views/StudentsClassesView';
import { SettingsView } from './views/SettingsView';
import { ProfileInboxView } from './views/ProfileInboxView';
import { StudentPortalView } from './views/StudentPortalView';
import { ParentPortalView } from './views/ParentPortalView';
import { LearningModuleView } from './views/LearningModuleView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { FeeManagementView } from './views/FeeManagementView';
import { AnalyticsProView } from './views/AnalyticsProView';
import { TimetableView } from './views/TimetableView';

const MainContent: React.FC = () => {
  const { activeView } = useGrading();

  return (
    <div className="min-h-screen bg-[#FEF9EF] text-[#111111] flex flex-col font-body-md text-body-md select-text">
      <Sidebar />
      <TopNavBar />
      <main className="pb-20 md:pb-6 md:ml-[72px] lg:ml-[200px] xl:ml-[220px] pt-14 min-h-screen flex-1 flex flex-col bg-[#FEF9EF] max-w-[1600px] w-full transition-all duration-200">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'marks-entry' && <MarksEntryView />}
        {activeView === 'rankings' && <RankingsView />}
        {activeView === 'subject-analysis' && <SubjectAnalysisView />}
        {activeView === 'grade-distribution' && <GradeDistributionView />}
        {activeView === 'report-cards' && <ReportCardsView />}
        {activeView === 'students' && <StudentsClassesView />}
        {activeView === 'profile' && <ProfileInboxView />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'student-portal' && <StudentPortalView />}
        {activeView === 'parent-portal' && <ParentPortalView />}
        {activeView === 'learning' && <LearningModuleView />}
        {activeView === 'admin-dashboard' && <AdminDashboardView />}
        {activeView === 'teacher-dashboard' && <TeacherDashboardView />}
        {activeView === 'announcements' && <AnnouncementsView />}
        {activeView === 'fees' && <FeeManagementView />}
        {activeView === 'timetable' && <TimetableView />}
        {activeView === 'analytics-pro' && <AnalyticsProView />}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isOnline, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2410C] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HybridGradingProvider>
          <GradingProvider>
            <AppRoutes />
          </GradingProvider>
        </HybridGradingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}