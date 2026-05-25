import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLinkSimple, faFile, faChartLine, faCloudArrowUp,
  faArrowRight, faPlus, faCopy, faCheck, faScissors,
  faClock, faArrowUpRight
} from '@fortawesome/free-solid-svg-icons';
import AppShell from '../components/layout/AppShell';

function StatCard({ label, value, icon, color, to }) {
  const colors = {
    violet:  { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
    sky:     { bg: 'bg-sky-50 dark:bg-sky-950/30',       text: 'text-sky-600 dark:text-sky-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-600 dark:text-amber-400' },
  };
  const { bg, text } = colors[color] || colors.violet;

  const inner = (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', bg].join(' ')}>
        <FontAwesomeIcon icon={icon} className={['text-lg', text].join(' ')} aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-gray-900 dark:text-slate-50 leading-none">{value ?? '—'}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );

  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

function QuickShorten() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSnip = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to shorten');
      setResult(data.link);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 font-display">Quick Snip</h2>
      <form onSubmit={handleSnip} className="flex gap-2">
        <input
          type="url" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://your-very-long-url.com/goes/here"
          className="flex-1 h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors min-w-0"
          aria-label="URL to shorten"
        />
        <button
          type="submit" disabled={loading || !url.trim()}
          className="h-10 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors flex-shrink-0"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><FontAwesomeIcon icon={faScissors} aria-hidden="true" /> Snip</>
          }
        </button>
      </form>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {result && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-950/40 rounded-lg border border-violet-100 dark:border-violet-900">
          <FontAwesomeIcon icon={faCheck} className="text-violet-600 dark:text-violet-400 flex-shrink-0" aria-hidden="true" />
          <span className="font-mono text-sm text-violet-700 dark:text-violet-300 font-medium flex-1 min-w-0 truncate">
            {result.shortUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 rounded-md text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
            aria-label={copied ? 'Copied!' : 'Copy short URL'}
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-xs" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/user').then(r => r.json()),
      fetch('/api/links').then(r => r.json()).catch(() => ({ links: [] })),
      fetch('/files').then(r => r.json()).catch(() => ({ files: [] })),
    ]).then(([user, linksData, filesData]) => {
      setStats({
        links:   linksData.links?.length ?? 0,
        files:   filesData.files?.length ?? 0,
        clicks:  linksData.links?.reduce((sum, l) => sum + (l.clicks || 0), 0) ?? 0,
        storage: filesData.files?.reduce((sum, f) => sum + (f.file?.length || 0), 0) ?? 0,
      });
      setLinks((linksData.links || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  function formatStorage(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
  }

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-display-md font-display font-bold text-gray-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Links"  value={loading ? '…' : stats?.links}   icon={faLinkSimple}  color="violet"  to="/links"  />
        <StatCard label="Total Files"  value={loading ? '…' : stats?.files}   icon={faFile}        color="sky"     to="/files"  />
        <StatCard label="Total Clicks" value={loading ? '…' : stats?.clicks?.toLocaleString()} icon={faChartLine} color="emerald" to="/analytics" />
        <StatCard label="Storage Used" value={loading ? '…' : formatStorage(stats?.storage)} icon={faCloudArrowUp} color="amber" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Quick snip + recent links */}
        <div className="lg:col-span-2 space-y-6">
          <QuickShorten />

          {/* Recent links */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 font-display">Recent Links</h2>
              <Link to="/links" className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                View all <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {[1,2,3].map(i => (
                  <div key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 flex-1 bg-gray-100 dark:bg-slate-700/50 rounded" />
                  </div>
                ))}
              </div>
            ) : links.length === 0 ? (
              <div className="py-12 text-center">
                <FontAwesomeIcon icon={faLinkSimple} className="text-3xl text-gray-200 dark:text-slate-700 mb-3" />
                <p className="text-sm text-gray-500 dark:text-slate-400">No links yet. Create your first one above.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {links.map(link => (
                  <li key={link.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <span className="font-mono text-sm text-violet-600 dark:text-violet-400 font-medium flex-shrink-0">
                      /{link.slug}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 dark:text-slate-600 text-xs flex-shrink-0" />
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate flex-1 min-w-0">
                      {link.originalUrl}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                      {link.clicks} clicks
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 font-display mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Upload a file',    icon: faCloudArrowUp, to: '/upload', color: 'sky' },
                { label: 'View analytics',   icon: faChartLine,    to: '/analytics', color: 'emerald' },
                { label: 'Account settings', icon: faScissors,     to: '/account', color: 'amber' },
              ].map(a => {
                const colorMap = {
                  sky:     'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
                  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
                  amber:   'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
                };
                return (
                  <Link key={a.label} to={a.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group">
                    <div className={['w-8 h-8 rounded-lg flex items-center justify-center text-sm', colorMap[a.color]].join(' ')}>
                      <FontAwesomeIcon icon={a.icon} aria-hidden="true" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{a.label}</span>
                    <FontAwesomeIcon icon={faArrowUpRight} className="ml-auto text-gray-300 dark:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 rounded-xl border border-violet-100 dark:border-violet-900 p-5">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-2">Pro tip</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono">⌘K</kbd> anywhere to open the command palette and search your links and files instantly.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
