import React, { useState, useMemo } from 'react';
import { useGetAllPlaces, useSearchPlaces, useFilterPlacesByCountry, useDeletePlace } from '../hooks/useQueries';
import { Place, PlaceStatus } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PlaceCard from './PlaceCard';
import AddPlaceForm from './AddPlaceForm';
import RandomPicker from './RandomPicker';
import { Search, Filter, MapPin, ChevronDown, Plus, Shuffle, List, Globe, ChevronRight } from 'lucide-react';
import { getStandardCountryName, getCountrySuggestions } from '../utils/countryMapping';

interface HierarchicalGroup {
  country: string;
  regions: {
    [region: string]: {
      cities: {
        [city: string]: Place[];
      };
    };
  };
}

export default function PlacesList() {
  const { data: places = [], isLoading } = useGetAllPlaces();
  const { identity } = useInternetIdentity();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'country' | 'timestamp'>('country');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'add' | 'random'>('list');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const isAuthenticated = !!identity;
  const canEdit = isAuthenticated;

  // Get unique countries for filter dropdown with standardized names
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(places.map(p => getStandardCountryName(p.country)))).sort();
    return uniqueCountries;
  }, [places]);

  // Enhanced search function that normalizes text by removing punctuation and converting to lowercase
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove all punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  // Enhanced search function that matches any relevant field with country mapping support
  const searchPlaces = useMemo(() => {
    return (places: Place[], searchTerm: string): Place[] => {
      if (!searchTerm.trim()) return places;

      const normalizedTerm = normalizeText(searchTerm);
      
      // Get country suggestions to check if search term matches any country variants
      const countrySuggestions = getCountrySuggestions(searchTerm, 50);
      const matchingCountries = new Set(countrySuggestions.map(c => normalizeText(c)));
      
      return places.filter(place => {
        // Helper function to check if normalized text contains search term
        const containsTerm = (text: string): boolean => {
          const normalizedText = normalizeText(text);
          return normalizedText.includes(normalizedTerm);
        };

        // Helper function to check country with mapping support
        const matchesCountry = (country: string): boolean => {
          const normalizedCountry = normalizeText(country);
          const standardizedCountry = getStandardCountryName(country);
          const normalizedStandardized = normalizeText(standardizedCountry);
          
          // Direct match with stored country name
          if (normalizedCountry.includes(normalizedTerm)) return true;
          
          // Match with standardized country name
          if (normalizedStandardized.includes(normalizedTerm)) return true;
          
          // Check if the search term maps to this country through our mapping system
          if (matchingCountries.has(normalizedStandardized)) return true;
          
          return false;
        };

        // Search in all relevant fields
        return (
          // Basic location fields with enhanced country matching
          matchesCountry(place.country) ||
          containsTerm(place.stateRegion) ||
          containsTerm(place.city) ||
          
          // Attractions/places/neighborhoods
          place.attractions.some(attraction => containsTerm(attraction)) ||
          
          // Tags
          place.tags.some(tag => containsTerm(tag)) ||
          
          // Quick facts
          containsTerm(place.quickFacts.bestKnownFor) ||
          containsTerm(place.quickFacts.hiddenGem) ||
          containsTerm(place.quickFacts.localTip) ||
          
          // Other fields
          containsTerm(place.bestTimeToVisit) ||
          containsTerm(place.notes) ||
          
          // Status (convert enum to readable text) - now supports multiple statuses
          place.status.some(status => containsTerm(getStatusLabel(status))) ||
          
          // Budget range (convert enum to readable text)
          containsTerm(getBudgetLabel(place.budgetRange))
        );
      });
    };
  }, []);

  // Helper functions for status and budget labels
  const getStatusLabel = (status: PlaceStatus): string => {
    switch (status) {
      case PlaceStatus.toResearch:
        return 'to research';
      case PlaceStatus.researched:
        return 'researched';
      case PlaceStatus.wantToGo:
        return 'want to go';
      case PlaceStatus.planning:
        return 'planning';
      case PlaceStatus.visited:
        return 'visited';
      case PlaceStatus.wouldReturn:
        return 'would return';
      default:
        return '';
    }
  };

  const getBudgetLabel = (budget: string): string => {
    switch (budget) {
      case 'low':
        return 'budget friendly cheap low cost';
      case 'medium':
        return 'moderate medium average';
      case 'high':
        return 'expensive luxury high end premium';
      default:
        return '';
    }
  };

  // Filter and sort places with enhanced search
  const filteredPlaces = useMemo(() => {
    let filtered = places;

    // Apply search filter first
    if (searchTerm.trim()) {
      filtered = searchPlaces(filtered, searchTerm);
    }

    // Status filter - now supports multiple statuses
    if (statusFilter !== 'all') {
      filtered = filtered.filter(place => place.status.includes(statusFilter));
    }

    // Country filter with standardization
    if (countryFilter !== 'all') {
      const standardizedFilter = getStandardCountryName(countryFilter);
      filtered = filtered.filter(place => getStandardCountryName(place.country) === standardizedFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.city.localeCompare(b.city);
        case 'country':
          return getStandardCountryName(a.country).localeCompare(getStandardCountryName(b.country));
        case 'timestamp':
          return Number(b.timestamp - a.timestamp);
        default:
          return 0;
      }
    });

    return filtered;
  }, [places, searchTerm, statusFilter, countryFilter, sortBy, searchPlaces]);

  // Group places hierarchically with improved fallback logic - FIXED
  const hierarchicalPlaces = useMemo(() => {
    const grouped: { [country: string]: HierarchicalGroup } = {};

    filteredPlaces.forEach(place => {
      const country = getStandardCountryName(place.country);
      
      // Improved grouping logic: always require city, handle missing state gracefully
      let regionKey: string;
      let cityKey: string;
      
      // Always use city as the primary grouping (required field)
      cityKey = place.city && place.city.trim() ? place.city.trim() : 'Unknown City';
      
      // Use state/region if available, otherwise use city as region too
      if (place.stateRegion && place.stateRegion.trim()) {
        regionKey = place.stateRegion.trim();
      } else {
        regionKey = cityKey; // Use city as region when state is missing
      }

      if (!grouped[country]) {
        grouped[country] = {
          country,
          regions: {}
        };
      }

      if (!grouped[country].regions[regionKey]) {
        grouped[country].regions[regionKey] = {
          cities: {}
        };
      }

      if (!grouped[country].regions[regionKey].cities[cityKey]) {
        grouped[country].regions[regionKey].cities[cityKey] = [];
      }

      grouped[country].regions[regionKey].cities[cityKey].push(place);
    });

    return grouped;
  }, [filteredPlaces]);

  const handleViewChange = (view: 'list' | 'add' | 'random') => {
    setActiveView(view);
    setShowDropdown(false);
  };

  const toggleCountry = (country: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(country)) {
      newExpanded.delete(country);
      // Also collapse all regions in this country
      Object.keys(hierarchicalPlaces[country]?.regions || {}).forEach(region => {
        const regionKey = `${country}-${region}`;
        const newExpandedRegions = new Set(expandedRegions);
        newExpandedRegions.delete(regionKey);
        setExpandedRegions(newExpandedRegions);
      });
    } else {
      newExpanded.add(country);
    }
    setExpandedCountries(newExpanded);
  };

  const toggleRegion = (country: string, region: string) => {
    const regionKey = `${country}-${region}`;
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionKey)) {
      newExpanded.delete(regionKey);
    } else {
      newExpanded.add(regionKey);
    }
    setExpandedRegions(newExpanded);
  };

  const getCountryFlag = (country: string): string => {
    const flagMap: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Thailand': '🇹🇭',
      'Greece': '🇬🇷',
      'Netherlands': '🇳🇱',
      'Switzerland': '🇨🇭',
      'Norway': '🇳🇴',
      'Sweden': '🇸🇪',
      'Denmark': '🇩🇰',
    };
    return flagMap[country] || '🌍';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="main-content-container">
      <div className="space-y-6">
        {/* Header with Dropdown */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {activeView === 'list' && <List className="w-4 h-4" />}
              {activeView === 'add' && <Plus className="w-4 h-4" />}
              {activeView === 'random' && <Shuffle className="w-4 h-4" />}
              <span>
                {activeView === 'list' && 'View Places'}
                {activeView === 'add' && 'Add Place'}
                {activeView === 'random' && 'Random Pick'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-2">
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                      activeView === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <div>
                      <div className="font-medium">View Places</div>
                      <div className="text-xs text-gray-500">Browse all destinations</div>
                    </div>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => handleViewChange('add')}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        activeView === 'add' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Add New Place</div>
                        <div className="text-xs text-gray-500">Create a new destination</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => handleViewChange('random')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                      activeView === 'random' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Random Pick</div>
                      <div className="text-xs text-gray-500">Get inspiration</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeView === 'list' && (
            <div className="text-right">
              <p className="text-gray-600">
                {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''} found
                {searchTerm.trim() && ` for "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>

        {/* Content based on active view */}
        {activeView === 'add' && canEdit && (
          <AddPlaceForm onCancel={() => setActiveView('list')} />
        )}

        {activeView === 'random' && (
          <RandomPicker />
        )}

        {activeView === 'list' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Enhanced Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search places, attractions, countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear search"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PlaceStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value={PlaceStatus.toResearch}>To Research</option>
                  <option value={PlaceStatus.researched}>Researched</option>
                  <option value={PlaceStatus.wantToGo}>Want to Go</option>
                  <option value={PlaceStatus.planning}>Planning</option>
                  <option value={PlaceStatus.visited}>Visited</option>
                  <option value={PlaceStatus.wouldReturn}>Would Return</option>
                </select>

                {/* Country Filter with standardized names */}
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'country' | 'timestamp')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="country">By Country</option>
                  <option value="name">By Name</option>
                  <option value="timestamp">Newest First</option>
                </select>
              </div>

              {/* Search Help Text */}
              {searchTerm.trim() && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <strong>Enhanced Search:</strong> Search ignores punctuation and is case-insensitive. 
                    You can search by attractions, places, neighborhoods, countries (including abbreviations like "USA", "UK", "JAP"), 
                    cities, regions, tags, activities, notes, or any other place details. 
                    Multi-status places are included if any status matches.
                  </p>
                </div>
              )}
            </div>

            {/* Hierarchical Places List */}
            {Object.keys(hierarchicalPlaces).length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm.trim() ? 'No places found' : 'No places yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm.trim() 
                    ? `No places match "${searchTerm}". Try different keywords - search supports country abbreviations and various spellings.`
                    : 'Add some places to get started!'
                  }
                </p>
                {searchTerm.trim() && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search and show all places
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(hierarchicalPlaces)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([country, countryData]) => (
                    <div key={country} className="hierarchical-country-group">
                      {/* Country Header */}
                      <div 
                        className="hierarchical-country-header"
                        onClick={() => toggleCountry(country)}
                      >
                        <div className="flex items-center space-x-3">
                          <ChevronRight 
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedCountries.has(country) ? 'rotate-90' : ''
                            }`} 
                          />
                          <span className="text-2xl">{getCountryFlag(country)}</span>
                          <h2 className="text-xl font-bold text-gray-900">{country}</h2>
                          <div className="text-sm text-gray-500">
                            ({Object.values(countryData.regions).reduce((total, region) => 
                              total + Object.values(region.cities).reduce((cityTotal, cityPlaces) => 
                                cityTotal + cityPlaces.length, 0), 0)} places)
                          </div>
                        </div>
                      </div>

                      {/* Country Content */}
                      {expandedCountries.has(country) && (
                        <div className="hierarchical-country-content">
                          {Object.entries(countryData.regions)
                            .sort(([a], [b]) => {
                              // Sort regions alphabetically
                              return a.localeCompare(b);
                            })
                            .map(([region, regionData]) => {
                              const regionKey = `${country}-${region}`;
                              const regionPlaceCount = Object.values(regionData.cities).reduce(
                                (total, cityPlaces) => total + cityPlaces.length, 0
                              );

                              return (
                                <div key={regionKey} className="hierarchical-region-group">
                                  {/* Region Header */}
                                  <div 
                                    className="hierarchical-region-header"
                                    onClick={() => toggleRegion(country, region)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <ChevronRight 
                                        className={`w-4 h-4 text-gray-400 transition-transform ${
                                          expandedRegions.has(regionKey) ? 'rotate-90' : ''
                                        }`} 
                                      />
                                      <MapPin className="w-4 h-4 text-gray-600" />
                                      <h3 className="text-lg font-semibold text-gray-800">
                                        {region}
                                      </h3>
                                      <div className="text-sm text-gray-500">
                                        ({regionPlaceCount} places)
                                      </div>
                                    </div>
                                  </div>

                                  {/* Region Content */}
                                  {expandedRegions.has(regionKey) && (
                                    <div className="hierarchical-region-content">
                                      {Object.entries(regionData.cities)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([city, cityPlaces]) => (
                                          <div key={`${regionKey}-${city}`} className="hierarchical-city-group">
                                            {/* City Header - Only show if different from region */}
                                            {city !== region && (
                                              <div className="hierarchical-city-header">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                  <h4 className="text-base font-medium text-gray-700">{city}</h4>
                                                  <div className="text-sm text-gray-500">
                                                    ({cityPlaces.length} place{cityPlaces.length !== 1 ? 's' : ''})
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* City Places */}
                                            <div className="hierarchical-city-content">
                                              <div className="space-y-4">
                                                {cityPlaces
                                                  .sort((a, b) => {
                                                    if (sortBy === 'timestamp') {
                                                      return Number(b.timestamp - a.timestamp);
                                                    }
                                                    return a.city.localeCompare(b.city);
                                                  })
                                                  .map((place) => (
                                                    <PlaceCard 
                                                      key={place.id} 
                                                      place={place} 
                                                      canEdit={canEdit}
                                                      compact={false}
                                                    />
                                                  ))}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    </div>
  );
}
