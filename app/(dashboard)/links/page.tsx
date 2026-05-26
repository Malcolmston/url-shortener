'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { LinkCard } from '@/components/links/LinkCard';
import { NewLinkModal } from '@/components/links/NewLinkModal';
import { useToast } from '@/hooks/useToast';

interface LinkItem {
  id: number;
  slug: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  isActive: boolean;
  hasPreview: boolean;
  isPasswordProtected: boolean;
  expiresAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  isExpired: boolean;
}

export default function LinksPage() {
  const { addToast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      if (data.ok) setLinks(data.links);
    } catch {
      addToast('Failed to load links', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/links/${id}`, { method: 'DELETE' });
      setLinks((prev) => prev.map((l) => l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l));
      addToast('Link deleted', 'success');
    } catch {
      addToast('Failed to delete link', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await fetch(`/api/links/${id}/restore`, { method: 'POST' });
      setLinks((prev) => prev.map((l) => l.id === id ? { ...l, deletedAt: null } : l));
      addToast('Link restored', 'success');
    } catch {
      addToast('Failed to restore link', 'error');
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => addToast('Copied to clipboard!', 'success'));
  };

  const handleCreated = (link: Record<string, unknown>) => {
    setLinks((prev) => [link as unknown as LinkItem, ...prev]);
  };

  const visible = showDeleted ? links : links.filter((l) => !l.deletedAt);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Links</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {links.filter((l) => !l.deletedAt).length} active link{links.filter((l) => !l.deletedAt).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted((s) => !s)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showDeleted ? 'Hide deleted' : 'Show deleted'}
          </button>
          <Button onClick={() => setModalOpen(true)}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New link
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          title="No links yet"
          description="Create your first short link to get started."
          action={<Button onClick={() => setModalOpen(true)}>Create link</Button>}
        />
      ) : (
        <div className="space-y-2">
          {visible.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      <NewLinkModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
