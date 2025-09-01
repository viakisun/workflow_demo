import React, { useEffect, useRef, useState } from "react";

/**
 * Agri Workflow Engine — React Pro Demo (single-file)
 * ---------------------------------------------------
 * Preview-ready React component that simulates a minimal workflow/rule engine
 * in the browser. It mirrors the architecture we discussed:
 *  • Global Context (robots/resources/env/traffic/tasks)
 *  • Workflow Graph (3 lanes: AGV Harvest, Spray, Irrigation)
 *  • Dynamic Rules: traffic oneway, resource queue balance, spray gating + refill,
 *    irrigation recheck loop, AGV low-battery swap
 *  • Controls: Start / Pause / Step / Reset, Tick speed
 *  • Live panels: Robots, Resources, Environment & Traffic, Queues, Event Log
 *
 * No external deps beyond React + Tailwind. Drop-in anywhere (Next/Vite/CRA).
 */

// -----------------------------
// Types (kept inline to keep single-file simple)
// -----------------------------

type RobotType = "AGV" | "SPRAY" | "IRR" | "SCAN";

type Robot = {
  id: string;
  type: RobotType;
  capabilities: string[];
  zone: string;
  battery: number; // 0..1
  payload: number; // 0..1 (AGV)
  moving: boolean;
  busy: boolean;
  task?: string | null;
};

type Station = { id: string; slots: number; queue: string[] };

type Resources = {
  docks: Record<string, Station>;
  chargers: Record<string, Station>;
  chemicals_L: number;
  water_L: number;
};

type Environment = { wind: number; rain: number; temp: number };

type Traffic = {
  occupancy: Record<string, number>;
  conflictProb: Record<string, number>;
  oneway: Record<string, number>; // segment -> TTL ticks
};

type Tasks = { spray_queue: string[]; irrigation_queue: Array<[string, number]> };

type GlobalContext = {
  robots: Record<string, Robot>;
  resources: Resources;
  env: Environment;
  traffic: Traffic;
  tasks: Tasks;
  now_tick: number;
};

type Node = { id: string; ref: string; params?: Record<string, any> };

type Lane = {
  laneId: string;
  deviceType: RobotType;
  nodes: Node[];
  edges: Array<[string, string]>; // (from, to)
  cursor: Record<string, string>; // robotId -> nodeId
};

type Workflow = { id: string; lanes: Lane[] };

type Event = { type: string; data?: Record<string, any> };

// -----------------------------
// Bootstrap Context & Workflow
// -----------------------------

function bootstrap(): GlobalContext {
  const robots: Record<string, Robot> = {
    "AGV-11": {
      id: "AGV-11",
      type: "AGV",
      capabilities: ["carry", "dock", "uwb_nav", "weight_cell", "charge", "charger_client"],
      zone: "A",
      battery: 0.45,
      payload: 0.0,
      moving: false,
      busy: false,
      task: null,
    },
    "AGV-12": {
      id: "AGV-12",
      type: "AGV",
      capabilities: ["carry", "dock", "uwb_nav", "weight_cell", "charge", "charger_client"],
      zone: "A",
      battery: 0.75,
      payload: 0.0,
      moving: false,
      busy: false,
      task: null,
    },
    "SPRAY-02": {
      id: "SPRAY-02",
      type: "SPRAY",
      capabilities: ["uwb_nav", "sprayer_nozzle", "spray_adaptive", "weather_api"],
      zone: "B",
      battery: 0.9,
      payload: 0,
      moving: false,
      busy: false,
      task: null,
    },
    "IRR-01": {
      id: "IRR-01",
      type: "IRR",
      capabilities: ["uwb_nav", "valve_ctrl", "flow_pid"],
      zone: "C",
      battery: 0.85,
      payload: 0,
      moving: false,
      busy: false,
      task: null,
    },
    "SCAN-01": {
      id: "SCAN-01",
      type: "SCAN",
      capabilities: ["uwb_nav", "camera_ms", "scan_ndvi", "thermal_scan"],
      zone: "C",
      battery: 0.8,
      payload: 0,
      moving: false,
      busy: false,
      task: null,
    },
  };

  const resources: Resources = {
    docks: { CS01: { id: "CS01", slots: 2, queue: [] }, CS02: { id: "CS02", slots: 2, queue: [] } },
    chargers: { CH01: { id: "CH01", slots: 2, queue: [] }, CH02: { id: "CH02", slots: 1, queue: [] } },
    chemicals_L: 120,
    water_L: 1000,
  };

  const env: Environment = { wind: 2.5, rain: 0, temp: 27 };
  const traffic: Traffic = {
    occupancy: { "SEG-A": 0.3, "SEG-B": 0.2 },
    conflictProb: { "SEG-A": 0.2, "SEG-B": 0.1 },
    oneway: {},
  };
  const tasks: Tasks = { spray_queue: ["B"], irrigation_queue: [["C", 300]] };

  return { robots, resources, env, traffic, tasks, now_tick: 0 };
}

