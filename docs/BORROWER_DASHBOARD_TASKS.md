# AgroTrack Borrower Dashboard - Implementation Tasks

**Generated:** 2026-06-30  
**Last Updated:** 2026-07-14 (audited against actual codebase after Phase 1 + Phase 2 work)  
**Source:** docs/agrotrack-borrower-spec (1).md (Production Feature Specification)  
**Total Tasks:** 95

---

## Overview

This document tracks the implementation progress of the AgroTrack Borrower Dashboard. Each task is marked with a checkbox that can be checked off when completed.

> **2026-07-14 audit note:** The original doc (2026-06-30) described the dashboard as "entirely static/mock." That is no longer accurate. Phase 1 (real API integration across all 8 pages) and Phase 2 (repayment modal, farm-report photo/GPS upload, notification preference matrix, application eligibility check) are complete. The status table and checkboxes below have been re-audited against the actual code. Remaining work is concentrated in Phase 3 (enhanced features), Phase 4 (polish/security/i18n), and Phase 5 (USSD/WhatsApp).

### Status Legend
- [ ] Not started
- [x] Completed
- 🔄 In progress / partial

### Current Implementation Status

| Page | Status | Completion |
|------|--------|------------|
| Overview | ✅ API INTEGRATED | 80% (KPIs, charts, activity feed live; no GPS/programmes cards) |
| My Loans | 🔄 MOSTLY DONE | 70% (list + schedule + 4-channel repayment modal live; no layer breakdown/documents) |
| Farm Reports | 🔄 MOSTLY DONE | 70% (multi-photo S3 upload + GPS + past reports live; no EXIF/voice/offline) |
| FarmScore | 🔄 API INTEGRATED | 60% (6 components + history live; no share/PDF; components differ from spec — see 4.1) |
| Messages | 🔄 API + WEBSOCKET | 55% (real-time chat live; no voice/photo/notification-hub tab) |
| Discover | 🔄 MOSTLY DONE | 70% (cards + eligibility + multi-step apply live; no doc upload/info-request) |
| Applications | 🔄 MOSTLY DONE | 75% (list + new + detail + withdraw live; no doc upload/info-request response) |
| Settings | 🔄 PARTIAL | 40% (profile + bank + notification matrix live; no KYC/security/privacy/i18n) |
| USSD / WhatsApp Bot | ❓ STUBS EXIST | backend service files present, not audited here |
| Shared Components | ✅ DONE | 85% (guard, API client, hooks live; no i18n) |

---

## Page 1 — Overview

**Purpose:** The farmer's home screen — at-a-glance view of active loan, next payment, FarmScore, and quick actions.

**File:** `frontend/app/borrower/overview/page.tsx`

### KPI Cards Section
- [x] **TASK 1.1:** Integrate real API for KPI cards
  - Endpoint: `GET /api/v1/borrowers/:id/dashboard`
  - Cards: Active Loan Amount, Total Repaid, Next Payment (amount + due date), FarmScore (with tier badge)
  - Backend: Create borrower dashboard aggregation endpoint
  - **Files:** `backend/src/services/borrower.service.ts`, `backend/src/controllers/borrower.controller.ts`

- [x] **TASK 1.2:** Add FarmScore tier badge with link to FarmScore page
  - Badge shows: Bronze (0-499), Silver (500-649), Gold (650-749), Platinum (750-850)
  - Clicking badge navigates to `/borrower/farm-score`
  - Color-coded per tier

- [x] **TASK 1.3:** Add "Next Payment" CTA button
  - Shows amount + due date prominently
  - Button: "Pay Now" → opens repayment modal (Paystack/Bank Transfer/USSD/In-Kind)
  - If no active loan: show "Browse Programs" CTA instead

### Quick Actions Section
- [x] **TASK 1.4:** Implement quick action buttons row
  - "Submit Farm Report" → `/borrower/farm-reports`
  - "Browse Programs" → `/borrower/discover`
  - "View My Loans" → `/borrower/loans`
  - "Messages" → `/borrower/messages` (with unread badge count)

### Charts Section
- [x] **TASK 1.5:** Connect loan history chart to real backend data
  - Endpoint: `GET /api/v1/borrowers/:id/loan-history`
  - Bar chart showing disbursed vs repaid per loan
  - X axis: Loan names, Y axis: Amount in ₦

- [x] **TASK 1.6:** Connect FarmScore history chart to real backend data
  - Endpoint: `GET /api/v1/borrowers/:id/score-history`
  - Line chart showing score progression over time
  - Show score delta indicator (+15 pts last report)

### Activity Feed
- [ ] **TASK 1.7:** Connect recent activity feed to real backend data
  - Endpoint: `GET /api/v1/borrowers/:id/activities?limit=10`
  - Events: Payment made, Disbursement received, Farm report submitted, Application status change, FarmScore update, Message received
  - Each entry: icon, description, timestamp, link to relevant page

### GPS Farm Summary
- [x] **TASK 1.8:** Add GPS farm summary card
  - Shows farm GPS coordinates, farm size, primary crop
  - Mini map embed (OpenStreetMap/Leaflet)
  - "Update Farm Location" button → GPS capture flow

