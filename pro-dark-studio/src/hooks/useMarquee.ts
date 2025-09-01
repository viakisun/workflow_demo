import { useState, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/store/graph';

interface Marquee {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useMarquee(
  canvasRef: React.RefObject<HTMLDivElement>,
  isEnabled: boolean
) {
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const { nodes, select, transform } = useGraphStore();

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isEnabled || (e.target as HTMLElement).closest('[data-node]')) {
        return;
      }
      const startX = (e.clientX - transform.x) / transform.scale;
      const startY = (e.clientY - transform.y) / transform.scale;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentX = (moveEvent.clientX - transform.x) / transform.scale;
        const currentY = (moveEvent.clientY - transform.y) / transform.scale;
        setMarquee({
          x: Math.min(startX, currentX),
          y: Math.min(startY, currentY),
          width: Math.abs(startX - currentX),
          height: Math.abs(startY - currentY),
        });
      };

      const handleMouseUp = () => {
        if (marquee) {
          const selectedNodes = nodes
            .filter(node =>
              node.x < marquee.x + marquee.width &&
              node.x + 224 > marquee.x && // 224 is node width
              node.y < marquee.y + marquee.height &&
              node.y + 100 > marquee.y // 100 is node height
            )
            .map(node => node.id);
          select({ nodes: selectedNodes });
        }
        setMarquee(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [isEnabled, marquee, nodes, select, transform]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isEnabled) {
      canvas.addEventListener('mousedown', handleMouseDown);
      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [canvasRef, isEnabled, handleMouseDown]);

  return marquee;
}
