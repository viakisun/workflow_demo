"use client";

import { useEngineStore, OperatorPrompt } from "@/store/engine";
import { Button } from "../primitives/Button";

export function OperatorPromptContainer() {
  const { pendingPrompts, resolvePrompt } = useEngineStore();

  if (pendingPrompts.length === 0) {
    return null;
  }

  const prompt = pendingPrompts[0]; // Show one at a time

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[480px] rounded-2xl border border-stroke bg-panel-2 p-4">
        <div className="text-lg font-semibold mb-2">Operator Prompt</div>
        <p className="text-sm text-muted mb-4">{prompt.message}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => resolvePrompt(prompt.id, "nack")}
          >
            Deny
          </Button>
          <Button
            variant="primary"
            onClick={() => resolvePrompt(prompt.id, "ack")}
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}
