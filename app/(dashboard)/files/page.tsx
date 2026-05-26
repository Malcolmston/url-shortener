'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { FileCard } from '@/components/files/FileCard';
import { useToast } from '@/hooks/useToast';

interface FileItem {
  id: number;
  uuid: string;
  name: string;
  type: string;
  visibility: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export default function FilesPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.ok) setFiles(data.files);
    } catch {
      addToast('Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/files/${id}`, { method: 'DELETE' });
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, deletedAt: new Date().toISOString() } : f));
      addToast('File deleted', 'success');
    } catch {
      addToast('Failed to delete file', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await fetch(`/api/files/${id}/restore`, { method: 'POST' });
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, deletedAt: null } : f));
      addToast('File restored', 'success');
    } catch {
      addToast('Failed to restore file', 'error');
    }
  };

  const handleCopy = (url: string) => {
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full).then(() => addToast('URL copied!', 'success'));
  };

  const visible = showDeleted ? files : files.filter((f) => !f.deletedAt);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Files</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {files.filter((f) => !f.deletedAt).length} file{files.filter((f) => !f.deletedAt).length !== 1 ? 's' : ''} stored
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted((s) => !s)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showDeleted ? 'Hide deleted' : 'Show deleted'}
          </button>
          <Button href="/upload">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          title="No files yet"
          description="Upload your first file to get a shareable link."
          action={<Button href="/upload">Upload a file</Button>}
        />
      ) : (
        <div className="space-y-2">
          {visible.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
