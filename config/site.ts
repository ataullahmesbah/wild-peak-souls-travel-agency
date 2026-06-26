export const siteConfig = {
  name: 'Wild Peak Souls',
  shortName: 'Wild Peak',
  description:
    'Premium travel, adventure, trekking, hiking, camping, expedition and tourism platform. Discover breathtaking destinations, book guided tours, and embark on unforgettable journeys.',
  url: 'https://wildpeaksouls.com',
  ogImage: 'https://wildpeaksouls.com/og-image.png',
  links: {
    twitter: 'https://twitter.com/wildpeaksouls',
    instagram: 'https://instagram.com/wildpeaksouls',
    facebook: 'https://facebook.com/wildpeaksouls',
    youtube: 'https://youtube.com/@wildpeaksouls',
    linkedin: 'https://linkedin.com/company/wildpeaksouls',
  },
  contact: {
    email: 'hello@wildpeaksouls.com',
    phone: '+1 (555) 123-4567',
    address: 'Adventure Base, Mountain View, CA 94040',
  },
  keywords: [
    'adventure travel',
    'trekking',
    'hiking',
    'camping',
    'expeditions',
    'tourism',
    'mountain climbing',
    'outdoor adventure',
    'travel packages',
    'guided tours',
  ],
} as const;

export type SiteConfig = typeof siteConfig;
