import { useGraphStore } from "@/store/graph";
import { NodeVM } from "@/store/graph";

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
        <div
          className="absolute border-2 border-emerald-400/70 cursor-grab"
          style={{
            left: `${-transform.x / 10}px`,
            top: `${-transform.y / 10}px`,
            width: `${window.innerWidth / 10 / transform.scale}px`,
            height: `${window.innerHeight / 10 / transform.scale}px`,
          }}
          onMouseDown={handleViewportDrag}
        />
      </div>
    </div>
  );
}
