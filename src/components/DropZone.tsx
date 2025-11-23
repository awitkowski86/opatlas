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
    a.download = 'my-site.zip';
    a.click();
    setLoading(false);
    alert('Downloaded! Check your Downloads → my-site.zip');
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-10 max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Paste your public Notion page URL here"
        className="w-full px-6 py-4 rounded-lg bg-slate-700 text-white mb-6 text-lg"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={handleExport}
        disabled={!url || loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-bold py-5 rounded-xl text-xl"
      >
        {loading ? 'Exporting… (30–60 sec)' : 'Export My Site →'}
      </button>
    </div>
  );
}