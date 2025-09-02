import { Workflow, NodeKind } from "@/types/core";

export type NodeVM = {
  id: string;
  kind: NodeKind;
  title: string;
  x: number;
  y: number;
};
export type EdgeVM = { id: string; from: string; to: string };

type GetTitleFn = (ref: string) => { title: string; kind: NodeVM["kind"] };

export function toViewModels(
  wf: Workflow,
  layout: Record<string, { x: number; y: number }>,
  getTitle: GetTitleFn
) {
  const nodes: NodeVM[] = [];
  const edges: EdgeVM[] = [];
  const lanes = wf.graph?.lanes ?? [];
  const H_GAP = 96;
  const V_GAP = 120;
  const NODE_WIDTH = 224;
  const NODE_HEIGHT = 96;

  lanes.forEach((lane, laneIndex) => {
    lane.nodes.forEach((node, nodeIndex) => {
      const pos = layout[node.id] ?? {
        x: (NODE_WIDTH + H_GAP) * nodeIndex,
        y: (NODE_HEIGHT + V_GAP) * laneIndex,
      };
      const meta = getTitle(node.ref);
      nodes.push({ ...meta, ...pos, id: node.id });
    });
    lane.edges.forEach(([from, to], edgeIndex) => {
      edges.push({ id: `${lane.laneId}:${edgeIndex}`, from, to });
    });
  });

  return { nodes, edges };
}
