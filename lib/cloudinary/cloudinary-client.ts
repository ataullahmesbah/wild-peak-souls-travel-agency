/**
 * Cloudinary API Client — Server Runtime Only
 *
 * This module is dynamically imported from API routes.
 * cloudinary is an optional runtime dependency — install with:
 *   npm install cloudinary
 *
 * It is marked as a webpack external so it is not bundled.
 */

import type {
  CloudinaryUploadParams,
  CloudinaryUploadResult,
} from './upload-service';
import { CLOUDINARY_TRANSFORMS } from './upload-service';

export async function uploadImage(
  params: CloudinaryUploadParams,
): Promise<CloudinaryUploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }

  // cloudinary is treated as a webpack external — available at Node.js runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cloudinaryModule = await import('cloudinary' as any);
  const cld = cloudinaryModule.v2 ?? cloudinaryModule.default?.v2;

  cld.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const transform = params.transformation
    ? CLOUDINARY_TRANSFORMS[params.transformation]
    : undefined;

  const fileData =
    typeof params.file === 'string'
      ? params.file
      : `data:image/jpeg;base64,${params.file.toString('base64')}`;

  const result = await cld.uploader.upload(fileData, {
    folder: params.folder,
    public_id: params.publicId,
    transformation: transform,
    tags: params.tags,
    overwrite: true,
    invalidate: true,
  });

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
  };
}
