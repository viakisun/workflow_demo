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

export default function AppShell() {
  const { selectedDevice, setSelectedDevice } = useUIStore();
  const { workflow, rules, registry, loadFromSeed } = useWorkspaceStore();

  useEffect(() => {
    loadFromSeed();
  }, [loadFromSeed]);

  const handleImport = () => {
    // This would typically open a file dialog.
    // For now, we'll just re-load the seed data as a stand-in.
    console.log("Importing JSON...");
    loadFromSeed();
  };

  return (
    <div className="h-screen w-screen bg-bg text-text flex flex-col">
      <TopBar
        onImportClick={handleImport}
        onDeviceChange={setSelectedDevice}
      />
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
