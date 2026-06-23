# AgroTrack Backend

Express.js API server for the AgroTrack agricultural loan management platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Storage**: AWS S3
- **Payments**: Paystack

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
│
├── src/
│   ├── config/           # Configuration
│   │   ├── prisma.ts     # Prisma client
│   │   ├── redis.ts      # Redis client
│   │   └── socket.ts     # Socket.IO setup
│   │
│   ├── controllers/      # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── program.controller.ts
│   │   ├── application.controller.ts
│   │   └── ...
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── validate.ts   # Request validation
│   │   ├── rbac.ts       # Role-based access control
│   │   └── error.ts      # Error handling
│   │
│   ├── routes/           # API routes
│   │   ├── index.ts      # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── program.routes.ts
│   │   └── ...
│   │
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── program.service.ts
│   │   ├── farm-score.service.ts
│   │   └── ...
│   │
│   ├── utils/            # Utilities
│   │   ├── api-error.ts  # Custom error class
│   │   ├── pagination.ts # Pagination helpers
│   │   └── async-handler.ts
│   │
│   ├── validators/       # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── program.schema.ts
│   │   └── ...
│   │
│   ├── __tests__/        # Test files
│   │
│   └── index.ts          # App entry point
│
├── docs/
│   └── API.md            # API documentation
│
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/agrotrack"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="agrotrack-uploads"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_xxx"
PAYSTACK_PUBLIC_KEY="pk_test_xxx"

# SMS (Termii)
TERMII_API_KEY="your-termii-key"
TERMII_SENDER_ID="AgroTrack"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@agrotrack.ng"
```

## Available Scripts

```bash
npm run dev       # Start with hot reload (ts-node-dev)
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run tests
npm run migrate   # Run Prisma migrations
npm run seed      # Seed database
```

## Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| User | User accounts (all roles) |
| LenderOrganization | Lending institutions |
| Program | Loan programs |
| BorrowerProfile | Farmer profiles |
| Application | Loan applications |
| BorrowerLoan | Active loans |
| Disbursement | Fund releases (tranches) |
| Repayment | Loan repayments |
| FarmReport | Farm activity reports |
| FarmScoreHistory | Score change log |
| FieldAgentProfile | Field agent data |
| FieldVisit | Agent visit records |
| Cooperative | Farmer cooperatives |

### Enums

```prisma
enum Role {
  SUPER_ADMIN
  LENDER_ADMIN
  LENDER_MANAGER
  LENDER_VIEWER
  LENDER_ANALYST
  BORROWER
  FIELD_AGENT
  FIELD_SUPERVISOR
  COOP_CHAIR
}

enum LoanStatus {
  PENDING
  ACTIVE
  COMPLETED
  DEFAULTED
  CANCELLED
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  WITHDRAWN
}

enum DisbursementStatus {
  PENDING
  APPROVED
  PROCESSING
  COMPLETED
  FAILED
}
```

## Authentication

### JWT Tokens

- **Access Token**: Short-lived (15 min), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Token Payload

```typescript
{
  userId: string;
  role: Role;
  lenderId?: string;  // For lender users
  iat: number;
  exp: number;
}
```

### Middleware Usage

```typescript
import { authenticate, requireRole } from './middleware/auth';

// Require authentication
router.get('/profile', authenticate, getProfile);

// Require specific role
router.post('/programs', authenticate, requireRole(['LENDER_ADMIN']), createProgram);
```

## FarmScore Engine

The FarmScore is a 0-850 credit score for smallholder farmers:

### Components (Weights)

| Component | Weight | Description |
|-----------|--------|-------------|
| Repayment History | 30% | On-time payment track record |
| Farm Productivity | 25% | Yield and farm reports |
| Credit Utilization | 20% | Loan usage efficiency |
| Report Consistency | 10% | Regular farm reporting |
| Cooperative Membership | 8% | Group affiliation bonus |
| Years of Experience | 7% | Farming experience |

### Tiers

| Tier | Score Range | Benefits |
|------|-------------|----------|
| EXCELLENT | 750-850 | Priority approval, lowest rates |
| GOOD | 650-749 | Standard approval |
| FAIR | 500-649 | May require guarantor |
| POOR | 350-499 | Limited loan amounts |
| VERY_POOR | 0-349 | Requires improvement |

### Calculation

```typescript
import { FarmScoreService } from './services/farm-score.service';

// Recalculate borrower's score
const result = await FarmScoreService.recalculate(borrowerId, "Completed loan");
// { score: 720, tier: "GOOD", components: {...} }
```

## Layered Disbursement

Loans can be disbursed in tranches (layers):

```
Layer 1 (30%) - Land Preparation  → Released on approval
Layer 2 (40%) - Planting/Inputs   → Released after farm report
Layer 3 (30%) - Maintenance       → Released after field visit
```

Each layer requires verification before release:

```typescript
// Approve disbursement (atomic transaction)
await DisbursementService.approve(disbursementId, approvedByUserId);

// Process payment
await DisbursementService.process(disbursementId);
```

## API Endpoints

See [docs/API.md](docs/API.md) for complete API documentation.

### Quick Reference

```
Auth:
POST   /api/auth/login
POST   /api/auth/register/lender
POST   /api/auth/register/borrower
POST   /api/auth/refresh
POST   /api/auth/logout

Programs:
GET    /api/programs
POST   /api/programs
GET    /api/programs/:id
PUT    /api/programs/:id

Applications:
GET    /api/applications
POST   /api/applications
PATCH  /api/applications/:id/review

Loans:
GET    /api/loans
GET    /api/loans/:id

Disbursements:
GET    /api/disbursements
POST   /api/disbursements/:id/approve
POST   /api/disbursements/:id/process

Repayments:
GET    /api/repayments
POST   /api/repayments/:id/record

FarmScore:
GET    /api/farm-score/:borrowerId
POST   /api/farm-score/:borrowerId/recalculate
```

## Error Handling

Custom ApiError class for consistent error responses:

```typescript
import { ApiError } from './utils/api-error';

// Throw errors in services/controllers
throw ApiError.notFound('Program not found');
throw ApiError.badRequest('Invalid amount');
throw ApiError.forbidden('Access denied');
throw ApiError.unauthorized('Invalid token');
```

Response format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Program not found"
  }
}
```

## Validation

Request validation using Zod:

```typescript
// validators/program.schema.ts
export const createProgramSchema = z.object({
  name: z.string().min(2).max(200),
  interestRate: z.number().min(0).max(100),
  maxAmount: z.number().positive(),
  minAmount: z.number().positive(),
  durationMonths: z.number().int().positive(),
});

// routes/program.routes.ts
router.post('/', validate(createProgramSchema), createProgram);
```

## WebSocket Events

Real-time updates via Socket.IO:

```typescript
// Server-side emission
io.to(`lender:${lenderId}`).emit('application:updated', {
  applicationId,
  status: 'APPROVED'
});

// Room management
socket.join(`borrower:${userId}`);
socket.join(`lender:${lenderId}`);
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.service.test.ts
```

Test structure:

```typescript
describe('AuthService', () => {
  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const hash = await bcrypt.hash('password', 10);
      expect(hash).not.toBe('password');
    });
  });
});
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/agrotrack
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: agrotrack
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

volumes:
  pgdata:
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ chars)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure logging (Winston/Pino)
- [ ] Set up monitoring (PM2/Docker health checks)
- [ ] Rate limiting configured
- [ ] Security headers (Helmet.js)