function buildWorkflow(): Workflow {
  const laneA: Lane = {
    laneId: "LANE-A-HARVEST",
    deviceType: "AGV",
    nodes: [
      { id: "A_TR", ref: "TR_CRON", params: { cron: "0 7 * * 1" } },
      { id: "A_ROUTE_TO_PICK", ref: "AC_PLAN_ROUTE", params: { dest: "ZONE-A-PICKUP" } },
      { id: "A_PAYLOAD80", ref: "CD_PAYLOAD_HIGH" },
      { id: "A_ROUTE_DOCK", ref: "AC_PLAN_ROUTE", params: { dest: "DOCK-CS01" } },
      { id: "A_DOCK", ref: "AC_DOCK", params: { stationId: "CS01" } },
      { id: "A_UNLOAD", ref: "AC_UNLOAD" },
      { id: "A_CHARGE", ref: "AC_CHARGE", params: { stationId: "CH01" } },
      { id: "A_END", ref: "END_REPORT" },
    ],
    edges: [
      ["A_TR", "A_ROUTE_TO_PICK"],
      ["A_ROUTE_TO_PICK", "A_PAYLOAD80"],
      ["A_PAYLOAD80", "A_ROUTE_DOCK"],
      ["A_ROUTE_DOCK", "A_DOCK"],
      ["A_DOCK", "A_UNLOAD"],
      ["A_UNLOAD", "A_CHARGE"],
      ["A_CHARGE", "A_END"],
    ],
    cursor: {},
  };

  const laneB: Lane = {
    laneId: "LANE-B-SPRAY",
    deviceType: "SPRAY",
    nodes: [
      { id: "B_TR", ref: "TR_CRON", params: { cron: "0 7 * * 1" } },
      { id: "B_WEATHER", ref: "CD_WEATHER_OK" },
      { id: "B_TRAFFIC", ref: "CD_TRAFFIC_OK" },
      { id: "B_ROUTE", ref: "AC_PLAN_ROUTE", params: { dest: "ZONE-B-SPRAY" } },
      { id: "B_SPRAY", ref: "AC_SPRAY", params: { zone: "B" } },
      { id: "B_END", ref: "END_REPORT" },
    ],
    edges: [
      ["B_TR", "B_WEATHER"],
      ["B_WEATHER", "B_TRAFFIC"],
      ["B_TRAFFIC", "B_ROUTE"],
      ["B_ROUTE", "B_SPRAY"],
      ["B_SPRAY", "B_END"],
    ],
    cursor: {},
  };

  const laneC: Lane = {
    laneId: "LANE-C-IRRIGATION",
    deviceType: "IRR",
    nodes: [
      { id: "C_TR", ref: "TR_CRON", params: { cron: "0 7 * * 1" } },
      { id: "C_ROUTE", ref: "AC_PLAN_ROUTE", params: { dest: "ZONE-C-IRR" } },
      { id: "C_IRR", ref: "AC_IRRIGATE", params: { zone: "C", liters: 300 } },
      { id: "C_SCAN", ref: "AC_SCAN_NDVI", params: { zone: "C" } },
      { id: "C_END", ref: "END_REPORT" },
    ],
    edges: [
      ["C_TR", "C_ROUTE"],
      ["C_ROUTE", "C_IRR"],
      ["C_IRR", "C_SCAN"],
      ["C_SCAN", "C_END"],
    ],
    cursor: {},
  };

  return { id: "WF-ORCH-ABCs-001", lanes: [laneA, laneB, laneC] };
}

