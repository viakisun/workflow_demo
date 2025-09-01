"use client";

import { useRef } from "react";
import NodeCard from "./NodeCard";
import EdgePath from "./EdgePath";
import { useCanvasPanZoom } from "@/hooks/useCanvasPanZoom";
import { useGraphStore } from "@/store/graph";
import { useMarquee } from "@/hooks/useMarquee";
import MiniMap from "./MiniMap";

export default function GraphCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    transform,
    nodes,
    edges,
    selection,
    tempEdge,
    moveNode,
    select,
    beginConnect,
  } = useGraphStore();

  useCanvasPanZoom(canvasRef);
  const marquee = useMarquee(canvasRef, true);

  const handleNodeSelect = (nodeId: string, shiftKey: boolean) => {
    const newSelection = new Set(selection.nodes);
    if (shiftKey) {
      if (newSelection.has(nodeId)) {
        newSelection.delete(nodeId);
      } else {
        newSelection.add(nodeId);
      }
    } else {
      newSelection.clear();
      newSelection.add(nodeId);
    }
    select({ nodes: Array.from(newSelection) });
  };

  const handleEdgeSelect = (edgeId: string, shiftKey: boolean) => {
    const newSelection = new Set(selection.edges);
    if (shiftKey) {
      if (newSelection.has(edgeId)) {
        newSelection.delete(edgeId);
      } else {
        newSelection.add(edgeId);
      }
    } else {
      newSelection.clear();
      newSelection.add(edgeId);
    }
    select({ edges: Array.from(newSelection) });
  };

  return (
    <div ref={canvasRef} className="relative overflow-hidden bg-panel h-full">
      {/* Dotted grid */}
      <div
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundSize: `${16 * transform.scale}px ${16 * transform.scale}px`,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--stroke) 1px, transparent 0)",
          backgroundPosition: `${transform.x}px ${transform.y}px`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full">
        <g style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
          {edges.map((e) => (
            <EdgePath
              key={e.id}
              id={e.id}
              sourceX={e.a.x}
              sourceY={e.a.y}
              targetX={e.b.x}
              targetY={e.b.y}
              selected={selection.edges.has(e.id)}
              onSelect={handleEdgeSelect}
            />
          ))}
          {tempEdge && (
            <EdgePath
              id="temp-edge"
              sourceX={tempEdge.a.x}
              sourceY={tempEdge.a.y}
              targetX={tempEdge.b.x}
              targetY={tempEdge.b.y}
            />
          )}
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "0 0" }}
        onMouseDown={() => select({ nodes: [], edges: [] })}
      >
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            id={n.id}
            kind={n.kind}
            title={n.title}
            x={n.x}
            y={n.y}
            scale={transform.scale}
            selected={selection.nodes.has(n.id)}
            onMove={moveNode}
            onPortDragStart={(id, side, e) => beginConnect(id, side, e, transform)}
            onSelect={handleNodeSelect}
          />
        ))}
        {marquee && (
          <div
            className="absolute bg-blue-500/20 border border-blue-500"
            style={{
              left: marquee.x,
              top: marquee.y,
              width: marquee.width,
              height: marquee.height,
            }}
          />
        )}
      </div>
      <MiniMap />
    </div>
  );
}
