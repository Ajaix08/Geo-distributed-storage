import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { uploadFile } from '../api/files';
import RegionBadge from '../components/RegionBadge';

const REGIONS = [
  { key: '', label: 'Auto (lowest latency)' },
  { key: 'india', label: 'India' },
  { key: 'singapore', label: 'Singapore' },
  { key: 'germany', label: 'Germany' },
];

export default function Upload() {
  const queryClient = useQueryClient();
  const [region, setRegion] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setUploading(true);
      setProgress(0);
      setLastResult(null);
      try {
        const data = await uploadFile(file, region || undefined, setProgress);
        toast.success(`Uploaded to ${data.file.primaryServer}`);
        setLastResult(data.file);
        queryClient.invalidateQueries({ queryKey: ['files'] });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [region, queryClient]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs font-mono uppercase tracking-widest text-accent">Upload</p>
      <h1 className="text-3xl font-display font-semibold mt-1 mb-1">Send a file into the network</h1>
      <p className="text-slate-400 mb-6">Max 10 MB. Automatically replicated to a second region.</p>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest text-slate-400 font-mono">Preferred region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="mt-1.5 w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
          isDragActive ? 'border-accent bg-accent/5' : 'border-line bg-panel hover:border-accent/50'
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-display text-lg mb-1">{isDragActive ? 'Drop it here' : 'Drag a file here'}</p>
        <p className="text-slate-500 text-sm">or click to browse · executables are rejected</p>
      </div>

      {uploading && (
        <div className="mt-5">
          <div className="h-2 bg-panel2 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">{progress}%</p>
        </div>
      )}

      {lastResult && (
        <div className="mt-6 border border-line bg-panel rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium">{lastResult.originalName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{(lastResult.size / 1024).toFixed(1)} KB</p>
          </div>
          <RegionBadge region={lastResult.primaryServer} />
        </div>
      )}
    </div>
  );
}
