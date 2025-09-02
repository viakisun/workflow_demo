"use client";

export default function KpiPanel() {
  return (
    <div className="absolute top-16 right-4 bg-panel-2 border border-stroke rounded-lg p-3 w-64">
      <h2 className="text-sm font-semibold mb-2">KPIs</h2>
      <div className="space-y-1 text-xs text-muted">
        <div className="flex justify-between">
          <span>Dock Wait (avg):</span>
          <span>-</span>
        </div>
        <div className="flex justify-between">
          <span>Charge Wait (avg):</span>
          <span>-</span>
        </div>
        <div className="flex justify-between">
          <span>Sprayed Liters:</span>
          <span>-</span>
        </div>
        <div className="flex justify-between">
          <span>Units/Hour:</span>
          <span>-</span>
        </div>
      </div>
    </div>
  );
}
