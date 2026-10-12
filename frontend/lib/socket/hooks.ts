import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeStore } from "../stores";
import {
  getSocket,
  initSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  subscribeToEvent,
  emitTyping,
  SocketEvents,
} from "./client";
import { loanKeys, applicationKeys, farmReportKeys, farmScoreKeys, fieldAgentKeys } from "../hooks";

export function useSocket() {
  const { isConnected, connectionError } = useRealtimeStore();

  useEffect(() => {
    const socket = initSocket();

    return () => {
      // Don't disconnect on unmount as other components may be using it
    };
  }, []);

  return {
    isConnected,
    connectionError,
    disconnect: disconnectSocket,
  };
}

export function useSocketRoom(room: string | null) {
  useEffect(() => {
    if (!room) return;

    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [room]);
}

export function useSocketEvent<K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
) {
  // Re-subscribe whenever the connection becomes ready: subscribeToEvent binds to
  // the socket instance that exists at call time, so a handler registered before
  // the socket connected (fresh login, reload before auth, reconnect) would attach
  // to nothing. Keying the effect on isConnected rebinds to the live socket.
  const { isConnected } = useRealtimeStore();

  useEffect(() => {
    const unsubscribe = subscribeToEvent(event, callback);
    return unsubscribe;
  }, [event, callback, isConnected]);
}

export function useRealtimeInvalidation() {
  const queryClient = useQueryClient();

  const handleLoanUpdate = useCallback(
    (data: { loanId: string }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.mine() });
    },
    [queryClient]
  );

  const handleApplicationUpdate = useCallback(
    (data: { applicationId: string }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.applicationId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    [queryClient]
  );

  const handleDisbursementProcessed = useCallback(
    (data: { loanId: string }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.mine() });
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
    [queryClient]
  );

  const handleRepaymentReceived = useCallback(
    (data: { loanId: string }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.loanId) });
      queryClient.invalidateQueries({ queryKey: ["repayments"] });
    },
    [queryClient]
  );

  const handleFarmReportVerified = useCallback(
    (data: { reportId: string }) => {
      queryClient.invalidateQueries({ queryKey: farmReportKeys.detail(data.reportId) });
      queryClient.invalidateQueries({ queryKey: farmReportKeys.lists() });
    },
    [queryClient]
  );

  const handleFarmScoreUpdated = useCallback(
    () => {
      queryClient.invalidateQueries({ queryKey: farmScoreKeys.all });
    },
    [queryClient]
  );

  const handleFieldVisitAssigned = useCallback(
    (data: { agentId: string }) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.tasks(data.agentId) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
    },
    [queryClient]
  );

  useSocketEvent("loan:updated", handleLoanUpdate);
  useSocketEvent("application:updated", handleApplicationUpdate);
  useSocketEvent("disbursement:processed", handleDisbursementProcessed);
  useSocketEvent("repayment:received", handleRepaymentReceived);
  useSocketEvent("farm-report:verified", handleFarmReportVerified);
  useSocketEvent("farm-score:updated", handleFarmScoreUpdated);
  useSocketEvent("field-visit:assigned", handleFieldVisitAssigned);
}

/**
 * Typing indicator for a conversation. Returns:
 *  - `isOtherTyping`: whether a DIFFERENT participant is currently typing.
 *  - `notifyTyping()`: call on each keystroke; emits `typing:start` (throttled)
 *    and schedules an automatic `typing:stop` after a short idle gap.
 *  - `stopTyping()`: force-emit `typing:stop` now (e.g. after sending).
 *
 * Incoming typing state auto-expires after `RECEIVE_TIMEOUT` so a missed
 * `typing:stop` (tab closed, network blip) can't leave the indicator stuck on.
 */
export function useTypingIndicator(conversationId: string | null, selfUserId?: string) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Emit-side throttling: don't emit typing:start more than once per interval;
  // debounce a typing:stop after the user pauses.
  const lastStartRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Receive-side auto-expiry so a dropped typing:stop doesn't stick.
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const EMIT_THROTTLE = 2000;
  const STOP_DEBOUNCE = 2500;
  const RECEIVE_TIMEOUT = 6000;

  // Reset state when the active conversation changes.
  useEffect(() => {
    setIsOtherTyping(false);
    lastStartRef.current = 0;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
  }, [conversationId]);

  const handleTyping = useCallback(
    (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId !== conversationId) return;
      if (selfUserId && data.userId === selfUserId) return; // ignore our own echo
      setIsOtherTyping(data.isTyping);
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
      if (data.isTyping) {
        expireTimerRef.current = setTimeout(() => setIsOtherTyping(false), RECEIVE_TIMEOUT);
      }
    },
    [conversationId, selfUserId]
  );
  useSocketEvent("typing", handleTyping);

  const stopTyping = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    lastStartRef.current = 0;
    if (conversationId) emitTyping(conversationId, false);
  }, [conversationId]);

  const notifyTyping = useCallback(() => {
    if (!conversationId) return;
    const now = Date.now();
    if (now - lastStartRef.current > EMIT_THROTTLE) {
      lastStartRef.current = now;
      emitTyping(conversationId, true);
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      lastStartRef.current = 0;
      emitTyping(conversationId, false);
    }, STOP_DEBOUNCE);
  }, [conversationId]);

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    };
  }, []);

  return { isOtherTyping, notifyTyping, stopTyping };
}

export function useLenderRoom(lenderId: string | undefined) {
  useSocketRoom(lenderId ? `lender:${lenderId}` : null);
}

export function useBorrowerRoom(borrowerId: string | undefined) {
  useSocketRoom(borrowerId ? `borrower:${borrowerId}` : null);
}

export function useFieldAgentRoom(agentId: string | undefined) {
  useSocketRoom(agentId ? `agent:${agentId}` : null);
}
