"use client";

interface SourceInputProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  maxChars?: number;
}

export default function SourceInput({
  sourceText,
  onSourceTextChange,
  maxChars = 50000,
}: SourceInputProps) {
  const charCount = sourceText.length;
  const nearLimit = charCount > maxChars * 0.8;
  const overLimit = charCount > maxChars;

  return (
    <div className="mb-6">
      <label
        htmlFor="source-text"
        className="block text-sm font-medium text-purple-200 mb-2"
      >
        Source Text
      </label>
      <textarea
        id="source-text"
        value={sourceText}
        onChange={(e) => onSourceTextChange(e.target.value)}
        placeholder="Paste notes, an article, or any text you want to transform..."
        className="w-full h-40 sm:h-48 p-4 rounded-xl bg-[var(--surface)] backdrop-blur-sm border border-[var(--surface-border)] text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
      />
      <div className="mt-2 flex justify-between items-center text-xs">
        <span className="text-purple-300/50">
          Tip: Longer texts produce richer results
        </span>
        <span
          className={`font-mono transition-colors ${
            overLimit
              ? "text-red-400"
              : nearLimit
                ? "text-amber-400"
                : "text-purple-300/60"
          }`}
        >
          {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </span>
      </div>
      {overLimit && (
        <p className="mt-1.5 text-xs text-red-400">
          Text exceeds the {maxChars.toLocaleString()} character limit.
          Please shorten your input.
        </p>
      )}
    </div>
  );
}
