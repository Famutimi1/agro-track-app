# AgroTrack remaining implementation plan

Prepared 12 October 2026 from the current checkout and `IMPLEMENTATION_STATUS.md`.

## Target and baseline

The target is a complete product, delivered through a controlled online pilot before rural/offline and commercial rollout. The first pilot assumes one Nigerian lender, one agreed set of loan rules, and human review of lending decisions. These are planning assumptions, not business decisions already made.

Keep the working session authentication, scoped lending routes, atomic loan creation, partial-payment ledger, connected application/loan screens, and migrations. The last verified baseline is 84 passing tests, successful TypeScript checks, and a successful frontend production build. Legacy task-plan checkmarks do not establish completed user workflows.

Finish each slice across schema, API, permissions, UI, and tests. A service file or a success message alone is not completion. Existing services should be reused where their contracts and ownership rules fit.

## Phase 0 — Stabilize the delivery foundation

**Dependencies:** none. **Release gate:** reproducible staging baseline.

- Inventory every remaining page/action and its endpoint, request fields, response fields, roles, and tenant scope. Reconcile document ownership/status names, agent profile/visit fields, notification fields, and missing routes before connecting their hooks.
- Update the existing CI workflows to run the isolated HTTP/database integration suite, applied migrations, TypeScript checks, production builds, and meaningful coverage checks. Correct short CI secrets and the frontend API URL's missing `/api` path. Test on the supported Node runtime.
- Make deployment use the same commit that passed CI, run migration/readiness checks, and preserve a documented rollback/backup procedure. Create separate development, staging, and production configurations with production mocks disabled.
- Finish credential hygiene in worker/queue logs; missing production email/SMS configuration must not produce a successful delivery result. Keep secret values in environment/secret management.

**Done when:** a clean checkout boots against a migrated staging database; CI actually runs the integration cases; failed readiness or migrations prevent promotion; logs contain no OTPs, secrets, or message payloads with sensitive data.

## Phase 1 — Private documents, identity checks, and account controls

**Dependencies:** Phase 0 contracts. **Release gate:** a borrower can submit a real, reviewable identity/document package.

- Model upload reservations and supported owners explicitly. The current client accepts USER/BORROWER/APPLICATION/LOAN owners, while the database has user/borrower/application associations; either add the loan association or remove unsupported ownership.
- Mount authenticated document routes and align the existing upload component/API client. Let the server choose object keys, reserve ownership, and confirm the actual stored object's existence, size, and media type. Add file scanning/quarantine, expiry cleanup, and private signed downloads.
- Add lender document-review screens, rejection reasons, audit events, and program-specific required documents. Prevent submission/approval when the required evidence is missing or unverified, according to agreed rules.
- Choose an approved BVN/NIN provider and implement an adapter, sandbox integration, name/account matching, failure handling, and explicit verification status. No success from a mock or unavailable provider.
- Use a dedicated, versioned encryption key for sensitive identity/bank fields rather than deriving it from the JWT secret. Add masking, access boundaries, retention policy, and a migration/rotation strategy.
- Complete 2FA enrollment/disable/recovery, password-reset delivery, profile updates, and verified phone-number changes. Protect changes with appropriate reauthentication and session revocation.

**Done when:** authorized uploads survive refresh; missing/oversized/mismatched objects cannot be confirmed; another tenant cannot download/review them; real provider results drive verification; enrollment/recovery/reset paths work and have bounded retries.

## Phase 2 — Online field verification, farm reports, and credible scoring

**Dependencies:** Phase 1 media storage. **Release gate:** later-tranche evidence can be submitted and reviewed through the product.

- Add explicit agent-to-lender/borrower assignments and supervisor boundaries. An agent-assisted registration endpoint must keep the agent signed in, record consent, and avoid silently replacing the session with the farmer's session.
- Reconcile visit models and routes, then connect agent dashboards, assigned farmers, registration, scheduling, visit detail, completion, and settings. Record real GPS accuracy/timestamps and private photos; define when a visit requires review rather than trusting a client completion flag.
- Connect borrower farm-report creation/history and lender/supervisor review. Add the missing approve/reject workflow so a report can genuinely become VERIFIED. Associate evidence with the relevant loan/tranche; prevent unrelated or reused evidence from satisfying funding gates.
- Connect discovery, borrower profiles, farm maps, and FarmScore current/history/explanation screens. Define data freshness and eligibility explanations.
- Version FarmScore rules and inputs. Exclude rejected/unverified reports, separate future installments from missed payments, and recalculate from committed payment/evidence events. Validate performance before treating it as a lending decision model; maintain human review and a correction process.
- Compute agent earnings from verified, uniquely identified work and a ledger, not local UI totals. Keep payouts separate from farmer loan transfers.

