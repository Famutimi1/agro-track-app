bash

cat > /tmp/agrotrack_plan.md << 'MDEOF'
# AgroTrack — Complete Technical Architecture & Product Plan

**Version:** 1.0  
**Date:** June 2025  
**Author:** Engineering Team  
**Stack:** React · Node.js · PostgreSQL · Prisma · JWT · Redis · AWS

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema](#6-database-schema)
7. [API Design](#7-api-design)
8. [Authentication & Security](#8-authentication--security)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [File & Storage Architecture](#10-file--storage-architecture)
11. [Real-Time & Notifications](#11-real-time--notifications)
12. [USSD & WhatsApp Integration](#12-ussd--whatsapp-integration)
13. [FarmScore Engine](#13-farmscore-engine)
14. [Geospatial Layer](#14-geospatial-layer)
15. [DevOps & Deployment](#15-devops--deployment)
16. [Environment Variables](#16-environment-variables)
17. [Project Directory Structure](#17-project-directory-structure)
18. [Development Roadmap](#18-development-roadmap)
19. [Testing Strategy](#19-testing-strategy)
20. [Performance & Scalability](#20-performance--scalability)

---

## 1. Executive Summary

AgroTrack is a multi-sided SaaS platform for agricultural loan and grant lifecycle management. It connects **Lenders** (government agencies, banks, NGOs) with **Borrowers** (smallholder farmers, cooperatives) through a verified **Field Agent** network, with full disbursement accountability, credit scoring, and geospatial visibility.

### Core Problem
Billions of naira in Nigerian agricultural loans go untracked, diverted, or wasted. Genuine farmers cannot access available funding. Lenders have zero visibility into how money is used after disbursement.

### Solution
A platform that enforces layered disbursement tied to verified farm activity, builds portable agricultural credit identities (FarmScore), and connects all three sides of the market in one accountable system.

### Business Model
- SaaS subscriptions (Starter ₦250K/mo · Growth ₦750K/mo · Enterprise custom)
- Transaction fees (0.5–1.5% per disbursement)
- FarmScore API queries (₦500–₦2,000 per query)
- White-label licensing (₦5M–₦50M setup)

---

## 2. Product Overview

### Interfaces Built
| Interface | File | Description |
|---|---|---|
| Lender Dashboard | `agrotrack-full.jsx` | 11-page web app for lenders |
| Public Website | `agrotrack-landing-borrower.jsx` | Landing + 5 public pages |
| Borrower Web Portal | `agrotrack-landing-borrower.jsx` | Web dashboard for farmers |
| Auth Flows | `agrotrack-landing-borrower.jsx` | Login, signup, 2FA, onboarding |
| Farmer Mobile App | `agrotrack-borrower-app.jsx` | 8-screen mobile app |
| Super Admin Console | `agrotrack-admin.jsx` | Internal ops dashboard |

### Core Feature Modules
| Module | Description |
|---|---|
| Loan Program Management | Create, publish, manage loan/grant programs |
| Borrower Registration & KYC | BVN/NIN verify, GPS farm mapping, photo upload |
| Layered Disbursement | Tranche-based release tied to farm activity proof |
| Field Agent Network | On-ground registration, verification, monitoring |
| FarmScore Engine | Proprietary 0–850 agricultural credit score |
| Cooperative Management | Group loans, collective scoring, member tracking |
| Geospatial Map | Real-time borrower location, heat maps, overlays |
| USSD Integration | *737*99# feature phone access |
| WhatsApp Bot | Registration, updates, repayment via WhatsApp |
| Repayment Tracking | Multi-channel payments, streaks, overdue alerts |
| Reports & Analytics | Portfolio performance, impact, compliance exports |
| Super Admin Console | Platform-wide ops, feature flags, system health |

---

## 3. User Roles & Permissions

### Role Hierarchy

```
SuperAdmin (AgroTrack internal)
  └── LenderAdmin (Organisation owner)
        ├── LenderManager (Program manager)
        ├── LenderAnalyst (Read-only analytics)
        └── FieldSupervisor (Manages field agents)
              └── FieldAgent (Ground-level registration)
Borrower (Individual farmer)
CoopChair (Cooperative chairperson)
CoopMember (Cooperative member)
```

### Permission Matrix

| Permission | SuperAdmin | LenderAdmin | LenderManager | LenderAnalyst | FieldSupervisor | FieldAgent | Borrower |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Create loan programs | ✓ | ✓ | ✓ | — | — | — | — |
| Approve disbursements | ✓ | ✓ | ✓ | — | — | — | — |
| View all borrowers | ✓ | ✓ | ✓ | ✓ | ✓ | own zone | own |
| Register farmers | ✓ | — | — | — | ✓ | ✓ | — |
| Verify farms (GPS) | ✓ | — | — | — | ✓ | ✓ | — |
| Submit farm reports | — | — | — | — | — | ✓ | ✓ |
| Make repayments | — | — | — | — | — | — | ✓ |
| View FarmScore | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | own |
| Manage feature flags | ✓ | — | — | — | — | — | — |
| Access billing | ✓ | ✓ | — | — | — | — | — |
| Export audit trail | ✓ | ✓ | ✓ | ✓ | — | — | — |

---

## 4. Frontend Architecture

### Tech Stack

```
Framework:        React 18 + TypeScript
Routing:          React Router v6
State:            Zustand (global) + React Query (server state)
Styling:          Tailwind CSS + CSS-in-JS (inline styles for components)
Charts:           Recharts
Maps:             Mapbox GL JS
File Uploads:     React Dropzone + Axios multipart
Forms:            React Hook Form + Zod validation
PWA:              Vite PWA plugin (offline support)
Testing:          Vitest + React Testing Library + Playwright (E2E)
Build:            Vite
Deployment:       Vercel (frontend) / CloudFront (static assets)
```

### Frontend Directory Structure

```
agrotrack-frontend/
├── public/
│   ├── icons/                    # PWA icons
│   └── manifest.json             # PWA manifest
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component + router
│   │
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Base design system
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ScoreRing.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── index.ts
│   │   ├── layout/               # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── charts/               # Recharts wrappers
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── AreaChart.tsx
│   │   └── shared/               # Cross-feature components
│   │       ├── FarmScoreRing.tsx
│   │       ├── StatusPill.tsx
│   │       ├── FileUpload.tsx
│   │       ├── GPSCapture.tsx
│   │       ├── OTPInput.tsx
│   │       └── StepWizard.tsx
│   │
│   ├── features/                 # Feature modules (one per domain)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LenderLogin.tsx
│   │   │   │   ├── LenderSignup.tsx
│   │   │   │   ├── BorrowerRegister.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   └── TwoFactorAuth.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── AtRiskTable.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardData.ts
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── programs/
│   │   │   ├── components/
│   │   │   │   ├── ProgramCard.tsx
│   │   │   │   └── CreateProgramModal.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePrograms.ts
│   │   │   └── LoanProgramsPage.tsx
│   │   │
│   │   ├── borrowers/
│   │   │   ├── components/
│   │   │   │   ├── BorrowerTable.tsx
│   │   │   │   ├── BorrowerProfile.tsx
│   │   │   │   └── FarmReportTimeline.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useBorrowers.ts
│   │   │   └── BorrowersPage.tsx
│   │   │
│   │   ├── disbursements/
│   │   ├── repayments/
│   │   ├── field-agents/
│   │   ├── cooperatives/
│   │   ├── reports/
│   │   ├── map-view/
│   │   ├── messages/
│   │   └── settings/
│   │
│   ├── pages/                    # Top-level route pages
│   │   ├── landing/              # Public marketing pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── FeaturesPage.tsx
│   │   │   ├── HowItWorksPage.tsx
│   │   │   ├── PricingPage.tsx
│   │   │   ├── TestimonialsPage.tsx
│   │   │   └── ContactPage.tsx
│   │   ├── lender/               # Lender dashboard pages
│   │   ├── borrower/             # Borrower portal pages
│   │   └── admin/                # Super admin pages
│   │
│   ├── hooks/                    # Global hooks
│   │   ├── useTheme.ts           # Dark/light mode
│   │   ├── useDebounce.ts
│   │   ├── useGeolocation.ts
│   │   ├── useWebSocket.ts       # Real-time updates
│   │   └── useOffline.ts         # PWA offline detection
│   │
│   ├── services/                 # API client layer
│   │   ├── api.ts                # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── programs.service.ts
│   │   ├── borrowers.service.ts
│   │   ├── disbursements.service.ts
│   │   ├── farmscore.service.ts
│   │   └── uploads.service.ts
│   │
│   ├── store/                    # Zustand global state
│   │   ├── authStore.ts          # User session, token
│   │   ├── themeStore.ts         # Dark mode preference
│   │   ├── notificationStore.ts  # Bell notifications
│   │   └── uiStore.ts            # Sidebar open, modals
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── validateNIN.ts
│   │   ├── validateBVN.ts
│   │   ├── calcFarmScore.ts
│   │   └── geoUtils.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── program.types.ts
│   │   ├── borrower.types.ts
│   │   ├── agent.types.ts
│   │   ├── cooperative.types.ts
│   │   └── api.types.ts
│   │
│   ├── constants/                # App-wide constants
│   │   ├── routes.ts
│   │   ├── roles.ts
│   │   ├── nigerianStates.ts
│   │   └── cropTypes.ts
│   │
│   └── config/
│       ├── env.ts                # Environment variable access
│       └── queryClient.ts        # React Query config
│
├── .env.local
├── .env.production
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Key Frontend Patterns

#### API Layer (services/api.ts)
```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await useAuthStore.getState().refreshToken();
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);
```

#### React Query Pattern
```typescript
// hooks/useBorrowers.ts
export const useBorrowers = (filters: BorrowerFilters) => {
  return useQuery({
    queryKey: ['borrowers', filters],
    queryFn: () => borrowersService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateBorrower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: borrowersService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['borrowers'] }),
  });
};
```

---

## 5. Backend Architecture

### Tech Stack

```
Runtime:          Node.js 20 LTS
Framework:        Express.js 5
Language:         TypeScript
ORM:              Prisma 5
Database:         PostgreSQL 16
Cache:            Redis 7
Auth:             JWT (access + refresh tokens) + bcrypt
File Storage:     AWS S3
Email:            SendGrid
SMS:              Termii (Nigerian) + Twilio (fallback)
WhatsApp:         WhatsApp Business Cloud API (Meta)
USSD:             Africa's Talking (Nigerian USSD gateway)
Payments:         Paystack + Flutterwave
Maps:             Google Maps Geocoding API
Identity:         NIBSS BVN API + NIMC NIN API
Queue:            Bull (Redis-backed job queue)
WebSocket:        Socket.IO
Monitoring:       Sentry + Datadog
Logging:          Winston + Morgan
Testing:          Jest + Supertest
```

### Backend Directory Structure

```
agrotrack-backend/
├── prisma/
│   ├── schema.prisma             # Full database schema
│   ├── migrations/               # Auto-generated migrations
│   └── seed.ts                   # Development seed data
│
├── src/
│   ├── server.ts                 # Express app bootstrap
│   ├── app.ts                    # App config, middleware, routes
│   │
│   ├── config/
│   │   ├── database.ts           # Prisma client singleton
│   │   ├── redis.ts              # Redis client
│   │   ├── s3.ts                 # AWS S3 client
│   │   ├── sendgrid.ts           # Email client
│   │   ├── termii.ts             # SMS client
│   │   ├── whatsapp.ts           # WhatsApp Business API
│   │   ├── paystack.ts           # Paystack client
│   │   ├── socket.ts             # Socket.IO server
│   │   └── env.ts                # Validated env vars (zod)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verify + attach user
│   │   ├── role.middleware.ts     # RBAC permission check
│   │   ├── rateLimiter.ts         # Per-route rate limiting
│   │   ├── upload.middleware.ts   # Multer S3 config
│   │   ├── validate.middleware.ts # Zod schema validation
│   │   ├── audit.middleware.ts    # Auto-log all mutations
│   │   └── errorHandler.ts       # Global error handler
│   │
│   ├── modules/                  # Domain modules
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts    # Zod validation schemas
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.router.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.schema.ts
│   │   │   └── users.types.ts
│   │   │
│   │   ├── lenders/
│   │   │   ├── lenders.router.ts
│   │   │   ├── lenders.controller.ts
│   │   │   ├── lenders.service.ts
│   │   │   ├── lenders.schema.ts
│   │   │   └── lenders.types.ts
│   │   │
│   │   ├── programs/
│   │   │   ├── programs.router.ts
│   │   │   ├── programs.controller.ts
│   │   │   ├── programs.service.ts
│   │   │   ├── programs.schema.ts
│   │   │   └── programs.types.ts
│   │   │
│   │   ├── borrowers/
│   │   │   ├── borrowers.router.ts
│   │   │   ├── borrowers.controller.ts
│   │   │   ├── borrowers.service.ts
│   │   │   ├── borrowers.schema.ts
│   │   │   └── borrowers.types.ts
│   │   │
│   │   ├── applications/
│   │   │   ├── applications.router.ts
│   │   │   ├── applications.controller.ts
│   │   │   ├── applications.service.ts
│   │   │   └── applications.schema.ts
│   │   │
│   │   ├── disbursements/
│   │   │   ├── disbursements.router.ts
│   │   │   ├── disbursements.controller.ts
│   │   │   ├── disbursements.service.ts
│   │   │   └── disbursements.schema.ts
│   │   │
│   │   ├── repayments/
│   │   │   ├── repayments.router.ts
│   │   │   ├── repayments.controller.ts
│   │   │   ├── repayments.service.ts
│   │   │   └── repayments.schema.ts
│   │   │
│   │   ├── farm-reports/
│   │   │   ├── farm-reports.router.ts
│   │   │   ├── farm-reports.controller.ts
│   │   │   ├── farm-reports.service.ts
│   │   │   └── farm-reports.schema.ts
│   │   │
│   │   ├── field-agents/
│   │   │   ├── field-agents.router.ts
│   │   │   ├── field-agents.controller.ts
│   │   │   ├── field-agents.service.ts
│   │   │   └── field-agents.schema.ts
│   │   │
│   │   ├── cooperatives/
│   │   │   ├── cooperatives.router.ts
│   │   │   ├── cooperatives.controller.ts
│   │   │   ├── cooperatives.service.ts
│   │   │   └── cooperatives.schema.ts
│   │   │
│   │   ├── messages/
│   │   │   ├── messages.router.ts
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   └── messages.schema.ts
│   │   │
│   │   ├── farmscore/
│   │   │   ├── farmscore.router.ts
│   │   │   ├── farmscore.controller.ts
│   │   │   ├── farmscore.engine.ts   # Core scoring algorithm
│   │   │   ├── farmscore.service.ts
│   │   │   └── farmscore.types.ts
│   │   │
│   │   ├── ussd/
│   │   │   ├── ussd.router.ts
│   │   │   ├── ussd.controller.ts
│   │   │   ├── ussd.service.ts
│   │   │   └── ussd.sessions.ts      # In-memory USSD state
│   │   │
│   │   ├── whatsapp/
│   │   │   ├── whatsapp.router.ts
│   │   │   ├── whatsapp.controller.ts
│   │   │   └── whatsapp.service.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.router.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── payments.webhook.ts   # Paystack webhook handler
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.templates.ts
│   │   │
│   │   ├── uploads/
│   │   │   ├── uploads.router.ts
│   │   │   ├── uploads.controller.ts
│   │   │   └── uploads.service.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── reports.router.ts
│   │   │   ├── reports.controller.ts
│   │   │   └── reports.service.ts    # PDF generation
│   │   │
│   │   └── admin/
│   │       ├── admin.router.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── feature-flags.service.ts
│   │
│   ├── jobs/                     # Bull queue workers
│   │   ├── queue.ts              # Bull queue setup
│   │   ├── workers/
│   │   │   ├── farmscore.worker.ts   # Recalculate scores
│   │   │   ├── repayment.worker.ts   # Overdue checks (daily)
│   │   │   ├── notification.worker.ts # SMS/email queue
│   │   │   ├── report.worker.ts      # Async PDF generation
│   │   │   └── disbursement.worker.ts # Auto-disburse on trigger
│   │   └── schedulers/
│   │       ├── daily.scheduler.ts    # Cron: midnight daily
│   │       └── weekly.scheduler.ts   # Cron: Monday 6am
│   │
│   ├── integrations/             # External service clients
│   │   ├── nibss/
│   │   │   ├── nibss.client.ts   # BVN verification
│   │   │   └── nibss.types.ts
│   │   ├── nimc/
│   │   │   ├── nimc.client.ts    # NIN verification
│   │   │   └── nimc.types.ts
│   │   ├── paystack/
│   │   │   ├── paystack.client.ts
│   │   │   └── paystack.types.ts
│   │   └── africastalking/
│   │       ├── at.client.ts      # USSD gateway
│   │       └── at.types.ts
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── express.d.ts      # Extend Request type
│   │   │   └── global.types.ts
│   │   ├── utils/
│   │   │   ├── logger.ts         # Winston logger
│   │   │   ├── asyncHandler.ts   # Wrap async controllers
│   │   │   ├── pagination.ts     # Cursor pagination helper
│   │   │   ├── responseHelper.ts # Standard API responses
│   │   │   ├── crypto.ts         # Hash, encrypt utils
│   │   │   └── nigeriaUtils.ts   # State/LGA helpers
│   │   └── errors/
│   │       ├── AppError.ts       # Base error class
│   │       ├── AuthError.ts
│   │       ├── ValidationError.ts
│   │       └── NotFoundError.ts
│   │
│   └── routes/
│       └── index.ts              # Master router (mounts all modules)
│
├── tests/
│   ├── unit/
│   │   ├── farmscore.test.ts
│   │   └── ussd.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── programs.test.ts
│   │   └── disbursements.test.ts
│   └── e2e/
│       └── lender-flow.test.ts
│
├── scripts/
│   ├── seed-dev.ts
│   ├── migrate-prod.ts
│   └── generate-api-docs.ts
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Database Schema

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum UserRole {
  SUPER_ADMIN
  LENDER_ADMIN
  LENDER_MANAGER
  LENDER_ANALYST
  FIELD_SUPERVISOR
  FIELD_AGENT
  BORROWER
  COOP_CHAIR
}

enum LenderPlan {
  STARTER
  GROWTH
  ENTERPRISE
}

enum LenderStatus {
  ACTIVE
  TRIAL
  SUSPENDED
  PENDING
}

enum ProgramType {
  LOAN
  GRANT
  HYBRID
}

enum ProgramStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
}

enum ApplicationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  WITHDRAWN
}

enum DisbursementStatus {
  PENDING
  PROOF_SUBMITTED
  APPROVED
  RELEASED
  FAILED
}

enum RepaymentStatus {
  SCHEDULED
  PAID
  LATE
  OVERDUE
  DEFAULTED
  WAIVED
}

enum RepaymentMethod {
  BANK_TRANSFER
  USSD
  MOBILE_MONEY
  PAYSTACK
  IN_KIND
}

enum FarmReportStatus {
  DRAFT
  SUBMITTED
  VERIFIED
  REJECTED
}

enum CropGrowthStage {
  LAND_PREPARATION
  PLANTING
  GROWING
  FLOWERING
  HARVESTING
}

enum CoopStatus {
  PENDING
  ACTIVE
  WATCH
  SUSPENDED
}

enum NotificationChannel {
  SMS
  EMAIL
  WHATSAPP
  IN_APP
  PUSH
}

enum NotificationType {
  REPAYMENT_DUE
  REPAYMENT_RECEIVED
  DISBURSEMENT_RELEASED
  APPLICATION_APPROVED
  APPLICATION_REJECTED
  FARM_REPORT_DUE
  SCORE_UPDATED
  SYSTEM_ALERT
}

// ─── CORE MODELS ──────────────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String    @unique
  passwordHash  String
  role          UserRole
  firstName     String
  lastName      String
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  twoFAEnabled  Boolean   @default(false)
  twoFASecret   String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  lenderMember  LenderMember?
  borrower      Borrower?
  fieldAgent    FieldAgent?
  sessions      UserSession[]
  notifications Notification[]
  auditLogs     AuditLog[]
  sentMessages  Message[]     @relation("SentMessages")

  @@index([email, phone])
  @@map("users")
}

model UserSession {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  deviceInfo   String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, refreshToken])
  @@map("user_sessions")
}

// ─── LENDER MODELS ────────────────────────────────────────────────────────────

model Lender {
  id            String       @id @default(cuid())
  name          String
  type          String       // "Federal Government", "State Government", etc.
  regNumber     String?      @unique
  email         String       @unique
  phone         String
  address       String?
  state         String
  website       String?
  logoUrl       String?
  plan          LenderPlan   @default(STARTER)
  status        LenderStatus @default(PENDING)
  isVerified    Boolean      @default(false)
  trialEndsAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  members       LenderMember[]
  programs      LoanProgram[]
  featureFlags  LenderFeatureFlag[]
  billingHistory BillingRecord[]
  apiKeys       ApiKey[]

  @@map("lenders")
}

model LenderMember {
  id          String   @id @default(cuid())
  userId      String   @unique
  lenderId    String
  role        UserRole
  isOwner     Boolean  @default(false)
  createdAt   DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  lender Lender @relation(fields: [lenderId], references: [id])

  @@map("lender_members")
}

model LenderFeatureFlag {
  id        String  @id @default(cuid())
  lenderId  String
  flagName  String
  enabled   Boolean @default(false)
  overrideGlobal Boolean @default(false)
  setAt     DateTime @default(now())

  lender Lender @relation(fields: [lenderId], references: [id])

  @@unique([lenderId, flagName])
  @@map("lender_feature_flags")
}

model BillingRecord {
  id          String   @id @default(cuid())
  lenderId    String
  amount      BigInt   // in kobo
  description String
  status      String   // "paid", "pending", "failed"
  paidAt      DateTime?
  createdAt   DateTime @default(now())

  lender Lender @relation(fields: [lenderId], references: [id])

  @@map("billing_records")
}

model ApiKey {
  id        String   @id @default(cuid())
  lenderId  String
  name      String
  keyHash   String   @unique
  lastUsed  DateTime?
  expiresAt DateTime?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  lender Lender @relation(fields: [lenderId], references: [id])

  @@map("api_keys")
}

// ─── LOAN PROGRAM MODELS ──────────────────────────────────────────────────────

model LoanProgram {
  id                String        @id @default(cuid())
  lenderId          String
  name              String
  description       String?
  type              ProgramType
  status            ProgramStatus @default(DRAFT)
  totalPoolKobo     BigInt
  disbursedKobo     BigInt        @default(0)
  minLoanKobo       BigInt
  maxLoanKobo       BigInt
  interestRatePct   Decimal       @db.Decimal(5, 2)
  repaymentMonths   Int
  gracePeriodMonths Int           @default(0)
  disbursementType  String        @default("LAYERED")
  eligibilityCriteria Json        // states, crops, age range, gender, coop required
  requiredDocuments   Json        // array of required doc types
  applicationDeadline DateTime?
  publishedAt       DateTime?
  closedAt          DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  lender            Lender         @relation(fields: [lenderId], references: [id])
  layers            DisbursementLayer[]
  applications      Application[]

  @@index([lenderId, status])
  @@map("loan_programs")
}

model DisbursementLayer {
  id           String  @id @default(cuid())
  programId    String
  layerNumber  Int
  name         String
  percentShare Decimal @db.Decimal(5, 2)
  triggerCondition String
  requiredProof    String

  program      LoanProgram @relation(fields: [programId], references: [id])
  disbursements LayerDisbursement[]

  @@unique([programId, layerNumber])
  @@map("disbursement_layers")
}

// ─── BORROWER MODELS ──────────────────────────────────────────────────────────

model Borrower {
  id                String   @id @default(cuid())
  userId            String   @unique
  farmerId          String   @unique @default(cuid())
  bvn               String?  @unique
  nin               String?  @unique
  bvnVerified       Boolean  @default(false)
  ninVerified       Boolean  @default(false)
  dateOfBirth       DateTime?
  gender            String?
  state             String?
  lga               String?
  farmSizeHectares  Decimal? @db.Decimal(8, 2)
  farmLatitude      Decimal? @db.Decimal(10, 8)
  farmLongitude     Decimal? @db.Decimal(11, 8)
  farmBoundaryGeoJson Json?
  cropTypes         String[]
  profilePhotoUrl   String?
  farmPhotoUrls     String[]
  bankName          String?
  accountNumber     String?
  accountName       String?
  cooperativeId     String?
  farmScore         Int      @default(0)
  farmScoreGrade    String   @default("UNSCORED")
  farmScoreUpdatedAt DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id])
  cooperative  Cooperative?  @relation(fields: [cooperativeId], references: [id])
  applications Application[]
  farmReports  FarmReport[]
  repayments   Repayment[]
  scoreHistory FarmScoreHistory[]
  documents    BorrowerDocument[]

  @@index([state, lga])
  @@index([farmScore])
  @@map("borrowers")
}

model BorrowerDocument {
  id          String   @id @default(cuid())
  borrowerId  String
  docType     String   // "BVN", "NIN", "FARM_PHOTO", "COOPERATIVE_LETTER", etc.
  fileUrl     String
  verified    Boolean  @default(false)
  uploadedAt  DateTime @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])

  @@map("borrower_documents")
}

// ─── APPLICATION & DISBURSEMENT ───────────────────────────────────────────────

model Application {
  id              String            @id @default(cuid())
  borrowerId      String
  programId       String
  requestedKobo   BigInt
  purpose         String?
  status          ApplicationStatus @default(PENDING)
  reviewerId      String?
  reviewNotes     String?
  reviewedAt      DateTime?
  approvedAt      DateTime?
  rejectedAt      DateTime?
  submittedAt     DateTime          @default(now())
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  borrower      Borrower        @relation(fields: [borrowerId], references: [id])
  program       LoanProgram     @relation(fields: [programId], references: [id])
  disbursements LayerDisbursement[]

  @@index([borrowerId, status])
  @@index([programId, status])
  @@map("applications")
}

model LayerDisbursement {
  id              String             @id @default(cuid())
  applicationId   String
  layerId         String
  amountKobo      BigInt
  status          DisbursementStatus @default(PENDING)
  proofDocUrls    String[]
  proofNotes      String?
  proofSubmittedAt DateTime?
  approvedById    String?
  approvedAt      DateTime?
  releasedAt      DateTime?
  paystackRef     String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  application Application       @relation(fields: [applicationId], references: [id])
  layer       DisbursementLayer @relation(fields: [layerId], references: [id])

  @@index([applicationId, status])
  @@map("layer_disbursements")
}

// ─── REPAYMENT MODELS ─────────────────────────────────────────────────────────

model RepaymentSchedule {
  id            String   @id @default(cuid())
  applicationId String
  installmentNo Int
  dueDate       DateTime
  amountKobo    BigInt
  createdAt     DateTime @default(now())

  repayments Repayment[]

  @@unique([applicationId, installmentNo])
  @@map("repayment_schedules")
}

model Repayment {
  id              String          @id @default(cuid())
  borrowerId      String
  scheduleId      String?
  amountKobo      BigInt
  method          RepaymentMethod
  status          RepaymentStatus @default(SCHEDULED)
  paystackRef     String?
  ussdRef         String?
  receiptUrl      String?
  paidAt          DateTime?
  daysLate        Int?
  createdAt       DateTime        @default(now())

  borrower Borrower           @relation(fields: [borrowerId], references: [id])
  schedule RepaymentSchedule? @relation(fields: [scheduleId], references: [id])

  @@index([borrowerId, status])
  @@map("repayments")
}

// ─── FARM REPORT MODELS ───────────────────────────────────────────────────────

model FarmReport {
  id              String          @id @default(cuid())
  borrowerId      String
  applicationId   String?
  reportingPeriod String          // "2025-06"
  growthStage     CropGrowthStage
  photoUrls       String[]
  challenges      String[]
  labourExpenses  BigInt?
  inputExpenses   BigInt?
  estimatedYield  Decimal?        @db.Decimal(10, 2)
  yieldUnit       String?
  voiceNoteUrl    String?
  notes           String?
  status          FarmReportStatus @default(SUBMITTED)
  verifiedById    String?
  verifiedAt      DateTime?
  scorePointsEarned Int           @default(0)
  submittedAt     DateTime        @default(now())
  latitude        Decimal?        @db.Decimal(10, 8)
  longitude       Decimal?        @db.Decimal(11, 8)
  createdAt       DateTime        @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])

  @@index([borrowerId, reportingPeriod])
  @@map("farm_reports")
}

