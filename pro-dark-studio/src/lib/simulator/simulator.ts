import { produce } from "immer";
import type { GlobalContext } from "@/types/core";
import { updateRobot } from "./robot";
import { updateResources } from "./resources";
import { updateTraffic } from "./traffic";

/**
 * Runs one tick of the simulation, updating the state of the world
 * based on the models for robots, resources, and traffic.
 * This function should run BEFORE the rules engine evaluates the new state.
 * @param context The current global context.
 * @returns The new global context for the next tick.
 */
export function runSimulationTick(
  context: GlobalContext
): GlobalContext {

  const nextContext = produce(context, (draft) => {
    // The order of these updates can matter.
    // For now, a simple sequential update is fine.

    // 1. Update resources (e.g., lease expiry)
    updateResources(draft.resources, draft);

    // 2. Update traffic (e.g., oneway TTL)
    updateTraffic(draft.traffic, draft);

    // 3. Update all robots (e.g., battery drain, charging)
    if (draft.robots) {
        for (const robotId in draft.robots) {
            updateRobot(draft.robots[robotId], draft);
        }
    }
  });

  return nextContext;
}
