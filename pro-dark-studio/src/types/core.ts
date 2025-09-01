export type RobotType = "AGV" | "SPRAY" | "IRR" | "SCAN";
export type NodeKind = "trigger" | "condition" | "action" | "end";

export type Capability =
  // sensors
  | "camera_rgb" | "camera_ms" | "lidar_3d" | "imu" | "uwb" | "soil_moisture" | "weight_cell"
  // actuators
  | "dock" | "charge" | "sprayer_nozzle" | "valve_ctrl" | "arm"
  // functions/integrations
  | "uwb_nav" | "slam_nav" | "scan_ndvi" | "spray_adaptive" | "flow_pid" | "charger_client" | "weather_api"
  // behaviors
  | "carry" | "follow_person";

// Device & Context ------------------------------------------------------------
export interface RobotSpec {
  id: string;
  type: RobotType;
  capabilities: Capability[];
  battery?: number;        // 0..1
  payload?: number;        // 0..1 (AGV)
  zone?: string;
  firmware?: { major: number; minor: number; patch: number };
}
export interface Station { id: string; slots: number; queue: string[] }
export interface Resources {
  docks: Record<string, Station>;
  chargers: Record<string, Station>;
  chemicals_L: number;
  water_L: number;
}
export interface Environment { wind: number; rain: number; temp: number }
export interface Traffic {
  occupancy: Record<string, number>;
  conflictProb?: Record<string, number>;
  oneway?: Record<string, number>;
}
export interface Tasks {
  spray_queue: string[];               // zones
  irrigation_queue: Array<[string, number]>; // [zone, liters]
}
export interface GlobalContext {
  robots: Record<string, RobotSpec>;
  resources: Resources;
  env: Environment;
  traffic: Traffic;
  tasks: Tasks;
  time?: { now?: string };
}

// Node Registry ---------------------------------------------------------------
export interface NodeParamSchema { // JSON-Schema fragment
  type: "string" | "number" | "integer" | "boolean";
  min?: number; max?: number; enum?: (string | number | boolean)[];
  description?: string; default?: any; format?: string;
}
export interface NodeRegistryEntry {
  nodeId: string;              // e.g., "AC_DOCK"
  type: NodeKind;              // action/trigger/condition/end
  title: string;
  required?: string[];         // capability logic (supports "A|B")
  optional?: string[];
  conflicts?: string[];        // other nodeIds this conflicts with
  paramsSchema?: Record<string, NodeParamSchema>;
}

// Workflow Graph --------------------------------------------------------------
export interface Node {
  id: string;
  ref: string;                 // nodeId in registry
  params?: Record<string, any>;
}
export interface Lane {
  laneId: string;
  deviceFilter: { type: RobotType } | { id: string };
  nodes: Node[];
  edges: Array<[string, string]>; // [fromId, toId]
}
export interface Workflow {
  workflowId: string;
  catalogVersion: string;
  graph: { lanes: Lane[] };
  requiredCapabilities?: Partial<Record<RobotType, Capability[]>>;
}

// Rule DSL --------------------------------------------------------------------
export type TriggerSpec =
  | { type: "cron"; cron: string }
  | { type: "event"; expr: string }
  | { type: "state"; expr: string };

export type ActionSpec =
  | { type: "plan_route"; to?: string; dest: string; avoid?: string }
  | { type: "reserve"; resource: "dock" | "charger"; id: string; lease?: string }
  | { type: "execute"; to?: string; sequence: string[] }
  | { type: "dispatch"; to: string; action: string; params?: Record<string, any> }
  | { type: "set_oneway"; segment: string; ttl: string }
  | { type: "yield"; target: "lowestPriority"; to: string }
  | { type: "balance_queue"; from: string[]; to: string[]; policy: "shortest_queue" }
  | { type: "if"; expr: string; then?: ActionSpec[]; else?: ActionSpec[] }
  | { type: "log"; fields?: string[] }
  | { type: "release"; resource: "dock" | "charger"; id: string };

export interface Rule {
  id: string;
  version: string;
  scope: RobotType[] | string[];  // device classes or ids
  trigger: TriggerSpec;
  conditions?: string[];          // CEL-like expressions
  actions: ActionSpec[];
  priority?: number;
  cooldown?: string;
  exclusivity?: { group: string; mode: "mutex" | "semaphore" };
  audit?: { labels?: string[] };
}
export interface RulePack {
  id: string;
  version: string;
  rules: Rule[];
}
