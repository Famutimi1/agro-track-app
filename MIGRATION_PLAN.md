# AgroTrack — Next.js Migration Plan

## Current State

Three monolithic JSX files totalling ~6,741 lines with all inline styles:

| File | Lines | Contains |
|------|-------|----------|
| `agrotrack-full (5).jsx` | 3,321 | Lender Dashboard (11 pages + modals) |
| `agrotrack-landing-borrower (1).jsx` | 2,671 | Landing page, Auth flows, Borrower Dashboard (7 pages) |
| `agrotrack-admin.jsx` | 749 | Super Admin Panel (9 pages) |

---

## Target Architecture

**Next.js 14 (App Router)** with:
- Tailwind CSS (replacing all inline styles)
- `next-themes` for dark/light mode
- Lucide React (icons — already used)
- Recharts (charts — already used)
- TypeScript (optional, can be added later)
- Inter font via `next/font`

---

## Project Structure

```
agrotrack/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, ThemeProvider)
│   ├── page.tsx                      # Landing page (home)
│   ├── globals.css                   # Tailwind directives + CSS variables
│   │
│   ├── (marketing)/                  # Public pages group
│   │   ├── layout.tsx                # Marketing layout (PublicNav + Footer)
│   │   ├── features/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── testimonials/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── (auth)/                       # Auth pages group
│   │   ├── layout.tsx                # Auth shell layout (centered card)
│   │   ├── login/page.tsx            # Lender login
│   │   ├── signup/page.tsx           # Lender signup (multi-step)
│   │   ├── register/page.tsx         # Borrower registration (multi-step)
│   │   ├── forgot-password/page.tsx
│   │   └── two-factor/page.tsx
│   │
│   ├── (lender)/                     # Lender dashboard group
│   │   ├── layout.tsx                # Sidebar + Topbar layout
│   │   ├── dashboard/page.tsx
│   │   ├── loan-programs/page.tsx
│   │   ├── borrowers/page.tsx
│   │   ├── borrowers/[id]/page.tsx   # Borrower detail
│   │   ├── disbursements/page.tsx
│   │   ├── repayments/page.tsx
│   │   ├── field-agents/page.tsx
│   │   ├── cooperatives/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── map-view/page.tsx
│   │   ├── messages/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (borrower)/                   # Borrower dashboard group
│   │   ├── layout.tsx                # Borrower sidebar + topbar layout
│   │   ├── overview/page.tsx
│   │   ├── my-loans/page.tsx
│   │   ├── farm-reports/page.tsx
│   │   ├── farm-score/page.tsx
│   │   ├── discover/page.tsx
│   │   ├── messages/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── (admin)/                      # Super admin group
│       ├── layout.tsx                # Admin sidebar + topbar layout
│       ├── overview/page.tsx
│       ├── lender-accounts/page.tsx
│       ├── lender-accounts/[id]/page.tsx
│       ├── analytics/page.tsx
│       ├── support-tickets/page.tsx
│       ├── feature-flags/page.tsx
│       ├── system-health/page.tsx
│       ├── billing/page.tsx
│       ├── security/page.tsx
│       └── admin-settings/page.tsx
│
├── components/
│   ├── ui/                           # Reusable primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── toggle.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── score-ring.tsx
│   │   ├── star-rating.tsx
│   │   ├── step-indicator.tsx
│   │   └── status-pill.tsx
│   │
│   ├── layout/                       # Layout components
│   │   ├── lender-sidebar.tsx
│   │   ├── lender-topbar.tsx
│   │   ├── borrower-sidebar.tsx
│   │   ├── borrower-topbar.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-topbar.tsx
│   │   ├── public-nav.tsx
│   │   └── footer.tsx
│   │
│   ├── charts/                       # Chart wrappers (client components)
│   │   ├── line-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── pie-chart.tsx
│   │   └── area-chart.tsx
│   │
│   ├── modals/                       # Modal dialogs
│   │   ├── create-program-modal.tsx
│   │   ├── broadcast-modal.tsx
│   │   └── register-cooperative-modal.tsx
│   │
│   └── theme-provider.tsx            # next-themes provider
│
├── lib/
│   ├── data/                         # Static/mock data
│   │   ├── programs.ts
│   │   ├── borrowers.ts
│   │   ├── agents.ts
│   │   ├── disbursements.ts
│   │   ├── cooperatives.ts
│   │   ├── conversations.ts
│   │   ├── admin-data.ts
│   │   └── landing-data.ts
│   │
│   └── utils.ts                      # Shared helpers (clamp, formatCurrency, etc.)
│
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          green: "#1B5E20",
          "green-light": "#2E7D32",
          gold: "#F9A825",
        },
        // Semantic (used across all dashboards)
        surface: {
          light: "#ffffff",
          dark: "#1f2937",
        },
        // Crop colors
        crop: {
          rice: { bg: "#dcfce7", text: "#166534" },
          cassava: { bg: "#fef3c7", text: "#854d0e" },
          maize: { bg: "#dbeafe", text: "#1e40af" },
          yam: { bg: "#fed7aa", text: "#9a3412" },
          cocoa: { bg: "#d1fae5", text: "#065f46" },
          cashew: { bg: "#fce7f3", text: "#9d174d" },
          tomato: { bg: "#fee2e2", text: "#991b1b" },
          pepper: { bg: "#fef9c3", text: "#713f12" },
          vegetables: { bg: "#d1fae5", text: "#065f46" },
          sorghum: { bg: "#ede9fe", text: "#5b21b6" },
          wheat: { bg: "#e0f2fe", text: "#0c4a6e" },
        },
        // Admin-specific
        admin: {
          bg: { light: "#f8fafc", dark: "#020617" },
          surface: { light: "#ffffff", dark: "#0f172a" },
          border: { light: "#e2e8f0", dark: "#1e293b" },
          text: { light: "#0f172a", dark: "#f8fafc" },
          muted: { light: "#64748b", dark: "#94a3b8" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Dark/Light Mode Strategy

Using `next-themes` with Tailwind's `class` strategy:

```tsx
// components/theme-provider.tsx
"use client";
import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemes>
  );
}
```

**CSS Variables approach** in `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #f0fdf4;
    --surface: #ffffff;
    --border: #e5e7eb;
    --text: #111827;
    --muted: #6b7280;
    --input-bg: #f9fafb;
    --sidebar-bg: #1B5E20;
  }

  .dark {
    --background: #111827;
    --surface: #1f2937;
    --border: #374151;
    --text: #f9fafb;
    --muted: #9ca3af;
    --input-bg: #374151;
    --sidebar-bg: #0f1923;
  }
}
```

Then components use `bg-[var(--background)]` or better — map these to Tailwind utilities via the config.

---

## Migration Phases

### Phase 1: Project Scaffolding
1. Initialize Next.js 14 project with TypeScript, Tailwind, ESLint
2. Configure `tailwind.config.ts` with full color palette
3. Set up `next-themes` and ThemeProvider
4. Configure Inter font via `next/font/google`
5. Set up `globals.css` with CSS variables for theming
6. Install dependencies: `lucide-react`, `recharts`, `next-themes`

### Phase 2: Shared Components (ui/)
Extract reusable primitives from all three files:
1. `badge.tsx` — Status badges, plan badges, crop badges
2. `button.tsx` — Primary, secondary, ghost, icon buttons
3. `card.tsx` — Surface card with border and shadow
4. `input.tsx` — Text input, textarea, select with consistent styling
5. `toggle.tsx` — Dark mode toggle, feature flag toggles
6. `modal.tsx` — Overlay modal container
7. `table.tsx` — Data table with header, rows, pagination
8. `score-ring.tsx` — SVG circular progress (FarmScore)
9. `star-rating.tsx` — 5-star rating for agents
10. `step-indicator.tsx` — Multi-step progress bar
11. `status-pill.tsx` — Active/At Risk/Defaulting/Completed pills

### Phase 3: Layout Components
1. `public-nav.tsx` — Landing page fixed navbar
2. `footer.tsx` — Landing page footer
3. `lender-sidebar.tsx` — Green sidebar with 11 nav items
4. `lender-topbar.tsx` — Search, theme toggle, notifications, action button
5. `borrower-sidebar.tsx` — Borrower portal sidebar (7 items)
6. `borrower-topbar.tsx` — Borrower header bar
7. `admin-sidebar.tsx` — Admin sidebar (dark theme, 9 items)
8. `admin-topbar.tsx` — Admin header bar

### Phase 4: Data Layer
Extract all mock data into `lib/data/` files:
1. `programs.ts` — 6 loan programs
2. `borrowers.ts` — 10 borrowers + crop colors
3. `agents.ts` — 6 field agents
4. `disbursements.ts` — 7 disbursement records
5. `cooperatives.ts` — Cooperative data
6. `conversations.ts` — Messages + chat messages
7. `admin-data.ts` — Platform metrics, lenders, tickets, flags, services
8. `landing-data.ts` — Features, steps, testimonials, pricing, markets, stats

### Phase 5: Landing & Marketing Pages
1. Landing home page (hero, features grid, steps, testimonials, pricing, CTA)
2. Features deep-dive page
3. How It Works page
4. Pricing page with FAQ
5. Testimonials page
6. Contact page with form

### Phase 6: Auth Pages
1. Lender login (email/password + social options)
2. Lender signup (5-step wizard)
3. Borrower registration (5-step wizard with language selection)
4. Forgot password (4-step: email → OTP → new password → success)
5. Two-factor auth (3 methods: app, SMS, email)

### Phase 7: Lender Dashboard Pages
1. Dashboard — KPI cards, line chart, pie chart, bar chart, activity feed, at-risk table
2. Loan Programs — Program cards, filters, CreateProgramModal (6-step)
3. Borrowers — Table with search/filter, BorrowerDetail (5 tabs)
4. Disbursements — Table with bulk approve/reject
5. Repayments — Repayment tracking table
6. Field Agents — Agent cards, performance stats, tasks
7. Cooperatives — Coop cards, detail view, registration form
8. Reports — Report generation cards
9. Map View — Nigeria SVG map with borrower dots
10. Messages — Conversation list + chat + broadcast modal
11. Settings — Tabbed settings (org, notifications, users, security, billing)

### Phase 8: Borrower Dashboard Pages
1. Overview — KPI cards, loan chart, FarmScore ring, layers, activity feed
2. My Loans — Active loan details, repayment schedule
3. Farm Reports — Submit form, report history
4. FarmScore — Score breakdown, history chart, tips
5. Discover — Browse available programs
6. Messages — Chat with lender
7. Settings — Profile, notifications, language, bank details

### Phase 9: Admin Dashboard Pages
1. Overview — Platform KPIs, growth chart, revenue pie, system health summary
2. Lender Accounts — Table + detail view with feature flags and billing
3. Platform Analytics — Charts and metrics
4. Support Tickets — Ticket list + conversation view
5. Feature Flags — Toggle grid
6. System Health — Service uptime cards with charts
7. Billing & Revenue — Revenue breakdown
8. Security & Audit — Audit logs
9. Admin Settings — Platform configuration

### Phase 10: Chart Components (client-only)
Wrap Recharts in `"use client"` components:
1. `line-chart.tsx` — Disbursement vs Repayment, Score History, Growth
2. `bar-chart.tsx` — State Repayment Rate, Loan History
3. `pie-chart.tsx` — Portfolio by Crop, Revenue Breakdown
4. `area-chart.tsx` — Platform growth curves

---

## Inline Style → Tailwind Mapping

Key patterns to convert:

| Inline Style | Tailwind Class |
|---|---|
| `background: dark?"#1f2937":"#ffffff"` | `bg-white dark:bg-gray-800` |
| `color: dark?"#f9fafb":"#111827"` | `text-gray-900 dark:text-gray-50` |
| `border: 1px solid ${borderC}` | `border border-gray-200 dark:border-gray-700` |
| `borderRadius: 16` | `rounded-2xl` |
| `padding: 20` | `p-5` |
| `fontSize: 13` | `text-sm` |
| `fontWeight: 600` | `font-semibold` |
| `display:"flex", gap:10` | `flex gap-2.5` |
| `gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))"` | `grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]` |
| `transition:"width 0.25s"` | `transition-[width] duration-300` |
| `linear-gradient(135deg,#1B5E20,#2E7D32)` | `bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]` |

