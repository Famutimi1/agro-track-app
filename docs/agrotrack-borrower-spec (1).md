# AgroTrack Borrower Dashboard — Production Feature Specification

**Version:** 1.0  
**Classification:** Internal Engineering & Product Reference  
**Date:** June 2025  
**Scope:** Complete page-by-page specification of the AgroTrack Borrower Web Dashboard — what exists on each page, every CRUD operation, every real-world action, and how each maps to backend behaviour.

---

## Navigation Structure (Borrower Dashboard)

```
Overview          ← Home / summary view
My Loans          ← Active and past loan records
Farm Reports      ← Submit and track activity reports
FarmScore         ← Credit score profile and history
Messages          ← Chat with lender and support
Discover          ← Browse and apply for programs
Settings          ← Profile, notifications, language, bank
```

---

## How the Borrower Journey Works End-to-End

Before diving into each page, understand the complete farmer lifecycle on AgroTrack:

```
FARMER registers (app, USSD, or field agent)
        ↓
BVN + NIN verified → FarmScore created (520 starting score)
        ↓
GPS farm location captured + farm photos uploaded
        ↓
FARMER discovers eligible loan programs (Discover page)
        ↓
FARMER submits application with required documents
        ↓
FIELD AGENT visits farm → verifies identity + GPS maps boundary
        ↓
LENDER reviews application → Approves
        ↓
Layer 1 released → Money in farmer's bank account (T+0 to T+1)
        ↓
FARMER uses Layer 1 funds → Submits farm activity report with photos
        ↓
LENDER verifies report → Layer 2 unlocked + released
        ↓
(Repeat for Layer 3)
        ↓
Monthly repayments begin (bank transfer / USSD / mobile money)
        ↓
Each repayment builds FarmScore + repayment streak 🔥
        ↓
Final repayment → Loan COMPLETED → FarmScore +50 pts → Certificate
        ↓
Farmer eligible for larger next loan cycle
```

Every page in the borrower dashboard corresponds to one or more stages of this journey.

---

## How the Borrower Identifies Themselves

Unlike lenders who use email, borrowers use **phone number as their primary identity**. This is critical for rural Nigeria where:
- Many farmers do not have email addresses
- Phone number is already tied to their BVN
- USSD access uses phone number automatically
- Field agents register farmers by phone

```
Primary ID:    Phone number (08XXXXXXXXX)
Verification:  OTP sent via SMS
KYC Layer 1:   BVN (Bank Verification Number — 11 digits)
KYC Layer 2:   NIN (National Identity Number — 11 digits)
Farm Identity: GPS coordinates + agent-verified photos
Credit ID:     FarmScore (0–850, grade Platinum/Gold/Silver/Bronze)
```

---

## Page 1 — Overview (Home)

### Purpose
The borrower's personal financial home screen. Gives the farmer a complete picture of their loan status, upcoming obligations, recent activity, and quick access to the most common actions — all in one view without navigating anywhere.

### What Is Displayed

#### Welcome Banner
- "Good morning, Bello Musa 👋"
- Date, state, and primary crop
- Days until next repayment (countdown shown in amber if < 7 days, red if overdue)
- Repayment streak badge if active (🔥 5-month streak)

#### KPI Cards (4 cards, top row)

| Card | Metric | Detail |
|---|---|---|
| FarmScore | Current score (e.g. 815) | Grade badge (🏆 Gold), percentile ("Top 12% of farmers") |
| Active Loan | Total loan amount (₦850K) | Program name (CBN Rice Fund) |
| Amount Repaid | Total repaid (₦510K) | Progress "60% complete" |
| Next Payment | Amount due (₦85K) | Due date + days remaining |

Real-world significance: A farmer who has never had a bank account or credit history can now see a clear, simple dashboard of their entire financial relationship with a lender — for the first time in their life.

#### Loan Activity Chart (bar chart)
- X axis: Last 6 months
- Two bars per month: Disbursed (green) + Repaid (gold)
- Shows the farmer visually that their repayments are progressing
- Data source: layer_disbursements + repayments for this borrower

#### FarmScore Ring + Breakdown
- Large animated circular ring showing current score (815)
- Grade badge
- 5 component progress bars:
  - Identity Verification (95/100)
  - Repayment History (88/100)
  - Farm Activity Reports (82/100)
  - Loan Utilisation (79/100)
  - Farming Experience (70/100)
- "Top 12% of all AgroTrack farmers" comparison

#### Disbursement Layers (for active loan)
Visual tracker showing all 3 layers:
```
Layer 1 — Land Preparation    ✅ Released Feb 2025 — ₦255,000
Layer 2 — Planting & Inputs   ✅ Released Apr 2025 — ₦340,000
Layer 3 — Crop Maintenance    🔒 Locked — Submit June report to unlock
```
The locked layer is highlighted in amber with a clear call to action — this creates urgency for the farmer to submit their farm report.

#### Recent Activity Feed
Last 5 events:
- 💰 Layer 2 disbursement of ₦340,000 processed — 2 days ago
- ✅ June farm report submitted — +15 FarmScore pts — 4 days ago
- 🔥 5th consecutive on-time repayment! — Jun 5
- ⚠️ July repayment of ₦85,000 due in 22 days — Today
- 📊 FarmScore updated from 800 to 815 — Last week

#### Quick Actions (2×2 grid)
- 💳 Make Repayment
- 📸 Submit Farm Report
- 🔍 Browse Programs
- 📄 Download FarmScore Report

### Actions Available

| Action | What Happens | Real-World Equivalent |
|---|---|---|
| Click "Make Repayment" | Opens Paystack payment flow | Visiting a bank to pay a loan |
| Click "Submit Report" | Opens farm report form with camera | Filing a crop progress report |
| Click "Browse Programs" | Goes to Discover page | Visiting a loan office to ask what is available |
| Click "Download Score" | Generates PDF of FarmScore | Getting a bank credit report |
| Click layer card | Opens My Loans page to that loan | Checking a bank statement |
| Click activity item | Opens relevant detail page | Reviewing a transaction receipt |

### CRUD Operations

#### READ
```
GET /api/v1/borrowers/:id                   Full profile
GET /api/v1/borrowers/:id/farmscore         Current score + breakdown
GET /api/v1/loans?borrowerId=&status=ACTIVE Active loans
GET /api/v1/repayments?borrowerId=          Repayment history
GET /api/v1/notifications?userId=           Activity feed
GET /api/v1/farm-reports?borrowerId=&limit=5 Recent reports
```

