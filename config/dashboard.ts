import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Mountain,
  Globe,
  BookOpen,
  Star,
  HelpCircle,
  Image,
  Film,
  Flame,
  Tag,
  Bell,
  BarChart3,
  Users,
  UserCheck,
  Settings,
  Shield,
  FileText,
  Search,
  MessageSquare,
  Ticket,
  Folder,
  Flag,
  Activity,
  Lock,
  Database,
  Cpu,
  Server,
  Trash2,
  ToggleLeft,
  Cloud,
  Wrench,
  Layers,
  Navigation,
  Compass,
  Home,
  Briefcase,
  CreditCard,
  Package,
  Archive,
  Eye,
  ChevronRight,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  children?: DashboardNavItem[];
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_PATHS = {
  customer: "/dashboard",
  guide: "/dashboard/guide",
  moderator: "/dashboard/moderator",
  admin: "/dashboard/admin",
  superAdmin: "/dashboard/super-admin",
};

export const adminNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
        description: "Admin overview and analytics",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Bookings",
        href: "/dashboard/admin/bookings",
        icon: Calendar,
        description: "Manage tour and event bookings",
      },
      {
        title: "Events",
        href: "/dashboard/admin/events",
        icon: Flame,
        description: "Manage events and schedules",
      },
      {
        title: "Tours",
        href: "/dashboard/admin/tours",
        icon: Mountain,
        description: "Manage tour packages",
      },
      {
        title: "Destinations",
        href: "/dashboard/admin/destinations",
        icon: MapPin,
        description: "Manage travel destinations",
      },
      {
        title: "Countries",
        href: "/dashboard/admin/countries",
        icon: Globe,
        description: "Manage countries",
      },
      {
        title: "Cities",
        href: "/dashboard/admin/cities",
        icon: Navigation,
        description: "Manage cities",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Blogs",
        href: "/dashboard/admin/blogs",
        icon: BookOpen,
        description: "Manage blog posts",
      },
      {
        title: "Categories",
        href: "/dashboard/admin/categories",
        icon: Layers,
        description: "Manage content categories",
      },
      {
        title: "Reviews",
        href: "/dashboard/admin/reviews",
        icon: Star,
        description: "Manage customer reviews",
      },
      {
        title: "FAQs",
        href: "/dashboard/admin/faqs",
        icon: HelpCircle,
        description: "Manage frequently asked questions",
      },
      {
        title: "Gallery",
        href: "/dashboard/admin/gallery",
        icon: Image,
        description: "Manage photo galleries",
      },
      {
        title: "Media Library",
        href: "/dashboard/admin/media",
        icon: Film,
        description: "Manage media files",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Hot Deals",
        href: "/dashboard/admin/hot-deals",
        icon: Flame,
        description: "Manage hot deals",
      },
      {
        title: "Special Offers",
        href: "/dashboard/admin/special-offers",
        icon: Tag,
        description: "Manage special offers",
      },
      {
        title: "Coupons",
        href: "/dashboard/admin/coupons",
        icon: Ticket,
        description: "Manage discount coupons",
      },
      {
        title: "Homepage",
        href: "/dashboard/admin/homepage",
        icon: Home,
        description: "Manage homepage sections",
      },
      {
        title: "Notifications",
        href: "/dashboard/admin/notifications",
        icon: Bell,
        description: "Send and manage notifications",
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        title: "Users",
        href: "/dashboard/admin/users",
        icon: Users,
        description: "Manage all users",
      },
      {
        title: "Customers",
        href: "/dashboard/admin/customers",
        icon: UserCheck,
        description: "Manage customers",
      },
      {
        title: "Travel Guides",
        href: "/dashboard/admin/guides",
        icon: Compass,
        description: "Manage travel guides",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Reports",
        href: "/dashboard/admin/reports",
        icon: BarChart3,
        description: "View reports and analytics",
      },
      {
        title: "Settings",
        href: "/dashboard/admin/settings",
        icon: Settings,
        description: "System settings",
      },
    ],
  },
];

