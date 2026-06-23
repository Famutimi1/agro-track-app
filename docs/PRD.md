# AgroTrack Product Requirements Document (PRD)

## Product Overview

**AgroTrack** is an agricultural loan and grant management platform designed for Nigeria and scalable globally. It provides full visibility, accountability, and intelligence for agricultural finance — from disbursement to repayment.

### Vision
To become the standard infrastructure for agricultural lending in emerging markets, enabling every naira (and every currency) of farming finance to be fully trackable.

### Target Users
1. **Lenders** - Government agencies (CBN, NIRSAL, State Ministries), commercial banks, microfinance banks, NGOs, development organizations
2. **Borrowers** - Smallholder farmers, farming cooperatives
3. **Field Agents** - Extension workers, community officers, verification agents

---

## User Onboarding Flows

### 1. Lender Onboarding (Organization Registration)

#### Step 1: Landing Page Discovery
```
URL: /

User sees:
- Hero section with value proposition
- Stats showing platform traction (₦4.2B+ tracked, 23,450 farmers)
- Feature highlights
- Testimonials from CBN, NIRSAL, Union Bank
- Pricing plans

Call to Action: "Start Free Trial" or "Lender Login"
```

#### Step 2: Organization Registration
```
URL: /signup

Required Information:
1. Organization Details
   - Organization name
   - Organization type (dropdown: Federal Agency, State Ministry, Bank, MFI, NGO, etc.)
   - CAC/RC number (optional)
   
2. Admin Account
   - Full name
   - Work email
   - Phone number
   - Password

Validation:
- Email must be work domain (not gmail, yahoo, etc.)
- Password: 8+ chars, uppercase, lowercase, number, special char

Post-submission:
- Email verification sent
- Redirect to /verify-email
```

#### Step 3: Email Verification
```
URL: /verify-email

User sees:
- "Check your email" message
- 6-digit code input
- Resend code option (60-second cooldown)

After verification:
- Account activated
- Redirect to /lender/dashboard
- Show onboarding wizard
```

#### Step 4: Dashboard Onboarding Wizard
```
URL: /lender/dashboard (first visit)

Wizard Steps:
1. Welcome Modal
   "Welcome to AgroTrack, [First Name]! Let's set up your first loan program."
   [Start Setup] [Skip for Now]

2. Organization Profile (if skipped during signup)
   - Upload logo
   - Add address
   - Add phone number
   
3. Create First Program
   - Program name
   - Loan amount range
   - Interest rate
   - Duration
   - Target crops (multi-select)
   - Target states (multi-select)
   - Disbursement type (Full/Tranche)
   
4. Invite Team Members (optional)
   - Email addresses
   - Role assignment (Manager, Viewer, Analyst)

5. Completion
   "Your first program is ready! Here's what to do next:"
   - Share program link with farmers
   - Set up field agents
   - Configure alerts

Progress Indicator: [●○○○○] 1 of 5
```

---

### 2. Borrower (Farmer) Onboarding

#### Step 1: Discovery
```
Multiple entry points:
- Landing page "Borrower Portal" button
- Direct URL: /register
- USSD: *384*46#
- WhatsApp: Send "Hi" to +234 XXX
- Field agent registration on their behalf
```

#### Step 2: Registration Form
```
URL: /register

Page 1: Identity
- Full name
- Phone number (primary)
- Email (optional)
- Password

Page 2: Verification
- BVN (11 digits) — auto-verified
- NIN (11 digits) — auto-verified
- Date of birth

Page 3: Location
- State (dropdown)
- LGA (dropdown, filtered by state)
- Village/Address

Page 4: Farm Details
- Farm size (hectares)
- Primary crop
- Secondary crops (multi-select)
- Years of farming experience
- Do you have irrigation? (Yes/No)

Page 5: Bank Details
- Bank name (dropdown)
- Account number (10 digits)
- Account name (auto-populated via Paystack)

Page 6: Optional Extras
- Cooperative membership (Yes/No)
- Cooperative name (if yes)
- Guarantor name
- Guarantor phone

Progress Bar: [=====     ] 60%
```

#### Step 3: Phone Verification
```
URL: /verify-phone

- 6-digit OTP sent via SMS
- Enter code
- Resend option (60s cooldown)
```

#### Step 4: Post-Registration Welcome
```
URL: /borrower/overview (first visit)

Welcome Modal:
"Welcome to AgroTrack, [Name]! 

Your FarmScore: 300 (Starting Score)
Tier: Bronze

What you can do now:
1. Browse available loan programs
2. Complete your profile to improve your score
3. Apply for a loan

[Browse Programs] [Complete Profile]"
```

