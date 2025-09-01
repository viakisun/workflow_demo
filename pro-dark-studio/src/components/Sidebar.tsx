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

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "graph", label: "Graph", icon: BotMessageSquare },
  { id: "assets", label: "Assets", icon: Package },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [active, setActive] = useState("graph");

  return (
    <aside className="w-14 h-full bg-panel-2 border-r border-stroke flex flex-col items-center py-3 gap-4">
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
  );
}
