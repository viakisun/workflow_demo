"use client";

import { useState, useMemo } from "react";
import { SegmentedTabs } from "@/components/primitives/SegmentedTabs";
import JsonPreview from "./inspector/JsonPreview";
import ParamEditor from "./inspector/ParamEditor";
import RulesPanel from "./inspector/RulesPanel";
import { useGraphStore } from "@/store/graph";
import { useWorkspaceStore } from "@/store/workspace";

export default function Inspector() {
  const [activeTab, setActiveTab] = useState("params");
  const { selection } = useGraphStore();
  const { registry, workflow, setDocs } = useWorkspaceStore();

  const selectedNodeId = useMemo(
    () => selection.nodes.values().next().value,
    [selection.nodes]
  );

  const { selectedNode, nodeRegistryEntry } = useMemo(() => {
    if (!selectedNodeId || !workflow) return { selectedNode: null, nodeRegistryEntry: null };
    for (const lane of workflow.graph.lanes) {
      const node = lane.nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        const entry = registry.find((r) => r.nodeId === node.ref);
        return { selectedNode: node, nodeRegistryEntry: entry };
      }
    }
    return { selectedNode: null, nodeRegistryEntry: null };
  }, [selectedNodeId, workflow, registry]);


  const handleParamChange = (param: string, value: any) => {
    if (!selectedNode || !workflow) return;

    const newWorkflow = JSON.parse(JSON.stringify(workflow));

    for (const lane of newWorkflow.graph.lanes) {
      const nodeToUpdate = lane.nodes.find((n) => n.id === selectedNodeId);
      if (nodeToUpdate) {
        if (!nodeToUpdate.params) {
          nodeToUpdate.params = {};
        }
        nodeToUpdate.params[param] = value;
        break;
      }
    }
    setDocs({ workflow: newWorkflow });
  };

  return (
    <aside className="border-l border-stroke bg-panel-2 p-3 flex flex-col h-full">
      <SegmentedTabs
        tabs={[
          { id: "params", label: "Params" },
          { id: "rules", label: "Rules" },
          { id: "json", label: "JSON Preview" },
        ]}
        initial="params"
        onTabChange={setActiveTab}
      />
      <div className="flex-1 mt-4 overflow-y-auto">
        {activeTab === "params" && (
          <div>
            {selectedNode && nodeRegistryEntry?.paramsSchema ? (
              <ParamEditor
                paramsSchema={nodeRegistryEntry.paramsSchema}
                params={selectedNode.params ?? {}}
                onParamChange={handleParamChange}
              />
            ) : (
              <div className="text-sm text-muted p-4">
                {selectedNodeId ? "No parameters to edit for this node." : "Select a node to see its parameters."}
              </div>
            )}
          </div>
        )}
        {activeTab === "rules" && <RulesPanel />}
        {activeTab === "json" && <JsonPreview />}
      </div>
    </aside>
  );
}