**Done when:** an assigned agent records a real visit; a reviewer verifies its evidence; the correct loan's next tranche becomes eligible; unrelated agents cannot access it; scoring/earnings remain unchanged on duplicate events and cannot be inflated by unverified reports.

## Phase 3 — Provider-confirmed payments and collections

**Dependencies:** Phases 1–2 evidence and identity gates; agreed financial rules. **Release gate:** the complete lending journey passes in the payment sandbox.

- Confirm interest basis, fees, grace periods, first-payment anchor, rounding, partial-payment allocation, early repayment, overdue/default transitions, and reversals. Snapshot terms on each loan so later program edits do not alter existing contracts.
- Add payment attempts/provider events and explicit transition rules. A local approval starts an authorized attempt; an HTTP timeout is an unknown outcome requiring reconciliation, not permission to send again.
- Implement Paystack recipient validation and transfer initiation with stable references. Match provider-confirmed reference, amount, currency, and recipient to the authorized attempt. Add signed raw-body webhooks, duplicate/out-of-order handling, reconciliation jobs, and an operations exception queue.
- Activate a loan only after confirmed funding. Establish/rebase the repayment schedule on the agreed first-funding date; pending loans must not accrue collection status from provisional dates.
- Implement provider-confirmed farmer repayment collection alongside the existing manual received-payment entry. Track immutable receipts, partial allocation, reversals, overdue jobs, and receipts/notifications.
- Connect standalone disbursement/repayment screens to the same services and ledger used by loan detail. Add maker/checker permissions and limits where the lender requires them.

**Done when:** successful, failed, pending, timed-out, reversed, duplicate, and out-of-order sandbox events reconcile correctly; no duplicate transfer/credit is possible; unauthorized or unverified borrowers cannot receive funding; balances and schedules match immutable terms. Live transfer enablement remains a separate operational release step.

## Phase 4 — Complete everyday operations and all remaining online screens

**Dependencies:** Phases 1–3 data contracts; some read-only screens can be built earlier. **Release gate:** a lender can operate the online pilot without fixture data.

- Connect program creation/editing/status, borrower lists/detail, cooperative membership, field-agent oversight, map filters, and portfolio reports/export. Define report metrics and include partial payments consistently; paginate and scope every view/export.
- Mount notification list/read/count/preferences endpoints and deliver actual in-app events, email, and SMS. Add an outbox or equivalent durable event handoff so a committed approval/payment is not lost if delivery fails. Distinguish queued, delivered, failed, and opted-out states.
- Connect conversations/messages, unread counts, attachments, participant authorization, pagination, and realtime reconnection. Validate notification destinations and avoid leaking borrower data through shared rooms.
- Complete lender organization/team invitations, role changes, suspension, account settings, API key scopes, and outbound webhooks. API keys must retain tenant context; outbound destinations need SSRF protection, signatures, retry limits, and delivery history.
- Replace admin fixtures with platform stats, account operations, support-ticket workflows, actual health metrics, feature flags, scoped audit views, and documented metric definitions.
- Review all remaining forms/buttons for real persistence, validation, loading/error states, keyboard access, and narrow screens. Unsupported features must be visibly unavailable rather than claiming success.

**Done when:** every online screen in the route inventory loads real scoped data; role changes revoke access; exports match the ledger; messages/notifications recover after reconnect; no action claims success before persistence or confirmed delivery.

## Phase 5 — Durable offline field operations

**Dependencies:** Phase 2 stable online agent workflow and document/media contract. **Release gate:** field work survives loss of connectivity and app restarts.

- Add IndexedDB drafts and a durable submission queue with stable client IDs, dependency ordering, bounded retries, conflicts, and explicit pending/failed/synced states.
- Support farmer registration, reports/visits, GPS, and queued media. Save a draft before navigation; upload media and create server associations in an order that can safely resume.
- Implement idempotent sync endpoints, assignment/version checks, duplicate identity resolution, and a manual conflict-recovery UI. Ensure a replay under a different account cannot submit another agent's data.
- Minimize offline personal data, isolate it by account/device, clear it according to the agreed logout/retention policy, and avoid caching financial APIs through the service worker.

