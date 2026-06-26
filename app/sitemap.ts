import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/destinations', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/tours', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/trekking', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
