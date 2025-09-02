import { produce } from "immer";
import type { Rule, GlobalContext, ActionSpec, Workflow } from "@/types/core";
import { useEngineStore } from "@/store/engine";
import { useWorkspaceStore } from "@/store/workspace";
import { evaluateCondition } from "./evaluator";
import { actionHandlers, ActionHandler } from "./actions";
import { runSimulationTick } from "../simulator/simulator";

function sortRules(rules: Rule[]): Rule[] {
  // ... (remains the same)
}

function processWorkflowTick(context: GlobalContext, workflow: Workflow): GlobalContext {
    return produce(context, draft => {
        if (!workflow.graph?.lanes) return;

        for (const lane of workflow.graph.lanes) {
            const robotsInLane = Object.values(draft.robots).filter(r => {
                if ('id' in lane.deviceFilter) return r.id === lane.deviceFilter.id;
                if ('type' in lane.deviceFilter) return r.type === lane.deviceFilter.type;
                return false;
            });

            for (const robot of robotsInLane) {
                if (!lane.cursors) lane.cursors = {};

                const cursor = lane.cursors[robot.id] ?? lane.nodes.find(n => n.ref.startsWith('TR_'))?.id;
                if (!cursor) continue;

                const currentNode = lane.nodes.find(n => n.id === cursor);
                if (!currentNode) continue;

                // This is a highly simplified progression logic.
                // A real implementation would handle conditional branches, etc.
                const nextEdge = lane.edges.find(e => e[0] === cursor);
                if (nextEdge) {
                    const nextNodeId = nextEdge[1];
                    lane.cursors[robot.id] = nextNodeId;

                    const nextNode = lane.nodes.find(n => n.id === nextNodeId);
                    robot.task = `At ${nextNode?.ref ?? 'unknown node'}`;
                    useEngineStore.getState().addEvent({ type: "workflow_progress", payload: { robotId: robot.id, nodeId: nextNodeId } });
                }
            }
        }
    });
}

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
  const { rules: rulePack, workflow } = useWorkspaceStore.getState();

  if (!currentContext) return;

  incrementTick();
  addEvent({ type: "tick_start", payload: { tick } });

  // --- 1. SIMULATION PHASE ---
  let nextContext = runSimulationTick(currentContext);

  // --- 2. WORKFLOW PROGRESSION PHASE ---
  if(workflow) {
    nextContext = processWorkflowTick(nextContext, workflow);
  }

  // --- 3. RULES EVALUATION PHASE ---
  const globalContext = nextContext;
  const actionsToExecute: { rule: Rule; action: ActionSpec }[] = [];
  if (rulePack) {
    const sortedRules = sortRules(rulePack.rules);
    for (const rule of sortedRules) {
      // 1. Check cooldown
      if (cooldowns[rule.id] && tick < cooldowns[rule.id]) {
        addEvent({ type: "rule_skipped_cooldown", payload: { ruleId: rule.id } });
        continue;
      }

      // 2. Check trigger
      let triggerFired = false;
      if (rule.trigger.type === "state") {
        triggerFired = evaluateCondition(rule.trigger.expr, globalContext);
      }

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
        rule.actions.forEach(action => actionsToExecute.push({ rule, action }));
      }
    }
  }

  // --- 4. COMMIT PHASE ---
  let finalContext = globalContext;
  if (actionsToExecute.length > 0) {
    finalContext = produce(globalContext, (draft) => {
      for (const { rule, action } of actionsToExecute) {
        try {
          const handler = actionHandlers[action.type] as ActionHandler | undefined;
          if (handler) {
            handler(draft, action, rule.id);
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

  useEngineStore.getState().setGlobalContext(finalContext);
  addEvent({ type: "tick_end", payload: { tick } });
}
