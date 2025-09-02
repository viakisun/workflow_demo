import { Workflow, RulePack, NodeRegistryEntry } from "@/types/core";

type ExportBundle = {
  version: string;
  savedAt: string;
  workflow?: Workflow;
  registry?: NodeRegistryEntry[];
  rules?: RulePack;
  layout?: Record<string, { x: number; y: number }>;
};

export function exportProject(data: Omit<ExportBundle, "version" | "savedAt">) {
  const bundle: ExportBundle = {
    version: "0.1.0",
    savedAt: new Date().toISOString(),
    ...data,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `project.agriwf.json`;
  a.click();
  URL.revokeObjectURL(url);
}
