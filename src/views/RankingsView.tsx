import React, { useMemo, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { exportTableToCSV, getGradeFromScore } from '../utils/grading';

type SortField =
  | 'rank'
  | 'admNo'
  | 'name'
  | 'gender'
  | 'kcpe'
  | 'average'
  | 'aggregate'
  | 'meanPoints'
  | 'subjectsPassed'
  | string; // Subject code

export const RankingsView: React.FC = () => {
  const {
    rankings,
    subjects,
    marks,
    classAverage,
    meanGrade,
    schoolConfig,
    activeStream,
    activeExam,
    setSelectedStudentId,
    setActiveView,
  } = useGrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Female' | 'Male'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'qualified' | 'unqualified'>('all');
  const [showSubjectCols, setShowSubjectCols] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'admNo' || field === 'gender' ? 'asc' : 'desc');
    }
  };

  // Filter and sort rankings
  const processedRankings = useMemo(() => {
    let result = [...rankings];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.student.name.toLowerCase().includes(q) ||
          r.student.admNo.toLowerCase().includes(q)
      );
    }

    // Filter by gender
    if (genderFilter !== 'all') {
      result = result.filter((r) => r.student.gender === genderFilter);
    }

    // Filter by university qualification status
    if (statusFilter === 'qualified') {
      result = result.filter((r) => r.qualifies);
    } else if (statusFilter === 'unqualified') {
      result = result.filter((r) => !r.qualifies);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'rank') {
        comparison = a.rank - b.rank;
      } else if (sortField === 'admNo') {
        comparison = a.student.admNo.localeCompare(b.student.admNo, undefined, { numeric: true });
      } else if (sortField === 'name') {
        comparison = a.student.name.localeCompare(b.student.name);
      } else if (sortField === 'gender') {
        comparison = a.student.gender.localeCompare(b.student.gender);
      } else if (sortField === 'kcpe') {
        comparison = a.student.kcpeMarks - b.student.kcpeMarks;
      } else if (sortField === 'average') {
        comparison = a.average - b.average;
      } else if (sortField === 'aggregate') {
        comparison = a.aggregate - b.aggregate;
      } else if (sortField === 'meanPoints') {
        comparison = a.meanPoints - b.meanPoints;
      } else if (sortField === 'subjectsPassed') {
        comparison = a.subjectsPassed - b.subjectsPassed;
      } else {
        // Individual subject code sort
        const markA = marks[a.student.id]?.[sortField];
        const markB = marks[b.student.id]?.[sortField];
        const valA = typeof markA === 'number' ? markA : -1;
        const valB = typeof markB === 'number' ? markB : -1;
        comparison = valA - valB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [rankings, searchQuery, genderFilter, statusFilter, sortField, sortDirection, marks]);

  // Identify where the C+ cutoff line falls
  const firstBelowCPlusIdx = useMemo(() => {
    if (sortField !== 'rank' && sortField !== 'meanPoints' && sortField !== 'aggregate') {
      return -1;
    }
    return processedRankings.findIndex((r) => !r.qualifies);
  }, [processedRankings, sortField]);

  // Summary counts
  const totalEnrollment = rankings.length;
  const qualifiedCount = rankings.filter((r) => r.qualifies).length;
  const highestAggregate = rankings.length > 0 ? Math.max(...rankings.map((r) => r.aggregate)) : 0;

  const handleExportCSV = () => {
    const baseHeaders = [
      'Rank',
      'Admission No',
      'Student Name',
      'Gender',
      'KCPE Marks',
      ...subjects.map((s) => s.code),
      'Average',
      'Aggregate Best 7',
      'Mean Points',
      'Mean Grade',
      'Subjects Passed',
      'University Qualify',
    ];

    const rows = processedRankings.map((r) => {
      const subjectScores = subjects.map((subj) => {
        const val = marks[r.student.id]?.[subj.code];
        if (val === 'ABS') return 'ABS';
        if (val !== null && val !== undefined) return String(val);
        return '';
      });

      return [
        String(r.rank),
        r.student.admNo,
        r.student.name,
        r.student.gender,
        String(r.student.kcpeMarks),
        ...subjectScores,
        r.average.toFixed(1),
        String(r.aggregate),
        r.meanPoints.toFixed(2),
        r.meanGrade,
        `${r.subjectsPassed}/${subjects.length}`,
        r.qualifies ? 'YES' : 'NO',
      ];
    });

    exportTableToCSV(
      `KCSE_Merit_Rankings_${activeStream.replace(/\s+/g, '_')}_${activeExam.replace(/\s+/g, '_')}`,
      baseHeaders,
      rows
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const navigateToReportCard = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('report-cards');
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <span className="material-symbols-outlined text-[13px] opacity-30">unfold_more</span>;
    }
    return (
      <span className="material-symbols-outlined text-[13px] text-[#C2410C]">
        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8 w-full font-body-md text-[#111111]">
      {/* Print Official Header */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight">{schoolConfig.schoolName}</h1>
        <p className="text-xs uppercase">{schoolConfig.postalAddress} · {schoolConfig.motto}</p>
        <h2 className="text-base font-semibold mt-2 uppercase tracking-wide">
          Official Academic Merit Ranking List — {activeStream}
        </h2>
        <p className="text-xs">{activeExam} · Term {schoolConfig.term}, {schoolConfig.academicYear}</p>
      </div>

      {/* Screen Header */}
      <section className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 no-print">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Rankings</h1>
          <p className="font-body-sm text-body-sm text-[#5F5E5E]">
            {activeStream} · {activeExam} · official merit standing sorted by aggregate points
          </p>
        </div>
      </section>

      {/* Editorial Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#DDD6C7] py-3 sm:py-4 mb-4 sm:mb-6 bg-[#FBF8F1]/60 gap-y-3">
        <div className="pr-3 sm:pr-4 border-r border-[#DDD6C7]">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase text-[10px]">
            CLASS ENROLLMENT
          </span>
          <span className="font-display-stat text-xl sm:text-[26px] leading-8 text-[#111111] block mt-0.5">
            {totalEnrollment}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal text-xs">Students</span>
          </span>
        </div>

        <div className="px-3 sm:px-4 md:border-r border-[#DDD6C7]">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase text-[10px]">
            QUALIFIED (C+ &amp; ABOVE)
          </span>
          <span className="font-display-stat text-xl sm:text-[26px] leading-8 text-[#111111] block mt-0.5">
            {qualifiedCount}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal text-xs">
              of {totalEnrollment}
            </span>
          </span>
        </div>

        <div className="pr-3 sm:px-4 border-r border-[#DDD6C7] pt-2 md:pt-0 border-t md:border-t-0">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase text-[10px]">
            CLASS MEAN SCORE
          </span>
          <span className="font-display-stat text-xl sm:text-[26px] leading-8 text-[#111111] block mt-0.5">
            {classAverage.toFixed(1)}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal text-xs">({meanGrade})</span>
          </span>
        </div>

        <div className="px-3 sm:pl-4 pt-2 md:pt-0 border-t md:border-t-0">
          <span className="font-label-caps text-label-caps text-[#5F5E5E] block uppercase text-[10px]">
            HIGHEST AGGREGATE
          </span>
          <span className="font-display-stat text-xl sm:text-[26px] leading-8 text-[#111111] block mt-0.5">
            {highestAggregate}{' '}
            <span className="font-caption text-caption text-[#5F5E5E] font-normal text-xs">/ 84 pts</span>
          </span>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4 no-print">
        {/* Search Input & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9A958A] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or adm..."
              className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded pl-9 pr-3 py-2 font-body-sm text-xs sm:text-body-sm text-[#111111] placeholder:text-[#9A958A] focus:outline-none focus:border-[#C2410C] min-h-[44px]"
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            type="button"
            className="md:hidden px-3 py-2 bg-[#FBF8F1] border border-[#DDD6C7] rounded text-xs font-medium flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#C2410C]">tune</span>
            <span>Filters ({genderFilter !== 'all' || statusFilter !== 'all' ? 'Active' : 'All'})</span>
          </button>

          {/* Desktop Gender Filter */}
          <div className="hidden md:flex items-center border border-[#DDD6C7] rounded bg-[#FBF8F1] text-xs font-medium overflow-hidden">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1.5 cursor-pointer ${genderFilter === 'all' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              All Gender
            </button>
            <button
              onClick={() => setGenderFilter('Female')}
              className={`px-2.5 py-1.5 cursor-pointer ${genderFilter === 'Female' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              Female
            </button>
            <button
              onClick={() => setGenderFilter('Male')}
              className={`px-2.5 py-1.5 cursor-pointer ${genderFilter === 'Male' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              Male
            </button>
          </div>

          {/* Desktop University Qualification Filter */}
          <div className="hidden md:flex items-center border border-[#DDD6C7] rounded bg-[#FBF8F1] text-xs font-medium overflow-hidden">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 cursor-pointer ${statusFilter === 'all' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setStatusFilter('qualified')}
              className={`px-2.5 py-1.5 cursor-pointer ${statusFilter === 'qualified' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              C+ &amp; Above
            </button>
            <button
              onClick={() => setStatusFilter('unqualified')}
              className={`px-2.5 py-1.5 cursor-pointer ${statusFilter === 'unqualified' ? 'bg-[#111111] text-[#FEF9EF]' : 'text-[#5F5E5E] hover:bg-[#F2EDE3]'}`}
            >
              Below C+
            </button>
          </div>

          {/* Broadsheet toggle */}
          <button
            onClick={() => setShowSubjectCols(!showSubjectCols)}
            className={`hidden md:flex px-3 py-1.5 border rounded text-xs font-medium cursor-pointer items-center gap-1 transition-colors ${
              showSubjectCols
                ? 'border-[#C2410C] text-[#C2410C] bg-[#FBF8F1]'
                : 'border-[#DDD6C7] text-[#5F5E5E] bg-[#FBF8F1] hover:bg-[#F2EDE3]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">table_chart</span>
            <span>{showSubjectCols ? 'Hide Subjects' : 'Broadsheet Columns'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            type="button"
            className="flex-1 sm:flex-none px-3 py-2 bg-transparent border border-[#111111] text-[#111111] font-body-sm text-xs sm:text-body-sm rounded hover:bg-[#F2EDE3] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 sm:flex-none px-3.5 py-2 bg-[#C2410C] text-[#FEF9EF] font-body-sm text-xs sm:text-body-sm font-medium rounded hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print ranking sheet</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: MOBILE TOUCH CANDIDATE CARDS (< 768px)
          ========================================================================= */}
      <div className="md:hidden space-y-3 mb-6 no-print">
        {processedRankings.map((record, idx) => {
          const showCutoffLineBeforeThis = firstBelowCPlusIdx !== -1 && idx === firstBelowCPlusIdx;
          const isExpanded = expandedStudentId === record.student.id;

          return (
            <React.Fragment key={record.student.id}>
              {/* KUCCPS Cutoff Line on Mobile */}
              {showCutoffLineBeforeThis && (
                <div className="py-2.5 my-2 border-y-2 border-[#111111] bg-[#F8F3E9] px-3 flex items-center justify-between">
                  <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-[#111111]">
                    KUCCPS DEGREE ENTRY CUTOFF (C+ / 6.5 PTS)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#111111]"></span>
                </div>
              )}

              {/* Touch Candidate Card */}
              <div
                className={`bg-[#FBF8F1] border rounded p-3.5 transition-colors shadow-xs ${
                  record.qualifies ? 'border-[#DDD6C7]' : 'border-[#DDD6C7]/60 opacity-95'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#111111] text-[#FEF9EF] flex items-center justify-center font-tabular-sm font-bold text-xs shrink-0">
                      #{record.rank}
                    </div>
                    <div>
                      <button
                        onClick={() => navigateToReportCard(record.student.id)}
                        type="button"
                        className="font-semibold text-xs text-[#111111] hover:text-[#C2410C] text-left cursor-pointer"
                      >
                        {record.student.name}
                      </button>
                      <div className="text-[11px] text-[#5F5E5E] font-tabular-sm">
                        ADM {record.student.admNo} · {record.student.gender === 'Female' ? 'F' : 'M'} · KCPE {record.student.kcpeMarks}
                      </div>
                    </div>
                  </div>

                  <GradeChip grade={record.meanGrade} size="md" />
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-[#DDD6C7]/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">Aggregate</span>
                    <span className="font-tabular-md font-bold text-[#111111]">{record.aggregate}/84</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">Mean Pts</span>
                    <span className="font-tabular-md font-bold text-[#111111]">{record.meanPoints.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5F5E5E] uppercase block font-label-caps">Average</span>
                    <span className="font-tabular-md font-bold text-[#111111]">{record.average.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      record.qualifies
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                    }`}
                  >
                    {record.qualifies ? 'KUCCPS QUALIFIED' : 'BELOW CUTOFF'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedStudentId(isExpanded ? null : record.student.id)}
                      type="button"
                      className="px-2.5 py-1 bg-[#FEF9EF] border border-[#DDD6C7] rounded text-[11px] flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      <span>{isExpanded ? 'Hide' : 'Subjects'}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    <button
                      onClick={() => navigateToReportCard(record.student.id)}
                      type="button"
                      className="px-2.5 py-1 bg-[#111111] text-[#FEF9EF] rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      <span>Report</span>
                      <span className="material-symbols-outlined text-[14px]">badge</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Subject Breakdown */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#DDD6C7] grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#FEF9EF] p-2.5 rounded">
                    {subjects.map((subj) => {
                      const val = marks[record.student.id]?.[subj.code];
                      const grade = getGradeFromScore(val);
                      return (
                        <div key={subj.code} className="text-center p-1 bg-white border border-[#DDD6C7] rounded">
                          <span className="text-[10px] font-semibold block text-[#5F5E5E]">{subj.code}</span>
                          <span className="text-xs font-tabular-sm font-bold text-[#111111]">
                            {val !== null && val !== undefined ? val : '—'}
                          </span>
                          {val !== null && val !== undefined && (
                            <span className="text-[10px] text-[#5F5E5E] block">{grade.grade}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW B: DESKTOP & PRINT BROADSHEET TABLE (≥ 768px)
          ========================================================================= */}
      <div className="hidden md:block border border-[#DDD6C7] rounded bg-[#FBF8F1] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="h-10 border-b border-[#DDD6C7] bg-[#F8F3E9] text-[11px] font-label-caps text-[#5F5E5E] uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('rank')}
                  className="w-16 px-3 cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>RANK</span>
                    {renderSortIndicator('rank')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('admNo')}
                  className="w-24 px-3 cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ADM</span>
                    {renderSortIndicator('admNo')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-3 cursor-pointer hover:bg-[#EDE8DE] transition-colors min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>STUDENT NAME</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gender')}
                  className="w-16 px-2 text-center cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>GEN</span>
                    {renderSortIndicator('gender')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('kcpe')}
                  className="w-20 px-2 text-right cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>KCPE</span>
                    {renderSortIndicator('kcpe')}
                  </div>
                </th>

                {/* Optional Broadsheet Subject Columns */}
                {showSubjectCols &&
                  subjects.map((subj) => (
                    <th
                      key={subj.code}
                      onClick={() => handleSort(subj.code)}
                      className="w-16 px-1.5 text-center cursor-pointer hover:bg-[#EDE8DE] border-l border-[#DDD6C7]/60"
                      title={subj.name}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <span>{subj.code}</span>
                        {renderSortIndicator(subj.code)}
                      </div>
                    </th>
                  ))}

                <th
                  onClick={() => handleSort('average')}
                  className="w-24 px-3 text-right cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AVG</span>
                    {renderSortIndicator('average')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('meanPoints')}
                  className="w-24 px-2 text-center cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>GRADE</span>
                    {renderSortIndicator('meanPoints')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aggregate')}
                  className="w-24 px-3 text-right cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AGG (/84)</span>
                    {renderSortIndicator('aggregate')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('subjectsPassed')}
                  className="w-28 px-3 text-right cursor-pointer hover:bg-[#EDE8DE] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PASSED</span>
                    {renderSortIndicator('subjectsPassed')}
                  </div>
                </th>
                <th className="w-28 px-3 text-left">
                  <span>STATUS</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm text-[#111111]">
              {processedRankings.map((record, idx) => {
                const showCutoffLineBeforeThis =
                  firstBelowCPlusIdx !== -1 && idx === firstBelowCPlusIdx;

                return (
                  <React.Fragment key={record.student.id}>
                    {/* The C+ Qualification Cutoff Marker */}
                    {showCutoffLineBeforeThis && (
                      <tr className="bg-[#FEF9EF]">
                        <td colSpan={showSubjectCols ? subjects.length + 10 : 10} className="p-0">
                          <div className="relative py-2 flex items-center">
                            <div className="w-full border-t-2 border-[#111111]"></div>
                            <div className="absolute right-6 bg-[#FEF9EF] px-3 py-0.5 border border-[#111111] text-[#111111] font-label-caps text-[10px] uppercase tracking-wider font-bold shadow-xs">
                              KUCCPS Minimum University Cutoff (C+ / 6.5 Mean Points)
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr
                      className={`h-11 transition-colors ${
                        record.qualifies
                          ? 'hover:bg-[#F2EDE3]'
                          : 'hover:bg-[#F2EDE3] text-[#5C5850]'
                      }`}
                    >
                      <td className="px-3 font-tabular-md text-tabular-md font-semibold text-[#111111]">
                        {record.rank}
                      </td>
                      <td className="px-3 font-tabular-sm text-tabular-sm text-[#5F5E5E]">
                        {record.student.admNo}
                      </td>
                      <td className="px-3">
                        <button
                          onClick={() => navigateToReportCard(record.student.id)}
                          type="button"
                          className="font-medium text-[#111111] hover:text-[#C2410C] hover:underline cursor-pointer text-left truncate max-w-[200px]"
                        >
                          {record.student.name}
                        </button>
                      </td>
                      <td className="px-2 text-center font-caption text-caption text-[#5F5E5E]">
                        {record.student.gender === 'Female' ? 'F' : 'M'}
                      </td>
                      <td className="px-2 text-right font-tabular-sm text-tabular-sm text-[#5F5E5E]">
                        {record.student.kcpeMarks}
                      </td>

                      {/* Optional Broadsheet Subject Scores */}
                      {showSubjectCols &&
                        subjects.map((subj) => {
                          const val = marks[record.student.id]?.[subj.code];
                          const isAbs = val === 'ABS';
                          const grade = getGradeFromScore(val);
                          return (
                            <td
                              key={subj.code}
                              className="px-1.5 text-center font-tabular-sm text-[12px] border-l border-[#DDD6C7]/50"
                            >
                              {isAbs ? (
                                <span className="text-[#9A958A] font-semibold text-[10px]">ABS</span>
                              ) : val !== null && val !== undefined ? (
                                <span>
                                  {val} <span className="text-[10px] text-[#5F5E5E]">{grade.grade}</span>
                                </span>
                              ) : (
                                <span className="text-[#DDD6C7]">—</span>
                              )}
                            </td>
                          );
                        })}

                      <td className="px-3 font-tabular-md text-tabular-md text-right font-medium">
                        {record.average.toFixed(1)}%
                      </td>
                      <td className="px-2 text-center">
                        <GradeChip grade={record.meanGrade} />
                      </td>
                      <td className="px-3 font-tabular-md text-tabular-md text-right font-semibold text-[#111111]">
                        {record.aggregate}/84
                      </td>
                      <td className="px-3 font-tabular-sm text-tabular-sm text-right text-[#5F5E5E]">
                        {record.subjectsPassed}/{subjects.length}
                      </td>
                      <td className="px-3">
                        <span
                          className={`inline-block font-label-caps text-[10px] px-1.5 py-0.5 rounded border ${
                            record.qualifies
                              ? 'border-emerald-700 text-emerald-800 bg-emerald-50'
                              : 'border-[#9A958A] text-[#5F5E5E] bg-[#F2EDE3]'
                          }`}
                        >
                          {record.qualifies ? 'QUALIFIED' : 'UNQUALIFIED'}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 animate-fadeIn">
          <div className="flex-1" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="bg-[#FEF9EF] border-t border-[#DDD6C7] rounded-t-xl p-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7] mb-3">
              <span className="font-headline-md font-semibold text-sm">Sort &amp; Filter Rankings</span>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-[#F2EDE3] flex items-center justify-center text-[#5F5E5E]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Gender Filter */}
            <div className="mb-4">
              <span className="font-label-caps text-[11px] text-[#5F5E5E] uppercase block mb-2">Gender</span>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'Female', 'Male'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    type="button"
                    className={`py-2 px-3 text-xs rounded border cursor-pointer min-h-[44px] ${
                      genderFilter === g
                        ? 'bg-[#111111] text-[#FEF9EF] border-[#111111]'
                        : 'bg-[#FBF8F1] border-[#DDD6C7] text-[#111111]'
                    }`}
                  >
                    {g === 'all' ? 'All Gender' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* KUCCPS Status Filter */}
            <div className="mb-4">
              <span className="font-label-caps text-[11px] text-[#5F5E5E] uppercase block mb-2">
                University Qualification
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Tiers' },
                  { id: 'qualified', label: 'C+ & Above' },
                  { id: 'unqualified', label: 'Below C+' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id as any)}
                    type="button"
                    className={`py-2 px-3 text-xs rounded border cursor-pointer min-h-[44px] ${
                      statusFilter === s.id
                        ? 'bg-[#111111] text-[#FEF9EF] border-[#111111]'
                        : 'bg-[#FBF8F1] border-[#DDD6C7] text-[#111111]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-4">
              <span className="font-label-caps text-[11px] text-[#5F5E5E] uppercase block mb-2">Sort By</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rank', label: 'Merit Rank' },
                  { id: 'aggregate', label: 'Aggregate Points' },
                  { id: 'average', label: 'Class Average' },
                  { id: 'name', label: 'Student Name' },
                  { id: 'admNo', label: 'Admission No' },
                  { id: 'kcpe', label: 'KCPE Marks' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      handleSort(opt.id as any);
                    }}
                    type="button"
                    className={`py-2 px-3 text-xs rounded border cursor-pointer min-h-[44px] text-left flex items-center justify-between ${
                      sortField === opt.id
                        ? 'bg-[#F2EDE3] border-[#C2410C] font-semibold text-[#111111]'
                        : 'bg-[#FBF8F1] border-[#DDD6C7] text-[#111111]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortField === opt.id && (
                      <span className="material-symbols-outlined text-[16px] text-[#C2410C]">
                        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsFilterSheetOpen(false)}
              type="button"
              className="w-full py-3 bg-[#111111] text-[#FEF9EF] rounded font-semibold text-xs min-h-[44px] cursor-pointer"
            >
              Apply &amp; View Results ({processedRankings.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
