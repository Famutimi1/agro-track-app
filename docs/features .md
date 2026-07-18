cat > /tmp/agrotrack_plan.md << 'ENDOFMD'
# AgroTrack Lender Dashboard — Production Feature Specification

**Version:** 2.0  
**Classification:** Internal Engineering & Product Reference  
**Date:** June 2025  
**Scope:** Complete page-by-page specification of the AgroTrack Lender Dashboard — what exists on each page, every CRUD operation, every real-world action, and how each maps to backend behaviour.

---

## Navigation Structure (from screenshot)

```
Dashboard
Applications
Loans
Loan Programs
Borrowers
Disbursements
Repayments
Field Agents
Cooperatives
Reports
Map View
Messages
Settings
```

---

## How the Loan Lifecycle Works End-to-End

Before diving into each page, it is essential to understand the full flow that connects them all. Every feature on every page is a node in this chain.

```
LENDER creates Loan Program
        ↓
FARMER discovers & submits Application
        ↓
FIELD AGENT verifies farm (GPS, photos, identity)
        ↓
LENDER reviews Application → Approves
        ↓
Layer 1 Disbursement released → Farmer's bank account
        ↓
FARMER uses funds → Submits Farm Activity Report with photos
        ↓
LENDER or AGENT verifies report → Layer 2 unlocked
        ↓
Layer 2 Disbursement released
        ↓
(Repeat for Layer 3 if applicable)
        ↓
Repayment schedule begins (monthly installments)
        ↓
FARMER repays via USSD / mobile money / bank transfer
        ↓
FarmScore updated after each repayment
        ↓
Loan closes → FarmScore locked as permanent credit record
```

Every page in the dashboard corresponds to one or more stages of this lifecycle.

---

## Page 1 — Dashboard

### Purpose
The operational home screen. A lender administrator sees the health of their entire portfolio at a single glance without navigating anywhere.

### What Is Displayed

#### KPI Summary Cards (top row)
Six cards that auto-refresh every 5 minutes:

| Card | Metric | Calculation |
|---|---|---|
| Total Disbursed | Sum of all released disbursements | SUM(layer_disbursements.amount_kobo) WHERE status = RELEASED |
| Total Repaid | Sum of all confirmed repayments | SUM(repayments.amount_kobo) WHERE status = PAID |
| Active Borrowers | Borrowers with at least one active loan | COUNT(borrowers) WHERE has active application |
| Default Rate | % borrowers overdue > 30 days | COUNT(overdue) / COUNT(total active) × 100 |
| Pending Applications | Applications awaiting review | COUNT(applications) WHERE status = PENDING |
| Active Programs | Published programs not yet closed | COUNT(programs) WHERE status = ACTIVE |

#### Charts Section

**Disbursement vs Repayment Trend (Line Chart)**
- X axis: Last 12 months (Jan–Dec)
- Y axis: Amount in ₦ millions
- Two lines: total disbursed per month, total repaid per month
- Data source: Aggregated monthly from layer_disbursements and repayments tables
- Real-world significance: Tells lender if repayment is keeping pace with disbursement. Widening gap = growing default risk

**Portfolio by Crop Type (Donut Chart)**
- Segments: Rice, Cassava, Maize, Yam, Others
- Calculated from: borrowers.crop_types across all active applications
- Real-world significance: Concentration risk — if 80% of loans are to rice farmers and there is a bad harvest, the entire portfolio is at risk

**Repayment Rate by State (Bar Chart)**
- X axis: Nigerian states where borrowers are located
- Y axis: % on-time repayment rate per state
- Colour coded: Green ≥85%, Blue 70–84%, Amber below 70%
- Real-world significance: Identifies geographic underperformance — lender can dispatch field agents or adjust eligibility for underperforming states

#### Recent Activity Feed (right panel)
Real-time event stream showing last 20 events across all programs:
- Application approved / rejected
- Disbursement released
- Repayment received
- Farm report submitted
- Overdue alert triggered
- Agent verification completed

Each event shows: Borrower name, action, amount, timestamp, program name.

#### Borrowers Needing Attention (table, bottom)
Pre-filtered list of borrowers requiring immediate action, sorted by urgency:
- Borrowers with missed repayments (overdue > 7 days)
- Borrowers who have not submitted farm report in current cycle
- Applications pending review > 5 days

Columns: Name, State, Crop, Overdue Amount, Days Late, FarmScore, Actions (View, Message, Flag)

### Actions Available on This Page

| Action | What Happens | Real-World Equivalent |
|---|---|---|
| Click KPI card | Navigates to relevant page filtered by that metric | Drilling into a summary report |
| Click borrower row | Opens borrower profile in Borrowers page | Reviewing a client file |
| Click "Send reminder" on overdue | Triggers SMS/WhatsApp repayment reminder | Loan officer calling a client |
| Click "Flag" | Marks borrower for review, creates internal alert | Flagging an account for collections |
| Export dashboard | Generates PDF snapshot of current dashboard state | Printing a board report |

### Real-World Simulation
A CBN programme manager arrives Monday morning. They open the dashboard. They see default rate has increased from 7.8% to 9.2% since last week. The bar chart shows Kogi State has the worst repayment rate at 61%. They click on Kogi in the bar chart, which filters the Borrowers page to Kogi only. They see 12 borrowers overdue. They select all 12 and send a bulk WhatsApp reminder. They also flag 3 with overdue > 45 days for collections escalation.

---

## Page 2 — Applications

### Purpose
The review and decision queue. Every loan application submitted by a farmer appears here. This is where lenders approve, reject, or request more information. It is the most operationally critical page.

### What Is Displayed

#### Application Queue (main table)
All applications submitted to any program managed by this lender account.

Columns:
- Application ID (auto-generated: APP-20250613-4421)
- Borrower Name + Farmer ID
- Program Name
- Loan Amount Requested
- Submission Date
- FarmScore at time of application
- Field Agent Verification Status (Pending / Verified / Failed)
- Application Status (Pending / Under Review / Approved / Rejected / Withdrawn)
- Days in Queue (auto-calculated from submission date)
- Actions

#### Filter Bar
- Status: All / Pending / Under Review / Approved / Rejected
- Program: Dropdown of all active programs
- State: Nigerian state filter
- FarmScore Range: Slider (0 to 850)
- Date Range: Date picker
- Agent Verified: Yes / No / Pending
- Sort: Newest first / Oldest first / Highest score / Highest amount

#### Application Detail Panel (slide-in or separate page)
When a reviewer clicks any application:

**Borrower Summary Tab**
- Full name, Farmer ID, phone, state, LGA
- BVN verified badge + NIN verified badge
- Profile photo, farm photos (gallery)
- Farm GPS coordinates (map embed)
- Farm size (self-reported vs agent-measured)
- Crop types
- Bank account details

**FarmScore Tab**
- Current score with ring visualization
- Score breakdown: Identity, Farm Verification, Repayment History, Reporting Consistency, Cooperative Standing
- Score history chart if borrower has prior loans
- Grade: Platinum / Gold / Silver / Bronze
- Score explanation in plain English

**Field Agent Report Tab**
- Which agent conducted verification
- Verification date and GPS timestamp
- Agent photos of the farm (minimum 5)
- Farm boundary map (agent-walked GPS perimeter)
- Agent notes and observations
- Discrepancies flagged (e.g. farm size mismatch)

**Documents Tab**
- BVN verification certificate
- NIN verification slip
- Farm photos (uploaded by borrower)
- Cooperative membership letter (if required)
- Bank statement (if required)
- Land/Title document (if required)
- Each document has: Download, Mark Verified, Flag as Suspicious buttons

**Decision Panel (right sidebar)**
- Approve button → triggers approval modal
- Reject button → triggers rejection modal with mandatory reason
- Request More Info button → sends message to borrower listing what is needed
- Assign to another reviewer dropdown
- Add internal note (visible only to lender team, not borrower)

### CRUD Operations

#### CREATE
Applications are created by borrowers via the mobile app, web portal, or USSD. Lenders do not create applications — they only respond to them. However, lenders can create applications on behalf of a borrower (assisted application) where a field agent registers and submits for an offline farmer.

```
POST /api/v1/applications
Body: {
  borrowerId, programId, requestedAmountKobo, purpose,
  documents: [{ type, fileUrl }]
}
Response: { applicationId, status: "PENDING", submittedAt }
```

#### READ
```
GET /api/v1/applications?programId=&status=&state=&cursor=&limit=20
GET /api/v1/applications/:id (full detail with borrower, documents, agent report)
```

#### UPDATE (Status Changes — these are the core decisions)

**Approve Application**
```
POST /api/v1/applications/:id/approve
Body: { reviewNotes, approvedAmount (may differ from requested) }

What happens immediately:
1. Application status → APPROVED
2. Loan record created with repayment schedule
3. Layer 1 disbursement record created with status PENDING
4. Borrower receives SMS: "Congratulations! Your loan application APP-XXXX has been approved. Your first disbursement of ₦XXX will be processed within 48 hours."
5. WhatsApp message sent (if opted in)
6. FarmScore recalculated (approval itself adds 5 points for first loan)
7. Audit log entry created: who approved, when, what amount
8. Notification pushed to lender dashboard activity feed
```

**Reject Application**
```
POST /api/v1/applications/:id/reject
Body: { reason, rejectionCode }

Rejection codes:
  INSUFFICIENT_SCORE       FarmScore below program minimum
  UNVERIFIED_IDENTITY      BVN or NIN verification failed
  INCOMPLETE_DOCUMENTS     Missing required documents
  FARM_NOT_VERIFIED        Field agent did not complete verification
  OUTSIDE_ELIGIBILITY      Does not meet crop/location/age criteria
  PROGRAM_FUNDS_EXHAUSTED  Loan pool fully deployed
  DUPLICATE_APPLICATION    Active application already exists
  SUSPICIOUS_ACTIVITY      Fraud flag raised

What happens:
1. Application status → REJECTED
2. Borrower SMS: "Your application APP-XXXX has been reviewed. Unfortunately it was not approved at this time. Reason: [reason]. You may re-apply after 90 days."
3. Rejection reason stored for audit
4. FarmScore not penalised (rejection does not hurt score)
```

**Request More Information**
```
POST /api/v1/applications/:id/request-info
Body: { requiredItems: [], message }

What happens:
1. Application status → UNDER_REVIEW (pauses the review clock)
2. Borrower receives message listing exactly what is needed
3. Borrower can upload additional documents from their portal
4. Once uploaded, application returns to Pending queue
5. Reviewer receives notification: "Borrower has submitted requested documents"
```

**Bulk Actions**
Select multiple applications:
- Bulk approve (for auto-qualify high-score borrowers)
- Bulk reject (end of program)
- Bulk assign to reviewer
- Bulk export to CSV

#### DELETE
Applications cannot be deleted — they are archived. A borrower can withdraw their own application before approval, which sets status to WITHDRAWN.

```
POST /api/v1/applications/:id/withdraw (borrower only)
```

### Business Rules
- An application cannot be approved if field agent verification is incomplete (configurable per program)
- An application cannot be approved if BVN or NIN is unverified
- A borrower cannot have more than one PENDING application per program simultaneously
- If a program exhausts its fund pool, all pending applications are automatically put on hold
- Applications older than 30 days with no action trigger an alert to the lender admin

### Real-World Simulation
An analyst at NIRSAL sits down to review the morning queue. She sees 47 pending applications. She filters by FarmScore > 700 and Agent Verified = Yes. This gives 18 applications. She clicks Bulk Approve on all 18. The system generates 18 loan records, 18 disbursement records, and sends 18 SMS messages simultaneously. For the remaining 29, she reviews individually. 6 she rejects for missing documents. 5 she requests more info. 3 she flags as suspicious (two applications from the same GPS coordinates — possible fraud). 15 she holds for a second reviewer.

---

## Page 3 — Loans

### Purpose
The master record of every active and completed loan. Once an application is approved, it becomes a Loan. This page provides the full lifecycle view of every individual loan — amount, disbursement progress, repayment status, and outstanding balance.

### What Is Displayed

#### Loans Table (main view)
Every approved loan across all programs.

Columns:
- Loan ID (auto-generated: LN-20250613-0134)
- Borrower Name + Farmer ID
- Program Name
- Approved Amount
- Total Disbursed (sum of released layers)
- Total Repaid
- Outstanding Balance
- Next Payment Amount + Due Date
- Disbursement Progress (which layers released)
- FarmScore at approval
- Loan Status: Active / Completed / Defaulted / Restructured / Written Off
- Days to Next Payment (countdown, red if < 7 days)
- Actions

#### Loan Detail Page
Click any loan to open the full record:

**Loan Summary Card**
- Loan ID, Program, Lender
- Approved amount, interest rate, duration, grace period
- Repayment schedule (all 12 installments with due dates and amounts)
- Total interest to be paid over term
- Effective date (when Layer 1 was released)
- Maturity date (when final repayment is due)

**Disbursement Layers Visual**
Step-by-step tracker showing all layers:
```
Layer 1 — Land Preparation (30%)  ✅ Released Feb 15
Layer 2 — Planting & Inputs (40%) ✅ Released Apr 2
Layer 3 — Crop Maintenance (30%)  🔒 Locked — awaiting Layer 2 report
```

**Repayment Schedule Table**
| Installment | Due Date | Amount | Status | Paid Date | Days Late |
|---|---|---|---|---|---|
| 1 of 12 | Apr 5 | ₦85,000 | Paid ✓ | Apr 4 | 0 |
| 2 of 12 | May 5 | ₦85,000 | Paid ✓ | May 7 | 2 |
| 3 of 12 | Jun 5 | ₦85,000 | Overdue | — | 8 |
| 4 of 12 | Jul 5 | ₦85,000 | Scheduled | — | — |

**Farm Activity Timeline**
Chronological list of all farm reports submitted for this loan, each with:
- Report date and crop stage
- Thumbnail photos (clickable to full size)
- Verification status
- Score points earned

**Loan History / Audit Tab**
Every action ever taken on this loan:
- Who approved, when
- Each disbursement with exact timestamp and Paystack reference
- Each repayment with method used
- Each status change with reason

### CRUD Operations

#### CREATE
Loans are not created manually. They are automatically created when an Application is approved.

```
Trigger: POST /api/v1/applications/:id/approve
Creates:
  - Loan record with repayment schedule
  - Layer disbursement records for each layer
  - Notification to borrower

Generated automatically:
  - Loan ID
  - Repayment schedule (12 rows for 12-month loan)
  - Due dates calculated from grace period end date
  - Interest calculated on declining balance
```

#### READ
```
GET /api/v1/loans                          All loans (paginated, filterable)
GET /api/v1/loans/:id                      Full loan detail
GET /api/v1/loans/:id/repayment-schedule   All installments
GET /api/v1/loans/:id/timeline             Full activity timeline
GET /api/v1/loans/stats                    Portfolio aggregate stats
```

#### UPDATE (Loan Management Actions)

**Restructure Loan**
When a borrower is facing genuine hardship (flood, illness, crop failure) the lender can restructure rather than default:
```
POST /api/v1/loans/:id/restructure
Body: {
  reason,
  extensionMonths,       // Add months to the term
  newMonthlyAmount,      // Reduce installment size
  gracePeriodMonths,     // Additional grace period
  approvedBy
}

What happens:
1. Existing repayment schedule archived
2. New schedule generated from remaining balance
3. Loan status → RESTRUCTURED
4. Borrower notified via SMS
5. Audit log entry with full before/after
6. FarmScore impact: -15 points (restructure is negative signal but less than default)
```

**Write Off Loan**
For loans where recovery is deemed impossible:
```
POST /api/v1/loans/:id/write-off
Body: { reason, writeOffAmount, approvedBy }

Requires: Two-level approval (manager + admin)

What happens:
1. Loan status → WRITTEN_OFF
2. Outstanding balance recorded as loss
3. Borrower FarmScore: -120 points (catastrophic)
4. Borrower blacklisted from new applications for 24 months
5. Regulatory report generated (required for CBN programmes)
6. Audit log with full justification
```

**Mark Loan as Completed**
Auto-triggered when final repayment is confirmed:
```
Trigger: Final repayment received
What happens:
1. Loan status → COMPLETED
2. FarmScore recalculated with full repayment bonus: +50 points
3. Completion certificate generated (PDF, downloadable by borrower)
4. Borrower eligible to apply for next loan cycle immediately
5. Congratulations SMS sent
6. Cooperative notified if member (group score updated)
```

#### DELETE
Loans cannot be deleted. They can be written off or archived but the full record is permanently retained for audit.

