// ─── Service barrel export ────────────────────────────────────────
// Import services individually for tree-shaking in production.
// This barrel is provided for convenience in server components.

export { eventService } from '@/lib/services/events.service';
export type { CreateEventInput, EventListParams, EventWithRelations } from '@/lib/services/events.service';

export { bookingService } from '@/lib/services/bookings.service';
export type { CreateBookingInput, BookingParticipantInput, BookingWithRelations } from '@/lib/services/bookings.service';

export { destinationsService, countriesService, citiesService } from '@/lib/services/destinations.service';
export type { CreateDestinationInput } from '@/lib/services/destinations.service';

export { toursService } from '@/lib/services/tours.service';
export type { CreateTourInput, TourListParams } from '@/lib/services/tours.service';

export { blogService, cmsPageService, siteSettingsService } from '@/lib/services/blog.service';
export type { CreateBlogInput } from '@/lib/services/blog.service';

export { hotDealService, specialOfferService, homepageSectionService } from '@/lib/services/cms.service';
export type { CreateHotDealInput, CreateSpecialOfferInput } from '@/lib/services/cms.service';

export type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
