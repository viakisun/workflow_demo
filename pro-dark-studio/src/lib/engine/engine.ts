import { produce } from "immer";
import type { Rule, GlobalContext, ActionSpec } from "@/types/core";
import { useEngineStore } from "@/store/engine";
import { useWorkspaceStore } from "@/store/workspace";
import { evaluateCondition } from "./evaluator";
import { actionHandlers, ActionHandler } from "./actions";
import { runSimulationTick } from "../simulator/simulator";

// ... (sortRules function remains the same)

export function tick() {
  const {
    globalContext: currentContext,
    incrementTick,
    addEvent,
    cooldowns,
    setCooldown,
    tick,
    acquireLock,
    releaseLock,
  } = useEngineStore.getState();
  const { rules: rulePack } = useWorkspaceStore.getState();

  if (!currentContext || !rulePack) {
    return;
  }

  incrementTick();
  addEvent({ type: "tick_start", payload: { tick } });

  // --- SIMULATION PHASE ---
  // First, update the world state based on physical models.
  const simulatedContext = runSimulationTick(currentContext);

  // The rules engine will evaluate against this new, simulated context.
  const globalContext = simulatedContext;

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
  let finalContext = globalContext;
  if (actionsToExecute.length > 0) {
    // If actions were planned, run them through Immer to get the final state.
    finalContext = produce(globalContext, (draft) => {
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

    // Set cooldowns and release locks for rules that fired
    const firedRules = new Set(actionsToExecute.map(a => a.rule));
    for (const rule of firedRules) {
        if (rule.cooldown) {
            const cooldownTicks = parseInt(rule.cooldown, 10);
            if (!isNaN(cooldownTicks)) {
                setCooldown(rule.id, tick + cooldownTicks);
            }
        }
        const lockGroup = rule.exclusivity?.group;
        if (lockGroup) {
            releaseLock(lockGroup);
        }
    }
  }

  // Commit the final state for the tick to the store.
  useEngineStore.getState().setGlobalContext(finalContext);

  addEvent({ type: "tick_end", payload: { tick } });
}
