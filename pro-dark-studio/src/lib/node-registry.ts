import { NodeRegistryEntry } from "@/types/core";

export const NODE_REGISTRY: NodeRegistryEntry[] = [
  {
    nodeId: "TR_START",
    type: "trigger",
    title: "Start",
  },
  {
    nodeId: "CO_CHECK_PAYLOAD",
    type: "condition",
    title: "Check Payload",
    required: ["weight_cell"],
  },
  {
    nodeId: "AC_GET_MISSION",
    type: "action",
    title: "Get Mission",
    required: ["slam_nav"],
  },
  {
    nodeId: "AC_SPRAY",
    type: "action",
    title: "Spray Area",
    required: ["sprayer_nozzle|flow_pid"],
  },
  {
    nodeId: "EN_END",
    type: "end",
    title: "End",
  },
];