// ─── FIELD AGENT MODELS ───────────────────────────────────────────────────────

model FieldAgent {
  id              String   @id @default(cuid())
  userId          String   @unique
  lenderId        String
  agentCode       String   @unique
  state           String
  lga             String
  zoneDescription String?
  isActive        Boolean  @default(true)
  totalRegistered Int      @default(0)
  totalVerified   Int      @default(0)
  totalVisits     Int      @default(0)
  earningsKobo    BigInt   @default(0)
  rating          Decimal  @default(0) @db.Decimal(3, 1)
  createdAt       DateTime @default(now())

  user          User           @relation(fields: [userId], references: [id])
  verifications Verification[]
  earnings      AgentEarning[]

  @@map("field_agents")
}

model Verification {
  id              String   @id @default(cuid())
  agentId         String
  borrowerId      String
  type            String   // "KYC", "FARM_VISIT", "MONITORING"
  farmPhotoUrls   String[]
  gpsLatitude     Decimal? @db.Decimal(10, 8)
  gpsLongitude    Decimal? @db.Decimal(11, 8)
  farmBoundaryGeoJson Json?
  notes           String?
  syncedAt        DateTime?
  isOfflineSync   Boolean  @default(false)
  createdAt       DateTime @default(now())

  agent FieldAgent @relation(fields: [agentId], references: [id])

  @@index([agentId])
  @@map("verifications")
}

