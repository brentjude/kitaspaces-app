'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
  aspectRatio?: string;
  maxSize?: string;
  disabled?: boolean; // ✅ Add disabled prop
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'kitaspaces',
  label = 'Upload Image',
  helpText = 'PNG, JPG, WEBP up to 5MB',
  aspectRatio = '16/9',
  maxSize = '1920x1080',
  disabled = false, // ✅ Default to false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>

      <div className="space-y-2">
        {/* Preview or Upload Area */}
        {value ? (
          <div className="relative group">
            <div 
              className="relative w-full rounded-lg overflow-hidden border-2 border-foreground/10"
              style={{ aspectRatio }}
            >
              <Image
                src={value}
                alt="Upload preview"
                fill
                className="object-cover"
                sizes={maxSize}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className={`
              relative w-full rounded-lg border-2 border-dashed border-foreground/20
              hover:border-primary/50 hover:bg-primary/5
              transition-colors cursor-pointer
              disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-foreground/20 disabled:hover:bg-transparent
            `}
            style={{ aspectRatio }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
              <PhotoIcon className="w-12 h-12 text-foreground/40" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isUploading ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs text-foreground/60 mt-1">{helpText}</p>
              </div>
            </div>
          </button>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </div>
  );
}