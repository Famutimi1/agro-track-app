# AgroTrack Backend — Development Plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v20+) |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| File Upload | Multer |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |
| Dev Server | tsx (watch mode) |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # Database schema (✅ done)
│   ├── seed.ts               # Seed data
│   └── migrations/           # Auto-generated
├── src/
│   ├── server.ts             # Entry point
│   ├── app.ts                # Express app setup
│   ├── config/
│   │   ├── env.ts            # Environment variable parsing
│   │   └── prisma.ts         # Prisma client singleton
│   ├── middlewares/
│   │   ├── auth.ts           # JWT verification + role guard
│   │   ├── validate.ts       # Zod schema validation
│   │   ├── upload.ts         # Multer config
│   │   ├── error-handler.ts  # Global error handler
│   │   └── audit.ts          # Audit log middleware
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── lender.routes.ts
│   │   ├── program.routes.ts
│   │   ├── borrower.routes.ts
│   │   ├── disbursement.routes.ts
│   │   ├── repayment.routes.ts
│   │   ├── farm-report.routes.ts
│   │   ├── farm-score.routes.ts
│   │   ├── field-agent.routes.ts
│   │   ├── cooperative.routes.ts
│   │   ├── message.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── admin.routes.ts
│   │   └── upload.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── lender.controller.ts
│   │   ├── program.controller.ts
│   │   ├── borrower.controller.ts
│   │   ├── disbursement.controller.ts
│   │   ├── repayment.controller.ts
│   │   ├── farm-report.controller.ts
│   │   ├── farm-score.controller.ts
│   │   ├── field-agent.controller.ts
│   │   ├── cooperative.controller.ts
│   │   ├── message.controller.ts
│   │   ├── notification.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── farm-score.service.ts
│   │   └── notification.service.ts
│   ├── validators/
│   │   ├── auth.schema.ts
│   │   ├── program.schema.ts
│   │   ├── borrower.schema.ts
│   │   ├── disbursement.schema.ts
│   │   └── common.schema.ts
│   ├── types/
│   │   └── express.d.ts      # Extend Express Request with user
│   └── utils/
│       ├── api-error.ts      # Custom error class
│       ├── async-handler.ts  # Async route wrapper
│       ├── pagination.ts     # Pagination helpers
│       └── generate-id.ts    # FMR-xxxx, DSB-xxxx ID generators
├── .env.example              # (✅ done)
├── .gitignore                # (✅ done)
├── package.json              # (✅ done)
└── tsconfig.json             # (✅ done)
```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/register/lender` | Register lender organization + admin user | Public |
| POST | `/register/borrower` | Register borrower account | Public |
| POST | `/login` | Login (returns access + refresh tokens) | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | Revoke refresh token | Authenticated |
| POST | `/forgot-password` | Send password reset code | Public |
| POST | `/reset-password` | Reset password with code | Public |
| POST | `/verify-email` | Verify email with OTP | Authenticated |
| POST | `/2fa/enable` | Enable two-factor auth | Authenticated |
| POST | `/2fa/verify` | Verify 2FA code | Authenticated |
| GET | `/me` | Get current user profile | Authenticated |

### Lender Organizations (`/api/lenders`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List all lenders | Admin |
| GET | `/:id` | Get lender details | Admin / Own Lender |
| PATCH | `/:id` | Update lender org | Admin / Lender Admin |
| PATCH | `/:id/status` | Suspend/activate lender | Admin |
| GET | `/:id/stats` | Get lender dashboard stats | Lender |

### Programs (`/api/programs`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List programs (filterable) | Lender / Admin |
| GET | `/discover` | Browse available programs | Borrower |
| POST | `/` | Create program | Lender Admin |
| GET | `/:id` | Get program details | Lender / Borrower |
| PATCH | `/:id` | Update program | Lender Admin |
| PATCH | `/:id/status` | Change status | Lender Admin |

### Borrowers (`/api/borrowers`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List borrowers (search, filter, paginate) | Lender |
| GET | `/:id` | Get borrower detail | Lender / Own Borrower |
| PATCH | `/:id` | Update borrower profile | Own Borrower |
| GET | `/:id/loans` | Get borrower's loans | Lender / Own Borrower |
| POST | `/:id/apply/:programId` | Apply to a program | Borrower |

