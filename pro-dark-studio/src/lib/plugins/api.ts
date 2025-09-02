import { NodeRegistryEntry } from "@/types/core";
import { ActionHandler } from "../engine/actions";
import { customNodeRegistry, customActionHandlers } from "./registry";

export function registerNode(node: NodeRegistryEntry) {
  if (customNodeRegistry.some((n) => n.nodeId === node.nodeId)) {
    console.warn(`[Plugin API] Node with ID ${node.nodeId} is already registered.`);
    return;
  }
  customNodeRegistry.push(node);
}

export function registerAction(actionId: string, handler: ActionHandler) {
  if (customActionHandlers[actionId]) {
    console.warn(`[Plugin API] Action with ID ${actionId} is already registered.`);
    return;
  }
  customActionHandlers[actionId] = handler;
}
