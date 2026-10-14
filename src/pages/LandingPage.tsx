import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../components/brand/Logo';
import { GradeChip } from '../components/GradeChip';
import { getGradeFromScore, KCSE_GRADING_TABLE } from '../lib/kcse';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_MARKS } from '../data/initialData';
import { Student } from '../types';

interface RankingsRow {
  rank: number;
  student: Student;
  average: number;
  grade: string;
  points: number;
  aggregate: number;
  status: string;
}

const SAMPLE_STUDENTS = INITIAL_STUDENTS.slice(0, 7);
const SAMPLE_MARKS = INITIAL_MARKS;

function computeRankings(): RankingsRow[] {
  const results = SAMPLE_STUDENTS.map((student) => {
    const marks = SAMPLE_MARKS[student.id] || {};
    let total = 0;
    let count = 0;
    let totalPoints = 0;
    let subjectCount = 0;

    INITIAL_SUBJECTS.forEach((subj) => {
      const mark = marks[subj.code];
      if (typeof mark === 'number') {
        total += mark;
        count++;
        const grade = getGradeFromScore(mark);
        totalPoints += grade.points;
        subjectCount++;
      }
    });

    const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
    const meanPoints = subjectCount > 0 ? totalPoints / subjectCount : 0;
    const gradeResult = getGradeFromScore(Math.round(average));
    const aggregate = Math.min(84, Math.round(meanPoints * 7));

    return {
      rank: 0,
      student,
      average,
      grade: gradeResult.grade,
      points: gradeResult.points,
      aggregate,
      status: meanPoints >= 7 ? 'Qualifies' : 'Below C+',
    };
  });

  results.sort((a, b) => b.aggregate - a.aggregate || b.average - a.average);
  results.forEach((r, i) => (r.rank = i + 1));
  return results;
}

