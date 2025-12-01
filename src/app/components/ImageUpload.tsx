'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import type { CloudinaryUploadResponse } from '@/types';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUploadComplete?: (data: CloudinaryUploadResponse) => void;
  folder?: string;
  label?: string;
  helpText?: string;
  aspectRatio?: string;
  maxSize?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onUploadComplete,
  folder = 'kitaspaces/events',
  label = 'Upload Image',
  helpText = 'PNG, JPG, GIF up to 5MB',
  aspectRatio = '16/9',
  maxSize = '1200x630',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const { upload, deleteImage, isUploading, uploadProgress, error } =
    useCloudinaryUpload({
      folder,
      onSuccess: (data) => {
        setPreview(data.secure_url);
        onChange(data.secure_url);
        onUploadComplete?.(data);
      },
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    await upload(file);
  };

  const handleRemove = async () => {
    if (value) {
      // Extract public ID from URL if needed
      const publicIdMatch = value.match(/\/v\d+\/(.+)\.\w+$/);
      if (publicIdMatch) {
        await deleteImage(publicIdMatch[1]);
      }
    }

    setPreview(null);
    onChange('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div className="space-y-4">
        {preview ? (
          // Preview with actions
          <div className="relative group">
            <div
              className="relative w-full rounded-lg overflow-hidden bg-foreground/5 border-2 border-foreground/10"
              style={{ aspectRatio }}
            >
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading}
                  className="px-4 py-2 bg-white text-foreground rounded-lg text-sm font-medium hover:bg-foreground/10 transition-colors disabled:opacity-50"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          // Upload button
          <div
            onClick={handleClick}
            className="relative w-full rounded-lg border-2 border-dashed border-foreground/20 hover:border-primary transition-colors cursor-pointer bg-foreground/5"
            style={{ aspectRatio }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <svg
                className="w-12 h-12 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-foreground/50 mt-1">{helpText}</p>
                <p className="text-xs text-foreground/50">Max size: {maxSize}</p>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Loading state */}
        {isUploading && (
          <p className="text-sm text-foreground/60 flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading... {uploadProgress}%
          </p>
        )}
      </div>
    </div>
  );
}