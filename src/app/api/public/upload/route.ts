import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import type { CloudinaryUploadResponse } from '@/types';

/**
 * POST /api/public/upload
 * Public upload endpoint for payment proofs
 * No authentication required
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'kitaspaces/payments';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' }, // Limit max size for payment proofs
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    const response: CloudinaryUploadResponse = {
      public_id: uploadResult.public_id,
      version: uploadResult.version,
      signature: uploadResult.signature,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      created_at: uploadResult.created_at,
      tags: uploadResult.tags || [],
      bytes: uploadResult.bytes,
      type: uploadResult.type,
      etag: uploadResult.etag,
      placeholder: uploadResult.placeholder || false,
      url: uploadResult.url,
      secure_url: uploadResult.secure_url,
      access_mode: uploadResult.access_mode,
      original_filename: uploadResult.original_filename,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}