### Real-World Simulation
Bello Musa, a rice farmer in Birnin Kebbi, wakes up on Monday. He opens AgroTrack on his Tecno Camon phone. He sees his Layer 3 disbursement is locked — he needs to submit a June farm report with photos to unlock ₦255,000. He taps "Submit Farm Report" directly from the Quick Actions. He also sees a reminder that his July repayment of ₦85,000 is due in 22 days. He schedules a USSD payment for July 3 (two days early, to get his streak to 6 months). This is a farmer who has never managed a bank loan in his life — the dashboard makes it simple enough to do from a village in Kebbi State.

---

## Page 2 — My Loans

### Purpose
The complete record of every loan the farmer has ever taken or applied for on AgroTrack. Gives full visibility into what was borrowed, what has been repaid, what is still outstanding, and the full repayment schedule going forward.

### What Is Displayed

#### Active Loan Hero Card
A prominent card at the top showing the most important active loan:
- Program name and lender
- Loan ID (LN-20250134)
- Total approved amount (₦850,000)
- Interest rate (9% p.a.)
- Loan start and end date
- 4 stats: Total disbursed, Total repaid, Outstanding, Interest rate
- "STATUS: ACTIVE" badge with green indicator

#### Repayment Progress Bar
- "60% complete" with animated green progress bar
- Start date — Today marker — Maturity date
- Clearly shows how far through the loan cycle the farmer is

#### Full Repayment Schedule Table
All 12 installments with:

| Installment | Due Date | Amount | Status | Paid Date | Days Late |
|---|---|---|---|---|---|
| 1 of 12 | Apr 5 | ₦85,000 | ✅ Paid | Apr 4 | 0 (early) |
| 2 of 12 | May 5 | ₦85,000 | ✅ Paid | May 7 | 2 |
| 3 of 12 | Jun 5 | ₦85,000 | ✅ Paid | Jun 4 | 0 |
| 4 of 12 | Jul 5 | ₦85,000 | 🟡 Due | — | — |
| 5 of 12 | Aug 5 | ₦85,000 | ⏳ Upcoming | — | — |
| ... | ... | ... | ... | — | — |

Colour coding:
- Green: Paid on time or early
- Amber: Paid late (shows days late)
- Red: Overdue (not yet paid, past due date)
- Blue: Current installment due
- Grey: Future installments

#### Disbursement Layer Tracker
For each active loan, shows all layers in detail:
- Layer name, percentage, amount
- Release date (if released)
- Proof submitted (if applicable)
- Unlock condition (if locked)

#### Repayment Streak Card
🔥 5-Month Streak!
"Pay on time next month to unlock Gold Streak bonus (+10 FarmScore pts)"
Progress: 5 of 6 months for Gold badge

#### Past Loans Section
Completed or closed loans listed below active loan:
- Loan ID, program, amount, repayment rate (fully repaid / partially)
- Completion certificate download button
- FarmScore impact ("+50 pts earned on completion")

### CRUD Operations

#### READ (Borrower's loans are READ-ONLY — they cannot modify loans directly)
```
GET /api/v1/loans?borrowerId=           All loans (active + past)
GET /api/v1/loans/:id                   Full loan detail
GET /api/v1/loans/:id/repayment-schedule All installments with status
GET /api/v1/loans/:id/disbursements     All layer disbursements
```

#### UPDATE — Make a Repayment (the primary write action on this page)

**Channel 1: In-App via Paystack**
```
User taps "Make Repayment" → selects installment → selects method

POST /api/v1/repayments/paystack/init
Body: { scheduleId, borrowerId }

Returns: { paymentUrl }
Borrower redirected to Paystack payment page
Borrower completes payment
Paystack webhook confirms:
  POST /api/v1/repayments/paystack/webhook
  → Repayment marked PAID
  → SMS receipt sent to borrower
  → FarmScore recalculated
  → Dashboard KPIs updated via WebSocket push
  → Streak count incremented
```

**Channel 2: Bank Transfer**
```
Borrower selects "Bank Transfer"
System shows:
  Bank Name: Guaranty Trust Bank (GTBank)
  Account: 0123456789
  Account Name: AgroTrack Technologies Ltd (CBN Rice Fund)
  Reference: LN-20250134-07 (MUST include this reference)

Borrower makes transfer via their own bank app or USSD
Paystack bank transfer webhook confirms payment
Same flow as above
```

**Channel 3: USSD**
```
Borrower dials *737*99#
Selects: 2 (Make Payment)
Selects: 1 (USSD payment)
System generates USSD payment code
Borrower dials code on their phone
Bank confirms to Paystack
Paystack webhook → repayment confirmed
No internet required — works on basic phone
```

**Channel 4: In-Kind Produce**
```
Borrower requests in-kind repayment via app:
POST /api/v1/repayments/request-in-kind
Body: { scheduleId, produceType, estimatedQuantityKg, preferredDate }

What happens:
1. Field agent assigned to collect produce
2. Agent visits farm on agreed date
3. Agent weighs produce + records market price
4. Agent submits: POST /api/v1/repayments (method: IN_KIND, agentId)
5. Repayment recorded at produce market value
6. Borrower receives SMS confirmation
```

#### CREATE — Request Loan Restructure (hardship case)
```
POST /api/v1/loans/:id/restructure-request
Body: { reason, supportingDocs: [url], requestType: "EXTENSION" | "AMOUNT_REDUCTION" }

Note: Borrower can REQUEST restructuring — it must be approved by lender.
What happens:
1. Restructure request created
2. Lender admin notified
3. Borrower receives: "Your restructure request has been received and will be reviewed within 3 business days"
4. Lender approves/rejects → borrower notified
```

#### DELETE
Loans cannot be deleted or withdrawn after approval. Borrower can only withdraw an application before it is approved.

### Business Rules (Borrower-Facing)
- A farmer can only have one ACTIVE loan per program at a time
- Early repayment is encouraged and earns FarmScore bonus (+3 pts if 3+ days early)
- Partial payments are accepted — any amount reduces the outstanding balance
- Missed payments do not immediately default — 30-day grace before DEFAULTED status
- Repayment streak resets to zero on any missed payment

### Real-World Simulation
Bello Musa opens My Loans. He sees his 7th installment is due on August 5. He decides to pay it early on August 1 to maintain his streak and earn the early payment bonus. He taps the July installment row → "Pay Now" → selects Bank Transfer → copies the reference number → opens his GTBank app → transfers ₦85,000 with the reference. AgroTrack detects the payment within 2 minutes via Paystack webhook. His dashboard updates: repaid total increases, outstanding decreases, streak becomes 7 months, FarmScore goes from 815 to 823.

---

## Page 3 — Farm Reports

