import React, { useState, useRef, useEffect } from 'react';
import { useGrading } from '../context/GradingContext';
import { Logo } from '../components/brand/Logo';

export const TopNavBar: React.FC = () => {
  const { activeStream, setActiveStream, activeExam, setActiveExam } = useGrading();
  const [showStreamDropdown, setShowStreamDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const streamDropdownRef = useRef<HTMLDivElement>(null);
  const examDropdownRef = useRef<HTMLDivElement>(null);

  const streams = ['Form 4 East', 'Form 4 West', 'Form 4 North', 'Form 3 East'];
  const exams = [
    'End-term Exam, Term 2 2026',
    'Mid-term Exam, Term 2 2026',
    'End-term Exam, Term 1 2026',
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (streamDropdownRef.current && !streamDropdownRef.current.contains(event.target as Node)) {
        setShowStreamDropdown(false);
      }
      if (examDropdownRef.current && !examDropdownRef.current.contains(event.target as Node)) {
        setShowExamDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-[var(--sidebar-width)] right-0 h-[var(--header-height)] bg-surface-panel border-b border-hairline flex items-center justify-between px-4 z-30 no-print">
      {/* Context Selectors */}
      <div className="flex items-center gap-2">
        {/* Stream Dropdown */}
        <div className="relative" ref={streamDropdownRef}>
          <button
            onClick={() => {
              setShowStreamDropdown(!showStreamDropdown);
              setShowExamDropdown(false);
            }}
            type="button"
            className="border border-hairline bg-surface-container px-3 py-1.5 rounded-sm text-primary font-body-sm font-medium flex items-center gap-2 transition-base hover:bg-surface-container-high cursor-pointer focus-ring"
          >
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            <span>{activeStream}</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">expand_more</span>
          </button>

          {showStreamDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-surface-panel border border-hairline shadow-md py-1 rounded-sm z-50">
              {streams.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setActiveStream(s);
                    setShowStreamDropdown(false);
                  }}
                  className={`
                    w-full text-left px-3 py-1.5 text-body-sm hover:bg-surface-container transition-base cursor-pointer flex items-center justify-between
                    ${activeStream === s ? 'font-medium text-brand' : 'text-primary'}
                  `}
                >
                  <span>{s}</span>
                  {activeStream === s && <span className="text-tabular-xs font-bold text-brand">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-hairline font-light">/</span>

        {/* Exam Period Dropdown */}
        <div className="relative" ref={examDropdownRef}>
          <button
            onClick={() => {
              setShowExamDropdown(!showExamDropdown);
              setShowStreamDropdown(false);
            }}
            type="button"
            className="border border-transparent hover:border-hairline bg-transparent hover:bg-surface-container text-secondary hover:text-primary font-body-sm px-2.5 py-1.5 rounded-sm transition-base flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">calendar_today</span>
            <span>{activeExam}</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">expand_more</span>
          </button>

          {showExamDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-surface-panel border border-hairline shadow-md py-1 rounded-sm z-50">
              {exams.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setActiveExam(e);
                    setShowExamDropdown(false);
                  }}
                  className={`
                    w-full text-left px-3 py-1.5 text-body-sm hover:bg-surface-container transition-base cursor-pointer flex items-center justify-between
                    ${activeExam === e ? 'font-medium text-brand' : 'text-primary'}
                  `}
                >
                  <span>{e}</span>
                  {activeExam === e && <span className="text-tabular-xs font-bold text-brand">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Status Indicator */}
      <div className="flex items-center gap-4 text-secondary font-body-sm">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-tertiary">cloud_done</span>
          <span>All changes saved on this device</span>
        </div>
        <div className="h-4 w-px bg-hairline"></div>
        <div className="font-mono text-tabular-xs text-tertiary">
          <span className="px-1.5 py-0.5 rounded-xs bg-surface-container border border-hairline">AUTOSAVE: ON</span>
        </div>
      </div>
    </header>
  );
};