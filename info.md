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