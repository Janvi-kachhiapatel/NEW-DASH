"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import VoiceSearchButton from "./VoiceSearchButton";

interface SmartSearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SmartSearchBar({
  initialQuery = "",
  onSearch,
  placeholder = "Search for cafés, salons, gaming zones...",
  className = "",
}: SmartSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full flex flex-col gap-2 ${className}`}
    >
      <div className="relative flex items-center rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 backdrop-blur shadow-lg">
        <Search className="absolute left-4 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
        />
        <div className="absolute right-2 flex items-center gap-2">
          <VoiceSearchButton onTranscript={handleVoiceTranscript} />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:from-violet-700 hover:to-indigo-700"
          >
            Go
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <SlidersHorizontal size={14} />
          Smart filters: price, rating, open now
        </span>
      </div>
    </form>
  );
}