---

## Color Token Reference

### Lender Dashboard Theme
| Token | Light | Dark |
|-------|-------|------|
| Background | `#f0fdf4` | `#111827` |
| Surface | `#ffffff` | `#1f2937` |
| Border | `#e5e7eb` | `#374151` |
| Text | `#111827` | `#f9fafb` |
| Muted | `#6b7280` | `#9ca3af` |
| Input BG | `#f9fafb` | `#374151` |
| Sidebar | `#1B5E20` | `#0f1923` |

### Admin Dashboard Theme
| Token | Light | Dark |
|-------|-------|------|
| Background | `#f8fafc` | `#020617` |
| Surface | `#ffffff` | `#0f172a` |
| Border | `#e2e8f0` | `#1e293b` |
| Text | `#0f172a` | `#f8fafc` |
| Muted | `#64748b` | `#94a3b8` |
| Sidebar | `#0f172a` | `#020617` |

### Brand Constants
| Name | Value | Usage |
|------|-------|-------|
| Primary Green | `#1B5E20` | Sidebar, primary buttons, brand |
| Light Green | `#2E7D32` | Gradients, hover states |
| Gold/Amber | `#F9A825` | Accent, highlights, logo |
| Success | `#16a34a` | Active status, positive trends |
| Warning | `#d97706` | At-risk, caution badges |
| Danger | `#dc2626` | Defaults, errors, alerts |
| Info | `#2563eb` | Informational, secondary |
| Purple | `#7c3aed` | Premium features, layers |

