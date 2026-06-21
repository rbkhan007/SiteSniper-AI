"use client";

interface SearchInputProps { onSearch: (query: string) => void; placeholder?: string; }

export default function SearchInput({ onSearch, placeholder = "Search..." }: SearchInputProps) {
  return (
    <input type="text" onChange={(e) => onSearch(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm transition-all bg-input-bg border border-input-border" />
  );
}
