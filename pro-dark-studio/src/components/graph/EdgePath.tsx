import { getCubicBezierPath } from "@/lib/geometry";
import { clsx } from "clsx";

type EdgePathProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected?: boolean;
  onSelect?: (id: string, shiftKey: boolean) => void;
};

export default function EdgePath({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  onSelect,
}: EdgePathProps) {
  const d = getCubicBezierPath(sourceX, sourceY, targetX, targetY);

  return (
    <g
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect?.(id, e.shiftKey);
      }}
    >
      <path
        d={d}
        className={clsx(
          "fill-none stroke-slate-500 hover:stroke-slate-300",
          selected && "stroke-emerald-400/70"
        )}
        strokeWidth={2}
      />
      {/* Hit area */}
      <path d={d} className="stroke-transparent fill-none" strokeWidth={16} />
      {/* Arrowhead */}
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className={clsx(
            "fill-slate-500",
            selected && "fill-emerald-400/70"
          )} />
        </marker>
      </defs>
      <path
        d={d}
        stroke="transparent"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}
