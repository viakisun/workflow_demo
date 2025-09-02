"use client";

import { useWorkspaceStore } from "@/store/workspace";
import { useEngineStore } from "@/store/engine";
import { Badge } from "../primitives/Badge";

export default function RulesPanel() {
  const { rules: rulePack } = useWorkspaceStore();
  const { cooldowns, tick } = useEngineStore();

  if (!rulePack) {
    return (
      <div className="text-sm text-muted p-4">No rules pack loaded.</div>
    );
  }

  return (
    <div className="space-y-2">
      {rulePack.rules.map((rule) => {
        const cooldownEnd = cooldowns[rule.id];
        const isOnCooldown = cooldownEnd && tick < cooldownEnd;
        return (
          <div
            key={rule.id}
            className="p-3 bg-panel rounded-lg border border-stroke"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">{rule.id}</span>
              {isOnCooldown && (
                <Badge color="yellow">
                  Cooldown ({cooldownEnd - tick}t)
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted mt-1">
              Trigger: <span className="font-mono">{rule.trigger.type}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
