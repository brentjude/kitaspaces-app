"use client";

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
  aspectRatio?: string;
  maxSize?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "kitaspaces",
  label = "Upload Image",
  helpText = "PNG, JPG, WEBP up to 5MB",
  aspectRatio = "16/9",
  maxSize = "1920x1080",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadProgress(100);

      // 🔧 Force HTTPS URL and use the correct property
      const imageUrl = (result.data?.url || result.url || "").replace(
        /^http:/,
        "https:"
      );

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      onChange(imageUrl);

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    setUploadProgress(0);
  };

  const handleClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="space-y-3">
        {/* Preview or Upload Area */}
        {value ? (
          <div className="relative group">
            <div
              className="relative w-full rounded-lg overflow-hidden border-2 border-foreground/10 bg-foreground/5"
              style={{ aspectRatio }}
            >
              <Image
                src={value}
                alt="Upload preview"
                fill
                className="object-cover"
                sizes={maxSize}
                unoptimized={value.includes("cloudinary")}
              />
              {!disabled && !isUploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove image"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Change Image Button */}
            {!isUploading && !disabled && (
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={disabled || isUploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleClick}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Change Image
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className={`
                relative w-full rounded-lg border-2 border-dashed transition-colors
                ${
                  isUploading
                    ? "border-primary bg-primary/5 cursor-not-allowed"
                    : "border-foreground/20 hover:border-primary hover:bg-primary/5 cursor-pointer"
                }
                ${disabled ? "opacity-50 cursor-not-allowed hover:border-foreground/20 hover:bg-transparent" : ""}
              `}
              style={{ aspectRatio }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <PhotoIcon className="w-12 h-12 text-foreground/40" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {isUploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-foreground/60">{helpText}</p>
                  <p className="text-xs text-foreground/40 mt-1">
                    Recommended: {maxSize}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg
              className="w-4 h-4 text-red-600 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