const RANKINGS_DATA = computeRankings();

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const links = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#features', label: 'Features' },
    { href: '#report-cards', label: 'Report cards' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-sm border border-hairline bg-surface-panel hover:bg-surface-container transition-base focus-ring"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="material-symbols-outlined text-[24px] text-primary">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-surface-panel border-t border-hairline"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-hairline">
            <Logo variant="horizontal" size={32} />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-sm hover:bg-surface-container transition-base focus-ring"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[24px] text-primary">close</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Main navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-body text-primary hover:bg-surface-container rounded-sm transition-base focus-ring"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-hairline space-y-3">
              <a
                href="/demo"
                className="block w-full px-4 py-3 bg-brand text-inverse text-body font-medium rounded-sm text-center hover:bg-brand-hover transition-base focus-ring"
              >
                Request a demo
              </a>
              <a
                href="/welcome"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-3 border border-primary text-primary text-body font-medium rounded-sm text-center hover:bg-surface-container transition-base focus-ring"
              >
                Sign in
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-base ${
        scrolled ? 'bg-surface-panel/95 backdrop-blur-sm border-b border-hairline shadow-xs' : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Logo variant="horizontal" size={32} aria-label="Chokur System home" />

        <div className="hidden lg:flex items-center gap-8">
          <a href="#how-it-works" className="text-body text-secondary hover:text-primary transition-base focus-ring">How it works</a>
          <a href="#features" className="text-body text-secondary hover:text-primary transition-base focus-ring">Features</a>
          <a href="#report-cards" className="text-body text-secondary hover:text-primary transition-base focus-ring">Report cards</a>
          <a href="#faq" className="text-body text-secondary hover:text-primary transition-base focus-ring">FAQ</a>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href="/welcome" className="text-body text-secondary hover:text-primary transition-base focus-ring">Sign in</a>
          <a href="/demo" className="px-4 py-2 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring">Request a demo</a>
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}

function Hero() {
  const [liveMark, setLiveMark] = useState<string>('');
  const [liveGrade, setLiveGrade] = useState<{ grade: string; points: number } | null>(null);

  const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLiveMark(value);
    if (value !== '') {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        const result = getGradeFromScore(num);
        setLiveGrade({ grade: result.grade, points: result.points });
      } else {
        setLiveGrade(null);
      }
    } else {
      setLiveGrade(null);
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <span className="text-label text-brand uppercase tracking-widest">FOR KENYAN SECONDARY SCHOOLS</span>
            <h1 className="mt-4 text-display font-mono text-primary leading-tight tracking-tight">
              From marks to decisions in the time it takes to type them.
            </h1>
            <p className="mt-6 text-body text-secondary leading-relaxed max-w-xl">
              Enter marks once. Chokur grades on the KCSE scale, ranks your class, analyses every subject and prints report cards automatically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="/demo" className="px-6 py-3 bg-brand text-inverse text-body font-medium rounded-sm text-center hover:bg-brand-hover transition-base focus-ring">
                Request a demo
              </a>
              <a href="#how-it-works" className="px-6 py-3 border border-primary text-primary text-body font-medium rounded-sm text-center hover:bg-surface-container transition-base focus-ring">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-body-sm text-tertiary flex items-center gap-2">
              <span className="w-8 h-px bg-hairline"></span>
              Works offline. Built around the KCSE 12-point scale.
            </p>
          </div>

          {/* Live Rankings Table Demo */}
          <div className="bg-surface-panel border border-hairline rounded-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-label text-secondary uppercase tracking-wider">Form 4 East · End-term Exam, Term 2 2026</p>
                <p className="text-body-sm text-tertiary mt-0.5">Live demo — type a mark below to see grading</p>
              </div>
            </div>

            {/* Live mark input */}
            <div className="mb-4 flex items-center gap-3 p-3 bg-surface-container rounded-sm border border-hairline">
              <label htmlFor="live-mark" className="text-label text-secondary uppercase tracking-wider min-w-[100px]">Test mark:</label>
              <input
                id="live-mark"
                type="number"
                min="0"
                max="100"
                value={liveMark}
                onChange={handleMarkChange}
                placeholder="Enter 0–100"
                className="w-24 px-3 py-2 bg-surface-panel border border-hairline rounded-sm text-body text-primary text-right font-mono tabular-nums focus:outline-none focus:border-brand focus:ring-0"
                aria-label="Enter a test mark to see live grade"
              />
              {liveGrade && (
                <div className="flex items-center gap-3">
                  <GradeChip grade={liveGrade.grade} size="md" />
                  <span className="text-body-sm text-secondary font-mono tabular-nums">{liveGrade.points} pts</span>
                </div>
              )}
            </div>

            {/* Rankings table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono" role="table" aria-label="Sample class rankings">
                <thead>
                  <tr className="h-10 border-b border-hairline bg-surface-dim">
                    <th className="w-12 px-3 text-label text-secondary uppercase text-left tracking-wider">RANK</th>
                    <th className="px-3 text-label text-secondary uppercase text-left tracking-wider">STUDENT</th>
                    <th className="w-24 px-3 text-label text-secondary uppercase text-right tracking-wider">AVERAGE</th>
                    <th className="w-28 px-3 text-label text-secondary uppercase text-center tracking-wider">GRADE</th>
                    <th className="w-24 px-3 text-label text-secondary uppercase text-right tracking-wider">AGGREGATE</th>
                    <th className="w-28 px-3 text-label text-secondary uppercase text-left tracking-wider">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {RANKINGS_DATA.map((row, idx) => {
                    const showCutoff = idx === RANKINGS_DATA.findIndex(r => r.status === 'Below C+');
                    return (
                      <React.Fragment key={row.student.id}>
                        {showCutoff && (
                          <tr className="bg-surface-container/40">
                            <td colSpan={6} className="p-0">
                              <div className="relative py-2 flex items-center">
                                <div className="w-full border-t border-primary"></div>
                                <div className="absolute right-6 bg-surface-panel px-2 py-0.5 border border-hairline text-secondary text-label uppercase tracking-wider">
                                  C+ qualification line
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr className="h-10 hover:bg-surface-container-high transition-base">
                          <td className="px-3 text-tabular-md text-left">{row.rank}</td>
                          <td className="px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-tabular-sm text-tertiary">{row.student.admNo}</span>
                              <span className="text-body text-primary font-medium">{row.student.name}</span>
                            </div>
                          </td>
                          <td className="px-3 text-tabular-md text-right">{row.average.toFixed(1)}%</td>
                          <td className="px-3 text-center">
                            <GradeChip grade={row.grade} />
                          </td>
                          <td className="px-3 text-tabular-md text-right">{row.aggregate}/84</td>
                          <td className="px-3 text-body-sm">
                            {row.status === 'Qualifies' ? (
                              <span className="text-primary font-medium">Qualifies</span>
                            ) : (
                              <span className="text-secondary border-b border-dashed border-secondary pb-[1px]">Below C+</span>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      num: '01',
      title: 'Ranking takes a weekend',
      desc: 'Teachers spend Saturday and Sunday manually computing aggregates, sorting ranks, and double-checking formulas — time that should go to teaching.'
    },
    {
      num: '02',
      title: 'Report cards are a production line',
      title2: 'Report cards are a production line',
      desc: 'Each term, printing 200+ report cards means mail merges, alignment fixes, and last-minute corrections. One error means reprinting the whole batch.'
    },
    {
      num: '03',
      title: 'Marks live in the worst places',
      desc: 'Exercise books, one laptop, a rained-on mark book, WhatsApp forwards. No single source of truth, no backup, no audit trail.'
    },
    {
      num: '04',
      title: 'Nobody can answer simple questions',
      desc: 'Which subject drags the form down? Who is just below C+? How did Chemistry perform vs last term? The answers are in the data but buried in spreadsheets.'
    },
  ];

  return (
    <section id="problem" className="py-16 lg:py-24 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-12">A struggling student is invisible until it's too late.</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {problems.map((p, i) => (
            <article key={p.num} className={`relative ${i >= 2 ? 'mt-8 md:mt-0' : ''} ${i % 2 === 1 ? 'pl-8 border-l border-hairline' : 'pr-8 md:pr-8'}`}>
              <span className="text-label text-brand font-mono tabular-nums">{p.num}</span>
              <h3 className="mt-2 text-h2 text-primary font-medium">{p.title}</h3>
              <p className="mt-3 text-body text-secondary leading-relaxed">{p.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-surface-panel">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-4">One small loop.</h2>
        <div className="mb-12 px-4 py-6 bg-surface border border-hairline rounded-sm font-mono text-tabular-md text-primary text-center overflow-x-auto whitespace-nowrap">
          Enter marks → See performance → Print reports → Repeat next term
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Mini Demo 1: Marks Grid */}
          <MiniDemoMarksGrid />

          {/* Mini Demo 2: Subject Analysis */}
          <MiniDemoSubjectAnalysis />

          {/* Mini Demo 3: Report Card Crop */}
          <MiniDemoReportCard />
        </div>
      </div>
    </section>
  );
}

