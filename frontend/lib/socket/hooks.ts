import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeStore } from "../stores";
import {
  getSocket,
  initSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  subscribeToEvent,
  SocketEvents,
} from "./client";
import { loanKeys, applicationKeys, farmReportKeys, farmScoreKeys, fieldVisitKeys } from "../hooks";

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
  useEffect(() => {
    const unsubscribe = subscribeToEvent(event, callback);
    return unsubscribe;
  }, [event, callback]);
}

export function useRealtimeInvalidation() {
  const queryClient = useQueryClient();

  const handleLoanUpdate = useCallback(
    (data: { loanId: string }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
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
    (data: { visitId: string }) => {
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.detail(data.visitId) });
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.lists() });
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

export function useLenderRoom(lenderId: string | undefined) {
  useSocketRoom(lenderId ? `lender:${lenderId}` : null);
}

export function useBorrowerRoom(borrowerId: string | undefined) {
  useSocketRoom(borrowerId ? `borrower:${borrowerId}` : null);
}

export function useFieldAgentRoom(agentId: string | undefined) {
  useSocketRoom(agentId ? `agent:${agentId}` : null);
}
