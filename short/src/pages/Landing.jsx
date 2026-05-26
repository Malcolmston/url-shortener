import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Landing page stub.
 * Replace with the full marketing page implementation.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">✂</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Snip
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-slate-400">
          Short links. Big control.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          to="/signup"
          className="px-5 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