#### Step 5: Guided Profile Completion
```
Checklist shown on dashboard:

Profile Completion (affects FarmScore)
[✓] Basic information
[✓] Phone verified
[ ] Upload ID card
[ ] Upload farm photo
[ ] Add GPS location
[ ] BVN verification complete
[ ] Join a cooperative

Completion: 40%
+15 FarmScore points available
```

---

### 3. Field Agent Onboarding

#### Step 1: Invitation by Lender
```
Lender sends invite from:
/lender/field-agents → [Invite Agent]

Email sent to agent with:
- Invitation link
- Lender organization name
- Instructions
```

#### Step 2: Agent Registration
```
URL: /agent-register?token=xxx

Form:
- Full name
- Phone number
- Email
- State of operation
- LGA of operation
- Password
- Upload ID (National ID, Driver's License, or Voter's Card)
```

#### Step 3: Training Materials
```
URL: /agent/training (first visit)

Required viewing:
1. Video: "How to register farmers" (5 min)
2. Video: "GPS farm mapping tutorial" (3 min)
3. Video: "Submitting verification reports" (4 min)
4. Quiz: 10 questions, 80% pass rate required

Progress tracked, must complete before first assignment
```

#### Step 4: App Download & Setup
```
Mobile app required for field work:
- Android: Play Store link
- iOS: App Store link

First app launch:
- Login with credentials
- Enable location permissions
- Enable camera permissions
- Download offline data pack for assigned LGAs
```

---

## Site Navigation Map

### Public Pages (Unauthenticated)

```
/                     - Landing page
/features             - Detailed feature breakdown
/how-it-works         - Step-by-step process explanation
/pricing              - Pricing plans and FAQ
/testimonials         - Customer stories and case studies
/contact              - Contact form and info

/login                - Universal login
/signup               - Lender organization registration
/register             - Borrower registration
/forgot-password      - Password reset flow
```

### Lender Dashboard (Authenticated)

```
/lender/dashboard            - Overview with KPIs
/lender/programs             - Loan program management
/lender/programs/new         - Create new program
/lender/programs/:id         - Program details
/lender/programs/:id/edit    - Edit program

/lender/applications         - Loan applications list
/lender/applications/:id     - Application review

/lender/borrowers            - Borrower directory
/lender/borrowers/:id        - Borrower profile

/lender/loans                - Active loans
/lender/loans/:id            - Loan details

/lender/disbursements        - Disbursement tracking
/lender/repayments           - Repayment tracking

/lender/map                  - Geospatial portfolio map
/lender/reports              - Generate reports

/lender/field-agents         - Agent management
/lender/field-visits         - Visit scheduling

/lender/settings             - Organization settings
/lender/settings/team        - Team management
/lender/settings/billing     - Subscription & billing
/lender/settings/api         - API keys
/lender/settings/webhooks    - Webhook configuration
```

### Borrower Dashboard (Authenticated)

```
/borrower/overview           - Personal dashboard
/borrower/loans              - My loans
/borrower/loans/:id          - Loan details

/borrower/applications       - My applications
/borrower/applications/new   - Apply for loan

/borrower/farm-reports       - Farm reports list
/borrower/farm-reports/new   - Submit new report

/borrower/farm-score         - FarmScore details
/borrower/repayments         - Repayment history

/borrower/programs           - Discover programs
/borrower/messages           - Messages with lender

/borrower/settings           - Account settings
/borrower/settings/profile   - Edit profile
/borrower/settings/bank      - Bank details
/borrower/settings/security  - Password & 2FA
```

### Field Agent Dashboard (Authenticated)

```
/agent/dashboard             - Today's tasks
/agent/farmers               - Registered farmers
/agent/farmers/register      - Register new farmer

/agent/visits                - Scheduled visits
/agent/visits/:id            - Visit details
/agent/visits/:id/report     - Submit visit report

/agent/earnings              - Earnings tracker
/agent/settings              - Account settings
```

---

## Key User Flows

### Flow 1: Lender Creates Program → Farmer Applies → Loan Disbursed

