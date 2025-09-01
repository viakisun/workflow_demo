"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/primitives/SegmentedTabs";
import { Workflow, RulePack, NodeRegistryEntry } from "@/types/core";
import { ValidationResult } from "@/schema/validate";
import { Badge } from "./primitives/Badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type InspectorProps = {
  workflow?: ValidationResult<Workflow>;
  rules?: ValidationResult<RulePack>;
  registry?: NodeRegistryEntry[];
};

function JsonPreviewSection({
  title,
  validation,
  data,
}: {
  title: string;
  validation?: { ok: boolean; issues: string[] };
  data?: any;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasIssues = validation && !validation.ok;

  return (
    <div className="border-t border-stroke mt-4 pt-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="size-4 text-muted" />
          ) : (
            <ChevronRight className="size-4 text-muted" />
          )}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {validation && (
          <Badge color={validation.ok ? "green" : "yellow"}>
            {validation.ok ? "Valid" : `Issues: ${validation.issues.length}`}
          </Badge>
        )}
      </button>
      {isOpen && (
        <div className="mt-2 pl-2">
          {hasIssues && (
            <div className="mb-2 p-2 bg-yellow-900/20 rounded-lg">
              <ul className="text-xs text-yellow-300 list-disc list-inside">
                {validation.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          <pre className="text-xs bg-panel p-2 rounded-lg overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function Inspector({
  workflow,
  rules,
  registry,
}: InspectorProps) {
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <aside className="border-l border-stroke bg-panel-2 p-3 flex flex-col">
      <SegmentedTabs
        tabs={[
          { id: "rules", label: "Rules" },
          { id: "json", label: "JSON Preview" },
        ]}
        initial="rules"
        onTabChange={setActiveTab}
      />
      <div className="flex-1 mt-4 overflow-y-auto">
        {activeTab === "rules" && (
          <div className="text-sm text-muted">
            Rule editing will be implemented in a future step.
          </div>
        )}
        {activeTab === "json" && (
          <div>
            <JsonPreviewSection
              title="Workflow"
              validation={workflow}
              data={workflow?.data}
            />
            <JsonPreviewSection
              title="Rule Pack"
              validation={rules}
              data={rules?.data}
            />
            <JsonPreviewSection title="Node Registry" data={registry} />
          </div>
        )}
      </div>
    </aside>
  );
}
