import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScissors, faArrowLeft, faHouse } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen flex flex-col font-sans">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Giant 404 with scissors overlay */}
        <div className="relative inline-flex items-center justify-center mb-6 select-none">
          <span className="text-[120px] leading-none font-display font-bold text-gray-100 dark:text-slate-800">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-600/30">
              <FontAwesomeIcon icon={faScissors} className="text-white text-2xl" aria-hidden="true" />
            </span>
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-slate-50 mb-3">
          Page not found
        </h1>
        <p className="text-base text-gray-500 dark:text-slate-400 max-w-sm leading-relaxed mb-10">
          Looks like this link got a little too short. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/25 text-sm"
          >
            <FontAwesomeIcon icon={faHouse} aria-hidden="true" />
            Go home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            Go back
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 font-display font-bold text-gray-900 dark:text-slate-50 mb-3">
          <span className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
            <FontAwesomeIcon icon={faScissors} className="text-white text-xs" aria-hidden="true" />
          </span>
          Snip
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          <a href="#" className="hover:underline">Terms</a>
          {' · '}
          <a href="#" className="hover:underline">Privacy</a>
          {' · '}
          © 2026 Snip
        </p>
      </footer>
    </div>
  );
}