### Purpose
The accountability mechanism that makes AgroTrack unique. Farmers must submit regular farm activity reports — with geotagged photos showing their crops at the current growth stage. These reports:
1. Prove the loan is being used for farming (not diverted)
2. Unlock the next disbursement layer
3. Build FarmScore points
4. Create a permanent farm activity record that strengthens future loan eligibility

### What Is Displayed

#### Urgent Alert Banner (when report is due)
```
📢 June report required — unlocks your Layer 3 disbursement of ₦255,000
Submit with at least 3 farm photos showing current crop growth
Deadline: June 30, 2025 — 17 days remaining
[Submit Now] button
```
This banner is dismissed once the report is submitted. It reappears 7 days before the next deadline.

#### Submit Farm Report Form (main feature of this page)

**Step 1: Crop Growth Stage**
4 large visual buttons the farmer taps to select:
```
🌱 Planting        🌿 Growing
🌸 Flowering       🌾 Harvesting
```
Simple icons make this usable even for low-literacy farmers.

**Step 2: Farm Photos (minimum 3 required)**
- Camera icon buttons (4 slots)
- On mobile: opens camera directly
- On desktop: file picker
- Photos automatically geotagged (GPS coordinates embedded)
- Photos timestamped (server-side verification)
- Photos uploaded to S3 immediately on capture
- Farm GPS compared to registration GPS — alert if > 2km apart (possible fraud)

**Step 3: Challenges Faced**
Tap-to-select chips (multiple allowed):
- 😊 None — Good progress
- 🐛 Pest pressure
- ☀️ Drought / Water stress
- 🌊 Flooding / Waterlogging
- 👷 Labour shortage
- 💰 Input shortage (seeds, fertilizer)
- 🚚 Market access issues
- 🦠 Crop disease

**Step 4: Additional Notes (optional)**
Text area for anything else the farmer wants to share.
Voice note button (🎙️) — Farmer can record voice note instead of typing. Critical for low-literacy farmers.

**Step 5: Farm Expenses (optional but encouraged)**
- Labour cost this month (₦)
- Input purchases (₦)
- Other expenses (₦)
These expense records build a financial history that improves future FarmScore calculations.

**Step 6: Estimated Yield (optional)**
- Expected harvest quantity
- Unit: bags / kg / tonnes
Used for agricultural data analytics (anonymous) and helps lenders assess program impact.

**Submit Button**
On submission:
```
POST /api/v1/farm-reports
Body: {
  borrowerId, loanId, reportingPeriod,
  growthStage, photoUrls, photoKeys,
  challenges, notes, voiceNoteUrl,
  labourExpensesKobo, inputExpensesKobo, estimatedYieldKg,
  latitude, longitude, submittedVia: "APP"
}

What happens immediately:
1. Report record created with status SUBMITTED
2. Borrower receives: "+15 FarmScore pts earned for submitting June report"
3. FarmScore recalculated and pushed via WebSocket
4. Lender notified: "Borrower Bello Musa has submitted June farm report"
5. If report unlocks next layer: layer disbursement status → PROOF_SUBMITTED
6. Next layer review queue updated in lender dashboard
7. Verification queued for field agent (if agent confirmation required)
```

#### Past Reports Timeline
Chronological list of all submitted reports:

**Each report card shows:**
- Month and year (June 2025 Report)
- Crop growth stage icon
- Submission date
- 3 thumbnail farm photos (clickable to full size)
- Verification status: ⏳ Pending / ✅ Verified / ❌ Rejected
- FarmScore points earned: +15 pts
- Verifier name (field agent or lender staff)
- Verification notes (if any)
- Download receipt button

**Rejected report** shows:
- ❌ Rejected badge in red
- Rejection reason: "Photos not geotagged — please enable GPS and resubmit"
- "Resubmit" button — opens pre-filled form
- Deadline for resubmission: 14 days

#### Report Submission Stats (right panel)
- Reports submitted this year: 6 of 6 ✅
- On-time rate: 100%
- Average FarmScore pts per report: +13.5
- Next report due: July 31, 2025

### CRUD Operations

#### CREATE — Submit New Report
```
POST /api/v1/farm-reports
(Full body as described above)

Validation rules:
- Minimum 3 photos required
- Photos must be GPS-tagged (or rejected with explanation)
- Growth stage must be selected
- Reporting period cannot be in the future
- Cannot submit duplicate report for same period
- Photos GPS must be within 5km of registered farm location
```

#### READ
```
GET /api/v1/farm-reports?borrowerId=&loanId=   All reports for this loan
GET /api/v1/farm-reports/:id                    Single report detail
```

#### UPDATE — Resubmit Rejected Report
```
POST /api/v1/farm-reports/:id/resubmit
Body: { photoUrls, photoKeys, notes, voiceNoteUrl }
(Can only change photos and notes — not the period or crop stage)

Validation:
- Can only resubmit if status = REJECTED
- Must be within 14-day resubmission window
- Must include at least 3 new geotagged photos
```

#### DELETE
Farm reports cannot be deleted after submission. A submitted report creates a permanent record.

### Business Rules
- One report per calendar month per active loan
- Minimum 3 geotagged photos required for submission to be accepted
- Photos checked server-side: GPS coordinates compared to registered farm location
- Voice notes accepted in all 4 major Nigerian languages (Hausa, Yoruba, Igbo, English)
- If a farmer submits 3 consecutive verified reports: +20 bonus FarmScore pts
- Rejected reports do not earn FarmScore pts but also do not penalise the score
- Missing a report deadline: -10 FarmScore pts and the next layer remains locked

### Real-World Simulation
Bello Musa walks to his rice farm in the morning. He opens AgroTrack on his phone. He sees the June report banner. He taps "Submit Farm Report." He selects "🌸 Flowering" — his rice is at the flowering stage. He takes 4 photos of his rice plants — the app GPS-tags each one. He taps "🐛 Pest pressure" and "None" (selecting none for general — he just wanted to report the pests were minor). He records a 30-second voice note in Hausa describing his farm conditions. He taps submit. Within 3 seconds he receives an in-app notification: "✅ June report submitted! +15 FarmScore pts earned. Your Layer 3 disbursement of ₦255,000 is now under review." He never had to type a single word.

---

## Page 4 — FarmScore

### Purpose
The farmer's agricultural credit identity — the most innovative feature in AgroTrack. For the first time, Nigerian smallholder farmers who have never had a credit history can build and own a verifiable, portable agricultural credit score. This score:
- Is used by AgroTrack lenders to make loan decisions
- Can be shared with commercial banks for independent loan applications
- Can be exported as a PDF certificate
- Improves with every on-time repayment and farm report submitted
- Persists even after a loan is fully repaid — it belongs to the farmer, not the loan

### What Is Displayed

