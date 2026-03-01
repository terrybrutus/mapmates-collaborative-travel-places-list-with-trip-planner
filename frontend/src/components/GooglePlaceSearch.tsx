import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader, X } from 'lucide-react';
import { useGoogleMapsService, parseAddressComponents, type GoogleMapsPlace } from '../services/googleMapsService';

interface GooglePlaceSearchProps {
  onPlaceSelect: (place: {
    country: string;
    stateRegion: string;
    city: string;
    attraction: string;
    coordinates?: { lat: number; lng: number };
    fullAddress: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function GooglePlaceSearch({ 
  onPlaceSelect, 
  placeholder = "Search for places...",
  className = ""
}: GooglePlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { searchPlaces, getPlaceDetails } = useGoogleMapsService();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsLoading(true);
        try {
          const response = await searchPlaces(query);
          if (response.status === 'OK' && response.predictions) {
            setSuggestions(response.predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchPlaces]);

  // Handle place selection
  const handlePlaceSelect = async (placeId: string, description: string) => {
    setIsLoading(true);
    setShowSuggestions(false);
    setQuery(description);

    try {
      const response = await getPlaceDetails(placeId);
      if (response.status === 'OK' && response.result) {
        const place = response.result;
        const components = parseAddressComponents(place.address_components);
        
        onPlaceSelect({
          country: components.country || '',
          stateRegion: components.stateRegion || '',
          city: components.city || '',
          attraction: components.attraction || place.name || '',
          coordinates: place.geometry?.location,
          fullAddress: place.formatted_address || description,
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          handlePlaceSelect(suggestion.place_id, suggestion.description);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          disabled={isLoading}
        />
        
        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {/* Loading spinner or clear button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
          ) : query ? (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handlePlaceSelect(suggestion.place_id, suggestion.description)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start space-x-3 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500">
        Start typing to search for places using Google Maps data
      </div>
    </div>
  );
}