// -----------------------------
// Catalog (node behaviors)
// -----------------------------

type CatalogFn = (ctx: GlobalContext, emit: (e: Event) => void, robot: Robot, params?: Record<string, any>) => string | null;

const CatalogImpl: Record<string, CatalogFn> = {
  TR_CRON: () => "ok", // fires immediately (demo)
  AC_PLAN_ROUTE: (ctx, emit, robot, params) => {
    const dest = params?.dest ?? "";
    robot.moving = true; robot.busy = true; robot.task = `route:${dest}`;
    return `routed:${dest}`;
  },
  CD_PAYLOAD_HIGH: (ctx, emit, robot) => (robot.payload >= 0.8 ? "ok" : null),
  AC_DOCK: (ctx, emit, robot, params) => {
    const stationId = params?.stationId as string;
    const st = ctx.resources.docks[stationId];
    if (!st) return null;
    if (st.queue.length < st.slots) {
      if (!st.queue.includes(robot.id)) st.queue.push(robot.id);
      emit({ type: "dock_start", data: { robot: robot.id, station: stationId } });
      robot.moving = false; robot.busy = true;
      return `docking:${stationId}`;
    } else {
      if (!st.queue.includes(robot.id)) st.queue.push(robot.id);
      return null;
    }
  },
  AC_UNLOAD: (ctx, emit, robot) => {
    for (const sid of Object.keys(ctx.resources.docks)) {
      const st = ctx.resources.docks[sid];
      if (st.queue[0] === robot.id) {
        st.queue.shift();
        robot.payload = 0; robot.busy = false;
        emit({ type: "unloaded", data: { robot: robot.id, station: sid } });
        return "unloaded";
      }
    }
    return null;
  },
  AC_CHARGE: (ctx, emit, robot, params) => {
    const stationId = params?.stationId as string;
    const ch = ctx.resources.chargers[stationId];
    if (!ch) return null;
    if (ch.queue.length < ch.slots) {
      if (!ch.queue.includes(robot.id)) ch.queue.push(robot.id);
      emit({ type: "charge_start", data: { robot: robot.id, station: stationId } });
      return `charging:${stationId}`;
    } else {
      if (!ch.queue.includes(robot.id)) ch.queue.push(robot.id);
      return null;
    }
  },
  CD_WEATHER_OK: (ctx) => (ctx.env.wind <= 5 && ctx.env.rain === 0 && ctx.env.temp >= 10 && ctx.env.temp <= 30 ? "ok" : null),
  CD_TRAFFIC_OK: (ctx) => (Object.values(ctx.traffic.occupancy).every((v) => v < 0.8) ? "ok" : null),
  AC_SPRAY: (ctx, emit, robot, params) => {
    const zone = (params?.zone as string) ?? robot.zone;
    if (ctx.resources.chemicals_L <= 0) return null;
    robot.busy = true;
    const used = 5;
    ctx.resources.chemicals_L = Math.max(0, ctx.resources.chemicals_L - used);
    emit({ type: "sprayed", data: { robot: robot.id, zone, used_L: used } });
    robot.busy = false;
    return "sprayed";
  },
  AC_SCAN_NDVI: (ctx, emit, robot, params) => {
    const zone = (params?.zone as string) ?? robot.zone;
    const score = 0.7 + 0.2 * Math.random();
    emit({ type: "ndvi_scanned", data: { robot: robot.id, zone, ndvi: Number(score.toFixed(2)) } });
    return `ndvi:${score.toFixed(2)}`;
  },
  AC_IRRIGATE: (ctx, emit, robot, params) => {
    const zone = (params?.zone as string) ?? robot.zone;
    const liters = Number(params?.liters ?? 200);
    if (ctx.resources.water_L < liters) return null;
    ctx.resources.water_L -= liters;
    emit({ type: "irrigated", data: { robot: robot.id, zone, liters } });
    return `irrigated:${liters}`;
  },
  END_REPORT: () => "done",
};

// -----------------------------
// Rules
// -----------------------------

