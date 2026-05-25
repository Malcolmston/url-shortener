import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faLinkSimple, faLock, faEye, faCalendar,
  faCheck, faSpinner, faCircleCheck, faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

const REDIRECT_TYPES = [
  { value: '302', label: '302 Temporary (recommended)', desc: 'Best for tracking; browser does not cache' },
  { value: '301', label: '301 Permanent', desc: 'Cached by browsers and search engines' },
  { value: '307', label: '307 Strict Temporary', desc: 'Preserves HTTP method (POST stays POST)' },
];

export default function NewLinkModal({ isOpen, onClose, onCreated }) {
  const [url, setUrl]           = useState('');
  const [slug, setSlug]         = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry]     = useState('');
  const [redirect, setRedirect] = useState('302');
  const [preview, setPreview]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [usePassword, setUsePw] = useState(false);
  const [useExpiry, setUseExp]  = useState(false);

  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState('');
  const [shaking, setShaking]         = useState(false);
  const slugTimer = useRef(null);
  const firstInput = useRef(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInput.current?.focus(), 50);
      // Reset form
      setUrl(''); setSlug(''); setPassword(''); setExpiry('');
      setRedirect('302'); setPreview(false); setShowPw(false);
      setUsePw(false); setUseExp(false); setSlugStatus('idle'); setError('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(slug)) { setSlugStatus('invalid'); return; }
    setSlugStatus('checking');
    clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/links/slug-check/${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugStatus(data.available ? 'available' : 'taken');
      } catch { setSlugStatus('idle'); }
    }, 400);
    return () => clearTimeout(slugTimer.current);
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) { setError('Please enter a URL.'); return; }
    if (slug && (slugStatus === 'taken' || slugStatus === 'invalid')) {
      setError('Please fix the slug before submitting.'); return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          customSlug:   slug || undefined,
          password:     usePassword && password ? password : undefined,
          expiresAt:    useExpiry && expiry ? expiry : undefined,
          redirectType: redirect,
          hasPreview:   preview,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to create link');
        setShaking(true); setTimeout(() => setShaking(false), 800);
        return;
      }
      onCreated?.(data.link);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const SlugIcon = () => {
    if (slugStatus === 'checking')  return <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400 text-xs" />;
    if (slugStatus === 'available') return <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-xs" />;
    if (slugStatus === 'taken')     return <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-xs" />;
    if (slugStatus === 'invalid')   return <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-xs" />;
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="new-link-title"
    >
      <div className={[
        'w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]',
        'ring-1 ring-black/5 dark:ring-white/5',
        shaking ? 'animate__animated animate__headShake' : '',
      ].join(' ')}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
              <FontAwesomeIcon icon={faLinkSimple} className="text-violet-600 dark:text-violet-400 text-sm" />
            </div>
            <h2 id="new-link-title" className="text-lg font-semibold text-gray-900 dark:text-slate-50 font-display">
              Create short link
            </h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Destination URL */}
          <div className="space-y-1.5">
            <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInput} id="link-url" type="url" required
              value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Custom slug */}
          <div className="space-y-1.5">
            <label htmlFor="link-slug" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Custom slug <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-colors">
              <span className="px-3 flex items-center text-sm text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 font-mono flex-shrink-0">
                snip.io/
              </span>
              <div className="relative flex-1">
                <input
                  id="link-slug" type="text"
                  value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="my-custom-slug"
                  className="w-full h-10 px-3 pr-8 bg-white dark:bg-slate-900 text-sm font-mono text-gray-900 dark:text-slate-50 placeholder:text-gray-400 placeholder:font-sans focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><SlugIcon /></div>
              </div>
            </div>
            {slugStatus === 'available' && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ This slug is available</p>}
            {slugStatus === 'taken'     && <p className="text-xs text-red-500">✗ Slug already taken — try another</p>}
            {slugStatus === 'invalid'   && <p className="text-xs text-red-500">✗ 3–50 chars, letters/numbers/hyphens/underscores only</p>}
          </div>

          {/* Redirect type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Redirect type</label>
            <div className="space-y-2">
              {REDIRECT_TYPES.map(rt => (
                <label key={rt.value}
                  className={[
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    redirect === rt.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600',
                  ].join(' ')}>
                  <input type="radio" name="redirect" value={rt.value}
                    checked={redirect === rt.value} onChange={() => setRedirect(rt.value)}
                    className="mt-0.5 text-violet-600 focus:ring-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-50">{rt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{rt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password protection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={usePassword} onChange={e => setUsePw(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLock} className="text-xs text-amber-500" />
                  Password protect
                </span>
              </label>
              {usePassword && (
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Link password"
                    className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors text-gray-900 dark:text-slate-50 placeholder:text-gray-400" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs"
                    aria-label={showPw ? 'Hide' : 'Show'}>
                    <FontAwesomeIcon icon={showPw ? faEye : faLock} />
                  </button>
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useExpiry} onChange={e => setUseExp(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendar} className="text-xs text-sky-500" />
                  Set expiry date
                </span>
              </label>
              {useExpiry && (
                <input type="datetime-local"
                  value={expiry} onChange={e => setExpiry(e.target.value)}
                  min={new Date().toISOString().slice(0,16)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors" />
              )}
            </div>
          </div>

          {/* Preview interstitial */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-gray-300 transition-colors">
            <input type="checkbox" checked={preview} onChange={e => setPreview(e.target.checked)}
              className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-50 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faEye} className="text-xs text-violet-500" />
                Show preview interstitial
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Show a preview page before redirecting visitors (reduces bot clicks)
              </p>
            </div>
          </label>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-lg">
              <FontAwesomeIcon icon={faXmark} className="flex-shrink-0" />
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 rounded-b-2xl border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} type="button"
            className="h-10 px-4 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting || !url.trim()}
            className="h-10 px-5 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white flex items-center gap-2 transition-colors">
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
            ) : (
              <><FontAwesomeIcon icon={faCheck} /> Create link</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
