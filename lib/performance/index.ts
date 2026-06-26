/**
 * Performance Architecture — Wild Peak Souls
 *
 * Dynamic import helpers, lazy-loading wrappers, and optimization utilities.
 * Following Next.js 13+ best practices for code splitting and performance.
 */

import dynamic from 'next/dynamic';

// ─── Dynamic import factory ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDynamicComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importFn: () => Promise<any>,
  options: Parameters<typeof dynamic>[1] = {},
) {
  return dynamic(importFn, {
    ssr: false,
    ...options,
  });
}

// ─── Intersection Observer lazy loading ──────────────────────────

export const INTERSECTION_OPTIONS: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '100px 0px',
};

// ─── Next.js Image optimization config ───────────────────────────

export const IMAGE_OPTIMIZATION = {
  // Responsive sizes string for srcset generation
  sizes: {
    full: '100vw',
    half: '(max-width: 768px) 100vw, 50vw',
    third: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quarter: '(max-width: 768px) 50vw, 25vw',
    avatar: '(max-width: 768px) 64px, 96px',
  },

  // Quality presets
  quality: {
    thumbnail: 70,
    default: 85,
    hero: 90,
  },

  // Allowed external domains for Next.js Image
  domains: [
    'images.pexels.com',
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
  ],
} as const;
