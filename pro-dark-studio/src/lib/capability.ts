import { NodeRegistryEntry, RobotSpec, Capability } from "@/types/core";

export type CapabilityFilterResult = {
  enabled: boolean;
  reason?: "missing_caps";
  details?: {
    missing: string[];
    satisfied: string[];
  };
};

export function checkNodeCapabilities(
  node: NodeRegistryEntry,
  device?: RobotSpec
): CapabilityFilterResult {
  if (!device) {
    return { enabled: false };
  }

  const deviceCaps = new Set(device.capabilities);
  const missing: string[] = [];
  const satisfied: string[] = [];

  const required = node.required ?? [];
  for (const req of required) {
    const options = req.split("|");
    const hasCap = options.some((cap) => deviceCaps.has(cap as Capability));

    if (hasCap) {
      satisfied.push(req);
    } else {
      missing.push(req);
    }
  }

  if (missing.length > 0) {
    return {
      enabled: false,
      reason: "missing_caps",
      details: { missing, satisfied },
    };
  }

  return { enabled: true };
}
