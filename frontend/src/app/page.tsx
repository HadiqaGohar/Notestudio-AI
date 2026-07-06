"use client";

import { useState } from "react";
import SourceInput from "@/components/SourceInput";
import TabBar from "@/components/TabBar";

export default function Home() {
  const [sourceText, setSourceText] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            NoteStudio AI
          </h1>
          <p className="text-xl text-purple-200">
            Transform your notes into multiple formats with AI
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <SourceInput
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
          />
          <TabBar sourceText={sourceText} />
        </div>
      </div>
    </div>
  );
}
