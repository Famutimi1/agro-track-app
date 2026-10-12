# Admin Console — Integration & Gap Analysis

_Audit date: 2026-07-31 · Scope: `frontend/app/admin/**` against `backend/src/{routes,controllers,services}/admin.*`_

## Legend
- ✅ **Integrated** — calls a real endpoint backed by live DB data
- 🟡 **Partial** — wired, but has a stub/approximation or a missing action
- 🔴 **Not integrated** — mock/hardcoded, or UI element that does nothing

---

## 1. Page-by-page status

### Overview — `admin/overview/page.tsx` ✅
- **Data:** `getStats`, `getGrowthAnalytics(6)`, `getRevenueStats`, plus needs-attention counts (`getTickets`, `getLenders` PENDING/SUSPENDED, `getAuditLog`). All real endpoints.
- **Gaps:** none functional. Growth/revenue are real DB aggregates.

### User Management — `admin/users/page.tsx` ✅
- **Data:** `getUsers` (paginated), row action `setUserStatus` (activate/deactivate) with self/last-super-admin guards. Fully wired + audit-logged.
- **Minor:** status filter is applied **client-side within the current page only** (`filtered` on line ~63), so "Inactive" can show fewer rows than exist platform-wide. Backend `getUsers` has no `isActive` filter param.

### Lender Accounts — `admin/lender-accounts/page.tsx` ✅
- **Data:** `getLenders` (paginated), Manage modal → `setLenderStatus` + `changeLenderPlan`. Wired + audit-logged.
- **Gaps:** no status/plan **filter** controls in the UI (backend already supports `?status=` & `?plan=`). No lender **detail view** (drill into programs/users/borrowers).

### Role Management — `admin/roles/page.tsx` 🟡
- **Data:** `getUsers` + `changeUserRole` (with self-demotion / last-super-admin guards). Wired + audit-logged.
- **Gaps:**
  - **No pagination** — still hard-capped at `limit: 50` (line 43). This is the one list page that never got the `<Pagination>` treatment.
  - **Heavy overlap with User Management** — both pages list all users and filter by role; Roles only adds "change role", Users only adds "activate/deactivate". These should arguably be **one page** with both actions, or Roles should become a distinct "permissions matrix" view.

### Platform Analytics — `admin/analytics/page.tsx` ✅ (single-source)
- **Data:** `getGrowthAnalytics(12)` → 4 charts (lenders, revenue, farmers, loans). Real DB time-buckets.
- **Gaps:** every chart is driven by the **same one endpoint**. No date-range picker, no per-lender/segment breakdown, no export. "Revenue" here is monthly disbursement volume, not fee revenue (see Billing note).

### Support Tickets — `admin/support-tickets/page.tsx` 🟡
- **Data:** `getTickets` (paginated, status/priority filters), Manage modal → `updateTicket` (status only). Wired + audit-logged.
- **Gaps:**
  - **No reply/comment/messaging** — an admin can change status but cannot respond to the user. There is no ticket-thread model or endpoint (`supportTicket.update` is the only write in the backend).
  - **No priority/assignee edit**, no ticket **detail view** (body is shown inline only).
  - Tickets can only be **read/updated**, never created from admin (creation lives on the user side).

### Feature Flags — `admin/feature-flags/page.tsx` ✅
- **Data:** `getFeatureFlags` + `toggleFeatureFlag` (optimistic, revert-on-error). Fully wired.
- **Gaps:** toggle is **not audit-logged** in the service (`toggleFeatureFlag` on service line 78 has no `auditLog.create`, unlike every other mutation). No create/edit/delete of flags, no targeting/rollout %.

### System Health — `admin/system-health/page.tsx` 🟡
- **Data:** `getSystemHealth` — **real** DB probe (`SELECT 1` + measured latency) and process uptime. Not mocked.
- **Gaps:** only **2 services** are actually probed (Database + "API Gateway" which is hardcoded Operational). No checks for Redis/cache, email/SMS provider, storage, queue, or external APIs. No historical uptime, no incident log. Not auto-refreshing (manual Refresh button only).

### Billing & Revenue — `admin/billing/page.tsx` 🟡
- **Data:** `getRevenueStats` — MRR/ARR/breakdown/plan-distribution. **Wired**, but see below.
- **Gaps (backend approximation):** the service **synthesizes** revenue from disbursement/repayment volume with fixed ratios (service lines ~488–493: `SaaS = repaid×0.02`, `Transaction Fees = disbursed×0.01`, etc.) because "the platform does not yet model fee lines." So MRR/ARR are **derived estimates, not booked revenue**. There is no invoices/subscriptions/payments model. No invoice list, no per-lender billing, no payment history, no export.

### Security & Audit — `admin/security/page.tsx` ✅
- **Data:** `getAuditLog` (paginated + action/resource filters). Real DB. Client-side severity classification.
- **Gaps:** severity is **inferred from the action string** client-side (keyword match), not stored. No CSV export, no per-actor drill-down, no date-range filter, no active-session/login-history view.