function MiniDemoMarksGrid() {
  const [marks, setMarks] = useState<Record<string, number>>({
    MAT: 68, ENG: 72, KIS: 75, BIO: 61, CHE: 55,
  });
  const [editing, setEditing] = useState<string | null>(null);

  const handleChange = (code: string, value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    if (num !== null && (num < 0 || num > 100)) return;
    setMarks(prev => ({ ...prev, [code]: num ?? 0 }));
  };

  const subjects = ['MAT', 'ENG', 'KIS', 'BIO', 'CHE'];
  const subjectNames: Record<string, string> = {
    MAT: 'Mathematics', ENG: 'English', KIS: 'Kiswahili', BIO: 'Biology', CHE: 'Chemistry'
  };

  return (
    <article className="bg-surface border border-hairline rounded-sm p-6">
      <h3 className="text-h3 text-primary mb-4">1. Enter marks</h3>
      <p className="text-body-sm text-secondary mb-4">Type a mark and watch the grade chip update instantly.</p>
      <div className="space-y-2">
        {subjects.map((code) => (
          <div key={code} className="flex items-center gap-3">
            <span className="text-body-sm text-secondary w-32">{subjectNames[code]}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={marks[code]}
              onChange={(e) => handleChange(code, e.target.value)}
              onFocus={() => setEditing(code)}
              onBlur={() => setEditing(null)}
              className="w-20 px-2 py-1.5 bg-surface-panel border border-hairline rounded-sm text-body text-right font-mono tabular-nums focus:outline-none focus:border-brand"
              aria-label={`${subjectNames[code]} mark`}
            />
            <GradeChip grade={getGradeFromScore(marks[code]).grade} size="sm" />
          </div>
        ))}
      </div>
    </article>
  );
}

