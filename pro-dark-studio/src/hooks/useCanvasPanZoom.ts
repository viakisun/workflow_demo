import { useEffect, useRef } from "react";
import { useGraphStore } from "@/store/graph";

export function useCanvasPanZoom(
  canvasRef: React.RefObject<HTMLDivElement>
) {
  const { transform, setTransform } = useGraphStore();
  const isPanning = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      isPanning.current = true;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      setTransform({
        ...transform,
        x: transform.x + dx,
        y: transform.y + dy,
      });
    };

    const handleMouseUp = () => {
      isPanning.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(2, Math.max(0.25, transform.scale + delta));

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - transform.x) / transform.scale;
      const worldY = (mouseY - transform.y) / transform.scale;

      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;

      setTransform({ x: newX, y: newY, scale: newScale });
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, transform, setTransform]);

  return transform;
}
