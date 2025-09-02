import type { GlobalContext, RobotSpec } from "@/types/core";

// This is a placeholder for a safe expression evaluator.
// In a real application, this would be a more robust library like JEXL or a custom parser.
// For now, we'll use a simple key-based lookup with basic operators.

const comparators = {
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "==": (a, b) => a == b,
  "!=": (a, b) => a != b,
};

// Very simple "path.to.value < 10" evaluator
export function evaluateCondition(
  condition: string,
  context: GlobalContext
): boolean {
  try {
    const parts = condition.split(" ");
    if (parts.length !== 3) {
      console.warn(`[Evaluator] Invalid condition format: "${condition}"`);
      return false;
    }
    const [path, op, rawValue] = parts;

    // Resolve path in context. This is highly simplified and does not handle array access etc.
    const value = path.split('.').reduce((obj, key) => obj?.[key], context);
    const comparisonValue = JSON.parse(rawValue);
    const comparator = comparators[op];

    if (value === undefined || comparator === undefined) {
      console.warn(`[Evaluator] Invalid path or operator in: "${condition}"`);
      return false;
    }

    return comparator(value, comparisonValue);
  } catch (e) {
    console.error(`[Evaluator] Error evaluating condition "${condition}":`, e);
    return false;
  }
}

// Placeholder for helper functions that could be exposed to the rules
export const getConditionHelpers = (context: GlobalContext) => ({
    weather: {
        is_ok_for_spray: () => context.env.wind < 15 && context.env.rain === 0,
    },
    battery: {
        le: (robot: RobotSpec, level: number) => robot.battery <= level,
    },
    capability: {
        has: (robot: RobotSpec, cap: string) => robot.capabilities.includes(cap as any),
    }
});
