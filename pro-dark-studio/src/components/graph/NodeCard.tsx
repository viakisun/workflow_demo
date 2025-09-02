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
  selected?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onPortDragStart: (id: string, side: "in" | "out", e: React.MouseEvent) => void;
  onSelect: (id: string, shiftKey: boolean) => void;
};

const nodeInfoByKind = {
  trigger: { color: "bg-node-trigger", icon: Zap },
  condition: { color: "bg-node-condition", icon: GitBranch },
  action: { color: "bg-node-action", icon: Play },
  end: { color: "bg-node-end", icon: Flag },
};

export default function NodeCard(p: Props) {
  const style = { transform: `translate(${p.x}px, ${p.y}px)` };
  const info = nodeInfoByKind[p.kind];

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-port]")) return;

    p.onSelect(p.id, e.shiftKey);

    const start = { x: e.clientX, y: e.clientY, ox: p.x, oy: p.y };
    const onMove = (ev: MouseEvent) => {
      const nx = snapToGrid(start.ox + (ev.clientX - start.x) / p.scale);
      const ny = snapToGrid(start.oy + (ev.clientY - start.y) / p.scale);
      p.onMove(p.id, nx, ny);
    };
    const onUp = () => {
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
        "absolute select-none rounded-xl border border-stroke w-56 group",
        "bg-panel shadow-md transition-shadow duration-200",
        p.selected && "ring-2 ring-interactive shadow-glow-sm"
      )}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div
        className={clsx(
          "h-8 rounded-t-xl px-3 flex items-center gap-2",
          info.color
        )}
      >
        <info.icon className="size-4 text-white/80" />
        <span className="text-sm font-semibold text-white">{p.title}</span>
      </div>
      <div className="p-3 text-xs text-muted space-y-2">
        <div>
          <div className="font-bold uppercase text-muted/50 text-[10px]">ID</div>
          <div className="font-mono">{p.id}</div>
        </div>
        <div>
          <div className="font-bold uppercase text-muted/50 text-[10px]">Ref</div>
          <div className="font-mono">{p.ref}</div>
        </div>
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
