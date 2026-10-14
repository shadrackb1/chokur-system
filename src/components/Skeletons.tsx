import React from 'react';

// Skeleton loader for tables
export function TableSkeleton({ rows = 5, columns = 8 }: { rows?: number; columns?: number }) {
  return (
    <div className="border border-hairline bg-surface-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="h-10 border-b border-hairline bg-surface-dim">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4">
                  <div className="h-4 w-3/4 bg-surface-container-high rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="h-11">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4">
                    <div className={`h-4 ${colIdx === 0 ? 'w-1/2' : 'w-3/4'} bg-surface-container-high rounded animate-pulse`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton for metric cards
export function MetricCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border-b border-hairline">
          <div className="h-3 w-1/2 bg-surface-container-high rounded animate-pulse mb-2" />
          <div className="h-8 w-3/4 bg-surface-container-high rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Skeleton for charts
export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="bg-surface-panel border border-hairline p-6 rounded-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 w-2/5 bg-surface-container-high rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-surface-container-high rounded animate-pulse" />
      </div>
      <div className="relative h-[{height}px] flex items-end gap-4 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
            <div className="h-4 w-full bg-surface-container-high rounded animate-pulse mb-2" />
            <div className="h-60 w-full bg-surface-container-high rounded animate-pulse" style={{ height: `${20 + i * 15}%` }} />
            <div className="h-5 w-full bg-surface-container-high rounded animate-pulse mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for report card
export function ReportCardSkeleton() {
  return (
    <article className="w-full max-w-[820px] bg-surface-bright border border-hairline p-8 md:p-10 shadow-sm text-primary print-sheet">
      <div className="text-center pb-5 border-b-2 border-primary">
        <div className="w-10 h-10 border border-primary rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse" />
        <div className="h-6 w-3/4 bg-surface-container-high rounded animate-pulse mx-auto mb-1" />
        <div className="h-4 w-1/2 bg-surface-container-high rounded animate-pulse mx-auto" />
      </div>
      <div className="my-4 py-3 border-b border-hairline grid grid-cols-2 gap-x-8 gap-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between pb-1 border-b border-hairline/50">
            <div className="h-3 w-2/3 bg-surface-container-high rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-surface-container-high rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="border-y border-primary font-label-caps text-label-caps text-secondary">
          <div className="h-8 bg-surface-dim animate-pulse" />
        </div>
        <div className="divide-y divide-hairline">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 flex items-center">
              <div className="w-1/3 h-4 bg-surface-container-high rounded animate-pulse pl-2" />
              <div className="w-1/6 h-4 bg-surface-container-high rounded animate-pulse" />
              <div className="w-1/6 h-4 bg-surface-container-high rounded animate-pulse" />
              <div className="w-1/6 h-4 bg-surface-container-high rounded animate-pulse" />
              <div className="w-1/3 h-3 bg-surface-container-high rounded animate-pulse pl-6" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

// Generic card skeleton
export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="bg-surface-panel border border-hairline p-6 rounded-sm space-y-3 animate-pulse">
      <div className="h-5 w-1/3 bg-surface-container-high rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-surface-container-high rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

// Page-level skeleton
export function PageSkeleton({ title = true, metrics = true, chart = true, table = true }: {
  title?: boolean;
  metrics?: boolean;
  chart?: boolean;
  table?: boolean;
}) {
  return (
    <div className="max-w-[var(--content-max-width)] mx-auto px-6 py-8 space-y-8 animate-pulse">
      {title && (
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <div className="h-7 w-1/3 bg-surface-container-high rounded" />
            <div className="h-4 w-1/2 bg-surface-container-high rounded mt-1" />
          </div>
          <div className="h-10 w-32 bg-surface-container-high rounded" />
        </section>
      )}
      {metrics && <MetricCardSkeleton count={4} />}
      {chart && <ChartSkeleton />}
      {table && <TableSkeleton rows={8} columns={10} />}
    </div>
  );
}