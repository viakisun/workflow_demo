"use client";

import GraphCanvas from "./graph/GraphCanvas";
import Dropzone from "./io/Dropzone";
import { useWorkspaceStore } from "@/store/workspace";
import { ZWorkflow, ZRulePack, ZRegistryEntry } from "@/schema/workflow";
import { importJsonFile } from "@/lib/importers";
import {
  migrateWorkflow,
  migrateRules,
  migrateRegistry,
} from "@/lib/migrate";
import { useState } from "react";
import ErrorOverlay from "./io/ErrorOverlay";

export default function Canvas() {
  const { setDocs } = useWorkspaceStore();
  const [importIssues, setImportIssues] = useState<string[] | null>(null);

  const handleDrop = async (files: FileList) => {
    const issues: string[] = [];
    for (const file of files) {
      // This is a simple way to guess the file type. A real app would need a more robust method.
      if (file.name.includes("workflow")) {
        const res = await importJsonFile(file, ZWorkflow, migrateWorkflow);
        if (res.ok) {
          setDocs({ workflow: res.data }, true);
        } else {
          issues.push(...res.issues.map((i) => `Workflow: ${i}`));
        }
      } else if (file.name.includes("rules")) {
        const res = await importJsonFile(file, ZRulePack, migrateRules);
        if (res.ok) {
          setDocs({ rules: res.data });
        } else {
          issues.push(...res.issues.map((i) => `Rules: ${i}`));
        }
      } else if (file.name.includes("registry")) {
        const res = await importJsonFile(
          file,
          ZRegistryEntry.array(),
          migrateRegistry
        );
        if (res.ok) {
          setDocs({ registry: res.data });
        } else {
          issues.push(...res.issues.map((i) => `Registry: ${i}`));
        }
      }
    }
    if (issues.length > 0) {
      setImportIssues(issues);
    }
  };

  return (
    <div className="relative h-full">
      <GraphCanvas />
      <Dropzone onDrop={handleDrop} />
      {importIssues && (
        <ErrorOverlay
          issues={importIssues}
          onClose={() => setImportIssues(null)}
        />
      )}
    </div>
  );
}