### Active Programmes Summary
- [x] **TASK 1.9:** Add active programmes summary card
  - Lists programmes farmer is currently eligible for
  - Shows match % and deadline countdown
  - "View All" → `/borrower/discover`

### Backend Requirements
```typescript
// Routes needed:
GET /api/v1/borrowers/:id/dashboard          // KPI cards + summary
GET /api/v1/borrowers/:id/loan-history        // Loan history chart
GET /api/v1/borrowers/:id/score-history       // Score history chart
GET /api/v1/borrowers/:id/activities          // Activity feed
GET /api/v1/borrowers/:id/farm-summary        // GPS farm info
GET /api/v1/borrowers/:id/eligible-programs   // Active programmes summary
```

---

## Page 2 — My Loans

**Purpose:** Full view of all farmer's loans — active and historical — with repayment management.

**File:** `frontend/app/borrower/loans/page.tsx`

### Loan List
- [x] **TASK 2.1:** Integrate real API for loan list
  - Endpoint: `GET /api/v1/borrowers/:id/loans`
  - Support multiple loans (current impl only shows one)
  - Each loan card: programme name, lender, amount, progress bar, status badge
  - Filter tabs: Active, Completed, All

- [ ] **TASK 2.2:** Implement loan detail expansion
  - Click loan card → expand to show full details
  - Or navigate to `/borrower/loans/[id]` detail page
  - Show: disbursement layers, repayment schedule, documents, farm reports linked

### Disbursement Layers
- [x] **TASK 2.3:** Display 3-layer disbursement breakdown
  - Layer 1: Land Preparation (₦ amount, status: disbursed/pending)
  - Layer 2: Planting & Inputs (₦ amount, status)
  - Layer 3: Crop Maintenance (₦ amount, status)
  - Each layer shows unlock requirement: "Submit farm report for [stage] to unlock"
  - Visual: locked/unlocked icons per layer

### Repayment Schedule
- [x] **TASK 2.4:** Connect repayment schedule to real API
  - Endpoint: `GET /api/v1/loans/:id/repayments`
  - Table: Due date, Amount, Status (Paid/Due/Overdue/Upcoming), Payment method
  - Color coding: Green (paid), Amber (due), Red (overdue), Gray (upcoming)
  - Summary bar: Total disbursed, Total repaid, Outstanding balance

### Repayment Modal
- [x] **TASK 2.5:** Implement repayment modal with 4 channels
  - **Paystack (in-app):** Card payment via Paystack inline checkout
    - `POST /api/v1/repayments/paystack` → returns authorization URL
    - Show payment confirmation screen
  - **Bank Transfer:** Show dedicated virtual account number + reference
    - `POST /api/v1/repayments/bank-transfer` → generates unique reference
    - Instructions: Bank, Account Number, Amount, Reference code
    - "I've Made Transfer" button → polls for confirmation
  - **USSD:** Show USSD code `*737*99#` with instructions
    - Display reference code for tracking
  - **In-Kind Produce:** Form to declare produce type, quantity, delivery location
    - `POST /api/v1/repayments/in-kind` with body: { produceType, quantityKg, deliveryLocation }
    - Status: PENDING_VERIFICATION until agent confirms receipt

- [ ] **TASK 2.6:** Add payment confirmation flow
  - After payment: show success screen with receipt
  - Update repayment status in real-time (WebSocket)
  - SMS notification: "Payment of N85,000 confirmed. Balance: N255,000."
  - FarmScore update notification if applicable

