"use client";

import { useGraphStore } from "@/store/graph";
import { NodeVM } from "@/store/graph";
import { useState, useEffect } from "react";

const MiniMapNode = ({ node }: { node: NodeVM }) => {
  const colorByKind = {
    trigger: "bg-node-trigger",
    condition: "bg-node-condition",
    action: "bg-node-action",
    end: "bg-node-end",
  };

  return (
    <div
      className={`absolute ${colorByKind[node.kind]} rounded-sm`}
      style={{
        left: `${node.x / 10}px`,
        top: `${node.y / 10}px`,
        width: `${224 / 10}px`,
        height: `${100 / 10}px`,
      }}
    />
  );
};

export default function MiniMap() {
  const { nodes, transform, setTransform } = useGraphStore();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // This effect runs only on the client, where window is defined.
    const updateSize = () => {
      // We use the parent element's size for a more accurate viewport representation
      const parent = (document.querySelector('[data-canvas-container]') as HTMLElement);
      if (parent) {
        setViewportSize({ width: parent.offsetWidth, height: parent.offsetHeight });
      } else {
        // Fallback to window size if the canvas container isn't found
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleViewportDrag = (e: React.MouseEvent) => {
    const start = {
      x: e.clientX,
      y: e.clientY,
      tx: transform.x,
      ty: transform.y,
    };
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      setTransform({
        ...transform,
        x: start.tx - dx * 10,
        y: start.ty - dy * 10,
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="absolute bottom-4 left-4 w-64 h-48 bg-panel-2 border border-stroke rounded-lg overflow-hidden">
      <div className="relative w-full h-full scale-100">
        {nodes.map((node) => (
          <MiniMapNode key={node.id} node={node} />
        ))}
        {viewportSize.width > 0 && (
          <div
            className="absolute border-2 border-emerald-400/70 cursor-grab"
            style={{
              left: `${-transform.x / 10}px`,
              top: `${-transform.y / 10}px`,
              width: `${viewportSize.width / 10 / transform.scale}px`,
              height: `${viewportSize.height / 10 / transform.scale}px`,
            }}
            onMouseDown={handleViewportDrag}
          />
        )}
      </div>
    </div>
  );
}
