import { clsx } from "clsx";
import { X } from "lucide-react";

type EdgePathProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected?: boolean;
  onSelect?: (id: string, shiftKey: boolean) => void;
  onDelete?: (id: string) => void;
};

export default function EdgePath({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  onSelect,
  onDelete,
}: EdgePathProps) {
  // Simple orthogonal pathing
  const midX = sourceX + (targetX - sourceX) / 2;
  const d = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;

  return (
    <g
      className="group"
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect?.(id, e.shiftKey);
      }}
    >
      <path
        d={d}
        className={clsx(
          "fill-none stroke-subtle transition-all duration-fast",
          "group-hover:stroke-muted",
          selected && "stroke-info/60"
        )}
        strokeWidth={1.5}
      />
      <path d={d} className="stroke-transparent fill-none" strokeWidth={16} />

      <path
        d={d}
        stroke="transparent"
        fill="none"
        markerEnd={`url(#arrowhead-${selected ? 'selected' : 'default'})`}
      />

      <foreignObject
        x={midX - 12}
        y={sourceY + (targetY - sourceY) / 2 - 12}
        width="24"
        height="24"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-fast pointer-events-auto"
      >
        <button
            className="p-1 rounded-full bg-panel-2 hover:bg-danger text-muted hover:text-white"
            onClick={() => onDelete?.(id)}
        >
            <X className="size-4" />
        </button>
      </foreignObject>
    </g>
  );
}
