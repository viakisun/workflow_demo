import type { Resources, GlobalContext } from "@/types/core";
import { WritableDraft } from "immer";

export function updateResources(
  resources: WritableDraft<Resources>,
  context: WritableDraft<GlobalContext>
) {
  // For now, resource state is primarily changed by rules (e.g., reserve/release actions).
  // This function could be used in the future for things like
  // spontaneous resource regeneration, depletion over time, or handling lease expiries.

  // Example: Expire leases on reservations (placeholder)
  // for (const station of Object.values(resources.docks)) {
  //   // check station.leases and remove if expired
  // }
}
