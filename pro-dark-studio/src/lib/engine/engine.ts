import { produce } from "immer";
import type { Rule, GlobalContext, ActionSpec } from "@/types/core";
import { useEngineStore } from "@/store/engine";
import { useWorkspaceStore } from "@/store/workspace";
import { evaluateCondition } from "./evaluator";
import { actionHandlers, ActionHandler } from "./actions";

// 1. Sort rules by priority for deterministic execution
function sortRules(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    return a.id.localeCompare(b.id); // Stable sort by ID
  });
}

// The main tick function, performing one cycle of the rules engine.
export function tick() {
  const {
    globalContext,
    incrementTick,
    addEvent,
    cooldowns,
    setCooldown,
    tick,
    acquireLock,
    releaseLock,
  } = useEngineStore.getState();
  const { rules: rulePack } = useWorkspaceStore.getState();

  if (!globalContext || !rulePack) {
    return;
  }

  incrementTick();
  addEvent({ type: "tick_start", payload: { tick } });

  const sortedRules = sortRules(rulePack.rules);
  const actionsToExecute: { rule: Rule; action: ActionSpec }[] = [];

  // --- EVALUATION PHASE ---
  for (const rule of sortedRules) {
    // 1. Check cooldown
    if (cooldowns[rule.id] && tick < cooldowns[rule.id]) {
      addEvent({ type: "rule_skipped_cooldown", payload: { ruleId: rule.id } });
      continue;
    }

    // 2. Check trigger (simplified: only state triggers for now)
    let triggerFired = false;
    if (rule.trigger.type === "state") {
      triggerFired = evaluateCondition(rule.trigger.expr, globalContext);
    }
    // TODO: Implement event and time triggers

    if (!triggerFired) continue;

    // 3. Check conditions
    const conditionsMet = (rule.conditions ?? []).every((cond) =>
      evaluateCondition(cond, globalContext)
    );

    if (conditionsMet) {
      // 4. Check exclusivity locks
      const lockGroup = rule.exclusivity?.group;
      if (lockGroup && !acquireLock(lockGroup)) {
        addEvent({ type: "rule_skipped_lock", payload: { ruleId: rule.id, group: lockGroup } });
        continue;
      }

      addEvent({ type: "rule_hit", payload: { ruleId: rule.id, tick } });
      // Plan actions for execution
      rule.actions.forEach(action => actionsToExecute.push({ rule, action }));
    }
  }

  // --- COMMIT PHASE ---
  if (actionsToExecute.length > 0) {
    const nextContext = produce(globalContext, (draft) => {
      for (const { rule, action } of actionsToExecute) {
        try {
          const handler = actionHandlers[action.type] as ActionHandler | undefined;
          if (handler) {
            handler(draft, action);
          } else {
            throw new Error(`No handler for action type: ${action.type}`);
          }
        } catch (e) {
          console.error(`Error executing action for rule ${rule.id}:`, e);
          addEvent({
            type: "rule_error",
            payload: { ruleId: rule.id, error: (e as Error).message },
          });
        }
      }
    });

    useEngineStore.getState().setGlobalContext(nextContext);

    // Set cooldowns and release locks for rules that fired
    const firedRules = new Set(actionsToExecute.map(a => a.rule));
    for (const rule of firedRules) {
        // Set cooldown
        if (rule.cooldown) {
            const cooldownTicks = parseInt(rule.cooldown, 10);
            if (!isNaN(cooldownTicks)) {
                setCooldown(rule.id, tick + cooldownTicks);
            }
        }
        // Release lock
        const lockGroup = rule.exclusivity?.group;
        if (lockGroup) {
            releaseLock(lockGroup);
        }
    }
  }

  addEvent({ type: "tick_end", payload: { tick } });
}