### Real-World Simulation
A Union Bank analyst opens Loans filtered by Status = Overdue. She sees 8 loans. She selects the 3 loans where the borrower has a FarmScore above 600 and the overdue is less than 15 days. She marks these for Repayment Reminder (auto-sends SMS). For the remaining 5, she sees FarmScores below 450 and overdue of 30+ days. She opens each one. For 2 of them, the borrower submitted a farm report showing crop failure due to flooding. She initiates restructuring for these 2. For the other 3, no farm reports at all and agent verification showed they never planted. She escalates these to collections and flags for potential write-off.

---

## Page 4 — Loan Programs

### Purpose
The program management hub. Lenders create and configure everything here — the fund pool, who can apply, how funds are released, what documents are required, and when the program ends.

### What Is Displayed

#### Programs Grid
Card-based layout showing each program:
- Program name and lender
- Status badge: Draft / Active / Paused / Closed
- Type badge: Loan / Grant / Hybrid
- Fund utilisation progress bar (₦850M of ₦2B — 42%)
- Borrower count
- States covered
- Interest rate
- Repayment rate
- Crop types eligible
- Layer indicators (L1 ✅ L2 ✅ L3 🔒)
- Application deadline
- Actions: View, Edit, Manage, Duplicate, Close

#### Program Detail Page
Full program configuration:
- All eligibility criteria
- Disbursement layer structure with triggers
- Required documents checklist
- All applications received
- Portfolio performance for this program specifically
- Fund flow chart (how much remains)

### CRUD Operations

#### CREATE — New Program (6-step wizard)

**Step 1: Basic Information**
```
Fields:
  - Program name (required, max 120 chars)
  - Description (rich text, max 500 chars)
  - Program type: Loan / Grant / Hybrid
  - Total fund pool amount (₦, required)
  - Application window open date
  - Application deadline
  - Program visibility: Public / Invite-only

Validation:
  - Fund pool cannot exceed lender's verified credit limit
  - Deadline must be at least 30 days from today
  - Name must be unique within lender account
```

**Step 2: Eligibility Criteria**
```
Fields:
  - Target states (multi-select, all 37 states + FCT)
  - Target LGAs (optional, more granular)
  - Eligible crop types (multi-select from master list)
  - Minimum farm size (hectares)
  - Maximum farm size (hectares)
  - Minimum farmer age (default: 18)
  - Maximum farmer age (default: 65)
  - Gender requirement: All / Female only / Male only / Youth (18-35)
  - Cooperative membership: Required / Optional / Not required
  - Minimum FarmScore to apply (default: 0, can set to 500 for quality programmes)
  - BVN required: Yes (always) / No (not possible — BVN always required)
  - NIN required: Yes / No
  - Field agent verification required before approval: Yes / No
```

**Step 3: Loan Terms**
```
Fields:
  - Minimum loan amount (₦)
  - Maximum loan amount (₦)
  - Interest rate (% per annum, 0 for grants)
  - Repayment period (months: 3, 6, 9, 12, 18, 24, 36)
  - Grace period before repayments begin (months: 0, 1, 2, 3, 4, 6)
  - Disbursement type: Layered / Lump Sum / In-Kind
  - Repayment methods accepted: Bank Transfer / USSD / Mobile Money / In-Kind Produce / All
  - Repayment frequency: Monthly / Quarterly / At Harvest
  - Early repayment penalty: None / X% (usually none to encourage repayment)
  - Late repayment penalty: ₦X per day or X% per month
```

**Step 4: Disbursement Layers (if Layered selected)**
```
Configure each layer:
  Layer 1:
    - Name: "Land Preparation"
    - Percentage: 30%
    - Trigger: "Loan Approval" (automatic)
    - Required proof: None (auto-released)
    - Agent confirmation required: No

  Layer 2:
    - Name: "Planting & Inputs"
    - Percentage: 40%
    - Trigger: "Layer 1 utilisation report submitted"
    - Required proof: Farm photos (min 3) + input purchase receipts
    - Agent confirmation required: Optional (configurable)
    - Maximum days from Layer 1: 60 days

  Layer 3:
    - Name: "Crop Maintenance"
    - Percentage: 30%
    - Trigger: "Crop growth confirmed"
    - Required proof: Farm photos showing crop at growth stage + agent visit
    - Agent confirmation required: Yes
    - Maximum days from Layer 2: 90 days

Business rules for layers:
  - Percentages must sum to exactly 100%
  - Minimum 1 layer, maximum 5 layers
  - Layer 1 can be auto-released on approval
  - Each subsequent layer requires proof submission
  - Lender can manually override any layer lock (with audit trail)
```

**Step 5: Required Documents**
```
Checkbox list — lender selects which are required:
  ✅ BVN Verification (always required, auto-verified)
  ✅ NIN Verification (always required, auto-verified)
  ✅ Farm Photos (minimum 3, geotagged)
  ☐ Cooperative Membership Letter
  ☐ Bank Statement (last 3 months)
  ☐ Land/Title Document (Certificate of Occupancy)
  ☐ Farmer Registration Certificate (ADP)
  ☐ CAC Registration (for agribusiness applicants)
```

**Step 6: Review and Publish**
```
Summary of all settings for final review.
Two options:
  - Save as Draft (can edit later, not visible to borrowers)
  - Publish Now (immediately visible to eligible borrowers)

On publish:
  - Program appears in borrower discovery feed
  - Eligible borrowers (matched by profile) get push notification
  - SMS broadcast to matching borrowers in target states
  - Program appears on USSD menu option 5 (Browse Programs)
```

```
API call: POST /api/v1/programs
Body: { all step 1-5 data combined }
Response: { programId, status: "DRAFT" or "ACTIVE" }
```

#### READ
```
GET /api/v1/programs                        All programs (lender-scoped)
GET /api/v1/programs/:id                    Full program detail
GET /api/v1/programs/:id/applications       All applications for program
GET /api/v1/programs/:id/stats              Performance metrics
GET /api/v1/programs/:id/fund-flow          Disbursed vs remaining
```

#### UPDATE

**Edit Program (Draft only)**
```
PATCH /api/v1/programs/:id
Note: Active programs can only edit description and deadline.
      Loan terms, amounts, and eligibility cannot change once Active
      because borrowers may have already applied based on those terms.
      To change terms: close program and create new one.
```

**Pause Program**
```
POST /api/v1/programs/:id/pause
Body: { reason, resumeAt (optional date) }

What happens:
  - No new applications accepted
  - Existing applications continue processing
  - Pending disbursements continue
  - Borrowers see "Applications temporarily paused" message
  - Used when: fund pool nearly exhausted, administrative review, fraud investigation
```

**Resume Paused Program**
```
POST /api/v1/programs/:id/resume
Restores application acceptance immediately.
```

**Close Program**
```
POST /api/v1/programs/:id/close
Requires: No pending applications (or force-close with bulk action)

What happens:
  - Status → CLOSED
  - No new applications possible
  - All pending applications auto-rejected with message
  - Active loans continue normally (closing program ≠ cancelling loans)
  - Program remains visible in reporting history
  - Fund remainder returned to lender pool
```

**Duplicate Program**
```
POST /api/v1/programs/:id/duplicate
Creates exact copy as DRAFT with "(Copy)" appended to name.
Useful for seasonal programmes (same rice programme every planting season).
```

#### DELETE
```
DELETE /api/v1/programs/:id
Only allowed if status = DRAFT and zero applications received.
Published programs with any applications cannot be deleted — only closed.
```

### Real-World Simulation
The Federal Ministry of Agriculture wants to launch the 2025 dry season rice programme. A programme manager opens Loan Programs and clicks New Program. She fills in:
- Name: "FMA Rice Farmers Support Fund — Dry Season 2025"
- Type: Loan
- Pool: ₦2,000,000,000 (₦2 billion)
- States: Kebbi, Niger, Sokoto, Kano, Katsina
- Crops: Rice only
- Min loan: ₦100,000 / Max: ₦2,000,000
- Interest: 9% per annum
- Duration: 12 months
- Grace period: 2 months (planting season first)
- Layers: 3 (30% / 40% / 30%)
- Required: BVN, NIN, Farm photos, Agent verification mandatory

She saves as Draft, shares the preview link with her director for approval, receives confirmation, then clicks Publish. Within 20 minutes, 3,400 farmers in those states who have matching profiles in the system receive an SMS notification about the new programme.

---

## Page 5 — Borrowers

### Purpose
The complete farmer registry for this lender account. Every farmer who has ever applied to any of this lender's programs is visible here. This is the primary customer management view.

### What Is Displayed

#### Borrowers Table
Columns:
- Profile photo thumbnail
- Full name + Farmer ID
- State / LGA
- Primary crop
- Active loans count
- Total borrowed (lifetime)
- Total repaid
- FarmScore (with colour-coded ring)
- FarmScore grade
- Status: Active / At Risk / Defaulting / Completed / Blacklisted
- Last farm report date (red if > 45 days)
- Last login (shows engagement)
- Actions: View Profile / Message / Flag / Assign Agent

#### Advanced Filter Panel
- Status filter
- State / LGA filter
- Crop type filter
- FarmScore range slider
- Cooperative membership: Yes / No
- Field agent verified: Yes / No / Pending
- Last report date: Within 30 days / 30–60 days / > 60 days
- Amount disbursed range
- Joined date range

#### Borrower Profile Page (most detailed page in the dashboard)

**Profile Header**
- Large avatar (initials if no photo)
- Full name, Farmer ID, Status badge
- FarmScore ring (large, prominent)
- Grade badge (Platinum / Gold / Silver / Bronze)
- Quick stats: Active loans, total borrowed, total repaid, next payment due

**Tab 1: Overview**
Personal information, KYC status, farm details, cooperative membership, bank account status

**Tab 2: Loan History**
All loans ever taken — active, completed, restructured, written off
Each row expandable to show full repayment schedule and disbursement layers

**Tab 3: Farm Reports**
Timeline of every farm report submitted, with:
- Crop growth stage icons
- Thumbnail photos (clickable to full resolution)
- Verification status and verifier name
- FarmScore points earned per report
- Challenges reported (pests, drought, flooding)

**Tab 4: FarmScore Detail**
- Large circular score display with animated ring
- Component breakdown bars:
  - Identity Verification: X/100
  - Repayment History: X/100
  - Farm Activity Reports: X/100
  - Loan Utilisation: X/100
  - Farming Experience: X/100
  - Cooperative Standing: X/100
- Score history chart (6–12 months)
- What changed this month (explanation)
- Comparison to programme average

**Tab 5: Documents**
Grid of all uploaded documents:
- BVN certificate, NIN slip, farm photos, cooperative letter
- Each shows: upload date, verified/unverified status, file size
- Download button, Verify button, Flag as suspicious button

**Tab 6: Messages**
Full chat history with this borrower — all messages sent and received across all channels (in-app, SMS log, WhatsApp log)

**Tab 7: Activity Log**
Immutable chronological log of every action related to this borrower:
- Registration date and method (app / USSD / field agent)
- Every application submitted and outcome
- Every disbursement released with amounts
- Every repayment with method and timestamp
- Every farm report submission
- Every FarmScore change with reason
- Every flag or note added by lender staff
- Every field agent visit

### CRUD Operations

#### CREATE
Borrowers are created through:
1. Self-registration via mobile app or web portal
2. USSD registration via *737*99#
3. Field agent-assisted registration (agent uses their app)

Lenders cannot create borrower profiles manually — this ensures data integrity and genuine farmer identity.

```
On registration, the following are created automatically:
- User record (phone, email)
- Borrower profile record
- Initial FarmScore = 0 (rises to 520 after BVN + NIN + GPS verified)
- Empty loan history
- Notification preferences (default: SMS + WhatsApp enabled)
```

#### READ
```
GET /api/v1/borrowers                       List (filterable, paginated)
GET /api/v1/borrowers/:id                   Full profile
GET /api/v1/borrowers/:id/loans             Loan history
GET /api/v1/borrowers/:id/farm-reports      Report history
GET /api/v1/borrowers/:id/farmscore         Score + breakdown + history
GET /api/v1/borrowers/:id/documents         Document list
GET /api/v1/borrowers/:id/activity          Full activity log
GET /api/v1/borrowers/:id/messages          Message history
```

#### UPDATE

**Update Borrower Profile (by lender)**
Lenders can update:
- Internal notes (not visible to borrower)
- Risk flags
- Agent assignment
- Account status

Lenders cannot update:
- Borrower's personal information (only borrower can)
- BVN or NIN
- FarmScore directly

```
PATCH /api/v1/borrowers/:id
Body: { internalNotes, riskFlag, assignedAgentId }
```

**Flag Borrower**
```
POST /api/v1/borrowers/:id/flag
Body: { reason, severity: LOW | MEDIUM | HIGH | CRITICAL }

Severity levels and consequences:
  LOW:      Internal note only, no borrower impact
  MEDIUM:   Applications require senior approval
  HIGH:     All applications on hold, alert to admin
  CRITICAL: Account suspended, all pending disbursements blocked
```

**Blacklist Borrower**
```
POST /api/v1/borrowers/:id/blacklist
Body: { reason, durationMonths, approvedBy }
Requires: Two-level approval

Effect:
  - Cannot apply to any programme on AgroTrack
  - FarmScore marked as BLACKLISTED
  - Record shared with FarmScore API (other lenders warned)
  - Duration: 12 / 24 / 48 months / Permanent
```

**Remove Blacklist**
```
POST /api/v1/borrowers/:id/unblacklist
Body: { reason, approvedBy }
Requires: Super admin approval
```

#### DELETE
Individual borrower records cannot be deleted due to regulatory requirements (CBN mandates 7-year financial record retention). Records can be anonymised on request (NDPR compliance) but the financial record skeleton is retained.

### Real-World Simulation
A field supervisor at a state agricultural ministry uses the Borrowers page as her daily work queue. Every morning she filters by:
- Last farm report > 30 days ago
- Active loans

She sees 14 borrowers who have not submitted reports for the current cycle. She selects all 14 and sends a bulk in-app message: "Your farm report for June 2025 is overdue. Please submit with at least 3 photos of your farm. Your Layer 2 disbursement depends on this." Eight of the 14 submit within 24 hours. For the remaining 6, she assigns them to the nearest field agent for a physical farm visit and manual report submission.

---

## Page 6 — Disbursements

### Purpose
The financial control centre for releasing loan funds. Every naira that leaves the lender's account appears here first as a pending approval, then as a released transaction. This is where the layered disbursement model is operationally enforced.

### What Is Displayed

#### Disbursement Summary Strip (top)
Four metric cards:
- Total Pending Approval (₦ amount + count)
- Approved Today (₦ amount + count)
- Released This Month (₦ amount + count)
- Average Processing Time (days from proof submission to release)

#### Monthly Bar Chart
₦ millions released per month for the last 6 months. Current month highlighted.

Layer Breakdown Panel (right of chart):
- Layer 1 as % of all disbursements: 42%
- Layer 2 as % of all disbursements: 35%
- Layer 3 as % of all disbursements: 23%
Visual: This shows lenders how deep farmers are progressing through their loan cycles

#### Pending Disbursements Queue (main table)
All disbursements awaiting approval or with proof submitted:

Columns:
- Disbursement ID
- Borrower Name + Farmer ID
- Program
- Layer Number + Name (e.g. Layer 2 — Planting & Inputs)
- Amount
- Proof Documents (count with View button)
- Days Waiting (from proof submission)
- FarmScore
- State
- Status (Pending / Proof Submitted / Approved / Released / Failed)
- Actions

Actions per row:
- View Proof (opens proof document gallery + farm photos)
- Approve (single click, triggers payment)
- Reject (requires reason)

Bulk actions:
- Select multiple → Bulk Approve
- Select multiple → Bulk Reject

#### Disbursement History Table (below queue)
All historical disbursements (filterable by date, program, layer, status):
- Same columns plus: Released At, Paystack Reference, Receipt

### CRUD Operations

#### CREATE
Disbursement records are created automatically when:
1. Application is approved → Layer 1 disbursement created with status PENDING
2. Borrower submits Layer N proof → Layer N+1 disbursement created with status AWAITING_PROOF
3. Layer N+1 proof submitted → Status changes to PROOF_SUBMITTED

Lenders do not manually create disbursement records.

#### READ
```
GET /api/v1/disbursements                   All disbursements
GET /api/v1/disbursements/pending           Pending approval queue
GET /api/v1/disbursements/:id               Single disbursement detail
GET /api/v1/disbursements/stats             Summary stats
GET /api/v1/disbursements?applicationId=    All disbursements for one loan
```

#### UPDATE (the critical operations)

