import React from 'react';

const REGION_STYLES = {
  india: 'bg-india/15 text-india border-india/30',
  singapore: 'bg-singapore/15 text-singapore border-singapore/30',
  germany: 'bg-germany/15 text-germany border-germany/30',
};

const REGION_LABELS = { india: 'India', singapore: 'Singapore', germany: 'Germany' };

export default function RegionBadge({ region, size = 'sm' }) {
  if (!region) return <span className="text-slate-500 text-xs">—</span>;
  const cls = REGION_STYLES[region] || 'bg-slate-700/30 text-slate-300 border-slate-600';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {REGION_LABELS[region] || region}
    </span>
  );
}