export const superAdminNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/super-admin",
        icon: LayoutDashboard,
        description: "Super admin overview",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "API Settings",
        href: "/dashboard/super-admin/api-settings",
        icon: Server,
        description: "Manage API credentials",
      },
      {
        title: "Environment",
        href: "/dashboard/super-admin/environment",
        icon: Database,
        description: "Environment configuration",
      },
      {
        title: "System Config",
        href: "/dashboard/super-admin/system-config",
        icon: Cpu,
        description: "System configuration",
      },
      {
        title: "Maintenance",
        href: "/dashboard/super-admin/maintenance",
        icon: Wrench,
        description: "Maintenance mode settings",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        title: "Roles",
        href: "/dashboard/super-admin/roles",
        icon: Shield,
        description: "Manage user roles",
      },
      {
        title: "Permissions",
        href: "/dashboard/super-admin/permissions",
        icon: Lock,
        description: "Manage permissions",
      },
      {
        title: "Admins",
        href: "/dashboard/super-admin/admins",
        icon: UserCheck,
        description: "Manage admin users",
      },
      {
        title: "Moderators",
        href: "/dashboard/super-admin/moderators",
        icon: Eye,
        description: "Manage moderators",
      },
      {
        title: "Security Center",
        href: "/dashboard/super-admin/security",
        icon: Shield,
        description: "Security settings and logs",
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Activity Logs",
        href: "/dashboard/super-admin/activity-logs",
        icon: Activity,
        description: "View activity logs",
      },
      {
        title: "Audit Logs",
        href: "/dashboard/super-admin/audit-logs",
        icon: FileText,
        description: "View audit logs",
      },
      {
        title: "System Health",
        href: "/dashboard/super-admin/health",
        icon: Activity,
        description: "System health status",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Backups",
        href: "/dashboard/super-admin/backups",
        icon: Archive,
        description: "Manage backups",
      },
      {
        title: "Cache",
        href: "/dashboard/super-admin/cache",
        icon: Cloud,
        description: "Cache management",
      },
      {
        title: "Feature Flags",
        href: "/dashboard/super-admin/feature-flags",
        icon: ToggleLeft,
        description: "Manage feature flags",
      },
    ],
  },
];

export const guideNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/guide",
        icon: LayoutDashboard,
        description: "Guide dashboard",
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        title: "My Tours",
        href: "/dashboard/guide/tours",
        icon: Mountain,
        description: "Assigned tours",
      },
      {
        title: "My Events",
        href: "/dashboard/guide/events",
        icon: Calendar,
        description: "Assigned events",
      },
      {
        title: "Bookings",
        href: "/dashboard/guide/bookings",
        icon: BookOpen,
        description: "Tour bookings",
      },
    ],
  },
  {
    title: "Profile",
    items: [
      {
        title: "Reviews",
        href: "/dashboard/guide/reviews",
        icon: Star,
        description: "Customer reviews",
      },
      {
        title: "Settings",
        href: "/dashboard/guide/settings",
        icon: Settings,
        description: "Profile settings",
      },
    ],
  },
];

export const moderatorNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/moderator",
        icon: LayoutDashboard,
        description: "Moderator dashboard",
      },
    ],
  },
  {
    title: "Moderation",
    items: [
      {
        title: "Reviews",
        href: "/dashboard/moderator/reviews",
        icon: Star,
        description: "Review moderation",
      },
      {
        title: "Blogs",
        href: "/dashboard/moderator/blogs",
        icon: BookOpen,
        description: "Blog moderation",
      },
      {
        title: "Users",
        href: "/dashboard/moderator/users",
        icon: Users,
        description: "User moderation",
      },
      {
        title: "Reports",
        href: "/dashboard/moderator/reports",
        icon: Flag,
        description: "Moderation reports",
      },
    ],
  },
];

export const customerNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "My dashboard",
      },
    ],
  },
  {
    title: "My Travel",
    items: [
      {
        title: "My Bookings",
        href: "/dashboard/bookings",
        icon: Calendar,
        description: "My bookings",
      },
      {
        title: "My Events",
        href: "/dashboard/events",
        icon: Flame,
        description: "My events",
      },
      {
        title: "My Tours",
        href: "/dashboard/tours",
        icon: Mountain,
        description: "My tours",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: UserCheck,
        description: "My profile",
      },
      {
        title: "Reviews",
        href: "/dashboard/reviews",
        icon: Star,
        description: "My reviews",
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Account settings",
      },
    ],
  },
];

export const getNavSectionsForRole = (
  role: string
): DashboardNavSection[] => {
  switch (role) {
    case "super_admin":
      return superAdminNavSections;
    case "admin":
      return adminNavSections;
    case "moderator":
      return moderatorNavSections;
    case "guide":
      return guideNavSections;
    case "customer":
    default:
      return customerNavSections;
  }
};

export const getDashboardPathForRole = (role: string): string => {
  switch (role) {
    case "super_admin":
      return DASHBOARD_PATHS.superAdmin;
    case "admin":
      return DASHBOARD_PATHS.admin;
    case "moderator":
      return DASHBOARD_PATHS.moderator;
    case "guide":
      return DASHBOARD_PATHS.guide;
    case "customer":
    default:
      return DASHBOARD_PATHS.customer;
  }
};
