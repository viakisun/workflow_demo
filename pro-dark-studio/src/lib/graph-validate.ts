import { Workflow } from "@/types/core";

export function validateGraphRefs(wf: Workflow): string[] {
  const issues: string[] = [];
  if (!wf.graph || !wf.graph.lanes) {
    return ["Workflow graph or lanes are not defined."];
  }
  for (const lane of wf.graph.lanes) {
    const ids = new Set(lane.nodes.map(n => n.id));
    if (ids.size !== lane.nodes.length) {
      issues.push(`Lane ${lane.laneId}: duplicate node ids`);
    }
    for (const [a, b] of lane.edges) {
      if (!ids.has(a)) {
        issues.push(`Lane ${lane.laneId}: edge from missing node ${a}`);
      }
      if (!ids.has(b)) {
        issues.push(`Lane ${lane.laneId}: edge to missing node ${b}`);
      }
      if (a === b) {
        issues.push(`Lane ${lane.laneId}: self edge on node ${a}`);
      }
    }
  }
  return issues;
}