### Loan Documents
- [x] **TASK 2.7:** Add loan documents section
  - Display: Loan agreement, Disbursement receipts, Repayment receipts
  - Each document: download button, upload date, file type icon
  - Endpoint: `GET /api/v1/loans/:id/documents`

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/loans              // Loan list
GET  /api/v1/loans/:id                        // Loan detail
GET  /api/v1/loans/:id/repayments             // Repayment schedule
GET  /api/v1/loans/:id/documents              // Loan documents
POST /api/v1/repayments/paystack              // Paystack payment
POST /api/v1/repayments/bank-transfer         // Bank transfer reference
POST /api/v1/repayments/in-kind               // In-kind produce declaration
GET  /api/v1/repayments/:id/status            // Payment status polling
```

---

## Page 3 — Farm Reports

**Purpose:** Farmers submit periodic farm activity reports that unlock disbursement layers and build FarmScore.

**File:** `frontend/app/borrower/farm-reports/page.tsx`

### Report Submission Form
- [ ] **TASK 3.1:** Implement GPS photo capture
  - Use browser Geolocation API to capture GPS coordinates with each photo
  - Display captured coordinates on a mini map
  - Store GPS metadata with each photo
  - `POST /api/v1/farm-reports` with body: { loanId, cropStage, estimatedYield, notes, photos: [{ fileUrl, gpsLat, gpsLng, capturedAt }] }

- [x] **TASK 3.2:** Implement multi-photo upload (3-5 photos)
  - Minimum 3 photos required, maximum 5
  - Photo preview thumbnails with remove option
  - Upload progress indicator per photo
  - File validation: JPG/PNG, max 5MB per photo
  - Use cloud storage (S3/Cloudinary) for photo hosting

- [ ] **TASK 3.3:** Add EXIF metadata extraction
  - Extract timestamp, GPS coordinates from photo EXIF data
  - Validate GPS matches farm location (within 1km tolerance)
  - Flag if photo GPS doesn't match declared farm location
  - Show warning: "Photo location does not match your registered farm location"

- [ ] **TASK 3.4:** Add crop stage dropdown with all stages
  - Options: Land Preparation, Planting, Growing, Flowering, Harvesting, Post-Harvest
  - Each stage maps to a disbursement layer
  - Show which layer this report will unlock

- [x] **TASK 3.5:** Add challenges/issues multi-select
  - Options: None (Good progress), Pests, Drought, Flooding, Labour shortage, Input shortage, Disease, Other
  - "Other" reveals free-text input
  - Challenges affect FarmScore activity reporting component

- [ ] **TASK 3.6:** Add voice note recording option
  - Record audio via browser MediaRecorder API
  - Upload voice note with report (+2 FarmScore points)
  - Playback preview before submit
  - Max 2 minutes recording

### Report Deadline & Layer Unlock
- [ ] **TASK 3.7:** Display report deadline tracking
  - Show deadline date for current report period
  - Countdown: "Due in X days"
  - Color: Green (>7 days), Amber (3-7 days), Red (<3 days), Overdue
  - Endpoint: `GET /api/v1/borrowers/:id/report-deadline`

- [x] **TASK 3.8:** Display layer unlock indicators
  - Show which disbursement layer this report unlocks
  - Visual: Layer 1 ✅ unlocked, Layer 2 ✅ unlocked, Layer 3 🔒 (submit harvest report to unlock)
  - Progress: "2 of 3 layers unlocked"

### Past Reports List
- [x] **TASK 3.9:** Connect past reports to real API
  - Endpoint: `GET /api/v1/borrowers/:id/farm-reports`
  - Each report: date, crop stage, photos count, verification status, FarmScore points earned
  - Verification status: PENDING, VERIFIED, REJECTED
  - Click to expand: full report details, photos gallery, agent notes

- [x] **TASK 3.10:** Add report verification status display
  - PENDING: "Awaiting verification by field agent"
  - VERIFIED: "Verified by [agent name] on [date]" + +5 FarmScore points
  - REJECTED: "Rejected: [reason]" + resubmit button

### Offline Support
- [ ] **TASK 3.11:** Implement offline draft support
  - Save report draft to IndexedDB when offline
  - Auto-sync when connection restored
  - Show "Draft saved offline" indicator
  - Queue photos for upload when back online

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/farm-reports        // Past reports list
POST /api/v1/farm-reports                      // Submit new report
GET  /api/v1/farm-reports/:id                  // Report detail
GET  /api/v1/borrowers/:id/report-deadline     // Current deadline
POST /api/v1/farm-reports/:id/resubmit         // Resubmit rejected report
// Storage: S3/Cloudinary for photos and voice notes
```

---

## Page 4 — FarmScore

**Purpose:** Transparent credit score display — farmer sees exactly how their score is calculated and how to improve it.

**File:** `frontend/app/borrower/farm-score/page.tsx`

### Score Display
- [ ] **TASK 4.1:** Fix score breakdown to match spec's 6 components
  - **Current (WRONG):** 5 components (Repayment History, Farm Reports, Crop Yield, Tenure, Account Activity)
  - **Spec (CORRECT):** 6 components:
    1. Identity Verification (max 170 pts · 20%)
    2. Farm Verification (max 170 pts · 20%)
    3. Repayment History (max 255 pts · 30%)
    4. Activity Reporting (max 127 pts · 15%)
    5. Cooperative Standing (max 85 pts · 10%)
    6. Geographic Risk (max 43 pts · 5%)
  - Each component: progress bar, current points / max points, percentage weight

- [ ] **TASK 4.2:** Add detailed point breakdown per component
  - Expandable section per component showing all point-earning actions
  - Example (Identity Verification): BVN verified +60, NIN verified +50, Profile photo +10, Farm GPS +20, Agent visit +30
  - Show which actions are completed (✅) vs pending (☐)

- [x] **TASK 4.3:** Add tier badge with comparison
  - Badge: Bronze (0-499), Silver (500-649), Gold (650-749), Platinum (750-850)
  - Tier comparison table showing benefits per tier
  - "You need X more points to reach [next tier]"

- [x] **TASK 4.4:** Add score delta indicator
  - Show "+15 pts since last report" or "-5 pts (late payment)"
  - Arrow up (green) / arrow down (red)
  - Tooltip explaining what caused the change

### Score History
- [x] **TASK 4.5:** Connect score history chart to real API
  - Endpoint: `GET /api/v1/borrowers/:id/score-history?months=12`
  - Line chart: X axis = months, Y axis = score (0-850)
  - Tier bands as background shading (Bronze/Silver/Gold/Platinum zones)
  - Hover tooltip: date, score, reason for change

### Improvement Tips
- [x] **TASK 4.6:** Connect improvement tips to real data
  - Dynamic tips based on weakest component
  - Example: "Pay your July repayment on time for +12 points"
  - Example: "Submit farm report with voice note for +2 bonus points"
  - Example: "Complete agent monitoring visit for +10 points"
  - Each tip: actionable, shows potential points, links to relevant page

