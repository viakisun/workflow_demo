export default function Canvas() {
  return (
    <div
      aria-label="Workflow canvas"
      className="relative overflow-hidden bg-panel"
    >
      {/* Dotted grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--stroke)_1px,_transparent_0)] [background-size:16px_16px]" />
      <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
        Drop nodes here
      </div>
    </div>
  );
}
