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

export type Recording = {
    initialContext: GlobalContext;
    initialSeed: number;
    events: EngineEvent[];
}

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
  isRecording: boolean;
  isReplaying: boolean;
  playhead: number;
  recording: Recording | null;

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
  startRecording: () => void;
  stopRecording: () => void;
  loadRecording: (recording: Recording) => void;
  setPlayhead: (tick: number) => void;
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
  isRecording: false,
  isReplaying: false,
  playhead: 0,
  recording: null,
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
    set((state) => {
        const newBus = [newEvent, ...state.eventBus];
        if(state.isRecording && state.recording) {
            return {
                eventBus: newBus,
                recording: {
                    ...state.recording,
                    events: [...state.recording.events, newEvent]
                }
            }
        }
        return { eventBus: newBus };
    });
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

  toggleIsRunning: () => {
    if(get().isReplaying) return; // Can't run while replaying
    set((state) => ({ isRunning: !state.isRunning }))
  },

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

  startRecording: () => {
    const { globalContext, seed } = get();
    if (!globalContext) return;
    set({
      isRecording: true,
      recording: {
        initialContext: JSON.parse(JSON.stringify(globalContext)), // Deep copy
        initialSeed: seed,
        events: [],
      },
    });
  },

  stopRecording: () => {
    set({ isRecording: false });
  },

  loadRecording: (recording) => {
    set({
      ...getInitialState(recording.initialSeed),
      recording,
      isReplaying: true,
      isRunning: false,
      globalContext: recording.initialContext,
    });
  },

  setPlayhead: (tick) => {
    if(!get().isReplaying || !get().recording) return;

    // This is the core of the replayer. It re-calculates the context at a given tick.
    const { initialContext } = get().recording!;
    let contextAtTick = initialContext;

    // This is a simplified replay. A full implementation would need to re-run
    // the simulation and rule engine tick-by-tick up to the playhead.
    // For now, we'll just set the playhead and let the UI components react.

    set({ playhead: tick });
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
