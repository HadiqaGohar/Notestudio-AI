"use client";

import { useState } from "react";
import SourceInput from "@/components/SourceInput";
import TabBar from "@/components/TabBar";
import NotebookLMPanel from "@/components/NotebookLMPanel";

const MAX_CHARS = 50000;

type Mode = "free" | "notebooklm";

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [mode, setMode] = useState<Mode>("free");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              NoteStudio AI
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/70 mt-0.5">
              Transform your notes into multiple formats with AI
            </p>
          </div>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-purple-500/20">
            <button
              onClick={() => setMode("free")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                mode === "free"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-purple-300/60 hover:text-purple-100"
              }`}
            >
              Free AI
            </button>
            <button
              onClick={() => setMode("notebooklm")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                mode === "notebooklm"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-purple-300/60 hover:text-purple-100"
              }`}
            >
              NotebookLM
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <SourceInput
          sourceText={sourceText}
          onSourceTextChange={setSourceText}
          maxChars={MAX_CHARS}
        />

        {mode === "free" ? (
          <TabBar sourceText={sourceText} maxChars={MAX_CHARS} />
        ) : (
          <NotebookLMPanel sourceText={sourceText} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-purple-300/50">
            {mode === "free" ? (
              <>
                Built with free AI tools —{" "}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-purple-200 transition-colors"
                >
                  Gemini via OpenRouter
                </a>
              </>
            ) : (
              <>
                Connected to{" "}
                <a
                  href="https://notebooklm.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-emerald-200 text-emerald-400/70 transition-colors"
                >
                  Google NotebookLM
                </a>{" "}
                via notebooklm-py
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