#### Score Hero Card (left, prominent)
Full dark-green gradient card containing:
- Large animated circular ring showing score (815)
- Score out of 850
- Grade: 🏆 Gold Member
- "Top 12% of all AgroTrack farmers"
- Two stat boxes:
  - +47 pts — Last 3 months
  - 35 pts — To Platinum (next grade)
- "📄 Download Score Report" button — exports PDF

#### Score History Chart (right top)
Line chart showing FarmScore over last 6 months:
- Jan: 680 → Feb: 695 → Mar: 710 → Apr: 740 → May: 775 → Jun: 815
- Trend line with dots at each month
- Tooltip showing exact score and reason for change
- Demonstrates clearly that consistent behaviour improves the score

#### Score Breakdown Grid (below chart)
6 component cards, each showing:
- Component name
- Score out of maximum
- Progress bar (colour coded)
- Current status description

| Component | Score | Weight | Status |
|---|---|---|---|
| Identity Verification | 95/100 | 20% | BVN ✓ NIN ✓ Agent Visit ✓ |
| Repayment History | 88/100 | 30% | 6/6 on time · 🔥 6-streak |
| Farm Activity Reports | 82/100 | 15% | 6/6 submitted · 100% verified |
| Loan Utilisation | 79/100 | 15% | Funds used correctly |
| Farming Experience | 70/100 | 10% | 3 years on platform |
| Cooperative Standing | 65/100 | 10% | Member in good standing |

#### Score Grade Ladder
Visual showing all 4 grades:
```
  🏅 Bronze     (0–499)    — Getting started
  🥈 Silver     (500–649)  — Building trust
  🥇 Gold       (650–749)  — Trusted farmer          ← You are here
  💎 Platinum   (750–850)  — Elite borrower
```
Current grade highlighted, next grade shown with required points.

#### What Affects My Score (explainer)

**What earns points:**
- Make repayment on time: +8 pts
- Make repayment early (3+ days): +12 pts
- Submit farm report: +10 pts
- Farm report verified: +5 additional pts
- Submit 3 consecutive verified reports: +20 bonus pts
- Complete a loan: +50 pts (one-time)
- Join a cooperative: +10 pts (one-time)

**What costs points:**
- Late repayment (1–14 days): -5 pts
- Late repayment (15–29 days): -10 pts
- Defaulted payment: -20 pts per installment
- Farm report rejected: no change (neutral)
- Missing report deadline: -10 pts

#### Boost Your Score — Action Tips
Dynamic personalised tips based on current score:
- "Submit July farm report before deadline: +15 pts"
- "Pay August installment 3 days early: +12 pts"
- "Join a registered cooperative: +10 pts (one-time)"
- "Upload land title document: +5 pts"
- "You are 35 pts from Platinum — 3 on-time payments will get you there"

#### How to Share Your Score
Three options:
1. **Download PDF** — Official FarmScore certificate with AgroTrack watermark
2. **Share with a bank** — Generate a bank-readable report link (valid 30 days)
3. **Share with another lender** — Generate a one-time access code for a specific lender

### CRUD Operations

#### READ
```
GET /api/v1/farmscore/:borrowerId          Current score + full breakdown
GET /api/v1/farmscore/:borrowerId/history  Month-by-month history
GET /api/v1/farmscore/:borrowerId/report   Generate PDF (returns S3 URL)
```

#### UPDATE (Borrower cannot directly modify FarmScore — it is calculated)
```
POST /api/v1/farmscore/:borrowerId/recalculate
Triggered automatically by the system — not manually by borrower
Triggered when: repayment paid, report submitted, verification completed

What happens:
1. All scoring components recalculated from database
2. New score compared to old score
3. Delta calculated (+ or -)
4. New score saved to FarmScoreHistory
5. Borrower profile updated
6. Borrower notified via push: "Your FarmScore increased by +15 pts to 815"
7. Lender dashboard updated (real-time via WebSocket)
```

#### CREATE — Share Score with Bank
```
POST /api/v1/farmscore/:borrowerId/share
Body: { recipientType: "BANK" | "LENDER", recipientId, expiresInDays: 30 }

Returns: { shareUrl, accessCode, expiresAt }
The share URL allows a bank or lender to pull the full FarmScore report once
Access is logged: who accessed it, when, from what IP
Farmer can revoke access at any time
```

#### CREATE — Download Score PDF
```
POST /api/v1/farmscore/:borrowerId/report
Body: { format: "PDF", language: "EN" | "HA" | "YO" | "IG" }

Process:
1. Report generation job queued
2. Puppeteer renders HTML template with farmer's data
3. PDF uploaded to S3
4. Presigned download URL returned (expires 24 hours)

PDF includes:
  - AgroTrack official header
  - Farmer name, ID, state, crop
  - Score ring diagram
  - All component scores
  - 6-month score history chart
  - QR code linking to live score (for bank verification)
  - Date of issue and expiry
  - AgroTrack digital signature
```

### Real-World Simulation
Bello Musa's cousin works at a small farm input supply shop. The cousin's cooperative is looking for members who can access a loan from the Kebbi State Cooperative Fund — but the fund requires a FarmScore of at least 700. Bello Musa opens his FarmScore page, sees his score is 815. He taps "Share with a Bank", selects "Share with Cooperative", enters the cooperative's lender ID, and an access code is generated. He sends the code via WhatsApp to the cooperative secretary. The cooperative secretary enters the code on the lender portal and instantly sees Bello Musa's full credit profile without needing to process any paperwork. This is the entire value proposition of FarmScore — a portable, trustworthy, farmer-owned credit identity.

---

## Page 5 — Messages

### Purpose
The direct communication channel between the farmer and the lender. Every notification, question, disbursement alert, repayment reminder, and verification update appears here. Farmers can also initiate messages to their lender programme managers.

### What Is Displayed

#### Conversation Header
- Lender organisation name and programme
- Lender contact person (Programme Manager name)
- Online indicator (green if lender active in app)
- "View My Loan" quick link button
- "📤 Submit Report" quick action button

#### Message Thread
WhatsApp-style chat bubbles:
- Green bubbles (left): Messages from lender staff
- Grey bubbles (right): Messages from farmer
- System messages: Centred grey pills (e.g. "Layer 2 disbursement of ₦340,000 released")
- Each message shows: timestamp, delivery tick (✓ sent, ✓✓ delivered, ✓✓ read)

Message types visible in thread:
- Manual messages (lender staff → farmer or farmer → lender)
- System alerts (disbursement released, repayment confirmed)
- Automated reminders (repayment due, report deadline)
- Verification updates (agent visit scheduled, farm verified)

#### Quick Replies (chip row above input)
Pre-populated chips the farmer can tap to send instantly:
- ✅ Payment confirmed
- 📸 Photos submitted  
- ❓ Query about my Layer 3
- 🙏 Thank you