model AgentEarning {
  id          String   @id @default(cuid())
  agentId     String
  type        String   // "REGISTRATION", "VERIFICATION", "MONITORING"
  amountKobo  BigInt
  description String?
  isPaid      Boolean  @default(false)
  paidAt      DateTime?
  createdAt   DateTime @default(now())

  agent FieldAgent @relation(fields: [agentId], references: [id])

  @@map("agent_earnings")
}

// ─── COOPERATIVE MODELS ───────────────────────────────────────────────────────

model Cooperative {
  id                  String     @id @default(cuid())
  name                String
  registrationNumber  String?    @unique
  state               String
  lga                 String
  cropFocus           String
  chairUserId         String
  chairPhone          String
  status              CoopStatus @default(PENDING)
  groupFarmScore      Int        @default(500)
  groupScoreGrade     String     @default("SILVER")
  savingsPerMemberKobo BigInt    @default(0)
  guaranteeFundKobo   BigInt     @default(0)
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  members      CoopMember[]
  groupLoans   CoopGroupLoan[]
  contributions CoopContribution[]
  borrowers    Borrower[]

  @@map("cooperatives")
}

model CoopMember {
  id              String   @id @default(cuid())
  cooperativeId   String
  borrowerId      String
  role            String   @default("MEMBER") // "CHAIRMAN", "SECRETARY", "TREASURER", "MEMBER"
  joinedAt        DateTime @default(now())
  isActive        Boolean  @default(true)
  consentGiven    Boolean  @default(false)
  consentGivenAt  DateTime?

  cooperative Cooperative @relation(fields: [cooperativeId], references: [id])

  @@unique([cooperativeId, borrowerId])
  @@map("coop_members")
}

