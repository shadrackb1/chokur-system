import React from 'react';
import { Logo } from '../components/brand/Logo';

export default function BrandPage() {
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
          <article className="max-w-4xl mx-auto">
            <header className="mb-12">
              <Logo variant="horizontal" size={40} className="mb-4" />
              <h1 className="text-h1 text-primary tracking-tight">Brand guidelines</h1>
              <p className="mt-4 text-body text-secondary">
                Internal reference — <code className="font-mono text-brand bg-brand-light px-1.5 py-0.5 rounded-sm">noindex</code>
              </p>
            </header>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Logo variants</h2>
              <div className="space-y-10">
                <div>
                  <h3 className="text-h3 text-primary mb-3">Horizontal (primary lockup)</h3>
                  <div className="bg-surface-panel border border-hairline rounded-sm p-6 flex items-center">
                    <Logo variant="horizontal" size={56} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: navigation bars, headers, email signatures</p>
                </div>

                <div>
                  <h3 className="text-h3 text-primary mb-3">Stacked</h3>
                  <div className="bg-surface-panel border border-hairline rounded-sm p-6 flex items-center justify-center">
                    <Logo variant="stacked" size={72} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: square layouts, social avatars, splash screens</p>
                </div>

                <div>
                  <h3 className="text-h3 text-primary mb-3">Symbol only</h3>
                  <div className="bg-surface-panel border border-hairline rounded-sm p-6 flex items-center justify-center">
                    <Logo variant="symbol" size={48} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: favicon, app icon, collapsed sidebar, mobile top bar</p>
                </div>

                <div>
                  <h3 className="text-h3 text-primary mb-3">Wordmark only</h3>
                  <div className="bg-surface-panel border border-hairline rounded-sm p-6 flex items-center">
                    <Logo variant="wordmark" size={40} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: when symbol is shown separately, co-branding</p>
                </div>

                <div>
                  <h3 className="text-h3 text-primary mb-3">Monochrome black (single-colour reproduction)</h3>
                  <div className="bg-surface-panel border border-hairline rounded-sm p-6 flex items-center">
                    <Logo variant="symbol" tone="mono" size={48} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: print (fax, emboss, single-colour), watermarks</p>
                </div>

                <div>
                  <h3 className="text-h3 text-primary mb-3">Reversed (dark backgrounds)</h3>
                  <div className="bg-primary rounded-sm p-6 flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
                    <Logo variant="symbol" tone="reversed" size={48} />
                  </div>
                  <p className="mt-2 text-body-sm text-secondary">Use: dark mode headers, dark backgrounds, presentation slides</p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Clear space & minimum size</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-surface-panel border border-hairline rounded-sm p-6">
                  <h3 className="text-h3 text-primary mb-3">Clear space rule</h3>
                  <p className="text-body text-secondary mb-4">
                    Maintain clear space equal to the height of the symbol's smallest line gap on all sides.
                    No other graphic element, text, or crop may enter this zone.
                  </p>
                  <div className="bg-surface border border-hairline rounded-sm p-4 font-mono text-tabular-sm text-primary">
                    In 64×64 viewBox: gap between rules = 12 units (4px rendered at 16px)<br/>
                    Clear space = 12 units (scales proportionally)
                  </div>
                </div>

                <div className="bg-surface-panel border border-hairline rounded-sm p-6">
                  <h3 className="text-h3 text-primary mb-3">Minimum sizes</h3>
                  <table className="w-full text-body text-secondary border-collapse">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Lockup</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Min width</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Min symbol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      <tr><td className="px-3 py-2 font-medium text-primary">Symbol only</td><td className="px-3 py-2 font-mono tabular-nums">16px</td><td className="px-3 py-2 font-mono tabular-nums">16px</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Horizontal</td><td className="px-3 py-2 font-mono tabular-nums">96px</td><td className="px-3 py-2 font-mono tabular-nums">16px</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Stacked</td><td className="px-3 py-2 font-mono tabular-nums">64px</td><td className="px-3 py-2 font-mono tabular-nums">32px</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Wordmark</td><td className="px-3 py-2 font-mono tabular-nums">80px</td><td className="px-3 py-2 font-mono tabular-nums">N/A</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Colour palette</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Primary text / Symbol rules', hex: '#111111', var: '--color-text-primary', usage: 'Body text, symbol top two rules' },
                  { name: 'Accent / Pass line', hex: '#C2410C', var: '--color-brand', usage: 'Bottom rule (C+ line), interactive elements' },
                  { name: 'Cream / Surface', hex: '#F6F1E7', var: '--color-surface', usage: 'Background, reversed symbol rules' },
                  { name: 'Secondary text', hex: '#5C5850', var: '--color-text-secondary', usage: 'Supporting copy' },
                  { name: 'Tertiary text / "System"', hex: '#9A958A', var: '--color-text-tertiary', usage: '"System" label, captions' },
                  { name: 'Hairline / Borders', hex: '#DDD6C7', var: '--color-hairline', usage: 'Dividers, table borders' },
                  { name: 'Panel surface', hex: '#FBF8F1', var: '--color-surface-panel', usage: 'Card backgrounds' },
                  { name: 'Surface container', hex: '#F2EDE3', var: '--color-surface-container', usage: 'Hover states, alternating rows' },
                  { name: 'Brand hover', hex: '#9B2F00', var: '--color-brand-hover', usage: 'Button hover state' },
                ].map((c) => (
                  <div key={c.hex} className="bg-surface-panel border border-hairline rounded-sm p-4">
                    <div
                      className="w-full h-16 rounded-sm mb-3 border border-hairline"
                      style={{ backgroundColor: c.hex }}
                    />
                    <h3 className="text-h3 text-primary font-medium">{c.name}</h3>
                    <p className="mt-1 font-mono tabular-sm text-brand">{c.hex}</p>
                    <p className="mt-1 font-mono tabular-xs text-tertiary">{c.var}</p>
                    <p className="mt-2 text-body-sm text-secondary">{c.usage}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Typography</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-surface-panel border border-hairline rounded-sm p-6">
                  <h3 className="text-h3 text-primary mb-3">Font families</h3>
                  <dl className="space-y-3 text-body text-secondary">
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-primary">Primary (UI, headings, body)</dt>
                      <dd className="font-mono tabular-sm text-brand">Inter</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-primary">Monospace / Tabular</dt>
                      <dd className="font-mono tabular-sm text-brand">JetBrains Mono</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-primary">Weights used</dt>
                      <dd className="font-mono tabular-sm text-brand">400, 500, 600</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-primary">Display</dt>
                      <dd className="font-mono tabular-sm text-brand">font-mono (JetBrains Mono)</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-surface-panel border border-hairline rounded-sm p-6">
                  <h3 className="text-h3 text-primary mb-3">Type scale (clamp)</h3>
                  <table className="w-full text-body text-secondary border-collapse">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Role</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Size</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Line</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Weight</th>
                        <th className="px-3 py-2 text-left text-label text-primary uppercase tracking-wider">Letter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      <tr><td className="px-3 py-2 font-medium text-primary">Display / Hero</td><td className="px-3 py-2 font-mono tabular-sm">clamp(2rem, 1.75rem + 1.25vw, 2.25rem)</td><td className="px-3 py-2 font-mono tabular-sm">1.1</td><td className="px-3 py-2 font-mono tabular-sm">600</td><td className="px-3 py-2 font-mono tabular-sm">-0.02em</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">H1</td><td className="px-3 py-2 font-mono tabular-sm">clamp(1.75rem, 1.5rem + 1.25vw, 2rem)</td><td className="px-3 py-2 font-mono tabular-sm">1.2</td><td className="px-3 py-2 font-mono tabular-sm">600</td><td className="px-3 py-2 font-mono tabular-sm">-0.02em</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">H2</td><td className="px-3 py-2 font-mono tabular-sm">clamp(1.125rem, 1rem + 0.625vw, 1.25rem)</td><td className="px-3 py-2 font-mono tabular-sm">1.3</td><td className="px-3 py-2 font-mono tabular-sm">600</td><td className="px-3 py-2 font-mono tabular-sm">-0.01em</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">H3</td><td className="px-3 py-2 font-mono tabular-sm">0.9375rem (15px)</td><td className="px-3 py-2 font-mono tabular-sm">1.35</td><td className="px-3 py-2 font-mono tabular-sm">600</td><td className="px-3 py-2 font-mono tabular-sm">0</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Body</td><td className="px-3 py-2 font-mono tabular-sm">0.875rem (14px)</td><td className="px-3 py-2 font-mono tabular-sm">1.5</td><td className="px-3 py-2 font-mono tabular-sm">400</td><td className="px-3 py-2 font-mono tabular-sm">0</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Label / Caps</td><td className="px-3 py-2 font-mono tabular-sm">0.6875rem (11px)</td><td className="px-3 py-2 font-mono tabular-sm">1.45</td><td className="px-3 py-2 font-mono tabular-sm">600</td><td className="px-3 py-2 font-mono tabular-sm">+0.08em</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-primary">Tabular (md)</td><td className="px-3 py-2 font-mono tabular-sm">0.875rem (14px)</td><td className="px-3 py-2 font-mono tabular-sm">1.2</td><td className="px-3 py-2 font-mono tabular-sm">500</td><td className="px-3 py-2 font-mono tabular-sm">0</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Grade chip styling (monochrome)</h2>
              <div className="bg-surface-panel border border-hairline rounded-sm p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="px-4 py-3 text-label text-primary uppercase tracking-wider">Tier</th>
                      <th className="px-4 py-3 text-label text-primary uppercase tracking-wider">Grades</th>
                      <th className="px-4 py-3 text-label text-primary uppercase tracking-wider">Style</th>
                      <th className="px-4 py-3 text-label text-primary uppercase tracking-wider">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr>
                      <td className="px-4 py-3 font-medium text-primary">Honors</td>
                      <td className="px-4 py-3 font-mono tabular-sm text-secondary">A, A-, B+</td>
                      <td className="px-4 py-3 text-body text-secondary">Solid black fill, cream text</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center font-mono font-semibold rounded-xs bg-[#111111] text-[#F6F1E7] px-2.5 py-0.5 text-tabular-sm min-w-[28px]">A</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-semibold rounded-xs bg-[#111111] text-[#F6F1E7] px-2.5 py-0.5 text-tabular-sm min-w-[28px]">A-</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-semibold rounded-xs bg-[#111111] text-[#F6F1E7] px-2.5 py-0.5 text-tabular-sm min-w-[28px]">B+</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-primary">Competent</td>
                      <td className="px-4 py-3 font-mono tabular-sm text-secondary">B, B-, C+</td>
                      <td className="px-4 py-3 text-body text-secondary">Black outline, transparent fill</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center font-mono font-semibold rounded-xs border border-[#111111] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#111111]">B</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-semibold rounded-xs border border-[#111111] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#111111]">B-</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-semibold rounded-xs border border-[#111111] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#111111]">C+</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-primary">Marginal</td>
                      <td className="px-4 py-3 font-mono tabular-sm text-secondary">C, C-, D+</td>
                      <td className="px-4 py-3 text-body text-secondary">Warm grey outline, transparent fill</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center font-mono font-medium rounded-xs border border-[#5C5850] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#5C5850]">C</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-medium rounded-xs border border-[#5C5850] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#5C5850]">C-</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-medium rounded-xs border border-[#5C5850] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#5C5850]">D+</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-primary">Critical</td>
                      <td className="px-4 py-3 font-mono tabular-sm text-secondary">D, D-, E</td>
                      <td className="px-4 py-3 text-body text-secondary">Dashed warm grey outline, transparent fill</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center font-mono font-medium rounded-xs border border-dashed border-[#9A958A] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#9A958A]">D</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-medium rounded-xs border border-dashed border-[#9A958A] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#9A958A]">D-</span>
                        <span className="ml-2 inline-flex items-center justify-center font-mono font-medium rounded-xs border border-dashed border-[#9A958A] bg-transparent px-2.5 py-0.5 text-tabular-sm min-w-[28px] text-[#9A958A]">E</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Do not</h2>
              <ul className="list-disc list-inside space-y-2 text-body text-secondary">
                <li>Stretch, rotate, or skew the logo</li>
                <li>Change colours (except via the approved tone props)</li>
                <li>Add drop shadows, glows, gradients, or outlines</li>
                <li>Place on busy backgrounds without clear space</li>
                <li>Use the symbol without the wordmark on first reference</li>
                <li>Set "Chokur" or "System" in any other typeface</li>
                <li>Use the accent colour (#C2410C) for anything except interactive elements and the logo's accent mark</li>
              </ul>
            </section>

            <section className="mb-16">
              <h2 className="text-h2 text-primary mb-6">Component usage in code</h2>
              <pre className="bg-surface-container border border-hairline rounded-sm p-4 overflow-x-auto text-body-sm font-mono text-primary"><code>{`import { Logo } from '@/components/brand/Logo';

// App sidebar (symbol + wordmark; symbol only when collapsed)
<Logo variant="horizontal" size={32} />

// Mobile top bar (symbol only)
<Logo variant="symbol" size={24} />

// Print headers (monochrome)
<Logo variant="symbol" tone="mono" size={20} />

// Dark backgrounds
<Logo variant="symbol" tone="reversed" size={24} />`}</code></pre>
            </section>
          </article>
        </div>
      </main>

      <footer className="bg-surface border-t border-hairline py-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-caption text-tertiary">
          © 2026 Chokur System · Internal reference only
        </div>
      </footer>
    </div>
  );
}