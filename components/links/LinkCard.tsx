'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';

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

interface LinkCardProps {
  link: LinkItem;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onCopy: (url: string) => void;
}

export function LinkCard({ link, onDelete, onRestore, onCopy }: LinkCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDeleted = !!link.deletedAt;

  const truncate = (url: string, max = 48) =>
    url.length > max ? url.slice(0, max) + '…' : url;

  return (
    <>
      <div
        className={clsx(
          'bg-white dark:bg-gray-900 rounded-xl border p-4 transition-all',
          isDeleted
            ? 'border-gray-200 dark:border-gray-800 opacity-60'
            : 'border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">/{link.slug}</span>
              {isDeleted && <Badge variant="error">Deleted</Badge>}
              {link.isExpired && !isDeleted && <Badge variant="warning">Expired</Badge>}
              {!link.isActive && !isDeleted && <Badge variant="neutral">Inactive</Badge>}
              {link.isPasswordProtected && (
                <Badge variant="info">
                  <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Protected
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={link.originalUrl}>
              {truncate(link.originalUrl)}
            </p>
          </div>

          {/* Stats + actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{link.clicks.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">clicks</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onCopy(link.shortUrl)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                title="Copy link"
                aria-label="Copy short URL"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              {isDeleted ? (
                <button
                  onClick={() => onRestore(link.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  title="Restore link"
                  aria-label="Restore link"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete link"
                  aria-label="Delete link"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete link"
        message={`Are you sure you want to delete "/${link.slug}"? This can be restored later.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirmOpen(false); onDelete(link.id); }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
