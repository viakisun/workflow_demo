import type { ActionSpec, GlobalContext, RobotSpec } from "@/types/core";
import { useEngineStore } from "@/store/engine";
import { WritableDraft } from "immer";

export type ActionHandler = (
  context: WritableDraft<GlobalContext>,
  action: ActionSpec,
  ruleId: string
) => void;

const plan_route: ActionHandler = (context, action) => {
  if (action.type !== "plan_route") return;
  const robotId = action.to ?? "any";
  const robot = Object.values(context.robots).find(r => action.to ? r.id === action.to : true);
  if (robot) {
    robot.task = `routing to ${action.dest}`;
    robot.moving = true;
  }
  useEngineStore.getState().addEvent({ type: "action_plan_route", payload: { ...action } });
};

const reserve: ActionHandler = (context, action) => {
  if (action.type !== "reserve" || !context.resources[action.resource]) return;

  const station = context.resources[action.resource][action.id];
  if (station && station.queue.length < station.slots) {
    station.queue.push("some_robot_id"); // Placeholder
    console.log(`[Action] Reserving ${action.resource} ${action.id}`);
    useEngineStore.getState().addEvent({ type: "action_reserve", payload: { ...action } });
  }
};

const release: ActionHandler = (context, action) => {
    if (action.type !== "release" || !context.resources[action.resource]) return;

    const station = context.resources[action.resource][action.id];
    if (station) {
      station.queue.shift(); // Placeholder
      console.log(`[Action] Releasing ${action.resource} ${action.id}`);
      useEngineStore.getState().addEvent({ type: "action_release", payload: { ...action } });
    }
};

const operator_prompt: ActionHandler = (context, action, ruleId) => {
    if (action.type !== "operator_prompt") return;
    useEngineStore.getState().addPrompt({
        ruleId,
        message: action.message,
        timeout: action.timeout,
        timeoutAction: action.timeoutAction,
    });
};

const findNearestIdleRobot = (robots: RobotSpec[], fromRobot: RobotSpec): RobotSpec | undefined => {
    return robots.find(r => r.id !== fromRobot.id && r.type === fromRobot.type && !r.task);
}

const swap: ActionHandler = (context, action) => {
    if (action.type !== "swap") return;
    const fromRobot = context.robots[action.from];
    if (!fromRobot) return;

    const withRobot = findNearestIdleRobot(Object.values(context.robots), fromRobot);
    if (!withRobot) {
        useEngineStore.getState().addEvent({ type: "action_swap_failed", payload: { reason: "No idle robot found" } });
        return;
    }

    fromRobot.swappingWith = withRobot.id;
    withRobot.swappingWith = fromRobot.id;

    // Naive context swap
    const fromTask = fromRobot.task;
    fromRobot.task = "swapping";
    withRobot.task = fromTask;

    useEngineStore.getState().addEvent({ type: "action_swap_initiated", payload: { from: fromRobot.id, to: withRobot.id } });
}

export const actionHandlers: Record<string, ActionHandler> = {
  plan_route,
  reserve,
  release,
  swap,
  operator_prompt,
};
