import { NodeRegistryEntry } from "@/types/core";
import { ActionHandler } from "../engine/actions";

export const customNodeRegistry: NodeRegistryEntry[] = [];
export const customActionHandlers: Record<string, ActionHandler> = {};