These exist because many farmers are not comfortable typing long messages. One-tap responses allow them to acknowledge communications.

#### Message Input
- Text field with placeholder "Type a message..."
- 📎 Attach photo (farm photos, receipts, documents)
- 🎙️ Voice note (hold to record — for low-literacy users)
- Send button (→)
- Enter key sends on desktop
- Pressing send with empty field does nothing

#### Notification Hub (secondary tab within Messages)
Separate tab showing all push notifications:
- All types: disbursements, repayments, score updates, report verifications
- Read/unread state
- Tap any notification → goes to relevant page
- "Mark all as read" button

### CRUD Operations

#### CREATE — Send Message
```
POST /api/v1/messages
Body: {
  senderId: borrower.userId,
  recipientId: lenderManager.userId,
  content,
  programId,
  attachmentUrls: [] (optional)
}

Delivery flow:
1. Message saved to database
2. WebSocket push to lender dashboard (if online)
3. SMS fallback if lender offline > 5 minutes
4. Message appears in both farmer and lender chat views
```

#### CREATE — Send Voice Note
```
POST /api/v1/uploads/presign
Body: { fileType: "audio/mp3", folder: "voice-notes" }

Returns: presignedUrl, key

Browser MediaRecorder API → records audio
PUT presignedUrl (audio file)
POST /api/v1/uploads/confirm { key }

POST /api/v1/messages
Body: { voiceNoteUrl, voiceNoteKey, content: "[Voice note]" }
```

#### CREATE — Attach Photo to Message
```
Same presign flow as voice note
fileType: "image/jpeg", folder: "message-attachments"
Photo appears inline in chat thread
Lender can view full resolution
```

#### READ
```
GET /api/v1/messages?conversationId=     All messages in conversation
GET /api/v1/notifications?userId=        All notifications
GET /api/v1/notifications/unread-count   Unread badge count
```

#### UPDATE
```
PATCH /api/v1/notifications/:id/read     Mark single notification read
POST  /api/v1/notifications/read-all     Mark all read
```

#### DELETE
Messages cannot be deleted by borrowers (regulatory audit trail). Messages can be reported as inappropriate.

### Business Rules
- Farmers cannot initiate a conversation outside of their active programmes — they can only reply within a programme thread
- Response SLA: Lender must respond within 2 business days (tracked, lender admin alerted if missed)
- Voice notes: maximum 2 minutes
- Photo attachments: maximum 3 per message, 10MB each
- Farmers can message in any Nigerian language — AgroTrack does not translate but accepts all

### Real-World Simulation
Bello Musa received a message from the Federal Ministry programme manager asking for clarification on his May farm report — they need photos that are more clearly showing the rice crop, not just the soil. He reads the message (in Hausa) and records a 45-second voice note (also in Hausa) explaining that he will go to the farm and take new photos. He then taps "📸 Photos submitted" 20 minutes later after walking to his farm. The lender programme manager sees this in real-time, downloads the new photos, verifies the report, and Layer 3 disbursement is approved. This entire interaction happened without either party needing to travel or call anyone.

---

## Page 6 — Discover (Browse Programs)

### Purpose
The loan marketplace where farmers find programmes they are eligible for and submit applications. This page is what creates the demand side of AgroTrack — it shows farmers what funding is available specifically for their profile.

### What Is Displayed

#### Match Score Banner
"Based on your FarmScore of 815 and your rice farm in Birnin Kebbi, you qualify for 4 programmes."

This personalised message is powered by the eligibility matching engine that compares the farmer's profile against every active programme's eligibility criteria.

#### Eligibility Match % (per programme card)
Each programme shows a percentage match — how well the farmer's profile matches the programme's eligibility criteria:
- 100% match: All criteria met perfectly
- 90%+ match: Strong candidate
- 70–89%: Eligible but not ideal match
- Below 70%: Shown with explanation of what is missing

#### Programme Cards Grid

Each card shows:
- Programme name (e.g. "CBN Rice Farmers Support Fund 2025")
- Lender name and logo (CBN)
- Match percentage badge (96% match)
- Loan type: Loan / Grant / Hybrid
- Amount range: Up to ₦2,000,000
- Interest rate: 9% p.a. (or 0% for grants)
- Repayment period: 12 months
- Application deadline: Nov 30, 2025
- Layers indicator: 3 layers (L1 ✅ eligible, L2 📷 report required, L3 👨 agent)
- Eligible states: Kebbi, Niger, Sokoto shown as chips
- Eligible crops: Rice, Sorghum shown as chips
- "Apply Now →" button (disabled if already applied)
- Application deadline countdown if < 30 days

#### Active Application Status Cards
At the top, above the programme grid, any ACTIVE applications are shown as status cards:
- Programme name
- Application ID
- Current status with colour-coded pill and icon
- What happens next
- Estimated review timeline

Status examples:
- 📋 PENDING — "Submitted Jun 13. Lender review typically takes 3–5 days"
- 🔍 UNDER REVIEW — "Lender is reviewing your documents"
- ⏳ INFO REQUESTED — "Lender needs: Cooperative membership letter (upload below)"
- ✅ APPROVED — "Congratulations! First disbursement in progress"
- ❌ REJECTED — "Reason: FarmScore below minimum threshold for this programme"

#### Filter / Sort Bar
- Sort by: Best match / Newest / Deadline soonest / Interest rate (lowest first)
- Filter by: Loan type / Amount range / Crop / State / Active only

#### Search
Full-text search across programme names and lender names.

### CRUD Operations

#### READ — Browse Programmes
```
GET /api/v1/programs?status=ACTIVE           All active programmes
GET /api/v1/programs?borrowerId=&eligible=true  Eligible programmes only

Eligibility matching logic (server-side):
  1. Filter by state: borrower.state ∈ program.eligibilityCriteria.states
  2. Filter by crop: borrower.cropTypes ∩ program.eligibilityCriteria.crops ≠ ∅
  3. Filter by score: borrower.farmScore ≥ program.eligibilityCriteria.minScore
  4. Filter by gender: match if program requires specific gender
  5. Filter by cooperative: match if cooperative required and borrower is member
  6. Calculate match %: sum of matching criteria / total criteria × 100
  7. Sort by match %, then by deadline
```

#### READ — Check Existing Applications
```
GET /api/v1/applications?borrowerId=&status=  All farmer's applications
```

#### CREATE — Submit Application

