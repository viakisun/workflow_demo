"use client";

import {
  Play,
  Pause,
  StepForward,
  Undo,
  Redo,
  Search,
  Upload,
} from "lucide-react";
import { IconButton } from "./primitives/IconButton";
import { Button } from "./primitives/Button";
import { RobotType } from "@/types/core";
import { useUIStore } from "@/store/ui";
import { useWorkspaceStore } from "@/store/workspace";
import { useGraphStore } from "@/store/graph";

export default function TopBar() {
  const { setSelectedDevice } = useUIStore();
  const { loadFromSeed } = useWorkspaceStore();
  const { addNode, undo, redo } = useGraphStore();

  return (
    <header className="h-14 border-b border-stroke bg-panel-2 flex items-center gap-2 px-3">
      <Button
        variant="secondary"
        onClick={() => addNode("action", "New Action")}
      >
        + Add node
      </Button>
      <div className="flex items-center gap-1">
        <IconButton icon={Play} label="Play" />
        <IconButton icon={Pause} label="Pause" />
        <IconButton icon={StepForward} label="Step" />
      </div>
      <div className="flex items-center gap-1">
        <IconButton icon={Undo} label="Undo" onClick={undo} />
        <IconButton icon={Redo} label="Redo" onClick={redo} />
      </div>
      <div className="mx-auto max-w-xl w-full flex items-center gap-2 px-4">
        <Search className="size-4 text-muted" />
        <input
          aria-label="Search"
          placeholder="Search nodes..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          className="bg-panel border border-stroke rounded-lg px-2 py-1.5 text-sm text-text"
          onChange={(e) => setSelectedDevice(e.target.value as RobotType)}
          defaultValue="AGV"
        >
          <option value="AGV">AGV</option>
          <option value="SPRAY">SPRAY</option>
          <option value="IRR">IRR</option>
          <option value="SCAN">SCAN</option>
        </select>
        <Button variant="secondary" onClick={loadFromSeed}>
          <Upload className="size-4 mr-2" />
          Import JSON
        </Button>
        <div
          className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500"
          aria-label="User avatar"
        />
      </div>
    </header>
  );
}
