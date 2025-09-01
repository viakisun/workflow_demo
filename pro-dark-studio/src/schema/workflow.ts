import { z } from "zod";

export const ZNodeParam = z.object({
  type: z.enum(["string","number","integer","boolean"]),
  min: z.number().optional(),
  max: z.number().optional(),
  enum: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
  description: z.string().optional(),
  default: z.any().optional(),
  format: z.string().optional(),
});

export const ZRegistryEntry = z.object({
  nodeId: z.string(),
  type: z.enum(["trigger","condition","action","end"]),
  title: z.string(),
  required: z.array(z.string()).optional(),
  optional: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
  paramsSchema: z.record(ZNodeParam).optional(),
});

export const ZNode = z.object({
  id: z.string(),
  ref: z.string(),                       // must match registry later
  params: z.record(z.any()).optional(),
});

export const ZLane = z.object({
  laneId: z.string(),
  deviceFilter: z.union([
    z.object({ type: z.enum(["AGV","SPRAY","IRR","SCAN"]) }),
    z.object({ id: z.string() }),
  ]),
  nodes: z.array(ZNode).min(1),
  edges: z.array(z.tuple([z.string(), z.string()])),
});

export const ZWorkflow = z.object({
  workflowId: z.string(),
  catalogVersion: z.string(),
  graph: z.object({ lanes: z.array(ZLane).min(1) }),
  requiredCapabilities: z.record(z.array(z.string())).optional(),
});

// Rules
export const ZTrigger = z.union([
  z.object({ type: z.literal("cron"), cron: z.string() }),
  z.object({ type: z.literal("event"), expr: z.string() }),
  z.object({ type: z.literal("state"), expr: z.string() }),
]);

const ZAction: z.ZodLazy<any> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal("plan_route"), dest: z.string(), to: z.string().optional(), avoid: z.string().optional() }),
    z.object({ type: z.literal("reserve"), resource: z.enum(["dock","charger"]), id: z.string(), lease: z.string().optional() }),
    z.object({ type: z.literal("execute"), sequence: z.array(z.string()), to: z.string().optional() }),
    z.object({ type: z.literal("dispatch"), to: z.string(), action: z.string(), params: z.record(z.any()).optional() }),
    z.object({ type: z.literal("set_oneway"), segment: z.string(), ttl: z.string() }),
    z.object({ type: z.literal("yield"), target: z.literal("lowestPriority"), to: z.string() }),
    z.object({ type: z.literal("balance_queue"), from: z.array(z.string()), to: z.array(z.string()), policy: z.literal("shortest_queue") }),
    z.object({ type: z.literal("if"), expr: z.string(), then: z.array(ZAction).optional(), else: z.array(ZAction).optional() }),
    z.object({ type: z.literal("log"), fields: z.array(z.string()).optional() }),
    z.object({ type: z.literal("release"), resource: z.enum(["dock","charger"]), id: z.string() }),
  ])
);

export const ZRule = z.object({
  id: z.string(),
  version: z.string(),
  scope: z.array(z.string()),
  trigger: ZTrigger,
  conditions: z.array(z.string()).optional(),
  actions: z.array(ZAction),
  priority: z.number().optional(),
  cooldown: z.string().optional(),
  exclusivity: z.object({ group: z.string(), mode: z.enum(["mutex","semaphore"]) }).optional(),
  audit: z.object({ labels: z.array(z.string()).optional() }).optional(),
});

export const ZRulePack = z.object({
  id: z.string(),
  version: z.string(),
  rules: z.array(ZRule),
});
