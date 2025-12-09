'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProofOfPaymentUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: React.ReactNode;
  helpText?: string;
  aspectRatio?: string;
  maxSize?: string;
}

export default function ProofOfPaymentUpload({
  value,
  onChange,
  label = 'Payment Proof',
  helpText = 'Screenshot or photo of your payment confirmation',
  aspectRatio = '4/3',
  maxSize = '800x600',
}: ProofOfPaymentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'kitaspaces/payments');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to public endpoint (no auth required)
      const response = await fetch('/api/public/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success && data.data?.secure_url) {
        onChange(data.data.secure_url);
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setPreview(null);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
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
                alt="Payment Proof"
                fill
                className="object-cover"
              />

              {/* Overlay on hover */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleClick}
                    className="px-4 py-2 bg-white text-foreground rounded-lg text-sm font-medium hover:bg-foreground/10 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
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
            className={`relative w-full rounded-lg border-2 border-dashed transition-colors bg-foreground/5 ${
              isUploading
                ? 'border-foreground/20 cursor-not-allowed'
                : 'border-foreground/20 hover:border-primary cursor-pointer'
            }`}
            style={{ aspectRatio }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-12 w-12 text-primary"
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
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      Please wait
                    </p>
                  </div>
                </>
              ) : (
                <>
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
                      Click to upload
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">{helpText}</p>
                    <p className="text-xs text-foreground/50">
                      Max size: {maxSize} (5MB)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Upload Progress Bar */}
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success message */}
        {value && !isUploading && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-green-800 font-medium">
              Payment proof uploaded successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
}