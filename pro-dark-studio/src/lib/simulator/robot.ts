import type { RobotSpec, GlobalContext } from "@/types/core";
import { WritableDraft } from "immer";

const BATTERY_DRAIN_RATE = 0.005; // 0.5% per tick when moving
const BATTERY_CHARGE_RATE = 0.02; // 2% per tick when charging

export function updateRobot(
  robot: WritableDraft<RobotSpec>,
  context: WritableDraft<GlobalContext>
) {
  // A real implementation would have a state machine for the robot (idle, moving, charging, etc.)
  // For now, we'll use simple placeholder logic.

  // Battery drain for moving robots
  if (robot.task === "moving") {
    robot.battery = Math.max(0, (robot.battery ?? 1) - BATTERY_DRAIN_RATE);
  }

  // Charging logic
  const isCharging = Object.values(context.resources.chargers).some(
    (station) => station.queue.includes(robot.id)
  );
  if (isCharging) {
    robot.battery = Math.min(1, (robot.battery ?? 0) + BATTERY_CHARGE_RATE);
    // If fully charged, maybe the robot should be released from the queue.
    // This logic would typically be handled by a rule.
  }

  // TODO: Add other robot state updates (payload, zone changes, etc.)
}
