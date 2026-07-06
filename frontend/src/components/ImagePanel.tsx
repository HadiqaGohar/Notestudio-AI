"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ImagePanelProps {
  sourceText: string;
}

export default function ImagePanel({ sourceText }: ImagePanelProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setPrompt(null);

    try {
      const res = await fetch(`${API_URL}/api/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: sourceText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Image generation failed.");
      } else if (data.image_url) {
        setImageUrl(`${API_URL}${data.image_url}`);
        setPrompt(data.prompt);
      } else {
        setError("Unexpected response from the server.");
      }
    } catch {
      setError("Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating image...
          </span>
        ) : (
          "Generate Image"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Image preview */}
      {imageUrl && (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt="Generated image"
            className="w-full rounded-lg border border-purple-500/20"
          />
          <a
            href={imageUrl}
            download
            className="inline-flex items-center gap-1.5 text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download image
          </a>
        </div>
      )}

      {/* Prompt preview */}
      {prompt && (
        <div className="mt-1">
          <p className="text-xs text-purple-300/50 mb-1.5 uppercase tracking-wide font-medium">
            Generated Prompt
          </p>
          <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10 text-sm text-purple-100/80 leading-relaxed">
            {prompt}
          </div>
        </div>
      )}
    </div>
  );
}