### Share & Export
- [ ] **TASK 4.7:** Implement "Share with Bank" feature
  - Button: "Share My FarmScore"
  - Modal: select lender/bank from dropdown
  - `POST /api/v1/borrowers/:id/share-score` with body: { lenderId }
  - Generates shareable link or sends directly to lender
  - Shows list of lenders who have accessed score + revoke button

- [x] **TASK 4.8:** Implement PDF download of FarmScore report
  - Generate PDF with: current score, tier, all 6 component breakdowns, history chart, improvement tips
  - Use jsPDF + html2canvas
  - PDF generated in farmer's selected language
  - `GET /api/v1/borrowers/:id/score-pdf` (backend generates or frontend renders)

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/farm-score           // Current score + breakdown
GET  /api/v1/borrowers/:id/score-history         // Score history chart data
GET  /api/v1/borrowers/:id/score-breakdown       // Detailed point breakdown
POST /api/v1/borrowers/:id/share-score           // Share with lender
GET  /api/v1/borrowers/:id/shared-lenders         // Lenders with access
POST /api/v1/borrowers/:id/revoke-score-access   // Revoke lender access
GET  /api/v1/borrowers/:id/score-pdf              // PDF download
```

---

## Page 5 — Messages

**Purpose:** Real-time communication channel between farmer and lender, plus system notification hub.

**File:** `frontend/app/borrower/messages/page.tsx`

### Chat Interface
- [x] **TASK 5.1:** Integrate WebSocket for real-time messaging
  - Connect to `ws://api/v1/ws` with auth token
  - Real-time message send/receive
  - Connection status indicator (connected/reconnecting/offline)
  - Auto-reconnect on disconnection
  - **Files:** `backend/src/config/socket.ts`, `frontend/lib/socket/`

- [ ] **TASK 5.2:** Add conversation header with lender info
  - Lender name, avatar, programme name
  - Online/offline indicator
  - "Last seen" timestamp
  - Quick info: lender phone number, response time

- [ ] **TASK 5.3:** Add delivery status indicators
  - Sent: ✓ (single check)
  - Delivered: ✓✓ (double check, gray)
  - Read: ✓✓ (double check, blue)
  - Timestamp on each message

### Rich Messaging Features
- [ ] **TASK 5.4:** Add quick reply chips
  - Suggested reply buttons above input: "Yes", "No", "I'll do that today", "Thank you"
  - Context-aware suggestions based on last message
  - Tap to send instantly

- [ ] **TASK 5.5:** Add voice note recording
  - Press-and-hold mic button to record
  - Waveform visualization during recording
  - Max 2 minutes
  - Playback preview before send
  - Upload to cloud storage, send URL in message

- [ ] **TASK 5.6:** Add photo attachment
  - Camera button in input bar
  - Take photo or select from gallery
  - Preview before send
  - Upload to cloud storage, show thumbnail in chat

- [ ] **TASK 5.7:** Add system message pills
  - System messages styled differently (centered, gray background)
  - Types: "Application submitted", "Payment received", "Farm report due", "Disbursement released"
  - Non-replyable, informational only

### Notification Hub Tab
- [ ] **TASK 5.8:** Add notification hub tab
  - Tab toggle: "Chat" | "Notifications"
  - Notifications list: repayment reminders, disbursement alerts, application updates, FarmScore changes
  - Each notification: icon, title, description, timestamp, read/unread status
  - Mark as read on tap
  - Filter: All, Unread, Repayments, Applications, System

