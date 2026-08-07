import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listFiles } from '../api/files';
import { useAuth } from '../context/AuthContext';
import ServerHealthPanel from '../components/ServerHealthPanel';
import { CardSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: files, isLoading } = useQuery({ queryKey: ['files'], queryFn: listFiles });

  const totalSize = files?.reduce((sum, f) => sum + f.size, 0) || 0;
  const replicated = files?.filter((f) => f.replicationStatus === 'completed').length || 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-accent">Overview</p>
        <h1 className="text-3xl font-display font-semibold mt-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-400 mt-1">Your files, routed to whichever region answers fastest.</p>
      </div>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-3">Regional server status</h2>
        <ServerHealthPanel />
      </section>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-3">Your storage</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-line bg-panel rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Files stored</p>
              <p className="text-2xl font-display font-semibold mt-2">{files?.length || 0}</p>
            </div>
            <div className="border border-line bg-panel rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Total size</p>
              <p className="text-2xl font-display font-semibold mt-2">{(totalSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="border border-line bg-panel rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Replicated</p>
              <p className="text-2xl font-display font-semibold mt-2">{replicated} / {files?.length || 0}</p>
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <Link to="/upload" className="px-4 py-2.5 rounded-lg bg-accent text-ink font-medium text-sm hover:opacity-90 transition">
          Upload a file
        </Link>
        <Link to="/files" className="px-4 py-2.5 rounded-lg border border-line text-sm hover:border-accent transition">
          View all files
        </Link>
      </div>
    </div>
  );
}
