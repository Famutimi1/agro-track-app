# AgroTrack — Complete Executable Implementation Plan

**Source:** sample.md comprehensive architecture document  
**Current state:** Frontend (Next.js 14, 30+ pages with static data), Backend (Express + Prisma + JWT, 10 basic route modules)  
**Goal:** Full production-ready MVP matching sample.md specification

---

## Current State (What's Done)

### Frontend (Complete UI, No API Integration)
- [x] 30+ pages across Lender, Borrower, Admin dashboards
- [x] Landing page, auth flows (login, signup, register, forgot-password, 2FA)
- [x] Tailwind CSS + dark/light mode (next-themes)
- [x] Chart components (Recharts wrappers)
- [x] UI component library (Button, Card, Badge, Input, Modal, Toggle, ScoreRing, StarRating, StepIndicator)
- [x] Layout components (sidebars, topbars, footer, public-nav)

### Backend (Basic CRUD, No Integrations)
- [x] Express server with helmet, CORS, global rate limiting, morgan
- [x] Prisma ORM with PostgreSQL (simplified schema)
- [x] JWT auth (access + refresh tokens), bcrypt, role-based middleware
- [x] Zod validation middleware
- [x] Error handler + async wrapper + pagination utility
- [x] Routes: Auth, Lenders, Programs, Borrowers, Disbursements, Repayments, Farm Reports, FarmScore, Messages, Admin
- [x] Seed file with test accounts
- [x] TypeScript compiling clean

---

## Complete Gap Analysis

### Summary of What's Missing

| Category | Items Missing |
|----------|-------------|
| Backend modules | 9 entire modules |
| Config/integration clients | 7 config files + 4 integration clients |
| Job queue system | Queue setup + 5 workers + 2 schedulers |
| Middleware | 3 additional middleware |
| Database models | ~17 models |
| Database enums | 10 enums |
| Schema field gaps | 7 existing models need more fields |
| API endpoints | ~50+ endpoints |
| Frontend API layer | Entire client/state/hooks layer |
| Infrastructure | Docker, CI/CD, Redis, PostGIS, testing |
| Security features | 8 security upgrades |
| NPM packages | ~15 packages |
| Roles | 3 roles |

---

## Execution Phases

---

### PHASE 1: Infrastructure Foundation (Week 1)

**Goal:** Docker dev environment, Redis, logging, audit trail — everything else builds on this.

#### 1.1 Docker Development Environment

```
CREATE:
  backend/Dockerfile
  backend/.dockerignore
  backend/docker-compose.yml
```

**docker-compose.yml services:**
- `api` — Node.js app with hot-reload (tsx watch)
- `postgres` — PostgreSQL 16 with PostGIS extension (`postgis/postgis:16-3.4`)
- `redis` — Redis 7 Alpine

**Why:** One-command setup (`docker compose up`), ensures everyone has Postgres + Redis + PostGIS without manual installs.

#### 1.2 Redis Integration

```
INSTALL: ioredis
CREATE:
  backend/src/config/redis.ts
  backend/src/middlewares/cache.ts
```

**Redis usage map:**
| Use Case | Key Pattern | TTL |
|----------|-------------|-----|
| Dashboard stats | `cache:dashboard:{lenderId}` | 10 min |
| Program list | `cache:programs:{lenderId}` | 5 min |
| FarmScore | `cache:score:{borrowerId}` | 1 hour |
| BVN lookup | `cache:bvn:{bvn}` | 24 hours |
| Rate limit state | `ratelimit:{ip}:{route}` | 15 min |
| USSD sessions | `ussd:{sessionId}` | 180 sec |
| Token blacklist | `blacklist:{tokenHash}` | token remaining TTL |

#### 1.3 Winston Structured Logging

```
INSTALL: winston
CREATE:
  backend/src/config/logger.ts
```

- JSON format in production, pretty-print in dev
- Log levels: error, warn, info, debug
- Replace `console.log/error` throughout codebase
- Request ID tracking

#### 1.4 Audit Middleware

```
CREATE:
  backend/src/middlewares/audit.ts
```

- Auto-log all POST/PATCH/DELETE requests
- Capture: userId, action, resource, resourceId, before/after JSON snapshots, IP, userAgent
- Non-blocking (fire-and-forget)
- Add `before`/`after` and `userAgent` fields to AuditLog model

#### 1.5 Per-Route Rate Limiting

```
MODIFY:
  backend/src/middlewares/rate-limiter.ts (new, replaces global-only)
```

