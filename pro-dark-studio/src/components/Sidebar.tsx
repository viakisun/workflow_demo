"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  Home,
  BotMessageSquare,
  Package,
  ScrollText,
  Settings,
} from "lucide-react";
import { Tooltip } from "@/components/primitives/Tooltip";
import { IconButton } from "./primitives/IconButton";
import { RobotSpec, NodeRegistryEntry, NodeKind } from "@/types/core";
import { filterPalette } from "@/lib/palette";
import { NODE_REGISTRY } from "@/lib/node-registry";
import { Badge } from "./primitives/Badge";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "graph", label: "Graph", icon: BotMessageSquare },
  { id: "assets", label: "Assets", icon: Package },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

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

type SidebarProps = {
  selectedDevice?: RobotSpec;
};

export default function Sidebar({ selectedDevice }: SidebarProps) {
  const [active, setActive] = useState("graph");
  const paletteNodes = filterPalette(NODE_REGISTRY, selectedDevice);

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
      <div className="p-3 border-l border-stroke w-64 flex-grow">
        <h2 className="text-sm font-semibold mb-2">Node Palette</h2>
        <div className="space-y-2">
          {paletteNodes.map((node) => (
            <div
              key={node.nodeId}
              className="p-2 border border-stroke bg-panel rounded-lg cursor-grab hover:bg-panel-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">{node.title}</p>
                <Badge color={getNodeColor(node.type)}>{node.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
