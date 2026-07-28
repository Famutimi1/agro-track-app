# Chat Hardening Plan — Production-Grade Messaging

**Target scale:** hundreds of concurrent users, low thousands of messages/day.
**Goal:** make direct messaging reliable and correct across multiple backend
instances, without over-engineering for WhatsApp-scale.

> **Scope note on "storage / sharding" (original item 5):** deliberately
> **excluded**. Sharding, wide-column stores (Cassandra/ScyllaDB), and cold-storage
> tiering solve millions-of-messages/day problems. At our scale they add
> operational cost and slow development for zero benefit. This plan replaces that
> item with right-sized Postgres indexing + a retention policy. See
> [When sharding actually matters](#appendix-when-sharding-actually-matters).

## Current state (already in the repo)

- `socket.io` server emitting `message:new` per conversation room — single in-memory instance.
- `ioredis` client + graceful in-memory fallback (`REDIS_ENABLED=false` today).
- `bull` queues incl. a `pushQueue`; `workers/` dir with email/sms workers.
- `MessageStatus` enum: `PENDING | SENT | DELIVERED | READ | FAILED`.
- Redis + Postgres in `docker-compose.yml`.
- Frontend: React Query hooks with `refetchInterval` polling as a safety net; socket hooks with reconnect-safe re-subscription and room re-join.

So most of this is **wiring what exists**, not building from scratch.

---

## Phase 0 — Turn on the infrastructure (prerequisite)

**Why first:** every later phase assumes Redis is actually running. Nothing else
is safe to deploy multi-instance until this is real.

- [x] Set `REDIS_ENABLED=true` in staging/prod env. *(documented in `.env.example`; deploy env owns the value)*
- [x] Confirm `connectRedis()` and `initializeQueues()` succeed on boot (logs). *(already wired in `server.ts`)*
- [x] Add a `/health` check that reports Redis connectivity. *(`GET /api/health` now reports DB + Redis, 503 when degraded)*
- [x] Document that multi-instance deploys **require** `REDIS_ENABLED=true`
      (with it off, sockets silently break across instances). *(`.env.example` Redis section)*

**Verify:** boot with Redis up; confirm connect logs, health endpoint green.

---

## Phase 1 — Multi-instance WebSocket delivery (original item 1)

**Problem:** `emitToConversation` only reaches sockets on the same process.
With 2+ instances behind a load balancer, cross-instance messages are lost.

**Approach:** Socket.IO Redis adapter (pub/sub). This is the standard fix and
reuses the Redis you already run — no Kafka/RabbitMQ needed at this scale.

- [x] Add `@socket.io/redis-adapter`. *(v8.3.0 installed)*
- [x] In `initializeSocket`, when `redisEnabled`, create two dedicated ioredis
      connections (pub + sub — the adapter needs its own, not the shared client)
      and call `io.adapter(createAdapter(pubClient, subClient))`. *(done; closed on SIGTERM via `closeSocketRedis`)*
- [x] Keep the no-adapter path when `REDIS_ENABLED=false` for local dev. *(warns and uses in-memory adapter)*
- [x] **Security (added):** authorize every room join (`join` and `join:conversation`).
      Previously any authenticated socket could join any `conversation:*`/`user:*`
      room and receive its messages — a cross-user leak that the Redis adapter
      would amplify across instances. Now `canJoinRoom` enforces per-prefix
      ownership (fail-closed on unknown prefixes).
- [ ] Sticky sessions at the load balancer (or force `transports: ['websocket']`).
      **Deploy-time task** — frontend already tries websocket first. Configure the
      LB (e.g. `ip_hash`/cookie affinity) when the multi-instance deploy is set up.

**Files:** `backend/src/config/socket.ts`, `backend/package.json`, LB/deploy config.

**Verify:** run two API instances locally (different ports) sharing one Redis;
connect a client to each; a message sent via instance A appears on the client
attached to instance B.

---

## Phase 2 — Ordering & idempotency (original item 3)

**Problem:** ordering relies on `createdAt` (ties + clock skew reorder messages);
a retried send creates duplicate rows; optimistic UI can double-render.

**Approach:** monotonic per-conversation sequence + client-supplied dedup key.

- [x] Schema: added `Message.seq BigInt` (per-conversation monotonic) and
      `Message.clientId String?` with a unique constraint on
      `(conversationId, clientId)`. Migration `20260719120000_message_seq_clientid`
      backfills `seq` for existing rows by `createdAt` order.
- [x] Server assigns `seq` on insert inside a transaction (reads max seq for the
      conversation, +1) and persists it on the row.
- [x] Order message reads by `seq` (`getMessages`); frontend sorts by `seq` too.
- [x] `sendMessage` accepts `clientId`; pre-check + unique-constraint catch (P2002)
      return the existing message instead of inserting (idempotent send).
- [x] Frontend generates a `clientId` (uuid) per send, passed through the API.
- [x] BigInt `seq` serialized to string across all message responses/emits
      (`serializeMessage`), since BigInt is not JSON-safe.

**Files:** `prisma/schema.prisma` (+ migration), `message.service.ts`,
`message.routes.ts`, `frontend/lib/api/messages.ts`, `use-messages.ts`, chat pages.

**Verify:** double-submit the same `clientId` → one row. Interleave sends from two
clients → identical `seq` order on both. Optimistic bubble reconciles without dupes.

---

## Phase 3 — Delivery guarantees & receipts (original item 2)

**Problem:** fire-and-forget. If the recipient socket is down at emit time, the
message only surfaces on the next poll; no delivered/read distinction is pushed;
sender's ticks lag.

**Approach:** use the existing `MessageStatus` states + socket ACKs +
reconnect catch-up. No separate message broker needed.

- [x] **Delivered:** on receiving `message:new`, the client emits `message:ack`.
      Server marks `DELIVERED` + `deliveredAt` (`markDelivered`) and emits
      `message:delivered` back to the conversation room.
- [x] **Read (live):** `message:read` socket event added — server persists read +
      `status: READ` (`markConversationRead`) and emits `message:read` to the room
      so sender ticks update live.
- [x] **Reconnect catch-up:** on (re)connect the client emits `conversation:sync`
      with its last `seq`; server streams newer messages via ack callback
      (`getMessagesSince`, participant-guarded).
- [x] Lengthened the message `refetchInterval` from 5s → 20s now that sockets +
      catch-up carry realtime delivery (poll is a safety net, not the primary path).

**Status: DONE** — backend + both chat pages, typecheck clean. All socket
receipt/sync handlers are participant-authorized in the service layer.

**Files:** `socket.ts`, `message.service.ts`, `frontend/lib/socket/*`,
`use-messages.ts`, chat pages.

**Verify:** send to an offline recipient → status stays `SENT`; on their reconnect
they receive it and status flips `DELIVERED` then `READ`, and the sender sees ticks
update live.

---

## Phase 4 — Fix the N+1 unread query (original item 4)

**Problem:** `getConversations` runs one `COUNT` per conversation in a loop
(`message.service.ts:70-89`). Linear DB round-trips per page load.

**Approach:** single grouped query now; denormalized counter only if needed later.

- [x] Replace the per-conversation loop with one `groupBy` on `Message`
      (`conversationId`, `read=false`, `senderId != me`) → map counts in memory.
- [x] Add supporting index (`Message_conversationId_senderId_read_idx`, migration
      `20260719140000_message_unread_index`).
- [ ] (Optional, only if profiling demands) denormalize an unread counter per
      participant, updated on send/read.

**Status:** DONE (loop → single groupBy). Optional denormalization deferred until
profiling shows it is needed.

**Files:** `message.service.ts`.

**Verify:** query count for a page of N conversations drops from N+1 to ~2;
same numbers returned; snapshot/EXPLAIN before/after.

---

## Phase 5 — Robustness ✅ DONE

- [x] **Rate limit sends** — per-user `messageSendLimiter` (30/min) on the send
      route (`rate-limiter.ts`, `message.routes.ts`). Sends go through REST, so
      the socket ack/read/sync events don't need a separate send guard.
- [x] **Validation:** send route trims content, rejects empty, caps at 5000 chars,
      and validates `clientId` shape.
- [x] **Socket re-auth on token refresh:** `reauthenticateSocket()` swaps the
      token and forces a reconnect; wired into the axios refresh interceptor
      (`api/client.ts`) so a refreshed/expired JWT no longer leaves a stale socket.
- [x] **Authorization audit:** `canJoinRoom` enforces per-prefix ownership
      (fail-closed); documented as a test matrix in `message.authz.test.ts` (16 cases).

**Verify:** exceed the rate limit → 429 / dropped socket send; oversized payload
rejected; expired-token socket is disconnected.

---

## Phase 6 — Right-sized storage (replaces original item 5)

**Not sharding.** Just make Postgres comfortable at our volume. ✅ **DONE**

- [x] Composite index `(conversationId, seq)` for history reads + ordering
      (migration `20260719120000`).
- [x] Index supporting the unread group-by (`conversationId, senderId, read`)
      (migration `20260719140000`).
- [x] **Retention policy:** `MESSAGE_RETENTION_DAYS` env (default `0` = keep
      forever, opt-in). Daily Bull sweep (`maintenance.worker.ts`) purges older
      messages only when a window is set — deletion is irreversible, so off by default.
- [x] Keyset pagination on `seq` for scroll-up: `getMessages` accepts a
      `beforeSeq` cursor (`seq < cursor`), avoiding OFFSET degradation on deep
      history; returns `nextCursor`/`hasMore`. Page-based path kept for compatibility.

**Verify:** ✅ backend + frontend typecheck clean; all 83 tests pass. Indexes live
in Postgres. Retention is opt-in and irreversible (documented in `.env.example`).

---

## Feature backlog (users expect these from "chat")

Prioritized; each is independent and can be scheduled after the reliability phases.

1. **Live read receipts** — folds into Phase 3; do it there.
2. **Typing indicators** — ephemeral socket event (`typing:start/stop`), no DB.
3. **Infinite scroll for history** — keyset pagination on `seq`; API already paginates.
4. **Online / last-seen presence** — track via socket connect/disconnect + Redis
   presence keys with TTL.
5. **Attachments (images/docs)** — reuse existing Cloudinary/S3 upload path;
   add `Message.attachments`.
6. **Message edit / delete / unsend** — add `editedAt`, `deletedAt`; push updates
   over the same socket channel.
7. **Reactions & replies/threading** — new tables; UI + socket events.
8. **Offline push (web-push / FCM)** — you have a `pushQueue` + `Notification`
   rows for broadcasts but no device push for DMs. Enqueue a push job when a
   recipient has no live socket.

---

## Suggested sequencing

Reliability before features. Phases **0 → 1 → 2 → 3** are the backbone (correct,
multi-instance, no-loss, no-dupe delivery). **4** is a quick win any time. **5** and
**6** harden. Features layer on after Phase 3, starting with typing indicators and
infinite scroll (cheap, high perceived value).

---

## Appendix: when sharding actually matters

Revisit true horizontal message storage (partitioning, wide-column stores,
cold-storage tiering) only when you hit signals like:

- Sustained **>1M messages/day** or a single conversation with millions of messages.
- The `Message` table in the **hundreds of millions of rows** with index bloat.
- Write throughput saturating a single Postgres primary.

Until then, one well-indexed Postgres table with a retention policy is the correct,
boring, maintainable choice.
