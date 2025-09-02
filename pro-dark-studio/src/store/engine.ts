import { create } from "zustand";
import type { GlobalContext } from "@/types/core";
import { nanoid } from "nanoid";

// A simple event structure for the event bus
export type EngineEvent = {
  id: string;
  tick: number;
  timestamp: number;
  type: string; // e.g., "rule_hit", "rule_error", "action_executed"
  payload: Record<string, any>;
};

type EngineState = {
  tick: number;
  globalContext: GlobalContext | null;
  eventBus: EngineEvent[];
  cooldowns: Record<string, number>; // ruleId -> tick when cooldown ends
  locks: Set<string>; // active exclusivity locks

  // Actions
  setGlobalContext: (context: GlobalContext) => void;
  addEvent: (event: Omit<EngineEvent, "id" | "timestamp" | "tick">) => void;
  incrementTick: () => void;
  setCooldown: (ruleId: string, endTick: number) => void;
  acquireLock: (lock: string) => boolean;
  releaseLock: (lock: string) => void;

  // For UI to control the engine
  isRunning: boolean;
  toggleIsRunning: () => void;
  reset: () => void;
};

const initialState = {
  tick: 0,
  globalContext: null,
  eventBus: [],
  cooldowns: {},
  locks: new Set(),
  isRunning: false,
};

export const useEngineStore = create<EngineState>((set, get) => ({
  ...initialState,

  setGlobalContext: (context) => set({ globalContext: context }),

  addEvent: (event) => {
    const newEvent: EngineEvent = {
      ...event,
      id: nanoid(),
      timestamp: Date.now(),
      tick: get().tick,
    };
    set((state) => ({ eventBus: [newEvent, ...state.eventBus] }));
  },

  incrementTick: () => set((state) => ({ tick: state.tick + 1 })),

  setCooldown: (ruleId, endTick) => {
    set((state) => ({
      cooldowns: { ...state.cooldowns, [ruleId]: endTick },
    }));
  },

  acquireLock: (lock) => {
    const { locks } = get();
    if (locks.has(lock)) {
      return false; // Lock already held
    }
    const newLocks = new Set(locks);
    newLocks.add(lock);
    set({ locks: newLocks });
    return true;
  },

  releaseLock: (lock) => {
    const { locks } = get();
    const newLocks = new Set(locks);
    newLocks.delete(lock);
    set({ locks: newLocks });
  },

  toggleIsRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  reset: () => set(initialState),
}));
