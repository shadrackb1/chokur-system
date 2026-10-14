import React, { useState } from 'react';
import { useGrading } from '../context/GradingContext';

export const TopNavBar: React.FC = () => {
  const {
    activeStream,
    setActiveStream,
    activeExam,
    setActiveExam,
    streams,
    exams,
    saveStatus,
    canInstallPwa,
    installPwa,
  } = useGrading();

  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-[72px] lg:left-[200px] xl:left-[220px] right-0 h-14 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between px-3 sm:px-6 z-30 no-print transition-all duration-200">
        {/* Context Selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Stream Selector Chip */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStreamModal(!showStreamModal);
                setShowExamModal(false);
              }}
              type="button"
              className="border border-[#DDD6C7] bg-[#FBF8F1] px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded text-[#111111] font-body-sm text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 transition-colors hover:bg-[#F2EDE3] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#C2410C] shrink-0"></span>
              <span className="truncate max-w-[110px] sm:max-w-none">{activeStream}</span>
              <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
            </button>
          </div>

          <span className="text-[#DDD6C7] font-light">/</span>

          {/* Exam Period Selector Chip */}
          <div className="relative">
            <button
              onClick={() => {
                setShowExamModal(!showExamModal);
                setShowStreamModal(false);
              }}
              type="button"
              className="border border-transparent hover:border-[#DDD6C7] bg-transparent hover:bg-[#FBF8F1] text-[#5F5E5E] hover:text-[#111111] font-body-sm text-[12px] sm:text-[13px] px-2 sm:px-2.5 py-1.5 min-h-[40px] rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#5F5E5E] shrink-0">
                calendar_today
              </span>
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{activeExam}</span>
              <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Right Action & Persistence Status */}
        <div className="flex items-center gap-2 sm:gap-4 text-[#5F5E5E] font-body-sm text-[12px] sm:text-[13px]">
          {/* PWA Install Button */}
          {canInstallPwa && (
            <button
              onClick={installPwa}
              type="button"
              className="px-2.5 py-1 bg-[#111111] text-[#FEF9EF] rounded text-xs font-semibold flex items-center gap-1 hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px]"
              title="Install Chokur System as an offline application"
            >
              <span className="material-symbols-outlined text-[15px] text-[#C2410C]">download</span>
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5">
            {saveStatus.state === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-amber-700 font-medium hidden sm:inline">Saving...</span>
              </>
            ) : saveStatus.state === 'offline' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="hidden sm:inline">Offline</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[17px] text-emerald-600">cloud_done</span>
                <span className="text-[#5C5850] hidden sm:inline">Saved</span>
              </>
            )}
          </div>

          <div className="hidden lg:block h-4 w-px bg-[#DDD6C7]"></div>
          <div className="hidden lg:block font-tabular-sm text-[11px] text-[#5F5E5E]">
            <span className="px-1.5 py-0.5 rounded bg-[#FBF8F1] border border-[#DDD6C7]">
              {saveStatus.lastSavedAt ? `SAVED ${saveStatus.lastSavedAt}` : 'ONLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* Stream Selector Bottom Sheet / Modal (Responsive across all screens) */}
      {showStreamModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:pt-16 sm:pl-28 lg:pl-56 bg-black/30 animate-fadeIn">
          <div className="flex-1" onClick={() => setShowStreamModal(false)} />
          <div className="bg-[#FBF8F1] border border-[#DDD6C7] rounded-t-xl sm:rounded-md shadow-xl max-w-sm w-full mx-auto sm:mx-0 overflow-hidden pb-4 sm:pb-1">
            <div className="px-4 py-2.5 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between">
              <span className="text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider font-semibold">
                Select Class &amp; Stream
              </span>
              <button
                onClick={() => setShowStreamModal(false)}
                type="button"
                className="text-[#5F5E5E] hover:text-[#111111] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#DDD6C7]/50">
              {streams.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveStream(s.name);
                    setShowStreamModal(false);
                  }}
                  type="button"
                  className={`w-full text-left px-4 py-3 sm:py-2 text-[13px] min-h-[48px] hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                    activeStream === s.name ? 'font-medium text-[#C2410C] bg-[#F8F3E9]' : 'text-[#111111]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{s.name}</span>
                    {s.classTeacher && (
                      <span className="text-[11px] text-[#5F5E5E]">{s.classTeacher}</span>
                    )}
                  </div>
                  {activeStream === s.name && <span className="text-[14px] font-bold text-[#C2410C]">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exam Selector Bottom Sheet / Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:pt-16 sm:pl-32 lg:pl-64 bg-black/30 animate-fadeIn">
          <div className="flex-1" onClick={() => setShowExamModal(false)} />
          <div className="bg-[#FBF8F1] border border-[#DDD6C7] rounded-t-xl sm:rounded-md shadow-xl max-w-md w-full mx-auto sm:mx-0 overflow-hidden pb-4 sm:pb-1">
            <div className="px-4 py-2.5 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between">
              <span className="text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider font-semibold">
                Select Examination Period
              </span>
              <button
                onClick={() => setShowExamModal(false)}
                type="button"
                className="text-[#5F5E5E] hover:text-[#111111] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#DDD6C7]/50">
              {exams.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setActiveExam(e.name);
                    setShowExamModal(false);
                  }}
                  type="button"
                  className={`w-full text-left px-4 py-3 sm:py-2 text-[13px] min-h-[48px] hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                    activeExam === e.name ? 'font-medium text-[#C2410C] bg-[#F8F3E9]' : 'text-[#111111]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{e.name}</span>
                    <span className="text-[11px] text-[#5F5E5E]">
                      {e.type} · {e.term} ({e.year})
                    </span>
                  </div>
                  {activeExam === e.name && <span className="text-[14px] font-bold text-[#C2410C]">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
