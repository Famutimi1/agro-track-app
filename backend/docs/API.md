# AgroTrack API Documentation

Base URL: `http://localhost:3001/api` (development)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh token to obtain a new access token.

---

## Auth Endpoints

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorToken": "123456"  // Optional, if 2FA enabled
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "LENDER_ADMIN",
      "lenderOrg": {
        "id": "clx456...",
        "name": "Federal Ministry of Agriculture"
      }
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### POST /auth/register/lender

Register a new lender organization.

**Request Body:**
```json
{
  "organizationName": "Federal Ministry of Agriculture",
  "organizationType": "Federal Government Agency",
  "cacNumber": "RC-1234567",
  "firstName": "Emeka",
  "lastName": "Okonkwo",
  "email": "emeka@ministry.gov.ng",
  "phone": "+2348012345678",
  "password": "SecurePass123!"
}
```

### POST /auth/register/borrower

Register a new farmer/borrower.

**Request Body:**
```json
{
  "firstName": "Musa",
  "lastName": "Garba",
  "phone": "+2348098765432",
  "email": "musa@example.com",
  "password": "SecurePass123!",
  "bvn": "12345678901",
  "nin": "12345678901",
  "state": "Kebbi",
  "lga": "Birnin Kebbi",
  "farmSizeHa": 2.5,
  "primaryCrop": "Rice",
  "bankName": "Access Bank",
  "bankAccount": "0123456789",
  "language": "ha"
}
```

### POST /auth/logout

Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

### POST /auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

### GET /auth/me

Get current user profile. **Requires authentication.**

### POST /auth/password/forgot

Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/password/reset

Reset password with code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

---

## Programs Endpoints

### GET /programs

List loan programs. **Requires authentication.**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| status | string | Filter by status (DRAFT, ACTIVE, PAUSED, CLOSED) |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clx789...",
        "name": "CBN Rice Farmers Support Fund 2025",
        "description": "Support fund for rice farmers in Northern Nigeria",
        "interestRate": 9,
        "minAmount": "100000",
        "maxAmount": "2000000",
        "durationMonths": 12,
        "requiredScore": 500,
        "targetCrops": ["Rice"],
        "targetStates": ["Kebbi", "Kano", "Kaduna"],
        "status": "ACTIVE",
        "_count": { "loans": 847 }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### POST /programs

Create a new loan program. **Requires LENDER_ADMIN or LENDER_MANAGER role.**

**Request Body:**
```json
{
  "name": "CBN Rice Farmers Support Fund 2025",
  "description": "Support fund for rice farmers",
  "interestRate": 9,
  "minAmount": 100000,
  "maxAmount": 2000000,
  "durationMonths": 12,
  "requiredScore": 500,
  "targetCrops": ["Rice"],
  "targetStates": ["Kebbi", "Kano"],
  "gracePeriodDays": 30,
  "disbursementType": "TRANCHE",
  "collateralRequired": false
}
```

### GET /programs/:id

Get program details.

### PUT /programs/:id

Update program. **Requires LENDER_ADMIN or LENDER_MANAGER role.**

### POST /programs/:id/toggle-status

Toggle program status (ACTIVE/PAUSED).

### GET /programs/public

List active programs (public endpoint for borrowers).

---

## Applications Endpoints

### GET /applications

List loan applications.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| programId | string | Filter by program |

### POST /applications

Submit a new loan application. **Requires BORROWER role.**

**Request Body:**
```json
{
  "programId": "clx789...",
  "amount": 500000,
  "purpose": "Rice cultivation for 2025 planting season"
}
```

### GET /applications/:id

Get application details.

### POST /applications/:id/submit

Submit draft application.

### POST /applications/:id/withdraw

Withdraw application.

### PATCH /applications/:id/review

