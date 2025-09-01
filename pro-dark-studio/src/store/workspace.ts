import { create } from "zustand";
import { Workflow, RulePack, NodeRegistryEntry } from "@/types/core";
import { ValidationResult, safeParse } from "@/schema/validate";
import { ZWorkflow, ZRulePack } from "@/schema/workflow";
import { NODE_REGISTRY } from "@/lib/node-registry";
import { migrateWorkflow } from "@/lib/migrate";
import { loadSeed } from "@/lib/load-seed";

type WorkspaceState = {
  workflow: ValidationResult<Workflow> | null;
  rules: ValidationResult<RulePack> | null;
  registry: NodeRegistryEntry[];
  loadFromSeed: () => Promise<void>;
  importJson: (workflowJson: any, rulesJson: any) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workflow: null,
  rules: null,
  registry: NODE_REGISTRY,
  loadFromSeed: async () => {
    try {
      const wfData = await loadSeed<any>("/seeds/workflow.orchestration.v1.json");
      const rulesData = await loadSeed<any>("/seeds/ruleset.orchestration.v1.json");

      const migratedWf = migrateWorkflow(wfData);
      const workflow = safeParse(ZWorkflow, migratedWf);
      const rules = safeParse(ZRulePack, rulesData);

      set({ workflow, rules });
    } catch (error) {
      console.error("Failed to load seed data:", error);
    }
  },
  importJson: (workflowJson, rulesJson) => {
    const migratedWf = migrateWorkflow(workflowJson);
    const workflow = safeParse(ZWorkflow, migratedWf);
    const rules = safeParse(ZRulePack, rulesJson);
    set({ workflow, rules });
  },
}));
