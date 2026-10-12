# AgroTrack implementation checkpoint

Updated 12 October 2026. This records the first implementation batch following the application review.

## Database

Applied the existing initialization migration and the new loan-integrity migration to the configured local PostgreSQL database `agro_track` on `localhost:5432`. No database reset was performed. Development seed data was added, and Prisma Client was regenerated.

The new migration makes application-to-loan links and loan/tranche-number combinations unique. Demo seeds now refuse to run with `NODE_ENV=production`.

## Completed in this batch

- Authentication uses HttpOnly, SameSite=Strict cookies, with Secure cookies in production. Tokens are no longer stored in browser localStorage or returned in browser login responses.
- Access tokens are bound to revocable database sessions. Every protected request checks that the session exists and the user remains active, and reads current role/organization membership from the database.
- Refresh credentials are stored as SHA-256 hashes and rotated through a conditional database update. Old credentials cannot be replayed. Logout revokes the session and disconnects its sockets.
- Login handles the actual TOTP challenge and routes lenders, borrowers, agents, and admins to their appropriate workspaces. The cosmetic verification page was removed.
- Login/OTP limit errors reach Express's error handler rather than becoming unhandled async rejections. Password-reset and 2FA requests are validated. OTP generation uses cryptographic randomness.
- Cookie writes require the configured frontend origin. Socket handshakes validate origin/session, and conversation joins require membership.
- Audit logs omit authentication request bodies and redact credentials/identity fields elsewhere. Previous audit entries, if any, were not rewritten.
- Request validation now supports both direct body schemas and structured body/query/params schemas. CUID and seed IDs are accepted by the relevant lending routes.
- Applications, loan reads, disbursement approval/rejection, repayment recording, score recalculation, program reports, and cooperative access enforce borrower/lender ownership. Lenders cannot see unsubmitted drafts.
- Loan approval creates the approved state, one loan, exact-value tranches, and monthly repayment rows in one serializable transaction. Concurrent/repeated review cannot create duplicate loans. Submission rechecks program availability and eligibility; withdrawal uses a conditional state update.
- Repayment recording accumulates partial payments, updates installment and loan balances atomically, and writes a uniquely referenced ledger transaction. A retry with the same payment reference does not charge the balance again; mismatched references and overpayments are rejected.
- Later tranche approvals require a verified report created after the prior completed payment. Third and later tranches also require a subsequent completed field visit. Arbitrary caller-supplied references cannot mark transfers completed.
- The lender dashboard, borrower overview, application creation/lists/details, loan lists/details, tranche approval, and manual received-payment recording now use the API rather than fixture alerts. The query/auth/socket providers are mounted, account changes clear query data, and real sign-out buttons are available.
- Public mobile navigation and home pricing buttons work. Core lender/borrower layouts accommodate narrow viewports. Backend container port/health configuration is aligned and `/api/ready` checks the schema and Redis.
- Authenticated API responses and S3 files are excluded from PWA response caching. Old API/image caches are cleared on frontend initialization.
- USSD callbacks require a configured bearer secret; unsigned WhatsApp callbacks are rejected against their raw request body. Identity-verification mocks cannot run in production. Platform-level agent creation/update is restricted to super admins until lender assignment ownership is modeled.

## Verification

All 84 tests passed across five suites in the isolated integration run. Frontend and backend TypeScript checks passed. The optimized frontend production build, including lint/type checks and static-page generation, passed in a temporary copy. Both migrations are applied and `/api/ready` reports healthy. At a 390px phone viewport the public navigation now measures 390px, and its menu exposes all public links.

Run from the respective package directory:

```sh
# backend
npm run test:integration
npx tsc --noEmit
npx prisma migrate status

# frontend
npx tsc --noEmit --incremental false
```

The integration runner creates a fresh randomly named PostgreSQL schema and an isolated Redis key prefix, applies both migrations, invokes the real Express routes against the database, then removes only its disposable schema/keys. It never uses the broad cleanup helper against development data.

Browser checks cover lender login, session persistence after refresh, saved application listing, sign-out, borrower-specific routing and loan records, and active-program loading in the application form. Loan approval and payment mutations were exercised only on synthetic integration fixtures, not on development farmers through the browser.

## Remaining before live lending

This checkpoint is not a production security certification.

- Configure and implement Paystack transfer initiation, signed confirmation/reconciliation, retries, and failure handling. Approval currently authorizes a tranche; it does not send money. Manual payment recording is an accounting entry for funds already received.
- Complete authenticated document upload/download/verification and enforce documented identity/underwriting requirements. BVN/NIN services still contain development mocks; production calls are blocked.
- Implement durable offline drafts/queues, replay, and conflict handling for field-agent registrations and visits. Existing agent submission screens remain prototypes.
- Connect the remaining admin, agent, discovery, reporting, messaging, notification, settings, and standalone disbursement/repayment screens. Some still display fixtures; the connected loan detail is the implemented location for tranche approval and received-payment recording.
- Confirm the business rules for interest calculation and repayment dates. This implementation retains the existing simple program interest calculation and creates a provisional monthly schedule from approval. Confirming the first real transfer must establish/rebase the actual repayment schedule before collections begin.
- Validate FarmScore inputs/model performance and restrict unverified reports from scoring. Complete independent security, dependency, deployment, and provider integration reviews.
- Complete account 2FA enrollment/recovery UI, notification preferences, and verified phone-number changes. Login TOTP enforcement is implemented and tested.
- Wire the contact form to a real delivery service and replace unsupported institutional endorsements, testimonials, and metrics with documented proof.

Cookie authentication requires a same-site frontend/API deployment (for example `app.agrotrack.ng` and `api.agrotrack.ng`) over HTTPS in production. Set `FRONTEND_URL` to the exact trusted frontend origin. Separate-site hosting needs an explicitly designed cookie/CSRF configuration rather than weakening the current origin checks.
