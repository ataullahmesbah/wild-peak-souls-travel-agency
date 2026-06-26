# Wild Peak Souls

> Premium travel, adventure, trekking, hiking, camping, expedition and tourism platform.

## Overview

Wild Peak Souls is an enterprise-level adventure travel platform built with Next.js 15, TypeScript, and a modern technology stack. It enables users to discover destinations, book guided tours, explore trekking packages, read travel blogs, manage bookings, and communicate with guides.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | ShadCN UI + Radix UI |
| Icons | Lucide React |
| Theme | next-themes (dark/light mode) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma (Phase 2) |
| Auth | NextAuth (Phase 2) |
| Image Storage | Cloudinary (Phase 2) |
| Payments | Stripe, PayPal, SSLCommerz (Phase 2) |

## Project Structure

```
wild-peak-souls/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles + brand color system
│   ├── layout.tsx           # Root layout (fonts, theme, navbar, footer)
│   ├── page.tsx             # Landing page
│   ├── metadata.ts          # SEO metadata configuration
│   ├── robots.ts            # SEO robots config
│   └── sitemap.ts           # SEO sitemap config
├── components/
│   ├── layout/              # Layout components (navbar, footer, section, etc.)
│   ├── providers/           # Theme provider & toggle
│   └── ui/                  # ShadCN UI primitives
├── config/
│   ├── site.ts              # Site configuration (name, URL, contact, SEO)
│   ├── navigation.ts        # Navigation items (navbar, footer)
│   └── env.ts               # Typed environment variable access
├── lib/
│   ├── roles/               # Role architecture (permissions, hierarchy, access control)
│   ├── services/            # Service layer (API client, domain service interfaces)
│   └── utils.ts             # Utility functions
├── middleware.ts             # Route protection & role-based access control
├── .env.example             # Environment variable template
├── tailwind.config.ts       # Tailwind theme (brand colors, animations)
└── package.json
```

## Brand Color System

| Color | Usage | CSS Variable |
|-------|-------|-------------|
| Mountain Green | Primary brand | `--mountain-*` |
| Forest Green | Secondary brand | `--forest-*` |
| Deep Blue | Accent / Ocean | `--ocean-*` |
| White | Light backgrounds | `--background` |
| Black | Dark backgrounds | `--background` (dark) |

Each brand color has a full 50–900 ramp for both light and dark modes.

## Role Architecture

| Role | Level | Access |
|------|-------|--------|
| Guest | 0 | Public content only |
| Customer | 1 | Book tours, manage bookings, message guides |
| Travel Guide | 2 | Manage tours, bookings, communicate with customers |
| Moderator | 3 | Review and moderate user-generated content |
| Admin | 4 | Full platform management (except system config) |
| Super Admin | 5 | Complete platform control |

See `lib/roles/index.ts` for the full permission matrix and route access logic.

## Service Layer

The service layer defines typed interfaces for all domain operations:

- `destinations.service.ts` — Destination CRUD & search
- `tours.service.ts` — Tour CRUD, filtering, search
- `bookings.service.ts` — Booking lifecycle management
- `blog.service.ts` — Blog post CRUD & search
- `users.service.ts` — User profiles & guide management
- `payments.service.ts` — Multi-provider payment interface (Stripe, PayPal, SSLCommerz)

All services use a shared `apiClient` for HTTP communication and return standardized `ServiceResult<T>` responses.

## Middleware

Route protection is configured in `middleware.ts` with role-based access control. Protected route patterns:

- `/dashboard/*` — Requires `customer` role minimum
- `/dashboard/guide/*` — Requires `guide` role minimum
- `/dashboard/moderator/*` — Requires `moderator` role minimum
- `/dashboard/admin/*` — Requires `admin` role minimum
- `/dashboard/super-admin/*` — Requires `super_admin` role
- `/bookings/*`, `/messages/*`, `/profile/*` — Requires `customer` role minimum

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in the required values (database, auth, cloudinary, payments)
3. Payment variables are optional in Phase 1 — they're scaffolded for Phase 2

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm run typecheck # Type checking
```

## Phase Status

### Phase 1 (Complete)
- Project architecture & folder structure
- Next.js, TypeScript, Tailwind CSS, ShadCN UI configuration
- Responsive root layout with fonts
- Responsive navbar with mobile menu
- Responsive footer with newsletter & social links
- Dark/light theme system
- Reusable UI component structure (Section, Container, PageHeader, SectionHeading)
- SEO foundation (metadata, sitemap, robots)
- Environment configuration structure
- Service layer architecture (typed interfaces for all domains)
- Middleware with role-based route protection scaffolding
- Role architecture (6 roles, permission matrix, hierarchy)
- Project documentation

### Phase 2 (Next)
- Authentication (NextAuth with email/password)
- Database schema & Prisma ORM setup
- Destinations CRUD & pages
- Tours CRUD & pages
- Booking system
- Blog system
- User dashboards (role-based)
- Guide communication / messaging
- Notifications
- Admin CMS
- Payment integration (Stripe, PayPal, SSLCommerz)
- Cloudinary image upload

## License

Proprietary — Wild Peak Souls