### SMS Fallback
- [ ] **TASK 5.9:** Implement SMS fallback for offline farmers
  - If farmer offline >24hrs, critical messages sent via SMS (Termii)
  - WhatsApp fallback if opted in
  - In-app shows: "This message was also sent via SMS because you were offline"

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/conversations        // Conversation list
GET  /api/v1/conversations/:id/messages         // Message history
POST /api/v1/conversations/:id/messages          // Send message
POST /api/v1/conversations/:id/voice-note         // Upload voice note
POST /api/v1/conversations/:id/photo             // Upload photo
GET  /api/v1/borrowers/:id/notifications         // Notification list
PATCH /api/v1/notifications/:id/read             // Mark as read
// WebSocket: ws://api/v1/ws (real-time messaging)
// SMS fallback via Termii API
```

---

## Page 6 — Discover Programs

**Purpose:** Match-based programme discovery — farmer sees programmes they qualify for and can apply directly.

**File:** `frontend/app/borrower/discover/page.tsx`

### Match Score Banner
- [x] **TASK 6.1:** Add match score banner at top
  - "You match 4 programmes" with average match %
  - "Based on your FarmScore, location, and crop types"
  - Link to "How matching works" info modal

### Programme Cards
- [x] **TASK 6.2:** Connect programme cards to real API
  - Endpoint: `GET /api/v1/borrowers/:id/eligible-programs`
  - Each card: programme name, lender, match %, amount range, interest rate, type (Loan/Grant)
  - Match progress bar (color-coded: green ≥90%, blue 70-89%, amber <70%)
  - Eligible states chips, eligible crops chips
  - Deadline countdown: "Closes in X days"

- [ ] **TASK 6.3:** Add programme detail view
  - Click card → expand or navigate to detail page
  - Full programme info: description, eligibility criteria, required documents, disbursement layers, repayment terms
  - "Check Eligibility" button → runs eligibility check
  - "Apply Now" button → opens application form

### Filter & Search
- [x] **TASK 6.4:** Add filter/sort bar
  - Filter: Programme type (Loan/Grant), Interest rate range, Amount range, State, Crop type
  - Sort: Best match, Lowest interest, Highest amount, Soonest deadline
  - Search bar: search by programme name or lender
  - Filter chips: active filters shown with remove option

### Active Applications Status
- [ ] **TASK 6.5:** Add active application status cards _(partial: duplicate-application prevention done — cards on discover now show "Application in progress"/"Approved" and disable Apply; the dedicated "Your Active Applications" section above the programme list is still pending)_
  - Section above programme list: "Your Active Applications"
  - Shows applications in PENDING/UNDER_REVIEW status
  - Each card: programme name, status badge, submitted date, "View" link
  - [x] Prevents duplicate application to same programme

### Multi-Step Application Form
- [x] **TASK 6.6:** Implement multi-step application form
  - **Step 1: Programme Selection** (pre-filled if applied from card)
  - **Step 2: Loan Details** — amount (within min/max), purpose, purpose detail
  - **Step 3: Eligibility Check** — system verifies FarmScore, location, crop types, existing loans
    - Show pass/fail per criterion
    - If fail: show what's needed to become eligible
  - **Step 4: Documents** — upload required documents (BVN cert, NIN slip, farm photos, cooperative letter, land title)
    - Document checklist per programme requirements
    - Upload progress per document
  - **Step 5: Review & Submit** — summary of all info, terms agreement checkbox, submit
  - `POST /api/v1/applications` with full body

- [x] **TASK 6.7:** Add eligibility check before application
  - `GET /api/v1/borrowers/:id/eligibility/:programId`
  - Checks: FarmScore ≥ minimum, state in eligible states, crop in eligible crops, no active duplicate application, not locked (60% repayment rule)
  - Show results as pass/fail checklist before allowing application

- [x] **TASK 6.8:** Add document upload in application form
  - Required documents per programme (from programme config)
  - Photo capture or file upload
  - Cloud storage upload with progress
  - Document preview before submit
  - Validation: file type, file size

### Application Response Flow
- [x] **TASK 6.9:** Implement "Respond to Info Request" flow
  - When lender requests more info, application shows "Action Required" badge
  - Farmer uploads missing documents
  - `POST /api/v1/applications/:id/respond-info` with documents + notes
  - Application status returns to PENDING

- [x] **TASK 6.10:** Implement application withdrawal
  - "Withdraw Application" button (only if PENDING or UNDER_REVIEW)
  - Confirmation dialog
  - `POST /api/v1/applications/:id/withdraw`
  - Status → WITHDRAWN, can re-apply if programme still accepting

### Business Rules Enforcement
- [ ] **TASK 6.11:** Enforce application business rules (frontend validation)
  - Cannot have two ACTIVE applications to same programme
  - Can apply to multiple different programmes simultaneously
  - Once approved, cannot apply to another programme until current loan reaches 60% repayment
  - Rejected applications: re-submit after 90 days
  - Applications expire after 30 days of inactivity

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/eligible-programs      // Eligible programmes with match %
GET  /api/v1/programs/:id                          // Programme detail
GET  /api/v1/borrowers/:id/eligibility/:programId  // Eligibility check
POST /api/v1/applications                          // Submit application
POST /api/v1/applications/:id/respond-info         // Respond to info request
POST /api/v1/applications/:id/withdraw             // Withdraw application
GET  /api/v1/borrowers/:id/applications             // Active applications
// Storage: S3/Cloudinary for application documents
```

---

## Page 7 — Applications (List + Detail + New)

**Purpose:** Track all loan applications — drafts, submitted, under review, approved, rejected.

**Files:**
- `frontend/app/borrower/applications/page.tsx` (list)
- `frontend/app/borrower/applications/new/page.tsx` (new application form)
- `frontend/app/borrower/applications/[id]/page.tsx` (detail)

### Applications List
- [x] **TASK 7.1:** Connect applications list to real API
  - Endpoint: `GET /api/v1/borrowers/:id/applications`
  - Stats cards: Total, Pending, Approved, Drafts (real counts)
  - Status filter buttons: ALL, DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
  - Application cards: programme name, amount, submitted date, status icon, status-specific message

- [ ] **TASK 7.2:** Add pagination and search _(partial: client-side search + sort added; pagination still pending)_
  - Cursor-based pagination for large lists
  - Search by application ID or programme name
  - Sort: Newest, Oldest, Highest amount

- [x] **TASK 7.3:** Fix route consistency
  - **Current bug:** applications/page.tsx links to `/borrower-applications/new` and `/borrower-applications/${id}`
  - **Should be:** `/borrower/applications/new` and `/borrower/applications/${id}`
  - Fix all Link hrefs to use correct route prefix

