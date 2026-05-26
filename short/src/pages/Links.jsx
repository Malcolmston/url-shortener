import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Links page stub.
 * Full implementation ships with feature/links-ui.
 */
export default function LinksPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Links</h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">Manage your short links here.</p>
      </div>
      <Link to="/dashboard" className="text-violet-600 hover:underline text-sm font-medium">
        ← Back to dashboard
      </Link>
    </div>
  );
}
