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

export { paymentManager, defaultPaymentSettings } from '@/lib/payment/payment-manager';
export type { PaymentProvider, PaymentIntent, PaymentSettings, RefundResult } from '@/lib/payment/payment-provider';
export { transactionService } from '@/lib/payment/transaction-service';
export { refundService } from '@/lib/payment/refund-service';
export { invoiceService } from '@/lib/invoice/invoice-service';
export type { InvoiceData } from '@/lib/invoice/invoice-service';

export { notificationService } from '@/lib/services/notification.service';
export type { NotificationInput, NotificationType, NotificationChannel, NotificationRecord } from '@/lib/services/notification.service';

export type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
