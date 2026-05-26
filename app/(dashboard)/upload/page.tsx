'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadZone } from '@/components/files/UploadZone';
import { useToast } from '@/hooks/useToast';

export default function UploadPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleUploaded = useCallback(() => {
    setTimeout(() => router.push('/files'), 1500);
  }, [router]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload files</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload files up to 50 MB each. They&apos;ll be instantly accessible via a direct link.
        </p>
      </div>
      <div className="max-w-2xl">
        <UploadZone onUploaded={handleUploaded} />
      </div>
    </div>
  );
}
