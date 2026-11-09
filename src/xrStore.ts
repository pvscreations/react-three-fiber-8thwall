import { useSyncExternalStore } from "react";

export type TrackingStatus = "INITIALIZING" | "LIMITED" | "NORMAL";

export type XRState = {
  tracking: TrackingStatus;
  reason: string;
  placed: boolean;
  position: [number, number, number]; // floor point where the cube was placed
};

let state: XRState = {
  tracking: "INITIALIZING",
  reason: "",
  placed: false,
  position: [0, 0, -2],
};

const listeners = new Set<() => void>();

export const xrStore = {
  get: () => state,
  set: (patch: Partial<XRState>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useXRState = () =>
  useSyncExternalStore(xrStore.subscribe, xrStore.get);