**Approve Disbursement**
```
POST /api/v1/disbursements/:id/approve
Body: { approverNotes }

What happens step by step:
1. Status → APPROVED
2. Paystack disbursement API called:
   paystack.transfer.initiate({
     amount: disbursement.amountKobo,
     recipient: borrower.paystackRecipientCode,
     reason: `AgroTrack Layer ${layer} — ${program.name}`,
     reference: disbursement.id
   })
3. Paystack returns transfer reference
4. Status → RELEASED (on Paystack webhook confirmation)
5. Borrower bank account credited (T+0 to T+1 depending on bank)
6. SMS to borrower: "₦XXX has been sent to your First Bank account ending 7721. This is your Layer 2 disbursement for CBN Rice Fund."
7. WhatsApp notification sent
8. In-app notification pushed
9. FarmScore: +5 points (receiving a disbursement confirms active loan)
10. Layer N+1 disbursement created and locked (awaiting next proof)
11. Audit log: approver ID, timestamp, Paystack reference

Paystack webhook handler (POST /payments/paystack/webhook):
  - Verify webhook signature
  - On transfer.success: mark disbursement RELEASED, notify borrower
  - On transfer.failed: mark FAILED, alert lender, retry logic
```

**Reject Disbursement Proof**
```
POST /api/v1/disbursements/:id/reject
Body: { reason }

Common rejection reasons:
  - Photos not geotagged or timestamp missing
  - Farm photos appear to be from different location (GPS mismatch)
  - Photos too blurry to verify crop stage
  - Receipts for input purchase appear altered
  - Farm report submitted but crop stage inconsistent with timeline

What happens:
1. Disbursement status → PROOF_REJECTED
2. Borrower notified via SMS with specific reason
3. Borrower can resubmit corrected proof
4. Borrower has 14 days to resubmit before layer expires
5. If 14 days pass with no resubmission: disbursement CANCELLED, layer funds return to pool
6. FarmScore: -10 points (failed proof submission)
7. Audit log entry
```

**Manual Override Release (emergency)**
```
POST /api/v1/disbursements/:id/manual-release
Body: { reason, approvedBy (second approver required) }
Requires: Two-level approval (manager + admin)

Use cases:
  - Borrower submitted valid proof but system auto-rejected (technical error)
  - Natural disaster proof waiver (lender decides to release without proof)
  - System failure during normal approval flow

What happens:
  - Disbursement released despite missing/rejected proof
  - All same notification flow as normal approval
  - Special audit log entry: MANUAL_OVERRIDE with both approver IDs and reason
  - Flagged in compliance reports for review
```

**Failed Disbursement Retry**
```
POST /api/v1/disbursements/:id/retry
Used when Paystack transfer fails (wrong account, bank down, etc.)

Checks:
  - Verify bank account details still correct
  - Confirm Paystack recipient code valid
  - Retry transfer with same reference (idempotent)
```

#### DELETE
Disbursement records cannot be deleted. Failed disbursements are marked FAILED and a new disbursement record created for retry.

### Real-World Simulation
A finance officer at the Bank of Agriculture opens Disbursements at 9am. She sees 23 pending disbursements from yesterday's approved applications. She filters by Layer = 1 (these are first disbursements — highest priority). She has 15 Layer 1s. She clicks View Proof for each (Layer 1 has no proof requirement — just identity verification passed). She selects all 15 and clicks Bulk Approve. The system calls Paystack 15 times simultaneously. Within 2 minutes, 15 farmers in Kebbi and Niger states receive SMS notifications that money has arrived in their accounts. She then reviews the 8 Layer 2 disbursements. For these, she clicks View Proof on each one to see the farm photos and receipts submitted. She approves 5 (photos clear, receipts valid). She rejects 3 (photos without geotags, she cannot confirm they are from the actual farm).

---

## Page 7 — Repayments

### Purpose
The complete repayment tracking system. This page shows every repayment that has been made, what is scheduled, what is overdue, and allows the lender to take action on delinquent accounts.

### What Is Displayed

#### Summary Stats (top strip)
- Collected This Month (₦ + count of payments)
- On-Time Rate % (payments received by due date / total scheduled)
- Overdue Balance (total outstanding past due date)
- Average Repayment Streak (months of consecutive on-time payments across all active borrowers)

#### Repayment Trend Chart (left)
Stacked bar chart by month:
- Green: On-time payments
- Amber: Late payments (1–30 days late)
- Red: Defaulted (not paid, > 30 days)
Shows the quality of repayment improving or deteriorating over time.

#### Payment Method Breakdown (right)
Horizontal bar chart:
- Bank Transfer: 48%
- Mobile Money: 31%
- USSD: 14%
- In-Kind Produce: 7%
This tells lenders which channels their farmers actually use — critical for channel investment decisions.

#### Repayments Table
All scheduled, paid, and overdue repayments:

Columns:
- Repayment ID
- Borrower Name
- Loan ID + Program
- Installment Number (3 of 12)
- Amount Due
- Due Date
- Paid Date
- Method Used (Bank / USSD / Mobile Money / In-Kind)
- Days Late (0 = on time, negative = paid early, positive = late)
- Repayment Streak (🔥 5 months)
- Status: Paid / Scheduled / Late / Overdue / Defaulted / Waived
- Actions

Filter options:
- Status
- Program
- State
- Due date range
- Method
- Days late range

### CRUD Operations

#### CREATE — Recording a Repayment

Repayments are created through multiple channels:

**Channel 1: Paystack (card or bank transfer)**
```
Flow:
1. Borrower opens app → taps Make Repayment → selects Bank Transfer
2. App calls POST /repayments/paystack/init
3. Backend creates pending repayment record + calls Paystack initialize
4. Paystack returns payment link
5. Borrower completes payment on Paystack
6. Paystack sends webhook to POST /repayments/paystack/webhook
7. Backend verifies signature → marks repayment PAID
8. FarmScore recalculated
9. SMS receipt sent to borrower
10. Lender dashboard updated in real-time via WebSocket
```

**Channel 2: USSD**
```
Flow:
1. Farmer dials *737*99#
2. Selects option 2 (Make Payment)
3. Selects method (USSD)
4. System generates USSD payment code via Paystack or Interswitch
5. Farmer dials payment code on their phone
6. Bank sends confirmation to Paystack
7. Paystack webhook → repayment marked PAID
8. Confirmation SMS to farmer (same phone, no data needed)
```

**Channel 3: In-Kind (Produce)**
```
Flow:
1. Borrower requests in-kind repayment via app or USSD
2. Field agent or aggregator visits farm to collect produce
3. Agent weighs produce, records quantity and market price
4. Agent submits collection report via field agent app
5. Lender reviews: POST /repayments
   Body: { borrowerId, scheduleId, amountKobo (produce value), method: "IN_KIND", agentId }
6. Repayment recorded, borrower notified
7. Produce sold by lender at market or to off-taker partner
```

**Channel 4: Manual Recording (lender staff)**
For repayments received outside the system (cash at branch, NEFT transfer):
```
POST /api/v1/repayments
Body: {
  borrowerId,
  scheduleId,
  amountKobo,
  method: "BANK_TRANSFER",
  reference: "NEFT-2025-06-12-00432",
  paidAt: "2025-06-12T10:30:00Z",
  receiptUrl,
  recordedBy: staffUserId
}
```

#### READ
```
GET /api/v1/repayments                      All repayments (filterable)
GET /api/v1/repayments/overdue              Overdue only
GET /api/v1/repayments/scheduled            Upcoming scheduled payments
GET /api/v1/repayments/stats                Summary stats
GET /api/v1/repayments/:id                  Single repayment detail
GET /api/v1/repayments?borrowerId=          All payments for one borrower
```

#### UPDATE

**Waive Repayment**
```
POST /api/v1/repayments/:scheduleId/waive
Body: { reason, waivedAmount, approvedBy }
Requires: Manager-level approval

Use cases:
  - Compassionate waiver (death in family, health emergency)
  - Genuine crop failure (natural disaster, pests)
  - Government directive (e.g. CBN COVID-19 waivers 2020)
  - Errors in original loan calculation

What happens:
1. Installment marked WAIVED
2. Outstanding balance reduced by waived amount
3. Future repayment schedule recalculated if partial waiver
4. Borrower notified
5. FarmScore: no change (waiver ≠ default, borrower not punished)
6. Audit log: full justification, two approver IDs
7. Flagged in compliance reports
```

**Mark Repayment as Defaulted**
```
Auto-triggered when: Payment not received 30 days after due date
Manual trigger: POST /api/v1/repayments/:scheduleId/default

What happens:
1. Installment status → DEFAULTED
2. Borrower risk flag raised automatically (MEDIUM)
3. If 3 consecutive defaults: risk flag → HIGH, account review triggered
4. If 6 consecutive defaults: flag → CRITICAL, collections escalation
5. FarmScore: -20 points per defaulted installment
6. Automated SMS escalation sequence begins:
   Day 31: "You have missed a loan repayment..."
   Day 38: "This is a final reminder before collections..."
   Day 45: Field agent assigned to physical visit
7. Audit log entry
```

**Send Manual Repayment Reminder**
```
POST /api/v1/repayments/remind
Body: { borrowerIds: [], message (optional override), channels: ["SMS", "WHATSAPP"] }

Sends reminder to selected borrowers regardless of whether they are overdue.
Can customise message or use default template.
```

#### DELETE
Repayment records cannot be deleted. Incorrectly recorded repayments are reversed:
```
POST /api/v1/repayments/:id/reverse
Body: { reason, approvedBy }
Creates a negative repayment entry (reversal) rather than deleting original.
```

### Real-World Simulation
The NIRSAL repayments officer runs a Monday morning routine. He opens Repayments filtered by Status = Overdue and Due Date range = last 30 days. He sees ₦18.4M overdue across 47 borrowers. He groups them:
- 0–14 days overdue (28 borrowers): Sends bulk SMS reminder
- 15–29 days overdue (13 borrowers): Sends WhatsApp message + assigns nearest field agent for visit
- 30+ days overdue (6 borrowers): Escalates to collections team, marks as DEFAULTED
For 2 of the 30+ day borrowers, he sees their farm reports show genuine flooding. He initiates restructuring for these 2.

---

## Page 8 — Field Agents

### Purpose
The management console for the on-ground verification network. Field agents are the human layer that makes AgroTrack trustworthy — they physically visit farms, verify identities, and map boundaries. This page is where lenders recruit, assign, monitor, and pay agents.

### What Is Displayed

#### Agent Overview Stats
- Total Agents: count
- Active Agents: currently assigned
- Farmers Registered This Month: via agents
- Farms Verified This Month: count
- Total Paid to Agents This Month: ₦ amount

#### Agent Cards Grid
Card per agent showing:
- Name and agent code
- State and zone
- Star rating (1.0–5.0, based on verification quality score)
- Status: Active / On Leave / Review / Deactivated
- This month: Registered X / Verified X / Visits X
- Total earned this month
- Pending tasks today
- Last active timestamp
- Actions: View Profile, Message, Assign Tasks, Pay, Deactivate

#### Agent Profile Page (click agent card)

**Performance Summary**
- Total farmers registered lifetime
- Total farms verified lifetime
- Total monitoring visits
- Average verification quality score
- GPS accuracy score (how precise their boundary walks are)
- On-time task completion rate

**Earnings Breakdown**
- Per registration: ₦1,500 × 47 = ₦70,500
- Per verification: ₦1,000 × 23 = ₦23,000
- Per monitoring visit: ₦500 × 18 = ₦9,000
- Total this month: ₦102,500
- Pending (awaiting approval): ₦32,000
- Request Payout button

**Assigned Tasks**
List of all pending tasks assigned to this agent:
- Task type: Registration / Verification / Monitoring Visit
- Borrower name + location
- Due date
- Priority level
- Status: Assigned / In Progress / Submitted / Verified / Overdue

**Verification Quality Review**
Random sample of agent's submissions for quality check:
- Farm photos (are they genuine? correct location?)
- GPS boundary accuracy
- Identity verification notes
- Quality score input by reviewer

### CRUD Operations

#### CREATE — Recruit New Agent

```
POST /api/v1/agents
Body: {
  firstName, lastName, phone, state, lga,
  zoneDescription, lenderId
}

What happens:
1. Agent profile created with status PENDING
2. SMS sent to agent with download link for Field Agent App
3. Agent registers on app using their phone number
4. Agent completes their own KYC (BVN, NIN, profile photo)
5. Lender admin receives notification: "Agent [name] has completed registration"
6. Lender admin reviews and activates: POST /agents/:id/activate
7. Agent receives SMS: "Your AgroTrack field agent account is active. Agent code: AGT-024"
```

#### READ
```
GET /api/v1/agents                          All agents for this lender
GET /api/v1/agents/:id                      Agent profile + stats
GET /api/v1/agents/:id/tasks                Assigned tasks
GET /api/v1/agents/:id/earnings             Earnings history
GET /api/v1/agents/:id/verifications        All verification reports submitted
GET /api/v1/agents/:id/quality-samples      Random sample for review
```

#### UPDATE

**Assign Task to Agent**
```
POST /api/v1/agents/:id/tasks
Body: {
  taskType: "REGISTRATION" | "VERIFICATION" | "MONITORING",
  borrowerId,
  dueDate,
  priority: "LOW" | "MEDIUM" | "HIGH",
  notes
}

Agent receives push notification on their app with task details.
```

**Update Agent Zone**
```
PATCH /api/v1/agents/:id
Body: { state, lga, zoneDescription }
```

**Rate Agent Verification**
```
POST /api/v1/agents/:id/verifications/:verificationId/rate
Body: { qualityScore: 1-5, notes }
Contributes to agent's overall rating.
```

**Approve Agent Payout**
```
POST /api/v1/agents/:id/payout
Body: { amount, approvedBy }

What happens:
1. Earnings marked PAID
2. Transfer via Paystack to agent's bank account
3. SMS receipt to agent
4. Payout record in audit log
```

**Deactivate Agent**
```
POST /api/v1/agents/:id/deactivate
Body: { reason }

What happens:
1. Status → DEACTIVATED
2. All pending tasks reassigned to nearest active agent
3. Agent app access revoked
4. Outstanding earnings still paid
5. Agent cannot register or verify new farmers
```

#### DELETE
Agents cannot be deleted — deactivation is the equivalent. All verification records they submitted are retained permanently.

### Real-World Simulation
A field supervisor in Benue State manages 12 agents. She opens Field Agents and sees agent Yusuf Abdullahi has a quality score drop from 4.6 to 3.8 this week. She clicks his profile and reviews his recent verification submissions. She notices 3 verifications where the farm photos GPS coordinates are 2km from where the borrower said their farm is. She opens the quality review panel, rates these 3 as LOW quality, and sends him a message: "Yusuf, please ensure you are physically walking the farm boundary, not submitting photos from roadside. This affects your rating and earnings." She then assigns him a retraining task and puts his next 5 verifications on hold for senior review.

---

## Page 9 — Cooperatives

### Purpose
Manage farmer groups. Cooperatives access larger loans, carry group accountability, and often have better repayment rates because peer pressure within the group acts as informal collateral.

### What Is Displayed

#### Cooperative Cards Grid
Card per cooperative:
- Name, state, LGA, primary crop
- Group FarmScore ring (group-level equivalent of individual score)
- Grade: Platinum / Gold / Silver / Bronze
- Member count
- Active group loans count
- Total group loan disbursed
- Group repayment rate (% on-time)
- Status: Active / Watch / Suspended
- Actions: View, Apply for Group Loan, Message

#### Cooperative Detail Page

**Overview Tab**
- Group FarmScore: 768 (displayed as ring)
- Score formula explanation: 70% average member score + 20% repayment history + 10% reporting consistency
- Loan history timeline
- Savings pool balance (from monthly member contributions)
- Guarantee fund balance (set aside for default coverage)

**Members Tab**
- Table: Name, Role (Chair/Secretary/Treasurer/Member), Individual FarmScore, Contribution status, Loan status
- Each member's score colour-coded
- Add member button
- Remove member button (with audit trail)
- Score distribution chart: how many Platinum/Gold/Silver/Bronze members

**Contributions Tab**
- Monthly bar chart of collective contributions
- Per-member contribution tracker for current month (paid / unpaid)
- Total savings pool
- Collect contributions button (marks members who have paid)

**Group Loans Tab**
- All group loan applications (past and present)
- Apply for New Group Loan button → 4-step modal:
  - Step 1: Amount (max based on Group Score), purpose, duration
  - Step 2: Member allocation table (weighted by individual FarmScore)
  - Step 3: Digital consent (SMS to all members for confirmation)
  - Step 4: Review and submit

**Reports Tab**
- Member performance report (PDF)
- Contribution history export
- Group FarmScore certificate (for external bank loan applications)
- Defaulters report

### CRUD Operations

#### CREATE — Register Cooperative
```
POST /api/v1/cooperatives
Body: {
  name, state, lga, cropFocus,
  chairBorrowerId, regNumber,
  savingsPerMemberKobo,
  foundingMemberPhones: [...]
}

Process:
1. Cooperative record created with status PENDING
2. SMS consent requests sent to all founding members
3. Members must confirm via USSD or app (reply YES)
4. Once all consent received: status → ACTIVE
5. Group FarmScore calculated from founding member scores
6. Chair receives SMS: "Your cooperative is now registered. Cooperative ID: COOP-0041"
```

