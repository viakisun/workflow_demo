import { NodeRegistryEntry, RobotSpec } from "@/types/core";

export function filterPalette(registry: NodeRegistryEntry[], device?: RobotSpec): NodeRegistryEntry[] {
  if (!device) {
    return registry;
  }
  const caps = new Set(device.capabilities);
  const has = (expr: string) => expr.split("|").some(t => caps.has(t as any));
  return registry.filter(n => (n.required ?? []).every(has));
}
