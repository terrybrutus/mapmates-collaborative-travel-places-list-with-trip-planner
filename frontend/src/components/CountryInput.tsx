import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { getStandardCountryName, getCountrySuggestions, getAllStandardCountryNames } from '../utils/countryMapping';

interface CountryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function CountryInput({
  value,
  onChange,
  placeholder = "e.g., United States, UK, Japan...",
  required = false,
  className = "",
  disabled = false
}: CountryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAllCountries, setShowAllCountries] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.trim()) {
      const newSuggestions = getCountrySuggestions(inputValue, 10);
      setSuggestions(newSuggestions);
      setShowAllCountries(false);
    } else {
      // Show all countries when input is empty
      const allCountries = getAllStandardCountryNames();
      setSuggestions(allCountries.slice(0, 10));
      setShowAllCountries(true);
    }
    setHighlightedIndex(-1);
  }, [inputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  // Handle input blur with delay to allow for dropdown clicks
  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        // Standardize the country name on blur
        if (inputValue.trim()) {
          const standardized = getStandardCountryName(inputValue);
          setInputValue(standardized);
          onChange(standardized);
        }
      }
    }, 150);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        } else if (inputValue.trim()) {
          const standardized = getStandardCountryName(inputValue);
          setInputValue(standardized);
          onChange(standardized);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        if (inputValue.trim()) {
          const standardized = getStandardCountryName(inputValue);
          setInputValue(standardized);
          onChange(standardized);
        }
        break;
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    if (disabled) return;
    
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  // Show more countries
  const handleShowMore = () => {
    const allCountries = getAllStandardCountryNames();
    setSuggestions(allCountries);
    setShowAllCountries(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (inputValue.trim()) {
          const standardized = getStandardCountryName(inputValue);
          setInputValue(standardized);
          onChange(standardized);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, onChange]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          autoComplete="country"
        />
        
        {/* Globe icon */}
        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={disabled}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          tabIndex={-1}
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No countries found matching "{inputValue}"
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span>{suggestion}</span>
                  {inputValue && getStandardCountryName(inputValue) === suggestion && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
              
              {/* Show more button for initial load */}
              {showAllCountries && suggestions.length === 10 && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="w-full px-3 py-2 text-center text-blue-600 hover:bg-blue-50 transition-colors border-t text-sm font-medium"
                >
                  Show all countries
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500">
        Type to search or use dropdown. Supports abbreviations like "US", "UK", "JAP"
      </div>
    </div>
  );
}
