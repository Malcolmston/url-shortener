'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
      } else {
        addToast(data.message ?? 'Something went wrong', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          If that account exists, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login" className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Enter your username to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