---

## Key Design Decisions

1. **Route groups** `(marketing)`, `(auth)`, `(lender)`, `(borrower)`, `(admin)` share layouts without affecting URL paths.

2. **Charts are client components** — wrapped with `"use client"` directive since Recharts requires browser APIs.

3. **State management** — Start with React state + URL params. No global state library needed initially (the app uses only `useState` currently).

4. **Data layer** — Keep mock data in `lib/data/` as typed constants. When a real API is added later, these become the type definitions.

5. **Component extraction** — Identify shared patterns (KPI card, status badge, score ring) that appear across lender, borrower, AND admin dashboards, and build them once.

6. **Responsive design** — The original uses fixed pixel widths. During migration, convert grid layouts to responsive Tailwind grid/flex utilities.

7. **Theme per section** — Lender and Borrower share the same green theme. Admin uses a distinct blue-slate theme. Handle via CSS variables scoped per layout.

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0",
    "next-themes": "^0.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 (these are foundational)
     ↓
Phase 5 (Landing) + Phase 6 (Auth) — can run in parallel
     ↓
Phase 7 (Lender) — largest, do page by page
     ↓
Phase 8 (Borrower) — reuses many ui/ components from Phase 7
     ↓
Phase 9 (Admin) — mostly independent
     ↓
Phase 10 (Charts) — extract as reusable during Phase 7, finalize here
```

---

## Notes

- The design must remain visually identical — same colors, spacing, fonts, shadows, border-radius values.
- Every inline `style={{...}}` becomes Tailwind classes. Where Tailwind doesn't have an exact utility (e.g., very specific px values), use arbitrary values like `p-[18px]` or `rounded-[16px]`.
- Dark mode classes like `dark:bg-gray-800` replace all ternary `dark?"#1f2937":"#ffffff"` patterns.
- The Nigeria map SVG in Map View needs to be kept as an inline SVG component or imported from a file.
- Multi-step forms (CreateProgram 6-step, LenderSignup 5-step, BorrowerRegister 5-step) each become a single page with step state, not separate routes.
