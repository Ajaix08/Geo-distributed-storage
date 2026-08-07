import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGatewayHealth } from '../api/files';
import { CardSkeleton } from './LoadingSkeleton';

const REGION_META = {
  india: { label: 'India · Mumbai', color: 'text-india', dot: 'bg-india' },
  singapore: { label: 'Singapore', color: 'text-singapore', dot: 'bg-singapore' },
  germany: { label: 'Germany · Frankfurt', color: 'text-germany', dot: 'bg-germany' },
};

export default function ServerHealthPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['gateway-health'],
    queryFn: getGatewayHealth,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Object.entries(REGION_META).map(([key, meta]) => {
        const status = data?.[key];
        const isUp = status?.status === 'UP';
        return (
          <div key={key} className="border border-line bg-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{meta.label}</span>
              <span className={`w-2 h-2 rounded-full ${isUp ? meta.dot : 'bg-red-500'}`} />
            </div>
            <p className={`text-2xl font-display font-semibold ${isUp ? 'text-white' : 'text-red-400'}`}>
              {isUp ? `${status.latency}ms` : 'DOWN'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{isUp ? 'healthy · lowest-latency eligible' : 'unreachable · routed around'}</p>
          </div>
        );
      })}
    </div>
  );
}
