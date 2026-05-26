'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';

interface FileItem {
  id: number;
  uuid: string;
  name: string;
  type: string;
  visibility: boolean;
  createdAt: string;
  deletedAt: string | null;
}

interface FileCardProps {
  file: FileItem;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onCopy: (url: string) => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return '🖼';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip') || type.includes('tar') || type.includes('gz')) return '📦';
  if (type.includes('text') || type.includes('json') || type.includes('xml')) return '📝';
  return '📁';
}

export function FileCard({ file, onDelete, onRestore, onCopy }: FileCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDeleted = !!file.deletedAt;
  const downloadUrl = `/api/uploads/${file.uuid}`;

  return (
    <>
      <div
        className={clsx(
          'bg-white dark:bg-gray-900 rounded-xl border p-4 flex items-center gap-3 transition-all',
          isDeleted
            ? 'border-gray-200 dark:border-gray-800 opacity-60'
            : 'border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
        )}
      >
        {/* Icon */}
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
          {getFileIcon(file.type)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</span>
            {isDeleted && <Badge variant="error">Deleted</Badge>}
            {!file.visibility && !isDeleted && <Badge variant="neutral">Private</Badge>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{file.type}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isDeleted && (
            <>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                title="Open file"
                aria-label="Open file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={() => onCopy(downloadUrl)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                title="Copy URL"
                aria-label="Copy file URL"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          )}

          {isDeleted ? (
            <button
              onClick={() => onRestore(file.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              title="Restore file"
              aria-label="Restore file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete file"
              aria-label="Delete file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete file"
        message={`Delete "${file.name}"? This can be restored later.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirmOpen(false); onDelete(file.id); }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
