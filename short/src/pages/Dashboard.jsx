import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Dashboard stub.
 * Full implementation ships with feature/app-shell.
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">Your links and files at a glance.</p>
      </div>
      <div className="flex gap-3">
        <Link to="/links"  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">Links</Link>
        <Link to="/files"  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Files</Link>
        <Link to="/upload" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Upload</Link>
      </div>
    </div>
  );
}