#### READ
```
GET /api/v1/cooperatives
GET /api/v1/cooperatives/:id
GET /api/v1/cooperatives/:id/members
GET /api/v1/cooperatives/:id/loans
GET /api/v1/cooperatives/:id/contributions
GET /api/v1/cooperatives/:id/score
```

#### UPDATE
**Add / Remove Member**
```
POST /api/v1/cooperatives/:id/members
Body: { borrowerId, role }

DELETE /api/v1/cooperatives/:id/members/:borrowerId
Body: { reason }
Note: Cannot remove if member has active loan within cooperative
```

**Record Member Contribution**
```
POST /api/v1/cooperatives/:id/contributions
Body: { borrowerId, amountKobo, month, paidAt }
```

**Submit Group Loan Application**
```
POST /api/v1/cooperatives/:id/loans
Body: {
  programId, totalAmountKobo, purpose, duration, repaymentMode,
  memberAllocations: [{ borrowerId, amount, sharePercent }]
}

Requires digital consent from all members before submission.
Group FarmScore must meet minimum set in the program eligibility.
```

**Update Cooperative Status**
```
PATCH /api/v1/cooperatives/:id
Body: { status: "WATCH" | "SUSPENDED", reason }
```

#### DELETE
Cooperatives cannot be deleted if they have any loan history. Can be dissolved:
```
POST /api/v1/cooperatives/:id/dissolve
Body: { reason }
Requires all active loans to be fully repaid first.
```

---

## Page 10 — Reports

### Purpose
Compliance, performance, and impact reporting. Every loan programme needs to demonstrate outcomes to funders, regulators, and boards. This page automates what used to take weeks of manual spreadsheet work.

### What Is Displayed

#### Impact Banner
Live aggregate metrics:
- Farmers funded
- Hectares farmed
- Jobs created (estimated)
- Estimated yield (metric tonnes)
- Fund utilisation rate

#### Available Reports (8 report cards)

| Report | Content | Used For |
|---|---|---|
| Portfolio Performance | Disbursement, repayment, default by program | Board reporting |
| State-by-State Breakdown | All metrics segmented by state | Geographic targeting |
| Crop Type Analysis | Performance by crop (rice vs cassava etc.) | Risk assessment |
| Gender & Demographics | Female/male/youth breakdown | Donor reporting (USAID, GIZ) |
| Default Risk Report | High-risk borrowers, predictive analysis | Collections planning |
| Impact Report | Jobs, hectares, yield, economic output | Government submission |
| Field Agent Activity | Verification rates, agent performance | Operations review |
| Audit Export | Every action, immutable log | CBN / regulatory audit |

Each report card has:
- Preview button (sees report structure before generating)
- Date range selector
- Generate (async, shows loading then download link)
- Schedule (generate automatically: weekly / monthly / quarterly)

#### Custom Report Builder
Drag-and-drop field selector allowing lenders to build custom reports combining any available metrics.

### CRUD Operations

**Generate Report**
```
POST /api/v1/reports/generate
Body: { reportType, dateFrom, dateTo, filters, format: "PDF" | "CSV" | "XLSX" }

Process:
1. Job added to Bull queue (async processing)
2. Returns jobId
3. Frontend polls GET /api/v1/reports/:jobId/status
4. When complete: status = "DONE", downloadUrl returned
5. Report PDF generated using Puppeteer (headless Chrome renders template)
6. Uploaded to S3
7. Presigned download URL returned (expires 24 hours)
```

**Download Report**
```
GET /api/v1/reports/:jobId/download
Returns: Presigned S3 URL
```

**Schedule Report**
```
POST /api/v1/reports/schedules
Body: { reportType, frequency, recipients, filters }
Creates a cron job that generates and emails the report automatically.
```

---

## Page 11 — Map View

### Purpose
Geographic intelligence. The map shows lenders exactly where their borrowers are, which areas have good repayment rates, where default clusters are forming, and overlays risk information from external data sources.

### What Is Displayed

#### Interactive Map (Mapbox GL)
- Nigeria base map with state boundaries
- Borrower dots colour-coded by status:
  - Green: Active, good standing
  - Amber: At risk (overdue < 30 days or missing reports)
  - Red: Defaulting (overdue > 30 days)
  - Blue: Completed (loan fully repaid)
  - Grey: Application pending
- Cluster bubbles in dense areas (e.g. "47 borrowers" — zoom to expand)
- Click any dot: mini profile card with name, score, status, loan amount, quick actions

#### Map Overlay Toggles
- Borrower locations (default on)
- Repayment heat map (green = good area, red = poor repayment area)
- Flood risk overlay (NIMET data — shows flood-prone zones)
- Market proximity (how far each borrower is from nearest commodity market)
- Field agent zones (which agent covers which area, with their active tasks)
- Conflict/security risk zones (static dataset, updated quarterly)

#### Left Filter Panel
- Program filter (show only borrowers in specific program)
- Status filter
- State filter
- FarmScore range filter
- Crop type filter
- Date filter (when they joined)

#### Bottom Stats Bar
State-level summary: each visible state shows total borrowers / average repayment rate / total disbursed.

### CRUD Operations

**Save Map View**
```
POST /api/v1/map/saved-views
Body: { name, filters, center, zoom, activeLayers }
Saves current map state for quick access later.
```

**Export Map**
```
POST /api/v1/map/export
Body: { filters, format: "PDF" | "PNG" }
Generates a static map image for inclusion in reports.
```

**Update Agent Zone (from map)**
```
PATCH /api/v1/agents/:id/zone
Body: { geoJson (polygon drawn on map) }
Lender draws agent zone directly on map.
```

---

## Page 12 — Messages

### Purpose
The unified communications hub. All conversations between lender staff and borrowers happen here. Supports individual messaging, bulk broadcasts, and template-based automated messages.

### What Is Displayed

#### Left Panel — Conversation List
- List of all individual and broadcast conversations
- Unread badge per conversation
- Last message preview
- Borrower/group name
- Program tag
- Online indicator (green dot if borrower active in app)

#### Right Panel — Chat Interface

**Individual Chat**
- Message bubbles (lender = right, borrower = left)
- Message timestamp
- Delivery status: Sent / Delivered / Read
- Photo/document sharing (borrower can send farm photos directly in chat)
- Actions: View Borrower Profile, Flag, Send Farm Report Request

**Broadcast Message**
- Compose to: All Borrowers / Specific Program / Specific State / Custom Group
- Message with variable substitution ({{name}}, {{amount}}, {{dueDate}})
- Send via: In-app / SMS / WhatsApp / All channels
- Preview before send (shows sample with populated variables)
- Send stats after: X sent, X delivered, X read

**Message Templates Library**
Pre-built templates:
- Repayment Reminder (due in 3 days)
- Repayment Overdue (7 days late)
- Disbursement Notification (money sent)
- Application Approved
- Application Rejected
- Farm Report Due
- Congratulations (loan completed)
- Verification Scheduled (agent visit)

### CRUD Operations

**Send Individual Message**
```
POST /api/v1/messages
Body: { recipientId, content, programId (optional) }
Delivered via in-app WebSocket, SMS if offline.
```

**Send Broadcast**
```
POST /api/v1/messages/broadcast
Body: {
  audience: { programId } | { state } | { borrowerIds: [] },
  content,
  channels: ["IN_APP", "SMS", "WHATSAPP"],
  templateId (optional)
}

Process:
  1. Audience list resolved (e.g. all borrowers in CBN Rice Fund)
  2. Message personalised per recipient (name, amounts inserted)
  3. Queued in Bull for batch processing
  4. In-app messages sent via Socket.IO (instant)
  5. SMS sent via Termii (batched, 500/second rate limit)
  6. WhatsApp sent via Meta API
  7. Delivery stats updated as confirmations arrive
```

**Create Template**
```
POST /api/v1/messages/templates
Body: { name, content, variables: [], channels: [] }
```

---

## Page 13 — Settings

### Purpose
Full configuration of the lender account, user management, integrations, notification preferences, disbursement rules, security settings, and billing.

### What Is Displayed (6 tabs)

#### Tab 1: Organisation Profile
- Organisation name, type, registration number
- Official email and phone
- Logo upload (S3)
- Office address
- Website
- Primary contact person
- CRUD: GET/PATCH /api/v1/lenders/:id

#### Tab 2: Team & Roles
- List of all team members with roles
- Invite team member (sends email with magic link)
- Change member role: Admin / Manager / Analyst / Viewer
- Remove team member
- Transfer account ownership
- CRUD: GET/POST/PATCH/DELETE /api/v1/lenders/:id/members

#### Tab 3: Notifications
Toggles per event per channel:
- Which events trigger which channels (SMS / Email / WhatsApp / In-app)
- Notification frequency: Instant / Daily Digest / Weekly Summary
- Quiet hours (no SMS between 10pm and 7am)
- CRUD: GET/PATCH /api/v1/lenders/:id/notification-settings

#### Tab 4: Disbursement Rules
Platform-wide defaults for this lender:
- Require layered disbursement: Yes / No
- Require agent verification before Layer 2: Yes / No
- Auto-approve borrowers with FarmScore above: X
- Maximum days to process disbursement request: X days
- Default farm report interval: Monthly / Bi-weekly / Weekly
- Default disbursement layer template (editable)
- CRUD: GET/PATCH /api/v1/lenders/:id/disbursement-rules

#### Tab 5: Security
- Two-factor authentication: Enable / Disable
- Session timeout duration
- Active sessions list with revoke option
- Password change
- Audit log download
- API key management: Create / View / Revoke
- CRUD: GET/POST/DELETE /api/v1/lenders/:id/sessions and /api-keys

