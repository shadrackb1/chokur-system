import React from 'react';
import { Logo } from '../components/brand/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface font-body flex items-center justify-center">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-panel/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Logo variant="horizontal" size={32} />
        </div>
      </nav>

      <main className="pt-24 pb-16 lg:pb-24 px-6 text-center">
        <div className="max-w-md mx-auto">
          <Logo variant="stacked" size={80} className="mx-auto mb-8" />
          <h1 className="text-display font-mono text-primary mb-4">404</h1>
          <h2 className="text-h1 text-primary tracking-tight mb-4">Page not found</h2>
          <p className="text-body text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="px-6 py-3 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring">
              Go home
            </a>
            <a href="/demo" className="px-6 py-3 border border-primary text-primary text-body font-medium rounded-sm hover:bg-surface-container transition-base focus-ring">
              Request a demo
            </a>
          </div>
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