function ruleTrafficOneway(ctx: GlobalContext, emit: (e: Event) => void) {
  for (const seg of Object.keys(ctx.traffic.occupancy)) {
    ctx.traffic.occupancy[seg] = clamp01(ctx.traffic.occupancy[seg] + rand(-0.05, 0.1));
    ctx.traffic.conflictProb[seg] = clamp01(ctx.traffic.conflictProb[seg] + rand(-0.05, 0.1));
    if (ctx.traffic.conflictProb[seg] >= 0.6 && !(seg in ctx.traffic.oneway)) {
      ctx.traffic.oneway[seg] = 5; // ticks
      emit({ type: "traffic_oneway_set", data: { segment: seg, ttl: 5 } });
    }
  }
  for (const seg of Object.keys(ctx.traffic.oneway)) {
    ctx.traffic.oneway[seg] -= 1;
    if (ctx.traffic.oneway[seg] <= 0) {
      delete ctx.traffic.oneway[seg];
      emit({ type: "traffic_oneway_cleared", data: { segment: seg } });
    }
  }
}

function ruleResourceBalance(ctx: GlobalContext, emit: (e: Event) => void) {
  const balance = (stations: Record<string, Station>, primary: string, secondary: string, threshold = 3) => {
    const p = stations[primary];
    const s = stations[secondary];
    if (!p || !s) return;
    if (p.queue.length >= threshold && s.queue.length < s.slots) {
      const moved = p.queue.pop();
      if (moved) {
        s.queue.push(moved);
        emit({ type: "queue_balanced", data: { moved, from: primary, to: secondary } });
      }
    }
  };
  balance(ctx.resources.docks, "CS01", "CS02");
  balance(ctx.resources.chargers, "CH01", "CH02");
}

function ruleSprayGateRefill(ctx: GlobalContext, emit: (e: Event) => void) {
  if (!ctx.tasks.spray_queue.length) return;
  const weatherOk = ctx.env.wind <= 5 && ctx.env.rain === 0 && ctx.env.temp >= 10 && ctx.env.temp <= 30;
  if (!weatherOk) {
    emit({ type: "spray_denied_weather" });
    return;
  }
  const zone = ctx.tasks.spray_queue[0];
  const sprayer = Object.values(ctx.robots).find((r) => r.type === "SPRAY" && !r.busy);
  if (!sprayer) return;
  if (ctx.resources.chemicals_L < 5) {
    ctx.resources.chemicals_L += 50;
    emit({ type: "spray_refill", data: { robot: sprayer.id, added: 50 } });
  }
  // perform spray
  ctx.resources.chemicals_L = Math.max(0, ctx.resources.chemicals_L - 5);
  emit({ type: "sprayed", data: { robot: sprayer.id, zone, used_L: 5 } });
  ctx.tasks.spray_queue.shift();
}

function ruleIrrigationRecheck(ctx: GlobalContext, emit: (e: Event) => void) {
  if (ctx.now_tick % 10 === 3) {
    const scan = ctx.robots["SCAN-01"];
    if (scan) {
      const val = 0.7 + 0.2 * Math.random();
      emit({ type: "ndvi_scanned", data: { robot: scan.id, zone: "C", ndvi: Number(val.toFixed(2)) } });
      if (val < 0.75) {
        ctx.tasks.irrigation_queue.push(["C", 150]);
        emit({ type: "irrigation_rework", data: { zone: "C", liters: 150 } });
      }
    }
  }
}

function ruleAgvLowBatSwap(ctx: GlobalContext, emit: (e: Event) => void) {
  const low = Object.values(ctx.robots).filter((r) => r.type === "AGV" && r.battery <= 0.2);
  const free = Object.values(ctx.robots).filter((r) => r.type === "AGV" && r.battery >= 0.6 && !r.busy);
  for (const rob of low) {
    const ch = ctx.resources.chargers["CH01"];
    if (ch && !ch.queue.includes(rob.id)) {
      ch.queue.push(rob.id);
      emit({ type: "charge_queued", data: { robot: rob.id, station: "CH01" } });
    }
    if (free.length) {
      const replacement = free.shift()!;
      replacement.task = rob.task ?? null;
      rob.task = null;
      emit({ type: "agv_swapped", data: { from: rob.id, to: replacement.id } });
    }
  }
}