#### Tab 6: Integrations
- Paystack: Connected / Configure
- WhatsApp Business: Connected / Configure
- Termii SMS: Connected / Configure
- Google Maps: Connected / Configure
- NIBSS BVN: Connected (managed by AgroTrack)
- NIMC NIN: Connected (managed by AgroTrack)
- FarmScore API (outbound): Enable / Generate API key
- Webhook URL (for receiving events in lender's own systems): Configure

#### Tab 7: Billing
- Current plan and features
- Usage: borrowers used / program count / API calls
- Monthly invoice history with download
- Change plan (upgrade/downgrade)
- Payment method management
- CRUD: GET /api/v1/lenders/:id/billing

---

## Data Integrity & Audit Requirements

Every page in this dashboard that performs a write operation creates an immutable audit log entry:

```
AuditLog {
  id
  userId          (who performed the action)
  action          (e.g. "APPROVED_DISBURSEMENT", "REJECTED_APPLICATION")
  resource        (e.g. "Application", "LayerDisbursement")
  resourceId      (the specific record affected)
  before          (JSON snapshot of record before change)
  after           (JSON snapshot of record after change)
  ipAddress
  userAgent
  createdAt
}
```

This audit trail:
- Cannot be modified or deleted by anyone including super admin
- Is stored in a separate append-only database partition
- Is exportable as PDF or CSV for CBN, NIRSAL, or donor audits
- Is retained for minimum 7 years (Nigerian financial regulation)

---

## Role-Based Access per Page

| Page | Lender Admin | Lender Manager | Lender Analyst | Field Supervisor | Field Agent |
|---|---|---|---|---|---|
| Dashboard | Full | Full | Read | Read | No access |
| Applications | Full | Full (approve/reject) | Read | Read | No access |
| Loans | Full | Full | Read | Read | No access |
| Loan Programs | Full | Create/Edit | Read | Read | No access |
| Borrowers | Full | Full | Read | Read + Assign | Limited |
| Disbursements | Full | Approve up to limit | Read | Read | No access |
| Repayments | Full | Record + remind | Read | Read | No access |
| Field Agents | Full | Assign tasks + pay | Read | Full | Own profile |
| Cooperatives | Full | Full | Read | Read | No access |
| Reports | Full | Generate | Generate | Limited | No access |
| Map View | Full | Full | Full | Zone only | Zone only |
| Messages | Full | Full | Read | Send to agents | Own messages |
| Settings | Full (all tabs) | Profile + notifs | Notifs only | No access | No access |

---

*AgroTrack Lender Dashboard — Production Feature Specification v2.0*  
*Engineering team: engineering@agrotrack.ng*  
*Last updated: June 2025*
ENDOFMD

echo "File written. Lines: $(wc -l < /tmp/agrotrack_plan.md)"
Output

File written. Lines: 1857
Done
continue

06:49
Now copy both markdown files to outputs and present them:


Copy both markdown files to outputs
Copy both markdown files to outputs

Copy both markdown files to outputs
bash

cp /tmp/agrotrack_plan.md /mnt/user-data/outputs/agrotrack-production-spec.md
cp /tmp/agrotrack_plan.md /mnt/user-data/outputs/agrotrack-technical-architecture.md

# Also copy the earlier technical architecture plan
echo "Files ready:"
ls -lh /mnt/user-data/outputs/*.md
Output

Files ready:
-rw-r--r-- 1 claude ubuntu 64K Jun 26 05:49 /mnt/user-data/outputs/agrotrack-production-spec.md
-rw-r--r-- 1 claude ubuntu 64K Jun 26 05:49 /mnt/user-data/outputs/agrotrack-technical-architecture.md
Done
Now write the technical architecture plan as a separate, dedicated file:


Write the complete technical architecture markdown plan
Write the complete technical architecture markdown plan

Write the complete technical architecture markdown plan
bash

cat > /mnt/user-data/outputs/agrotrack-technical-architecture.md << 'ARCHEOF'
# AgroTrack — Complete Technical Architecture Plan

**Version:** 1.0  
**Date:** June 2025  
**Stack:** React · TypeScript · Node.js · PostgreSQL · Prisma · JWT · Redis · AWS · Bull Queues

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Complete Database Schema (Prisma)](#4-complete-database-schema)
5. [API Route Design](#5-api-route-design)
6. [Authentication Strategy](#6-authentication-strategy)
7. [Background Jobs & Queues](#7-background-jobs--queues)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [FarmScore Engine](#9-farmscore-engine)
10. [USSD Architecture](#10-ussd-architecture)
11. [File Storage Architecture](#11-file-storage-architecture)
12. [Real-Time (WebSocket)](#12-real-time-websocket)
13. [DevOps & Infrastructure](#13-devops--infrastructure)
14. [Environment Variables](#14-environment-variables)
15. [Project Directory Structure](#15-project-directory-structure)
16. [Security Checklist](#16-security-checklist)
17. [Performance Targets](#17-performance-targets)

---

## 1. System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Lender Web App  │  │ Borrower Web App  │  │ Field Agent App  │  │
│  │  (React + Vite)  │  │  (React + Vite)   │  │ (React Native)   │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                    │                       │             │
│  ┌────────┴────────────────────┴───────────────────────┴─────────┐  │
│  │                  CDN (AWS CloudFront)                          │  │
│  └────────────────────────────┬───────────────────────────────── ┘  │
└───────────────────────────────┼─────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────┼─────────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│           AWS Application Load Balancer + Nginx                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │           Express.js API Server (Node.js 20)                │    │
│  │                                                              │    │
│  │   Auth  Programs  Borrowers  Disbursements  FarmScore        │    │
│  │   USSD  WhatsApp  Agents     Reports        Admin            │    │
│  └───────────────────────────────────────────────────────────  ┘    │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  PostgreSQL 16  │  │   Redis 7    │  │     AWS S3            │   │
│  │  (Primary DB)   │  │  (Cache +    │  │  (Photos, Docs, PDFs) │   │
│  │  + PostGIS      │  │   Sessions + │  │                       │   │
│  │                 │  │   Bull Queue)│  │                       │   │
│  └────────────────┘  └──────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                          │
│                                                                     │
│  NIBSS (BVN)  NIMC (NIN)  Paystack  Termii SMS  Meta WhatsApp      │
│  Africa's Talking (USSD)  SendGrid  Sentry  Mapbox  Sentinel Hub   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| ORM | Prisma | Type-safe queries, auto-migrations, excellent DX |
| Auth | JWT + Refresh Tokens | Stateless scaling, secure rotation |
| Cache | Redis | Session storage, rate limiting, Bull queues |
| File storage | AWS S3 + direct upload | Bypasses API server for large files |
| Real-time | Socket.IO | Reliable, battle-tested, Nigerian network tolerant |
| SMS | Termii primary | Nigerian local provider, better delivery rates |
| Payments | Paystack primary | Best Nigerian bank coverage, webhook reliability |
| USSD | Africa's Talking | Supports all 4 major Nigerian carriers |
| Queue | Bull (Redis-backed) | Reliable job processing, retry logic built in |
| Spatial | PostGIS | Farm boundary storage and proximity queries |

---

## 2. Frontend Architecture

### Tech Stack

```
Framework:      React 18 + TypeScript 5
Build Tool:     Vite 5
Routing:        React Router v6 (nested routes)
State Global:   Zustand 4 (auth, theme, UI state)
State Server:   TanStack Query v5 (API data, caching, background sync)
Styling:        Tailwind CSS 3 + CSS-in-JS for dynamic styles
Charts:         Recharts 2
Maps:           Mapbox GL JS 3
Forms:          React Hook Form 7 + Zod validation
File Upload:    React Dropzone + Axios multipart
PWA:            Vite PWA plugin (offline support for field agents)
Testing:        Vitest + React Testing Library + Playwright (E2E)
Icons:          Lucide React
HTTP Client:    Axios with interceptors
WebSocket:      Socket.IO Client
```

### Frontend Directory Structure

```
agrotrack-frontend/
├── public/
│   ├── icons/                        # PWA app icons (72x72 to 512x512)
│   ├── manifest.json                 # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Root router + providers
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/                    # Inter font files
│   │
│   ├── components/                   # Shared, reusable UI
│   │   ├── ui/                       # Atomic design system
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Skeleton.tsx          # Loading states
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Collapsible sidebar
│   │   │   ├── Topbar.tsx            # Search, dark mode, notifications
│   │   │   ├── AuthShell.tsx         # Centered card layout for auth pages
│   │   │   ├── DashboardLayout.tsx   # Sidebar + Topbar wrapper
│   │   │   └── PublicLayout.tsx      # Landing page layout
│   │   │
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── DonutChart.tsx
│   │   │
│   │   └── shared/
│   │       ├── FarmScoreRing.tsx     # SVG animated score ring
│   │       ├── StatusPill.tsx        # Coloured status badge
│   │       ├── PlanBadge.tsx         # Starter/Growth/Enterprise
│   │       ├── FileUpload.tsx        # Drag-drop + S3 direct upload
│   │       ├── GPSCapture.tsx        # Get current GPS coordinates
│   │       ├── OTPInput.tsx          # 6-digit individual input boxes
│   │       ├── StepWizard.tsx        # Multi-step form wrapper
│   │       ├── ConfirmModal.tsx      # Delete/destructive action confirm
│   │       ├── ExportButton.tsx      # CSV/PDF export trigger
│   │       ├── BulkActionBar.tsx     # Appears when rows selected
│   │       └── NotificationBell.tsx  # Real-time notification dropdown
│   │
│   ├── features/                     # Domain-driven feature modules
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LenderLogin.tsx
│   │   │   │   ├── LenderSignup.tsx  # 5-step wizard
│   │   │   │   ├── BorrowerRegister.tsx # 5-step wizard
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── TwoFactorAuth.tsx
│   │   │   │   └── LenderSetupWizard.tsx # First program setup
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts      # Zustand: user, tokens, session
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   ├── AtRiskTable.tsx
│   │   │   │   └── PortfolioByCrop.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardStats.ts
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── applications/
│   │   │   ├── components/
│   │   │   │   ├── ApplicationTable.tsx
│   │   │   │   ├── ApplicationDetail.tsx
│   │   │   │   ├── ApproveModal.tsx
│   │   │   │   ├── RejectModal.tsx
│   │   │   │   ├── RequestInfoModal.tsx
│   │   │   │   └── DocumentViewer.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useApplications.ts
│   │   │   │   └── useApplicationActions.ts
│   │   │   └── ApplicationsPage.tsx
│   │   │
│   │   ├── loans/
│   │   ├── programs/
│   │   ├── borrowers/
│   │   ├── disbursements/
│   │   ├── repayments/
│   │   ├── field-agents/
│   │   ├── cooperatives/
│   │   ├── reports/
│   │   ├── map-view/
│   │   ├── messages/
│   │   └── settings/
│   │
│   ├── hooks/                        # Cross-feature hooks
│   │   ├── useTheme.ts               # Dark/light + persist to localStorage
│   │   ├── useDebounce.ts            # Search input debounce
│   │   ├── useGeolocation.ts         # GPS coordinates
│   │   ├── useWebSocket.ts           # Socket.IO connection
│   │   ├── useOffline.ts             # PWA offline detection
│   │   ├── usePagination.ts          # Cursor-based pagination state
│   │   └── usePermission.ts          # Role-based UI rendering
│   │
│   ├── services/                     # API client layer
│   │   ├── api.ts                    # Axios instance + auth interceptors
│   │   ├── auth.service.ts
│   │   ├── programs.service.ts
│   │   ├── applications.service.ts
│   │   ├── loans.service.ts
│   │   ├── borrowers.service.ts
│   │   ├── disbursements.service.ts
│   │   ├── repayments.service.ts
│   │   ├── agents.service.ts
│   │   ├── cooperatives.service.ts
│   │   ├── farmscore.service.ts
│   │   ├── reports.service.ts
│   │   ├── messages.service.ts
│   │   └── uploads.service.ts
│   │
│   ├── store/                        # Zustand global stores
│   │   ├── authStore.ts              # { user, accessToken, refreshToken }
│   │   ├── themeStore.ts             # { isDark, toggleTheme }
│   │   ├── notificationStore.ts      # { notifications, unreadCount }
│   │   └── uiStore.ts               # { sidebarOpen, activeModal }
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts         # ₦1,250,000 formatting
│   │   ├── formatDate.ts             # "Jun 13, 2025" / "2 days ago"
│   │   ├── validateNIN.ts
│   │   ├── validateBVN.ts
│   │   ├── geoUtils.ts               # GPS calculations
│   │   └── downloadFile.ts           # Trigger file download from URL
│   │
│   ├── types/                        # TypeScript interfaces
│   │   ├── auth.types.ts
│   │   ├── program.types.ts
│   │   ├── borrower.types.ts
│   │   ├── loan.types.ts
│   │   ├── agent.types.ts
│   │   ├── cooperative.types.ts
│   │   └── api.types.ts              # Generic ApiResponse<T>
│   │
│   ├── constants/
│   │   ├── routes.ts                 # All route path constants
│   │   ├── roles.ts                  # UserRole enum mirror
│   │   ├── nigerianStates.ts         # 37 states + FCT array
│   │   ├── cropTypes.ts              # Master crop list
│   │   └── queryKeys.ts              # TanStack Query key factory
│   │
│   └── config/
│       ├── env.ts                    # import.meta.env with type safety
│       └── queryClient.ts            # TanStack Query configuration
│
├── .env.local
├── .env.production
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Key Frontend Patterns

#### Axios Instance with Token Refresh

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies (refresh token)
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh access token on 401
let isRefreshing = false;
let failedQueue: any[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        failedQueue.forEach((p) => p.resolve(newToken));
        failedQueue = [];
        return api(originalRequest);
      } catch {
        failedQueue.forEach((p) => p.reject(error));
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### TanStack Query Pattern

```typescript
// src/features/borrowers/hooks/useBorrowers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowersService } from '@/services/borrowers.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useBorrowers = (filters: BorrowerFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.borrowers.list(filters),
    queryFn: () => borrowersService.getAll(filters),
    staleTime: 1000 * 60 * 5,    // 5 minutes
    gcTime: 1000 * 60 * 30,       // 30 minutes
  });
};

export const useApproveDisbursement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disbursementsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disbursements.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};
```

---

## 3. Backend Architecture

### Tech Stack

```
Runtime:        Node.js 20 LTS
Framework:      Express.js 5
Language:       TypeScript 5
ORM:            Prisma 5 (with PostGIS extension)
Database:       PostgreSQL 16 + PostGIS 3.4
Cache:          Redis 7 (ioredis client)
Auth:           JWT (RS256) + bcrypt (rounds: 12)
File Storage:   AWS S3 + SDK v3
Email:          SendGrid
SMS:            Termii (primary) + Twilio (fallback)
WhatsApp:       Meta WhatsApp Business Cloud API
USSD:           Africa's Talking SDK
Payments:       Paystack SDK + Flutterwave (fallback)
Maps:           Google Maps Geocoding API
Identity:       NIBSS BVN API + NIMC NIN API
Queue:          BullMQ (Redis-backed, successor to Bull)
WebSocket:      Socket.IO 4
PDF Generation: Puppeteer (headless Chromium)
Monitoring:     Sentry (errors) + Datadog (metrics)
Logging:        Winston + Morgan
Validation:     Zod
Testing:        Jest + Supertest
```

### Backend Directory Structure

```
agrotrack-backend/
├── prisma/
│   ├── schema.prisma               # Full database schema
│   ├── migrations/                 # Auto-generated migration files
│   │   └── 20250613_init/
│   └── seed.ts                     # Dev seed data
│
├── src/
│   ├── server.ts                   # HTTP server bootstrap
│   ├── app.ts                      # Express app, middleware, routes
│   │
│   ├── config/
│   │   ├── database.ts             # Prisma client singleton
│   │   ├── redis.ts                # ioredis client
│   │   ├── s3.ts                   # AWS S3 client v3
│   │   ├── sendgrid.ts             # SendGrid client
│   │   ├── termii.ts               # Termii SMS client
│   │   ├── whatsapp.ts             # Meta WhatsApp Business client
│   │   ├── paystack.ts             # Paystack client
│   │   ├── socket.ts               # Socket.IO server setup
│   │   └── env.ts                  # Zod-validated environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # Verify JWT, attach req.user
│   │   ├── role.middleware.ts       # RBAC permission enforcement
│   │   ├── rateLimiter.ts          # Per-route rate limiting (Redis)
│   │   ├── upload.middleware.ts     # Multer config for S3 upload
│   │   ├── validate.middleware.ts   # Zod request body validation
│   │   ├── audit.middleware.ts      # Auto-log all POST/PATCH/DELETE
│   │   ├── lenderScope.ts          # Ensure data belongs to lender
│   │   └── errorHandler.ts         # Global error handler
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts      # Zod schemas for all auth routes
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   ├── lenders/
│   │   ├── programs/
│   │   ├── applications/
│   │   ├── loans/
│   │   ├── disbursements/
│   │   ├── repayments/
│   │   ├── farm-reports/
│   │   ├── field-agents/
│   │   ├── cooperatives/
│   │   ├── farmscore/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── ussd/
│   │   ├── whatsapp/
│   │   ├── payments/
│   │   ├── uploads/
│   │   ├── reports/
│   │   └── admin/
│   │
│   ├── jobs/
│   │   ├── queue.ts                # BullMQ queue definitions
│   │   ├── workers/
│   │   │   ├── farmscore.worker.ts     # Recalculate on trigger
│   │   │   ├── repayment.worker.ts     # Daily overdue check
│   │   │   ├── notification.worker.ts  # Batch SMS/email/WhatsApp
│   │   │   ├── report.worker.ts        # Async PDF generation
│   │   │   └── disbursement.worker.ts  # Auto-disburse on trigger
│   │   └── schedulers/
│   │       ├── daily.scheduler.ts      # Midnight: overdue checks
│   │       └── weekly.scheduler.ts     # Monday: weekly summaries
│   │
│   ├── integrations/
│   │   ├── nibss/
│   │   │   ├── nibss.client.ts
│   │   │   └── nibss.types.ts
│   │   ├── nimc/
│   │   │   ├── nimc.client.ts
│   │   │   └── nimc.types.ts
│   │   ├── paystack/
│   │   │   ├── paystack.client.ts
│   │   │   └── paystack.types.ts
│   │   └── africastalking/
│   │       ├── at.client.ts
│   │       └── at.types.ts
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── express.d.ts        # Extend Request with user
│   │   │   └── global.types.ts
│   │   ├── utils/
│   │   │   ├── logger.ts           # Winston structured logger
│   │   │   ├── asyncHandler.ts     # Wrap async to catch errors
│   │   │   ├── pagination.ts       # Cursor pagination helper
│   │   │   ├── response.ts         # Standard response helpers
│   │   │   ├── crypto.ts           # AES-256 encrypt/decrypt (PII)
│   │   │   └── nigeria.ts          # State/LGA validation helpers
│   │   └── errors/
│   │       ├── AppError.ts
│   │       ├── AuthError.ts
│   │       ├── ValidationError.ts
│   │       └── NotFoundError.ts
│   │
│   └── routes/
│       └── index.ts                # Master router
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
│       └── loan-lifecycle.test.ts
│
├── scripts/
│   ├── seed-dev.ts
│   └── migrate-prod.ts
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

### Core Middleware Pattern

```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { AuthError } from '@/shared/errors/AuthError';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AuthError('No token provided');

  // Check if token is blacklisted (logged out)
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) throw new AuthError('Token has been revoked');

  const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY) as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { lenderMember: true, borrower: true, fieldAgent: true },
  });

  if (!user || !user.isActive) throw new AuthError('User not found or deactivated');

  req.user = user;
  next();
});

// src/middleware/role.middleware.ts
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthError('You do not have permission to perform this action');
    }
    next();
  };
};

// Usage in router:
router.post('/applications/:id/approve',
  authenticate,
  requireRole('LENDER_ADMIN', 'LENDER_MANAGER'),
  validate(approveApplicationSchema),
  applicationsController.approve
);
```

---

## 4. Complete Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis, pgcrypto]
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

enum LenderPlan { STARTER GROWTH ENTERPRISE }
enum LenderStatus { ACTIVE TRIAL SUSPENDED PENDING }
enum ProgramType { LOAN GRANT HYBRID }
enum ProgramStatus { DRAFT ACTIVE PAUSED CLOSED }
enum DisbursementType { LAYERED LUMP_SUM IN_KIND }
enum ApplicationStatus { PENDING UNDER_REVIEW APPROVED REJECTED WITHDRAWN }
enum DisbursementStatus { PENDING PROOF_SUBMITTED APPROVED RELEASED FAILED CANCELLED }
enum RepaymentStatus { SCHEDULED PAID LATE OVERDUE DEFAULTED WAIVED REVERSED }
enum RepaymentMethod { BANK_TRANSFER USSD MOBILE_MONEY PAYSTACK IN_KIND }
enum LoanStatus { ACTIVE COMPLETED DEFAULTED RESTRUCTURED WRITTEN_OFF }
enum FarmReportStatus { DRAFT SUBMITTED VERIFIED REJECTED }
enum CropGrowthStage { LAND_PREPARATION PLANTING GROWING FLOWERING HARVESTING }
enum AgentTaskType { REGISTRATION VERIFICATION MONITORING }
enum AgentTaskStatus { ASSIGNED IN_PROGRESS SUBMITTED VERIFIED OVERDUE CANCELLED }
enum CoopStatus { PENDING ACTIVE WATCH SUSPENDED DISSOLVED }
enum NotificationChannel { SMS EMAIL WHATSAPP IN_APP PUSH }
enum NotificationType {
  REPAYMENT_DUE REPAYMENT_RECEIVED REPAYMENT_OVERDUE
  DISBURSEMENT_RELEASED DISBURSEMENT_FAILED
  APPLICATION_APPROVED APPLICATION_REJECTED APPLICATION_INFO_REQUESTED
  FARM_REPORT_DUE FARM_REPORT_VERIFIED
  FARMSCORE_UPDATED LOAN_COMPLETED SYSTEM_ALERT
}
enum AuditAction {
  CREATED UPDATED DELETED APPROVED REJECTED
  SUSPENDED REACTIVATED DISBURSED REPAID RESTRUCTURED WRITTEN_OFF
  FLAGGED BLACKLISTED MANUAL_OVERRIDE
}

// ─── USER & AUTH ──────────────────────────────────────────────────────────────

model User {
  id              String    @id @default(cuid())
  email           String?   @unique
  phone           String    @unique
  passwordHash    String
  role            UserRole
  firstName       String
  lastName        String
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  twoFAEnabled    Boolean   @default(false)
  twoFASecret     String?   // Encrypted
  backupCodes     String[]  // Hashed backup codes
  lastLoginAt     DateTime?
  lastLoginIp     String?
  failedLoginCount Int      @default(0)
  lockedUntil     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  lenderMember    LenderMember?
  borrower        Borrower?
  fieldAgent      FieldAgent?
  sessions        UserSession[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  sentMessages    Message[]     @relation("SentBy")

  @@index([email])
  @@index([phone])
  @@map("users")
}

model UserSession {
  id              String   @id @default(cuid())
  userId          String
  refreshTokenHash String  @unique
  deviceInfo      String?
  ipAddress       String?
  userAgent       String?
  expiresAt       DateTime
  createdAt       DateTime @default(now())
  lastUsedAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_sessions")
}

// ─── LENDER ────────────────────────────────────────────────────────────────────

model Lender {
  id              String       @id @default(cuid())
  name            String
  type            String
  regNumber       String?      @unique
  email           String       @unique
  phone           String
  address         String?
  state           String
  website         String?
  logoUrl         String?
  plan            LenderPlan   @default(STARTER)
  status          LenderStatus @default(PENDING)
  isVerified      Boolean      @default(false)
  verifiedAt      DateTime?
  trialEndsAt     DateTime?
  creditLimit     BigInt       @default(0)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  members          LenderMember[]
  programs         LoanProgram[]
  featureFlags     LenderFeatureFlag[]
  billingRecords   BillingRecord[]
  apiKeys          ApiKey[]
  notifSettings    LenderNotifSettings?
  disbRules        LenderDisbRules?

  @@map("lenders")
}

model LenderMember {
  id          String   @id @default(cuid())
  userId      String   @unique
  lenderId    String
  role        UserRole
  isOwner     Boolean  @default(false)
  invitedBy   String?
  joinedAt    DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  lender Lender @relation(fields: [lenderId], references: [id])

  @@map("lender_members")
}

model LenderFeatureFlag {
  id             String   @id @default(cuid())
  lenderId       String
  flagName       String
  enabled        Boolean  @default(false)
  overrideGlobal Boolean  @default(false)
  setAt          DateTime @default(now())
  setBy          String?

  lender Lender @relation(fields: [lenderId], references: [id])
  @@unique([lenderId, flagName])
  @@map("lender_feature_flags")
}

model LenderNotifSettings {
  id              String  @id @default(cuid())
  lenderId        String  @unique
  smsEnabled      Boolean @default(true)
  emailEnabled    Boolean @default(true)
  whatsappEnabled Boolean @default(false)
  inAppEnabled    Boolean @default(true)
  quietHoursStart Int     @default(22) // 10pm
  quietHoursEnd   Int     @default(7)  // 7am
  dailyDigest     Boolean @default(false)
  weeklyDigest    Boolean @default(true)

  lender Lender @relation(fields: [lenderId], references: [id])
  @@map("lender_notif_settings")
}

model LenderDisbRules {
  id                       String  @id @default(cuid())
  lenderId                 String  @unique
  requireLayered           Boolean @default(true)
  requireAgentForLayer2    Boolean @default(true)
  autoApproveMinScore      Int?
  maxDaysToProcessDisb     Int     @default(5)
  reportIntervalDays       Int     @default(30)
  latePaymentPenaltyPct    Decimal @default(0) @db.Decimal(5,2)
  defaultDaysOverdue       Int     @default(30)

  lender Lender @relation(fields: [lenderId], references: [id])
  @@map("lender_disb_rules")
}

model BillingRecord {
  id          String   @id @default(cuid())
  lenderId    String
  amount      BigInt
  description String
  status      String
  paystackRef String?
  paidAt      DateTime?
  createdAt   DateTime @default(now())

  lender Lender @relation(fields: [lenderId], references: [id])
  @@map("billing_records")
}

model ApiKey {
  id          String    @id @default(cuid())
  lenderId    String
  name        String
  keyHash     String    @unique
  keyPrefix   String    // First 8 chars shown in UI
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  createdBy   String

  lender Lender @relation(fields: [lenderId], references: [id])
  @@map("api_keys")
}

// ─── LOAN PROGRAM ─────────────────────────────────────────────────────────────

model LoanProgram {
  id                  String         @id @default(cuid())
  lenderId            String
  name                String
  description         String?
  type                ProgramType
  status              ProgramStatus  @default(DRAFT)
  disbursementType    DisbursementType @default(LAYERED)
  totalPoolKobo       BigInt
  disbursedKobo       BigInt         @default(0)
  repaidKobo          BigInt         @default(0)
  minLoanKobo         BigInt
  maxLoanKobo         BigInt
  interestRatePct     Decimal        @db.Decimal(5, 2)
  repaymentMonths     Int
  gracePeriodMonths   Int            @default(0)
  repaymentFrequency  String         @default("MONTHLY")
  eligibilityCriteria Json
  requiredDocuments   Json
  applicationDeadline DateTime?
  publishedAt         DateTime?
  pausedAt            DateTime?
  closedAt            DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  lender       Lender              @relation(fields: [lenderId], references: [id])
  layers       DisbursementLayer[]
  applications Application[]

  @@index([lenderId, status])
  @@map("loan_programs")
}

model DisbursementLayer {
  id               String  @id @default(cuid())
  programId        String
  layerNumber      Int
  name             String
  percentShare     Decimal @db.Decimal(5, 2)
  triggerCondition String
  requiredProof    String
  requireAgentConfirm Boolean @default(false)
  maxDaysFromPrevious Int?

  program       LoanProgram        @relation(fields: [programId], references: [id])
  disbursements LayerDisbursement[]

  @@unique([programId, layerNumber])
  @@map("disbursement_layers")
}

// ─── BORROWER ─────────────────────────────────────────────────────────────────

model Borrower {
  id                  String    @id @default(cuid())
  userId              String    @unique
  farmerId            String    @unique @default(cuid())
  bvnEncrypted        String?
  ninEncrypted        String?
  bvnVerified         Boolean   @default(false)
  ninVerified         Boolean   @default(false)
  bvnVerifiedAt       DateTime?
  ninVerifiedAt       DateTime?
  dateOfBirth         DateTime?
  gender              String?
  state               String?
  lga                 String?
  farmSizeHectares    Decimal?  @db.Decimal(8, 2)
  farmLatitude        Decimal?  @db.Decimal(10, 8)
  farmLongitude       Decimal?  @db.Decimal(11, 8)
  farmBoundaryGeoJson Json?
  cropTypes           String[]
  profilePhotoUrl     String?
  farmPhotoUrls       String[]
  bankName            String?
  accountNumberEncrypted String?
  accountName         String?
  paystackRecipientCode String?
  cooperativeId       String?
  farmScore           Int       @default(0)
  farmScoreGrade      String    @default("UNSCORED")
  farmScoreUpdatedAt  DateTime?
  riskFlag            String?   // LOW | MEDIUM | HIGH | CRITICAL
  riskFlagReason      String?
  isBlacklisted       Boolean   @default(false)
  blacklistedUntil    DateTime?
  blacklistReason     String?
  registrationMethod  String    @default("APP") // APP | USSD | AGENT
  registeredByAgentId String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  user           User            @relation(fields: [userId], references: [id])
  cooperative    Cooperative?    @relation(fields: [cooperativeId], references: [id])
  applications   Application[]
  farmReports    FarmReport[]
  repayments     Repayment[]
  scoreHistory   FarmScoreHistory[]
  documents      BorrowerDocument[]
  coopMembership CoopMember[]

  @@index([state, lga])
  @@index([farmScore])
  @@index([farmLatitude, farmLongitude])
  @@map("borrowers")
}

model BorrowerDocument {
  id          String   @id @default(cuid())
  borrowerId  String
  docType     String
  fileUrl     String
  fileKey     String   // S3 key
  fileSize    Int?
  verified    Boolean  @default(false)
  verifiedBy  String?
  verifiedAt  DateTime?
  flagged     Boolean  @default(false)
  flagReason  String?
  uploadedAt  DateTime @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])
  @@map("borrower_documents")
}

// ─── APPLICATION ──────────────────────────────────────────────────────────────

model Application {
  id                 String            @id @default(cuid())
  borrowerId         String
  programId          String
  requestedKobo      BigInt
  approvedKobo       BigInt?
  purpose            String?
  status             ApplicationStatus @default(PENDING)
  reviewerId         String?
  reviewNotes        String?
  rejectionCode      String?
  rejectionReason    String?
  requestedInfoItems Json?
  agentVerificationId String?
  daysInQueue        Int               @default(0)
  submittedAt        DateTime          @default(now())
  reviewedAt         DateTime?
  approvedAt         DateTime?
  rejectedAt         DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  borrower       Borrower          @relation(fields: [borrowerId], references: [id])
  program        LoanProgram       @relation(fields: [programId], references: [id])
  disbursements  LayerDisbursement[]
  loan           Loan?

  @@index([borrowerId, status])
  @@index([programId, status])
  @@index([submittedAt])
  @@map("applications")
}

// ─── LOAN ─────────────────────────────────────────────────────────────────────

model Loan {
  id                  String     @id @default(cuid())
  applicationId       String     @unique
  borrowerId          String
  programId           String
  principalKobo       BigInt
  totalInterestKobo   BigInt
  outstandingKobo     BigInt
  status              LoanStatus @default(ACTIVE)
  effectiveDate       DateTime
  maturityDate        DateTime
  restructuredAt      DateTime?
  restructureReason   String?
  completedAt         DateTime?
  writtenOffAt        DateTime?
  writeOffReason      String?
  writeOffKobo        BigInt?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  application       Application         @relation(fields: [applicationId], references: [id])
  repaymentSchedules RepaymentSchedule[]
  farmReports       FarmReport[]

  @@index([borrowerId, status])
  @@map("loans")
}

// ─── DISBURSEMENT ─────────────────────────────────────────────────────────────

model LayerDisbursement {
  id                 String             @id @default(cuid())
  applicationId      String
  layerId            String
  amountKobo         BigInt
  status             DisbursementStatus @default(PENDING)
  proofDocUrls       String[]
  proofDocKeys       String[]
  proofNotes         String?
  proofSubmittedAt   DateTime?
  proofRejectedAt    DateTime?
  proofRejectReason  String?
  approvedById       String?
  approvedAt         DateTime?
  releasedAt         DateTime?
  failedAt           DateTime?
  failureReason      String?
  paystackRef        String?
  paystackRecipient  String?
  isManualOverride   Boolean            @default(false)
  overrideReason     String?
  overrideApprover1  String?
  overrideApprover2  String?
  retryCount         Int                @default(0)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  application Application       @relation(fields: [applicationId], references: [id])
  layer       DisbursementLayer @relation(fields: [layerId], references: [id])

  @@index([applicationId, status])
  @@index([status, createdAt])
  @@map("layer_disbursements")
}

// ─── REPAYMENT ────────────────────────────────────────────────────────────────

model RepaymentSchedule {
  id             String   @id @default(cuid())
  loanId         String
  installmentNo  Int
  dueDate        DateTime
  principalKobo  BigInt
  interestKobo   BigInt
  totalKobo      BigInt
  outstandingKobo BigInt
  createdAt      DateTime @default(now())

  loan       Loan        @relation(fields: [loanId], references: [id])
  repayments Repayment[]

  @@unique([loanId, installmentNo])
  @@map("repayment_schedules")
}

model Repayment {
  id             String          @id @default(cuid())
  borrowerId     String
  scheduleId     String?
  amountKobo     BigInt
  principalKobo  BigInt?
  interestKobo   BigInt?
  method         RepaymentMethod
  status         RepaymentStatus @default(SCHEDULED)
  paystackRef    String?
  ussdRef        String?
  externalRef    String?
  receiptUrl     String?
  receiptKey     String?
  daysLate       Int             @default(0)
  recordedBy     String?         // Staff ID if manually recorded
  reversedAt     DateTime?
  reversalReason String?
  paidAt         DateTime?
  createdAt      DateTime        @default(now())

  borrower Borrower           @relation(fields: [borrowerId], references: [id])
  schedule RepaymentSchedule? @relation(fields: [scheduleId], references: [id])

  @@index([borrowerId, status])
  @@index([paidAt])
  @@map("repayments")
}

// ─── FARM REPORT ──────────────────────────────────────────────────────────────

model FarmReport {
  id                String           @id @default(cuid())
  borrowerId        String
  loanId            String?
  reportingPeriod   String           // "2025-06"
  growthStage       CropGrowthStage
  photoUrls         String[]
  photoKeys         String[]
  challenges        String[]
  labourExpensesKobo BigInt?
  inputExpensesKobo  BigInt?
  estimatedYieldKg   Decimal?         @db.Decimal(10, 2)
  voiceNoteUrl       String?
  voiceNoteKey       String?
  notes              String?
  status             FarmReportStatus @default(SUBMITTED)
  verifiedById       String?
  verifiedAt         DateTime?
  rejectedAt         DateTime?
  rejectReason       String?
  scorePointsEarned  Int              @default(0)
  submittedVia       String           @default("APP") // APP | USSD | WHATSAPP | AGENT
  latitude           Decimal?         @db.Decimal(10, 8)
  longitude          Decimal?         @db.Decimal(11, 8)
  submittedAt        DateTime         @default(now())
  createdAt          DateTime         @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])
  loan     Loan?    @relation(fields: [loanId], references: [id])

  @@index([borrowerId, reportingPeriod])
  @@index([status])
  @@map("farm_reports")
}

// ─── FIELD AGENT ──────────────────────────────────────────────────────────────

model FieldAgent {
  id                String   @id @default(cuid())
  userId            String   @unique
  lenderId          String
  agentCode         String   @unique
  state             String
  lga               String
  zoneDescription   String?
  zoneGeoJson       Json?
  isActive          Boolean  @default(true)
  rating            Decimal  @default(5.0) @db.Decimal(3, 1)
  ratingCount       Int      @default(0)
  totalRegistered   Int      @default(0)
  totalVerified     Int      @default(0)
  totalVisits       Int      @default(0)
  earningsKobo      BigInt   @default(0)
  pendingEarningsKobo BigInt @default(0)
  createdAt         DateTime @default(now())

  user          User            @relation(fields: [userId], references: [id])
  tasks         AgentTask[]
  verifications Verification[]
  earnings      AgentEarning[]

  @@map("field_agents")
}

model AgentTask {
  id         String          @id @default(cuid())
  agentId    String
  borrowerId String
  type       AgentTaskType
  status     AgentTaskStatus @default(ASSIGNED)
  priority   String          @default("MEDIUM")
  dueDate    DateTime
  notes      String?
  completedAt DateTime?
  createdAt  DateTime        @default(now())

  agent FieldAgent @relation(fields: [agentId], references: [id])
  @@map("agent_tasks")
}

model Verification {
  id                  String   @id @default(cuid())
  agentId             String
  borrowerId          String
  taskId              String?
  type                String
  farmPhotoUrls       String[]
  farmPhotoKeys       String[]
  gpsLatitude         Decimal? @db.Decimal(10, 8)
  gpsLongitude        Decimal? @db.Decimal(11, 8)
  farmBoundaryGeoJson Json?
  farmSizeMeasuredHa  Decimal? @db.Decimal(8, 2)
  identityConfirmed   Boolean  @default(false)
  notes               String?
  qualityScore        Int?     // 1-5 rated by lender
  qualityNotes        String?
  isOfflineSync       Boolean  @default(false)
  syncedAt            DateTime?
  submittedAt         DateTime @default(now())

  agent FieldAgent @relation(fields: [agentId], references: [id])
  @@index([agentId])
  @@index([borrowerId])
  @@map("verifications")
}

model AgentEarning {
  id          String   @id @default(cuid())
  agentId     String
  type        String
  amountKobo  BigInt
  description String?
  isPaid      Boolean  @default(false)
  paidAt      DateTime?
  paystackRef String?
  createdAt   DateTime @default(now())

  agent FieldAgent @relation(fields: [agentId], references: [id])
  @@map("agent_earnings")
}

// ─── COOPERATIVE ──────────────────────────────────────────────────────────────

model Cooperative {
  id                  String     @id @default(cuid())
  name                String
  registrationNumber  String?    @unique
  state               String
  lga                 String
  cropFocus           String
  chairBorrowerId     String
  chairPhone          String
  status              CoopStatus @default(PENDING)
  groupFarmScore      Int        @default(500)
  groupScoreGrade     String     @default("SILVER")
  savingsPerMemberKobo BigInt    @default(0)
  savingsPoolKobo     BigInt     @default(0)
  guaranteeFundKobo   BigInt     @default(0)
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  members       CoopMember[]
  groupLoans    CoopGroupLoan[]
  contributions CoopContribution[]
  borrowers     Borrower[]

  @@map("cooperatives")
}

model CoopMember {
  id              String   @id @default(cuid())
  cooperativeId   String
  borrowerId      String
  role            String   @default("MEMBER")
  joinedAt        DateTime @default(now())
  isActive        Boolean  @default(true)
  consentGiven    Boolean  @default(false)
  consentGivenAt  DateTime?
  consentMethod   String?

  cooperative Cooperative @relation(fields: [cooperativeId], references: [id])
  borrower    Borrower    @relation(fields: [borrowerId], references: [id])

  @@unique([cooperativeId, borrowerId])
  @@map("coop_members")
}

model CoopGroupLoan {
  id               String            @id @default(cuid())
  cooperativeId    String
  programId        String
  totalAmountKobo  BigInt
  purpose          String?
  repaymentMode    String            @default("INDIVIDUAL")
  status           ApplicationStatus @default(PENDING)
  consentComplete  Boolean           @default(false)
  appliedAt        DateTime          @default(now())
  approvedAt       DateTime?

  cooperative  Cooperative          @relation(fields: [cooperativeId], references: [id])
  allocations  CoopLoanAllocation[]

  @@map("coop_group_loans")
}

model CoopLoanAllocation {
  id            String  @id @default(cuid())
  groupLoanId   String
  borrowerId    String
  amountKobo    BigInt
  sharePercent  Decimal @db.Decimal(5, 2)
  consentGiven  Boolean @default(false)
  consentAt     DateTime?

  groupLoan CoopGroupLoan @relation(fields: [groupLoanId], references: [id])
  @@map("coop_loan_allocations")
}

model CoopContribution {
  id            String   @id @default(cuid())
  cooperativeId String
  borrowerId    String
  amountKobo    BigInt
  month         String
  isPaid        Boolean  @default(false)
  paidAt        DateTime?
  method        String?
  createdAt     DateTime @default(now())

  cooperative Cooperative @relation(fields: [cooperativeId], references: [id])
  @@index([cooperativeId, month])
  @@map("coop_contributions")
}

// ─── FARMSCORE ────────────────────────────────────────────────────────────────

model FarmScoreHistory {
  id          String   @id @default(cuid())
  borrowerId  String
  score       Int
  grade       String
  breakdown   Json
  reason      String?
  triggeredBy String?
  createdAt   DateTime @default(now())

  borrower Borrower @relation(fields: [borrowerId], references: [id])
  @@index([borrowerId, createdAt])
  @@map("farmscore_history")
}

// ─── MESSAGING ────────────────────────────────────────────────────────────────

model Message {
  id            String   @id @default(cuid())
  senderId      String
  recipientId   String?
  programId     String?
  content       String
  isRead        Boolean  @default(false)
  readAt        DateTime?
  isBroadcast   Boolean  @default(false)
  broadcastAudience Json?
  channels      String[]
  deliveryStats Json?
  createdAt     DateTime @default(now())

  sender User @relation("SentBy", fields: [senderId], references: [id])
  @@index([senderId, recipientId])
  @@map("messages")
}

model MessageTemplate {
  id         String   @id @default(cuid())
  lenderId   String
  name       String
  content    String
  variables  String[]
  channels   String[]
  createdAt  DateTime @default(now())

  @@map("message_templates")
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

model Notification {
  id        String              @id @default(cuid())
  userId    String
  type      NotificationType
  channel   NotificationChannel
  title     String
  body      String
  data      Json?
  isRead    Boolean             @default(false)
  sentAt    DateTime?
  readAt    DateTime?
  failedAt  DateTime?
  failReason String?
  createdAt DateTime            @default(now())

  user User @relation(fields: [userId], references: [id])
  @@index([userId, isRead])
  @@map("notifications")
}

// ─── AUDIT ────────────────────────────────────────────────────────────────────

model AuditLog {
  id          String      @id @default(cuid())
  userId      String?
  action      AuditAction
  resource    String
  resourceId  String?
  before      Json?
  after       Json?
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime    @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId, resource, createdAt])
  @@index([resource, resourceId])
  @@map("audit_logs")
}

model GlobalFeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  enabled     Boolean  @default(false)
  plans       String[]
  isBeta      Boolean  @default(false)
  updatedAt   DateTime @updatedAt
  updatedById String?

  @@map("global_feature_flags")
}
```

---

## 5. API Route Design

### Standard Response Format

```typescript
// Success
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 450 }, "message": "OK" }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "BVN must be 11 digits", "details": [] } }
```

### Complete Route Map

```
AUTH
POST   /auth/lender/signup
POST   /auth/lender/login
POST   /auth/borrower/register
POST   /auth/borrower/login
POST   /auth/otp/send
POST   /auth/otp/verify
POST   /auth/refresh
POST   /auth/logout
POST   /auth/2fa/setup
POST   /auth/2fa/verify
POST   /auth/password/forgot
POST   /auth/password/reset
GET    /auth/me
PATCH  /auth/me

LENDERS
GET    /lenders
GET    /lenders/:id
PATCH  /lenders/:id
GET    /lenders/:id/stats
GET    /lenders/:id/feature-flags
PATCH  /lenders/:id/feature-flags
GET    /lenders/:id/billing
POST   /lenders/:id/members/invite
PATCH  /lenders/:id/members/:memberId
DELETE /lenders/:id/members/:memberId
POST   /lenders/:id/api-keys
DELETE /lenders/:id/api-keys/:keyId
POST   /lenders/:id/suspend
POST   /lenders/:id/reactivate

PROGRAMS
GET    /programs
POST   /programs
GET    /programs/:id
PATCH  /programs/:id
POST   /programs/:id/publish
POST   /programs/:id/pause
POST   /programs/:id/resume
POST   /programs/:id/close
POST   /programs/:id/duplicate
DELETE /programs/:id
GET    /programs/:id/applications
GET    /programs/:id/stats
GET    /programs/:id/fund-flow

APPLICATIONS
GET    /applications
POST   /applications
GET    /applications/:id
POST   /applications/:id/approve
POST   /applications/:id/reject
POST   /applications/:id/request-info
POST   /applications/:id/withdraw
POST   /applications/bulk-approve
POST   /applications/bulk-reject

LOANS
GET    /loans
GET    /loans/:id
GET    /loans/:id/repayment-schedule
GET    /loans/:id/timeline
GET    /loans/stats
POST   /loans/:id/restructure
POST   /loans/:id/write-off

DISBURSEMENTS
GET    /disbursements
GET    /disbursements/pending
GET    /disbursements/:id
POST   /disbursements/:id/approve
POST   /disbursements/:id/reject
POST   /disbursements/:id/manual-release
POST   /disbursements/:id/retry
GET    /disbursements/stats
POST   /disbursements/bulk-approve

REPAYMENTS
GET    /repayments
GET    /repayments/overdue
GET    /repayments/scheduled
GET    /repayments/stats
GET    /repayments/:id
POST   /repayments
POST   /repayments/:id/waive
POST   /repayments/:id/reverse
POST   /repayments/:scheduleId/default
POST   /repayments/remind
POST   /repayments/paystack/init
POST   /repayments/paystack/webhook

FARM REPORTS
GET    /farm-reports
POST   /farm-reports
GET    /farm-reports/:id
POST   /farm-reports/:id/verify
POST   /farm-reports/:id/reject

BORROWERS
GET    /borrowers
GET    /borrowers/:id
PATCH  /borrowers/:id
POST   /borrowers/:id/verify-bvn
POST   /borrowers/:id/verify-nin
GET    /borrowers/:id/farmscore
GET    /borrowers/:id/applications
GET    /borrowers/:id/repayments
GET    /borrowers/:id/reports
GET    /borrowers/:id/activity
GET    /borrowers/:id/documents
POST   /borrowers/:id/documents
POST   /borrowers/:id/flag
POST   /borrowers/:id/unflag
POST   /borrowers/:id/blacklist
POST   /borrowers/:id/unblacklist

FIELD AGENTS
GET    /agents
POST   /agents
GET    /agents/:id
PATCH  /agents/:id
POST   /agents/:id/activate
POST   /agents/:id/deactivate
GET    /agents/:id/tasks
POST   /agents/:id/tasks
GET    /agents/:id/earnings
POST   /agents/:id/payout
GET    /agents/:id/verifications
POST   /agents/:id/verifications/:id/rate
POST   /agents/verify (submit verification from agent app)

COOPERATIVES
GET    /cooperatives
POST   /cooperatives
GET    /cooperatives/:id
PATCH  /cooperatives/:id
POST   /cooperatives/:id/members
DELETE /cooperatives/:id/members/:borrowerId
POST   /cooperatives/:id/loans
GET    /cooperatives/:id/loans
POST   /cooperatives/:id/contributions
GET    /cooperatives/:id/contributions
GET    /cooperatives/:id/score
POST   /cooperatives/:id/dissolve

FARMSCORE
GET    /farmscore/:borrowerId
POST   /farmscore/:borrowerId/recalculate
GET    /farmscore/:borrowerId/history
POST   /farmscore/:borrowerId/report
POST   /farmscore/api/query (external bank API endpoint)

MESSAGES
GET    /messages
GET    /messages/:conversationId
POST   /messages
POST   /messages/broadcast
GET    /messages/templates
POST   /messages/templates
PATCH  /messages/templates/:id
DELETE /messages/templates/:id

REPORTS
GET    /reports/portfolio
GET    /reports/impact
GET    /reports/state/:state
POST   /reports/generate
GET    /reports/:jobId/status
GET    /reports/:jobId/download
POST   /reports/schedules

USSD
POST   /ussd/session

WHATSAPP
POST   /whatsapp/webhook
GET    /whatsapp/webhook

UPLOADS
POST   /uploads/presign
POST   /uploads/confirm
GET    /uploads/:key/signed-url

NOTIFICATIONS
GET    /notifications
PATCH  /notifications/:id/read
POST   /notifications/read-all

ADMIN
GET    /admin/stats
GET    /admin/lenders
GET    /admin/feature-flags
PATCH  /admin/feature-flags/:name
GET    /admin/tickets
POST   /admin/tickets/:id/reply
GET    /admin/system-health
GET    /admin/audit-logs
```

---

## 6. Authentication Strategy

### Token Architecture

```
Access Token:   JWT, RS256, 15-minute expiry, stored in memory (Zustand)
Refresh Token:  JWT, RS256, 30-day expiry, stored as HttpOnly cookie
                Hash stored in DB (user_sessions table)
                Rotated on every use (old token invalidated)
2FA:            TOTP (RFC 6238) — compatible with Google Authenticator
                Backup codes: 8 codes, each single-use, hashed in DB
Session:        Tracked in user_sessions, supports multiple devices
                Max 5 concurrent sessions per user
Blacklist:      Redis SET with TTL matching token expiry
                Used for immediate token invalidation (logout, security)
```

### Auth Service Key Functions

```typescript
// modules/auth/auth.service.ts

// Login flow
async function loginLender(email: string, password: string, ip: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AuthError('Invalid credentials');

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AuthError(`Account locked until ${user.lockedUntil}`);
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await handleFailedLogin(user.id); // Increment counter, lock after 5
    throw new AuthError('Invalid credentials');
  }

  // Reset failed count
  await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });

  // If 2FA enabled, return partial token (requires 2FA completion)
  if (user.twoFAEnabled) {
    const partial = generatePartialToken(user.id);
    return { requiresTwoFactor: true, partialToken: partial };
  }

  // Generate tokens
  return generateTokenPair(user, ip);
}

// Token generation
async function generateTokenPair(user: User, ip: string) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '30d' }
  );

  // Store refresh token hash in DB
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      ipAddress: ip,
      expiresAt: addDays(new Date(), 30),
    }
  });

  return { accessToken, refreshToken };
}
```

---

## 7. Background Jobs & Queues

### Queue Definitions (BullMQ)

```typescript
// src/jobs/queue.ts
import { Queue } from 'bullmq';
import { redis } from '@/config/redis';

export const farmScoreQueue    = new Queue('farmscore', { connection: redis });
export const notificationQueue = new Queue('notifications', { connection: redis });
export const repaymentQueue    = new Queue('repayments', { connection: redis });
export const reportQueue       = new Queue('reports', { connection: redis });
export const disbursementQueue = new Queue('disbursements', { connection: redis });
```

### Workers

```typescript
// src/jobs/workers/repayment.worker.ts
// Runs daily at midnight — checks for overdue repayments

export const repaymentWorker = new Worker('repayments', async (job) => {
  if (job.name === 'daily-overdue-check') {
    const overdueSchedules = await prisma.repaymentSchedule.findMany({
      where: {
        dueDate: { lt: new Date() },
        repayments: { none: { status: 'PAID' } }
      },
      include: { loan: { include: { borrower: true } } }
    });

    for (const schedule of overdueSchedules) {
      const daysLate = differenceInDays(new Date(), schedule.dueDate);

      // Update status
      await prisma.repayment.updateMany({
        where: { scheduleId: schedule.id, status: 'SCHEDULED' },
        data: { status: daysLate > 30 ? 'DEFAULTED' : 'OVERDUE', daysLate }
      });

      // Update FarmScore
      await farmScoreQueue.add('recalculate', { borrowerId: schedule.loan.borrowerId, reason: 'OVERDUE_PAYMENT' });

      // Send reminder at different thresholds
      if ([3, 7, 14, 30].includes(daysLate)) {
        await notificationQueue.add('send', {
          userId: schedule.loan.borrower.userId,
          type: 'REPAYMENT_OVERDUE',
          data: { daysLate, amount: schedule.totalKobo, dueDate: schedule.dueDate }
        });
      }
    }
  }
}, { connection: redis });
```

### Scheduled Jobs (Cron)

```typescript
// src/jobs/schedulers/daily.scheduler.ts
import { CronJob } from 'cron';

// Every day at midnight (00:00 WAT)
new CronJob('0 0 * * *', async () => {
  await repaymentQueue.add('daily-overdue-check', {}, { jobId: `overdue-${Date.now()}` });
  await farmScoreQueue.add('monthly-batch', {}, { removeOnComplete: true });
}, null, true, 'Africa/Lagos');

// Every Monday at 6am (weekly digest)
new CronJob('0 6 * * 1', async () => {
  await notificationQueue.add('weekly-digest', {});
}, null, true, 'Africa/Lagos');
```

---

## 8. Third-Party Integrations

### Integration Summary

| Service | Purpose | SDK/Method |
|---|---|---|
| NIBSS BVN API | Verify Bank Verification Number | REST API |
| NIMC NIN API | Verify National ID Number | REST API |
| Paystack | Payments, disbursements, bank verification | Official SDK |
| Flutterwave | Backup payments | Official SDK |
| Termii | Nigerian SMS delivery | REST API |
| Twilio | International SMS fallback | Official SDK |
| SendGrid | Transactional email | Official SDK |
| Meta WhatsApp | WhatsApp messaging | REST API |
| Africa's Talking | USSD gateway | Official SDK |
| AWS S3 | File storage | SDK v3 |
| Mapbox | Map tiles | GL JS |
| Sentry | Error tracking | Official SDK |
| Datadog | Metrics & APM | Agent |

### Paystack Integration

```typescript
// integrations/paystack/paystack.client.ts
import Paystack from 'paystack';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export const initializeRepayment = async (
  borrower: Borrower, amountKobo: number, reference: string
) => {
  return paystack.transaction.initialize({
    email: borrower.user.email,
    amount: amountKobo,
    reference,
    callback_url: `${process.env.FRONTEND_URL}/repayment/callback`,
    metadata: { borrowerId: borrower.id, type: 'LOAN_REPAYMENT' },
  });
};

export const disburseFunds = async (
  borrower: Borrower, amountKobo: number, reference: string
) => {
  return paystack.transfer.initiate({
    source: 'balance',
    amount: amountKobo,
    recipient: borrower.paystackRecipientCode,
    reason: `AgroTrack loan disbursement`,
    reference,
  });
};

export const verifyBankAccount = async (
  accountNumber: string, bankCode: string
) => {
  return paystack.verification.resolveAccount({
    account_number: accountNumber,
    bank_code: bankCode,
  });
};

// Webhook handler
export const handleWebhook = async (body: any, signature: string) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  if (hash !== signature) throw new Error('Invalid webhook signature');

  switch (body.event) {
    case 'charge.success':
      await handleRepaymentSuccess(body.data);
      break;
    case 'transfer.success':
      await handleDisbursementSuccess(body.data);
      break;
    case 'transfer.failed':
      await handleDisbursementFailed(body.data);
      break;
  }
};
```

---

## 9. FarmScore Engine

### Algorithm

```typescript
// modules/farmscore/farmscore.engine.ts

interface ScoreComponents {
  identity: number;          // 0-170 (20% weight)
  farmVerification: number;  // 0-170 (20% weight)
  repaymentHistory: number;  // 0-255 (30% weight)
  activityReporting: number; // 0-127 (15% weight)
  cooperative: number;       // 0-85  (10% weight)
  geographicRisk: number;    // 0-43  (5% weight)
}

export const calculateFarmScore = async (borrowerId: string): Promise<ScoreResult> => {
  const [borrower, repayments, reports, verifications, schedules] = await Promise.all([
    prisma.borrower.findUnique({
      where: { id: borrowerId },
      include: { documents: true, coopMembership: { include: { cooperative: true } } }
    }),
    prisma.repayment.findMany({ where: { borrowerId } }),
    prisma.farmReport.findMany({ where: { borrowerId }, orderBy: { submittedAt: 'desc' }, take: 12 }),
    prisma.verification.findMany({ where: { /* agent verifications for this borrower */ } }),
    prisma.repaymentSchedule.findMany({ where: { loan: { borrowerId } } }),
  ]);

  const components: ScoreComponents = {
    identity: scoreIdentity(borrower),
    farmVerification: scoreFarmVerification(borrower, verifications),
    repaymentHistory: scoreRepaymentHistory(repayments, schedules),
    activityReporting: scoreActivityReporting(reports, schedules),
    cooperative: scoreCooperative(borrower),
    geographicRisk: scoreGeographicRisk(borrower),
  };

  const total = Math.round(
    (components.identity         / 170) * 170 +
    (components.farmVerification / 170) * 170 +
    (components.repaymentHistory / 255) * 255 +
    (components.activityReporting/ 127) * 127 +
    (components.cooperative      / 85)  * 85  +
    (components.geographicRisk   / 43)  * 43
  );

  const clampedTotal = Math.min(850, Math.max(0, total));
  const grade = clampedTotal >= 750 ? 'PLATINUM'
              : clampedTotal >= 650 ? 'GOLD'
              : clampedTotal >= 500 ? 'SILVER'
              : 'BRONZE';

  // Save to history
  await prisma.farmScoreHistory.create({
    data: { borrowerId, score: clampedTotal, grade, breakdown: components }
  });

  // Update borrower
  await prisma.borrower.update({
    where: { id: borrowerId },
    data: { farmScore: clampedTotal, farmScoreGrade: grade, farmScoreUpdatedAt: new Date() }
  });

  return { score: clampedTotal, grade, components };
};