### New Application Page
- [x] **TASK 7.4:** Connect new application form to real API
  - Replace hardcoded `programs` array with API fetch
  - `GET /api/v1/borrowers/:id/eligible-programs` for programme selection
  - `POST /api/v1/applications` for submission
  - Show real eligibility status per programme

- [x] **TASK 7.5:** Add real document upload in application form
  - **Current:** documents are just string array (non-functional)
  - Replace with actual file upload to cloud storage
  - Document types: farm photos, land document, bank statement, cooperative letter, etc.
  - Upload progress, file validation, preview

- [x] **TASK 7.6:** Add eligibility check display
  - Before allowing application, show eligibility checklist
  - FarmScore ≥ minimum, state eligible, crops eligible, no duplicate active application
  - If ineligible: show reason and disable submit

- [x] **TASK 7.7:** Add success flow after submission
  - **Current:** just shows `alert("Application submitted successfully!")`
  - Replace with success screen: application ID, "What happens next" timeline, SMS confirmation info
  - Auto-redirect to application detail page after 3 seconds

### Application Detail Page
- [x] **TASK 7.8:** Connect application detail to real API
  - Endpoint: `GET /api/v1/applications/:id`
  - Replace `mockApplication` with real data
  - Real timeline events from backend
  - Real document list with download links

- [x] **TASK 7.9:** Add "Respond to Info Request" UI
  - When status = INFO_REQUESTED: show upload form for missing documents
  - Document upload with cloud storage
  - `POST /api/v1/applications/:id/respond-info`
  - Success: status returns to UNDER_REVIEW

- [x] **TASK 7.10:** Implement withdrawal functionality
  - **Current:** just `alert("Application withdrawn.")`
  - Replace with `POST /api/v1/applications/:id/withdraw`
  - Confirmation dialog with warning
  - Success: status → WITHDRAWN, redirect to list

- [x] **TASK 7.11:** Add "Contact Lender" functionality
  - **Current:** just `alert("Opening chat with lender...")`
  - Navigate to `/borrower/messages` with lender conversation pre-selected
  - Or open chat modal overlay

- [x] **TASK 7.12:** Add repayment estimate calculation
  - **Current:** hardcoded repayment estimate
  - Calculate from programme interest rate, amount, tenure
  - Show: principal, interest, total, monthly payment, tenure
  - Real calculation matching backend formula

### Backend Requirements
```typescript
// Routes needed:
GET  /api/v1/borrowers/:id/applications            // Applications list
GET  /api/v1/applications/:id                       // Application detail
POST /api/v1/applications                            // Submit new application
POST /api/v1/applications/:id/respond-info           // Respond to info request
POST /api/v1/applications/:id/withdraw               // Withdraw application
GET  /api/v1/borrowers/:id/eligible-programs         // Eligible programmes for form
```

---

## Page 8 — Settings

**Purpose:** Full account control — profile, bank account, notifications, language, security, and data privacy.

**File:** `frontend/app/borrower/settings/page.tsx`

### Section 1: My Profile
- [ ] **TASK 8.1:** Add KYC verification status display
  - BVN: ✅ Verified — show last 4 digits
  - NIN: ✅ Verified
  - Farm GPS: ✅ Verified — show coordinates
  - Agent Visit: ✅ Verified — show date and agent name
  - If any unverified: show "Verify Now" button with flow

- [ ] **TASK 8.2:** Lock verified fields (read-only after verification)
  - Full name: read-only after BVN verification (tied to BVN record)
  - Phone number: read-only (this IS the account login)
  - Date of birth: read-only after NIN verification
  - Show lock icon next to locked fields
  - Tooltip: "This field is locked after verification. Contact support to change."

- [ ] **TASK 8.3:** Add editable farm information fields
  - Primary crop (editable)
  - Secondary crops (editable, multi-select)
  - Farm size (editable — with warning: "Changes trigger re-verification")
  - "Update Farm Location" button → GPS capture flow
  - State, LGA (editable)

- [ ] **TASK 8.4:** Add profile photo upload
  - Current photo or placeholder initials
  - Upload new photo button
  - Cloud storage upload with preview
  - Photo used in lender dashboard profile view

- [ ] **TASK 8.5:** Add Farmer ID display
  - System-generated ID (FMR-0034)
  - Read-only, displayed prominently
  - Copy to clipboard button

### Section 2: Bank Account
- [ ] **TASK 8.6:** Display current bank account (partially masked)
  - Bank name, account number (masked: 3••• •••• 7721), account name
  - Status: ✅ Verified via Paystack
  - Show verification date

- [ ] **TASK 8.7:** Implement bank account update flow with Paystack
  - Step 1: Enter new account number
  - Step 2: Select bank from dropdown (all Nigerian banks)
  - Step 3: System calls Paystack to resolve account name
  - Step 4: "Confirm your account name is: [resolved name]"
  - Step 5: OTP confirmation (sent to registered phone)
  - Step 6: Old account archived, new account active
  - `POST /api/v1/borrowers/:id/bank-account` → `POST /api/v1/borrowers/:id/verify-bank`