model CoopGroupLoan {
  id             String            @id @default(cuid())
  cooperativeId  String
  programId      String
  totalAmountKobo BigInt
  purpose        String?
  repaymentMode  String            @default("INDIVIDUAL")
  status         ApplicationStatus @default(PENDING)
  appliedAt      DateTime          @default(now())
  approvedAt     DateTime?

  cooperative  Cooperative   @relation(fields: [cooperativeId], references: [id])
  allocations  CoopLoanAllocation[]

  @@map("coop_group_loans")
}

model CoopLoanAllocation {
  id            String @id @default(cuid())
  groupLoanId   String
  borrowerId    String
  amountKobo    BigInt
  sharePercent  Decimal @db.Decimal(5, 2)
  consentGiven  Boolean @default(false)

  groupLoan CoopGroupLoan @relation(fields: [groupLoanId], references: [id])

  @@map("coop_loan_allocations")
}

model CoopContribution {
  id             String   @id @default(cuid())
  cooperativeId  String
  borrowerId     String
  amountKobo     BigInt
  month          String   // "2025-06"
  isPaid         Boolean  @default(false)
  paidAt         DateTime?
  createdAt      DateTime @default(now())

  cooperative Cooperative @relation(fields: [cooperativeId], references: [id])

  @@index([cooperativeId, month])
  @@map("coop_contributions")
}

