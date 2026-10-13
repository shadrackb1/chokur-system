import React, { useState } from 'react';
import { useGrading } from '../context/GradingContext';

export const TopNavBar: React.FC = () => {
  const { activeStream, setActiveStream, activeExam, setActiveExam } = useGrading();
  const [showStreamDropdown, setShowStreamDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  const streams = ['Form 4 East', 'Form 4 West', 'Form 4 North', 'Form 3 East'];
  const exams = [
    'End-term Exam, Term 2 2026',
    'Mid-term Exam, Term 2 2026',
    'End-term Exam, Term 1 2026',
  ];

  return (
    <header className="fixed top-0 left-[220px] right-0 h-14 bg-[#FEF9EF] border-b border-[#DDD6C7] flex items-center justify-between px-6 z-30 no-print">
      {/* Context Selectors */}
      <div className="flex items-center gap-2 relative">
        {/* Stream Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStreamDropdown(!showStreamDropdown);
              setShowExamDropdown(false);
            }}
            type="button"
            className="border border-[#DDD6C7] bg-[#FBF8F1] px-3 py-1.5 rounded text-[#111111] font-body-sm text-[13px] font-medium flex items-center gap-1.5 transition-colors hover:bg-[#F2EDE3] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#C2410C]"></span>
            <span>{activeStream}</span>
            <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
          </button>

          {showStreamDropdown && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-[#FBF8F1] border border-[#DDD6C7] shadow-sm py-1 z-50">
              {streams.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setActiveStream(s);
                    setShowStreamDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                    activeStream === s ? 'font-medium text-[#C2410C]' : 'text-[#111111]'
                  }`}
                >
                  <span>{s}</span>
                  {activeStream === s && <span className="text-[11px] font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-[#DDD6C7] font-light">/</span>

        {/* Exam Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowExamDropdown(!showExamDropdown);
              setShowStreamDropdown(false);
            }}
            type="button"
            className="border border-transparent hover:border-[#DDD6C7] bg-transparent hover:bg-[#FBF8F1] text-[#5F5E5E] hover:text-[#111111] font-body-sm text-[13px] px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">calendar_today</span>
            <span>{activeExam}</span>
            <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">expand_more</span>
          </button>

          {showExamDropdown && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#FBF8F1] border border-[#DDD6C7] shadow-sm py-1 z-50">
              {exams.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setActiveExam(e);
                    setShowExamDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#F2EDE3] flex items-center justify-between cursor-pointer ${
                    activeExam === e ? 'font-medium text-[#C2410C]' : 'text-[#111111]'
                  }`}
                >
                  <span>{e}</span>
                  {activeExam === e && <span className="text-[11px] font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Status Indicator */}
      <div className="flex items-center gap-4 text-[#5F5E5E] font-body-sm text-[13px]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#5F5E5E]">cloud_done</span>
          <span>All changes saved on this device</span>
        </div>
        <div className="h-4 w-px bg-[#DDD6C7]"></div>
        <div className="font-tabular-sm text-[11px] text-[#5F5E5E]">
          <span className="px-1.5 py-0.5 rounded bg-[#FBF8F1] border border-[#DDD6C7]">AUTOSAVE: ON</span>
        </div>
      </div>
    </header>
  );
};
