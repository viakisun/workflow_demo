"use client";

import { useEngineStore } from "@/store/engine";
import { Button } from "../primitives/Button";

export default function TimelinePanel() {
    const { recording, playhead, setPlayhead, isReplaying } = useEngineStore();

    if (!isReplaying || !recording) {
        return <div className="text-sm text-muted p-4">Start a recording to use the timeline.</div>
    }

    const max = recording.events[recording.events.length - 1]?.tick ?? 0;

    return (
        <div className="p-2 space-y-4">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{playhead}</span>
                <input
                    type="range"
                    min="0"
                    max={max}
                    value={playhead}
                    onChange={(e) => setPlayhead(Number(e.target.value))}
                    className="w-full"
                />
                <span className="text-xs font-mono">{max}</span>
            </div>
            <div className="text-xs text-muted">
                Scrub the timeline to view past states. (Note: Full state replay not yet implemented).
            </div>
        </div>
    )
}
