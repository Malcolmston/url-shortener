'use client';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

interface NewLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (link: Record<string, unknown>) => void;
}

export function NewLinkModal({ open, onClose, onCreated }: NewLinkModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ url: '', customSlug: '', password: '', expiresAt: '' });
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const abortRef = useRef<AbortController | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) setForm({ url: '', customSlug: '', password: '', expiresAt: '' });
  }, [open]);

  // Debounced slug check
  useEffect(() => {
    const slug = form.customSlug.trim();
    if (!slug) { setSlugStatus('idle'); return; }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setSlugStatus('checking');
      try {
        const res = await fetch(`/api/links/slug-check/${encodeURIComponent(slug)}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        setSlugStatus(data.available ? 'available' : 'taken');
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') setSlugStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.customSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (slugStatus === 'taken') { addToast('Slug is already taken', 'error'); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { url: form.url };
      if (form.customSlug) body.customSlug = form.customSlug;
      if (form.password) body.password = form.password;
      if (form.expiresAt) body.expiresAt = form.expiresAt;

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.message ?? 'Failed to create link', 'error'); return; }
      addToast('Link created!', 'success');
      onCreated(data.link);
      onClose();
    } catch {
      addToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const slugHelper =
    slugStatus === 'checking' ? 'Checking…' :
    slugStatus === 'available' ? '✓ Available' :
    slugStatus === 'taken' ? 'Already taken' : undefined;

  return (
    <Modal open={open} onClose={onClose} title="Create short link" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="Destination URL"
          type="url"
          required
          placeholder="https://example.com/very-long-url"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        />
        <Input
          label="Custom slug (optional)"
          placeholder="my-link"
          helper={slugStatus !== 'taken' ? slugHelper : undefined}
          error={slugStatus === 'taken' ? slugHelper : undefined}
          value={form.customSlug}
          onChange={(e) => setForm((f) => ({ ...f, customSlug: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Password (optional)"
            type="password"
            placeholder="Leave empty for none"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Input
            label="Expires at (optional)"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={slugStatus === 'taken'}
            className="flex-1"
          >
            Create link
          </Button>
        </div>
      </form>
    </Modal>
  );
}
