// Purpose: Types for Cloudinary integration

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string; // HTTP URL
  secure_url: string; // HTTPS URL (use this one!)
  access_mode: string;
  original_filename: string;
}

export type CloudinaryUploadOptions = {
  folder?: string;
  public_id?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  type?: "upload" | "private" | "authenticated";
  tags?: string[];
  context?: Record<string, string>;
  transformation?: string;
  format?: string;
};

export type CloudinaryDeleteResponse = {
  result: "ok" | "not found";
};

export type UploadWidgetOptions = {
  cloudName: string;
  uploadPreset: string;
  sources?: ("local" | "url" | "camera" | "dropbox" | "google_drive")[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
  clientAllowedFormats?: string[];
  styles?: {
    palette?: {
      window?: string;
      windowBorder?: string;
      tabIcon?: string;
      menuIcons?: string;
      textDark?: string;
      textLight?: string;
      link?: string;
      action?: string;
      inactiveTabIcon?: string;
      error?: string;
      inProgress?: string;
      complete?: string;
      sourceBg?: string;
    };
  };
};

export type UploadWidgetResult = {
  event: "success" | "close" | "abort";
  info: CloudinaryUploadResponse | string;
};
