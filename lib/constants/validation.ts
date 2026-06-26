/**
 * Wild Peak Souls — Content Validation Constants
 *
 * All character limits and validation rules stored centrally.
 * Import from this file — never hardcode limits in components.
 */

// ─── Content Field Limits ─────────────────────────────────────────

export const CONTENT_LIMITS = {
  // Titles
  BLOG_TITLE_MAX: 120,
  PAGE_TITLE_MAX: 100,
  TOUR_TITLE_MAX: 100,
  DESTINATION_TITLE_MAX: 100,
  EVENT_TITLE_MAX: 100,

  // SEO
  META_TITLE_MAX: 60,
  META_DESCRIPTION_MAX: 160,

  // Descriptions
  SHORT_DESCRIPTION_MAX: 300,
  LONG_DESCRIPTION_MAX: 5000,
  EXCERPT_MAX: 500,
  BIO_MAX: 1000,

  // Other fields
  IMAGE_ALT_MAX: 125,
  SLUG_MAX: 150,
  TAG_MAX_LENGTH: 30,
  TAG_MAX_COUNT: 10,

  // Comments / Reviews
  REVIEW_TITLE_MAX: 100,
  REVIEW_BODY_MAX: 2000,
  COMMENT_MAX: 1000,

  // Profile
  DISPLAY_NAME_MAX: 60,
  WEBSITE_URL_MAX: 200,
  PHONE_MAX: 20,
} as const;

// ─── Authentication Validation ─────────────────────────────────────

export const AUTH_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  // At least: 1 uppercase, 1 lowercase, 1 digit, 1 special char
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  NAME_MIN: 1,
  NAME_MAX: 50,
  EMAIL_MAX: 255,
} as const;

// ─── Image Rules ──────────────────────────────────────────────────

export const IMAGE_RULES = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,

  // Max file sizes in bytes
  MAX_SIZE_DEFAULT: 5 * 1024 * 1024,     // 5 MB
  MAX_SIZE_AVATAR: 2 * 1024 * 1024,      // 2 MB
  MAX_SIZE_HERO: 8 * 1024 * 1024,        // 8 MB (super admin / admin)

  // Recommended dimensions (width x height in pixels)
  SIZES: {
    HERO_BANNER:       { width: 1920, height: 1080 },
    DESTINATION_COVER: { width: 1600, height: 900 },
    BLOG_COVER:        { width: 1200, height: 630 },
    GALLERY:           { width: 1200, height: 800 },
    TOUR_COVER:        { width: 1200, height: 800 },
    EVENT_COVER:       { width: 1200, height: 630 },
    PROFILE_AVATAR:    { width: 500,  height: 500 },
    THUMBNAIL:         { width: 400,  height: 300 },
    OG_IMAGE:          { width: 1200, height: 630 },
  },

  // Upload limits by role
  ROLE_LIMITS: {
    CUSTOMER:    { maxSizeBytes: 2 * 1024 * 1024, maxFiles: 5 },
    GUIDE:       { maxSizeBytes: 5 * 1024 * 1024, maxFiles: 20 },
    MODERATOR:   { maxSizeBytes: 5 * 1024 * 1024, maxFiles: 50 },
    ADMIN:       { maxSizeBytes: 5 * 1024 * 1024, maxFiles: 100 },
    SUPER_ADMIN: { maxSizeBytes: 8 * 1024 * 1024, maxFiles: 500 },
  },
} as const;

// ─── Pagination ───────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// ─── API Security ─────────────────────────────────────────────────

export const API_SECURITY = {
  SUPER_ADMIN_ONLY_ROUTES: [
    '/api/admin/api-credentials',
    '/api/admin/system-config',
    '/api/admin/security',
    '/api/admin/integrations',
    '/api/admin/permissions',
  ],
  RATE_LIMITS: {
    AUTH_MAX: 5,
    AUTH_WINDOW_MS: 15 * 60 * 1000,      // 15 minutes
    REGISTER_MAX: 3,
    REGISTER_WINDOW_MS: 60 * 60 * 1000,  // 1 hour
    API_MAX: 100,
    API_WINDOW_MS: 15 * 60 * 1000,
    UPLOAD_MAX: 20,
    UPLOAD_WINDOW_MS: 60 * 60 * 1000,
  },
} as const;

