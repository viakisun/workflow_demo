export const GRID_SIZE = 8;

export const snapToGrid = (v: number) => {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
};

export function getCubicBezierPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): string {
  const dx = Math.max(40, Math.abs(targetX - sourceX) * 0.5);
  const c1x = sourceX + dx;
  const c1y = sourceY;
  const c2x = targetX - dx;
  const c2y = targetY;
  return `M ${sourceX},${sourceY} C ${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`;
}
