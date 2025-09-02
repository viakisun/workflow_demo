"use client";

import { useEngineStore } from "@/store/engine";
import { ChevronRight } from "lucide-react";

export default function EventLog() {
  const { eventBus } = useEngineStore();

  return (
    <div className="bg-panel-2 border-t border-stroke p-3 h-full overflow-y-auto">
      <h2 className="text-sm font-semibold mb-2">Event Log</h2>
      <div className="space-y-1 font-mono text-xs">
        {eventBus.map((event) => (
          <div key={event.id} className="flex items-center gap-2">
            <span className="text-muted">{event.tick}</span>
            <ChevronRight className="size-4 text-muted" />
            <span className="font-semibold">{event.type}</span>
            <span className="text-muted">
              {JSON.stringify(event.payload)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
