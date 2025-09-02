"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/primitives/SegmentedTabs";
import JsonPreview from "./inspector/JsonPreview";

export default function Inspector() {
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <aside className="border-l border-stroke bg-panel-2 p-3 flex flex-col h-full">
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
          <div className="text-sm text-muted p-4">
            Rule editing will be implemented in a future step.
          </div>
        )}
        {activeTab === "json" && <JsonPreview />}
      </div>
    </aside>
  );
}