function scoreRepaymentHistory(repayments: Repayment[], schedules: RepaymentSchedule[]): number {
  if (schedules.length === 0) return 127; // No history = neutral

  const paidOnTime    = repayments.filter(r => r.status === 'PAID' && r.daysLate <= 0).length;
  const paidLate      = repayments.filter(r => r.status === 'PAID' && r.daysLate > 0).length;
  const defaulted     = repayments.filter(r => r.status === 'DEFAULTED').length;
  const totalScheduled = schedules.length;

  // Streak bonus
  const streak = calculateStreak(repayments);
  const streakBonus = Math.min(30, streak * 5);

  const base = Math.round(
    (paidOnTime * 10 - paidLate * 5 - defaulted * 20) / totalScheduled * 225
  );

  return Math.max(0, Math.min(255, base + streakBonus));
}
```

### Score Update Triggers

```typescript
// Every time one of these events occurs, FarmScore is recalculated:
const SCORE_TRIGGERS = [
  'REPAYMENT_PAID',           // +8 to +15 depending on timeliness
  'REPAYMENT_LATE',           // -5 to -15 depending on days late
  'REPAYMENT_DEFAULTED',      // -20
  'FARM_REPORT_SUBMITTED',    // +10 to +15
  'FARM_REPORT_VERIFIED',     // +5 additional
  'FARM_REPORT_REJECTED',     // -10
  'VERIFICATION_COMPLETED',   // +20 (one-time, first verification)
  'COOPERATIVE_JOINED',       // +10 (one-time)
  'LOAN_COMPLETED',           // +50 (one-time)
  'MONTHLY_BATCH',            // Recalculate all scores monthly
];
```

---

## 10. USSD Architecture

### Session Flow

```typescript
// modules/ussd/ussd.service.ts
// Africa's Talking sends POST to /ussd/session

