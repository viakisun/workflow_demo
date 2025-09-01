import { SegmentedTabs } from "@/components/primitives/SegmentedTabs";

export default function Inspector() {
  return (
    <aside className="border-l border-stroke bg-panel-2 p-3">
      <SegmentedTabs
        tabs={[
          { id: "rules", label: "Rules" },
          { id: "json", label: "JSON preview" },
        ]}
        initial="rules"
      />
      {/* Panel bodies will be mounted in later steps */}
    </aside>
  );
}
