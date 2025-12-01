'use client';

import { useState } from 'react';
import type { CloudinaryUploadResponse } from '@/types';

interface UseCloudinaryUploadOptions {
  folder?: string;
  onSuccess?: (data: CloudinaryUploadResponse) => void;
  onError?: (error: string) => void;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<CloudinaryUploadResponse | null>;
  deleteImage: (publicId: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useCloudinaryUpload(
  options: UseCloudinaryUploadOptions = {}
): UseCloudinaryUploadReturn {
  const { folder = 'kitaspaces/events', onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<CloudinaryUploadResponse | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success) {
        onSuccess?.(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (publicId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Delete error:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    upload,
    deleteImage,
    isUploading,
    isDeleting,
    uploadProgress,
    error,
  };
}