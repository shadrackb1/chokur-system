import React, { useRef, useState } from 'react';
import { GradeChip } from '../components/GradeChip';
import { useGrading } from '../context/GradingContext';
import { KCSE_GRADING_TABLE, parseMarksCSV, ParsedCSVResult } from '../utils/grading';

export const SettingsView: React.FC = () => {
  const {
    schoolConfig,
    updateSchoolConfig,
    exportJSONBackup,
    restoreJSONBackup,
    resetToDemoData,
    importMarksFromCSV,
    downloadMarksTemplateCSV,
    students,
    subjects,
  } = useGrading();

  const [formConfig, setFormConfig] = useState(schoolConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreError, setRestoreError] = useState(false);

  // CSV Import State
  const [csvInputText, setCsvInputText] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [csvMode, setCsvMode] = useState<'upload' | 'paste'>('upload');
  const [parsedPreview, setParsedPreview] = useState<ParsedCSVResult | null>(null);
  const [csvSuccessMessage, setCsvSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateSchoolConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDiscard = () => {
    setFormConfig(schoolConfig);
  };

  const handleSyncNow = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1200);
  };

  const handleProcessRestore = () => {
    setRestoreError(false);
    const success = restoreJSONBackup(restoreText);
    if (success) {
      setIsRestoreModalOpen(false);
      setRestoreText('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      setRestoreError(true);
    }
  };

  // CSV Processing Handlers
  const handleProcessFileContent = (content: string, name: string = 'uploaded_file.csv') => {
    setCsvInputText(content);
    setCsvFileName(name);
    setCsvSuccessMessage(null);
    const parsed = parseMarksCSV(content, students, subjects);
    setParsedPreview(parsed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleProcessFileContent(text, file.name);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleProcessFileContent(text, file.name);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handlePasteChange = (text: string) => {
    setCsvInputText(text);
    setCsvFileName('Pasted CSV text');
    setCsvSuccessMessage(null);
    if (text.trim()) {
      const parsed = parseMarksCSV(text, students, subjects);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleConfirmCSVImport = () => {
    if (!csvInputText.trim()) return;
    const result = importMarksFromCSV(csvInputText);
    if (result.success) {
      const studentCount = result.updates.length;
      const subjectsCount = result.mappedSubjects.length;
      setCsvSuccessMessage(
        `Successfully imported marks for ${studentCount} students across ${subjectsCount} subjects into the central ledger!`
      );
      setParsedPreview(null);
      setCsvInputText('');
      setCsvFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearCSV = () => {
    setCsvInputText('');
    setCsvFileName('');
    setParsedPreview(null);
    setCsvSuccessMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-6 py-8 pb-32">
      {/* Page Title & Subtitle Header */}
      <div className="pb-6 mb-6 border-b border-[#DDD6C7] flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-headline-lg text-headline-lg text-[#111111]">Settings</h1>
            <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">CONFIG_ACAD_2026</span>
          </div>
          <p className="font-body-md text-body-md text-[#5F5E5E] mt-1">
            Configure school metadata, grading scales, bulk CSV marks import, and offline data sync
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-[#111111] text-[#FEF9EF] px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>All configuration settings updated</span>
          </div>
        )}
      </div>

      {/* Settings Sections (Planar, Hairline Separated) */}
      <div className="flex flex-col">
        {/* 1. School Information Section */}
        <section className="py-6 border-b border-[#DDD6C7] grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 pr-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">School Information</h2>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1">
              Official institutional identity printed across all term transcripts, KCSE result
              schedules, and student performance dossiers.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 flex flex-col space-y-4">
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                School Name
              </label>
              <input
                type="text"
                value={formConfig.schoolName}
                onChange={(e) => setFormConfig({ ...formConfig, schoolName: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                School Motto
              </label>
              <input
                type="text"
                value={formConfig.motto}
                onChange={(e) => setFormConfig({ ...formConfig, motto: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                  Postal Address
                </label>
                <input
                  type="text"
                  value={formConfig.postalAddress}
                  onChange={(e) => setFormConfig({ ...formConfig, postalAddress: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                  Contact Phone / Email
                </label>
                <input
                  type="text"
                  value={formConfig.contactPhoneEmail}
                  onChange={(e) => setFormConfig({ ...formConfig, contactPhoneEmail: e.target.value })}
                  className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Current Term & Academic Year Section */}
        <section className="py-6 border-b border-[#DDD6C7] grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 pr-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">
              Current Term &amp; Academic Year
            </h2>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1">
              Active evaluation window used for ledger aggregation, attendance intervals, and
              automated merit standings.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                Academic Year
              </label>
              <select
                value={formConfig.academicYear}
                onChange={(e) => setFormConfig({ ...formConfig, academicYear: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                Term
              </label>
              <select
                value={formConfig.term}
                onChange={(e) => setFormConfig({ ...formConfig, term: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-body-md text-body-md focus:border-[#C2410C] focus:outline-none"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                Term Opening Date
              </label>
              <input
                type="date"
                value={formConfig.termOpeningDate}
                onChange={(e) => setFormConfig({ ...formConfig, termOpeningDate: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-tabular-md text-tabular-md focus:border-[#C2410C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1.5">
                Term Closing Date
              </label>
              <input
                type="date"
                value={formConfig.termClosingDate}
                onChange={(e) => setFormConfig({ ...formConfig, termClosingDate: e.target.value })}
                className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded px-3 py-2 text-[#111111] font-tabular-md text-tabular-md focus:border-[#C2410C] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 3. KCSE Grading Scale Section (12-Point Scale) */}
        <section className="py-6 border-b border-[#DDD6C7] grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 pr-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">
              KCSE Grading Scale (12-Point Scale)
            </h2>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1">
              Read-only standard ministerial metric. Points feed mean score calculations directly across
              all Form 1 to Form 4 classes.
            </p>

            {/* Calculation Method Switcher */}
            <div className="mt-4 p-3 bg-[#FBF8F1] border border-[#DDD6C7]">
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block mb-2">
                Calculation Standard
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#111111]">
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={formConfig.calculationMethod === 'best7'}
                    onChange={() => setFormConfig({ ...formConfig, calculationMethod: 'best7' })}
                    className="accent-[#C2410C]"
                  />
                  <span>Best 7 Subjects Rule (KNEC Standard)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#111111]">
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={formConfig.calculationMethod === 'simpleMean'}
                    onChange={() => setFormConfig({ ...formConfig, calculationMethod: 'simpleMean' })}
                    className="accent-[#C2410C]"
                  />
                  <span>Straight Mean across all subjects</span>
                </label>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#FBF8F1] border border-[#DDD6C7]">
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block mb-1">
                Scale Paradigm
              </span>
              <p className="font-caption text-caption text-[#5F5E5E]">
                Monochrome graphic hierarchy: Solid carbon indicates honors; outline indicates
                competence; grey indicates marginal performance; dashed indicates critical remedial
                intervention.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="w-full overflow-hidden border border-[#DDD6C7]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FBF8F1] border-b border-[#DDD6C7] h-9">
                    <th className="px-4 py-2 font-label-caps text-label-caps text-[#5F5E5E]">
                      Marks Range
                    </th>
                    <th className="px-4 py-2 font-label-caps text-label-caps text-[#5F5E5E]">Grade</th>
                    <th className="px-4 py-2 font-label-caps text-label-caps text-[#5F5E5E] text-right">
                      Points
                    </th>
                    <th className="px-4 py-2 font-label-caps text-label-caps text-[#5F5E5E]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD6C7] font-body-sm text-body-sm">
                  {KCSE_GRADING_TABLE.map((row) => {
                    const isCPlus = row.grade === 'C+';

                    return (
                      <React.Fragment key={row.grade}>
                        <tr className="h-11 bg-[#FBF8F1] hover:bg-[#F2EDE3] transition-colors">
                          <td className="px-4 py-2 font-tabular-md text-tabular-md">
                            {row.min} – {row.max}
                          </td>
                          <td className="px-4 py-2">
                            <GradeChip grade={row.grade} />
                          </td>
                          <td className="px-4 py-2 font-tabular-md text-tabular-md text-right font-medium">
                            {row.points}
                          </td>
                          <td className="px-4 py-2 text-[#111111]">{row.description}</td>
                        </tr>

                        {/* Cutoff Pass Line */}
                        {isCPlus && (
                          <tr className="bg-[#FEF9EF]">
                            <td colSpan={4} className="p-0">
                              <div className="border-y border-[#111111] bg-[#EDE8DE]/40 px-4 py-1.5 flex items-center justify-between">
                                <span className="font-label-caps text-label-caps text-[#111111] font-semibold uppercase tracking-wider">
                                  Pass Line — Minimum University Direct Entry Requirement
                                </span>
                                <span className="font-tabular-sm text-tabular-sm text-[#5F5E5E]">
                                  KUCCPS Benchmark: 7.00 Mean PTS
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Bulk Marks Import (CSV) Section - NEW & REQUESTED */}
        <section className="py-6 border-b border-[#DDD6C7] grid grid-cols-12 gap-6 bg-[#FBF8F1]/50 p-4 rounded my-2">
          <div className="col-span-12 md:col-span-4 pr-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C2410C]">upload_file</span>
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Bulk Marks Import (CSV)</h2>
            </div>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1.5">
              Bulk-upload student examination marks directly into the central ledger. Automatically matches
              student admission numbers and KCSE subject codes (<code className="font-tabular-sm text-[#111111]">MAT, ENG, KIS, BIO, CHE, PHY, HIS, GEO, CRE, BST</code>).
            </p>

            {/* Template Download Button */}
            <div className="mt-4 pt-3 border-t border-[#DDD6C7]">
              <span className="font-label-caps text-label-caps text-[#5F5E5E] block mb-1">
                CSV Template
              </span>
              <p className="font-caption text-caption text-[#5F5E5E] mb-2">
                Download a pre-filled spreadsheet containing current student admission numbers and subject columns.
              </p>
              <button
                type="button"
                onClick={downloadMarksTemplateCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#111111] bg-transparent text-[#111111] text-xs font-medium rounded hover:bg-[#F2EDE3] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Download Sample CSV Template</span>
              </button>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 flex flex-col justify-start space-y-4">
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-3 border-b border-[#DDD6C7] pb-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCsvMode('upload')}
                className={`flex items-center gap-1.5 pb-1 border-b-2 cursor-pointer ${
                  csvMode === 'upload'
                    ? 'border-[#C2410C] text-[#111111]'
                    : 'border-transparent text-[#5F5E5E] hover:text-[#111111]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
                <span>Upload CSV File</span>
              </button>
              <button
                type="button"
                onClick={() => setCsvMode('paste')}
                className={`flex items-center gap-1.5 pb-1 border-b-2 cursor-pointer ${
                  csvMode === 'paste'
                    ? 'border-[#C2410C] text-[#111111]'
                    : 'border-transparent text-[#5F5E5E] hover:text-[#111111]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">content_paste</span>
                <span>Paste CSV / TSV Text</span>
              </button>
            </div>

            {/* Success message banner */}
            {csvSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
                  <span className="font-medium">{csvSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCsvSuccessMessage(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Mode 1: Drag & Drop File Upload */}
            {csvMode === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-upload-input"
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#C2410C] bg-[#F2EDE3]'
                      : 'border-[#DDD6C7] bg-[#FEF9EF] hover:bg-[#F2EDE3]/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[32px] text-[#5F5E5E] mb-2 block">
                    upload_file
                  </span>
                  <div className="font-body-md text-sm font-medium text-[#111111]">
                    {csvFileName ? (
                      <span className="text-[#C2410C] font-semibold">{csvFileName}</span>
                    ) : (
                      'Click to select a CSV file or drag and drop here'
                    )}
                  </div>
                  <p className="font-caption text-xs text-[#5F5E5E] mt-1">
                    Accepts standard comma-separated or tab-separated spreadsheet exports (.csv)
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Paste Raw CSV Text */}
            {csvMode === 'paste' && (
              <div>
                <label className="block font-label-caps text-label-caps text-[#5F5E5E] uppercase mb-1">
                  Paste Tabular Marks Data
                </label>
                <textarea
                  rows={5}
                  value={csvInputText}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder={`AdmNo,StudentName,MAT,ENG,KIS,BIO,CHE,PHY,HIS,GEO,CRE,BST\n3842,Grace Achieng,85,80,88,76,72,74,82,78,90,75\n3819,Daniel Kiprop,90,70,72,82,78,84,68,74,80,86`}
                  className="w-full bg-[#FEF9EF] border border-[#DDD6C7] rounded p-3 text-xs font-tabular-sm text-[#111111] focus:border-[#C2410C] focus:outline-none"
                />
              </div>
            )}

            {/* Inspection & Parse Preview Card */}
            {parsedPreview && (
              <div className="p-4 bg-[#FEF9EF] border border-[#DDD6C7] rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDD6C7]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        parsedPreview.success ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    ></span>
                    <span className="font-headline-sm text-xs font-semibold text-[#111111]">
                      {parsedPreview.success ? 'File Parsed Successfully' : 'Parse Errors Encountered'}
                    </span>
                  </div>
                  <span className="font-tabular-sm text-xs text-[#5F5E5E]">
                    {parsedPreview.updates.length} students matched · {parsedPreview.mappedSubjects.length} subjects
                  </span>
                </div>

                {/* Errors display */}
                {parsedPreview.errors.length > 0 && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-900 text-xs">
                    <div className="font-semibold mb-1">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {parsedPreview.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings display */}
                {parsedPreview.warnings.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                    <div className="font-semibold mb-1">Warnings:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {parsedPreview.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mapped Subjects Badges */}
                {parsedPreview.mappedSubjects.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[#5F5E5E] font-label-caps text-[10px]">Mapped Subjects:</span>
                    {parsedPreview.mappedSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-1.5 py-0.5 bg-[#F2EDE3] border border-[#DDD6C7] text-[#111111] font-tabular-sm text-[11px] rounded-[2px]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Preview Table of first 5 records */}
                {parsedPreview.updates.length > 0 && (
                  <div>
                    <div className="text-[11px] font-label-caps text-[#5F5E5E] uppercase mb-1">
                      Data Sample Preview (First {Math.min(5, parsedPreview.updates.length)} Rows)
                    </div>
                    <div className="overflow-x-auto border border-[#DDD6C7] bg-[#FBF8F1]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FEF9EF] border-b border-[#DDD6C7] text-[10px] font-label-caps text-[#5F5E5E]">
                            <th className="px-2 py-1.5">ADM</th>
                            <th className="px-2 py-1.5">NAME</th>
                            {parsedPreview.mappedSubjects.slice(0, 6).map((sub) => (
                              <th key={sub} className="px-2 py-1.5 text-right">
                                {sub}
                              </th>
                            ))}
                            {parsedPreview.mappedSubjects.length > 6 && (
                              <th className="px-2 py-1.5 text-right">+{parsedPreview.mappedSubjects.length - 6} more</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDD6C7] font-tabular-sm">
                          {parsedPreview.updates.slice(0, 5).map((u) => (
                            <tr key={u.studentId} className="h-7 hover:bg-[#F2EDE3]">
                              <td className="px-2 py-1 font-medium">{u.admNo}</td>
                              <td className="px-2 py-1 text-[#111111]">{u.studentName}</td>
                              {parsedPreview.mappedSubjects.slice(0, 6).map((sub) => (
                                <td key={sub} className="px-2 py-1 text-right text-[#111111]">
                                  {u.marks[sub] !== undefined ? String(u.marks[sub]) : '—'}
                                </td>
                              ))}
                              {parsedPreview.mappedSubjects.length > 6 && (
                                <td className="px-2 py-1 text-right text-[#5F5E5E]">...</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Unmatched students note */}
                {parsedPreview.unmatchedStudents.length > 0 && (
                  <div className="text-xs text-[#5F5E5E]">
                    <span className="text-amber-700 font-medium">
                      {parsedPreview.unmatchedStudents.length} rows in CSV did not match active students
                    </span>{' '}
                    (e.g.{' '}
                    {parsedPreview.unmatchedStudents.slice(0, 3).join(', ')}
                    {parsedPreview.unmatchedStudents.length > 3 ? '...' : ''}).
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DDD6C7]">
                  <button
                    type="button"
                    onClick={handleClearCSV}
                    className="px-3 py-1.5 text-xs text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
                  >
                    Clear &amp; Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!parsedPreview.success || parsedPreview.updates.length === 0}
                    onClick={handleConfirmCSVImport}
                    className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] text-xs font-medium rounded hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">publish</span>
                    <span>Commit Marks to Central Ledger ({parsedPreview.updates.length} Students)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. Data & Backups Section */}
        <section className="py-6 border-b border-[#DDD6C7] grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 pr-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">Data &amp; Backups</h2>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1">
              Direct cryptographic snapshots of the ledger state. Store cold archive files onto local
              physical storage keys.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 flex flex-col justify-start">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportJSONBackup}
                type="button"
                className="border border-[#111111] bg-transparent text-[#111111] px-4 py-2 rounded font-body-sm text-body-sm font-medium hover:bg-[#F2EDE3] transition-colors cursor-pointer"
              >
                Export backup (JSON)
              </button>
              <button
                onClick={() => setIsRestoreModalOpen(true)}
                type="button"
                className="border border-[#111111] bg-transparent text-[#111111] px-4 py-2 rounded font-body-sm text-body-sm font-medium hover:bg-[#F2EDE3] transition-colors cursor-pointer"
              >
                Restore from backup
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset all marks, students, and configurations to demo records?')) {
                    resetToDemoData();
                  }
                }}
                type="button"
                className="border border-[#BA1A1A] bg-transparent text-[#BA1A1A] px-4 py-2 rounded font-body-sm text-body-sm font-medium hover:bg-[#FFDAD6]/30 transition-colors cursor-pointer"
              >
                Reset demo data
              </button>
            </div>
            <p className="font-caption text-caption text-[#9A958A] mt-3">
              All marks and student records are stored locally in IndexedDB / localStorage on this browser.
            </p>
          </div>
        </section>

        {/* 6. Offline Synchronization Section */}
        <section className="py-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 pr-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">Offline Synchronization</h2>
            <p className="font-caption text-caption text-[#5F5E5E] mt-1">
              Autonomous reconciliation engine designed for erratic rural broadband and remote school
              compound relays.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 flex flex-col items-start gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#DDD6C7] bg-[#FBF8F1] rounded">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    syncStatus === 'synced' ? 'bg-emerald-600' : 'bg-[#C2410C]'
                  }`}
                ></span>
                <span className="font-tabular-sm text-tabular-sm text-[#111111] font-medium">
                  {syncStatus === 'syncing'
                    ? 'Synchronizing local ledger with cloud relay...'
                    : syncStatus === 'synced'
                    ? 'Online: All 42 records synchronized'
                    : 'Offline-ready: All changes cached on this device'}
                </span>
              </div>
              <button
                onClick={handleSyncNow}
                disabled={syncStatus === 'syncing'}
                type="button"
                className="border border-[#111111] bg-transparent text-[#111111] px-4 py-1.5 rounded font-body-sm text-body-sm font-medium hover:bg-[#F2EDE3] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync now'}
              </button>
            </div>
            <span className="font-caption text-caption text-[#5F5E5E]">
              Last successful sync check: Today at 08:42 AM · 100% data fidelity
            </span>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 right-0 left-[220px] bg-[#FBF8F1] border-t border-[#DDD6C7] py-3 px-6 z-30 no-print">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#5F5E5E]">info</span>
            <span className="font-caption text-caption text-[#5F5E5E]">
              Configuration changes are cached locally until explicitly confirmed.
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={handleDiscard}
              type="button"
              className="text-[#C2410C] font-body-md text-body-md font-medium hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              Discard changes
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="bg-[#C2410C] text-[#FEF9EF] px-5 py-2 rounded font-body-md text-body-md font-medium hover:opacity-95 focus:outline-none transition-opacity cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      </footer>

      {/* Restore JSON Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEF9EF] border border-[#DDD6C7] rounded max-w-lg w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7] mb-3">
              <h3 className="font-headline-sm text-headline-sm text-[#111111]">Restore from JSON Backup</h3>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="text-[#5F5E5E] hover:text-[#111111] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-[#5F5E5E] mb-3">
              Paste the contents of your previously exported JSON backup file below.
            </p>
            <textarea
              rows={8}
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full bg-[#FBF8F1] border border-[#DDD6C7] rounded p-3 text-xs font-tabular-sm text-[#111111] focus:border-[#C2410C] focus:outline-none"
            />
            {restoreError && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Invalid JSON format or missing required ledger keys.
              </p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-3 py-1.5 text-sm text-[#5F5E5E] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRestore}
                className="px-4 py-1.5 bg-[#C2410C] text-[#FEF9EF] rounded text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                Restore Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