// -----------------------------
// Workflow Stepper + Rules Runner
// -----------------------------

function stepWorkflow(ctx: GlobalContext, wf: Workflow, pushEvent: (e: Event) => void) {
  const runNode = (node: Node, robot: Robot) => CatalogImpl[node.ref]?.(ctx, pushEvent, robot, node.params) ?? null;

  for (const lane of wf.lanes) {
    const robots = Object.values(ctx.robots).filter((r) => r.type === lane.deviceType);
    if (!robots.length) continue;
    const robot = robots[0]; // simple bind for demo
    if (!lane.cursor[robot.id]) lane.cursor[robot.id] = lane.nodes[0].id;

    const currentId = lane.cursor[robot.id];
    const node = lane.nodes.find((n) => n.id === currentId);
    if (!node) continue;

    const result = runNode(node, robot);
    if (result !== null) {
      const edge = lane.edges.find(([from]) => from === node.id);
      if (edge) lane.cursor[robot.id] = edge[1];
    }
  }

  // side effects: charge/drain/payload load progression
  for (const ch of Object.values(ctx.resources.chargers)) {
    for (const rid of [...ch.queue]) {
      const r = ctx.robots[rid];
      r.battery = Math.min(1, r.battery + 0.1);
      if (r.battery >= 0.99) {
        ch.queue = ch.queue.filter((x) => x !== rid);
        pushEvent({ type: "charged_full", data: { robot: rid, station: ch.id } });
      }
    }
  }
  for (const r of Object.values(ctx.robots)) {
    if (r.moving || r.busy) r.battery = Math.max(0, r.battery - 0.02);
  }
  for (const r of Object.values(ctx.robots)) {
    if (r.type === "AGV" && r.task?.startsWith("route:ZONE-A-PICKUP") && r.payload < 0.8) {
      r.payload = Math.min(1, r.payload + 0.1);
    }
  }
}

function runRules(ctx: GlobalContext, pushEvent: (e: Event) => void) {
  ruleTrafficOneway(ctx, pushEvent);
  ruleResourceBalance(ctx, pushEvent);
  ruleSprayGateRefill(ctx, pushEvent);
  ruleIrrigationRecheck(ctx, pushEvent);
  ruleAgvLowBatSwap(ctx, pushEvent);
}

// -----------------------------
// UI helpers
// -----------------------------

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function rand(a: number, b: number) { return a + Math.random() * (b - a); }

function BatteryBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-28 h-3 rounded bg-gray-200 overflow-hidden">
      <div className="h-3" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-4 border">
      <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
      {children}
    </div>
  );
}

// -----------------------------
// Main Component (default export)
// -----------------------------

