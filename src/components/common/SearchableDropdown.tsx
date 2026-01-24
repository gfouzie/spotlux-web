'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, NavArrowDown } from 'iconoir-react';

interface SearchableDropdownProps {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * A searchable dropdown component that allows filtering options.
 * Used for selecting from a list of values with search functionality.
 */
const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search text
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchText('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchText('');
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-text-col mb-2">
        {label} {required && '*'}
      </label>

      {/* Selected Value Display */}
      <div
        onClick={handleToggle}
        className={`w-full px-4 py-3 rounded-lg bg-bg-col border transition-colors flex items-center justify-between ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-text-col/30'
            : error
            ? 'border-red-500 cursor-pointer hover:bg-bg-col/80'
            : 'border-text-col/30 cursor-pointer hover:bg-bg-col/80'
        }`}
      >
        <span className={value ? 'text-text-col' : 'text-text-col/50'}>
          {isLoading ? 'Loading...' : value || placeholder}
        </span>
        <NavArrowDown
          className={`w-5 h-5 text-text-col/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-40 w-full mt-2 bg-bg-col border border-text-col/30 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-text-col/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-col/60" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-col border border-text-col/30 text-text-col placeholder-text-col/50 focus:outline-none focus:ring-2 focus:ring-accent-col"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-text-col/60 text-sm text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-3 text-text-col transition-colors hover:bg-bg-col/50 border-b border-text-col/10 last:border-b-0 ${
                    value === option ? 'bg-bg-col/30 font-medium' : ''
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
