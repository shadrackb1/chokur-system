import React from 'react';
import { Logo } from '../components/brand/Logo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface font-body">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-panel/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Logo variant="horizontal" size={32} />
          <a href="/" className="text-body text-secondary hover:text-primary transition-base focus-ring">← Back to Chokur</a>
        </div>
      </nav>

      <main className="pt-24 pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <article className="max-w-3xl mx-auto">
            <header className="mb-12">
              <Logo variant="horizontal" size={40} className="mb-4" />
              <h1 className="text-h1 text-primary tracking-tight">Privacy Policy</h1>
              <p className="mt-4 text-body text-secondary">
                <strong>Draft, review with a lawyer before launch.</strong>
              </p>
              <p className="mt-2 text-body-sm text-tertiary">Last updated: October 2026</p>
            </header>

            <div className="prose prose-sm max-w-none text-secondary">
              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">1. Data we process</h2>
                <p className="text-body leading-relaxed">
                  Chokur System is an offline-first application. All student records, marks, rankings, and school configuration are stored locally in your browser's IndexedDB. No data is transmitted to our servers or any third party unless you explicitly export it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">2. Data you provide</h2>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed">
                  <li>School name, address, contact details (entered in Settings)</li>
                  <li>Student admission numbers, names, streams, gender, KCPE marks</li>
                  <li>Subject codes, names, departments</li>
                  <li>Examination marks (numeric scores, ABS for absent)</li>
                  <li>Class teacher name, term dates, calculation method preference</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">3. How data is used</h2>
                <p className="text-body leading-relaxed">
                  Your data is used solely to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed mt-2">
                  <li>Calculate grades on the KCSE 12-point scale</li>
                  <li>Rank students and compute aggregates (best-7 or simple mean)</li>
                  <li>Generate subject analysis and grade distributions</li>
                  <li>Produce printable A4 report cards</li>
                  <li>Enable CSV export for your own records</li>
                  <li>Backup and restore your data via JSON files</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">4. Data storage and security</h2>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed">
                  <li>All data remains on your device (IndexedDB)</li>
                  <li>The service worker caches the application shell for offline use — it does not cache your data</li>
                  <li>No cookies, no tracking pixels, no analytics</li>
                  <li>No third-party scripts or embeds</li>
                  <li>You control backup: export JSON, store it wherever you choose</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">5. Data sharing</h2>
                <p className="text-body leading-relaxed">
                  We do not share your data with anyone. The only way data leaves your device is if you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed mt-2">
                  <li>Export a CSV or JSON backup file and send it yourself</li>
                  <li>Print a report card (output goes to your printer/PDF)</li>
                  <li>Submit the demo request form (goes to our contact email, not stored in the app)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">6. Your rights</h2>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed">
                  <li>Access: all your data is visible in the app at all times</li>
                  <li>Rectification: edit any record directly in the app</li>
                  <li>Erasure: delete individual records or use "Clear all data" in Settings</li>
                  <li>Portability: export JSON backup at any time</li>
                  <li>No automated decision-making or profiling</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">7. Children's data</h2>
                <p className="text-body leading-relaxed">
                  Chokur System processes student academic records on behalf of the school. The school is the data controller; Chokur is a processor running on the school's devices. Schools must ensure they have a lawful basis for processing student data under applicable law (e.g., Kenya Data Protection Act, 2019).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">8. Changes to this policy</h2>
                <p className="text-body leading-relaxed">
                  Any updates will be posted in the app and on the website. Continued use after changes constitutes acceptance.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">9. Contact</h2>
                <p className="text-body leading-relaxed">
                  Questions about this policy or your data: <a href="/demo" className="text-brand hover:underline">Request a demo</a> and we'll respond.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <footer className="bg-surface border-t border-hairline py-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-caption text-tertiary">
          © 2026 Chokur System
        </div>
      </footer>
    </div>
  );
}