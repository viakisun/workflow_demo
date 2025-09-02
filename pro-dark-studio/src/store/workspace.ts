import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workflow, RulePack, NodeRegistryEntry } from "@/types/core";
import { useGraphStore } from "./graph";
import { toViewModels } from "@/lib/normalize";
import { loadSeed } from "@/lib/load-seed";
import { migrateWorkflow, migrateRegistry, migrateRules } from "@/lib/migrate";
import { customNodeRegistry } from "@/lib/plugins/registry";

type WorkspaceState = {
  workflow?: Workflow;
  rules?: RulePack;
  registry: NodeRegistryEntry[];
  graphLayout: Record<string, { x: number; y: number }>;
  setDocs: (p: Partial<Pick<WorkspaceState, "workflow" | "rules" | "registry">>, clearLayout?: boolean) => void;
  setLayout: (id: string, pos: { x: number; y: number }) => void;
  loadSeedData: () => Promise<void>;
  clear: () => void;
};

const getTitle = (registry: NodeRegistryEntry[]) => (ref: string) => {
  const entry = registry.find((r) => r.nodeId === ref);
  return {
    title: entry?.title ?? "Unknown Ref",
    kind: entry?.type ?? "end",
  };
};

export const useWorkspaceStore = create(
  persist<WorkspaceState>(
    (set, get) => ({
      registry: [],
      graphLayout: {},
      setDocs: (p, clearLayout = false) => {
        const currentLayout = get().graphLayout;
        const newLayout = clearLayout ? {} : currentLayout;

        const newRegistry = p.registry ? [...p.registry, ...customNodeRegistry] : get().registry;

        set((s) => ({ ...s, ...p, registry: newRegistry, graphLayout: newLayout }));

        const { workflow, registry, graphLayout } = get();
        if (workflow) {
          const { nodes, edges } = toViewModels(
            workflow,
            graphLayout,
            getTitle(registry)
          );
          useGraphStore.getState().setGraph({ nodes, edges });
        }
      },
      setLayout: (id, pos) =>
        set((s) => ({ graphLayout: { ...s.graphLayout, [id]: pos } })),
      loadSeedData: async () => {
        const wf = await loadSeed<any>("/seeds/workflow.orchestration.v1.json");
        const ru = await loadSeed<any>("/seeds/ruleset.orchestration.v1.json");
        const re = await loadSeed<any>("/seeds/registry.catalog.v1.json");
        get().setDocs(
          {
            workflow: migrateWorkflow(wf),
            rules: migrateRules(ru),
            registry: migrateRegistry(re),
          },
          true
        );
      },
      clear: () =>
        set({
          workflow: undefined,
          rules: undefined,
          registry: [],
          graphLayout: {},
        }),
    }),
    {
      name: "agri-workflow-storage",
    }
  )
);

useGraphStore.subscribe((state, prevState) => {
  if (state.nodes !== prevState.nodes) {
    const layout = state.nodes.reduce((acc, node) => {
      acc[node.id] = { x: node.x, y: node.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);

    const currentLayout = useWorkspaceStore.getState().graphLayout;
    if (JSON.stringify(layout) !== JSON.stringify(currentLayout)) {
        useWorkspaceStore.setState({ graphLayout: layout });
    }
  }
});
