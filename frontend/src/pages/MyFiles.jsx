import React from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listFiles, downloadFile } from '../api/files';
import RegionBadge from '../components/RegionBadge';
import { RowSkeleton } from '../components/LoadingSkeleton';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function MyFiles() {
  const { data: files, isLoading } = useQuery({ queryKey: ['files'], queryFn: listFiles });

  const handleDownload = async (file) => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (err) {
      toast.error('Download failed — file may be unavailable on all servers');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="text-xs font-mono uppercase tracking-widest text-accent">Storage</p>
      <h1 className="text-3xl font-display font-semibold mt-1 mb-6">My files</h1>

      <div className="border border-line bg-panel rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-widest text-slate-500 border-b border-line">
          <span>Name</span>
          <span>Size</span>
          <span>Primary</span>
          <span>Replica</span>
          <span className="text-right">Action</span>
        </div>

        {isLoading && (
          <div className="px-5">
            <RowSkeleton /><RowSkeleton /><RowSkeleton />
          </div>
        )}

        {!isLoading && files?.length === 0 && (
          <div className="px-5 py-14 text-center text-slate-500 text-sm">
            Nothing uploaded yet — head to the Upload page to send your first file.
          </div>
        )}

        {!isLoading &&
          files?.map((f) => (
            <div
              key={f._id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center border-b border-line last:border-0 hover:bg-panel2/40 transition"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{f.originalName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(f.uploadDate).toLocaleString()}</p>
              </div>
              <span className="text-sm text-slate-300 font-mono">{formatSize(f.size)}</span>
              <RegionBadge region={f.primaryServer} />
              {f.replicatedServers?.length ? (
                <RegionBadge region={f.replicatedServers[0]} />
              ) : (
                <span className="text-xs text-slate-500 font-mono">syncing…</span>
              )}
              <button
                onClick={() => handleDownload(f)}
                className="text-sm px-3 py-1.5 rounded-md border border-line hover:border-accent hover:text-white transition justify-self-end"
              >
                Download
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
