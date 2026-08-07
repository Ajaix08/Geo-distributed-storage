import React from 'react';

export function RowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 py-4 border-b border-line">
      <div className="h-3 w-40 bg-panel2 rounded" />
      <div className="h-3 w-20 bg-panel2 rounded" />
      <div className="h-3 w-24 bg-panel2 rounded" />
      <div className="h-3 w-16 bg-panel2 rounded ml-auto" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse border border-line bg-panel rounded-xl p-5 space-y-3">
      <div className="h-3 w-24 bg-panel2 rounded" />
      <div className="h-6 w-16 bg-panel2 rounded" />
    </div>
  );
}
