import type { Traffic, GlobalContext } from "@/types/core";
import { WritableDraft } from "immer";

export function updateTraffic(
  traffic: WritableDraft<Traffic>,
  context: WritableDraft<GlobalContext>
) {
  // Decrement TTL for oneway segments
  if (traffic.oneway) {
    for (const segment in traffic.oneway) {
      traffic.oneway[segment] -= 1;
      if (traffic.oneway[segment] <= 0) {
        delete traffic.oneway[segment];
      }
    }
  }

  // Other traffic model updates could go here, e.g., recalculating conflict probabilities.
}
