import {
  Compass,
  Map,
  Mountain,
  Tent,
  BookOpen,
  Phone,
  Calendar,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  badge?: string;
}

export const mainNav: NavItem[] = [
  { title: 'Destinations', href: '/destinations', icon: Map, description: 'Discover breathtaking places' },
  { title: 'Tours', href: '/tours', icon: Compass, description: 'Guided travel experiences' },
  { title: 'Events', href: '/events', icon: Calendar, description: 'Upcoming adventures & treks' },
  { title: 'Trekking', href: '/trekking', icon: Mountain, description: 'Mountain expeditions & trails' },
  { title: 'Camping', href: '/camping', icon: Tent, description: 'Outdoor camping adventures' },
  { title: 'Blog', href: '/blog', icon: BookOpen, description: 'Travel stories & guides' },
  { title: 'Contact', href: '/contact', icon: Phone, description: 'Get in touch' },
];

export const dashboardNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export const footerNav = {
  explore: {
    title: 'Explore',
    links: [
      { title: 'Destinations', href: '/destinations' },
      { title: 'Tours', href: '/tours' },
      { title: 'Trekking', href: '/trekking' },
      { title: 'Camping', href: '/camping' },
      { title: 'Expeditions', href: '/expeditions' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'Our Guides', href: '/guides' },
      { title: 'Careers', href: '/careers' },
      { title: 'Press', href: '/press' },
      { title: 'Partners', href: '/partners' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { title: 'Help Center', href: '/help' },
      { title: 'Contact Us', href: '/contact' },
      { title: 'Booking Guide', href: '/booking-guide' },
      { title: 'Cancellation Policy', href: '/cancellation' },
      { title: 'FAQ', href: '/faq' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Cookie Policy', href: '/cookies' },
      { title: 'Safety Guidelines', href: '/safety' },
    ],
  },
} as const;