### Admin Settings — `admin/platform-settings/page.tsx` ✅
- **Data:** `getSettings` / `updateSettings` (upsert + audit-logged, whitelisted keys). Fully wired.
- **Gaps:** `defaultCurrency` is disabled (display-only). No settings beyond the 8 defaults.

### Layout / chrome — `layout.tsx`, `admin-sidebar.tsx`, `admin-topbar.tsx` 🔴 (cosmetic)
- **Topbar search box** (`admin-topbar.tsx:25`) — renders but has **no handler**; typing does nothing.
- **Notification bell** (`admin-topbar.tsx:44`) — hardcoded badge count **"3"**, no dropdown, no data.
- **Sidebar footer** (`admin-sidebar.tsx:76`) — hardcoded **"Super Admin / admin@agrotrack.ng"** instead of the real logged-in user.

---

## 2. Backend endpoints — all consumed?

Every route in `admin.routes.ts` **is** consumed by a page:

| Endpoint | Consumer |
|---|---|
| `GET /stats` | Overview |
| `GET /lenders` · `PATCH /lenders/:id/status` · `/plan` | Lender Accounts, Overview |
| `GET /tickets` · `PATCH /tickets/:id` | Support Tickets, Overview |
| `GET /feature-flags` · `PATCH /feature-flags/:id/toggle` | Feature Flags |
| `GET /audit-log` | Security, Overview |
| `GET /analytics/growth` · `/revenue` | Analytics, Billing, Overview |
| `GET /system-health` | System Health |
| `GET/PATCH /settings` | Platform Settings |
| `GET /users` · `PATCH /users/:id/role` · `/status` | Users, Roles |

**No dead endpoints.** The mismatch is the reverse — the UI wants things the backend can't yet provide (below).

---

## 3. Missing endpoints (UI needs data backend doesn't provide)

1. **Ticket replies** — no message/thread model → admins can't respond to users.
2. **Feature-flag audit** — `toggleFeatureFlag` skips `auditLog.create` (inconsistent with all other mutations).
3. **User `isActive` filter** — `getUsers` can't filter by status server-side (forces client-side, page-local filtering).
4. **Real billing** — no invoices/subscriptions/payments model; revenue is a ratio-based estimate.
5. **Notifications feed** — bell is hardcoded; no admin notifications endpoint.
6. **Lender/user detail** — no single-record GET for a drill-down view.

---

## 4. Data models that exist but have NO admin surface

The Prisma schema has rich models the admin console never exposes:

- **`Broadcast` + `MessageTemplate`** → an admin **Announcements / Messaging** page (send platform-wide notices, manage templates).
- **`Webhook` + `ApiKey`** → a **Developer / Integrations** page (issue keys, manage webhooks).
- **`Transaction`** → a **Transactions / Ledger** page (real financial records — would make Billing genuine).
- **`Document` + `VerificationStatus`** → a **Verification / KYC queue** (approve lender/borrower docs — pairs with lender `PENDING` status).
- **`WeatherAlert`** → an **Alerts** admin view.
- **`SystemConfig`** → extends Platform Settings with typed config.
- **`Notification` / `NotificationPreference`** → back the topbar bell.

---

## 5. Recommended additions (priority order)

**Quick wins (backend tweaks already-shaped):**
1. Add `auditLog.create` to `toggleFeatureFlag` — 3 lines, closes an audit hole.
2. Add pagination to **Role Management** (the only list page still capped at 50).
3. Add `isActive` filter to `getUsers` + a real status filter on Users page.
4. Add status/plan **filter controls** to Lender Accounts (backend already supports them).
5. Wire the sidebar footer + user-menu to the **real logged-in admin** (kill the hardcoded "Super Admin").

**Medium (new endpoints, high value):**
6. **Ticket replies** — add a `TicketMessage` model + `POST /tickets/:id/reply`; turn Support Tickets into a real conversation view.
7. **Verification / KYC queue** — surface `Document`/`VerificationStatus`; connect to lender `PENDING` approval.
8. **Admin notifications** — back the topbar bell with `Notification`; add a dropdown.
9. **Lender detail page** — drill into one org (programs, users, borrowers, disbursed, audit trail).

**Larger (new subsystems):**
10. **Announcements/Broadcast** page (`Broadcast` + `MessageTemplate`).
11. **Real Billing** — model invoices/subscriptions, replace the ratio-based revenue estimate.
12. **Integrations** page (`ApiKey` + `Webhook`).
13. **Merge/redesign Roles + Users** into one identity page (or make Roles a permissions matrix).

---

## Summary

The admin console is **substantially integrated** — 8 of 11 pages are fully live against real DB aggregates, and there are **no dead/unused endpoints**. The real gaps are:

- **3 cosmetic stubs** in the chrome (topbar search, bell badge, sidebar identity).
- **2 approximations** flagged honestly in the backend (billing revenue is ratio-derived; system-health probes only 2 services).
- **1 audit inconsistency** (feature-flag toggle not logged).
- **1 missing pagination** (Roles).
- **1 functional gap** (tickets have no reply path).
- A set of **existing data models with no admin UI** (broadcasts, webhooks/API keys, transactions, KYC documents) that are the highest-leverage new pages to add.
