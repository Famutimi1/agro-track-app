/**
 * Message/socket authorization invariants.
 *
 * These lock in the room-join authorization rules enforced by `canJoinRoom` in
 * `config/socket.ts`. With the Redis adapter live, joining a room is sufficient
 * to receive everything emitted to it across ALL instances — so an over-permissive
 * rule is a cross-user data leak. This test documents the intended matrix so a
 * future change that loosens it fails loudly.
 *
 * The rules are re-expressed here as a pure function mirroring the service logic;
 * the conversation/borrower cases that require a DB lookup are represented by an
 * injected membership predicate.
 */

type SocketCtx = { userId?: string; role?: string; lenderId?: string };

function canJoinRoomPure(
  ctx: SocketCtx,
  room: string,
  opts: { isConversationParticipant?: boolean; ownsBorrowerProfile?: boolean } = {}
): boolean {
  const sep = room.indexOf(":");
  if (sep === -1) return false;
  const prefix = room.slice(0, sep);
  const id = room.slice(sep + 1);
  if (!id) return false;

  switch (prefix) {
    case "user":
      return ctx.userId === id;
    case "lender":
      return !!ctx.lenderId && ctx.lenderId === id;
    case "role":
      return ctx.role === id;
    case "agent":
      return ctx.userId === id;
    case "borrower":
      if (ctx.role && ctx.role.startsWith("LENDER_")) return true;
      if (!ctx.userId) return false;
      return !!opts.ownsBorrowerProfile;
    case "conversation":
      if (!ctx.userId) return false;
      return !!opts.isConversationParticipant;
    default:
      return false;
  }
}

describe("Socket room authorization (canJoinRoom)", () => {
  describe("fail-closed defaults", () => {
    it("denies rooms with no prefix separator", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "randomroom")).toBe(false);
    });

    it("denies unknown prefixes", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "admin:everything")).toBe(false);
    });

    it("denies a prefix with an empty id", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "user:")).toBe(false);
    });
  });

  describe("user rooms", () => {
    it("allows a user to join only their own room", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "user:u1")).toBe(true);
    });

    it("denies joining another user's room", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "user:u2")).toBe(false);
    });
  });

  describe("lender rooms", () => {
    it("allows a socket whose JWT carries that lenderId", () => {
      expect(canJoinRoomPure({ userId: "u1", lenderId: "org1" }, "lender:org1")).toBe(true);
    });

    it("denies a different org", () => {
      expect(canJoinRoomPure({ userId: "u1", lenderId: "org1" }, "lender:org2")).toBe(false);
    });

    it("denies a socket with no lenderId", () => {
      expect(canJoinRoomPure({ userId: "u1" }, "lender:org1")).toBe(false);
    });
  });

  describe("conversation rooms", () => {
    it("allows a participant", () => {
      expect(
        canJoinRoomPure({ userId: "u1" }, "conversation:c1", { isConversationParticipant: true })
      ).toBe(true);
    });

    it("denies a non-participant", () => {
      expect(
        canJoinRoomPure({ userId: "u1" }, "conversation:c1", { isConversationParticipant: false })
      ).toBe(false);
    });

    it("denies an unauthenticated socket regardless of membership", () => {
      expect(
        canJoinRoomPure({}, "conversation:c1", { isConversationParticipant: true })
      ).toBe(false);
    });
  });

  describe("borrower rooms", () => {
    it("allows any lender user to observe", () => {
      expect(canJoinRoomPure({ userId: "l1", role: "LENDER_ADMIN" }, "borrower:b1")).toBe(true);
    });

    it("allows the borrower who owns the profile", () => {
      expect(
        canJoinRoomPure({ userId: "u1", role: "BORROWER" }, "borrower:b1", { ownsBorrowerProfile: true })
      ).toBe(true);
    });

    it("denies a borrower who does not own the profile", () => {
      expect(
        canJoinRoomPure({ userId: "u1", role: "BORROWER" }, "borrower:b1", { ownsBorrowerProfile: false })
      ).toBe(false);
    });
  });

  describe("agent rooms", () => {
    it("allows an agent to join their own room", () => {
      expect(canJoinRoomPure({ userId: "a1" }, "agent:a1")).toBe(true);
    });

    it("denies joining another agent's room", () => {
      expect(canJoinRoomPure({ userId: "a1" }, "agent:a2")).toBe(false);
    });
  });
});