**Pre-application Eligibility Check (instant)**
Before showing the application form, system does:
```
GET /api/v1/programs/:id/eligibility-check?borrowerId=

Returns:
{
  eligible: true,
  matchPercent: 96,
  passedCriteria: ["state", "crop", "score", "gender"],
  failedCriteria: [],
  missingDocuments: ["cooperative_letter"],
  warnings: ["Your FarmScore of 815 exceeds the minimum — high priority application"]
}
```
If eligible: Show application form
If ineligible: Show reason + what is needed to become eligible

**Application Form (multi-step)**

Step 1: Loan Amount
- Slider or input for requested amount
- Min/Max boundaries from programme (₦100K to ₦2M)
- Calculator shows: monthly repayment = ₦X at 9% over 12 months
- Total interest cost displayed
- Disbursement timeline shown

Step 2: Purpose Statement
- Dropdown: Land preparation / Seeds & inputs / Irrigation / Equipment / Labour / Other
- Text field for additional detail (optional)
- Voice note option

Step 3: Required Documents
Checklist of what programme requires:
- BVN ✅ Already verified
- NIN ✅ Already verified
- Farm photos ✅ Already on file (3 photos from registration)
- Cooperative letter ❌ Upload required → file picker shown
- Land title ❌ Optional but improves score

Step 4: Review and Submit
- Summary of application
- Loan amount, purpose, programme, lender
- List of documents attached
- Consent checkbox: "I confirm all information is accurate and I understand the loan terms"
- Submit button

```
POST /api/v1/applications
Body: {
  borrowerId, programId, requestedKobo,
  purpose, purposeDetail,
  documents: [{ docType, fileUrl, fileKey }]
}

What happens:
1. Application created with status PENDING
2. Farmer SMS: "Application APP-20250613-4421 submitted to CBN Rice Fund. We'll notify you of the decision."
3. Lender dashboard: new application appears in review queue
4. If FarmScore > programme auto-approve threshold: fast-tracked for review
5. If agent verification required: nearest field agent assigned for farm visit
6. Application ID returned for tracking
```

#### UPDATE — Respond to Info Request
```
When lender sends "Request More Info", farmer must upload missing documents:

POST /api/v1/applications/:id/respond-info
Body: { documents: [{ docType, fileUrl, fileKey }], notes }

What happens:
1. Documents attached to application
2. Application status back to PENDING (review restarted)
3. Lender notified: "Borrower has submitted requested documents"
```

#### UPDATE — Withdraw Application
```
POST /api/v1/applications/:id/withdraw
(Only possible if status = PENDING or UNDER_REVIEW)

What happens:
1. Status → WITHDRAWN
2. Farmer can re-apply to same programme (if still accepting applications)
3. No FarmScore impact
4. Application slot freed (another farmer can apply)
```

### Business Rules
- A farmer cannot have two ACTIVE applications to the same programme simultaneously
- A farmer can apply to multiple different programmes simultaneously
- Once approved, farmer cannot apply to another programme until current loan reaches 60% repayment
- Rejected applications can be re-submitted after 90 days (unless permanent ineligibility)
- Applications expire automatically after 30 days of inactivity (WITHDRAWN status)

### Real-World Simulation
Bello Musa hears from another farmer in his cooperative that Kebbi State Government has opened a new irrigation support grant. He opens Discover. He sees the grant card at the top of his list with a 92% match badge. The card shows:
- Amount: Up to ₦500,000
- Type: Grant (0% interest — does not need to be repaid!)
- Deadline: July 31

He taps "Apply Now." The system checks his eligibility: all criteria pass except he does not have his cooperative membership letter uploaded. The form shows the missing document with an upload button. He photographs his cooperative ID card on the spot and uploads it. He submits. Within 20 minutes he receives a WhatsApp message from the Kebbi State programme manager: "Application received. A field agent will visit your farm within 7 days for verification."

---

## Page 7 — Settings

### Purpose
Full control over the farmer's AgroTrack account — personal profile, bank account, notification preferences, language selection, security settings, and data privacy. This page is critical for trust: farmers need to know they can update their information and control how they are contacted.

### What Is Displayed (4 sections)

#### Section 1: My Profile

**Personal Information**
- Full name (read-only after BVN verification — tied to BVN record)
- Farmer ID (FMR-0034, read-only, system-generated)
- Phone number (read-only — this IS the account login)
- Date of birth (read-only after NIN verification)
- Gender
- State (editable)
- LGA (editable)

**KYC Verification Status**
- BVN: ✅ Verified — 0803-xxx-xxxx (last 4 digits shown)
- NIN: ✅ Verified
- Farm GPS: ✅ Verified — 12.4539°N, 4.1975°E
- Agent Visit: ✅ Verified — Jun 2, 2025 by Ibrahim Salisu

**Farm Information**
- Primary crop (editable — farmer may diversify crops)
- Secondary crops (editable)
- Farm size (editable — with note that changes trigger re-verification)
- Farm GPS location — "Update Farm Location" button opens GPS capture

Note on editability: Name, BVN, NIN, and date of birth are LOCKED after verification. These are tied to government identity records and cannot be changed without lender admin approval (for legal compliance).

**Profile Photo**
- Current photo or placeholder initials
- Upload new photo button
- Photo used in lender dashboard profile view

#### CRUD for Profile
```
GET  /api/v1/borrowers/:id          Read profile
PATCH /api/v1/borrowers/:id
Body: {
  state, lga, cropTypes, farmSizeHectares,
  profilePhotoUrl, farmPhotoUrls
}
Note: firstName, lastName, bvn, nin, dateOfBirth are not editable via this route
```

#### Section 2: Bank Account

**Current Account**
- Bank name: First Bank of Nigeria
- Account number: 3••• •••• 7721 (partially masked)
- Account name: BELLO MUSA
- Status: ✅ Verified via Paystack

**Update Bank Account Button**
Opens a flow:
1. Enter new account number
2. Select bank from dropdown (all Nigerian banks)
3. System calls Paystack to resolve account name
4. "Confirm your account name is: BELLO MUSA" 
5. If correct: account updated, old account archived
6. Requires OTP confirmation to prevent fraudulent bank account changes

```
POST /api/v1/borrowers/:id/bank-account
Body: { accountNumber, bankCode }

What happens:
1. POST to Paystack /bank/resolve { account_number, bank_code }
2. Returns account_name
3. Borrower confirms account name is correct
4. POST /api/v1/borrowers/:id/verify-bank
   Body: { accountNumber, bankCode, accountName, paystackRecipientCode }
5. Old account archived in DB (not deleted — audit trail)
6. New account active for all future disbursements
7. SMS: "Your bank account has been updated. If you did not make this change, call us immediately."
```

**Mobile Money Option**
For farmers without a bank account:
- OPay number
- PalmPay number
- Moniepoint number
Each can be set as primary for receiving disbursements.

#### Section 3: Notifications

Toggle controls per event per channel:

