"use client";

import { useState } from "react";
import { clsx } from "clsx";

type Tab = {
  id: string;
  label: string;
};

type SegmentedTabsProps = {
  tabs: Tab[];
  initial: string;
  onTabChange?: (id:string) => void;
};

export function SegmentedTabs({
  tabs,
  initial,
  onTabChange,
}: SegmentedTabsProps) {
  const [activeTab, setActiveTab] = useState(initial);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onTabChange) {
      onTabChange(id);
    }
  };

  return (
    <div className="flex w-full p-1 bg-panel rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={clsx(
            "flex-1 px-3 py-1 text-sm rounded-md transition-colors",
            {
              "bg-panel-2 text-text shadow-sm": activeTab === tab.id,
              "text-muted hover:text-text": activeTab !== tab.id,
            }
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
