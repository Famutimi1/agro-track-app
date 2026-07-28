-- Supports the unread group-by in getConversations: filters by conversationId,
-- read=false, and senderId != me. A composite index keeps that query fast as
-- message volume grows (Phase 4/6 of the chat hardening plan).
CREATE INDEX IF NOT EXISTS "Message_conversationId_read_senderId_idx"
  ON "Message" ("conversationId", "read", "senderId");
