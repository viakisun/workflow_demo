"use client";

import { useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import Inspector from "./Inspector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./primitives/Resizable";
import { useUIStore } from "@/store/ui";
import { useWorkspaceStore } from "@/store/workspace";
import { useGraphStore } from "@/store/graph";

export default function AppShell() {
  const { selectedDevice } = useUIStore();
  const { workflow, rules, registry, loadFromSeed } = useWorkspaceStore();
  const { deleteSelection } = useGraphStore();

  useEffect(() => {
    loadFromSeed();
  }, [loadFromSeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelection]);

  return (
    <div className="h-screen w-screen bg-bg text-text flex flex-col">
      <TopBar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <Sidebar selectedDevice={selectedDevice} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55}>
          <Canvas />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={15}>
          <Inspector workflow={workflow} rules={rules} registry={registry} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