function MiniDemoSubjectAnalysis() {
  const subjects = [
    { name: 'Kiswahili', avg: 64.0, color: '#111111' },
    { name: 'CRE', avg: 63.9, color: '#111111' },
    { name: 'History & Govt', avg: 62.9, color: '#111111' },
    { name: 'English', avg: 55.8, color: '#111111' },
    { name: 'Business Studies', avg: 56.6, color: '#111111' },
    { name: 'Mathematics', avg: 54.7, color: '#5C5850' },
    { name: 'Geography', avg: 52.3, color: '#5C5850' },
    { name: 'Physics', avg: 49.5, color: '#5C5850' },
    { name: 'Biology', avg: 58.2, color: '#111111' },
    { name: 'Chemistry', avg: 45.3, color: '#5C5850' },
  ];

  return (
    <article className="bg-surface border border-hairline rounded-sm p-6">
      <h3 className="text-h3 text-primary mb-4">2. See performance</h3>
      <p className="text-body-sm text-secondary mb-4">Subject means plotted against the C+ line (55.0).</p>
      <div className="space-y-2">
        {subjects.map((subj, i) => (
          <div key={subj.name} className="flex items-center gap-3">
            <span className="text-tabular-sm text-tertiary w-6">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-body-sm text-primary w-36 truncate">{subj.name}</span>
            <div className="flex-1 bg-surface-container h-4 relative overflow-hidden rounded-sm">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, subj.avg))}%`, backgroundColor: subj.color }}
              ></div>
              {/* C+ line at 55% */}
              <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-primary" style={{ left: '55%' }} />
            </div>
            <span className="text-tabular-sm text-primary font-medium w-12 text-right">{subj.avg.toFixed(1)}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-caption text-tertiary mt-2">
          <span className="w-44"></span>
          <div className="flex-1 flex justify-between px-2 text-[10px]">
            <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
          </div>
          <span className="w-12 text-right">Mean</span>
        </div>
      </div>
    </article>
  );
}

function MiniDemoReportCard() {
  const student = SAMPLE_STUDENTS[0];
  const marks = SAMPLE_MARKS[student.id] || {};

  return (
    <article className="bg-surface border border-hairline rounded-sm p-6">
      <h3 className="text-h3 text-primary mb-4">3. Print reports</h3>
      <p className="text-body-sm text-secondary mb-4">A4 report card crop for one student — real print output.</p>
      <div className="bg-white border border-hairline p-4 max-w-xs mx-auto" style={{ boxShadow: '0 4px 12px rgba(17,17,17,0.08)' }}>
        <div className="text-center pb-3 border-b-2 border-primary mb-3">
          <div className="w-8 h-8 border border-primary rounded-full flex items-center justify-center mx-auto mb-1 text-primary text-[14px]">CK</div>
          <p className="text-h3 text-primary font-bold uppercase tracking-tight">Kabarak Demo Secondary</p>
          <p className="text-caption text-secondary tracking-wider mt-1">Student Academic Report Card</p>
        </div>
        <div className="text-body-sm space-y-1 mb-3">
          <div className="flex justify-between"><span className="text-tertiary">Name:</span> <span className="font-medium">{student.name}</span></div>
          <div className="flex justify-between"><span className="text-tertiary">Adm No:</span> <span className="font-mono tabular-nums">{student.admNo}</span></div>
          <div className="flex justify-between"><span className="text-tertiary">Class:</span> <span>{student.stream}</span></div>
        </div>
        <table className="w-full text-body-sm font-mono tabular-nums">
          <thead>
            <tr className="border-y border-primary text-tertiary">
              <th className="py-1 text-left">Subject</th>
              <th className="py-1 text-right">Mark</th>
              <th className="py-1 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {INITIAL_SUBJECTS.slice(0, 5).map((subj) => {
              const mark = marks[subj.code];
              const grade = typeof mark === 'number' ? getGradeFromScore(mark).grade : '—';
              return (
                <tr key={subj.code} className="hover:bg-surface-container-low">
                  <td className="py-1">{subj.name}</td>
                  <td className="py-1 text-right">{typeof mark === 'number' ? mark : '—'}</td>
                  <td className="py-1 text-center"><GradeChip grade={grade} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 pt-3 border-t border-primary grid grid-cols-2 gap-2 text-body-sm">
          <div className="bg-surface-container p-2"><span className="text-tertiary block">Aggregate</span> <span className="font-bold font-mono tabular-nums">72 / 84</span></div>
          <div className="bg-surface-container p-2"><span className="text-tertiary block">Mean Grade</span> <GradeChip grade="B+" size="sm" /></div>
          <div className="bg-surface-container p-2"><span className="text-tertiary block">Position</span> <span className="font-bold font-mono tabular-nums">1 of 42</span></div>
          <div className="bg-surface-container p-2"><span className="text-tertiary block">Status</span> <span className="font-medium text-primary">Qualifies</span></div>
        </div>
      </div>
    </article>
  );
}

function KCSENative() {
  return (
    <section id="kcse-native" className="py-16 lg:py-24 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-h1 text-primary tracking-tight">Knows the KCSE scale natively.</h2>
            <p className="mt-4 text-body text-secondary leading-relaxed">
              Every mark becomes a grade and points value. Aggregates use the best 7 subjects. Everything is framed against the C+ line — the university entry benchmark. No configuration, no mapping tables, no mistakes.
            </p>
            <ul className="mt-6 space-y-3 text-body text-secondary">
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span> 12-point scale: A (12) down to E (1)</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span> C+ (7 points) = direct university entry</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span> Best-7 aggregate (max 84 points)</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span> Grade chips styled by tier, not colour</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span> C+ qualification line on every ranking</li>
            </ul>
          </div>

          <div className="bg-surface-panel border border-hairline rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono" role="table" aria-label="KCSE 12-point grading scale">
                <thead>
                  <tr className="h-10 border-b border-hairline bg-surface-dim">
                    <th className="px-4 text-label text-secondary uppercase tracking-wider">MARKS</th>
                    <th className="px-4 text-label text-secondary uppercase text-center tracking-wider">GRADE</th>
                    <th className="px-4 text-label text-secondary uppercase text-center tracking-wider">POINTS</th>
                    <th className="px-4 text-label text-secondary uppercase text-left tracking-wider">TIER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {KCSE_GRADING_TABLE.map((band, idx) => (
                    <tr key={band.grade} className={`h-10 ${band.grade === 'C+' ? 'bg-brand-light' : ''}`}>
                      <td className="px-4 text-tabular-md font-medium text-primary">{band.min}–{band.max}</td>
                      <td className="px-4 text-center">
                        <GradeChip grade={band.grade} />
                      </td>
                      <td className="px-4 text-tabular-md text-center font-medium text-primary">{band.points}</td>
                      <td className="px-4 text-body-sm">
                        {band.grade === 'C+' ? (
                          <span className="text-brand font-medium">Pass line</span>
                        ) : (
                          <span className="text-secondary capitalize">{band.tier}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    'Class rankings with C+ qualification line',
    'Subject analysis with trend vs previous exam',
    'Grade distribution across all 12 tiers',
    'Near-the-line list (students just below C+)',
    'Printable A4 report cards with school header',
    'CSV export for rankings and subject stats',
    'Works offline — data lives on the device',
    'Backup and restore via JSON',
    'Responsive on phone, tablet, and desktop',
  ];

  const whatsappImplemented = false; // Check if WhatsApp feature exists in repo

  return (
    <section id="features" className="py-16 lg:py-24 bg-surface-panel">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-12">Everything a term needs.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-hairline last:border-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
              <span className="text-body text-primary">{f}</span>
            </div>
          ))}
          {whatsappImplemented && (
            <div className="flex items-start gap-3 py-3 border-b border-hairline">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0"></span>
              <span className="text-body text-primary">WhatsApp sharing for parents and teachers</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const roles = [
    {
      role: 'Class teacher',
      benefit: 'Enter marks once and get rankings, analysis, and report cards without touching a spreadsheet.'
    },
    {
      role: 'Head of subject',
      benefit: 'See your subject\'s mean, pass rate, and trend vs last exam at a glance — no manual calculation.'
    },
    {
      role: 'Headteacher or deputy',
      benefit: 'Form-wide overview: class mean, pass rate, strongest and weakest subjects, and the C+ qualification count.'
    },
    {
      role: 'Students and parents',
      benefit: 'Clear report cards showing every mark, grade, points, aggregate, and class position — ready to print or share.'
    },
  ];

  return (
    <section id="who" className="py-16 lg:py-24 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-12">Who it's for.</h2>
        <div className="space-y-8">
          {roles.map((r, i) => (
            <article key={r.role} className="flex flex-col md:flex-row gap-6 items-start py-4 border-b border-hairline last:border-0">
              <div className="w-48 flex-shrink-0">
                <span className="text-label text-brand uppercase tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 text-h2 text-primary font-medium">{r.role}</h3>
              </div>
              <p className="text-body text-secondary leading-relaxed flex-1">{r.benefit}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfflineDevices() {
  return (
    <section id="offline" className="py-16 lg:py-24 bg-surface-panel">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-4">Built for schools with unreliable internet.</h2>
        <p className="mt-4 text-body text-secondary max-w-2xl">
          Data lives on the device and syncs when a connection is available. No cloud dependency, no login walls, no subscription.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { device: 'Phone', size: '390×844', src: '/landing/phone.webp', fallback: '/landing/phone.png', alt: 'Chokur on phone' },
            { device: 'Tablet', size: '820×1180', src: '/landing/tablet.webp', fallback: '/landing/tablet.png', alt: 'Chokur on tablet' },
            { device: 'Laptop', size: '1440×900', src: '/landing/laptop.webp', fallback: '/landing/laptop.png', alt: 'Chokur on laptop' },
          ].map((d) => (
            <article key={d.device} className="bg-surface border border-hairline rounded-sm overflow-hidden">
              <div className="aspect-video bg-surface-container relative overflow-hidden">
                <picture>
                  <source srcSet={d.src} type="image/webp" />
                  <img
                    src={d.fallback}
                    alt={d.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={parseInt(d.size.split('×')[0])}
                    height={parseInt(d.size.split('×')[1])}
                  />
                </picture>
              </div>
              <div className="p-4 border-t border-hairline">
                <h3 className="text-h3 text-primary">{d.device}</h3>
                <p className="mt-1 text-body-sm text-secondary">{d.size}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: 'Does it work completely offline?',
      a: 'Yes. All data is stored in IndexedDB on the device. The app loads from cache via the service worker. You can enter marks, view rankings, and print report cards without any internet connection.'
    },
    {
      q: 'Which grading scale does it use?',
      a: 'The official KCSE 12-point scale (A=12 down to E=1). Grade boundaries match KNEC: A 80–100, A- 75–79, B+ 70–74, B 65–69, B- 60–64, C+ 55–59, C 50–54, C- 45–49, D+ 40–44, D 35–39, D- 30–34, E 0–29.'
    },
    {
      q: 'Can I print official report cards?',
      a: 'Yes. Report cards are rendered as A4 pages with the school name, header, subject table with grades and points, aggregate, mean grade, class position, teacher remarks, and signature lines. Print directly from the browser or save as PDF.'
    },
    {
      q: 'How do I import my student list?',
      a: 'Use the CSV import in Students & Classes. The template requires AdmNo and Name columns; subject columns (MAT, ENG, KIS, etc.) are optional. Duplicate admission numbers are rejected.'
    },
    {
      q: 'Who owns the data?',
      a: 'The school. All data stays on your device unless you explicitly export it. No telemetry, no analytics, no third-party access.'
    },
    {
      q: 'What devices are supported?',
      a: 'Any device with a modern browser: Chrome, Firefox, Safari, Edge. Works on phones (320px+), tablets, and desktops. Installable as a PWA for offline access and home-screen launch.'
    },
  ];

  return (
    <section id="faq" className="py-16 lg:py-24 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-h1 text-primary tracking-tight mb-12">Questions.</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-surface-panel border border-hairline rounded-sm" open={i === 0}>
              <summary className="p-4 flex items-center justify-between cursor-pointer list-none focus-ring" aria-expanded={i === 0}>
                <h3 className="text-h3 text-primary font-medium">{faq.q}</h3>
                <span className="material-symbols-outlined text-[20px] text-tertiary">expand_more</span>
              </summary>
              <div className="px-4 pb-4 border-t border-hairline">
                <p className="text-body text-secondary leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 lg:py-24 bg-surface-panel border-y border-hairline">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-h1 text-primary tracking-tight">See your own marks, graded and ranked.</h2>
        <p className="mt-4 text-body text-secondary max-w-xl mx-auto">Bring one class's marks to a short demo.</p>
        <div className="mt-8">
          <a href="/demo" className="inline-block px-8 py-3 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring">
            Request a demo
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface border-t border-hairline py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo variant="horizontal" size={32} />
            <p className="mt-4 text-body text-secondary max-w-xs">Student performance tracking for Kenyan schools.</p>
          </div>
          <nav aria-label="Product links">
            <h4 className="text-label text-primary uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-body text-secondary">
              <li><a href="#how-it-works" className="hover:text-primary transition-base">How it works</a></li>
              <li><a href="#features" className="hover:text-primary transition-base">Features</a></li>
              <li><a href="#report-cards" className="hover:text-primary transition-base">Report cards</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal links">
            <h4 className="text-label text-primary uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2 text-body text-secondary">
              <li><a href="/privacy" className="hover:text-primary transition-base">Privacy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-base">Terms</a></li>
              <li><a href="/demo" className="hover:text-primary transition-base">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-caption text-tertiary">
          <span>© 2026 Chokur System</span>
          <span className="font-mono tabular-nums">v2.0.0</span>
        </div>
      </div>
    </footer>
  );
}

function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-200 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-surface-panel border-t border-hairline px-4 py-3 safe-area-bottom">
        <a href="/demo" className="block w-full px-4 py-3 bg-brand text-inverse text-body font-medium rounded-sm text-center hover:bg-brand-hover transition-base focus-ring">
          Request a demo
        </a>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-body">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand text-inverse rounded-sm">Skip to main content</a>
      <StickyNav />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <KCSENative />
        <Features />
        <WhoItsFor />
        <OfflineDevices />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}