### Disbursements (`/api/disbursements`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List disbursements (filterable) | Lender |
| POST | `/` | Create disbursement request | Lender |
| PATCH | `/:id/approve` | Approve disbursement | Lender Admin |
| PATCH | `/:id/reject` | Reject disbursement | Lender Admin |
| POST | `/bulk-approve` | Bulk approve | Lender Admin |

### Repayments (`/api/repayments`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List repayments | Lender |
| POST | `/` | Record repayment | Lender / System |
| PATCH | `/:id/confirm` | Confirm repayment | Lender |
| GET | `/schedule/:loanId` | Get repayment schedule | Lender / Borrower |

### Farm Reports (`/api/farm-reports`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List reports | Lender / Borrower |
| POST | `/` | Submit farm report | Borrower |
| GET | `/:id` | Get report detail | Lender / Borrower |
| POST | `/:id/photos` | Upload report photos | Borrower |

### FarmScore (`/api/farm-score`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/:borrowerId` | Get current score | Lender / Borrower |
| GET | `/:borrowerId/history` | Get score history | Lender / Borrower |
| GET | `/:borrowerId/breakdown` | Get score components | Borrower |
| POST | `/recalculate/:borrowerId` | Force recalculation | Admin |

### Field Agents (`/api/field-agents`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List agents | Lender |
| POST | `/` | Register agent | Lender Admin |
| GET | `/:id` | Get agent detail | Lender |
| PATCH | `/:id` | Update agent | Lender Admin |
| GET | `/:id/stats` | Get performance stats | Lender |

### Cooperatives (`/api/cooperatives`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List cooperatives | Lender |
| POST | `/` | Register cooperative | Lender |
| GET | `/:id` | Get cooperative detail | Lender |
| PATCH | `/:id` | Update cooperative | Lender |

### Messages (`/api/messages`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/conversations` | List conversations | Lender / Borrower |
| GET | `/conversations/:id` | Get messages in conversation | Lender / Borrower |
| POST | `/conversations/:id` | Send message | Lender / Borrower |
| POST | `/broadcast` | Broadcast to program borrowers | Lender |
| PATCH | `/:id/read` | Mark as read | Authenticated |

### Notifications (`/api/notifications`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List notifications | Authenticated |
| PATCH | `/:id/read` | Mark as read | Authenticated |
| POST | `/read-all` | Mark all read | Authenticated |
| GET | `/unread-count` | Get unread count | Authenticated |

### Admin (`/api/admin`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/stats` | Platform-wide KPIs | Admin |
| GET | `/growth` | Growth metrics | Admin |
| GET | `/feature-flags` | List feature flags | Admin |
| PATCH | `/feature-flags/:id` | Toggle flag | Admin |
| GET | `/tickets` | List support tickets | Admin |
| PATCH | `/tickets/:id` | Update ticket | Admin |
| GET | `/system-health` | Service health status | Admin |
| GET | `/audit-logs` | Query audit trail | Admin |
| GET | `/revenue` | Revenue breakdown | Admin |

### Uploads (`/api/uploads`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/photo` | Upload a photo | Authenticated |
| POST | `/document` | Upload a document | Authenticated |

---

## Development Phases

### Phase 1: Foundation (Core Setup)
1. Express app with middleware (helmet, cors, morgan, rate-limit)
2. Prisma client singleton + database connection
3. Environment config (Zod-validated env parsing)
4. Global error handler + custom ApiError class
5. Async handler wrapper
6. Run first migration (`prisma migrate dev`)

### Phase 2: Authentication System
1. Register lender (org + user creation)
2. Register borrower (profile creation + farmer ID generation)
3. Login with bcrypt password comparison
4. JWT access token (15min) + refresh token (7d) flow
5. Refresh token rotation (revoke old, issue new)
6. Logout (revoke refresh token)
7. Password reset (OTP via email)
8. Email verification
9. Auth middleware (extract user from token, attach to req)
10. Role-based access guard middleware

### Phase 3: Lender & Program Management
1. Lender CRUD (admin manages all, lender manages own)
2. Program CRUD (create multi-step, update, change status)
3. Program filtering (by status, crop, state, type)
4. Dashboard statistics aggregation

### Phase 4: Borrower & Loan Management
1. Borrower profile management
2. Loan application flow (borrower applies → pending → approved)
3. Borrower listing with search, filter, pagination
4. Borrower detail view (loans, reports, score)
5. Status transitions (Active → At Risk → Defaulting)