```
1. Lender: /lender/programs/new
   → Fill program details
   → Set eligibility criteria
   → Configure disbursement layers
   → Publish program

2. Farmer: /borrower/programs
   → Browse available programs
   → See eligibility match %
   → Click "Apply"

3. Farmer: /borrower/applications/new
   → Select program
   → Enter loan amount
   → Provide purpose
   → Upload documents
   → Submit application

4. Lender: /lender/applications
   → See new application notification
   → Review borrower profile
   → Check FarmScore
   → View farm photos/GPS
   → Approve or Reject

5. System: Auto-creates loan record
   → Creates disbursement for Layer 1
   → Notifies borrower

6. Lender: /lender/disbursements
   → Approve Layer 1 disbursement
   → Process payment

7. System: Sends funds via Paystack
   → SMS/WhatsApp confirmation to farmer
   → Updates loan status
```

### Flow 2: Farmer Submits Report → Layer 2 Released

```
1. Farmer: Receives SMS reminder
   "Time to submit your farm report for Layer 2 release"

2. Farmer: /borrower/farm-reports/new
   → Select loan
   → Choose growth stage
   → Take/upload photos
   → Add notes
   → Submit

3. System: Validates report
   → Checks GPS matches farm location
   → Checks photo timestamps

4. Lender: /lender/borrowers/:id
   → Reviews farm report
   → Verifies activity
   → Approves Layer 2

5. System: Releases Layer 2 funds
   → Updates FarmScore (+15 points)
   → Notifies farmer
```

### Flow 3: Field Agent Verification

```
1. Lender: /lender/field-visits
   → Schedule visit for borrower
   → Assign field agent

2. Agent: Receives notification
   → Opens mobile app
   → Sees assigned visit

3. Agent: Travels to farm
   → Opens visit in app
   → Confirms farmer identity
   → GPS-maps farm boundaries (walk perimeter)
   → Takes geotagged photos
   → Fills verification checklist
   → Submits report (works offline)

4. System: Syncs when online
   → Attaches report to borrower profile
   → Notifies lender

5. Lender: Reviews verification
   → Approves/flags issues
   → Proceeds with disbursement
```

---

## Notifications

### SMS Notifications
- Application submitted confirmation
- Application approved/rejected
- Disbursement processed
- Repayment reminder (3 days before)
- Repayment reminder (1 day before)
- Repayment received
- FarmScore updated
- Farm report reminder

### WhatsApp Notifications
- Same as SMS, richer format with buttons
- Quick reply options for common actions

### Email Notifications (Lenders)
- New application received
- Loan approaching default
- Weekly portfolio summary
- Field visit completed
- System alerts

### In-App Notifications
- Real-time updates for all events
- Bell icon with badge count
- Notification center with history

---

## FarmScore System

### Score Range: 0-850

### Tiers
| Tier | Score | Benefits |
|------|-------|----------|
| Platinum | 800-850 | Instant approval, lowest rates, highest amounts |
| Gold | 700-799 | Priority review, reduced documentation |
| Silver | 550-699 | Standard processing |
| Bronze | 400-549 | May require guarantor |
| Unscored | 300-399 | New user, limited programs |

### Score Components
| Factor | Weight | What Improves It |
|--------|--------|------------------|
| Repayment History | 30% | On-time payments |
| Farm Productivity | 25% | Good yields, verified harvests |
| Credit Utilization | 20% | Using loans responsibly |
| Report Consistency | 10% | Regular farm reports |
| Cooperative | 8% | Active membership |
| Experience | 7% | Years farming |

### Score Actions
- View score breakdown: /borrower/farm-score
- Download score PDF: For bank applications
- Score history chart: Track progress over time

---

## Technical Implementation Notes

### Performance Targets
- Page load: < 2 seconds
- API response: < 500ms
- Map load (10,000 points): < 3 seconds
- Search results: < 200ms

### Offline Support
- Borrower: View loan details, cached programs
- Field Agent: Full registration + visit flow
- Sync indicator when back online

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode available

### Localization
- Languages: English, Hausa, Yoruba, Igbo
- Currency: NGN (₦), planned: GHS, KES, USD
- Date formats: DD/MM/YYYY
- Number formats: Nigerian convention

---

## Success Metrics

### Lender Metrics
- Portfolio at risk (PAR30, PAR90)
- Disbursement velocity
- Repayment rate
- Default rate
- Active borrower count

### Borrower Metrics
- Application completion rate
- FarmScore distribution
- Report submission rate
- Repayment on-time rate

### Platform Metrics
- Monthly active users
- Loan volume processed
- Average loan size
- Customer acquisition cost
- Net promoter score (NPS)
