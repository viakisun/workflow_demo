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

export default function AppShell() {
  const { loadSeedData } = useWorkspaceStore();
  const { deleteSelection } = useGraphStore();
  const { selectedDevice } = useUIStore();

  useEffect(() => {
    // Load initial data when the app starts.
    // The store is persisted, so this will only run if storage is empty.
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
          <Inspector />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
