"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { snapToGrid } from "@/lib/geometry";
import { NodeKind } from "@/types/core";
import { PortHandle } from "./PortHandle";
import { Zap, GitBranch, Play, Flag } from "lucide-react";

type Props = {
  id: string;
  ref: string;
  kind: NodeKind;
  x: number;
  y: number;
  scale: number;
  title: string;
  subtitle: string;
  selected?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onPortDragStart: (id: string, side: "in" | "out", e: React.MouseEvent) => void;
  onSelect: (id: string, shiftKey: boolean) => void;
};

const nodeInfoByKind = {
  trigger: { color: "node-trigger", icon: Zap },
  condition: { color: "node-condition", icon: GitBranch },
  action: { color: "node-action", icon: Play },
  end: { color: "node-end", icon: Flag },
};

export default function NodeCard(p: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const info = nodeInfoByKind[p.kind];
  const style = {
    transform: `translate(${p.x}px, ${p.y}px) scale(${isDragging ? 1.02 : 1})`,
    minWidth: '220px',
    minHeight: '92px',
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-port]")) return;

    p.onSelect(p.id, e.shiftKey);
    setIsDragging(true);

    const start = { x: e.clientX, y: e.clientY, ox: p.x, oy: p.y };
    const onMove = (ev: MouseEvent) => {
      const nx = snapToGrid(start.ox + (ev.clientX - start.x) / p.scale);
      const ny = snapToGrid(start.oy + (ev.clientY - start.y) / p.scale);
      p.onMove(p.id, nx, ny);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      data-node
      data-node-id={p.id}
      className={clsx(
        "absolute select-none rounded-card bg-panel shadow-1 border border-stroke transition-all duration-fast group",
        "hover:shadow-2 hover:border-stroke/80",
        p.selected && `ring-2 ring-offset-2 ring-offset-panel ring-${info.color}/60`,
        isDragging && "shadow-2 z-10"
      )}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div className={clsx("h-1.5 rounded-t-card", `bg-${info.color}`)} />
      <div className="p-3">
        <div className="flex items-center gap-3">
            <info.icon className={clsx("size-5", `text-${info.color}`)} />
            <span className="text-sm font-semibold">{p.title}</span>
        </div>
        {p.subtitle && (
            <div className="mt-2 text-xs text-subtle pl-8">
                {p.subtitle}
            </div>
        )}
      </div>

      <PortHandle
        side="in"
        onMouseDown={(e) => p.onPortDragStart(p.id, "in", e)}
      />
      <PortHandle
        side="out"
        onMouseDown={(e) => p.onPortDragStart(p.id, "out", e)}
      />
    </div>
  );
}