**Done when:** flight mode, refresh, app close/reopen, reconnect, interrupted upload, expired login, account switch, conflict, and duplicate replay tests preserve authorized work without creating duplicate farmers, visits, or files.

## Phase 6 — Rural channels and commercial features

**Dependencies:** stable identity/payment/notification services. **Release gate:** each enabled external channel and commercial action is real.

- Integrate authenticated USSD and WhatsApp provider sessions with verified farmer identity, consent, restricted responses, session expiry, replay protection, and rate limits. A phone number or inbound message alone must not authorize viewing financial data or performing sensitive changes.
- Keep channels as adapters to the same lending services; do not implement alternate rules or an alternate ledger. Deliver receipts and track channel failures.
- Implement lender subscription plans, entitlements, usage limits, invoices, plan changes, payment events, and admin revenue reporting. Keep subscription billing distinct from farmer repayments and agent commissions.
- Connect the contact/demo form to a real delivery/tracking service. Replace unsupported metrics and institutional/testimonial claims with approved evidence; complete actual support and legal content.

**Done when:** channel sandbox requests and billing events affect the correct accounts once, sensitive data is hidden until verification, feature limits are enforced server-side, and a demo enquiry reaches the intended destination.

## Phase 7 — Release validation and staged rollout

**Dependencies:** earlier phases for whichever capabilities are being enabled. Run these checks throughout delivery, not only at the end.

- Maintain a browser end-to-end suite for each role and the full farmer → documents → field review → lender approval → funding → partial/final repayment journey. Extend HTTP integration tests for each new resource's cross-tenant denial and concurrency/retry behavior.
- Run independent code/security and dependency reviews; exercise cookie/CSRF/CORS, file access, webhooks, API keys, data retention, rate limits, and deployment configuration.
- Exercise migration upgrades, backup restoration, reconciliation after downtime, queue failures, observability/alerts, provider outages, and accessible mobile use with realistic data volumes and network conditions.
- Deploy to same-site HTTPS staging, run sandbox acceptance, then a limited lender pilot with operational support and documented recovery steps. Enable capabilities only after their acceptance gate; validate a bounded live payment separately before scaling.

**Done when:** no unresolved critical security/accounting defects remain, required provider integrations are verified, backups restore, alerts work, and the pilot operator can complete and reconcile the full supported workflow. Release documentation must list any explicitly disabled features.

## Milestones and dependencies

1. **Reviewable borrower:** Phases 0–1. Real private documents, identity checks, account recovery, and reproducible CI/staging.
2. **Verified online lending pilot:** Phases 2–4 plus Phase 7 gates. All required online roles, evidence, payments, ledger, communications, and operations are usable.
3. **Rural field readiness:** Phase 5 plus offline release tests. Required before relying on agent work without connectivity.
4. **Full channel/commercial rollout:** Phase 6 plus channel/billing release gates.

Provider onboarding can proceed while independent code is built. Offline replay must follow stable online contracts. Advanced predictive AI, satellite/weather ingestion, white-label customization, and additional-country rollout are later extensions, each with its own data/vendor validation, rather than blockers for the first reliable lending pilot.

## Inputs needed during implementation

- Lender/product owner: agreed financial rules, required documents and verification gates, agent assignment/consent policy, feature priorities, and pilot size.
- Service owner: staging/payment sandbox credentials, private storage configuration, identity provider access, email/SMS accounts, and channel credentials when those phases begin. Configure secrets securely rather than putting them in chat or the repository.
- Operations owner: hosting/domains, backup/restore targets, alert recipients, reconciliation responsibility, and support procedures.
- Commercial owner: subscription prices/limits, commission/payout policy, supported public claims, and published terms/content.

Credentials are required for sandbox acceptance, not for writing adapters and contract tests. Do not invent business rules merely to unblock a payment or eligibility decision. Calendar estimates should follow confirmed rules/provider access and the first completed slice; this plan is a dependency sequence, not a delivery-date commitment.

## Recommended next implementation batch

Start with **Phase 0 contracts/CI and the Phase 1 document workflow**: upload reservation → actual private upload → server confirmation → authorized download → lender verify/reject → application evidence gate. This closes a concrete gap before funds are enabled and supplies the media foundation for farm reports and offline visits.

Deliver it in small reviewable slices with relevant tests and browser verification. Then add the real identity adapter, online field review, and payment sandbox in dependency order. This request produced the plan only; no additional application code or database changes were made.
