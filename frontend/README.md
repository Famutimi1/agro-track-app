# AgroTrack Frontend

Next.js 14 application for the AgroTrack agricultural loan management platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (client state) + React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   ├── signup/        # Lender registration
│   │   ├── register/      # Borrower registration
│   │   └── forgot-password/
│   ├── (borrower)/        # Borrower dashboard
│   │   ├── overview/
│   │   ├── loans/
│   │   ├── farm-reports/
│   │   ├── farm-score/
│   │   └── programs/
│   ├── (lender)/          # Lender dashboard
│   │   ├── dashboard/
│   │   ├── programs/
│   │   ├── applications/
│   │   ├── borrowers/
│   │   ├── disbursements/
│   │   ├── repayments/
│   │   └── reports/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/
│   ├── auth/              # Auth guards
│   ├── layout/            # Sidebars, topbars
│   ├── ui/                # Reusable UI components
│   └── [feature]/         # Feature-specific components
│
├── lib/
│   ├── api/               # API client & endpoints
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── socket/            # WebSocket client
│   └── utils/             # Utility functions
│
├── public/                # Static assets
└── styles/               # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # TypeScript type checking
```

## Authentication

Authentication uses JWT tokens with automatic refresh:

- **Access Token**: 15 minutes expiry, stored in localStorage
- **Refresh Token**: 7 days expiry, used to obtain new access tokens

### Auth Guards

Route protection is handled by auth guard components:

```tsx
import { LenderGuard, BorrowerGuard, AuthGuard } from '@/components/auth';

// Protect lender routes
<LenderGuard>
  <LenderDashboard />
</LenderGuard>

// Protect borrower routes
<BorrowerGuard>
  <BorrowerDashboard />
</BorrowerGuard>

// Custom role protection
<AuthGuard allowedRoles={['SUPER_ADMIN', 'LENDER_ADMIN']}>
  <AdminPanel />
</AuthGuard>
```

## State Management

### Zustand Stores

```typescript
// Auth store
import { useAuthStore } from '@/lib/stores';

const { user, login, logout, isAuthenticated } = useAuthStore();

// Notifications store
import { useNotificationsStore } from '@/lib/stores';

const { notifications, unreadCount, markAsRead } = useNotificationsStore();
```

### React Query

Server state is managed with React Query via custom hooks:

```typescript
// Fetch programs
const { data, isLoading } = usePrograms({ status: 'ACTIVE' });

// Fetch single program
const { data: program } = useProgram(programId);

// Create application
const mutation = useCreateApplication();
mutation.mutate({ programId, amount: 500000 });
```

## API Client

The API client handles authentication, token refresh, and error handling:

```typescript
import { api } from '@/lib/api';

// GET request
const response = await api.get('/programs');

// POST request
const response = await api.post('/applications', {
  programId: 'xxx',
  amount: 500000
});
```

## WebSocket Integration

Real-time updates via Socket.IO:

```typescript
import { initSocket, subscribeToEvent } from '@/lib/socket';

// Initialize connection (done automatically on login)
initSocket();

// Subscribe to events
const unsubscribe = subscribeToEvent('notification', (data) => {
  console.log('New notification:', data);
});

// Cleanup
unsubscribe();
```

## UI Components

### Core Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary button with variants |
| `Input` | Form input with validation |
| `Card` | Content container |
| `Badge` | Status indicators |
| `Modal` | Dialog overlay |
| `Table` | Data tables with sorting |
| `Chart` | Recharts wrappers |

### Usage Example

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

<Card className="p-6">
  <Input
    placeholder="Enter amount"
    type="number"
    {...register('amount')}
  />
  <Button onClick={handleSubmit}>
    Submit Application
  </Button>
</Card>
```

## Styling

Tailwind CSS with custom theme variables:

```css
/* CSS variables for theming */
:root {
  --background: #f0fdf4;
  --surface: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --brand-green: #1B5E20;
  --brand-gold: #F9A825;
}

.dark {
  --background: #111827;
  --surface: #1f2937;
  --text: #f9fafb;
  --muted: #9ca3af;
  --border: #374151;
}
```

## Pages Overview

### Auth Pages
- `/login` - User login
- `/signup` - Lender organization registration
- `/register` - Farmer/borrower registration
- `/forgot-password` - Password reset flow

### Lender Dashboard
- `/dashboard` - Overview with KPIs and charts
- `/programs` - Manage loan programs
- `/applications` - Review loan applications
- `/borrowers` - View borrower profiles
- `/disbursements` - Track fund releases
- `/repayments` - Monitor repayments
- `/reports` - Generate reports

### Borrower Dashboard
- `/overview` - Personal dashboard
- `/loans` - Active loans
- `/farm-reports` - Submit/view reports
- `/farm-score` - FarmScore details
- `/programs` - Discover eligible programs

## Best Practices

### SSR Safety

Always check for browser environment before accessing browser APIs:

```typescript
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  localStorage.setItem('key', 'value');
}
```

### Error Handling

Use the API client's built-in error handling:

```typescript
try {
  await api.post('/applications', data);
} catch (error) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || 'Request failed';
    toast.error(message);
  }
}
```

### Form Validation

Use Zod schemas for form validation:

```typescript
const schema = z.object({
  amount: z.number().min(100000).max(2000000),
  purpose: z.string().min(10).max(500),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.agrotrack.ng/api
NEXT_PUBLIC_WS_URL=https://api.agrotrack.ng
```
