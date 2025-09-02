import { NodeRegistryEntry, NodeKind } from "@/types/core";
import { Badge } from "../primitives/Badge";
import { Tooltip } from "../primitives/Tooltip";
import { clsx } from "clsx";
import { CapabilityFilterResult } from "@/lib/capability";
import { ConflictCheckResult } from "@/lib/conflict";

type PaletteNodeItemProps = {
  node: NodeRegistryEntry;
  capCheck: CapabilityFilterResult;
  conflictCheck: ConflictCheckResult;
};

const getNodeColor = (type: NodeKind): "blue" | "yellow" | "green" | "gray" => {
  switch (type) {
    case "trigger":
      return "blue";
    case "condition":
      return "yellow";
    case "action":
      return "green";
    case "end":
      return "gray";
    default:
      return "gray";
  }
};

const getDisabledReason = (
  capCheck: CapabilityFilterResult,
  conflictCheck: ConflictCheckResult
): string | null => {
  if (conflictCheck.reason === "conflict") {
    return `Conflicts with: ${conflictCheck.details?.join(", ")}`;
  }
  if (capCheck.reason === "missing_caps") {
    return `Requires: ${capCheck.details?.missing.join(", ")}`;
  }
  return null;
};

export default function PaletteNodeItem({
  node,
  capCheck,
  conflictCheck,
}: PaletteNodeItemProps) {
  const isEnabled = capCheck.enabled && conflictCheck.enabled;
  const reason = getDisabledReason(capCheck, conflictCheck);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEnabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/json", JSON.stringify(node));
  };

  return (
    <Tooltip label={reason ?? ""} side="right">
      <div
        draggable={isEnabled}
        onDragStart={handleDragStart}
        className={clsx(
          "p-2 border border-stroke bg-panel rounded-lg",
          isEnabled
            ? "cursor-grab hover:bg-panel-2"
            : "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">{node.title}</p>
          <Badge color={getNodeColor(node.type)}>{node.type}</Badge>
        </div>
      </div>
    </Tooltip>
  );
}