- [ ] **TASK 8.8:** Add mobile money option
  - OPay, PalmPay, Moniepoint number fields
  - Set as primary disbursement method
  - Each with verification flow

### Section 3: Notifications
- [x] **TASK 8.9:** Implement notification preferences matrix
  - **Current:** 4 non-functional toggle items
  - **Spec:** Full matrix of events × channels:
    - Events: Repayment reminders, Disbursement received, Application updates, Farm report due, FarmScore changes, New programmes, Messages
    - Channels: In-App, SMS, WhatsApp, Email
  - 7×4 toggle grid
  - `PATCH /api/v1/users/:id/notification-preferences`

- [ ] **TASK 8.10:** Add reminder timing controls
  - Repayment reminder: X days before due date (1 / 3 / 7 days — radio selection)
  - Farm report reminder: X days before deadline (3 / 7 / 14 days — radio selection)

- [ ] **TASK 8.11:** Add quiet hours setting
  - "Do not send SMS between: [from time] and [to time]"
  - Default: 10pm - 7am
  - Note: "Critical alerts (payment confirmed, disbursement received) always sent immediately"

### Section 4: Language & Accessibility
- [ ] **TASK 8.12:** Implement functional language selection
  - **Current:** 4 language options (non-functional)
  - **Spec:** 5 languages: English, Hausa (هَوُسَ), Yoruba, Igbo, Nigerian Pidgin
  - Selecting changes all in-app text (i18n)
  - Future SMS/WhatsApp messages sent in selected language
  - FarmScore PDF generated in selected language
  - `PATCH /api/v1/users/:id/preferences` with body: { language: "EN" | "HA" | "YO" | "IG" | "PC" }

- [ ] **TASK 8.13:** Add accessibility settings
  - Font size: Small / Medium (default) / Large
  - High contrast mode toggle (for outdoor use in bright sunlight)
  - Voice navigation: Enable (browser text-to-speech for form labels)
  - Persist settings in user preferences

### Section 5: Security
- [ ] **TASK 8.14:** Add active sessions management
  - List all devices currently logged in
  - Each: device description, location, last active timestamp
  - "Sign out" button per device
  - "Sign out everywhere" button
  - `GET /api/v1/users/:id/sessions`, `DELETE /api/v1/sessions/:id`

- [ ] **TASK 8.15:** Add change PIN/password functionality
  - Enter current password
  - Enter new password (min 8 chars, strength indicator)
  - Confirm new password
  - `POST /api/v1/users/:id/change-password`

- [ ] **TASK 8.16:** Add delete account (deactivation) flow
  - Multi-step: warning → type "DELETE" → OTP confirmation → deactivate
  - Warning: "Deleting your account will not erase your FarmScore or loan history — kept for regulatory compliance"
  - Account deactivated (not deleted — CBN 7-year rule)
  - `POST /api/v1/users/:id/deactivate` with body: { confirmText: "DELETE", otp }

### Section 6: Data & Privacy
- [ ] **TASK 8.17:** Add "Download all my data" feature (NDPR right to access)
  - Exports everything AgroTrack holds about the farmer
  - JSON or PDF format
  - `GET /api/v1/borrowers/:id/export-data`

- [ ] **TASK 8.18:** Add FarmScore access history
  - List all lenders who have accessed FarmScore
  - Each entry: lender name, access date, purpose
  - "Revoke Access" button per lender
  - `GET /api/v1/borrowers/:id/score-access-log`, `POST /api/v1/borrowers/:id/revoke-score-access`