// ─── FARMSCORE MODELS ─────────────────────────────────────────────────────────

model FarmScoreHistory {
  id         String   @id @default(cuid())
  borrowerId String
  score      Int
  grade      String
  breakdown  Json     // component scores
  reason     String?  // what triggered recalculation
  createdAt  DateTime @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])

  @@index([borrowerId, createdAt])
  @@map("farmscore_history")
}

// ─── MESSAGING MODELS ─────────────────────────────────────────────────────────

model Message {
  id           String   @id @default(cuid())
  senderId     String
  recipientId  String
  programId    String?
  content      String
  isRead       Boolean  @default(false)
  readAt       DateTime?
  isBroadcast  Boolean  @default(false)
  createdAt    DateTime @default(now())

  sender User @relation("SentMessages", fields: [senderId], references: [id])

  @@index([senderId, recipientId])
  @@map("messages")
}

// ─── NOTIFICATION MODELS ──────────────────────────────────────────────────────

model Notification {
  id         String              @id @default(cuid())
  userId     String
  type       NotificationType
  channel    NotificationChannel
  title      String
  body       String
  data       Json?
  isRead     Boolean             @default(false)
  sentAt     DateTime?
  readAt     DateTime?
  createdAt  DateTime            @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@map("notifications")
}

// ─── AUDIT & SYSTEM MODELS ────────────────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String   // "APPROVED_DISBURSEMENT", "CREATED_PROGRAM", etc.
  resource   String   // "Application", "LoanProgram", etc.
  resourceId String?
  before     Json?
  after      Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId, resource, createdAt])
  @@map("audit_logs")
}

model GlobalFeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  enabled     Boolean  @default(false)
  plans       String[] // plans that can access this feature
  isBeta      Boolean  @default(false)
  updatedAt   DateTime @updatedAt
  updatedById String?

  @@map("global_feature_flags")
}
```

---

## 7. API Design

### Base URL
```
Production:   https://api.agrotrack.ng/v1
Staging:      https://api-staging.agrotrack.ng/v1
Development:  http://localhost:4000/v1
```

### Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "nextCursor": "ckl..."
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "BVN must be 11 digits",
    "details": [{ "field": "bvn", "issue": "Too short" }]
  }
}
```

### API Routes

#### Auth
```
POST   /auth/lender/signup         Register new lender organisation
POST   /auth/lender/login          Login (returns access + refresh tokens)
POST   /auth/borrower/register     Register new farmer (phone + OTP)
POST   /auth/borrower/login        Login borrower
POST   /auth/otp/send              Send OTP to phone
POST   /auth/otp/verify            Verify OTP
POST   /auth/refresh               Refresh access token
POST   /auth/logout                Invalidate refresh token
POST   /auth/2fa/setup             Generate 2FA secret + QR code
POST   /auth/2fa/verify            Verify 2FA code on login
POST   /auth/password/forgot       Send password reset email/SMS
POST   /auth/password/reset        Reset with token
GET    /auth/me                    Get current user profile
```

#### Lenders
```
GET    /lenders                    List all lenders (admin only)
GET    /lenders/:id                Get lender detail
PATCH  /lenders/:id                Update lender profile
GET    /lenders/:id/stats          Aggregate stats
GET    /lenders/:id/feature-flags  Get feature flags
PATCH  /lenders/:id/feature-flags  Update feature flags
GET    /lenders/:id/billing        Billing history
POST   /lenders/:id/suspend        Suspend account
POST   /lenders/:id/reactivate     Reactivate account
```

#### Loan Programs
```
GET    /programs                   List programs (filterable)
POST   /programs                   Create new program
GET    /programs/:id               Get program detail
PATCH  /programs/:id               Update program
POST   /programs/:id/publish       Publish draft program
POST   /programs/:id/close         Close program
GET    /programs/:id/applications  List applications for program
GET    /programs/:id/stats         Program performance metrics
```

#### Borrowers
```
GET    /borrowers                  List borrowers (lender-scoped)
GET    /borrowers/:id              Get borrower profile
PATCH  /borrowers/:id              Update borrower profile
POST   /borrowers/:id/verify-bvn  Trigger BVN verification
POST   /borrowers/:id/verify-nin  Trigger NIN verification
GET    /borrowers/:id/farmscore   Get current FarmScore + history
GET    /borrowers/:id/applications Borrower's applications
GET    /borrowers/:id/repayments  Repayment history
GET    /borrowers/:id/reports     Farm reports
POST   /borrowers/:id/documents   Upload document
```

#### Applications
```
POST   /applications               Submit loan application
GET    /applications               List applications
GET    /applications/:id           Get application detail
POST   /applications/:id/approve  Approve application
POST   /applications/:id/reject   Reject application
POST   /applications/:id/proof    Submit layer proof documents
```

#### Disbursements
```
GET    /disbursements              List disbursements
GET    /disbursements/pending      Pending approval queue
POST   /disbursements/:id/approve Approve layer disbursement
POST   /disbursements/:id/reject  Reject disbursement request
GET    /disbursements/stats        Summary stats
```