| Route | Limit |
|-------|-------|
| POST /auth/login | 5 per 15 min per IP |
| POST /auth/otp/send | 3 per 5 min per phone |
| POST /auth/register/* | 3 per hour per IP |
| POST /uploads/* | 20 per hour per user |
| General API | 100 per 15 min per user |

#### 1.6 Sentry Error Tracking

```
INSTALL: @sentry/node
MODIFY:
  backend/src/app.ts (add Sentry init + request handler)
  backend/src/middlewares/error-handler.ts (report to Sentry)
```

---

### PHASE 2: Database Schema Upgrade (Week 1-2)

**Goal:** Align Prisma schema with full sample.md specification.

#### 2.1 New Enums to Add

```prisma
enum ProgramType { LOAN, GRANT, HYBRID }
enum ApplicationStatus { PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN }
enum FarmReportStatus { DRAFT, SUBMITTED, VERIFIED, REJECTED }
enum CropGrowthStage { LAND_PREPARATION, PLANTING, GROWING, FLOWERING, HARVESTING }
enum CoopStatus { PENDING, ACTIVE, WATCH, SUSPENDED }
enum LenderPlan { STARTER, GROWTH, ENTERPRISE }
enum LenderStatus { ACTIVE, TRIAL, SUSPENDED, PENDING }
enum NotificationChannel { SMS, EMAIL, WHATSAPP, IN_APP, PUSH }
enum NotificationType { REPAYMENT_DUE, REPAYMENT_RECEIVED, DISBURSEMENT_RELEASED, APPLICATION_APPROVED, APPLICATION_REJECTED, FARM_REPORT_DUE, SCORE_UPDATED, SYSTEM_ALERT }
enum RepaymentMethod { BANK_TRANSFER, USSD, MOBILE_MONEY, PAYSTACK, IN_KIND }
```

#### 2.2 New Models to Add

```
Application
DisbursementLayer
LayerDisbursement
RepaymentSchedule
BorrowerDocument
Verification
AgentEarning
CoopMember
CoopGroupLoan
CoopLoanAllocation
CoopContribution
LenderFeatureFlag
BillingRecord
ApiKey
GlobalFeatureFlag
```

#### 2.3 Existing Models — Field Additions

**User:**
- Add `isActive Boolean @default(true)`

**LenderOrganization:**
- Add `regNumber String? @unique`
- Add `state String?`
- Add `status LenderStatus @default(PENDING)`
- Add `website String?`
- Add `trialEndsAt DateTime?`
- Change `plan` to use `LenderPlan` enum

**Program:**
- Add `type ProgramType @default(LOAN)`
- Add `totalPoolKobo BigInt?`
- Add `disbursedKobo BigInt @default(0)`
- Add `eligibilityCriteria Json?`
- Add `requiredDocuments Json?`
- Add `applicationDeadline DateTime?`
- Add `publishedAt DateTime?`
- Add `closedAt DateTime?`
- Add `layers DisbursementLayer[]` relation

**BorrowerProfile:**
- Add `bvnVerified Boolean @default(false)`
- Add `ninVerified Boolean @default(false)`
- Add `dateOfBirth DateTime?`
- Add `gender String?`
- Add `farmLatitude Float?`
- Add `farmLongitude Float?`
- Add `farmBoundaryGeoJson Json?`
- Add `cropTypes String[]`
- Add `profilePhotoUrl String?`
- Add `farmPhotoUrls String[]`
- Add `accountName String?`
- Add relation to `documents BorrowerDocument[]`

**FarmReport:**
- Add `applicationId String?`
- Add `reportingPeriod String?`
- Add `growthStage CropGrowthStage?`
- Add `challenges String[]`
- Add `labourExpenses BigInt?`
- Add `inputExpenses BigInt?`
- Add `estimatedYield Float?`
- Add `yieldUnit String?`
- Add `voiceNoteUrl String?`
- Add `status FarmReportStatus @default(SUBMITTED)`
- Add `verifiedById String?`
- Add `verifiedAt DateTime?`
- Add `scorePointsEarned Int @default(0)`

**FieldAgentProfile:**
- Add `lenderId String?`
- Add `agentCode String @unique`
- Add `zoneDescription String?`
- Add `totalRegistered Int @default(0)`
- Add `totalVerified Int @default(0)`
- Add `totalVisits Int @default(0)`
- Add `earningsKobo BigInt @default(0)`
- Add relations to `verifications Verification[]` and `earnings AgentEarning[]`

**Cooperative:**
- Add `registrationNumber String? @unique`
- Add `cropFocus String?`
- Add `chairUserId String?`
- Add `chairPhone String?`
- Add `status CoopStatus @default(PENDING)`
- Add `groupFarmScore Int @default(500)`
- Add `groupScoreGrade String @default("SILVER")`
- Add `savingsPerMemberKobo BigInt @default(0)`
- Add `guaranteeFundKobo BigInt @default(0)`
- Add relations to `coopMembers CoopMember[]`, `groupLoans CoopGroupLoan[]`, `contributions CoopContribution[]`

**Notification:**
- Add `channel NotificationChannel`
- Change `type` from String to `NotificationType` enum
- Add `sentAt DateTime?`
- Add `readAt DateTime?`

**AuditLog:**
- Add `before Json?`
- Add `after Json?`
- Add `userAgent String?`

#### 2.4 New Roles

Add to Role enum: `FIELD_SUPERVISOR`, `COOP_CHAIR`, `LENDER_ANALYST`

#### 2.5 Update Seed File

Update `prisma/seed.ts` to include:
- DisbursementLayers for existing programs
- Sample Application records
- BorrowerDocuments
- CoopMembers
- FieldAgent with agentCode
- GlobalFeatureFlags with plan-gating

---

### PHASE 3: Loan Application & Layered Disbursement (Week 2-3)

**Goal:** The core business flow — borrower applies, lender reviews, money releases in layers.

#### 3.1 Application Module

```
CREATE:
  backend/src/validators/application.schema.ts
  backend/src/services/application.service.ts
  backend/src/controllers/application.controller.ts
  backend/src/routes/application.routes.ts
```

**Endpoints:**
- `POST /api/applications` — Borrower submits (validate eligibility, FarmScore >= program.requiredScore, BVN verified)
- `GET /api/applications` — List (filterable: status, programId, borrowerId)
- `GET /api/applications/:id` — Detail with disbursement layers
- `POST /api/applications/:id/review` — Move to UNDER_REVIEW
- `POST /api/applications/:id/approve` — Approve + auto-create LayerDisbursement records
- `POST /api/applications/:id/reject` — Reject with reason
- `POST /api/applications/:id/withdraw` — Borrower withdraws

**Business Logic:**
- Validate borrower meets program eligibility (state, crop, score)
- Check program pool has sufficient remaining funds
- On approval: create LayerDisbursement records for each DisbursementLayer
- Emit `application:status` Socket.IO event
- Send notification (SMS + in-app)

#### 3.2 Layered Disbursement Engine

```
CREATE:
  backend/src/services/layer-disbursement.service.ts
  backend/src/controllers/layer-disbursement.controller.ts
  backend/src/routes/layer-disbursement.routes.ts
```

**How Layers Work:**
1. Program defines N layers (e.g., Layer 1: 30% at approval, Layer 2: 40% after planting proof, Layer 3: 30% after harvest)
2. Each layer has: `triggerCondition`, `requiredProof`, `percentShare`
3. Layer 1 auto-triggers on application approval
4. Layer N+1 unlocks ONLY after Layer N proof is verified
5. Borrower submits proof (photos, GPS, farm report link)
6. Lender reviews proof → approve → triggers Paystack transfer

**Endpoints:**
- `GET /api/layer-disbursements` — List (by application, status)
- `GET /api/layer-disbursements/pending` — Pending proof queue
- `POST /api/layer-disbursements/:id/submit-proof` — Borrower submits proof docs
- `POST /api/layer-disbursements/:id/approve` — Lender approves → trigger payment
- `POST /api/layer-disbursements/:id/reject` — Reject proof with reason

#### 3.3 Paystack Payment Integration

```
INSTALL: axios (for Paystack API calls)
CREATE:
  backend/src/config/paystack.ts
  backend/src/services/payment.service.ts
  backend/src/controllers/payment.controller.ts
  backend/src/routes/payment.routes.ts
```

**Flows:**
| Flow | How |
|------|-----|
| Disburse to farmer | Paystack Transfer API → farmer's bank account |
| Collect repayment | Paystack Transaction Initialize → payment page |
| Verify payment | Paystack webhook → update repayment status |

**Endpoints:**
- `POST /api/payments/disburse` — Initiate transfer to borrower
- `POST /api/payments/collect` — Generate Paystack payment link for repayment
- `POST /api/payments/webhook` — Paystack webhook (verify signature!)
- `GET /api/payments/verify/:reference` — Manual verify

**Security:**
- Verify `x-paystack-signature` header using HMAC SHA512
- Idempotency: check reference before processing
- Retry logic for failed transfers

---

### PHASE 4: File Uploads & KYC Verification (Week 3)

**Goal:** Farmers can upload photos/docs, identity gets verified.

#### 4.1 S3 File Upload Service

```
INSTALL: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
CREATE:
  backend/src/config/s3.ts
  backend/src/services/upload.service.ts
  backend/src/controllers/upload.controller.ts
  backend/src/routes/upload.routes.ts
  backend/src/middlewares/upload.middleware.ts
```

**S3 Folder Structure:**
```
agrotrack-uploads/
├── farm-photos/{borrowerId}/{timestamp}.jpg
├── documents/{borrowerId}/{docType}/{timestamp}.pdf
├── voice-notes/{borrowerId}/{timestamp}.mp3
├── verification-photos/{agentId}/{borrowerId}/{timestamp}.jpg
├── reports/{lenderId}/{reportId}.pdf
└── logos/{lenderId}/logo.png
```

**Upload Flow (Presigned URL):**
1. Frontend → `POST /api/uploads/presign` (file type, size, category)
2. Backend validates → returns presigned PUT URL (15 min expiry)
3. Frontend uploads directly to S3 (bypasses backend)
4. Frontend → `POST /api/uploads/confirm` (S3 key)
5. Backend validates file exists → stores key in DB

**Endpoints:**
- `POST /api/uploads/presign` — Get presigned upload URL
- `POST /api/uploads/confirm` — Confirm upload completed
- `GET /api/uploads/:key/signed-url` — Get presigned download URL (1 hour)
- `DELETE /api/uploads/:key` — Delete file

**Validation:**
- Max file size: 10MB (photos), 20MB (documents)
- Allowed types: jpg, jpeg, png, pdf, mp3, mp4
- Rate limit: 20 uploads per hour per user

#### 4.2 BVN/NIN Verification

```
CREATE:
  backend/src/integrations/nibss/nibss.client.ts
  backend/src/integrations/nibss/nibss.types.ts
  backend/src/integrations/nimc/nimc.client.ts
  backend/src/integrations/nimc/nimc.types.ts
  backend/src/services/kyc.service.ts
  backend/src/controllers/kyc.controller.ts
  backend/src/routes/kyc.routes.ts
```

**Endpoints:**
- `POST /api/kyc/verify-bvn` — Call NIBSS, match name/DOB, set `bvnVerified = true`
- `POST /api/kyc/verify-nin` — Call NIMC, match name/DOB, set `ninVerified = true`
- `GET /api/kyc/status/:borrowerId` — Check verification status

**Logic:**
- BVN verification required before loan application
- Cache BVN result in Redis (24 hour TTL) — immutable
- Store BVN/NIN encrypted at rest (AES-256)
- If NIBSS returns name mismatch → flag for manual review

#### 4.3 PII Encryption

```
INSTALL: crypto (Node built-in, no package needed)
CREATE:
  backend/src/utils/crypto.ts
```

- Encrypt: BVN, NIN, bank account numbers before storing
- Decrypt: on read for authorized users only
- AES-256-GCM encryption
- Encryption key from env variable

#### 4.4 Borrower Document Management

```
MODIFY:
  backend/src/services/borrower.service.ts (add document methods)
  backend/src/controllers/borrower.controller.ts (add document endpoints)
```

**Endpoints:**
- `POST /api/borrowers/:id/documents` — Upload + create BorrowerDocument record
- `GET /api/borrowers/:id/documents` — List all documents
- `POST /api/borrowers/:id/documents/:docId/verify` — Mark verified (lender/agent)

---

### PHASE 5: Notifications & Real-Time (Week 3-4)

**Goal:** Multi-channel notifications + live updates.

#### 5.1 Socket.IO Real-Time Server

```
INSTALL: socket.io
CREATE:
  backend/src/config/socket.ts
  backend/src/services/realtime.service.ts
```

**Events emitted by server:**
| Event | Trigger | Recipients |
|-------|---------|-----------|
| `notification:new` | Any notification created | Target user |
| `disbursement:approved` | Layer disbursement approved | Borrower |
| `application:status` | Application status change | Borrower + lender |
| `message:received` | New chat message | Conversation participants |
| `repayment:confirmed` | Paystack webhook confirms payment | Borrower + lender |
| `farmscore:updated` | Score recalculated | Borrower |
| `system:alert` | System-wide alert | All admins |

**Auth:** JWT token passed on socket connection, verify on handshake.

#### 5.2 Multi-Channel Notification Service

```
INSTALL: @sendgrid/mail
CREATE:
  backend/src/services/notification.service.ts
  backend/src/services/sms.service.ts
  backend/src/services/email.service.ts
  backend/src/templates/notifications.ts
  backend/src/controllers/notification.controller.ts
  backend/src/routes/notification.routes.ts
```

**Notification Templates:**
| Type | SMS | Email | In-App |
|------|-----|-------|--------|
| REPAYMENT_DUE | "Your repayment of ₦X is due on DATE. Dial *737*99# to pay." | Full email | Bell notification |
| DISBURSEMENT_RELEASED | "₦X (Layer N) sent to your BANK account." | Full email | Bell notification |
| APPLICATION_APPROVED | "Your loan application for PROGRAM has been approved!" | Full email | Bell notification |
| APPLICATION_REJECTED | "Your application was not approved. Reason: X" | Full email | Bell notification |
| FARM_REPORT_DUE | "Monthly farm report due. Submit via app or *737*99#" | — | Bell notification |
| SCORE_UPDATED | "FarmScore updated: X (GRADE)" | — | Bell notification |

**Endpoints:**
- `GET /api/notifications` — List user's notifications (paginated)
- `PATCH /api/notifications/:id/read` — Mark as read
- `PATCH /api/notifications/read-all` — Mark all as read
- `GET /api/notifications/unread-count` — For bell badge

**Delivery logic:**
- In-app: always (DB + Socket.IO)
- SMS: for REPAYMENT_DUE, DISBURSEMENT_RELEASED, APPLICATION status
- Email: for all (if user has email)
- Queue via Bull (non-blocking)

#### 5.3 SMS Service (Termii)

```
CREATE:
  backend/src/config/termii.ts
  backend/src/services/sms.service.ts
```

- Termii API for Nigerian SMS delivery
- OTP sending + verification
- Template-based messages
- Delivery status tracking

#### 5.4 Bull Job Queue

```
INSTALL: bullmq
CREATE:
  backend/src/jobs/queue.ts
  backend/src/jobs/workers/notification.worker.ts
  backend/src/jobs/workers/farmscore.worker.ts
  backend/src/jobs/workers/repayment.worker.ts
  backend/src/jobs/workers/report.worker.ts
  backend/src/jobs/workers/disbursement.worker.ts
  backend/src/jobs/schedulers/daily.scheduler.ts
  backend/src/jobs/schedulers/weekly.scheduler.ts
```

**Queue definitions:**
| Queue | Purpose | Trigger |
|-------|---------|---------|
| `notifications` | Send SMS/Email async | Any notification event |
| `farmscore` | Recalculate score | Repayment, report, verification events |
| `repayments` | Check overdue | Daily cron (midnight) |
| `reports` | Generate PDF | User requests report |
| `disbursements` | Auto-release layer 1 | Application approved |

**Schedulers:**
- Daily midnight: check overdue repayments, send reminders
- Weekly Sunday: batch FarmScore recalculation for all active borrowers

---

### PHASE 6: Field Agents & Cooperatives (Week 4-5)

**Goal:** On-ground operations — farmer registration, farm verification, cooperative loans.

#### 6.1 Field Agent Module (Full)

```
CREATE:
  backend/src/services/field-agent.service.ts
  backend/src/controllers/field-agent.controller.ts
  backend/src/routes/field-agent.routes.ts
  backend/src/validators/field-agent.schema.ts
```

**Endpoints:**
- `GET /api/agents` — List agents (filterable by state, lender, rating)
- `POST /api/agents` — Create/invite agent (assign zone, generate agentCode)
- `GET /api/agents/:id` — Agent profile + stats
- `PATCH /api/agents/:id` — Update agent details
- `GET /api/agents/:id/tasks` — Assigned verification tasks
- `GET /api/agents/:id/earnings` — Earnings breakdown
- `POST /api/agents/:id/payout` — Request payout
- `POST /api/agents/verify` — Submit farm verification

**Farm Verification Flow:**
1. Agent assigned to verify a borrower's farm
2. Agent visits farm, captures GPS coordinates
3. Agent walks farm perimeter (GPS boundary = GeoJSON polygon)
4. Agent takes photos (uploaded to S3)
5. Agent submits verification (`POST /api/agents/verify`)
6. System calculates farm area from boundary (Turf.js)
7. Compare with self-reported farm size
8. Verification triggers FarmScore recalculation

**Agent Earnings:**
| Activity | Earning |
|----------|---------|
| Farmer registration | ₦500 |
| Farm verification | ₦1,000 |
| Monthly monitoring visit | ₦300 |

#### 6.2 Cooperative Module (Full)

```
CREATE:
  backend/src/services/cooperative.service.ts (rewrite/expand)
  backend/src/controllers/cooperative.controller.ts (rewrite/expand)
  backend/src/routes/cooperative.routes.ts (rewrite/expand)
  backend/src/validators/cooperative.schema.ts
```

**Endpoints:**
- `GET /api/cooperatives` — List cooperatives (filterable)
- `POST /api/cooperatives` — Register cooperative
- `GET /api/cooperatives/:id` — Detail + members + score
- `PATCH /api/cooperatives/:id` — Update
- `POST /api/cooperatives/:id/members` — Add member (requires consent)
- `DELETE /api/cooperatives/:id/members/:borrowerId` — Remove member
- `POST /api/cooperatives/:id/loans` — Apply for group loan
- `GET /api/cooperatives/:id/loans` — Group loan history
- `POST /api/cooperatives/:id/contributions` — Record monthly contribution
- `GET /api/cooperatives/:id/contributions` — Contribution history
- `GET /api/cooperatives/:id/score` — Group FarmScore (avg of members)

**Group Loan Flow:**
1. Coop chair submits group application (`POST /cooperatives/:id/loans`)
2. Each member must give consent (in-app or USSD)
3. System calculates allocation per member (proportional to farm size or equal)
4. Lender approves group loan
5. Individual LayerDisbursements created per member
6. Repayment tracked individually, but group responsibility enforced

---

### PHASE 7: USSD & WhatsApp (Week 5-6)

**Goal:** Reach farmers without smartphones.

#### 7.1 USSD Integration

```
INSTALL: africastalking (npm package)
CREATE:
  backend/src/config/africastalking.ts
  backend/src/services/ussd.service.ts
  backend/src/controllers/ussd.controller.ts
  backend/src/routes/ussd.routes.ts
```

**Endpoint:** `POST /api/ussd/session` (Africa's Talking webhook)

**Menu Tree:**
```
*737*99# → Welcome, {name}! Main Menu
  1 → Loan Balance
      → "Loan: {program}. Balance: ₦{amount}. Next payment: ₦{due} on {date}" END
  2 → Make Payment
      → Select method:
          1 → Bank transfer ("Pay ₦{amount} to Acc: {acc}, Bank: {bank}, Ref: {ref}") END
          2 → Mobile money (initiate Paystack USSD charge) END
          3 → In-kind ("Collection scheduled. Agent will contact you.") END
  3 → Submit Farm Report
      → Select crop stage: 1.Land Prep 2.Planting 3.Growing 4.Flowering 5.Harvesting
      → Select challenges: 1.None 2.Pest 3.Drought 4.Flood 5.Disease 6.Other
      → "Report submitted! +5 FarmScore points" END
  4 → My FarmScore
      → "Score: {score}/850 ({grade}). Tip: {tip}" END
  5 → Browse Programs
      → List top 3 eligible programs
          1-3 → "{name}: ₦{min}-₦{max}, {rate}% interest, {months}mo"
              1 → "Application started! Complete on app or visit agent." END
  0 → "Thank you for using AgroTrack!" END
```

**Session state:** Redis with 180 second TTL. Stateless on carrier side.

**Requirements:**
- Response must be < 500ms (carrier SLA)
- Max 182 characters per response
- Handle network timeouts gracefully

#### 7.2 WhatsApp Business Bot

```
CREATE:
  backend/src/config/whatsapp.ts
  backend/src/services/whatsapp.service.ts
  backend/src/controllers/whatsapp.controller.ts
  backend/src/routes/whatsapp.routes.ts
```

**Endpoints:**
- `POST /api/whatsapp/webhook` — Receive messages from Meta
- `GET /api/whatsapp/webhook` — Meta webhook verification (challenge response)

**Intent Routing:**
| Message | Action |
|---------|--------|
| "balance" / "loan" | Show loan balance + next payment |
| "pay" / "repay" | Send payment options (button template) |
| "report" / "farm" | Start farm report flow |
| "score" / "farmscore" | Show current FarmScore |
| "help" / "menu" | Show all available commands |
| "apply" / "programs" | Show eligible programs |
| Photo attachment | Save as farm report photo (if active report session) |
| Voice note | Save as voice note for farm report |

**Template Messages (outbound):**
- Repayment reminder (3 days before due)
- Disbursement notification
- Application status update
- Monthly farm report reminder

---

### PHASE 8: Enhanced FarmScore & Geospatial (Week 6-7)

**Goal:** Production-grade scoring matching sample.md spec + real map features.

#### 8.1 Enhanced FarmScore Engine

```
MODIFY:
  backend/src/services/farm-score.service.ts (complete rewrite)
CREATE:
  backend/src/services/farmscore/engine.ts
  backend/src/services/farmscore/components.ts
  backend/src/services/farmscore/triggers.ts
```

**Scoring Formula (0–850):**
| Component | Weight | Max Points | How Calculated |
|-----------|--------|-----------|----------------|
| Identity Completeness | 20% | 170 | BVN verified (50) + NIN verified (50) + photo uploaded (30) + all docs (40) |
| Farm Verification | 20% | 170 | GPS captured (50) + agent visited (60) + boundary mapped (40) + size matches (20) |
| Repayment History | 30% | 255 | On-time rate × streak bonus. Late = -15pts. Consistent = +12pts/month |
| Farm Activity Reporting | 15% | 127 | Reports submitted / expected. Quality score (photos, detail). Consistency |
| Cooperative Standing | 10% | 85 | Member (20) + regular contributions (30) + group score bonus (35) |
| Geographic Risk | 5% | 43 | Inverse risk: flood zone (-20), conflict area (-30), market proximity (+15) |

**Grade Mapping:**
| Score | Grade |
|-------|-------|
| 750–850 | PLATINUM |
| 650–749 | GOLD |
| 500–649 | SILVER |
| 0–499 | BRONZE |

**Score Triggers (auto-recalculate):**
- Repayment recorded or missed → immediate
- Farm report submitted + verified → immediate
- Field agent verification completed → immediate
- Cooperative membership changes → immediate
- Weekly batch (Sunday midnight) → all active borrowers

**Additional Endpoints:**
- `GET /api/farmscore/:borrowerId` — Score + breakdown + grade
- `GET /api/farmscore/:borrowerId/history` — Score over time
- `GET /api/farmscore/:borrowerId/report` — Export PDF score report
- `POST /api/farmscore/api/query` — External bank API (paid, ₦500-₦2000/query)

#### 8.2 Geospatial Layer (PostGIS)

```
INSTALL: @turf/turf
CREATE:
  backend/src/services/geo.service.ts
  backend/src/controllers/geo.controller.ts
  backend/src/routes/geo.routes.ts
```

**PostGIS Setup:**
- Enable PostGIS extension in PostgreSQL
- Add spatial indexes on borrower farm coordinates
- Store farm boundaries as GeoJSON polygons

**Spatial Queries:**
- Find borrowers within radius of a point
- Cluster borrowers by state/LGA for heat map
- Calculate farm area from boundary polygon
- Check if coordinate is inside flood zone

**Endpoints:**
- `GET /api/geo/borrowers?lat=X&lng=Y&radius=50km` — Nearby borrowers
- `GET /api/geo/clusters?state=Oyo` — Clustered view for map
- `POST /api/geo/calculate-area` — Calculate farm area from boundary
- `GET /api/geo/risk-zones` — Flood/conflict zone overlays

**SQL examples:**
```sql
-- Borrowers within 50km of a point
SELECT * FROM borrowers 
WHERE ST_DWithin(
  ST_MakePoint(farm_longitude, farm_latitude)::geography,
  ST_MakePoint(7.49, 9.05)::geography, 50000
);

-- Spatial index
CREATE INDEX idx_borrowers_geo ON borrowers 
USING GIST (ST_MakePoint(farm_longitude, farm_latitude));
```

---

### PHASE 9: Auth Hardening & Security (Week 7)

**Goal:** Production-grade security matching sample.md Section 8.

#### 9.1 Complete Auth Endpoints

```
MODIFY:
  backend/src/controllers/auth.controller.ts
  backend/src/routes/auth.routes.ts
  backend/src/validators/auth.schema.ts
```

**Missing endpoints to add:**
- `POST /api/auth/otp/send` — Send OTP to phone (via Termii)
- `POST /api/auth/otp/verify` — Verify OTP code
- `POST /api/auth/2fa/setup` — Generate TOTP secret + QR code
- `POST /api/auth/2fa/verify` — Verify TOTP code on login
- `POST /api/auth/password/forgot` — Send reset code (email + SMS)
- `POST /api/auth/password/reset` — Reset with code

#### 9.2 Token Security Upgrade

```
INSTALL: otplib (for TOTP 2FA)
MODIFY:
  backend/src/services/auth.service.ts
  backend/src/middlewares/auth.ts
```

**Changes:**
- Refresh token stored as HttpOnly cookie (not in response body)
- Token blacklisting in Redis (not DB delete — faster)
- Refresh token rotation: on every refresh, old token blacklisted
- Replay detection: if old refresh token used after rotation → revoke ALL user sessions
- 2FA via TOTP (Google Authenticator compatible) + SMS fallback

#### 9.3 Webhook Security

```
CREATE:
  backend/src/utils/webhook-verify.ts
```

- Paystack: verify `x-paystack-signature` header (HMAC SHA512)
- Meta WhatsApp: verify `X-Hub-Signature-256`
- Africa's Talking: verify source IP whitelist

#### 9.4 API Key Management (for external FarmScore API)

```
CREATE:
  backend/src/services/apikey.service.ts
  backend/src/controllers/apikey.controller.ts
  backend/src/routes/apikey.routes.ts
  backend/src/middlewares/apikey.middleware.ts
```

- `POST /api/api-keys` — Generate API key (show once, store hash)
- `GET /api/api-keys` — List keys (masked)
- `DELETE /api/api-keys/:id` — Revoke
- Middleware: authenticate external requests via `X-API-Key` header

---

### PHASE 10: Reports & PDF Generation (Week 7-8)

**Goal:** Exportable reports for lenders + compliance.

#### 10.1 Report Generation Service

```
INSTALL: pdfkit (or puppeteer for HTML→PDF)
CREATE:
  backend/src/services/report.service.ts
  backend/src/controllers/report.controller.ts
  backend/src/routes/report.routes.ts
```

**Endpoints:**
- `GET /api/reports/portfolio` — Portfolio performance metrics
- `GET /api/reports/impact` — Impact metrics (farmers reached, hectares financed)
- `GET /api/reports/state/:state` — State-level breakdown
- `POST /api/reports/generate` — Generate async PDF (returns job ID)
- `GET /api/reports/:reportId/download` — Download generated PDF (from S3)
- `GET /api/reports/:reportId/status` — Check generation status

**Report Types:**
| Report | Contents |
|--------|----------|
| Portfolio Summary | Total disbursed, repaid, default rate, active loans, by program |
| Impact Report | Farmers reached, hectares, yield improvement, gender breakdown |
| State Report | Per-state breakdown of all metrics |
| Borrower Report | Individual farmer history (for credit reference) |
| FarmScore Report | Score breakdown + history + recommendations |
| Compliance Export | Full audit trail for regulatory submission |

**Flow:**
1. User requests report → `POST /api/reports/generate`
2. Job queued in Bull → returns `{ jobId, status: "processing" }`
3. Worker generates PDF → uploads to S3
4. User polls or receives Socket.IO notification when ready
5. Download via presigned S3 URL

---

### PHASE 11: Frontend API Integration (Week 8-9)

**Goal:** Replace ALL static mock data with live API calls.

#### 11.1 API Client Layer

```
INSTALL (in frontend): axios, @tanstack/react-query, zustand
CREATE:
  frontend/lib/api/client.ts
  frontend/lib/api/auth.ts
  frontend/lib/api/programs.ts
  frontend/lib/api/borrowers.ts
  frontend/lib/api/applications.ts
  frontend/lib/api/disbursements.ts
  frontend/lib/api/repayments.ts
  frontend/lib/api/farm-reports.ts
  frontend/lib/api/farm-score.ts
  frontend/lib/api/messages.ts
  frontend/lib/api/notifications.ts
  frontend/lib/api/admin.ts
  frontend/lib/api/uploads.ts
```

**client.ts pattern:**
```typescript
// Axios instance with JWT auto-attach + 401 auto-refresh
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, async (err) => {
  if (err.response?.status === 401) {
    await useAuthStore.getState().refreshToken();
    return api.request(err.config);
  }
  return Promise.reject(err);
});
```

#### 11.2 State Management (Zustand)

```
CREATE:
  frontend/lib/store/auth-store.ts      — User session, tokens, login/logout
  frontend/lib/store/notification-store.ts — Unread count, bell state
  frontend/lib/store/ui-store.ts        — Sidebar collapsed, active modal
```

#### 11.3 React Query Hooks

```
CREATE:
  frontend/lib/hooks/usePrograms.ts
  frontend/lib/hooks/useBorrowers.ts
  frontend/lib/hooks/useDashboard.ts
  frontend/lib/hooks/useApplications.ts
  frontend/lib/hooks/useRepayments.ts
  frontend/lib/hooks/useNotifications.ts
  frontend/lib/hooks/useFarmScore.ts
```

**Pattern:**
```typescript
export const useBorrowers = (filters) => useQuery({
  queryKey: ['borrowers', filters],
  queryFn: () => borrowersApi.getAll(filters),
  staleTime: 5 * 60 * 1000,
});
```

#### 11.4 Real-Time Client

```
INSTALL (in frontend): socket.io-client
CREATE:
  frontend/lib/hooks/useSocket.ts
  frontend/lib/hooks/useNotifications.ts (real-time bell)
```

- Connect on login, disconnect on logout
- Subscribe to user-specific room
- Update notification count on `notification:new`
- Toast on `disbursement:approved`, `message:received`

#### 11.5 Additional Frontend Components Needed

```
CREATE:
  frontend/components/shared/file-upload.tsx    — Drag & drop (presigned URL flow)
  frontend/components/shared/gps-capture.tsx    — Geolocation API capture
  frontend/components/shared/otp-input.tsx      — 6-digit OTP entry
  frontend/components/shared/data-table.tsx     — Reusable sortable/filterable table
```

#### 11.6 Remove Static Data

```
DELETE (once API integration complete):
  frontend/lib/data/landing-data.ts
  frontend/lib/data/programs.ts
  frontend/lib/data/borrowers.ts
  frontend/lib/data/disbursements.ts
  frontend/lib/data/borrower-data.ts
  frontend/lib/data/admin-data.ts
```

Replace all imports in pages with React Query hooks.

#### 11.7 Mapbox GL JS Integration

```
INSTALL (in frontend): mapbox-gl, @types/mapbox-gl
MODIFY:
  frontend/app/(lender)/map-view/page.tsx — Replace SVG with real Mapbox map
```

- Real map with borrower markers
- Click marker → borrower popup
- Cluster view at zoom levels
- Heat map overlay option
- Farm boundary polygon display

#### 11.8 PWA Support

```
INSTALL (in frontend): next-pwa
CREATE:
  frontend/public/manifest.json
  frontend/public/icons/ (192x192, 512x512)
MODIFY:
  frontend/next.config.js (add PWA config)
```

- Offline detection + fallback page
- Cache API responses for offline viewing
- Push notification permission

#### 11.9 Nigerian Constants

```
CREATE:
  frontend/lib/constants/states.ts      — All 36 states + FCT with LGAs
  frontend/lib/constants/crops.ts       — Common Nigerian crops
  frontend/lib/constants/banks.ts       — Nigerian bank list (for account setup)
  frontend/lib/constants/routes.ts      — All route paths as constants
```

---

### PHASE 12: Testing & CI/CD (Week 9-10)

**Goal:** Confidence to deploy to production.

#### 12.1 Backend Testing

```
INSTALL: jest, @types/jest, ts-jest, supertest, @types/supertest
CREATE:
  backend/jest.config.ts
  backend/tests/setup.ts               — Test DB setup/teardown
  backend/tests/unit/farmscore.test.ts
  backend/tests/unit/auth.test.ts
  backend/tests/unit/crypto.test.ts
  backend/tests/integration/auth.test.ts
  backend/tests/integration/programs.test.ts
  backend/tests/integration/applications.test.ts
  backend/tests/integration/disbursements.test.ts
  backend/tests/integration/repayments.test.ts
  backend/tests/integration/farmscore.test.ts
```

**Critical test scenarios:**
```
Auth:
  ✓ Register lender → login → get me
  ✓ Register borrower → login → get profile
  ✓ Refresh token rotation works
  ✓ Expired token returns 401
  ✓ Rate limiting blocks after 5 failed logins
  ✓ 2FA blocks login without code

Loan Lifecycle:
  ✓ Create program → borrower applies → approve → layer 1 disburses
  ✓ Layer 2 blocks until proof submitted + verified
  ✓ Rejected application cannot be re-approved
  ✓ Application fails if FarmScore too low

FarmScore:
  ✓ New verified borrower starts at ~520
  ✓ On-time repayment increases score by ~12
  ✓ Late repayment decreases score by ~15
  ✓ Score never goes below 0 or above 850
  ✓ Cooperative membership adds bonus

Security:
  ✓ Webhook without valid signature returns 401
  ✓ Lender cannot see another lender's borrowers
  ✓ Borrower cannot access admin endpoints
  ✓ SQL injection attempts are blocked
```

#### 12.2 Frontend Testing

```
INSTALL (in frontend): vitest, @testing-library/react, playwright
CREATE:
  frontend/vitest.config.ts
  frontend/tests/e2e/lender-flow.spec.ts
  frontend/tests/e2e/borrower-flow.spec.ts
```

**E2E critical paths:**
- Lender: login → view dashboard → create program → approve application
- Borrower: register → browse programs → apply → submit farm report
- Admin: login → view stats → toggle feature flag → suspend lender

#### 12.3 CI/CD Pipeline

```
CREATE:
  .github/workflows/test.yml
  .github/workflows/deploy-staging.yml
  .github/workflows/deploy-production.yml
```

**test.yml (on every PR):**
- Lint (ESLint)
- Type check (tsc --noEmit)
- Unit tests
- Integration tests (with test DB)

**deploy-staging.yml (on push to develop):**
- Run tests
- Build Docker image
- Deploy to staging
- Run migration

**deploy-production.yml (on push to main):**
- Run tests
- Build Docker image
- Deploy to production
- Run migration
- Smoke test health endpoint

---

## Additional Items from sample.md

### Lender Admin Endpoints (currently incomplete)

- `GET /api/admin/lenders` — All lender accounts (with search, plan filter)
- `POST /api/admin/lenders/:id/suspend` — Suspend lender
- `POST /api/admin/lenders/:id/reactivate` — Reactivate
- `GET /api/admin/lenders/:id/billing` — Billing history
- `GET /api/admin/system-health` — Service status (DB, Redis, S3, Paystack, Termii)
- `GET /api/admin/audit-logs` — Full audit trail with filters

### Message Broadcasting

- `POST /api/messages/broadcast` — Send to all borrowers in a program, state, or cooperative

### Cursor-Based Pagination

Replace all offset pagination with cursor-based:
```json
GET /api/borrowers?cursor=ckl...&limit=20
Response: { data: [...], meta: { nextCursor: "ckm...", hasMore: true, total: 23450 } }
```

### Additional Roles

Add to system: `FIELD_SUPERVISOR` (manages multiple agents), `COOP_CHAIR` (cooperative leader), `LENDER_ANALYST` (read-only analytics)

---

## Recommended Execution Order

**If starting today, do these in order:**

1. Phase 2 (Schema upgrade) — everything depends on the right data model
2. Phase 1 (Infrastructure) — Docker + Redis unlocks caching, queues, sessions
3. Phase 3 (Applications + Layered Disbursement) — core business logic
4. Phase 4 (Uploads + KYC) — needed for proof submission
5. Phase 5 (Notifications + Real-time) — needed for user engagement
6. Phase 9 (Auth hardening) — needed before any public deployment
7. Phase 11 (Frontend integration) — makes the app actually work end-to-end
8. Phase 6 (Field agents + Cooperatives) — operational features
9. Phase 7 (USSD + WhatsApp) — reach expansion
10. Phase 8 (FarmScore + Geo) — advanced features
11. Phase 10 (Reports) — business reporting
12. Phase 12 (Testing + CI/CD) — ship with confidence

---

## Estimated Timeline

| Phase | Duration | Depends On |
|-------|----------|-----------|
| Phase 1: Infrastructure | 1 week | Nothing |
| Phase 2: Schema Upgrade | 3-4 days | Nothing |
| Phase 3: Applications + Disbursement | 1.5 weeks | Phase 2 |
| Phase 4: Uploads + KYC | 1 week | Phase 1 (S3), Phase 2 |
| Phase 5: Notifications + Real-time | 1.5 weeks | Phase 1 (Redis, Socket) |
| Phase 6: Field Agents + Cooperatives | 1.5 weeks | Phase 2 |
| Phase 7: USSD + WhatsApp | 1.5 weeks | Phase 1 (Redis), Phase 5 (SMS) |
| Phase 8: FarmScore + Geospatial | 1 week | Phase 1 (PostGIS), Phase 6 |
| Phase 9: Auth Hardening | 1 week | Phase 1 (Redis) |
| Phase 10: Reports | 1 week | Phase 4 (S3) |
| Phase 11: Frontend Integration | 2 weeks | Phases 3-5 |
| Phase 12: Testing + CI/CD | 1.5 weeks | All above |

**Total: ~14-16 weeks for full implementation**
**MVP (Phases 1-5 + 9 + 11): ~8-9 weeks**

---

## NPM Packages to Install

### Backend (add to package.json):
```
ioredis           — Redis client
bullmq            — Job queue (Redis-backed)
socket.io         — WebSocket server
@aws-sdk/client-s3 — S3 file storage
@aws-sdk/s3-request-presigner — Presigned URLs
@sendgrid/mail    — Transactional email
africastalking    — USSD gateway
otplib            — TOTP 2FA generation
@sentry/node      — Error monitoring
winston           — Structured logging
pdfkit            — PDF generation
@turf/turf        — Geospatial calculations
```

### Frontend (add to package.json):
```
axios                  — HTTP client
@tanstack/react-query  — Server state management
zustand                — Client state management
socket.io-client       — WebSocket client
mapbox-gl              — Real maps
react-dropzone         — File upload drag & drop
next-pwa               — PWA support
react-hook-form        — Form management
@hookform/resolvers    — Zod resolver for RHF
```
