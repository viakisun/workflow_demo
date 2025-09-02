import type { ActionSpec, GlobalContext } from "@/types/core";
import { useEngineStore } from "@/store/engine";
import { WritableDraft } from "immer";

// Action handlers modify a DRAFT of the context.
// The engine will commit these changes atomically using Immer.
export type ActionHandler = (
  context: WritableDraft<GlobalContext>,
  action: ActionSpec
) => void;

const plan_route: ActionHandler = (context, action) => {
  if (action.type !== "plan_route") return;
  console.log(`[Action] Planning route for ${action.to ?? 'any'} to ${action.dest}`);
  // In a real implementation, this would interact with a navigation system.
  useEngineStore.getState().addEvent({ type: "action_plan_route", payload: { ...action } });
};

const reserve: ActionHandler = (context, action) => {
  if (action.type !== "reserve" || !context.resources[action.resource]) return;

  const station = context.resources[action.resource][action.id];
  if (station && station.queue.length < station.slots) {
    station.queue.push("some_robot_id"); // Placeholder
    console.log(`[Action] Reserving ${action.resource} ${action.id}`);
    useEngineStore.getState().addEvent({ type: "action_reserve", payload: { ...action } });
  }
};

const release: ActionHandler = (context, action) => {
    if (action.type !== "release" || !context.resources[action.resource]) return;

    const station = context.resources[action.resource][action.id];
    if (station) {
      station.queue.shift(); // Placeholder
      console.log(`[Action] Releasing ${action.resource} ${action.id}`);
      useEngineStore.getState().addEvent({ type: "action_release", payload: { ...action } });
    }
};

// ... other action handlers would go here

export const actionHandlers: Record<string, ActionHandler> = {
  plan_route,
  reserve,
  release,
  // execute,
  // dispatch,
  // if,
  // log,
  // ... etc
};