#### Repayments
```
GET    /repayments                 List repayments
POST   /repayments                 Record repayment
GET    /repayments/overdue         Overdue repayments
POST   /repayments/paystack/init   Initiate Paystack payment
POST   /repayments/paystack/webhook Paystack webhook
```

#### Farm Reports
```
POST   /farm-reports               Submit farm report
GET    /farm-reports               List reports (filterable)
GET    /farm-reports/:id           Get report detail
POST   /farm-reports/:id/verify   Verify report (agent/lender)
```

#### Field Agents
```
GET    /agents                     List agents
POST   /agents                     Create/invite agent
GET    /agents/:id                 Agent profile
PATCH  /agents/:id                 Update agent
GET    /agents/:id/tasks           Assigned tasks
GET    /agents/:id/earnings        Earnings breakdown
POST   /agents/:id/payout          Request payout
POST   /agents/verify              Submit farm verification
```

#### Cooperatives
```
GET    /cooperatives               List cooperatives
POST   /cooperatives               Register cooperative
GET    /cooperatives/:id           Cooperative detail
PATCH  /cooperatives/:id           Update cooperative
POST   /cooperatives/:id/members  Add member
DELETE /cooperatives/:id/members/:borrowerId Remove member
POST   /cooperatives/:id/loans    Apply for group loan
GET    /cooperatives/:id/loans    Group loan history
POST   /cooperatives/:id/contributions Record contribution
GET    /cooperatives/:id/score    Group FarmScore
```

#### FarmScore
```
GET    /farmscore/:borrowerId      Get current score + breakdown
POST   /farmscore/:borrowerId/recalculate Trigger recalculation
GET    /farmscore/:borrowerId/history Score history
GET    /farmscore/:borrowerId/report Export score PDF
POST   /farmscore/api/query        External bank API query (paid)
```

#### USSD
```
POST   /ussd/session               Africa's Talking USSD webhook
```

#### WhatsApp
```
POST   /whatsapp/webhook           Meta WhatsApp webhook
GET    /whatsapp/webhook           Webhook verification
```

#### Messages
```
GET    /messages                   List conversations
GET    /messages/:conversationId   Get messages
POST   /messages                   Send message
POST   /messages/broadcast         Broadcast to program/state
```

#### Reports
```
GET    /reports/portfolio          Portfolio performance
GET    /reports/impact             Impact metrics
GET    /reports/state/:state       State breakdown
POST   /reports/generate           Generate async report
GET    /reports/:reportId/download Download generated PDF
```

#### Admin
```
GET    /admin/stats                Platform-wide metrics
GET    /admin/lenders              All lender accounts
GET    /admin/feature-flags        Global feature flags
PATCH  /admin/feature-flags/:name  Toggle global feature flag
GET    /admin/tickets              Support tickets
GET    /admin/system-health        Service health status
GET    /admin/audit-logs           Platform audit trail
```

#### Uploads
```
POST   /uploads/farm-photos        Upload farm photos (S3)
POST   /uploads/documents          Upload KYC documents
POST   /uploads/voice-notes        Upload voice note
GET    /uploads/:key/signed-url    Get presigned download URL
```

---

## 8. Authentication & Security

### JWT Token Strategy

```
Access Token:   15 minutes expiry · Stored in memory (not localStorage)
Refresh Token:  30 days expiry · HttpOnly cookie · Rotated on use
2FA:            TOTP (Google Authenticator compatible) · SMS fallback
```

### Token Flow
```
1. User logs in → server returns { accessToken, refreshToken (cookie) }
2. Frontend stores accessToken in memory (Zustand)
3. Every API request includes Authorization: Bearer <accessToken>
4. On 401 → frontend calls POST /auth/refresh (cookie sent automatically)
5. Server validates refresh token → issues new pair → rotates token
6. On logout → server blacklists refresh token in Redis
```

### Security Middleware

```typescript
// middleware/auth.middleware.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AuthError('No token provided');

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  
  // Check token not blacklisted
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) throw new AuthError('Token revoked');

  req.user = await prisma.user.findUnique({ where: { id: payload.sub } });
  next();
};

// middleware/role.middleware.ts
export const requireRole = (...roles: UserRole[]) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AuthError('Insufficient permissions');
  }
  next();
};
```

### Security Checklist
- [x] Passwords hashed with bcrypt (rounds: 12)
- [x] JWT signed with RS256 (asymmetric key pair)
- [x] Refresh tokens stored as hash in DB, rotated on every use
- [x] Rate limiting: 5 login attempts per 15min per IP
- [x] CORS: whitelist only known frontend domains
- [x] Helmet.js: security headers
- [x] SQL injection: impossible via Prisma ORM
- [x] Input validation: Zod schemas on all endpoints
- [x] File upload: type check, size limit (10MB), virus scan (ClamAV)
- [x] Webhook signatures: verify Paystack signature on every webhook
- [x] API keys: hashed in DB, only shown once on creation
- [x] PII encryption: BVN, NIN, account numbers encrypted at rest (AES-256)
- [x] Audit trail: every data mutation logged automatically

---

## 9. Third-Party Integrations

### Nigerian Identity Verification

| Service | Purpose | Endpoint |
|---|---|---|
| NIBSS BVN API | Verify Bank Verification Number | POST /nibss/verify-bvn |
| NIMC NIN API | Verify National ID Number | POST /nimc/verify-nin |

```typescript
// integrations/nibss/nibss.client.ts
export const verifyBVN = async (bvn: string, dob: string) => {
  const response = await axios.post(process.env.NIBSS_URL, {
    bvn,
    dob,
  }, {
    headers: { Authorization: `Bearer ${process.env.NIBSS_API_KEY}` }
  });
  return {
    verified: response.data.responseCode === '00',
    name: response.data.firstName + ' ' + response.data.lastName,
    phone: response.data.phoneNumber,
  };
};
```

### Payment Processing

| Service | Purpose |
|---|---|
| Paystack | Collect repayments, card payments, verify bank accounts |
| Flutterwave | Fallback payments, mobile money |

```typescript
// payments.service.ts
export const initiateRepayment = async (borrowerId: string, amountKobo: number) => {
  const borrower = await getBorrowerWithDetails(borrowerId);
  
  const response = await paystack.transaction.initialize({
    email: borrower.user.email,
    amount: amountKobo,
    callback_url: `${process.env.FRONTEND_URL}/repayment/callback`,
    metadata: { borrowerId, type: 'LOAN_REPAYMENT' },
  });
  
  return { authorizationUrl: response.data.authorization_url };
};
```

### SMS & Communications

| Service | Purpose | Priority |
|---|---|---|
| Termii | Nigerian SMS (OTP, reminders) | Primary |
| Twilio | International SMS fallback | Secondary |
| SendGrid | Transactional email | Primary |

### File Storage

```typescript
// config/s3.ts
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Folder structure in S3
// agrotrack-uploads/
//   farm-photos/{borrowerId}/{timestamp}.jpg
//   documents/{borrowerId}/{docType}/{timestamp}.pdf
//   voice-notes/{borrowerId}/{timestamp}.mp3
//   reports/{lenderId}/{reportId}.pdf
//   logos/{lenderId}/logo.png
```

---

## 10. File & Storage Architecture

