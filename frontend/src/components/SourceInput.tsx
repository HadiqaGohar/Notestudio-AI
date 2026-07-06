"use client";

interface SourceInputProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
}

export default function SourceInput({
  sourceText,
  onSourceTextChange,
}: SourceInputProps) {
  return (
    <div className="mb-8">
      <label
        htmlFor="source-text"
        className="block text-sm font-medium text-purple-200 mb-2"
      >
        Paste your source text below
      </label>
      <textarea
        id="source-text"
        value={sourceText}
        onChange={(e) => onSourceTextChange(e.target.value)}
        placeholder="Paste notes, an article, or any text you want to transform..."
        className="w-full h-48 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
      />
      <div className="mt-2 text-right text-sm text-purple-300/70">
        {sourceText.length} characters
      </div>
    </div>
  );
}