interface USSDRequest {
  sessionId: string;
  phoneNumber: string;  // +2348030000000
  text: string;         // Cumulative inputs: "1*2*500"
  serviceCode: string;  // *737*99#
}

export const handleUSSD = async (req: USSDRequest): Promise<string> => {
  const phone = req.phoneNumber.replace('+234', '0');
  const inputs = req.text ? req.text.split('*') : [];
  const level = inputs.length;

  const borrower = await findBorrowerByPhone(phone);

  // Level 0 = first screen (dialed *737*99#)
  if (level === 0) {
    if (!borrower) {
      return `CON AgroTrack
Welcome! You are not registered.

1. Register as a farmer
2. Learn more
0. Exit`;
    }
    return `CON AgroTrack
Welcome, ${borrower.firstName}

1. Loan balance
2. Make payment
3. Submit farm report
4. My FarmScore
5. Browse programs
0. Exit`;
  }

  const menu = inputs[0];

  // Loan balance
  if (menu === '1' && level === 1) {
    const loan = await getActiveLoan(borrower.id);
    if (!loan) return `END AgroTrack\nYou have no active loans.\nDial *737*99# to browse programs.`;
    return `END AgroTrack - Loan Balance

Loan: ${loan.program.name.slice(0, 30)}
Disbursed: NGN ${fmt(loan.principalKobo)}
Repaid: NGN ${fmt(loan.repaidKobo)}
Balance: NGN ${fmt(loan.outstandingKobo)}

Next payment: NGN ${fmt(loan.nextInstallment.totalKobo)}
Due: ${formatDate(loan.nextInstallment.dueDate)}

Thank you for using AgroTrack.`;
  }

  // Make payment - method selection
  if (menu === '2' && level === 1) {
    return `CON AgroTrack - Payment

Amount due: NGN ${await getAmountDue(borrower.id)}

Select method:
1. Bank transfer
2. Mobile money (OPay/PalmPay)
3. In-kind (produce)
0. Back`;
  }

  // ... all other menu branches

  return `END AgroTrack\nSession ended. Dial *737*99# to start again.`;
};
```

---

## 11. File Storage Architecture

### Direct Upload Flow (Recommended)

```
Frontend                    Backend                      AWS S3
   │                            │                            │
   │  POST /uploads/presign     │                            │
   │  { fileType, folder }      │                            │
   │──────────────────────────>│                            │
   │                            │  GeneratePresignedPutUrl   │
   │                            │──────────────────────────>│
   │                            │  { url, key, expiresIn }   │
   │                            │<──────────────────────────│
   │  { uploadUrl, key }        │                            │
   │<──────────────────────────│                            │
   │                            │                            │
   │  PUT uploadUrl (file)      │                            │
   │──────────────────────────────────────────────────────>│
   │  200 OK                    │                            │
   │<──────────────────────────────────────────────────────│
   │                            │                            │
   │  POST /uploads/confirm     │                            │
   │  { key }                   │                            │
   │──────────────────────────>│  Verify key exists in S3   │
   │                            │──────────────────────────>│
   │  { fileUrl }               │  200 OK                    │
   │<──────────────────────────│<──────────────────────────│