| Event | In-App | SMS | WhatsApp | Email |
|---|---|---|---|---|
| Repayment reminders | ✅ ON | ✅ ON | ✅ ON | ☐ OFF |
| Disbursement received | ✅ ON | ✅ ON | ✅ ON | ☐ OFF |
| Application updates | ✅ ON | ✅ ON | ☐ OFF | ☐ OFF |
| Farm report due | ✅ ON | ✅ ON | ☐ OFF | ☐ OFF |
| FarmScore changes | ✅ ON | ☐ OFF | ☐ OFF | ☐ OFF |
| New programmes | ✅ ON | ☐ OFF | ☐ OFF | ☐ OFF |
| Messages | ✅ ON | ✅ ON | ✅ ON | ☐ OFF |

**Reminder Timing**
- Repayment reminder: X days before due date (1 / 3 / 7 days — farmer chooses)
- Farm report reminder: X days before deadline (3 / 7 / 14 days)

**Quiet Hours**
- Do not send SMS between: [from time] and [to time]
- Default: No SMS between 10pm and 7am
- Critical alerts (payment confirmed, disbursement received) always sent immediately

```
PATCH /api/v1/users/:id/notification-preferences
Body: {
  smsEnabled, whatsappEnabled, emailEnabled, inAppEnabled,
  quietHoursStart, quietHoursEnd,
  repaymentReminderDays, reportReminderDays,
  channels: {
    REPAYMENT_DUE: ["SMS", "WHATSAPP"],
    DISBURSEMENT_RECEIVED: ["SMS", "WHATSAPP", "IN_APP"],
    ...
  }
}
```

#### Section 4: Language & Accessibility

**Language Selection**
Radio buttons:
- 🇬🇧 English (default)
- 🌍 Hausa — هَوُسَ
- 🌍 Yoruba
- 🌍 Igbo
- 🌍 Nigerian Pidgin

Selecting a language:
- Changes all in-app text to that language
- Future SMS messages sent in that language
- Future WhatsApp messages in that language
- FarmScore PDF generated in that language

```
PATCH /api/v1/users/:id/preferences
Body: { language: "EN" | "HA" | "YO" | "IG" | "PC" }
```

**Accessibility**
- Font size: Small / Medium (default) / Large
- High contrast mode toggle (for outdoor use in bright sunlight)
- Voice navigation: Enable (uses browser text-to-speech for form labels)

#### Section 5: Security

**Active Sessions**
List of all devices currently logged in:
- Device description (Tecno Camon 20, Kebbi State, Jun 13)
- Last active timestamp
- "Sign out" button per device
- "Sign out everywhere" button

**Change PIN / Password**
- Enter current password
- Enter new password (min 8 chars)
- Confirm new password
- Submit

**Delete Account**
Button triggers a multi-step flow:
1. Warning: "Deleting your account will not erase your FarmScore or loan history — these are kept for regulatory compliance"
2. Confirm by typing "DELETE" in a text field
3. OTP confirmation sent to registered phone
4. Account deactivated (not deleted — data retained per CBN 7-year rule)
5. Farmer can re-register with same phone number — previous history intact

```
POST /api/v1/users/:id/deactivate
Body: { confirmText: "DELETE", otp }
```

#### Section 6: Data & Privacy

**My Data**
- "Download all my data" — exports everything AgroTrack holds about the farmer (NDPR right to access)
- List of all lenders who have accessed FarmScore
- Revoke FarmScore access from specific lender

