import { clsx } from "clsx";

type PortHandleProps = {
  side: "in" | "out";
  onMouseDown: (e: React.MouseEvent) => void;
};

export function PortHandle({ side, onMouseDown }: PortHandleProps) {
  return (
    <button
      data-port
      aria-label={`${side}-port`}
      onMouseDown={onMouseDown}
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 hover:bg-white",
        {
          "-left-1.5": side === "in",
          "-right-1.5": side === "out",
        }
      )}
    />
  );
}