```

### S3 Bucket Structure

```
agrotrack-uploads/
├── farm-photos/{borrowerId}/{year}/{month}/{timestamp}-{n}.jpg
├── documents/{borrowerId}/{docType}/{timestamp}.{ext}
├── voice-notes/{borrowerId}/{timestamp}.mp3
├── verification-photos/{agentId}/{borrowerId}/{timestamp}.jpg
├── reports/{lenderId}/{year}/{reportType}-{timestamp}.pdf
├── logos/{lenderId}/logo.{ext}
└── temp/                         # Presigned upload holding area (TTL 24h)
```

### CloudFront CDN Configuration

```
- Origin: S3 bucket (private, no public access)
- Viewer protocol: HTTPS only
- Cache: farm photos cached 30 days, documents 7 days
- Signed URLs: required for all private content
- Signed URL TTL: 15 minutes for documents, 1 hour for farm photos
```

---

## 12. Real-Time WebSocket

### Socket.IO Namespaces

```typescript
// config/socket.ts
import { Server } from 'socket.io';

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join lender room (for broadcast events)
    const user = await prisma.user.findUnique({
      where: { id: socket.userId },
      include: { lenderMember: true }
    });
    if (user?.lenderMember) {
      socket.join(`lender:${user.lenderMember.lenderId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Emit from any service:
export const emitToUser = (userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToLender = (lenderId: string, event: string, data: any) => {
  io.to(`lender:${lenderId}`).emit(event, data);
};
```

### Events Reference

```typescript
// Events the server emits:
'notification:new'            // New notification for user
'application:status-changed'  // Application approved/rejected
'disbursement:released'       // Money sent to borrower
'repayment:confirmed'         // Repayment recorded
'farmscore:updated'           // Score recalculated
'message:received'            // New chat message
'farm-report:verified'        // Report verified by lender
'dashboard:stats-updated'     // Dashboard KPIs refreshed
```

---

## 13. DevOps & Infrastructure

### Docker Configuration

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
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
USER node
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
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes: ["./src:/app/src"]
    command: npm run dev

  postgres:
    image: postgis/postgis:16-3.4-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: agrotrack_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
    volumes: ["redisdata:/data"]

volumes:
  pgdata:
  redisdata:
```

### Production Infrastructure (AWS)

```
Region: eu-west-1 (Ireland) — closest to Nigeria with good latency

Compute:
  API Server:     EC2 t3.medium (2 vCPU, 4GB RAM) behind ALB
  Auto Scaling:   Min 2, Max 6 instances
  Load Balancer:  AWS ALB with SSL termination

Database:
  PostgreSQL:     RDS db.t3.medium, Multi-AZ, 100GB GP3 SSD
  Backup:         Daily automated snapshots, 30-day retention
  Read Replica:   1 replica for reporting queries

Cache:
  Redis:          ElastiCache cache.t3.small, cluster mode off
  Used for:       Sessions, rate limiting, queues, USSD state

Storage:
  S3:             Standard class for recent uploads (< 90 days)
                  Intelligent Tiering for older files
  CloudFront:     CDN for all S3 content, HTTPS enforced

DNS:
  Route 53:       agrotrack.ng → CloudFront → ALB → EC2

Monitoring:
  CloudWatch:     Logs, metrics, alarms
  Sentry:         Error tracking (frontend + backend)
  Datadog:        APM, infrastructure metrics

CI/CD:
  GitHub Actions: Test → Build → Deploy to EC2 via SSH
  Staging:        Separate EC2 t3.small + RDS t3.micro

Secrets:
  AWS Secrets Manager: Database credentials, API keys
  Environment files: Not committed to Git
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_DB: agrotrack_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/agrotrack_test
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /app/agrotrack-backend
            git pull origin main
            npm ci --omit=dev
            npx prisma migrate deploy
            pm2 reload agrotrack-api --update-env
            pm2 save
```

---

## 14. Environment Variables

### Backend (.env)

```bash
# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://agrotrack.ng
API_URL=https://api.agrotrack.ng
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://agrotrack_user:strong_password@rds-host:5432/agrotrack_prod?sslmode=require
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://elasticache-host:6379

# JWT (RS256 key pair)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_REFRESH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_REFRESH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Encryption (PII — BVN, NIN, account numbers)
ENCRYPTION_KEY=32-byte-hex-key-here
ENCRYPTION_IV=16-byte-hex-iv-here

# AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=agrotrack-uploads-prod
AWS_CLOUDFRONT_URL=https://cdn.agrotrack.ng
AWS_CLOUDFRONT_KEY_PAIR_ID=...
AWS_CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Nigerian Identity APIs
NIBSS_API_URL=https://api.nibss-plc.com.ng/v1
NIBSS_API_KEY=...
NIBSS_CLIENT_ID=...
NIMC_API_URL=https://api.nimc.gov.ng/v1
NIMC_API_KEY=...

# Payments
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=...
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE-...

# SMS
TERMII_API_KEY=...
TERMII_BASE_URL=https://api.ng.termii.com/api
TERMII_SENDER_ID=AgroTrack
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1...

# Email
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=no-reply@agrotrack.ng
SENDGRID_FROM_NAME=AgroTrack

# WhatsApp (Meta)
META_WHATSAPP_TOKEN=EAA...
META_WHATSAPP_PHONE_NUMBER_ID=...
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=random-secret-string

# USSD (Africa's Talking)
AT_USERNAME=agrotrack
AT_API_KEY=...
AT_SHORTCODE=*737*99#
AT_ENVIRONMENT=production

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...

# Bull Queue
BULL_CONCURRENCY=5
BULL_MAX_RETRIES=3
```

### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:4000/v1
VITE_SOCKET_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_VERSION=1.0.0
```

---

## 15. Project Directory Structure

### Recommended Monorepo Layout

```
agrotrack/                          # Root monorepo
├── apps/
│   ├── frontend/                   # React web app
│   ├── backend/                    # Node.js API
│   └── mobile/                     # React Native (future)
│
├── packages/
│   ├── shared-types/               # TypeScript interfaces shared between apps
│   │   ├── src/
│   │   │   ├── auth.types.ts
│   │   │   ├── program.types.ts
│   │   │   ├── borrower.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── farmscore-engine/           # Scoring algorithm (backend + future mobile)
│   │   ├── src/
│   │   │   ├── calculator.ts
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   └── ui-components/              # Shared React component library
│       ├── src/
│       │   ├── FarmScoreRing.tsx
│       │   ├── StatusPill.tsx
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/
│   ├── terraform/                  # AWS infrastructure as code
│   │   ├── main.tf
│   │   ├── rds.tf
│   │   ├── ec2.tf
│   │   ├── s3.tf
│   │   └── cloudfront.tf
│   └── docker/
│       └── nginx.conf
│
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       ├── deploy-frontend.yml
│       └── run-tests.yml
│
├── docs/
│   ├── api/                        # OpenAPI 3.0 spec
│   ├── architecture/               # Diagrams
│   └── runbooks/                   # Incident response
│
├── turbo.json                      # Turborepo pipeline
└── package.json                    # Root workspace
```

---

## 16. Security Checklist

### Authentication & Authorisation
- [x] Passwords hashed with bcrypt (cost factor: 12)
- [x] JWT signed with RS256 (asymmetric, rotate keys quarterly)
- [x] Refresh tokens stored as bcrypt hash in DB
- [x] Refresh token rotation on every use
- [x] Account lockout after 5 failed login attempts (15-minute lockout)
- [x] 2FA mandatory for all lender admin accounts
- [x] Session management: max 5 concurrent sessions per user
- [x] Role-based access control enforced on every route

### API Security
- [x] CORS: whitelist only known frontend domains
- [x] Helmet.js: HTTP security headers
- [x] Rate limiting: 100 req/min general, 5 req/15min for auth
- [x] Input validation: Zod schemas on all request bodies
- [x] SQL injection: impossible via Prisma ORM (parameterised)
- [x] File uploads: type whitelist (jpg/png/pdf/mp3), 10MB limit
- [x] Webhook signatures: HMAC-SHA512 verification (Paystack)
- [x] API key hashing: stored as SHA-256 hash, shown once

### Data Protection
- [x] PII encryption at rest: BVN, NIN, account numbers (AES-256-GCM)
- [x] Database: encrypted at rest (AWS RDS encryption)
- [x] TLS 1.3: all traffic in transit
- [x] S3: private bucket, no public access, signed URLs only
- [x] No sensitive data in logs (Sentry scrubs PII)
- [x] NDPR compliance: data deletion on request (anonymisation)

### Audit & Compliance
- [x] Immutable audit log: every write operation logged
- [x] 7-year retention: financial records (CBN requirement)
- [x] Two-level approval: write-off, blacklist, manual override
- [x] Regulatory exports: CBN, NIRSAL, donor-format reports

---

## 17. Performance Targets

### API Response Times

| Endpoint | Target | Notes |
|---|---|---|
| Dashboard stats | < 800ms | Cached in Redis (10 min) |
| Borrower list | < 400ms | Indexed, cursor paginated |
| Map view (PostGIS) | < 1200ms | Spatial index |
| FarmScore calculate | < 200ms | Cached 1hr or simple delta |
| File upload presign | < 100ms | No DB, pure S3 call |
| USSD response | < 500ms | AT SLA requirement |
| SMS delivery | < 30s | Termii guarantee |
| Webhook processing | < 2s | Paystack SLA |

### Database Indexes (Critical)

```sql
-- Core performance indexes
CREATE INDEX idx_borrowers_location ON borrowers (state, lga);
CREATE INDEX idx_borrowers_score ON borrowers (farm_score DESC);
CREATE INDEX idx_borrowers_geo ON borrowers USING GIST (
  ST_MakePoint(farm_longitude::float8, farm_latitude::float8)
);
CREATE INDEX idx_applications_queue ON applications (program_id, status, submitted_at);
CREATE INDEX idx_repayments_overdue ON repayments (due_date, status)
  WHERE status IN ('SCHEDULED', 'OVERDUE');
CREATE INDEX idx_farm_reports_period ON farm_reports (borrower_id, reporting_period);
CREATE INDEX idx_audit_logs_search ON audit_logs (user_id, resource, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read)
  WHERE is_read = false;
```

### Caching Strategy (Redis TTLs)

| Data | TTL | Invalidated On |
|---|---|---|
| Dashboard KPIs | 10 min | Any write to loans/repayments |
| FarmScore | 1 hour | Repayment, report, verification |
| Program list | 5 min | Program update/publish |
| BVN lookup result | 24 hours | Never (immutable) |
| USSD session | 180 seconds | Session end |
| Rate limit window | 900 seconds | Rolling window |
| Presigned S3 URL | 900 seconds | One-time use |

---

*AgroTrack Technical Architecture Plan v1.0 — June 2025*  
*Engineering: engineering@agrotrack.ng*
ARCHEOF

echo "Architecture plan written. Lines: $(wc -l < /mnt/user-data/outputs/agrotrack-technical-architecture.md)"
Output

Architecture plan written. Lines: 1837
Done


You are out of free messages until 11:40 AM