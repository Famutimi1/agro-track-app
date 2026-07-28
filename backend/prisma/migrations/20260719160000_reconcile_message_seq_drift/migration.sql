-- Reconcile schema/DB drift detected during end-to-end verification.
--
-- 1. Message.seq: the Phase 2 migration added it nullable (for a safe backfill),
--    but the schema declares `BigInt @default(0)` (NOT NULL). All rows are now
--    backfilled (0 NULLs), so we can enforce the declared shape. New rows always
--    receive an explicit seq in the send transaction; the default 0 is only a
--    safety floor.
ALTER TABLE "Message" ALTER COLUMN "seq" SET DEFAULT 0;
UPDATE "Message" SET "seq" = 0 WHERE "seq" IS NULL;
ALTER TABLE "Message" ALTER COLUMN "seq" SET NOT NULL;

-- 2. BorrowerLoan: drop the stale non-unique index left behind when applicationId
--    was promoted to a unique constraint. The unique index
--    (BorrowerLoan_applicationId_key) already covers lookups, so the plain index
--    is redundant and absent from the schema.
DROP INDEX IF EXISTS "BorrowerLoan_applicationId_idx";
