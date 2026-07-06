"use client";

import { useState } from "react";
import ChatPanel from "./ChatPanel";
import AudioPanel from "./AudioPanel";
import ImagePanel from "./ImagePanel";
import VideoPanel from "./VideoPanel";

const tabs = ["Chat", "Audio", "Image", "Video"] as const;
type Tab = (typeof tabs)[number];

const tabIcons: Record<Tab, string> = {
  Chat: "💬",
  Audio: "🎙️",
  Image: "🎨",
  Video: "🎬",
};

interface TabBarProps {
  sourceText: string;
  maxChars: number;
}

export default function TabBar({ sourceText, maxChars }: TabBarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Chat");
  const hasText = sourceText.trim().length > 0;
  const overLimit = sourceText.length > maxChars;

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-[var(--surface)] text-purple-200/70 hover:bg-white/10 hover:text-purple-100"
            }`}
          >
            <span className="text-base">{tabIcons[tab]}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px] rounded-xl bg-[var(--surface)] backdrop-blur-sm border border-[var(--surface-border)] p-4 sm:p-6">
        {!hasText ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-center">
            <div className="text-4xl mb-3 opacity-50">📝</div>
            <p className="text-purple-300/60 text-sm max-w-xs">
              Paste some source text above, then select a tab to get started.
            </p>
          </div>
        ) : overLimit ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-center">
            <div className="text-4xl mb-3 opacity-50">⚠️</div>
            <p className="text-red-400 text-sm max-w-xs">
              Your text exceeds {maxChars.toLocaleString()} characters.
              Please shorten it to use the AI features.
            </p>
          </div>
        ) : (
          <>
            {activeTab === "Chat" && <ChatPanel sourceText={sourceText} />}
            {activeTab === "Audio" && <AudioPanel sourceText={sourceText} />}
            {activeTab === "Image" && <ImagePanel sourceText={sourceText} />}
            {activeTab === "Video" && <VideoPanel sourceText={sourceText} />}
          </>
        )}
      </div>
    </div>
  );
}
