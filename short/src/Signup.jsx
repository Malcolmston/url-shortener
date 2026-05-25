import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScissors, faEye, faEyeSlash, faCircleXmark,
  faCheck, faCircleCheck, faUser, faEnvelope, faLock,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

/* ── Password strength ── */
function getStrength(pw) {
  if (!pw) return 0;
  let score = 1; // 1 = any chars
  if (pw.length >= 8) score = 2;
  if (score >= 2 && /[A-Z]/.test(pw)) score = 3;
  if (score >= 3 && /[^A-Za-z0-9]/.test(pw)) score = 4;
  return score;
}

const STRENGTH_META = [
  null,
  { label: 'Weak',      bar: 'bg-red-500',    text: 'text-red-500' },
  { label: 'Fair',      bar: 'bg-amber-500',  text: 'text-amber-500' },
  { label: 'Good',      bar: 'bg-yellow-400', text: 'text-yellow-500' },
  { label: 'Strong',    bar: 'bg-emerald-500',text: 'text-emerald-500' },
];

function StrengthBar({ strength }) {
  if (!strength) return null;
  const meta = STRENGTH_META[strength];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className={[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              n <= strength ? meta.bar : 'bg-gray-200 dark:bg-slate-700',
            ].join(' ')}
          />
        ))}
      </div>
      <p className={['text-xs font-medium', meta.text].join(' ')}>{meta.label} password</p>
    </div>
  );
}

/* ── Username availability indicator ── */
const AVAIL_IDLE    = 'idle';
const AVAIL_LOADING = 'loading';
const AVAIL_OK      = 'ok';
const AVAIL_TAKEN   = 'taken';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname: '', lastname: '', username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorKey, setErrorKey] = useState(0);
  const [terms, setTerms] = useState(false);
  const [usernameAvail, setUsernameAvail] = useState(AVAIL_IDLE);
  const debounceRef = useRef(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'username') {
      setUsernameAvail(AVAIL_IDLE);
      clearTimeout(debounceRef.current);
      if (value.trim().length >= 2) {
        debounceRef.current = setTimeout(() => checkUsername(value.trim()), 500);
      }
    }
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const checkUsername = async (username) => {
    setUsernameAvail(AVAIL_LOADING);
    try {
      const res = await fetch(`/api/links/slug-check/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setUsernameAvail(data.available ? AVAIL_OK : AVAIL_TAKEN);
      } else {
        setUsernameAvail(AVAIL_IDLE);
      }
    } catch {
      setUsernameAvail(AVAIL_IDLE);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      window.location.href = data.location;
    } catch (err) {
      setError(err.message);
      setErrorKey(k => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const isValid =
    form.firstname.trim() &&
    form.lastname.trim() &&
    form.username.trim() &&
    form.password &&
    strength >= 2 &&
    usernameAvail !== AVAIL_TAKEN &&
    terms;

  /* Username trailing icon */
  const renderUsernameTrailing = () => {
    if (usernameAvail === AVAIL_LOADING)
      return <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin text-sm" aria-hidden="true" />;
    if (usernameAvail === AVAIL_OK)
      return <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-sm" aria-label="Username available" />;
    if (usernameAvail === AVAIL_TAKEN)
      return <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-sm" aria-label="Username taken" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-gray-900 dark:text-slate-50 mb-8">
        <span className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/30">
          <FontAwesomeIcon icon={faScissors} className="text-white" />
        </span>
        Snip
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-display-sm font-display font-bold text-gray-900 dark:text-slate-50">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">Free forever. No credit card required.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            key={errorKey}
            role="alert"
            className="flex items-center gap-2 px-4 py-3 mb-5 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400 animate__animated animate__headShake"
          >
            <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* First + Last name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                First name
              </label>
              <input
                id="firstname" name="firstname" type="text"
                autoComplete="given-name" required
                value={form.firstname} onChange={handleChange}
                disabled={isLoading}
                placeholder="Jane"
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-60 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Last name
              </label>
              <input
                id="lastname" name="lastname" type="text"
                autoComplete="family-name" required
                value={form.lastname} onChange={handleChange}
                disabled={isLoading}
                placeholder="Doe"
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-60 transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
                <FontAwesomeIcon icon={faUser} className="text-sm" aria-hidden="true" />
              </span>
              <input
                id="username" name="username" type="text"
                autoComplete="username" required
                value={form.username} onChange={handleChange}
                disabled={isLoading}
                placeholder="jane_doe"
                className={[
                  'w-full h-10 pl-9 pr-9 rounded-lg border bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60 transition-colors',
                  usernameAvail === AVAIL_TAKEN
                    ? 'border-red-400 dark:border-red-500 focus:border-red-400'
                    : usernameAvail === AVAIL_OK
                    ? 'border-emerald-400 dark:border-emerald-500 focus:border-emerald-400'
                    : 'border-gray-300 dark:border-slate-600 focus:border-violet-500 dark:focus:border-violet-400',
                ].join(' ')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderUsernameTrailing()}
              </span>
            </div>
            {usernameAvail === AVAIL_TAKEN && (
              <p className="text-xs text-red-500 mt-1">That username is already taken.</p>
            )}
            {usernameAvail === AVAIL_OK && (
              <p className="text-xs text-emerald-500 mt-1">Username is available!</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-sm" aria-hidden="true" />
              </span>
              <input
                id="password" name="password" type={showPw ? 'text' : 'password'}
                autoComplete="new-password" required
                value={form.password} onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-60 transition-colors"
              />
              <button
                type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPw ? faEye : faEyeSlash} className="text-sm" aria-hidden="true" />
              </button>
            </div>
            <StrengthBar strength={strength} />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={[
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                terms
                  ? 'bg-violet-600 border-violet-600'
                  : 'border-gray-300 dark:border-slate-600 group-hover:border-violet-400',
              ].join(' ')}>
                {terms && <FontAwesomeIcon icon={faCheck} className="text-white text-[9px]" aria-hidden="true" />}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              I agree to Snip's{' '}
              <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</a>.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900/50 text-white font-semibold rounded-lg transition-colors duration-150 text-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 dark:text-slate-500">
        <a href="#" className="hover:underline">Terms</a>
        {' · '}
        <a href="#" className="hover:underline">Privacy</a>
        {' · '}
        © 2026 Snip
      </p>
    </div>
  );
}