- [ ] **TASK 8.19:** Add USSD access management
  - Enable/Disable USSD access (*737*99#)
  - USSD PIN change (4-digit)
  - `PATCH /api/v1/users/:id/ussd-settings`

### Backend Requirements
```typescript
// Routes needed:
GET   /api/v1/borrowers/:id                        // Profile read
PATCH /api/v1/borrowers/:id                         // Profile update (limited fields)
POST  /api/v1/borrowers/:id/bank-account            // Bank account update
POST  /api/v1/borrowers/:id/verify-bank             // Bank verification (Paystack)
PATCH /api/v1/users/:id/notification-preferences    // Notification matrix
PATCH /api/v1/users/:id/preferences                  // Language + accessibility
GET   /api/v1/users/:id/sessions                    // Active sessions
DELETE /api/v1/sessions/:id                         // Revoke session
POST  /api/v1/users/:id/change-password             // Change password
POST  /api/v1/users/:id/deactivate                  // Deactivate account
GET   /api/v1/borrowers/:id/export-data             // Data export (NDPR)
GET   /api/v1/borrowers/:id/score-access-log        // FarmScore access log
POST  /api/v1/borrowers/:id/revoke-score-access     // Revoke lender access
PATCH /api/v1/users/:id/ussd-settings               // USSD settings
```

---

## Shared Components & Infrastructure

### Layout & Navigation
- [x] **TASK 9.1:** Verify BorrowerGuard auth protection
  - Ensure all borrower routes require authentication
  - Redirect to login if not authenticated
  - Show unauthorized page if wrong role
  - **File:** `frontend/app/borrower/layout.tsx`

- [ ] **TASK 9.2:** Add unread message badge to sidebar
  - Show count badge on "Messages" nav item
  - Real-time update via WebSocket
  - Clear badge when messages page visited

- [ ] **TASK 9.3:** Add FarmScore mini-indicator to topbar
  - Show current score + tier color in topbar
  - Click → navigate to FarmScore page
  - Updates in real-time when score changes

### API Layer
- [x] **TASK 9.4:** Create borrower API client functions (per-resource files under `lib/api/`, not a single borrower.ts)
  - All borrower-facing API calls in `frontend/lib/api/borrower.ts`
  - Typed request/response interfaces
  - Error handling with user-friendly messages
  - Retry logic for failed requests
  - **File:** `frontend/lib/api/borrower.ts`

- [x] **TASK 9.5:** Implement API auth token management
  - Attach JWT token to all borrower API requests
  - Auto-refresh expired tokens
  - Redirect to login on auth failure
  - **File:** `frontend/lib/api/client.ts`

### State Management
- [x] **TASK 9.6:** Create borrower data hooks (in `lib/hooks/`, named per-resource e.g. useMyLoans, useMyFarmScore)
  - `useBorrowerDashboard()` — overview data
  - `useBorrowerLoans()` — loans list
  - `useBorrowerFarmScore()` — score data
  - `useBorrowerMessages()` — conversations
  - `useBorrowerApplications()` — applications
  - `useBorrowerSettings()` — settings data
  - **File:** `frontend/lib/hooks/borrower/`

- [ ] **TASK 9.7:** Implement optimistic updates for critical actions
  - Repayment submission: update UI immediately, rollback on failure
  - Farm report submission: show as submitted immediately
  - Application submission: show in list immediately
  - Message send: show in chat immediately

### Real-Time Features
- [ ] **TASK 9.8:** Set up WebSocket connection for borrower events
  - Connect on borrower dashboard load
  - Events: new message, payment confirmed, disbursement received, FarmScore update, application status change
  - Toast notifications for critical events
  - **File:** `frontend/lib/socket/borrower.ts`

### Offline Support
- [ ] **TASK 9.9:** Implement PWA offline capabilities
  - Service worker already exists (`public/sw.js`)
  - Cache borrower dashboard pages for offline viewing
  - Queue actions (farm report, message) when offline
  - Sync queue when connection restored
  - Show offline indicator in topbar

### Internationalization
- [ ] **TASK 9.10:** Set up i18n for 5 languages
  - English (default), Hausa, Yoruba, Igbo, Nigerian Pidgin
  - Translation files in `frontend/lib/i18n/`
  - Language switcher in settings updates all text
  - Date/number formatting per locale
  - **File:** `frontend/lib/i18n/`

---

## USSD & WhatsApp Bot (Out of Scope for Frontend — Backend Only)

### USSD Menu System
- [ ] **TASK 10.1:** Implement USSD menu (*737*99#)
  - Level 0: Main Menu (Loan balance, Make payment, Submit farm report, My FarmScore, Browse programs)
  - Level 1-2: Sub-menus per selection
  - 182 character limit per screen
  - Session management with timeout
  - **File:** `backend/src/services/ussd.service.ts`

### WhatsApp Bot
- [ ] **TASK 10.2:** Implement WhatsApp bot commands
  - "balance" → loan balance reply
  - "score" → FarmScore reply
  - "pay" → payment options
  - Photo received → farm report photo capture
  - "help" → full command menu
  - Multi-language support
  - **File:** `backend/src/services/whatsapp-bot.service.ts`

---

## Summary

### Priority Order
1. **Phase 1 — Core API Integration:** Tasks 1.1, 2.1, 3.9, 4.1, 5.1, 6.2, 7.1, 7.4, 7.8, 8.1
2. **Phase 2 — Critical Features:** Repayment modal (2.5), Farm report GPS/photo (3.1-3.3), Application form (6.6), Notification matrix (8.9), WebSocket (5.1, 9.8)
3. **Phase 3 — Enhanced Features:** FarmScore share/PDF (4.7-4.8), Voice notes (5.5), Offline support (3.11, 9.9), Bank verification (8.7)
4. **Phase 4 — Polish:** i18n (8.12, 9.10), Accessibility (8.13), Security (8.14-8.16), Data privacy (8.17-8.19)
5. **Phase 5 — Alternative Channels:** USSD (10.1), WhatsApp bot (10.2)

### Key Issues Found
1. **FarmScore breakdown components are WRONG** — current has 5 components, spec has 6 with different names/weights
2. **Route inconsistency** — applications page links to `/borrower-applications/` instead of `/borrower/applications/`
3. **No real API integration anywhere** — all pages use hardcoded mock data
4. **No real-time features** — no WebSocket, no live updates
5. **No file upload** — farm reports and applications have no real photo/document upload
6. **No payment processing** — repayment modal doesn't exist
7. **Settings is incomplete** — missing KYC status, security, data privacy, bank verification, proper notification matrix
8. **Messages is basic** — no voice notes, photo attachments, quick replies, notification hub, or real-time delivery
9. **Discover has no application flow** — cards exist but "Apply Now" does nothing, no eligibility check, no multi-step form
10. **No offline support** — critical for rural farmers with poor connectivity
