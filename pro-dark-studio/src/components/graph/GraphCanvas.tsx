"use client";

import { useRef, useEffect } from "react";
import NodeCard from "./NodeCard";
import EdgePath from "./EdgePath";
import { useCanvasPanZoom } from "@/hooks/useCanvasPanZoom";
import { useGraphStore } from "@/store/graph";
import { useWorkspaceStore } from "@/store/workspace";
import { useNotificationStore } from "@/store/notification";
import { useMarquee } from "@/hooks/useMarquee";
import MiniMap from "./MiniMap";
import { NodeRegistryEntry } from "@/types/core";
import { checkNodeConflicts } from "@/lib/conflict";
import { snapToGrid } from "@/lib/geometry";

const NODE_WIDTH = 224;
const NODE_HEIGHT = 96;

export default function GraphCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { registry } = useWorkspaceStore();
  const { addNotification } = useNotificationStore();
  const {
    transform,
    nodes,
    edges,
    selection,
    tempEdge,
    moveNode,
    select,
    beginConnect,
    endConnect,
    updateMousePosition,
    addNode,
  } = useGraphStore();

  useCanvasPanZoom(canvasRef);
  const marquee = useMarquee(canvasRef, !tempEdge);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeData = e.dataTransfer.getData("application/json");
    if (!nodeData) return;

    const node: NodeRegistryEntry = JSON.parse(nodeData);

    const conflictCheck = checkNodeConflicts(node, nodes, registry);
    if (!conflictCheck.enabled) {
      addNotification({
        type: "warning",
        message: `Conflict detected: ${conflictCheck.details?.join(", ")}`,
      });
      return;
    }

    const canvasBounds = canvasRef.current!.getBoundingClientRect();
    const x = snapToGrid((e.clientX - canvasBounds.left - transform.x) / transform.scale - NODE_WIDTH / 2);
    const y = snapToGrid((e.clientY - canvasBounds.top - transform.y) / transform.scale - NODE_HEIGHT / 2);

    addNode(node.nodeId, node.type, node.title, x, y);
  };

  useEffect(() => {
    if (!tempEdge) return;
    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
    };
    const handleMouseUp = (e: MouseEvent) => {
      const targetElement = (e.target as HTMLElement).closest('[data-node-id]');
      const targetId = targetElement?.getAttribute('data-node-id');
      endConnect(targetId ?? "");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tempEdge, updateMousePosition, endConnect]);

  const handleNodeSelect = (nodeId: string, shiftKey: boolean) => {
    const newSelection = new Set(selection.nodes);
    if (shiftKey) {
      newSelection.has(nodeId)
        ? newSelection.delete(nodeId)
        : newSelection.add(nodeId);
    } else {
      newSelection.clear();
      newSelection.add(nodeId);
    }
    select({ nodes: Array.from(newSelection), edges: [] });
  };

  const handleEdgeSelect = (edgeId: string, shiftKey: boolean) => {
    const newSelection = new Set(selection.edges);
    if (shiftKey) {
      newSelection.has(edgeId)
        ? newSelection.delete(edgeId)
        : newSelection.add(edgeId);
    } else {
      newSelection.clear();
      newSelection.add(edgeId);
    }
    select({ edges: Array.from(newSelection), nodes: [] });
  };

  const getNodePortPosition = (node: any, side: "in" | "out") => {
    const y = node.y + NODE_HEIGHT / 2;
    const x = side === 'in' ? node.x : node.x + NODE_WIDTH;
    return { x, y };
  }

  return (
    <div
      ref={canvasRef}
      className="relative overflow-hidden bg-panel h-full"
      data-canvas-container
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={(e) => {
        if (!e.target || !(e.target as HTMLElement).closest('[data-node]')) {
          select({ nodes: [], edges: [] })
        }
      }}
    >
      <div
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundSize: `${16 * transform.scale}px ${16 * transform.scale}px`,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--stroke) 1px, transparent 0)",
          backgroundPosition: `${transform.x}px ${transform.y}px`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
          {edges.map((e) => {
            const fromNode = nodes.find((n) => n.id === e.from);
            const toNode = nodes.find((n) => n.id === e.to);
            if (!fromNode || !toNode) return null;

            const source = getNodePortPosition(fromNode, 'out');
            const target = getNodePortPosition(toNode, 'in');

            return (
              <EdgePath
                key={e.id}
                id={e.id}
                sourceX={source.x}
                sourceY={source.y}
                targetX={target.x}
                targetY={target.y}
                selected={selection.edges.has(e.id)}
                onSelect={handleEdgeSelect}
              />
            );
          })}
          {tempEdge && (() => {
            const fromNode = nodes.find(n => n.id === tempEdge.fromNode);
            if (!fromNode) return null;
            const source = getNodePortPosition(fromNode, tempEdge.fromSide);
            return (
              <EdgePath
                id="temp-edge"
                sourceX={source.x}
                sourceY={source.y}
                targetX={tempEdge.toMouse.x}
                targetY={tempEdge.toMouse.y}
              />
            )
          })()}
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "0 0" }}
      >
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            id={n.id}
            ref={n.ref}
            kind={n.kind}
            title={n.title}
            x={n.x}
            y={n.y}
            scale={transform.scale}
            selected={selection.nodes.has(n.id)}
            onMove={moveNode}
            onPortDragStart={beginConnect}
            onSelect={handleNodeSelect}
          />
        ))}
        {marquee && (
          <div
            className="absolute bg-blue-500/20 border border-blue-500 pointer-events-none"
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