### Phase 5: Disbursements & Repayments
1. Disbursement creation (layer-based)
2. Approve/reject flow with audit trail
3. Bulk approve endpoint
4. Repayment recording + confirmation
5. Repayment schedule generation
6. Auto-status updates (mark as At Risk if overdue)

### Phase 6: FarmScore Engine
1. Score calculation service (weighted components)
2. Score components: repayment history (35%), farm reports (25%), yield (18%), tenure (12%), activity (10%)
3. Score history tracking
4. Score recalculation triggers (on repayment, report, etc.)
5. Tier assignment (Platinum ≥750, Gold ≥650, Silver ≥500, Bronze <500)

### Phase 7: Farm Reports & File Uploads
1. Monthly report submission
2. Photo upload (Multer + local storage or S3)
3. GPS tagging on reports
4. Score points awarded on submission
5. Report history listing

### Phase 8: Messaging & Notifications
1. Conversation creation (lender ↔ borrower)
2. Message sending + retrieval
3. Broadcast to program borrowers
4. Notification service (create, list, read)
5. Unread count endpoint

### Phase 9: Field Agents & Cooperatives
1. Agent registration and management
2. Agent performance stats
3. Cooperative CRUD
4. Member count tracking

### Phase 10: Admin Panel APIs
1. Platform-wide statistics
2. Growth metrics (time series)
3. Feature flag management
4. Support ticket CRUD
5. System health endpoint
6. Audit log querying
7. Revenue breakdown

### Phase 11: Seed Data
1. Create seed.ts matching the frontend's mock data
2. Seed admin user, lender orgs, programs, borrowers
3. Seed disbursements, repayments, farm reports
4. Seed feature flags, tickets

---

## Auth Flow

```
┌─────────────┐      POST /auth/login        ┌─────────────┐
│   Client    │ ─────────────────────────────▶│   Server    │
│  (Frontend) │                               │  (Backend)  │
│             │◀───── { accessToken,          │             │
│             │        refreshToken }          │             │
└─────────────┘                               └─────────────┘

Access Token: JWT, 15min expiry, stored in memory
Refresh Token: opaque, 7d expiry, stored in httpOnly cookie

On 401 → call POST /auth/refresh with refresh token
        → get new access token (silent rotation)
```

### JWT Payload
```ts
{
  sub: string;       // user ID
  email: string;
  role: Role;
  lenderId?: string; // if lender user
  iat: number;
  exp: number;
}
```

---

## Security Measures

1. **Helmet** — HTTP security headers
2. **CORS** — Whitelist frontend origin only
3. **Rate Limiting** — 100 req/15min per IP (auth routes: 10 req/15min)
4. **Input Validation** — Zod schemas on every endpoint
5. **SQL Injection** — Prisma parameterized queries
6. **Password Hashing** — bcrypt (12 rounds)
7. **JWT Rotation** — Refresh tokens revoked on reuse
8. **Audit Trail** — Every write operation logged
9. **Role-Based Access** — Middleware guards on every route
10. **File Upload** — Type validation, size limits, sanitized filenames

---

## FarmScore Calculation

| Component | Weight | Max Points | Source |
|-----------|--------|-----------|--------|
| Repayment History | 35% | 300 | On-time repayments vs total due |
| Farm Reports | 25% | 200 | Monthly submissions, completeness |
| Crop Yield | 18% | 150 | Actual vs expected yield |
| Account Tenure | 12% | 100 | Months active on platform |
| Activity | 10% | 100 | Logins, report submissions, messages |

**Total: 850 points max**

Triggers recalculation:
- Repayment confirmed → +5-20 pts
- Farm report submitted → +10-20 pts
- Missed repayment → -15-30 pts
- Missed report deadline → -10 pts
- Consecutive on-time streak (5+) → +15 bonus

---

## Environment Variables

See `.env.example` for the full list. Critical ones:

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `PORT` | Server port (default 5000) |
| `FRONTEND_URL` | CORS whitelist |

---

## Running the Backend

```bash
cd backend
npm install
cp .env.example .env      # Edit with your DB credentials
npx prisma migrate dev    # Create tables
npm run db:seed           # Populate test data
npm run dev               # Start dev server on :5000
```

---

## Integration with Frontend

The frontend (Next.js on port 3000) calls the backend (Express on port 5000).

- Frontend stores access token in state/memory
- Frontend stores refresh token in httpOnly cookie
- API base URL: `http://localhost:5000/api` (dev) or via env var
- All API calls include `Authorization: Bearer <token>` header
- On 401 response, frontend silently refreshes and retries
