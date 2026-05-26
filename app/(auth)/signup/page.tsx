'use client';
import { useState, useEffect, useCallback, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstname: '', lastname: '', username: '', password: '' });
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [abortRef, setAbortRef] = useState<AbortController | null>(null);

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    abortRef?.abort();
    const controller = new AbortController();
    setAbortRef(controller);
    setUsernameStatus('checking');

    try {
      const res = await fetch(`/api/auth/check-username/${encodeURIComponent(username)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setUsernameStatus('idle');
    }
  }, [abortRef]);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(form.username), 400);
    return () => clearTimeout(timer);
  }, [form.username, checkUsername]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'taken') {
      addToast('Username is already taken', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message ?? 'Signup failed', 'error');
        return;
      }
      router.push(data.location ?? '/dashboard');
      router.refresh();
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const usernameHelper =
    usernameStatus === 'checking' ? 'Checking availability…' :
    usernameStatus === 'available' ? '✓ Username is available' :
    usernameStatus === 'taken' ? 'Username is already taken' :
    usernameStatus === 'invalid' ? 'Only letters, numbers, _ and - allowed' :
    undefined;

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Start managing your links for free</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            name="firstname"
            autoComplete="given-name"
            autoFocus
            required
            value={form.firstname}
            onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
          />
          <Input
            label="Last name"
            name="lastname"
            autoComplete="family-name"
            required
            value={form.lastname}
            onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
          />
        </div>

        <div>
          <Input
            label="Username"
            name="username"
            autoComplete="username"
            required
            value={form.username}
            helper={usernameStatus !== 'taken' && usernameStatus !== 'invalid' ? usernameHelper : undefined}
            error={usernameStatus === 'taken' || usernameStatus === 'invalid' ? usernameHelper : undefined}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          helper="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={usernameStatus === 'taken' || usernameStatus === 'invalid'}
          className="w-full mt-2"
          size="lg"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
