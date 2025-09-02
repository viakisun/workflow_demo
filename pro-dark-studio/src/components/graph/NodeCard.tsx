import { clsx } from "clsx";
import { snapToGrid } from "@/lib/geometry";
import { NodeKind } from "@/types/core";
import { PortHandle } from "./PortHandle";

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

const colorByKind = {
  trigger: "bg-node-trigger",
  condition: "bg-node-condition",
  action: "bg-node-action",
  end: "bg-node-end",
};

export default function NodeCard(p: Props) {
  const style = { transform: `translate(${p.x}px, ${p.y}px)` };

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
        "absolute select-none rounded-xl shadow-md border border-stroke w-56",
        "bg-panel",
        p.selected && "ring-2 ring-emerald-400/70"
      )}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div
        className={clsx(
          "h-7 rounded-t-xl px-2 text-xs font-semibold text-white flex items-center",
          colorByKind[p.kind]
        )}
      >
        {p.title}
      </div>
      <div className="p-2 text-[11px] text-muted">Node ID: {p.id}</div>

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
