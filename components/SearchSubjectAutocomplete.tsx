"use client";

import React, { useState, useRef, useEffect } from "react";
import { GOOGLE_MAPS_200_SUBJECTS, SearchSubjectItem } from "@/data/searchSubjects";
import { Search, X, Tag, Sparkles, ChevronDown } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchSubjectAutocomplete({
  value,
  onChange,
  placeholder = "Search business niche or select from 200 subjects...",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(GOOGLE_MAPS_200_SUBJECTS.map((s) => s.category)))];

  // Filter subjects based on typed text and selected category
  const filteredSubjects = GOOGLE_MAPS_200_SUBJECTS.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !value.trim() ||
      item.subject.toLowerCase().includes(value.toLowerCase()) ||
      item.category.toLowerCase().includes(value.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (subject: string) => {
    onChange(subject);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-16 py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold shadow-2xs transition"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-zinc-400 hover:text-red-600 transition"
            title="Browse all subjects"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[380px] flex flex-col">
          {/* Top Category Filter Pills */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200/80 overflow-x-auto flex items-center gap-1.5 text-xs no-scrollbar">
            {categories.slice(0, 7).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${selectedCategory === cat
                  ? "bg-red-600 text-white shadow-2xs"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
                  }`}
              >
                {cat === "All" ? `All` : cat.split(",")[0].split("&")[0].trim()}
              </button>
            ))}
          </div>

          {/* Subjects List */}
          <div className="overflow-y-auto divide-y divide-zinc-100 flex-1">
            {filteredSubjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-600">No predefined subject matches "{value}"</p>
                <p className="text-[11px]">You can still press "Run Scraper" to search with your custom keyword!</p>
              </div>
            ) : (
              filteredSubjects.map((item, index) => {
                const isMatch = value && item.subject.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={`${item.subject}_${index}`}
                    type="button"
                    onClick={() => handleSelect(item.subject)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-red-50/50 flex items-center justify-between gap-3 transition group ${isMatch ? "bg-red-50 text-red-700 font-bold" : "text-zinc-800"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-red-500 shrink-0 transition-colors" />
                      <span className="text-xs font-semibold truncate group-hover:text-red-700 transition-colors">
                        {item.subject}
                      </span>
                    </div>

                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 group-hover:bg-red-100 group-hover:text-red-700 px-2 py-0.5 rounded-md border border-zinc-200/60 shrink-0 transition-colors">
                      {item.category.split("&")[0].trim()}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Bar with Count */}
          <div className="p-2.5 bg-zinc-50 border-t border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span className="font-semibold text-zinc-700">
              Showing {filteredSubjects.length} of {GOOGLE_MAPS_200_SUBJECTS.length} prospecting subjects
            </span>
            <span className="text-zinc-400">Click any subject to select</span>
          </div>
        </div>
      )}
    </div>
  );
}
