'use client';

import { useState, useEffect } from 'react';
import { Search, Xmark } from 'iconoir-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  onDebouncedChange,
  placeholder = 'Search by name or username...',
  debounceMs = 300,
}: SearchInputProps) {
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set new timer for debounced callback
    const newTimerId = setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    setTimerId(newTimerId);

    // Cleanup on unmount
    return () => {
      if (newTimerId) {
        clearTimeout(newTimerId);
      }
    };
  }, [value, debounceMs]);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-col/60">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-component-col text-text-col border border-bg-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-text-col/60 hover:text-text-col"
          aria-label="Clear search"
        >
          <Xmark className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
