import { create } from "zustand";

interface RealtimeState {
  isConnected: boolean;
  connectionError: string | null;
  lastEventAt: string | null;
  subscribedRooms: Set<string>;

  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setLastEventAt: (timestamp: string) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  clearRooms: () => void;
}

export const useRealtimeStore = create<RealtimeState>()((set) => ({
  isConnected: false,
  connectionError: null,
  lastEventAt: null,
  subscribedRooms: new Set(),

  setConnected: (connected) => set({
    isConnected: connected,
    connectionError: connected ? null : undefined as string | null | undefined,
  } as Partial<RealtimeState>),
  setConnectionError: (error) => set({ connectionError: error }),
  setLastEventAt: (timestamp) => set({ lastEventAt: timestamp }),
  addRoom: (room) => set((state) => {
    const newRooms = new Set(state.subscribedRooms);
    newRooms.add(room);
    return { subscribedRooms: newRooms };
  }),
  removeRoom: (room) => set((state) => {
    const newRooms = new Set(state.subscribedRooms);
    newRooms.delete(room);
    return { subscribedRooms: newRooms };
  }),
  clearRooms: () => set({ subscribedRooms: new Set() }),
}));
