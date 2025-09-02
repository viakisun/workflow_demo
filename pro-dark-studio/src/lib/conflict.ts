import { NodeRegistryEntry } from "@/types/core";
import { NodeVM } from "@/store/graph";

export type ConflictCheckResult = {
  enabled: boolean;
  reason?: "conflict";
  details?: string[];
};

export function checkNodeConflicts(
  nodeToAdd: NodeRegistryEntry,
  existingNodes: NodeVM[],
  registry: NodeRegistryEntry[]
): ConflictCheckResult {
  if (!nodeToAdd.conflicts || nodeToAdd.conflicts.length === 0) {
    return { enabled: true };
  }

  const existingNodeRefs = new Set(existingNodes.map((n) => n.ref));

  const conflictingNodes = nodeToAdd.conflicts.filter((conflictId) =>
    existingNodeRefs.has(conflictId)
  );

  if (conflictingNodes.length > 0) {
    return {
      enabled: false,
      reason: "conflict",
      details: conflictingNodes.map(
        (id) => registry.find((n) => n.nodeId === id)?.title ?? id
      ),
    };
  }

  return { enabled: true };
}
