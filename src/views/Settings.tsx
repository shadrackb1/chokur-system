import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useToast } from '../components/Toast';

export function Settings() {
  const { schoolConfig, setSchoolConfig, resetToDemoData, exportBackup, restoreBackup, students, subjects, exams, classes } = useAppStore();
  const { showToast } = useToast();
  const [config, setConfig] = useState({ ...schoolConfig });
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const handleConfigChange = (key: keyof typeof config, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    await setSchoolConfig(config);
    showToast('School settings saved', 'success');
  };

  const handleReset = async () => {
    if (!restoreConfirm) {
      setRestoreConfirm(true);
      showToast('Click again to confirm reset to demo data', 'warning');
      return;
    }
    await resetToDemoData();
    setConfig({ ...schoolConfig });
    showToast('Reset to demo data complete', 'success');
    setRestoreConfirm(false);
  };

  const handleExport = async () => {
    await exportBackup();
    showToast('Backup exported', 'success');
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      showToast('Select a backup file first', 'warning');
      return;
    }
    const text = await restoreFile.text();
    const success = await restoreBackup(text);
    if (success) {
      showToast('Backup restored successfully', 'success');
      setRestoreFile(null);
      setConfig({ ...schoolConfig });
    } else {
      showToast('Failed to restore backup', 'error');
    }
  };

  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-h2 text-primary">Settings</h2>
          <p className="text-body text-secondary">Configure school information and data management</p>
        </div>

        <Card title="School Information" icon="school" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="School Name" value={config.name} onChange={v => handleConfigChange('name', String(v))} required />
            <Field label="School Code" value={config.code} onChange={v => handleConfigChange('code', String(v))} required />
            <Field label="Address" value={config.address} onChange={v => handleConfigChange('address', String(v))} />
            <Field label="Phone" value={config.phone} onChange={v => handleConfigChange('phone', String(v))} type="tel" />
            <Field label="Email" value={config.email} onChange={v => handleConfigChange('email', String(v))} type="email" />
            <Field label="Principal" value={config.principal} onChange={v => handleConfigChange('principal', String(v))} />
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleSaveConfig} className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base">Save Settings</button>
          </div>
        </Card>

        <Card title="Grading & Calculation" icon="settings" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Grading System" type="select" value={config.gradingSystem} onChange={v => handleConfigChange('gradingSystem', String(v))} options={['KCSE-12', 'KCSE-7']} />
            <Field label="Calculation Method" type="select" value={config.calculationMethod} onChange={v => handleConfigChange('calculationMethod', String(v))} options={['best7', 'all']} />
            <Field label="Pass Mark" type="number" value={config.passMark} onChange={v => handleConfigChange('passMark', parseInt(String(v)) || 0)} min="0" max="100" />
          </div>
        </Card>

        <Card title="Data Management" icon="storage" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={handleExport} className="px-4 py-3 bg-surface-container border border-hairline rounded-sm text-secondary hover:bg-surface hover:border-brand transition-base flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-brand">download</span>
              <span className="text-body font-medium">Export Backup</span>
              <span className="text-caption text-tertiary">Download complete JSON backup</span>
            </button>
            <div className="flex flex-col items-center gap-2">
              <label className="px-4 py-3 bg-surface-container border border-hairline rounded-sm text-secondary hover:bg-surface hover:border-brand transition-base flex flex-col items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-2xl text-brand">upload_file</span>
                <span className="text-body font-medium">Import Backup</span>
                <span className="text-caption text-tertiary">Restore from JSON file</span>
                <input type="file" accept=".json" onChange={e => setRestoreFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <button onClick={handleRestore} disabled={!restoreFile} className="px-4 py-2 bg-brand text-inverse rounded-sm hover:bg-brand-hover transition-base disabled:opacity-50">Restore</button>
            </div>
            <button onClick={handleReset} className="px-4 py-3 bg-red-100 border border-red-300 rounded-sm text-red-700 hover:bg-red-200 transition-base flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-red-600">restore</span>
              <span className="text-body font-medium">Reset to Demo</span>
              <span className="text-caption text-tertiary">Restore sample data</span>
            </button>
          </div>
          {restoreConfirm && (
            <p className="text-caption text-warning">⚠ Click "Reset to Demo" again to confirm. This will replace all current data.</p>
          )}
        </Card>

        <Card title="Statistics" icon="analytics" className="space-y-2">
          <StatRow label="Students" value={students.length} />
          <StatRow label="Subjects" value={subjects.length} />
          <StatRow label="Classes" value={classes.length} />
          <StatRow label="Exams" value={exams.length} />
        </Card>

        <Card title="About" icon="info" className="space-y-2">
          <div className="text-body text-secondary">
            <p><strong>Chokur System v2.0.0</strong></p>
            <p>Offline-first KCSE grading ledger for Kenyan secondary schools</p>
            <p className="mt-2">Built with React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, IndexedDB</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, children, className = '' }: { title: string; icon: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-panel border border-hairline rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-brand">{icon}</span>
        <h3 className="text-h3 text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type?: 'text' | 'select' | 'number' | 'email' | 'tel';
  required?: boolean;
  options?: string[];
  min?: string;
  max?: string;
}

function Field({ label, value, onChange, type = 'text', required, options, min, max, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-label text-tertiary uppercase tracking-wider">{label}{required && <span className="text-error ml-1">*</span>}</label>
      {type === 'select' ? (
        <select value={String(value)} onChange={e => onChange(e.target.value)} className="px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring" {...props}>
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          className="px-3 py-2 bg-surface border border-hairline rounded-sm text-primary focus-ring"
          {...props}
        />
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-body text-secondary">{label}</span>
      <span className="text-h3 text-primary font-semibold tabular-nums">{value}</span>
    </div>
  );
}