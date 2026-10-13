/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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

const MainContent: React.FC = () => {
  const { activeView } = useGrading();

  return (
    <div className="min-h-screen bg-[#FEF9EF] text-[#111111] flex flex-col font-body-md text-body-md select-text">
      {/* Fixed Left Navigation */}
      <Sidebar />

      {/* Fixed Top Context App Bar */}
      <TopNavBar />

      {/* Main Workspace Canvas */}
      <main className="ml-[220px] pt-14 min-h-screen flex-1 flex flex-col bg-[#FEF9EF]">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'marks-entry' && <MarksEntryView />}
        {activeView === 'rankings' && <RankingsView />}
        {activeView === 'subject-analysis' && <SubjectAnalysisView />}
        {activeView === 'grade-distribution' && <GradeDistributionView />}
        {activeView === 'report-cards' && <ReportCardsView />}
        {activeView === 'students' && <StudentsClassesView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <GradingProvider>
      <MainContent />
    </GradingProvider>
  );
}
