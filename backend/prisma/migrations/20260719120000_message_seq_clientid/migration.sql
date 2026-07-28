-- Phase 2: ordering & idempotency for messages.
-- Adds a per-conversation monotonic sequence (seq) and an optional
-- client-supplied dedup key (clientId).

-- 1. Add columns (nullable so existing rows and no-key sends are allowed).
ALTER TABLE "Message" ADD COLUMN "seq" BIGINT;
ALTER TABLE "Message" ADD COLUMN "clientId" TEXT;

-- 2. Backfill seq for existing rows: number each conversation's messages
--    by creation order so historical ordering is preserved.
WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "conversationId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS rn
  FROM "Message"
)
UPDATE "Message" m
SET "seq" = ordered.rn
FROM ordered
WHERE m."id" = ordered."id";

-- 3. Composite index for history reads + ordering by seq.
CREATE INDEX "Message_conversationId_seq_idx" ON "Message"("conversationId", "seq");

-- 4. Idempotent sends: a given client message key is unique within a
--    conversation. NULLs are allowed and never collide in Postgres, so
--    existing rows and no-key sends are unaffected.
CREATE UNIQUE INDEX "Message_conversationId_clientId_key" ON "Message"("conversationId", "clientId");
