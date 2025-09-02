"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  StepForward,
  Undo,
  Redo,
  Search,
  Upload,
  Download,
} from "lucide-react";
import { IconButton } from "./primitives/IconButton";
import { Button } from "./primitives/Button";
import { RobotType } from "@/types/core";
import { useUIStore } from "@/store/ui";
import { useWorkspaceStore } from "@/store/workspace";
import { useGraphStore } from "@/store/graph";
import ImportMenu from "./io/ImportMenu";
import ErrorOverlay from "./io/ErrorOverlay";
import { importJsonFile } from "@/lib/importers";
import { ZWorkflow, ZRulePack, ZRegistryEntry } from "@/schema/workflow";
import {
  migrateWorkflow,
  migrateRules,
  migrateRegistry,
} from "@/lib/migrate";
import { exportProject } from "@/lib/exporter";

export default function TopBar() {
  const { setSelectedDevice } = useUIStore();
  const { workflow, rules, registry, graphLayout, setDocs, loadSeedData } =
    useWorkspaceStore();
  const { addNode, undo, redo } = useGraphStore();
  const [isImportMenuOpen, setImportMenuOpen] = useState(false);
  const [importIssues, setImportIssues] = useState<string[] | null>(null);
  const importMenuRef = useRef<HTMLDivElement>(null);

  const handleImport =
    (
      docType: "workflow" | "rules" | "registry",
      schema: any,
      migrate: (x: any) => any
    ) =>
    async (file: File) => {
      const res = await importJsonFile(file, schema, migrate);
      if (!res.ok) {
        setImportIssues(res.issues);
      } else {
        setDocs({ [docType]: res.data });
      }
      setImportMenuOpen(false);
    };

  const handleExport = () => {
    exportProject({ workflow, rules, registry, layout: graphLayout });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        importMenuRef.current &&
        !importMenuRef.current.contains(event.target as Node)
      ) {
        setImportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="h-14 border-b border-stroke bg-panel-2 flex items-center gap-2 px-3 flex-shrink-0">
        <Button
          variant="secondary"
          onClick={() => addNode("action", "New Action")}
        >
          + Add node
        </Button>
        <div className="flex items-center gap-1">
          <IconButton icon={Play} label="Play" />
          <IconButton icon={Pause} label="Pause" />
          <IconButton icon={StepForward} label="Step" />
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={Undo} label="Undo" onClick={undo} />
          <IconButton icon={Redo} label="Redo" onClick={redo} />
        </div>
        <div className="mx-auto max-w-xl w-full flex items-center gap-2 px-4">
          <Search className="size-4 text-muted" />
          <input
            aria-label="Search"
            placeholder="Search nodes..."
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-panel border border-stroke rounded-lg px-2 py-1.5 text-sm text-text"
            onChange={(e) => setSelectedDevice(e.target.value as RobotType)}
            defaultValue="AGV"
          >
            <option value="AGV">AGV</option>
            <option value="SPRAY">SPRAY</option>
            <option value="IRR">IRR</option>
            <option value="SCAN">SCAN</option>
          </select>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setImportMenuOpen(!isImportMenuOpen)}
            >
              <Upload className="size-4 mr-2" />
              Import
            </Button>
            {isImportMenuOpen && (
              <ImportMenu
                ref={importMenuRef}
                onImportExample={loadSeedData}
                onUploadWorkflow={handleImport("workflow", ZWorkflow, migrateWorkflow)}
                onUploadRules={handleImport("rules", ZRulePack, migrateRules)}
                onUploadRegistry={handleImport(
                  "registry",
                  ZRegistryEntry.array(),
                  migrateRegistry
                )}
              />
            )}
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <div
            className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500"
            aria-label="User avatar"
          />
        </div>
      </header>
      {importIssues && (
        <ErrorOverlay
          issues={importIssues}
          onClose={() => setImportIssues(null)}
        />
      )}
    </>
  );
}
