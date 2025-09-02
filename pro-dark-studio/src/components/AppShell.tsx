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
import { useWorkspaceStore } from "@/store/workspace";
import { useGraphStore } from "@/store/graph";
import { useUIStore } from "@/store/ui";
import { useEngineStore } from "@/store/engine";
import { ToastProvider } from "./primitives/Toast";
import EventLog from "./EventLog";
import { tick } from "@/lib/engine/engine";

export default function AppShell() {
  const { loadSeedData } = useWorkspaceStore();
  const { deleteSelection } = useGraphStore();
  const { selectedDevice } = useUIStore();
  const { isRunning } = useEngineStore();

  useEffect(() => {
    const unsub = useWorkspaceStore.subscribe(
      (state) => {
        if (!state.workflow) {
          loadSeedData();
        }
      },
      { fireImmediately: true }
    );
    return unsub;
  }, [loadSeedData]);

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

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      tick();
    }, 1000); // Tick every second
    return () => clearInterval(interval);
  }, [isRunning]);


  return (
    <div className="h-screen w-screen bg-bg text-text flex flex-col">
      <TopBar />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15}>
              <Sidebar selectedDevice={selectedDevice} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55}>
              <Canvas />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={15}>
              <Inspector />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25}>
          <EventLog />
        </ResizablePanel>
      </ResizablePanelGroup>
      <ToastProvider />
    </div>
  );
}
