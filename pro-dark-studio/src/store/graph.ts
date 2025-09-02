import { create } from "zustand";
import { nanoid } from "nanoid";
import { NodeKind } from "@/types/core";

type NodeVM = {
  id: string;
  ref: string;
  kind: NodeKind;
  title: string;
  x: number;
  y: number;
};
type EdgeVM = {
  id: string;
  from: string;
  to: string;
};
type Sel = { nodes: Set<string>; edges: Set<string> };
type HistoryState = { nodes: NodeVM[]; edges: EdgeVM[] };

type GraphState = {
  transform: { x: number; y: number; scale: number };
  nodes: NodeVM[];
  edges: EdgeVM[];
  selection: Sel;
  history: { past: HistoryState[]; future: HistoryState[] };
  tempEdge?: { fromNode: string; fromSide: "in" | "out"; toMouse: { x: number; y: number } } | null;
  setTransform: (t: GraphState["transform"]) => void;
  addNode: (ref: string, kind: NodeKind, title: string, x: number, y: number) => void;
  moveNode: (id: string, x: number, y: number) => void;
  deleteSelection: () => void;
  select: (s: { nodes?: string[]; edges?: string[] }) => void;
  beginConnect: (id: string, side: "in" | "out", e: React.MouseEvent) => void;
  endConnect: (targetId: string) => void;
  updateMousePosition: (e: MouseEvent) => void;
  setGraph: (graph: { nodes: NodeVM[]; edges: EdgeVM[] }) => void;
  undo: () => void;
  redo: () => void;
};

const recordHistory = (set, get) => {
  const { nodes, edges, history } = get();
  const newPast = [...history.past, { nodes, edges }];
  set({ history: { past: newPast, future: [] } });
};

export const useGraphStore = create<GraphState>((set, get) => ({
  transform: { x: 400, y: 200, scale: 1 },
  nodes: [],
  edges: [],
  selection: { nodes: new Set(), edges: new Set() },
  history: { past: [], future: [] },
  tempEdge: null,

  setTransform: (t) => set({ transform: t }),

  addNode: (ref, kind, title, x, y) => {
    recordHistory(set, get);
    const newNode = { id: nanoid(), ref, kind, title, x, y };
    set((s) => ({ nodes: [...s.nodes, newNode] }));
  },

  moveNode: (id, x, y) => {
    // Note: not adding move to history for simplicity to avoid flooding the history stack.
    // A real implementation would use throttling/debouncing.
    set(s => ({
      nodes: s.nodes.map(n => (n.id === id ? { ...n, x, y } : n)),
    }));
  },

  deleteSelection: () => {
    recordHistory(set, get);
    const { nodes, edges, selection } = get();
    const newNodes = nodes.filter(n => !selection.nodes.has(n.id));
    // Also delete edges connected to deleted nodes
    const nodeIds = new Set(newNodes.map(n => n.id));
    const newEdges = edges.filter(e => !selection.edges.has(e.id) && nodeIds.has(e.from) && nodeIds.has(e.to));
    set({ nodes: newNodes, edges: newEdges, selection: { nodes: new Set(), edges: new Set() } });
  },

  select: ({ nodes = [], edges = [] }) => set({ selection: { nodes: new Set(nodes), edges: new Set(edges) } }),

  beginConnect: (id, side, e) => {
    recordHistory(set, get);
    const { transform } = get();
    set({ tempEdge: { fromNode: id, fromSide: side, toMouse: { x: (e.clientX - transform.x) / transform.scale, y: (e.clientY - transform.y) / transform.scale } } });
  },

  updateMousePosition: (e) => {
    const { tempEdge, transform } = get();
    if (!tempEdge) return;
    set({ tempEdge: { ...tempEdge, toMouse: { x: (e.clientX - transform.x) / transform.scale, y: (e.clientY - transform.y) / transform.scale } } });
  },

  endConnect: (targetId) => {
    const { tempEdge, nodes, edges } = get();
    if (!tempEdge || tempEdge.fromNode === targetId) {
      set({ tempEdge: null });
      return;
    }
    const newEdge = { id: nanoid(), from: tempEdge.fromNode, to: targetId };
    set({ edges: [...edges, newEdge], tempEdge: null });
  },

  undo: () => {
    const { history, nodes, edges } = get();
    const { past, future } = history;
    if (past.length === 0) return;
    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [{ nodes, edges }, ...future];
    set({ ...previousState, history: { past: newPast, future: newFuture } });
  },

  redo: () => {
    const { history, nodes, edges } = get();
    const { past, future } = history;
    if (future.length === 0) return;
    const nextState = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, { nodes, edges }];
    set({ ...nextState, history: { past: newPast, future: newFuture } });
  },

  setGraph: (graph) => {
    set({ nodes: graph.nodes, edges: graph.edges, history: { past: [], future: [] }, selection: { nodes: new Set(), edges: new Set() } });
  },
}));
