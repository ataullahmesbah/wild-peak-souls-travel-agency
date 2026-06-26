/**
 * Cloudinary Upload Service — Architecture & Validation Layer
 *
 * This file contains: upload configuration, transformation presets,
 * folder definitions, and file validation utilities.
 *
 * The actual Cloudinary API calls are isolated in cloudinary-client.ts
 * which is excluded from webpack bundling via next.config.js.
 *
 * Credentials are NEVER exposed to the client.
 */

import { IMAGE_RULES } from '@/lib/constants/validation';
import type { UserRole } from '@/lib/roles';

// ─── Cloudinary folders by content type ──────────────────────────

export const CLOUDINARY_FOLDERS = {
  AVATARS: 'wild-peak-souls/avatars',
  DESTINATIONS: 'wild-peak-souls/destinations',
  TOURS: 'wild-peak-souls/tours',
  BLOGS: 'wild-peak-souls/blogs',
  EVENTS: 'wild-peak-souls/events',
  GALLERY: 'wild-peak-souls/gallery',
  HERO_BANNERS: 'wild-peak-souls/hero',
  TEMP: 'wild-peak-souls/temp',
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

// ─── Transformation presets ───────────────────────────────────────

export const CLOUDINARY_TRANSFORMS = {
  avatar: 'c_fill,g_face,h_500,w_500,q_auto,f_auto',
  thumbnail: 'c_fill,h_300,w_400,q_auto,f_auto',
  destinationCover: 'c_fill,h_900,w_1600,q_auto,f_auto',
  blogCover: 'c_fill,h_630,w_1200,q_auto,f_auto',
  tourCover: 'c_fill,h_800,w_1200,q_auto,f_auto',
  heroBanner: 'c_fill,h_1080,w_1920,q_auto,f_auto',
  gallery: 'c_fill,h_800,w_1200,q_auto,f_auto',
  ogImage: 'c_fill,h_630,w_1200,q_auto,f_auto',
} as const;

export type TransformPreset = keyof typeof CLOUDINARY_TRANSFORMS;

// ─── Upload validation ────────────────────────────────────────────

export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUpload(
  file: { size: number; type: string; name: string },
  role: UserRole,
): UploadValidationResult {
  const errors: string[] = [];
  const prismaRole = role.toUpperCase() as keyof typeof IMAGE_RULES.ROLE_LIMITS;
  const limits = IMAGE_RULES.ROLE_LIMITS[prismaRole] ?? IMAGE_RULES.ROLE_LIMITS.CUSTOMER;

  if (!IMAGE_RULES.ALLOWED_TYPES.includes(file.type as never)) {
    errors.push(`File type "${file.type}" is not allowed. Accepted types: JPG, PNG, WEBP.`);
  }

  if (file.size > limits.maxSizeBytes) {
    const maxMB = Math.round(limits.maxSizeBytes / (1024 * 1024));
    errors.push(`File size exceeds the ${maxMB}MB limit for your role.`);
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!IMAGE_RULES.ALLOWED_EXTENSIONS.includes(ext as never)) {
    errors.push(`File extension "${ext}" is not allowed.`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Client-side URL builder (no credentials needed) ─────────────

export function buildCloudinaryUrl(
  publicId: string,
  transform?: TransformPreset,
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return '';

  const transformStr = transform ? `/${CLOUDINARY_TRANSFORMS[transform]}` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload${transformStr}/${publicId}`;
}

// ─── Upload interface (implemented in cloudinary-client.ts) ──────

export interface CloudinaryUploadParams {
  file: Buffer | string;
  folder: CloudinaryFolder;
  publicId?: string;
  transformation?: TransformPreset;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
}
