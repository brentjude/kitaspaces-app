import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to get optimized image URL
export function getOptimizedImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
  });
}

// Helper function to get transformed image URL
export function getTransformedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width || 500,
    height: options.height || 500,
    crop: options.crop || 'auto',
    gravity: options.gravity || 'auto',
    fetch_format: 'auto',
    quality: 'auto',
  });
}

// Helper to extract public ID from Cloudinary URL
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and version (if present)
    const publicIdParts = pathParts.slice(uploadIndex + 2);
    const publicId = publicIdParts.join('/').split('.')[0];
    
    return publicId;
  } catch {
    return null;
  }
}