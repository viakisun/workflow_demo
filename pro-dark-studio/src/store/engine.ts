import { create } from "zustand";
import type { GlobalContext, ActionSpec } from "@/types/core";
import { nanoid } from "nanoid";
import { createSeededRandom } from "@/lib/simulator/prng";

export type EngineEvent = {
  id: string;
  tick: number;
  timestamp: number;
  type: string;
  payload: Record<string, any>;
};

export type OperatorPrompt = {
    id: string;
    ruleId: string;
    message: string;
    timeout?: string;
    timeoutAction?: ActionSpec;
};

type EngineState = {
  tick: number;
  globalContext: GlobalContext | null;
  eventBus: EngineEvent[];
  cooldowns: Record<string, number>;
  locks: Set<string>;
  prng: () => number;
  seed: number;
  isRunning: boolean;
  pendingPrompts: OperatorPrompt[];

  // Actions
  initialize: (seed: number, context: GlobalContext) => void;
  setGlobalContext: (context: GlobalContext) => void;
  addEvent: (event: Omit<EngineEvent, "id" | "timestamp" | "tick">) => void;
  incrementTick: () => void;
  setCooldown: (ruleId: string, endTick: number) => void;
  acquireLock: (lock: string) => boolean;
  releaseLock: (lock: string) => void;
  toggleIsRunning: () => void;
  addPrompt: (prompt: Omit<OperatorPrompt, "id">) => void;
  resolvePrompt: (id: string, resolution: "ack" | "nack") => void;
  reset: () => void;
};

const getInitialState = (seed = 0) => ({
  tick: 0,
  globalContext: null,
  eventBus: [],
  cooldowns: {},
  locks: new Set(),
  isRunning: false,
  pendingPrompts: [],
  seed,
  prng: createSeededRandom(seed),
});

export const useEngineStore = create<EngineState>((set, get) => ({
  ...getInitialState(),

  initialize: (seed, context) => {
    set({
      ...getInitialState(seed),
      globalContext: context,
    });
  },

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
    if (locks.has(lock)) return false;
    set((state) => ({ locks: new Set(state.locks).add(lock) }));
    return true;
  },

  releaseLock: (lock) => {
    set((state) => {
      const newLocks = new Set(state.locks);
      newLocks.delete(lock);
      return { locks: newLocks };
    });
  },

  toggleIsRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  addPrompt: (prompt) => {
    const newPrompt = { ...prompt, id: nanoid() };
    set((state) => ({ pendingPrompts: [...state.pendingPrompts, newPrompt] }));
  },

  resolvePrompt: (id, resolution) => {
    console.log(`Prompt ${id} resolved with ${resolution}`);
    set((state) => ({
      pendingPrompts: state.pendingPrompts.filter((p) => p.id !== id),
    }));
  },

  reset: () => {
    const { seed, globalContext } = get();
    if (globalContext) {
      get().initialize(seed, globalContext);
    } else {
      set(getInitialState(seed));
    }
  },
}));
