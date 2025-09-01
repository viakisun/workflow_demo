import { create } from "zustand";
import { RobotSpec, RobotType } from "@/types/core";

// Mock device specs for the selector
export const MOCK_DEVICES: Record<RobotType, RobotSpec> = {
  AGV: { id: "agv_1", type: "AGV", capabilities: ["carry", "slam_nav", "weight_cell"] },
  SPRAY: { id: "spray_1", type: "SPRAY", capabilities: ["sprayer_nozzle", "flow_pid", "camera_rgb"] },
  IRR: { id: "irr_1", type: "IRR", capabilities: ["valve_ctrl", "soil_moisture"] },
  SCAN: { id: "scan_1", type: "SCAN", capabilities: ["camera_rgb", "lidar_3d", "imu"] },
};

type UIState = {
  zoom: number;
  running: boolean;
  selectedDevice: RobotSpec;
  set: (p: Partial<UIState>) => void;
  setSelectedDevice: (type: RobotType) => void;
};

export const useUIStore = create<UIState>((set) => ({
  zoom: 1,
  running: false,
  selectedDevice: MOCK_DEVICES.AGV,
  set: (p) => set(p),
  setSelectedDevice: (type) => set({ selectedDevice: MOCK_DEVICES[type] }),
}));
