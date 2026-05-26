import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSearch, faLinkSimple, faFilter,
  faArrowsRotate, faCopy, faCheck, faTrash, faPen,
  faEye, faQrcode, faArrowRight, faCalendar,
  faLock, faUnlock, faXmark, faExternalLink
} from '@fortawesome/free-solid-svg-icons';
import AppShell from '../components/layout/AppShell';
import NewLinkModal from '../components/links/NewLinkModal';

// ── Format helpers ──
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatExpiry(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const diff = d - Date.now();
  if (diff < 0) return 'Expired';
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days}d`;
}

// ── Link Card ──
function LinkCard({ link, onDelete, onCopy, copiedId }) {
  const isCopied = copiedId === link.id;
  const expiryText = formatExpiry(link.expiresAt);
  const isExpired = link.isExpired || (link.expiresAt && new Date(link.expiresAt) < new Date());

  return (
    <div className={[
      'bg-white dark:bg-slate-800 rounded-xl border transition-shadow duration-200 hover:shadow-md p-5',
      isExpired || link.deletedAt
        ? 'border-red-200 dark:border-red-900 opacity-70'
        : 'border-gray-200 dark:border-slate-700',
    ].join(' ')}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FontAwesomeIcon icon={faLinkSimple} className="text-violet-600 dark:text-violet-400" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Slug + badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400">
              {link.shortUrl?.replace(/^https?:\/\/[^/]+/, '') || `/${link.slug}`}
            </span>
            {link.isPasswordProtected && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <FontAwesomeIcon icon={faLock} className="text-[8px]" />
                Protected
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                Expired
              </span>
            )}
            {expiryText && !isExpired && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-transparent">
                <FontAwesomeIcon icon={faCalendar} className="text-[8px]" />
                {expiryText}
              </span>
            )}
          </div>

          {/* Destination URL */}
          <div className="flex items-center gap-1.5 mt-1">
            <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 dark:text-slate-600 text-xs flex-shrink-0" />
            <a
              href={link.originalUrl}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 truncate max-w-sm flex items-center gap-1"
            >
              {link.originalUrl}
              <FontAwesomeIcon icon={faExternalLink} className="text-[10px] flex-shrink-0 opacity-60" />
            </a>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-slate-500">
            <span>{timeAgo(link.createdAt)}</span>
            <span>·</span>
            <span className="font-medium text-gray-600 dark:text-slate-400">
              {link.clicks?.toLocaleString() || 0} clicks
            </span>
            <span>·</span>
            <span>{link.redirectType}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Copy */}
          <button
            onClick={() => onCopy(link)}
            className={[
              'p-2 rounded-lg transition-colors duration-150 text-sm',
              isCopied
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-gray-500 dark:text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40',
            ].join(' ')}
            aria-label={isCopied ? 'Copied!' : 'Copy short URL'}
          >
            <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} aria-hidden="true" />
          </button>

          {/* Delete */}
          {!link.deletedAt && (
            <button
              onClick={() => onDelete(link.id)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-sm"
              aria-label="Delete link"
            >
              <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatChip({ label, value, color = 'gray' }) {
  const colors = {
    violet:  'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
    gray:    'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700',
    amber:   'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900',
  };
  return (
    <div className={['rounded-xl border px-5 py-4 text-center', colors[color]].join(' ')}>
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}

// ── Main page ──
export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | expired | deleted
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/links');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load links');
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this link?')) return;
    await fetch(`/api/links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link.shortUrl || `${window.location.origin}/${link.slug}`)
      .then(() => {
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
  };

  const handleNewLink = (newLink) => {
    setLinks(prev => [newLink, ...prev]);
    setNewModalOpen(false);
  };

  // Derive expiry status from the authoritative expiresAt field, with
  // l.isExpired as a server-side hint that may not be populated on all
  // response shapes.
  const isExpiredFn = (l) =>
    !!(l.isExpired || (l.expiresAt && new Date(l.expiresAt) < new Date()));

  // Filter
  const filtered = links.filter(l => {
    const matchSearch = !search || l.slug.includes(search) || l.originalUrl.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'active'  ? !l.deletedAt && !isExpiredFn(l) :
      filter === 'expired' ? isExpiredFn(l) :
      filter === 'deleted' ? !!l.deletedAt : true;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:   links.filter(l => !l.deletedAt).length,
    clicks:  links.reduce((s, l) => s + (l.clicks || 0), 0),
    expired: links.filter(l => isExpiredFn(l) && !l.deletedAt).length,
    deleted: links.filter(l => l.deletedAt).length,
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-display-md font-display font-bold text-gray-900 dark:text-slate-50">My Links</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage and track your short links</p>
        </div>
        <button
          onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-2 h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0 shadow-sm"
        >
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
          New Link
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatChip label="Active Links"   value={stats.total}             color="violet" />
        <StatChip label="Total Clicks"   value={stats.clicks.toLocaleString()} color="emerald" />
        <StatChip label="Expired"        value={stats.expired}           color="amber" />
        <StatChip label="Deleted"        value={stats.deleted}           color="gray" />
      </div>

      {/* Filter + search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-sm" />
          </span>
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search links…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          {[['all','All'],['active','Active'],['expired','Expired'],['deleted','Deleted']].map(([val, lbl]) => (
            <button
              key={val} onClick={() => setFilter(val)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === val
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50 shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300',
              ].join(' ')}
            >{lbl}</button>
          ))}
        </div>

        <button onClick={fetchLinks}
          className="h-10 w-10 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Refresh"
        >
          <FontAwesomeIcon icon={faArrowsRotate} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Links list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-5 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button onClick={fetchLinks}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FontAwesomeIcon icon={faLinkSimple} className="text-5xl text-gray-200 dark:text-slate-700 mb-4" />
          <h3 className="text-base font-semibold text-gray-600 dark:text-slate-400 font-display">
            {search || filter !== 'all' ? 'No links match your filter' : 'No links yet'}
          </h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 max-w-xs">
            {search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first short link to get started.'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={() => setNewModalOpen(true)}
              className="mt-6 px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">
              Create first link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          ))}
        </div>
      )}

      {/* New Link Modal */}
      <NewLinkModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreated={handleNewLink}
      />
    </AppShell>
  );
}
