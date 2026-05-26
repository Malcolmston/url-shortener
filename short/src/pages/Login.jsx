import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScissors, faEye, faEyeSlash, faCircleXmark, faUser } from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorKey, setErrorKey] = useState(0);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      navigate(data.location || '/dashboard');
    } catch (err) {
      setError(err.message);
      setErrorKey(k => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = form.username.trim() && form.password;

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
          <h1 className="text-display-sm font-display font-bold text-gray-900 dark:text-slate-50">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">Sign in to your Snip account</p>
        </div>

        {/* Error */}
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
                placeholder="your_username"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-60 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password" name="password" type={showPw ? 'text' : 'password'}
                autoComplete="current-password" required
                value={form.password} onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full h-10 pl-3 pr-10 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-60 transition-colors"
              />
              <button
                type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPw ? faEye : faEyeSlash} className="text-sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold rounded-lg transition-colors duration-150 text-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
            Sign up free
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
