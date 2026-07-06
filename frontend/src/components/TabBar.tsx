"use client";

import { useState } from "react";
import ChatPanel from "./ChatPanel";

const tabs = ["Chat", "Audio", "Image", "Video"] as const;
type Tab = (typeof tabs)[number];

interface TabBarProps {
  sourceText: string;
}

export default function TabBar({ sourceText }: TabBarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Chat");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[300px] rounded-xl bg-white/5 backdrop-blur-sm border border-purple-500/20 p-6">
        {activeTab === "Chat" && <ChatPanel sourceText={sourceText} />}
        {activeTab !== "Chat" && (
          <p className="text-purple-200/70 text-center py-12">
            {activeTab} feature coming soon...
          </p>
        )}
      </div>
    </div>
  );
}
