"use client";

import { useState, useEffect, useCallback } from "react";
import {
  nlmStatus,
  nlmListNotebooks,
  nlmCreateNotebook,
  nlmAddTextSource,
  nlmChat,
  nlmGenerateAudio,
  nlmGenerateVideo,
  nlmGenerateQuiz,
  nlmGenerateReport,
  nlmGenerateMindMap,
  nlmGenerateSlides,
} from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NotebookLMPanelProps {
  sourceText: string;
}

type NlmTab =
  | "Setup"
  | "Chat"
  | "Audio"
  | "Video"
  | "Quiz"
  | "Report"
  | "Slides"
  | "Mind Map";

const nlmTabs: NlmTab[] = [
  "Setup",
  "Chat",
  "Audio",
  "Video",
  "Quiz",
  "Report",
  "Slides",
  "Mind Map",
];

const nlmTabIcons: Record<NlmTab, string> = {
  Setup: "🔗",
  Chat: "💬",
  Audio: "🎙️",
  Video: "🎬",
  Quiz: "❓",
  Report: "📄",
  Slides: "📊",
  "Mind Map": "🧠",
};

export default function NotebookLMPanel({ sourceText }: NotebookLMPanelProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<NlmTab>("Setup");
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [notebookTitle, setNotebookTitle] = useState("");
  const [sourceAdded, setSourceAdded] = useState(false);

  useEffect(() => {
    nlmStatus().then((d) => setConfigured(d.configured));
  }, []);

  const handleConnect = async () => {
    if (!sourceText.trim()) return;
    const title = `Portal Notebook — ${new Date().toLocaleDateString()}`;
    const nb = await nlmCreateNotebook(title);
    if (nb.id) {
      setNotebookId(nb.id);
      setNotebookTitle(nb.title);
      const src = await nlmAddTextSource(nb.id, "Source Text", sourceText);
      if (src.id) setSourceAdded(true);
    }
  };

  if (configured === null) {
    return (
      <div className="flex items-center justify-center h-[300px] text-purple-300/50">
        Checking NotebookLM connection...
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center gap-4">
        <div className="text-5xl opacity-40">🔒</div>
        <div>
          <p className="text-purple-200 font-medium mb-1">
            NotebookLM Not Connected
          </p>
          <p className="text-purple-300/50 text-sm max-w-sm">
            Set <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">NBLM_SESSION</code> env var on
            the backend with your Google session cookies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {nlmTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "bg-white/5 text-purple-200/60 hover:bg-white/10 hover:text-purple-100"
            }`}
          >
            <span>{nlmTabIcons[tab]}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px] rounded-xl bg-white/5 border border-emerald-500/20 p-4 sm:p-6">
        {activeTab === "Setup" && (
          <SetupTab
            notebookId={notebookId}
            notebookTitle={notebookTitle}
            sourceAdded={sourceAdded}
            sourceText={sourceText}
            onConnect={handleConnect}
          />
        )}
        {activeTab === "Chat" && notebookId && (
          <NlmChatTab notebookId={notebookId} />
        )}
        {activeTab === "Audio" && notebookId && (
          <NlmAudioTab notebookId={notebookId} />
        )}
        {activeTab === "Video" && notebookId && (
          <NlmVideoTab notebookId={notebookId} />
        )}
        {activeTab === "Quiz" && notebookId && (
          <NlmQuizTab notebookId={notebookId} />
        )}
        {activeTab === "Report" && notebookId && (
          <NlmReportTab notebookId={notebookId} />
        )}
        {activeTab === "Slides" && notebookId && (
          <NlmSlidesTab notebookId={notebookId} />
        )}
        {activeTab === "Mind Map" && notebookId && (
          <NlmMindMapTab notebookId={notebookId} />
        )}
      </div>
    </div>
  );
}

// ─── Setup Tab ────────────────────────────────────────────────────────

function SetupTab({
  notebookId,
  notebookTitle,
  sourceAdded,
  sourceText,
  onConnect,
}: {
  notebookId: string | null;
  notebookTitle: string;
  sourceAdded: boolean;
  sourceText: string;
  onConnect: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🔗</span>
        <h3 className="text-lg font-semibold text-white">
          Connect to NotebookLM
        </h3>
      </div>

      {!notebookId ? (
        <>
          <p className="text-sm text-purple-200/70 leading-relaxed">
            Click below to create a <strong>real notebook</strong> on Google
            NotebookLM and add your source text as a source.
          </p>
          <button
            onClick={onConnect}
            disabled={!sourceText.trim()}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
          >
            Create Notebook & Add Source
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>✅</span>
            <span className="font-medium">Connected to NotebookLM</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-emerald-500/20 text-sm">
            <p className="text-purple-200/60">
              Notebook: <span className="text-white">{notebookTitle}</span>
            </p>
            <p className="text-purple-200/60 mt-1">
              Source:{" "}
              <span className="text-emerald-400">
                {sourceAdded ? "Added ✅" : "Adding..."}
              </span>
            </p>
            <p className="text-purple-200/60 mt-1 font-mono text-xs">
              ID: {notebookId}
            </p>
          </div>
          <p className="text-xs text-purple-300/50">
            Now use the tabs above — Chat, Audio, Video, Quiz, Report, Slides,
            Mind Map — everything runs on the real Google NotebookLM.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────

function NlmChatTab({ notebookId }: { notebookId: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!question.trim() || loading) return;
    const q = question;
    setMessages((p) => [...p, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);
    setError(null);

    const data = await nlmChat(notebookId, q);
    if (data.error || data.detail) {
      setError(data.detail || "Chat failed");
    } else if (data.answer) {
      setMessages((p) => [...p, { role: "assistant", content: data.answer }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[350px] sm:h-[400px]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-2 opacity-40">💬</div>
            <p className="text-purple-300/50 text-sm">
              Ask NotebookLM about your source...
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-md"
                  : "bg-white/10 text-purple-100 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-purple-300/60">
                  NotebookLM thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask NotebookLM..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !question.trim()}
          className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

// ─── Audio Tab ────────────────────────────────────────────────────────

function NlmAudioTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateAudio(notebookId, instructions);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Audio
        </span>
      </div>
      <input
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instructions (optional): make it engaging..."
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40 shadow-lg shadow-emerald-600/20"
      >
        {loading
          ? "Generating on NotebookLM... (may take 1-2 min)"
          : "Generate Audio Overview"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.file && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Audio generated! File: <code className="text-xs">{result.file}</code>
          <p className="mt-1 text-xs text-purple-300/50">
            Artifact ID: {result.artifact_id}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Video Tab ────────────────────────────────────────────────────────

function NlmVideoTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [style, setStyle] = useState("classic");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateVideo(notebookId, instructions, style);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Video
        </span>
      </div>
      <div className="flex gap-2">
        <input
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions (optional)..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm"
        >
          <option value="classic">Classic</option>
          <option value="whiteboard">Whiteboard</option>
          <option value="anime">Anime</option>
          <option value="watercolor">Watercolor</option>
          <option value="kawaii">Kawaii</option>
          <option value="retro_print">Retro</option>
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40 shadow-lg shadow-emerald-600/20"
      >
        {loading
          ? "Generating on NotebookLM... (may take 2-3 min)"
          : "Generate Video Overview"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.file && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Video generated! File: <code className="text-xs">{result.file}</code>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────

function NlmQuizTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("medium");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateQuiz(notebookId, difficulty);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Quiz
        </span>
      </div>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="px-4 py-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm w-48"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40"
      >
        {loading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.file && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Quiz generated! File: <code className="text-xs">{result.file}</code>
        </div>
      )}
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────

function NlmReportTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateReport(notebookId, prompt);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Report
        </span>
      </div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Custom prompt (optional): e.g. study guide, briefing doc..."
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40"
      >
        {loading ? "Generating Report..." : "Generate Report"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.file && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Report generated! File:{" "}
          <code className="text-xs">{result.file}</code>
        </div>
      )}
    </div>
  );
}

// ─── Slides Tab ───────────────────────────────────────────────────────

function NlmSlidesTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateSlides(notebookId, instructions);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Slides
        </span>
      </div>
      <input
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instructions (optional)..."
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40"
      >
        {loading ? "Generating Slides..." : "Generate Slide Deck"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.file && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Slides generated! File:{" "}
          <code className="text-xs">{result.file}</code>
        </div>
      )}
    </div>
  );
}

// ─── Mind Map Tab ─────────────────────────────────────────────────────

function NlmMindMapTab({ notebookId }: { notebookId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const data = await nlmGenerateMindMap(notebookId);
    if (data.error) setError(data.error);
    else setResult(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">
          Real NotebookLM Mind Map
        </span>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40"
      >
        {loading ? "Generating Mind Map..." : "Generate Interactive Mind Map"}
      </button>
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && result.mind_map_id && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          Mind Map generated! ID:{" "}
          <code className="text-xs">{result.mind_map_id}</code>
        </div>
      )}
    </div>
  );
}
