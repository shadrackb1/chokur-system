import React from 'react';
import { Logo } from '../components/brand/Logo';

export default function TermsPage() {
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
              <h1 className="text-h1 text-primary tracking-tight">Terms of Service</h1>
              <p className="mt-4 text-body text-secondary">
                <strong>Draft, review with a lawyer before launch.</strong>
              </p>
              <p className="mt-2 text-body-sm text-tertiary">Last updated: October 2026</p>
            </header>

            <div className="prose prose-sm max-w-none text-secondary">
              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">1. Acceptance</h2>
                <p className="text-body leading-relaxed">
                  By using Chokur System ("the App"), you agree to these terms. If you do not agree, do not use the App.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">2. What the App does</h2>
                <p className="text-body leading-relaxed">
                  Chokur System is an offline-first marks-to-insight tool for Kenyan secondary schools. It:
                </p>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed mt-2">
                  <li>Accepts marks entered by authorised school staff</li>
                  <li>Grades marks on the KCSE 12-point scale</li>
                  <li>Ranks students and computes aggregates (best-7 or simple mean)</li>
                  <li>Analyses subject performance and grade distributions</li>
                  <li>Generates printable A4 report cards</li>
                  <li>Exports data as CSV or JSON backup</li>
                </ul>
                <p className="mt-2 text-body leading-relaxed">
                  The App does not transmit data to external servers, does not require an account, and does not provide cloud sync.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">3. Your responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-body leading-relaxed">
                  <li>You are responsible for the accuracy of marks and student data you enter</li>
                  <li>You must comply with applicable Kenyan law, including the Data Protection Act (2019) and Basic Education Act</li>
                  <li>You must secure the devices on which the App runs</li>
                  <li>You must maintain your own backups (export JSON regularly)</li>
                  <li>You must not use the App for any unlawful purpose</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">4. No warranty</h2>
                <p className="text-body leading-relaxed">
                  The App is provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the App will be uninterrupted, error-free, or that results (grades, rankings, aggregates) will match official KNEC outcomes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">5. Limitation of liability</h2>
                <p className="text-body leading-relaxed">
                  To the maximum extent permitted by law, the authors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising from your use or inability to use the App.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">6. Intellectual property</h2>
                <p className="text-body leading-relaxed">
                  The App's code, design, and branding are proprietary. You may not copy, modify, distribute, or reverse-engineer the App except as permitted by the applicable license. Your data (marks, students, configuration) remains yours.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">7. Updates</h2>
                <p className="text-body leading-relaxed">
                  The App may update automatically when online. Updates may change features, grading logic, or UI. It is your responsibility to verify that updated grading matches current KNEC regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">8. Termination</h2>
                <p className="text-body leading-relaxed">
                  You may stop using the App at any time. Your local data remains on your device. We may discontinue the App with reasonable notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">9. Governing law</h2>
                <p className="text-body leading-relaxed">
                  These terms are governed by the laws of Kenya. Disputes shall be resolved in the courts of Kenya.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 text-primary mt-8 mb-4">10. Contact</h2>
                <p className="text-body leading-relaxed">
                  Questions about these terms: <a href="/demo" className="text-brand hover:underline">Request a demo</a> and we'll respond.
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