### S3 Bucket Structure
```
agrotrack-uploads/
├── farm-photos/
│   └── {borrowerId}/
│       ├── {timestamp}-1.jpg
│       ├── {timestamp}-2.jpg
│       └── {timestamp}-3.jpg
├── documents/
│   └── {borrowerId}/
│       ├── bvn-slip.pdf
│       ├── nin-card.jpg
│       └── cooperative-letter.pdf
├── voice-notes/
│   └── {borrowerId}/{timestamp}.mp3
├── verification-photos/
│   └── {agentId}/{borrowerId}/{timestamp}.jpg
├── reports/
│   └── {lenderId}/{reportId}.pdf
└── logos/
    └── {lenderId}/logo.png
```

### Upload Flow
```
1. Frontend requests presigned URL from POST /uploads/presign
2. Backend generates S3 presigned PUT URL (expires 15 min)
3. Frontend uploads directly to S3 (bypasses backend)
4. Frontend sends S3 key to backend to confirm upload
5. Backend validates file exists, stores key in DB
```

---

## 11. Real-Time & Notifications

### WebSocket Events (Socket.IO)

```typescript
// Events emitted by server
'notification:new'         // New notification for user
'disbursement:approved'    // Layer disbursement approved
'application:status'       // Application status change
'message:received'         // New chat message
'repayment:confirmed'      // Repayment confirmed
'farmscore:updated'        // Score recalculated
'system:alert'             // System-wide alert (admin)
```

### Notification Templates

```typescript
// notifications/notifications.templates.ts
export const templates = {
  REPAYMENT_DUE: (data) => ({
    sms: `AgroTrack: Your loan repayment of ₦${fmt(data.amount)} is due on ${data.dueDate}. Dial *737*99# to pay. Reply STOP to opt out.`,
    email: { subject: 'Repayment Due', template: 'repayment-due' },
    whatsapp: `Hello ${data.name}, your AgroTrack repayment of ₦${fmt(data.amount)} is due on ${data.dueDate}. Reply PAY to get payment options.`,
  }),
  DISBURSEMENT_RELEASED: (data) => ({
    sms: `AgroTrack: ₦${fmt(data.amount)} (Layer ${data.layer}) has been sent to your ${data.bankName} account. Check balance in 24hrs.`,
  }),
};
```

---

## 12. USSD & WhatsApp Integration

### USSD Architecture

The USSD session is **stateless on the carrier side** — AgroTrack maintains session state in Redis.

```
Carrier (MTN/Airtel/Glo/9mobile)
    ↓  POST /ussd/session (phone, text, sessionId)
Africa's Talking USSD Gateway
    ↓  POST /api/v1/ussd/session
AgroTrack API Server
    ↓  Redis session state lookup
    ↓  Route to correct menu handler
    ↓  Return CON (continue) or END (terminate)
```

### USSD Menu Tree
```
*737*99# → Welcome + Main Menu
  1 → Loan Balance
      → Show balance + next payment (END)
  2 → Make Payment
      → Select method
          1 → Bank transfer (show account details) END
          2 → Mobile money (initiate via Paystack) END
          3 → In-kind (request collection) END
  3 → Submit Farm Report
      → Select crop stage (1-4)
      → Enter challenges (1-6)
      → Confirm + submit END
  4 → My FarmScore
      → Show score + grade + tip (END)
  5 → Browse Programs
      → List top 3 eligible programs CON
          1-3 → Program details CON
              1 → Apply now END
  0 → Exit END
```

### USSD Session Handler
```typescript
// ussd/ussd.service.ts
export const handleUSSD = async (
  sessionId: string, phone: string, text: string
) => {
  // Get or create session
  let session = await redis.get(`ussd:${sessionId}`) || { step: 'main', data: {} };
  
  const borrower = await findBorrowerByPhone(phone);
  
  // Route based on text input
  const response = await routeUSSD(session, text, borrower);
  
  // Save updated session
  await redis.setex(`ussd:${sessionId}`, 180, JSON.stringify(response.session));
  
  return `${response.continues ? 'CON' : 'END'} ${response.message}`;
};
```

### WhatsApp Bot Flow
```
Farmer sends WhatsApp message to +234-XXX-XXXX
    ↓ Meta webhooks POST /whatsapp/webhook
    ↓ Parse message type (text/button/media)
    ↓ Route to intent handler
    ↓ Reply via WhatsApp Business Cloud API

Intents handled:
  "balance"  → Loan balance
  "pay"      → Payment options
  "report"   → Submit farm report (with photo)
  "score"    → FarmScore
  "help"     → Menu
  photo       → Save as farm photo if active report session
```

---

## 13. FarmScore Engine

### Scoring Formula

```
FarmScore (0–850) = Σ (component × weight)

Components:
  Identity Completeness   weight: 20%  max: 170 pts
  Farm Verification       weight: 20%  max: 170 pts
  Repayment History       weight: 30%  max: 255 pts
  Farm Activity Reporting weight: 15%  max: 127 pts
  Cooperative Standing    weight: 10%  max: 85 pts
  Geographic Risk         weight: 5%   max: 43 pts  (inverse — lower risk = more pts)
```

### Implementation
```typescript
// farmscore/farmscore.engine.ts
export const calculateFarmScore = async (borrowerId: string): Promise<ScoreResult> => {
  const [borrower, repayments, reports, verifications] = await Promise.all([
    prisma.borrower.findUnique({ where: { id: borrowerId }, include: { documents: true } }),
    prisma.repayment.findMany({ where: { borrowerId } }),
    prisma.farmReport.findMany({ where: { borrowerId } }),
    prisma.verification.findMany({ where: { /* via agent */ } }),
  ]);

  const components = {
    identity: scoreIdentity(borrower),         // BVN + NIN + photo + docs
    farmVerification: scoreFarm(borrower, verifications), // GPS + agent visit + photos
    repaymentHistory: scoreRepayments(repayments),        // on-time rate, streak, history
    activityReporting: scoreReporting(reports),           // consistency, completeness
    cooperative: scoreCooperative(borrower),              // membership + standing
    geographicRisk: scoreGeographic(borrower),            // flood zone, conflict, market
  };

  const total = Math.round(
    components.identity         * 0.20 +
    components.farmVerification * 0.20 +
    components.repaymentHistory * 0.30 +
    components.activityReporting* 0.15 +
    components.cooperative      * 0.10 +
    components.geographicRisk   * 0.05
  );

  const grade = total >= 750 ? 'PLATINUM' : total >= 650 ? 'GOLD' : total >= 500 ? 'SILVER' : 'BRONZE';

  return { score: total, grade, components, calculatedAt: new Date() };
};
```

### Score Triggers
The FarmScore is automatically recalculated when:
- A repayment is recorded or missed
- A farm report is submitted and verified
- A field agent verification is completed
- Cooperative membership status changes
- Monthly batch recalculation (Sunday midnight)

---

## 14. Geospatial Layer

### Farm Boundary Mapping
```
Field agent walks perimeter of farm while GPS records path
→ Array of [lat, lng] coordinates collected every 5 seconds
→ Stored as GeoJSON Polygon in borrower.farmBoundaryGeoJson
→ Area calculated server-side (Turf.js)
→ Farm size verified against self-reported size
```

### Map Data Sources
```
Borrower locations:   PostgreSQL + PostGIS (spatial queries)
Flood risk overlays:  Nigeria Meteorological Agency API
Market proximity:     Google Maps Distance Matrix API
Conflict zones:       Internal static dataset (NE Nigeria)
Satellite NDVI:       Sentinel Hub API (crop growth monitoring)
```

### Spatial Queries (PostGIS)
```sql
-- Find all at-risk borrowers within 50km of Abuja
SELECT b.*, u.name 
FROM borrowers b
JOIN users u ON b.user_id = u.id
WHERE ST_DWithin(
  ST_MakePoint(b.farm_longitude, b.farm_latitude)::geography,
  ST_MakePoint(7.4951, 9.0579)::geography,
  50000
)
AND b.farm_score < 500;
```

---

## 15. DevOps & Deployment

<!-- ### Infrastructure (AWS)

```
Production:
  Frontend:        Vercel (CDN + Edge)
  API Server:      AWS EC2 (t3.medium) behind ALB
  Database:        AWS RDS PostgreSQL (db.t3.medium, Multi-AZ)
  Cache:           AWS ElastiCache Redis (cache.t3.micro)
  File Storage:    AWS S3 + CloudFront CDN
  Queue:           Redis (Bull) on ElastiCache
  Emails:          SendGrid
  SMS:             Termii API
  Monitoring:      AWS CloudWatch + Sentry
  Logs:            AWS CloudWatch Logs + Winston