export default function AgriWorkflowReactProDemo() {
  const [ctx, setCtx] = useState<GlobalContext>(() => bootstrap());
  const [wf] = useState<Workflow>(() => buildWorkflow());
  const [events, setEvents] = useState<Event[]>([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(350); // ms per tick
  const timer = useRef<number | null>(null);

  const pushEvent = (e: Event) => setEvents((xs) => [...xs.slice(-199), e]);

  const tick = () => {
    setCtx((prev) => {
      const nc: GlobalContext = JSON.parse(JSON.stringify(prev));
      // 1) step workflow (lanes)
      stepWorkflow(nc, wf, pushEvent);
      // 2) rules
      runRules(nc, pushEvent);
      // 3) time
      nc.now_tick += 1;
      return nc;
    });
  };

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(tick, speed) as unknown as number;
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [running, speed]);

  const reset = () => { setCtx(bootstrap()); setEvents([]); };

  const robots = Object.values(ctx.robots);

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Agri Workflow Engine — React Pro Demo</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning((v) => !v)} className="px-3 py-1.5 rounded-xl border shadow">
              {running ? "Pause" : "Start"}
            </button>
            <button onClick={tick} className="px-3 py-1.5 rounded-xl border shadow">Step</button>
            <button onClick={reset} className="px-3 py-1.5 rounded-xl border shadow">Reset</button>
            <label className="ml-2 text-sm">Speed
              <input type="range" min={120} max={1000} step={10} value={speed} onChange={(e)=>setSpeed(Number(e.target.value))} className="ml-2 align-middle" />
            </label>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <Section title="Robots">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th>ID</th><th>Type</th><th>Battery</th><th>Payload</th><th>Task</th>
                </tr>
              </thead>
              <tbody>
                {robots.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-1">{r.id}</td>
                    <td>{r.type}</td>
                    <td className="flex items-center gap-2"><BatteryBar value={r.battery} /><span>{Math.round(r.battery*100)}%</span></td>
                    <td>{r.type === "AGV" ? `${Math.round(r.payload*100)}%` : "-"}</td>
                    <td className="truncate max-w-[140px]" title={r.task ?? ""}>{r.task ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Resources">
            <div className="text-sm grid grid-cols-2 gap-3">
              <div>
                <div className="font-medium">Docks</div>
                {Object.values(ctx.resources.docks).map((s) => (
                  <div key={s.id} className="flex justify-between border rounded p-1 mt-1">
                    <span>{s.id}</span>
                    <span>{s.queue.length}/{s.slots}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium">Chargers</div>
                {Object.values(ctx.resources.chargers).map((s) => (
                  <div key={s.id} className="flex justify-between border rounded p-1 mt-1">
                    <span>{s.id}</span>
                    <span>{s.queue.length}/{s.slots}</span>
                  </div>
                ))}
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="border rounded p-2">Chemicals: {ctx.resources.chemicals_L.toFixed(1)} L</div>
                <div className="border rounded p-2">Water: {ctx.resources.water_L.toFixed(1)} L</div>
              </div>
            </div>
          </Section>

          <Section title="Environment & Traffic">
            <div className="text-sm grid grid-cols-2 gap-3">
              <div className="border rounded p-2">Wind: {ctx.env.wind} m/s</div>
              <div className="border rounded p-2">Temp: {ctx.env.temp} ℃</div>
              <div className="border rounded p-2">Rain: {ctx.env.rain}</div>
              <div className="border rounded p-2">Tick: {ctx.now_tick}</div>
              <div className="col-span-2">
                <div className="font-medium mb-1">Traffic</div>
                {Object.keys(ctx.traffic.occupancy).map((seg) => (
                  <div key={seg} className="flex items-center justify-between border rounded p-1 mt-1">
                    <span>{seg}</span>
                    <span>occ {Math.round(ctx.traffic.occupancy[seg]*100)}% · conf {Math.round(ctx.traffic.conflictProb[seg]*100)}% · oneway {seg in ctx.traffic.oneway ? `TTL ${ctx.traffic.oneway[seg]}` : "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Queues">
            <div className="text-sm grid grid-cols-2 gap-3">
              <div className="border rounded p-2">
                <div className="font-medium">Spray</div>
                {ctx.tasks.spray_queue.length ? (
                  <ul className="list-disc list-inside">
                    {ctx.tasks.spray_queue.map((z, i) => <li key={i}>Zone {z}</li>)}
                  </ul>
                ) : <div className="text-gray-500">Empty</div>}
              </div>
              <div className="border rounded p-2">
                <div className="font-medium">Irrigation</div>
                {ctx.tasks.irrigation_queue.length ? (
                  <ul className="list-disc list-inside">
                    {ctx.tasks.irrigation_queue.map(([z, l], i) => <li key={i}>Zone {z} · {l} L</li>)}
                  </ul>
                ) : <div className="text-gray-500">Empty</div>}
              </div>
            </div>
          </Section>

          <Section title="Event Log (latest 200)">
            <div className="h-64 overflow-auto text-xs font-mono bg-white border rounded p-2">
              {events.length === 0 && <div className="text-gray-400">No events yet. Press Start or Step.</div>}
              {events.map((e, i) => (
                <div key={i} className="border-b py-1 flex items-center justify-between">
                  <span className="text-gray-600">{e.type}</span>
                  <span className="text-gray-500">{JSON.stringify(e.data || {})}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <footer className="text-xs text-gray-500 text-right">Agri Workflow Engine — React Pro Demo · single-file · no deps</footer>
      </div>
    </div>
  );
}