// ─── Phase 3 — Event & CMS Validation ────────────────────────────

export const EVENT_VALIDATION = {
  TITLE_MAX: 120,
  SLUG_MAX: 150,
  SHORT_DESCRIPTION_MAX: 300,
  OVERVIEW_MAX: 10000,
  SCHEDULE_DESCRIPTION_MAX: 2000,
  ITINERARY_DESCRIPTION_MAX: 3000,
  ACCOMMODATION_DESCRIPTION_MAX: 1000,
  MEAL_DESCRIPTION_MAX: 500,
  TERMS_MAX: 10000,
  POLICY_MAX: 5000,
  MAX_GALLERY_IMAGES: 30,
  MAX_SCHEDULE_DAYS: 60,
  MAX_INCLUDED_ITEMS: 50,
  MAX_EXCLUDED_ITEMS: 50,
  MIN_PRICE: 0,
  MAX_PRICE: 1_000_000,
  MIN_SEATS: 1,
  MAX_SEATS: 10_000,
  GOOGLE_MAP_URL_MAX: 500,
  MEETING_POINT_MAX: 300,
} as const;

export const DEAL_VALIDATION = {
  TITLE_MAX: 120,
  SUBTITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  SLUG_MAX: 150,
  CTA_TEXT_MAX: 50,
  CTA_URL_MAX: 500,
  BADGE_TEXT_MAX: 30,
  MIN_DISCOUNT_PERCENT: 0,
  MAX_DISCOUNT_PERCENT: 100,
} as const;

export const BOOKING_VALIDATION = {
  SPECIAL_REQUESTS_MAX: 1000,
  INTERNAL_NOTES_MAX: 2000,
  MIN_ADULT_COUNT: 1,
  MAX_PARTICIPANTS: 100,
  PARTICIPANT_NAME_MAX: 100,
  PASSPORT_NO_MAX: 20,
  DIETARY_NEEDS_MAX: 200,
  MEDICAL_INFO_MAX: 500,
} as const;

export const REVIEW_VALIDATION = {
  TITLE_MAX: 120,
  BODY_MAX: 2000,
  MIN_RATING: 1,
  MAX_RATING: 5,
} as const;

export const BLOG_VALIDATION = {
  TITLE_MAX: 120,
  EXCERPT_MAX: 500,
  CONTENT_MAX: 50000,
  TAG_MAX_COUNT: 10,
  TAG_MAX_LENGTH: 30,
  READ_TIME_MIN: 1,
  READ_TIME_MAX: 120,
} as const;

// ─── Booking Reference ────────────────────────────────────────────

export const BOOKING_REF_PREFIX = 'WPS' as const;
export const INVOICE_REF_PREFIX = 'INV' as const;

// ─── Supported Currencies ─────────────────────────────────────────

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// ─── Event Types (display labels) ────────────────────────────────

export const EVENT_TYPE_LABELS: Record<string, string> = {
  SINGLE_DAY: 'Single Day',
  MULTI_DAY: 'Multi Day',
  TREKKING: 'Trekking',
  CAMPING: 'Camping',
  ADVENTURE: 'Adventure',
  EXPEDITION: 'Expedition',
  CULTURAL: 'Cultural',
  WILDLIFE: 'Wildlife',
  PHOTOGRAPHY: 'Photography',
  CUSTOM: 'Custom',
} as const;

// ─── Difficulty Labels ────────────────────────────────────────────

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  CHALLENGING: 'Challenging',
  DIFFICULT: 'Difficult',
  EXTREME: 'Extreme',
} as const;

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-green-600',
  MODERATE: 'text-yellow-600',
  CHALLENGING: 'text-orange-600',
  DIFFICULT: 'text-red-600',
  EXTREME: 'text-red-900',
} as const;

