"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  Home,
  BotMessageSquare,
  Package,
  ScrollText,
  Settings,
  Search,
} from "lucide-react";
import Fuse from "fuse.js";
import { Tooltip } from "@/components/primitives/Tooltip";
import { IconButton } from "./primitives/IconButton";
import { RobotSpec, NodeKind } from "@/types/core";
import { useWorkspaceStore } from "@/store/workspace";
import { useGraphStore } from "@/store/graph";
import { useUIStore } from "@/store/ui";
import { checkNodeCapabilities } from "@/lib/capability";
import { checkNodeConflicts } from "@/lib/conflict";
import PaletteNodeItem from "./sidebar/PaletteNodeItem";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "graph", label: "Graph", icon: BotMessageSquare },
  { id: "assets", label: "Assets", icon: Package },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

const NODE_GROUPS: NodeKind[] = ["trigger", "condition", "action", "end"];

export default function Sidebar() {
  const [active, setActive] = useState("graph");
  const [searchTerm, setSearchTerm] = useState("");
  const { registry } = useWorkspaceStore();
  const { selectedDevice } = useUIStore(); // Assuming this is now in a UI store
  const { nodes: graphNodes } = useGraphStore();

  const fuse = useMemo(
    () =>
      new Fuse(registry, {
        keys: ["title", "nodeId"],
        threshold: 0.3,
      }),
    [registry]
  );

  const filteredRegistry = useMemo(() => {
    if (!searchTerm) return registry;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [registry, searchTerm, fuse]);

  return (
    <div className="flex h-full bg-panel-2 border-r border-stroke">
      <aside className="w-14 h-full flex flex-col items-center py-3 gap-4 flex-shrink-0">
        <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <Tooltip key={item.id} label={item.label} side="right">
              <IconButton
                icon={item.icon}
                label={item.label}
                onClick={() => setActive(item.id)}
                className={clsx(
                  "rounded-lg",
                  active === item.id && "bg-panel text-text"
                )}
              />
            </Tooltip>
          ))}
        </nav>
      </aside>
      <div className="p-3 border-l border-stroke w-72 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Node Palette</h2>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-stroke rounded-lg pl-8 pr-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {NODE_GROUPS.map((group) => {
            const nodesInGroup = filteredRegistry.filter(
              (n) => n.type === group
            );
            if (nodesInGroup.length === 0) return null;
            return (
              <div key={group}>
                <h3 className="text-xs font-bold uppercase text-muted mb-2">
                  {group}
                </h3>
                <div className="space-y-2">
                  {nodesInGroup.map((node) => {
                    const capCheck = checkNodeCapabilities(
                      node,
                      selectedDevice
                    );
                    const conflictCheck = checkNodeConflicts(
                      node,
                      graphNodes,
                      registry
                    );
                    return (
                      <PaletteNodeItem
                        key={node.nodeId}
                        node={node}
                        capCheck={capCheck}
                        conflictCheck={conflictCheck}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
