'use client';
import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/hooks/useToast';

interface UploadedFile {
  id: number;
  name: string;
  uuid: string;
  visibility: boolean;
}

interface UploadZoneProps {
  onUploaded: (files: UploadedFile[]) => void;
}

interface UploadProgress {
  name: string;
  progress: number;
  done: boolean;
  error?: string;
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const { addToast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const MAX = 50 * 1024 * 1024;
      const valid = files.filter((f) => {
        if (f.size > MAX) {
          addToast(`${f.name} exceeds 50 MB limit`, 'warning');
          return false;
        }
        return true;
      });
      if (!valid.length) return;

      setUploads(valid.map((f) => ({ name: f.name, progress: 0, done: false })));

      const formData = new FormData();
      valid.forEach((f) => formData.append('files', f));

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/files');

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploads((prev) => prev.map((u) => ({ ...u, progress: pct })));
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.ok !== false) {
              setUploads((prev) => prev.map((u) => ({ ...u, progress: 100, done: true })));
              addToast(`${valid.length} file(s) uploaded`, 'success');
              onUploaded(data.files ?? []);
              setTimeout(() => setUploads([]), 2000);
              resolve();
            } else {
              setUploads((prev) => prev.map((u) => ({ ...u, error: data.message ?? 'Upload failed' })));
              addToast(data.message ?? 'Upload failed', 'error');
              reject(new Error(data.message));
            }
          } catch {
            reject(new Error('Invalid server response'));
          }
        };

        xhr.onerror = () => {
          setUploads((prev) => prev.map((u) => ({ ...u, error: 'Network error' })));
          addToast('Network error during upload', 'error');
          reject(new Error('Network error'));
        };

        xhr.send(formData);
      }).catch(() => {});
    },
    [addToast, onUploaded]
  );

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
        aria-label="Upload files"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onChange}
          className="sr-only"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
            dragging ? 'bg-brand-100 dark:bg-brand-900/50' : 'bg-gray-100 dark:bg-gray-800'
          )}>
            <svg className={clsx('w-7 h-7 transition-colors', dragging ? 'text-brand-600' : 'text-gray-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {dragging ? 'Drop files here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Any file type · Max 50 MB per file</p>
          </div>
        </div>
      </div>

      {/* Progress list */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((u) => (
            <div key={u.name} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mr-3">{u.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {u.error ? '✕ Error' : u.done ? '✓ Done' : `${u.progress}%`}
                </span>
              </div>
              <ProgressBar value={u.progress} />
              {u.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{u.error}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
