# Admin Console — Executable Task Backlog

_Derived from [admin-console-audit.md](admin-console-audit.md). Each task is self-contained: scope, files, and acceptance criteria. Pick top-down; tiers are ordered by effort × leverage._

Status key: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Tier 1 — Quick wins (small, mostly backend one-liners)

### T1. Audit-log feature-flag toggles `[ ]`
- **Why:** `toggleFeatureFlag` is the only admin mutation with no `auditLog.create` — an audit hole.
- **Files:** `backend/src/services/admin.service.ts` (`toggleFeatureFlag`, ~line 78); controller passes actor.
- **Do:** thread `actor` into the service (mirror `setUserStatus`), add `auditLog.create` with `action:"FEATURE_FLAG_TOGGLED"`, `resource:"FeatureFlag"`, `resourceId:id`, `details:{ key, enabled }`. Update controller to pass `{ id: req.user!.sub, ipAddress, userAgent }`.
- **Accept:** toggling a flag creates an audit row visible on Security page; `tsc` clean.

### T2. Pagination on Role Management `[ ]`
- **Why:** only list page still hard-capped at `limit: 50`.
- **Files:** `frontend/app/admin/roles/page.tsx`.
- **Do:** add `page`/`totalPages` state + `LIMIT=20`, pass `page` to `getUsers`, render `<Pagination>` (component already exists), reset page on filter/search change. Mirror `users/page.tsx`.
- **Accept:** can page past 50 users; Prev/Next disable at ends; `tsc` clean.

### T3. Server-side `isActive` filter on Users `[ ]`
- **Why:** status filter is currently client-side, page-local — "Inactive" hides real rows.
- **Files:** `backend/src/services/admin.service.ts` (`getUsers`), `.../controllers/admin.controller.ts` (`getUsers` query), `frontend/lib/api/admin.ts` (`AdminUsersQuery` + `getUsers`), `frontend/app/admin/users/page.tsx`.
- **Do:** accept optional `isActive` (parse `"active"|"inactive"` → boolean) in `where`; drop the client-side `filtered`, pass `status` to the query, reset page on change.
- **Accept:** selecting Inactive queries the server and paginates correctly; `tsc` clean both sides.

### T4. Status/plan filter controls on Lender Accounts `[ ]`
- **Why:** backend already supports `?status=` & `?plan=`; UI has no controls.
- **Files:** `frontend/app/admin/lender-accounts/page.tsx` (+ reuse `LENDER_STATUSES`/`LENDER_PLANS`).
- **Do:** add two `<select>` filters next to search, thread into `getLenders`, reset page on change.
- **Accept:** filtering narrows the list server-side; combines with search + pagination.

### T5. Real identity in admin chrome `[ ]`
- **Why:** sidebar footer + topbar are hardcoded ("Super Admin / admin@agrotrack.ng", bell badge "3").
- **Files:** `frontend/components/layout/admin-sidebar.tsx` (footer), `admin-topbar.tsx` (bell badge).
- **Do:** read the authed user from the existing auth store/hook (whatever `AdminGuard`/user-menu uses) and render real name/email/initials in the sidebar footer. Remove the hardcoded "3" (make it 0/hidden until T9 wires real notifications).
- **Accept:** footer shows the logged-in admin; no hardcoded badge.

---

## Tier 2 — Functional gaps (new endpoints, high value)

### T6. Support ticket replies `[ ]`
- **Why:** admins can change status but can't respond — tickets are a dead-end.
- **Backend:** add `TicketMessage` model (`id, ticketId, authorId, body, createdAt`), migration; `POST /admin/tickets/:id/reply` (create message, optionally bump status to `IN_PROGRESS`, audit-log); extend `getTickets`/add `getTicket(:id)` to include messages.
- **Frontend:** ticket detail/thread in the Manage modal (or a drawer) — list messages + a reply textarea → `adminApi.replyTicket`.
- **Accept:** admin posts a reply, it persists and shows in the thread; audit row created.
- **Note:** needs a migration — confirm before running.

### T7. Verification / KYC queue `[ ]`
- **Why:** `Document` + `VerificationStatus` exist with no admin surface; pairs with lender `PENDING` approval.
- **Backend:** `GET /admin/documents?status=PENDING` (paginated, include owner), `PATCH /admin/documents/:id/verify` (`APPROVED|REJECTED` + reason, audit-log).
- **Frontend:** new page `admin/verification/page.tsx` — queue table, approve/reject modal; sidebar nav item.
- **Accept:** pending docs list; approve/reject updates status + audit; new nav entry.

### T8. Lender detail page `[ ]`
- **Why:** no drill-down from the lender list.
- **Backend:** `GET /admin/lenders/:id` (org + counts + recent programs/users/loans + status/plan history from audit log).
- **Frontend:** `admin/lender-accounts/[id]/page.tsx`; make the row "Manage" (or org name) link through.
- **Accept:** clicking a lender opens a detail view with real sub-data.

### T9. Admin notifications feed `[ ]`
- **Why:** topbar bell is hardcoded.
- **Backend:** reuse `Notification` model — `GET /admin/notifications` (recent, unread count), `PATCH /admin/notifications/:id/read`.
- **Frontend:** bell dropdown in `admin-topbar.tsx` with real count + list; mark-as-read.
- **Accept:** bell shows real unread count; dropdown lists notifications; completes T5.

---

## Tier 3 — New subsystems (larger)

### T10. Announcements / Broadcasts `[ ]`
- Models: `Broadcast` + `MessageTemplate`. New page to compose/send platform-wide notices and manage templates. Endpoints: list/create/send broadcast, CRUD templates. Sidebar nav.

### T11. Transactions ledger `[ ]`
- Model: `Transaction`. Read-only paginated ledger with filters (type/status/date). Makes financial data genuine (feeds real Billing later).

### T12. Real Billing `[ ]`
- Introduce invoice/subscription/payment modeling; replace the ratio-based revenue estimate in `getRevenueStats`. Invoice list + per-lender billing + export. **Largest** — likely its own planning pass.

### T13. Integrations (API keys + webhooks) `[ ]`
- Models: `ApiKey` + `Webhook`. Issue/revoke keys, manage webhook endpoints + delivery log. Sidebar nav.

### T14. Merge/redesign Roles + Users `[ ]`
- Roles and Users overlap (both list users, filter by role). Either merge into one identity page with both role-change and activate/deactivate actions, or repurpose Roles as a permissions matrix. **Decision required** before building.

---

## Suggested order
T1 → T2 → T3 → T4 → T5 (Tier 1, ~one sitting, no migrations) → then T9, T7, T6, T8 (Tier 2) → Tier 3 as scoped separately.

Tasks needing a **DB migration** (confirm first): T6, T7, T10, T12, T13.
Tasks needing a **product decision**: T12 (billing model), T14 (merge strategy).