Review application. **Requires LENDER_ADMIN or LENDER_MANAGER role.**

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Application approved based on strong FarmScore"
}
```

Or for rejection:
```json
{
  "status": "REJECTED",
  "rejectionReason": "Farm size below minimum requirement"
}
```

---

## Loans Endpoints

### GET /loans

List loans.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | PENDING, ACTIVE, COMPLETED, DEFAULTED |
| programId | string | Filter by program |

### GET /loans/:id

Get loan details with disbursements and repayments.

---

## Disbursements Endpoints

### GET /disbursements

List disbursements.

### GET /disbursements/:id

Get disbursement details.

### POST /disbursements/:id/approve

Approve a pending disbursement. **Requires LENDER_ADMIN or LENDER_MANAGER role.**

### POST /disbursements/:id/process

Process approved disbursement (trigger payment).

---

## Repayments Endpoints

### GET /repayments

List repayments.

### POST /repayments/:id/record

Record a repayment.

**Request Body:**
```json
{
  "amount": 85000,
  "method": "BANK_TRANSFER"
}
```

**Payment Methods:** `BANK_TRANSFER`, `CARD`, `USSD`, `MOBILE_MONEY`, `CASH`

---

## Borrowers Endpoints

### GET /borrowers

List borrowers. **Requires lender role.**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| state | string | Filter by state |
| tier | string | FarmScore tier (EXCELLENT, GOOD, FAIR, POOR, VERY_POOR) |
| search | string | Search by name or farmer ID |

### GET /borrowers/:id

Get borrower profile with loans and FarmScore history.

---

## FarmScore Endpoints

### GET /farm-score/:borrowerId

Get borrower's FarmScore with breakdown.

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 815,
    "tier": "EXCELLENT",
    "breakdown": {
      "repaymentHistory": 255,
      "farmProductivity": 212,
      "creditUtilization": 170,
      "reportConsistency": 85,
      "cooperativeMembership": 68,
      "yearsExperience": 25
    },
    "nextTierThreshold": null,
    "percentile": 88
  }
}
```

### POST /farm-score/:borrowerId/recalculate

Trigger FarmScore recalculation.

---

## Farm Reports Endpoints

### GET /farm-reports

List farm reports.

### POST /farm-reports

Submit a farm report. **Requires BORROWER role.**

**Request Body:**
```json
{
  "loanId": "clx123...",
  "growthStage": "VEGETATIVE",
  "healthStatus": "Healthy",
  "estimatedYield": 3.5,
  "challenges": "Minor pest issues",
  "photoUrls": ["https://s3.../photo1.jpg"],
  "latitude": 12.4567,
  "longitude": 4.1234
}
```

**Growth Stages:** `PLANTING`, `GERMINATION`, `VEGETATIVE`, `FLOWERING`, `FRUITING`, `HARVEST`, `POST_HARVEST`

### GET /farm-reports/:id

Get farm report details.

### PATCH /farm-reports/:id/verify

Verify farm report. **Requires FIELD_AGENT or lender role.**

**Request Body:**
```json
{
  "status": "VERIFIED",
  "verificationNotes": "Report verified during field visit"
}
```

---

## Field Agents Endpoints

### GET /field-agents

List field agents.

### POST /field-agents

Register a new field agent. **Requires LENDER_ADMIN role.**

### GET /field-visits

List field visits.

### POST /field-visits

Schedule a field visit.

### PATCH /field-visits/:id/complete

Complete a field visit with report.

---

## Cooperatives Endpoints

### GET /cooperatives

List cooperatives.

### POST /cooperatives

Create a cooperative. **Requires lender role.**

### GET /cooperatives/:id

Get cooperative details with members.

### POST /cooperatives/:id/members

Add member to cooperative.

### DELETE /cooperatives/:id/members/:memberId

Remove member from cooperative.

---

## Notifications Endpoints

### GET /notifications

List notifications for current user.

### PATCH /notifications/:id/read

Mark notification as read.

### PATCH /notifications/read-all

Mark all notifications as read.

---

## Documents Endpoints

### POST /documents/upload-url

Get presigned URL for document upload.

**Request Body:**
```json
{
  "fileName": "land-title.pdf",
  "fileType": "application/pdf",
  "documentType": "LAND_TITLE"
}
```

**Document Types:** `ID_CARD`, `BVN_SLIP`, `UTILITY_BILL`, `FARM_PHOTO`, `LAND_TITLE`, `BANK_STATEMENT`, `COOPERATIVE_CERT`, `OTHER`

### GET /documents

List documents for an entity.

---

## Reports Endpoints

### POST /reports/generate

Generate a report. **Requires lender role.**

**Request Body:**
```json
{
  "type": "PORTFOLIO_SUMMARY",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "format": "PDF"
}
```

**Report Types:** `PORTFOLIO_SUMMARY`, `DISBURSEMENT_REPORT`, `REPAYMENT_REPORT`, `DEFAULT_ANALYSIS`, `FARMSCORE_DISTRIBUTION`

### GET /reports

List generated reports.

### GET /reports/:id/download

Download report file.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

API requests are rate limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

---

## WebSocket Events

Connect to `ws://localhost:3001` with authentication:

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: accessToken }
});
```

### Events

| Event | Description |
|-------|-------------|
| `notification` | New notification |
| `loan:updated` | Loan status changed |
| `application:updated` | Application status changed |
| `disbursement:processed` | Disbursement completed |
| `repayment:received` | Repayment recorded |
| `farm-score:updated` | FarmScore recalculated |

### Rooms

Join rooms for targeted updates:
```javascript
socket.emit('join', 'lender:clx123...');  // Lender updates
socket.emit('join', 'borrower:clx456...'); // Borrower updates
```