**USSD Access**
- Enable / Disable USSD access (*737*99# for this phone number)
- USSD PIN change (4-digit)

---

## USSD — The Feature Phone Experience

The borrower dashboard is primarily for smartphone users. For farmers with basic feature phones:

### USSD Menu (*737*99#)

```
Level 0: Main Menu
  AgroTrack. Welcome Bello.
  1. Loan balance
  2. Make payment
  3. Submit farm report
  4. My FarmScore
  5. Browse programs
  0. Exit

Level 1: Loan Balance (select 1)
  AgroTrack - Balance
  CBN Rice Fund 2025
  Disbursed: N850,000
  Repaid: N510,000
  Balance: N340,000
  Next: N85,000 due Jul 5
  Reply 0 for main menu

Level 1: Make Payment (select 2)
  AgroTrack - Payment
  Due: N85,000 by Jul 5
  1. Bank transfer
  2. Mobile money
  3. In-kind produce
  0. Back

Level 2: Bank Transfer (select 2*1)
  AgroTrack - Pay by transfer
  Bank: GTBank
  Account: 0123456789
  Name: AgroTrack / CBN Rice
  Ref: LN20250134-07
  Transfer then reply 1 to confirm
  0. Back

Level 1: Farm Report (select 3)
  AgroTrack - Farm Report
  For June 2025
  Select crop stage:
  1. Planting
  2. Growing
  3. Flowering
  4. Harvesting
  0. Back

Level 2: Challenges (after stage selection)
  AgroTrack - Challenges
  Select any issues:
  1. None - Good progress
  2. Pests
  3. Drought
  4. Flooding
  5. Labour shortage
  6. Input shortage

Level 1: FarmScore (select 4)
  AgroTrack - FarmScore
  Score: 815 / 850
  Grade: Gold Member
  Top 12% of farmers
  +15pts last report
  Tip: Pay Jul on time
  for +8 more points
  Reply 0 for menu

Level 1: Browse Programs (select 5)
  AgroTrack - Programs
  You qualify for 4 loans:
  1. CBN Rice Fund (96%)
  2. Kebbi Irrigation (88%)
  3. NIRSAL Cassava (74%)
  4. Ekiti Youth Fund (65%)
  Select to view details
```

Each USSD level is limited to 182 characters. All screens are plain text — no colour, no images. Works on any phone with a SIM card.

### WhatsApp Bot Commands
For farmers with WhatsApp on basic Android phones:

```
User sends: "balance"
Bot replies: "Your CBN Rice Fund balance: ₦340,000 outstanding. Next payment: ₦85,000 due Jul 5."

User sends: "score"
Bot replies: "Your FarmScore: 815 (Gold 🏆). You need 35 more points to reach Platinum. Pay on time next month for +8 pts."

User sends: "pay"
Bot replies: "Your current payment due is ₦85,000. How would you like to pay?
1. Bank transfer
2. Mobile money (OPay/PalmPay)
Reply with a number."

User sends a photo
Bot replies (if active report session): "✅ Photo 1 of 3 received. Send 2 more farm photos to complete your June report."

User sends: "help"
Bot replies: Full menu of available commands in farmer's preferred language.
```

---

## FarmScore Detailed Calculation (Borrower-Visible Explanation)

The scoring system must be transparent to the farmer. Every component is explained in simple language on the FarmScore page:

### Component 1: Identity Verification (max 170 pts · 20%)

| Action | Points |
|---|---|
| BVN verified | +60 |
| NIN verified | +50 |
| Profile photo uploaded | +10 |
| Farm GPS captured | +20 |
| Agent visit completed | +30 |
| **Maximum** | **170** |

### Component 2: Farm Verification (max 170 pts · 20%)

| Action | Points |
|---|---|
| Farm photos uploaded (min 3) | +40 |
| GPS location within 1km of declared location | +30 |
| Agent GPS boundary walk completed | +50 |
| Farm size measurement within 20% of declared | +30 |
| Repeat agent visit (monitoring) | +10 per visit, max 20 |
| **Maximum** | **170** |

### Component 3: Repayment History (max 255 pts · 30%)

| Action | Points |
|---|---|
| Each on-time payment | +12 |
| Each early payment (3+ days) | +18 |
| Each late payment (1–14 days) | -5 |
| Each late payment (15–29 days) | -10 |
| Each defaulted payment | -20 |
| Repayment streak: 3 months | +10 bonus |
| Repayment streak: 6 months | +20 bonus |
| Repayment streak: 12 months | +40 bonus |
| Loan completed (all paid) | +50 (one-time) |
| **Maximum** | **255** |

### Component 4: Activity Reporting (max 127 pts · 15%)

| Action | Points |
|---|---|
| Each farm report submitted | +10 |
| Each report verified by agent/lender | +5 additional |
| Report submitted with voice note | +2 |
| 3 consecutive verified reports | +20 bonus |
| Report submitted early (> 5 days before deadline) | +3 |
| Report rejected | 0 (neutral) |
| Missing report deadline | -10 |
| **Maximum** | **127** |

### Component 5: Cooperative Standing (max 85 pts · 10%)

| Action | Points |
|---|---|
| Cooperative membership confirmed | +20 (one-time) |
| Monthly contribution paid on time | +5 per month, max 30 |
| Cooperative group loan repaid on time | +15 |
| Role: Secretary or Treasurer | +10 (one-time) |
| Role: Chairman | +20 (one-time) |
| Group loan default by any member | -10 |
| **Maximum** | **85** |

### Component 6: Geographic Risk (max 43 pts · 5% — inverse scoring)

| Condition | Points |
|---|---|
| Low-risk zone (safe state, no flood, market nearby) | 43 |
| Near a commodity market (< 10km) | +10 |
| Flood risk zone | -15 |
| High-conflict zone (NE Nigeria) | -20 |
| Remote area (> 50km from market) | -5 |
| **Maximum** | **43** |

---

## Notification Reference — Borrower-Facing Messages

### SMS Templates (Termii, max 160 chars)

```
REPAYMENT_DUE_3_DAYS:
"AgroTrack: Your loan payment of N85,000 is due in 3 days (Jul 5). Pay via *737*99# or app. Reply STOP to opt out."

REPAYMENT_DUE_TODAY:
"AgroTrack: N85,000 loan payment due TODAY (Jul 5). Dial *737*99# to pay now or use your AgroTrack app."

REPAYMENT_OVERDUE_7:
"AgroTrack: Your Jul 5 payment of N85,000 is 7 days late. Pay now to protect your FarmScore. *737*99# or app."

DISBURSEMENT_RELEASED:
"AgroTrack: N340,000 (Layer 2) sent to your First Bank account 3067... Your CBN Rice Fund loan. Allow 24hrs."

APPLICATION_APPROVED:
"AgroTrack: Your application APP-4421 (CBN Rice Fund) is APPROVED! N255,000 Layer 1 will be sent within 48hrs."

APPLICATION_REJECTED:
"AgroTrack: App APP-4421 was not approved. Reason: Score below minimum. Re-apply in 90 days. *737*99# for help."

FARM_REPORT_DUE:
"AgroTrack: Your June farm report is due in 7 days. Submit via app or *737*99#. This unlocks your Layer 3."

FARMSCORE_UPDATED:
"AgroTrack: Your FarmScore increased to 815 (+15 pts). Grade: Gold. Dial *737*99#4 to see breakdown."

LOAN_COMPLETED:
"AgroTrack: Congratulations! Your CBN Rice Fund loan is fully repaid. +50 FarmScore pts earned. Download certificate in app."

AGENT_VISIT_SCHEDULED:
"AgroTrack: Field agent Ibrahim Salisu will visit your farm on Jun 15. Be available 9am-12pm. Call: 0803xxx."
```

---

## Role-Based Access — What the Borrower Can and Cannot Do

| Feature | Borrower Can | Borrower Cannot |
|---|---|---|
| View own profile | ✅ Yes | View other farmers |
| Edit personal info | ✅ Limited (state, LGA, crops) | Change name, BVN, NIN |
| View own loans | ✅ Yes | View other borrowers' loans |
| Request restructure | ✅ Yes (request only) | Approve own restructure |
| Submit farm reports | ✅ Yes | Verify own reports |
| Apply for programs | ✅ Yes | Create programs |
| Send messages to lender | ✅ Yes | Access other conversations |
| View own FarmScore | ✅ Yes | Modify FarmScore |
| Share FarmScore | ✅ Yes | Revoke lender's view history |
| Make repayments | ✅ Yes | Waive own repayments |
| Download score PDF | ✅ Yes | — |
| Update bank account | ✅ Yes (with OTP) | — |
| Update notification preferences | ✅ Yes | — |
| Change language | ✅ Yes | — |
| Delete account | ✅ Yes (deactivation) | Delete loan records |
| Access lender dashboard | ❌ No | — |
| Access other loans | ❌ No | — |
| Access admin console | ❌ No | — |

---

## Data Owned by the Borrower vs Data Owned by the Platform

This is important for NDPR (Nigeria Data Protection Regulation) compliance:

**Borrower owns (can request deletion):**
- Personal profile data (name, phone, address, photo)
- Farm photos and voice notes
- Message content (their own messages)
- Notification preferences

**Platform retains permanently (regulatory requirement):**
- Loan records (7-year CBN retention)
- Repayment records (7-year retention)
- FarmScore history (permanent — tied to financial identity)
- Application records (7-year retention)
- Audit logs (7-year retention)

On account deletion request:
- Personal identifiers are anonymised (name → "Farmer-FMR0034")
- BVN/NIN hashes retained for fraud prevention
- Photos deleted from S3
- Financial records retained as anonymised records

---

*AgroTrack Borrower Dashboard — Production Feature Specification v1.0*  
*Engineering: engineering@agrotrack.ng · Product: product@agrotrack.ng*  
*Last updated: June 2025*
