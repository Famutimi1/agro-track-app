# AgroTrack

Agricultural loan and grant management platform built for Nigeria, designed to bring full accountability, transparency, and intelligence to farming finance.

## Overview

AgroTrack connects lenders, borrowers (farmers), and field agents in one transparent platform with:

- **Real-Time Portfolio Map** - GPS-tracked farm locations across Nigeria
- **Layered Disbursement** - Release funds in tranches tied to verified farm activity
- **FarmScore Credit Engine** - Agricultural credit scoring (0-850) for smallholder farmers
- **Field Agent Network** - Ground-level verification with offline support
- **USSD & WhatsApp Access** - Multi-channel access for rural farmers
- **AI-Powered Risk Analysis** - Default prediction and crop monitoring

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Auth**: JWT (access + refresh tokens)
- **Storage**: AWS S3
- **Payments**: Paystack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Project Structure

```
agro-track-app/
├── backend/                 # Express.js API server
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers & utilities
│   │   └── validators/     # Zod schemas
│   └── package.json
│
├── frontend/               # Next.js application
│   ├── app/               # App Router pages
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (borrower)/    # Farmer dashboard
│   │   └── (lender)/      # Lender dashboard
│   ├── components/        # React components
│   ├── lib/               # Utilities, API client, stores
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm (recommended) or npm

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/agro-track-app.git
cd agro-track-app
```

2. **Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agrotrack"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="agrotrack-uploads"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_xxx"

# App
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## User Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Platform administrator |
| `LENDER_ADMIN` | Lender organization admin |
| `LENDER_MANAGER` | Program manager |
| `LENDER_VIEWER` | Read-only lender access |
| `LENDER_ANALYST` | Analytics and reporting |
| `BORROWER` | Farmer/loan recipient |
| `FIELD_AGENT` | Ground verification agent |
| `FIELD_SUPERVISOR` | Field agent supervisor |
| `COOP_CHAIR` | Cooperative chairperson |

## Core Features

### For Lenders
- Create and manage loan programs
- Review and approve applications
- Track disbursements in layers/tranches
- Monitor portfolio with geospatial map
- Generate compliance reports
- Manage field agent network

### For Borrowers (Farmers)
- Register with BVN/NIN verification
- Discover eligible programs
- Apply for loans
- Submit farm reports with photos
- Track FarmScore
- Make repayments via multiple channels

### For Field Agents
- Register farmers in remote areas
- GPS-map farm boundaries
- Conduct verification visits
- Submit reports offline (sync later)
- Earn per verified farmer

## API Documentation

See [backend/docs/API.md](backend/docs/API.md) for full API documentation.

### Key Endpoints

```
POST   /api/auth/login              # Login
POST   /api/auth/register/lender    # Register lender org
POST   /api/auth/register/borrower  # Register farmer

GET    /api/programs                # List programs
POST   /api/programs                # Create program
GET    /api/programs/:id            # Get program details

POST   /api/applications            # Submit application
GET    /api/applications            # List applications
PATCH  /api/applications/:id/review # Review application

GET    /api/loans                   # List loans
GET    /api/disbursements           # List disbursements
POST   /api/repayments              # Record repayment

GET    /api/farm-score/:borrowerId  # Get FarmScore
POST   /api/farm-reports            # Submit farm report
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend type check
cd frontend
npm run type-check
```

## Deployment

### Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - AgroTrack Technologies Ltd.

## Support

- Email: support@agrotrack.ng
- Phone: +234 909 000 0000
- Documentation: https://docs.agrotrack.ng
