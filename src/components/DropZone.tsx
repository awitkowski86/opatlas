'use client';
import { useState } from 'react';

export default function DropZone() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'landing-page.zip';
    a.click();
    setLoading(false);
    alert('✓ Landing page ready! Check Downloads → landing-page.zip');
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-7 backdrop-blur-sm shadow-xl">
      <input
        type="text"
        placeholder="Paste your Notion page URL (must be public)"
        className="w-full px-4 py-3.5 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-slate-400 mb-4 text-sm transition-all"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={handleExport}
        disabled={!url || loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg text-sm shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? 'Generating landing page…' : 'Generate Landing Page →'}
      </button>
      <p className="text-xs text-slate-500 mt-3 text-center leading-relaxed">Get a conversion-optimized page with analytics built-in</p>
    </div>
  );
}