Staging:
  Frontend:        Vercel (preview URLs)
  API:             Single EC2 t3.small
  Database:        RDS PostgreSQL t3.micro (single AZ)
  Cache:           Single Redis instance
``` -->

### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml (development)
version: '3.9'
services:
  api:
    build: .
    ports: ["4000:4000"]
    env_file: .env
    depends_on: [postgres, redis]
    volumes: ["./src:/app/src"]
    command: npm run dev

  postgres:
    image: postgis/postgis:16-3.4
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: agrotrack_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redisdata:/data"]

volumes:
  pgdata:
  redisdata:
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        run: |
          ssh ec2-user@${{ secrets.EC2_HOST }} "
            cd /app/agrotrack-backend &&
            git pull origin main &&
            npm ci --production &&
            npx prisma migrate deploy &&
            pm2 restart agrotrack-api
          "
```

---

## 16. Environment Variables

### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://agrotrack.ng
API_URL=https://api.agrotrack.ng

# Database
DATABASE_URL=postgresql://user:password@host:5432/agrotrack_prod

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=agrotrack-uploads
AWS_CLOUDFRONT_URL=https://cdn.agrotrack.ng

# Nigerian Identity
NIBSS_API_URL=https://api.nibss-plc.com.ng
NIBSS_API_KEY=...
NIMC_API_URL=https://api.nimc.gov.ng
NIMC_API_KEY=...

# Payments
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=...
FLUTTERWAVE_SECRET_KEY=FLWSECK_...

# SMS
TERMII_API_KEY=...
TERMII_SENDER_ID=AgroTrack
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1...

# Email
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=no-reply@agrotrack.ng

# WhatsApp
META_WHATSAPP_TOKEN=...
META_WHATSAPP_PHONE_ID=...
META_WEBHOOK_VERIFY_TOKEN=...

# USSD (Africa's Talking)
AFRICASTALKING_USERNAME=...
AFRICASTALKING_API_KEY=...
AFRICASTALKING_SHORTCODE=*737*99#

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:4000/v1
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_SENTRY_DSN=https://...
VITE_SOCKET_URL=http://localhost:4000
```

---


```

---

## 18. Development Roadmap

### Phase 1 — MVP (Months 1–3)
- [x] Lender dashboard UI (11 pages)
- [x] Borrower web portal
- [x] Public landing + marketing pages
- [x] Auth flows (signup, login, 2FA, onboarding)
- [x] Admin super console
- [x] Cooperative management module
- [ ] Backend API (auth, programs, borrowers, applications)
- [ ] PostgreSQL schema + Prisma setup
- [ ] BVN/NIN verification integration
- [ ] S3 file uploads
- [ ] Basic FarmScore engine

### Phase 2 — Core Features (Months 4–6)
- [ ] Layered disbursement engine + Paystack
- [ ] Repayment tracking + overdue alerts
- [ ] Farm report submission + verification
- [ ] Field agent mobile app
- [ ] USSD integration (*737*99#)
- [ ] SMS notifications (Termii)
- [ ] WhatsApp bot (basic)
- [ ] Geospatial map (PostGIS + Mapbox)
- [ ] PDF report generation

### Phase 3 — Scale (Months 7–12)
- [ ] FarmScore API (external bank access)
- [ ] WhatsApp bot (full conversational)
- [ ] Satellite crop monitoring (NDVI)
- [ ] AI-powered risk analysis
- [ ] React Native mobile app
- [ ] Multi-language support (Hausa, Yoruba, Igbo)
- [ ] Cooperative group loans end-to-end
- [ ] Marketplace module (input suppliers)
- [ ] Ghana/Kenya localisation

---

## 19. Testing Strategy

### Test Pyramid
```
E2E Tests         (Playwright)     ~20 critical user journeys
Integration Tests (Jest+Supertest) ~150 API endpoint tests
Unit Tests        (Jest+Vitest)    ~300 function/component tests
```

### Critical Test Scenarios
```typescript
// Must pass before every production deploy:

describe('Loan Lifecycle', () => {
  it('creates program → farmer applies → agent verifies → lender approves → layer 1 disburses')
  it('layer 2 blocks until farm report submitted and verified')
  it('repayment updates FarmScore within 5 seconds')
  it('overdue repayment triggers SMS within 5 minutes of due date')
  it('USSD session handles network timeout gracefully')
  it('BVN verification failure blocks application submission')
})

describe('FarmScore Engine', () => {
  it('new borrower with verified BVN/NIN/GPS starts at 520')
  it('on-time repayment adds exactly 12 points')
  it('late repayment subtracts 15 points')
  it('consecutive late payments cannot drop below 100')
  it('cooperative membership adds 10 points one-time bonus')
})

describe('Security', () => {
  it('rejects expired JWT tokens')
  it('prevents SQL injection on all inputs')
  it('rate limits login to 5 attempts per 15 minutes')
  it('webhook signature verification rejects tampered Paystack events')
})
```

---

## 20. Performance & Scalability

### Database Optimisations
```sql
-- Critical indexes
CREATE INDEX idx_borrowers_location ON borrowers (state, lga);
CREATE INDEX idx_borrowers_score ON borrowers (farm_score DESC);
CREATE INDEX idx_applications_status ON applications (program_id, status);
CREATE INDEX idx_repayments_due ON repayments (due_date, status) WHERE status = 'SCHEDULED';
CREATE INDEX idx_farm_reports_period ON farm_reports (borrower_id, reporting_period);

-- PostGIS spatial index
CREATE INDEX idx_borrowers_geo ON borrowers USING GIST (
  ST_MakePoint(farm_longitude, farm_latitude)
);
```

### Caching Strategy (Redis)
```
FarmScore:          Cache 1 hour, invalidate on repayment/report
Program list:       Cache 5 minutes
Dashboard stats:    Cache 10 minutes
BVN lookup result:  Cache 24 hours (immutable result)
USSD sessions:      TTL 180 seconds (session timeout)
Rate limit state:   TTL 900 seconds (15 min window)
```

### API Performance Targets
```
Dashboard load:      < 800ms  (cached stats)
Borrower list:       < 400ms  (indexed query, cursor pagination)
Map view:            < 1200ms (PostGIS spatial query)
FarmScore calc:      < 200ms  (cached or simple recalc)
File upload:         < 2000ms (direct S3, presigned URL)
USSD response:       < 500ms  (required by Africa's Talking SLA)
SMS delivery:        < 30 seconds (Termii)
```

### Pagination
All list endpoints use **cursor-based pagination** (not offset) for performance at scale:
```json
GET /borrowers?cursor=ckl...&limit=20

{
  "data": [...],
  "meta": {
    "nextCursor": "ckm...",
    "hasMore": true,
    "total": 23450
  }
}
```

---

*Document version 1.0 — AgroTrack Engineering Team — June 2025*
*For questions: engineering@agrotrack.ng*
MDEOF

echo "Markdown written. Lines: $(wc -l < /tmp/agrotrack_plan.md)"
Output

Markdown written. Lines: 2291
Done